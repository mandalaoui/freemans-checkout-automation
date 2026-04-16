import { FormField } from "./types";

// List of form fields and their configs for autofill and testing purposes
export const formFields: FormField[] = [
  // User's title selection
  {
    fieldName: "title",
    selector: "#Title",
    action: "select",
    value: "Mr",
  },
  // User's first name
  {
    fieldName: "firstName",
    selector: "#FirstName",
    action: "type",
    value: "Steve",
  },
  // User's last name
  {
    fieldName: "lastName",
    selector: "#LastName",
    action: "type",
    value: "Rosenblum",
  },
  // Date of birth: day
  {
    fieldName: "day",
    selector: "#dob_day",
    action: "select",
    value: "10",
  },
  // Date of birth: month
  {
    fieldName: "month",
    selector: "#dob_month",
    action: "select",
    value: "05",
  },
  // Date of birth: year
  {
    fieldName: "year",
    selector: "#dob_year",
    action: "select",
    value: "1995",
  },
  // Contact phone number
  {
    fieldName: "phone",
    selector: "#DayTimeTelephone",
    action: "type",
    value: "07123456789",
  },
  // Home address: house number or name
  {
    fieldName: "house",
    selector: "#houseId",
    action: "type",
    value: "12",
  },
  // Home address: postal code
  {
    fieldName: "postcode",
    selector: "#postCode",
    action: "type",
    value: "SW1A 1AA",
  },
  // Email for registration or contact
  {
    fieldName: "email",
    selector: "#Email",
    action: "type",
    value: "test@example.com",
  },
  // Confirm email (usually must match)
  {
    fieldName: "confirmEmail",
    selector: "#ConfirmEmail",
    action: "type",
    value: "test@example.com",
  },
  // User password
  {
    fieldName: "password",
    selector: "#Password",
    action: "type",
    value: "Test1234!",
  },
  // Confirm password (should match password)
  {
    fieldName: "confirmPassword",
    selector: "#confirmPassword",
    action: "type",
    value: "Test1234!",
  },
  // Name as it appears on payment card
  {
    fieldName: "cardName",
    selector: "#CardHolderName",
    action: "type",
    value: "Steve Rosenblum",
  },
  // Payment card number (mock data)
  {
    fieldName: "cardNumber",
    selector: "#CardNumber",
    action: "type",
    value: "4111111111111111",
  },
  // Card expiry date
  {
    fieldName: "expiry",
    selector: "#ExpiryDateMonthYear",
    action: "type",
    value: "12/30",
  },
  // Card security code (CVV)
  {
    fieldName: "cvv",
    selector: "#CardSecurityCode",
    action: "type",
    value: "123",
  }
];
