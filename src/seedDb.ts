import { insertFormFields, clearFormFields } from "./db";
import { formFields } from "./formData";

async function seed() {
  await clearFormFields();

  await insertFormFields(formFields);

  console.log("DB seeded");
}

seed();
