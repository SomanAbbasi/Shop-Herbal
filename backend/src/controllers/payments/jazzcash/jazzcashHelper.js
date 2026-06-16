import crypto from 'crypto';
import { env } from '../../../config/env.js';

/**
 * Generates the JazzCash Secure Hash (HMAC-SHA256)
 * 
 * FINAL COMPLIANCE RULE:
 * 1. ONLY exclude 'pp_SecureHash'.
 * 2. Include ALL other fields sent in the request body (including pp_Password).
 * 3. Sort key NAMES alphabetically.
 * 4. Extract VALUES and join with '&'.
 * 5. Prepend "IntegritySalt&" to the final message.
 */
export const generateSecureHash = (payload) => {
    try {
        const integritySalt = env.jazzcashIntegritySalt;
        
        // ONLY the hash itself is excluded. Password MUST be included if sent in body.
        const excludedKeys = ['pp_SecureHash'];

        const keys = Object.keys(payload).filter(key => !excludedKeys.includes(key));
        const sortedKeys = keys.sort();

        const sortedValues = sortedKeys.map(key => {
            const val = payload[key];
            return (val === null || val === undefined) ? '' : val.toString();
        });

        const valuesString = sortedValues.join('&');
        const finalMessage = integritySalt + '&' + valuesString;

        console.log("--- FINAL JAZZCASH HASH LOG ---");
        console.log("Pre-Hashed String:", finalMessage);
        console.log("-------------------------------");

        return crypto
            .createHmac('sha256', integritySalt)
            .update(finalMessage)
            .digest('hex')
            .toUpperCase();
    } catch (error) {
        console.error("[JazzCash Helper] Hash error:", error.message);
        return "";
    }
};
