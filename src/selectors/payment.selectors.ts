export const selectors = {
    // Required to trigger the "Pay Now" flow using cash payment
    paymentPayNowInput: "#cashPaymentChoice",
    paymentPayNowWrapper: "#cashPaymentChoice",
        // radioWrapper: "span.radio-wrapper",
    // Separate entry for card details allows conditional rendering based on payment type
    cardDetailsContainer: "#enterCardDetails",
    cardHolderName: "#CardHolderName",
    cardNumber: "#CardNumber",
    expiryDate: "#ExpiryDateMonthYear",
    cardSecurityCode: "#CardSecurityCode",
};
