import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { FormField } from "./types";

let dbInstance: Database | null = null;

export async function initDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, "..", "database", "form_selectors.sqlite"),
    driver: sqlite3.Database,
  });

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

export async function clearFormFields() {
  const db = await initDb();

  await db.exec("DELETE FROM form_fields");
}

export async function getFormFields(): Promise<FormField[]> {
  const db = await initDb();

  return db.all(`
    SELECT field_name as fieldName, selector, action, value
    FROM form_fields
    ORDER BY id
  `);
}