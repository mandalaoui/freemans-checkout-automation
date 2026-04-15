export interface FormField {
  fieldName: string;
  selector: string;
  action: "type" | "click" | "select";
  value?: string;
}