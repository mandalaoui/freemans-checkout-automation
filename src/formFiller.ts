import { Page } from "puppeteer";
import { typeText } from "./actions";
import { formFields } from "./formData";

export async function fillDeliveryForm(page: Page) {
  for (const field of formFields) {
    if (field.property === "value") {
      await typeText(page, field.selector, field.value as string);
    }
  }
}