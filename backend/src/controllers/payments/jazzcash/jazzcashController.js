import axios from 'axios';
import { prisma } from '../../../config/db.js';
import { env } from '../../../config/env.js';
import { generateSecureHash } from './jazzcashHelper.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';

/**
 * Maps JazzCash system response codes to friendly user messages
 */
const getFriendlyMessage = (code, rawMsg = '') => {
    const msg = rawMsg.toLowerCase();
    if (code === "110") return "System configuration sync issue. Please try refreshing your browser or choose another payment method.";
    if (code === "121" || msg.includes("invalid mpin")) return "Incorrect MPIN. Please try again and enter the correct PIN on your handset.";
    if (code === "112" || msg.includes("rejected")) return "Transaction declined. Please verify your JazzCash wallet balance and try again.";
    if (code === "199") return "The payment session timed out. Please ensure your mobile screen is unlocked to receive the prompt.";
    return "Payment failed. Please check your JazzCash app for prompts or try another method.";
};

/**
 * Initiates a JazzCash Mobile Wallet transaction
 * POST /api/v1/payments/jazzcash/initiate
 */
export const initiateJazzCashPayment = asyncHandler(async (req, res) => {
    const { orderId, mobileNumber, cnic } = req.body;

    if (!orderId || !mobileNumber || !cnic) {
        return res.status(400).json({
            success: false,
            message: 'Order ID, Mobile Number, and Last 6 digits of CNIC are required',
        });
    }

    // 1. Sandbox Settings
    const testMobile = '03123456789';
    const finalMobile = env.nodeEnv === 'production' ? mobileNumber.replace(/\D/g, '') : testMobile;
    const sanitizedCNIC = cnic.replace(/\D/g, '').slice(-6);

    // 2. Database Lookup
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // 3. Timestamps & Reference
    const now = new Date();
    const formatDT = (date) => date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0') +
        date.getHours().toString().padStart(2, '0') +
        date.getMinutes().toString().padStart(2, '0') +
        date.getSeconds().toString().padStart(2, '0');

    const pp_TxnDateTime = formatDT(now);
    const pp_TxnExpiryDateTime = formatDT(new Date(now.getTime() + 60 * 60 * 1000));
    const txnRefNo = `T${Date.now()}`.replace(/[^a-zA-Z0-9]/g, '');

    /**
     * 4. Complete Payload
     * Reverting to pp_Version 1.1 which is most stable for Mobile Wallet REST APIs.
     * All fields here MUST be included in the hash.
     */
    const payload = {
        pp_Version: '1.1',
        pp_TxnType: 'MWALLET',
        pp_Language: 'EN',
        pp_MerchantID: env.jazzcashMerchantId,
        pp_SubMerchantID: '',
        pp_Password: env.jazzcashPassword,
        pp_BankID: 'TBANK',
        pp_ProductID: 'RETL',
        pp_TxnRefNo: txnRefNo,
        pp_Amount: Math.round(order.totalAmount * 100).toString(),
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: pp_TxnDateTime,
        pp_BillReference: order.invoiceNumber,
        // Remove spaces for hash stability
        pp_Description: `Order-${order.invoiceNumber}`,
        pp_TxnExpiryDateTime: pp_TxnExpiryDateTime,
        pp_ReturnURL: env.clientUrl,
        pp_MobileNumber: finalMobile,
        pp_CNIC: sanitizedCNIC,
        ppmpf_1: '1',
        ppmpf_2: '2',
        ppmpf_3: '3',
        ppmpf_4: '4',
        ppmpf_5: '5',
    };

    // 5. Secure Hash Generation (Now includes pp_Password)
    payload.pp_SecureHash = generateSecureHash(payload);

    console.log(`[JazzCash] Initiating Order: ${order.invoiceNumber} | Ref: ${txnRefNo}`);

    try {
        const response = await axios.post(env.jazzcashApiUrl, payload);
        const data = response.data;

        console.log('[JazzCash] Response:', data);

        if (data.pp_ResponseCode === '000') {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    paymentMethod: 'jazz_cash',
                    transactionId: data.pp_RetreivalReferenceNo,
                    notes: `Paid via JazzCash (v1.1). Ref: ${data.pp_RetreivalReferenceNo}`,
                },
            });

            return res.status(200).json({
                success: true,
                message: "Order confirmed! Payment successful.",
                transactionId: data.pp_RetreivalReferenceNo
            });
        } else {
            const friendlyMessage = getFriendlyMessage(data.pp_ResponseCode, data.pp_ResponseMessage);
            
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'payment_failed',
                    notes: `JazzCash Failed: ${data.pp_ResponseMessage} (Code: ${data.pp_ResponseCode})`,
                },
            });

            return res.status(400).json({
                success: false,
                message: friendlyMessage,
                responseCode: data.pp_ResponseCode
            });
        }
    } catch (error) {
        console.error('[JazzCash] System Error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "The payment gateway is temporarily unavailable. Please try again later."
        });
    }
});
