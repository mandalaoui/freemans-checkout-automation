// FormField describes a single field in a form with its selector, action type, and optional value
export interface FormField {
    fieldName: string; // Logical name of the field 
    selector: string;  // DOM selector for the field
    action: "type" | "click" | "select"; // How to interact with the field
    value?: string;    // Optional value to use for input fields
  }