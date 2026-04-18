import { FormField } from "../types/form.types";

// Mock data to ensure tests and database seeding use consistent input values
export const formFields: FormField[] = [
  {
    fieldName: "title",
    selector: "#Title",
    action: "select",
    value: "Mr",
  },
  {
    fieldName: "firstName",
    selector: "#FirstName",
    action: "type",
    value: "Steve",
  },
  {
    fieldName: "lastName",
    selector: "#LastName",
    action: "type",
    value: "Rosenblum",
  },
  {
    fieldName: "day",
    selector: "#dob_day",
    action: "select",
    value: "10",
  },
  {
    fieldName: "month",
    selector: "#dob_month",
    action: "select",
    value: "05",
  },
  {
    fieldName: "year",
    selector: "#dob_year",
    action: "select",
    value: "1995",
  },
  {
    fieldName: "phone",
    selector: "#DayTimeTelephone",
    action: "type",
    value: "07123456789",
  },
  {
    fieldName: "house",
    selector: "#houseId",
    action: "type",
    value: "12",
  },
  {
    fieldName: "postcode",
    selector: "#postCode",
    action: "type",
    value: "SW1A 1AA",
  },
  {
    fieldName: "email",
    selector: "#Email",
    action: "type",
    value: "test@example.com",
  },
  {
    fieldName: "confirmEmail",
    selector: "#ConfirmEmail",
    action: "type",
    value: "test@example.com",
  },
  // Ensures password and confirmPassword match for form validation
  {
    fieldName: "password",
    selector: "#Password",
    action: "type",
    value: "Test1234!",
  },
  {
    fieldName: "confirmPassword",
    selector: "#confirmPassword",
    action: "type",
    value: "Test1234!",
  },
  {
    fieldName: "cardName",
    selector: "#CardHolderName",
    action: "type",
    value: "Steve Rosenblum",
  },
  // Uses a common test card number to avoid real card details
  {
    fieldName: "cardNumber",
    selector: "#CardNumber",
    action: "type",
    value: "4111111111111111",
  },
  {
    fieldName: "expiry",
    selector: "#ExpiryDateMonthYear",
    action: "type",
    value: "12/30",
  },
  {
    fieldName: "cvv",
    selector: "#CardSecurityCode",
    action: "type",
    value: "123",
  }
];
