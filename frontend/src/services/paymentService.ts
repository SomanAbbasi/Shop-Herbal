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
        throw error.response?.data || error;
    }
};

const paymentService = {
    initiateJazzCashPayment,
};

export default paymentService;
