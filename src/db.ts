import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { FormField } from "./types";

export async function initDb(): Promise<Database> {
  const db = await open({
    filename: path.join(__dirname, "..", "database", "form_selectors.sqlite"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS form_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_name TEXT NOT NULL,
      selector TEXT NOT NULL,
      property TEXT NOT NULL,
      value TEXT NOT NULL
    );
  `);

  return db;
}

export async function insertFormFields(db: Database, fields: FormField[]) {
  for (const field of fields) {
    await db.run(
      `
      INSERT INTO form_fields (field_name, selector, property, value)
      VALUES (?, ?, ?, ?)
      `,
      field.fieldName,
      field.selector,
      field.property,
      field.value
    );
  }
}