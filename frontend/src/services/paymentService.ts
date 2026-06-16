import api from './api';

/**
 * Initiates a JazzCash Mobile Wallet payment
 * @param orderId The ID of the order to pay for
 * @param mobileNumber The customer's JazzCash mobile number
 * @param cnic The customer's last 6 digits of CNIC
 */
export const initiateJazzCashPayment = async (orderId: string, mobileNumber: string, cnic: string) => {
    try {
        const response = await api.post('/payments/jazzcash/initiate', {
            orderId,
            mobileNumber,
            cnic,
        });
        
        return response.data;
    } catch (error: any) {
        // Return standard error object for frontend consumption
        const errorData = error.response?.data;
        throw {
            success: false,
            message: errorData?.message || 'Payment initiation failed',
            userMessage: errorData?.userMessage || 'Something went wrong. Please try again.',
            responseCode: errorData?.responseCode
        };
    }
};

const paymentService = {
    initiateJazzCashPayment,
};

export default paymentService;
