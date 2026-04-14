import { FormField } from "./types";

export const formFields: FormField[] = [
  {
    fieldName: "firstname",
    selector: 'input[name="firstname"]',
    property: "value",
    value: "Steve",
  },
  {
    fieldName: "lastname",
    selector: 'input[name="lastname"]',
    property: "value",
    value: "Rosenblum",
  },
  {
    fieldName: "email",
    selector: 'input[name="email"]',
    property: "value",
    value: "steve@example.com",
  },
  {
    fieldName: "phone",
    selector: 'input[name="phone"]',
    property: "value",
    value: "07123456789",
  },
];