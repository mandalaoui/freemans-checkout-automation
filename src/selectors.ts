export const selectors = {
  // Main hero/banner container
  heroContainer: "#hero",

  // Cookie accept button - will match any button, needs filtering by visible text "Accept"
  cookieAcceptButton: "button",

  // Bag/cart-related selectors
  bagButton: ".xfoBagContainer", // Opens the shopping bag/cart
  addToBagButton: "button.primary.bagButton", // Adds product to the bag
  xfoBagCount: "#xfoBagCount", // Displays the current bag count

  // Product selection on PDP
  sizeButton: "span.productOptionItem", // Select size option
  colorButton: "span.productOptionItem.productSwatchItem", // Select color option
  productTitle: ".productNameContainer", // Product title on PDP

  // Checkout and user input forms
  accountNumberInput: "#nonCookieLoginAccountNo", // Account number input (login/checkout)
  checkoutButton: "#proceedbutton2", // Proceed to checkout button
  guestCheckoutButton: "#registerLink", // Guest checkout option
  firstNameInput: "#FirstName", // Guest checkout: first name input

  // Address, delivery, and form details
  findAddressButton: "#searchAddressImageButton", // Find/search address by postcode
  email: "#Email", // Email input field
  addressSelect: "#addressSelect", // Dropdown for found addresses
  deliveryContainerWrapper: ".deliveryContainerWrapper", // Wrapper for delivery address section

  // Payment containers and choices
  confirmPayContainer: ".confirmContainerWrapper", // Payment confirmation step container
  paymentPayNowContainer: ".paymentChoiceContainer", // "Pay Now" payment option main container
  paymentPayNowInput: "#cashPaymentChoice", // Actual radio input for "Pay Now" mode
  radioOuterash: ".radio-wrapper.checked input#cashPaymentChoice", // Checked radio for "Pay Now"

  // Credit/debit card details entry
  cardDetailsContainer: "#enterCardDetails", // Section for entering card details
  cardHolderName: "#CardHolderName", // Card holder's name input
  cardNumber: "#CardNumber", // Card number input
  expiryDate: "#ExpiryDateMonthYear", // Card expiry MM/YY input
  cardSecurityCode: "#CardSecurityCode", // CVV/CSC input

  // Final apply/purchase button
  applyButton: "#applybutton", // Button to confirm payment/purchase
};