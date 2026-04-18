import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { FormField } from "../types/form.types";

let dbInstance: Database | null = null;

/**
 * Initializes the SQLite database (singleton).
 * Ensures that the 'form_fields' table exists.
 */
export async function initDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, "../..", "database", "automation.sqlite"),
    driver: sqlite3.Database,
  });

  // Create the form_fields table if it doesn't exist.
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS form_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_name TEXT NOT NULL UNIQUE,
      selector TEXT NOT NULL,
      action TEXT CHECK(action IN ('type', 'click', 'select')) NOT NULL,
      value TEXT
    );
  `);

  return dbInstance;
}

/**
 * Inserts multiple form field records into the database.
 */
export async function insertFormFields(fields: FormField[]) {
  const db = await initDb();
  for (const field of fields) {
    await db.run(
      `INSERT INTO form_fields (field_name, selector, action, value)
       VALUES (?, ?, ?, ?)`,
      field.fieldName,
      field.selector,
      field.action,
      field.value ?? null
    );
  }
}

/**
 * Removes all records from the form_fields table.
 */
export async function clearFormFields() {
  const db = await initDb();
  await db.exec("DELETE FROM form_fields");
}

/**
 * Retrieves all form fields from the database.
 */
export async function getFormFields(): Promise<FormField[]> {
  const db = await initDb();
  return db.all(`
    SELECT field_name as fieldName, selector, action, value
    FROM form_fields
    ORDER BY id
  `);
}

/**
 * Finds a form field by its fieldName.
 */
export async function findField(fieldName: string) {
  const db = await initDb();
  return db.get(`SELECT * FROM form_fields WHERE field_name = ?`, fieldName);
}

/**
 * Updates the value property of a form field.
 */
export async function updateField(fieldName: string, value: string) {
  const db = await initDb();
  return db.run(
    `UPDATE form_fields SET value = ? WHERE field_name = ?`,
    value,
    fieldName
  );
}

/**
 * Deletes a form field by its fieldName.
 */
export async function deleteField(fieldName: string) {
  const db = await initDb();
  return db.run(
    `DELETE FROM form_fields WHERE field_name = ?`,
    fieldName
  );
}