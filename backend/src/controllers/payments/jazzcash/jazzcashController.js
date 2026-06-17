import axios from 'axios';
import { prisma } from '../../../config/db.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import { generateSecureHash, mapResponseToUserMessage } from './jazzcashHelper.js';



/**
 * Initiates a JazzCash Mobile Wallet transaction (v1.1 MWALLET)
 * POST /api/v1/payments/jazzcash/initiate
 */
export const initiateJazzCashPayment = asyncHandler(async (req, res) => {
    const { orderId, mobileNumber } = req.body;

    if (!orderId || !mobileNumber) {
        return res.status(400).json({ success: false, message: "Order ID and Mobile Number are required." });
    }

    // 1. Retrieve the unique order from Neon Postgres via Prisma
    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found." });
    }

    // 2. Prepare DateTime strings (YYYYMMDDHHMMSS)
    const now = new Date();
    const formatDate = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return date.getFullYear().toString() +
            pad(date.getMonth() + 1) +
            pad(date.getDate()) +
            pad(date.getHours()) +
            pad(date.getMinutes()) +
            pad(date.getSeconds());
    };

    const pp_TxnDateTime = formatDate(now);
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
    const pp_TxnExpiryDateTime = formatDate(expiryDate);

    // 3. Construct the payload object exactly like v1.1 MWALLET document specification
    const payload = {
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_Language: "EN",
        pp_MerchantID: MERCHANT_ID,
        pp_Password: PASSWORD,
        pp_BankID: "TBANK",
        pp_ProductID: "RETL",
        pp_TxnRefNo: 'T' + Date.now(),
        pp_Amount: Math.round(order.totalAmount * 100).toString(),
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: pp_TxnDateTime,
        pp_BillReference: order.invoiceNumber || `INV-${orderId.slice(0, 8)}`,
        pp_Description: `Checkout for Order ${order.invoiceNumber || orderId}`,
        pp_TxnExpiryDateTime: pp_TxnExpiryDateTime,
        pp_ReturnURL: "https://shop-herbal.vercel.app/api/payment-callback",
        pp_MobileNumber: mobileNumber.replace(/\D/g, ''),
        pp_CNIC: "000000", // Standard 6-digit dummy for sandbox
        ppmpf_1: "1",
        ppmpf_2: "2",
        ppmpf_3: "3",
        ppmpf_4: "4",
        ppmpf_5: "5"
    };

    // 4. Generate and assign the Secure Hash
    payload.pp_SecureHash = generateSecureHash(payload, INTEGRITY_SALT);

    try {
        // 5. Fire the network handshake via axios.post
        console.log("[JazzCash] Initiating transaction for order:", orderId);
        const response = await axios.post(JAZZCASH_SANDBOX_URL, payload);
        const data = response.data;

        console.log("[JazzCash] Response Data:", data);

        // 6. Handle Response
        if (data.pp_ResponseCode === "000") {
            // Update order status to PAID
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    transactionId: data.pp_RetreivalReferenceNo || payload.pp_TxnRefNo,
                    notes: `JazzCash Payment Successful. Ref: ${data.pp_RetreivalReferenceNo}`
                }
            });

            return res.status(200).json({
                success: true,
                message: "Payment processed successfully.",
                data: data
            });
        } else {
            // Update order status to PAYMENT_FAILED
            const userFriendlyMessage = mapResponseToUserMessage(data.pp_ResponseCode, data.pp_ResponseMessage);
            
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'payment_failed',
                    notes: `JazzCash Payment Failed: ${data.pp_ResponseMessage} (Code: ${data.pp_ResponseCode})`
                }
            });

            return res.status(400).json({
                success: false,
                message: userFriendlyMessage,
                responseCode: data.pp_ResponseCode,
                backendMessage: data.pp_ResponseMessage
            });
        }
    } catch (error) {
        console.error("[JazzCash] Handshake Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Payment gateway connection error. Please try again later."
        });
    }
});

/**
 * Optional: Callback handler if needed for async updates
 */
export const handleJazzCashCallback = asyncHandler(async (req, res) => {
    const data = req.body;
    console.log("[JazzCash Callback] Payload received:", data);

    // Verification would happen here if needed for server-to-server
    res.status(200).send("Callback received");
});
