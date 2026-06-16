import crypto from 'crypto';

/**
 * Generates the precise v1.1 cryptographic signature for JazzCash MWALLET.
 * 
 * @param {Object} payload - The transaction data object.
 * @param {string} integritySalt - The merchant's integrity salt.
 * @returns {string} - The generated HMAC-SHA256 signature in UPPERCASE.
 */
export const generateSecureHash = (payload, integritySalt) => {
    // Step A: Filter out 'pp_SecureHash', 'pp_Password' and any fields that are null, undefined, or empty strings.
    const filteredKeys = Object.keys(payload).filter(key => {
        const val = payload[key];
        return key !== 'pp_SecureHash' && key !== 'pp_Password' && val !== null && val !== undefined && val !== '';
    });

    // Step B: Sort all remaining keys alphabetically by their ASCII parameter names.
    const sortedKeys = filteredKeys.sort();

    // Step C & D: Map to "key=value" and join with ampersand.
    const compiledString = sortedKeys
        .map(key => `${key}=${payload[key]}`)
        .join('&');

    // Step E: Prepend Integrity Salt followed by an ampersand to the beginning.
    const finalString = `${integritySalt}&${compiledString}`;

    // Audit Logging as requested
    console.log("NATIVE PRE-HASH STRING AUDIT:", finalString);

    // Step F: Generate HMAC-SHA256 signature using the Integrity Salt, convert to UPPERCASE.
    return crypto
        .createHmac('sha256', integritySalt)
        .update(finalString)
        .digest('hex')
        .toUpperCase();
};

/**
 * Maps JazzCash response codes to user-friendly messages.
 * 
 * @param {string} responseCode - The pp_ResponseCode from JazzCash.
 * @param {string} backendMessage - The fallback message from the backend.
 * @returns {string} - A clean, user-friendly message.
 */
export const mapResponseToUserMessage = (responseCode, backendMessage) => {
    const code = String(responseCode).toLowerCase();

    if (code === '110' || code.includes('securehash')) {
        return "System configuration sync issue. Please try refreshing your browser or choose another payment method.";
    }
    if (code === '121' || code.includes('mpin')) {
        return "Incorrect MPIN entered. Please try placing your order again and enter the correct PIN on your mobile screen.";
    }
    if (code === '112' || code.includes('reject')) {
        return "Transaction declined. Please verify your JazzCash wallet balance has enough funds and try again.";
    }
    if (code === '199' || code.includes('timeout')) {
        return "The payment session timed out. Please ensure your mobile screen is unlocked to receive the payment prompt.";
    }

    return backendMessage || "Payment processing failed. Please try again later.";
};
