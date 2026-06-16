import crypto from 'crypto';

// These values are taken from your latest log to see why it's failing
const payload = {
    pp_Version: '1.1', // Reverting to 1.1 as per docs
    pp_TxnType: 'MWALLET',
    pp_Language: 'EN',
    pp_MerchantID: 'MC802531',
    pp_SubMerchantID: '',
    pp_Password: 'password', // Placeholder
    pp_BankID: 'TBANK',
    pp_ProductID: 'RETL',
    pp_TxnRefNo: 'T1781596817176',
    pp_Amount: '1050',
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: '20260616130017',
    pp_BillReference: 'INV-00006',
    pp_Description: 'Order INV-00006',
    pp_TxnExpiryDateTime: '20260616140017',
    pp_ReturnURL: 'http://localhost:3000',
    pp_MobileNumber: '03123456789',
    pp_CNIC: '003699',
    ppmpf_1: '1',
    ppmpf_2: '2',
    ppmpf_3: '3',
    ppmpf_4: '4',
    ppmpf_5: '5',
};

const integritySalt = '79064xg37u';

function generateHash(data, salt) {
    // JazzCash v1.1/v2.0 (Standard)
    // 1. Sort all keys alphabetically
    const keys = Object.keys(data).sort();
    
    // 2. Concatenate VALUES with & (including empty values)
    const values = keys.map(k => data[k] === null || data[k] === undefined ? '' : data[k]);
    const valuesString = values.join('&');
    
    // 3. Prepend Salt and &
    const finalString = salt + '&' + valuesString;
    
    console.log("Test Pre-Hashed String:", finalString);
    
    return crypto
        .createHmac('sha256', salt)
        .update(finalString)
        .digest('hex')
        .toUpperCase();
}

console.log("Generated Hash:", generateHash(payload, integritySalt));
