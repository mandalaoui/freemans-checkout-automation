import { insertFormFields, clearFormFields } from "./db";
import { formFields } from "../data/mockData";

// Seeds the database with initial form fields for test/dev
export async function seed() {
  // Remove any existing form fields to start fresh
  await clearFormFields();

  // Insert our set of form fields into the database
  await insertFormFields(formFields);
}
