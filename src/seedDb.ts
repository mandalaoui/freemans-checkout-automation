import { insertFormFields, clearFormFields } from "./db";
import { formFields } from "./formData";

// Seeds the database with initial form fields for test/dev
async function seed() {
  // Remove any existing form fields to start fresh
  await clearFormFields();

  // Insert our set of form fields into the database
  await insertFormFields(formFields);
}

seed();
