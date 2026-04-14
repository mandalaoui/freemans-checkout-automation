export interface FormField {
    fieldName: string;
    selector: string;
    property: "value" | "click" | "select";
    value: string;
  }