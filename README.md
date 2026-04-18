# Freemans Checkout Automation

End-to-end checkout automation project for the Freemans website, built with **Puppeteer**, **TypeScript**, and **SQLite**.

---

## 📌 Overview

This project automates a complete purchase flow on the Freemans website — from product selection to the final payment step (without executing an actual purchase).

The automation includes:

- Full **multi-step checkout flow**
- **Database-driven form filling**
- **Error handling and retry mechanisms**
- **Positive and negative test scenarios**

The implementation follows a **clean, modular architecture** inspired by Page Object Model (POM), ensuring scalability, maintainability, and readability.

---

## ⚠️ Product Assumptions

The automation assumes a product structure that includes selectable options (such as size and/or color).

Different products on the website may have different structures, which can affect the flow.  
To ensure stability and consistency, a compatible product URL is used for the automation.

---

## 🎯 Assignment Goals

This project fulfills all requirements defined in the task:

- Automate a real checkout flow using **Puppeteer + TypeScript**  
- Store selectors, properties, and values in a **SQLite database**  
- Implement SQL queries for:
  - Retrieve all records
  - Search by field
  - Update record
  - Delete record  
- Provide a complete GitHub project with:
  - Source code
  - Database file
  - SQL queries
  - Documentation  

---

## 🧱 Tech Stack

- **TypeScript**
- **Puppeteer**
- **SQLite**
- **Node.js**

---

## ▶️ How to Run

1. Install dependencies:

```bash
npm install
```

2. Run the automation script:

```bash
npm start
```

> **Note:**  
> The database is automatically seeded at runtime if it is empty — no manual setup or seeding is required.

### 🔄 Execution Flow

Running the script will execute:

- ✅ Happy Flow (full checkout simulation)
- ❌ Negative Flows:
  - Missing size selection
  - Invalid postcode
  - Email mismatch
  - Invalid payment details

---

## 📁 Project Structure

```text
src/
  browser/          → Browser setup
  pages/            → Page Object Model classes
  flows/            → Business flows (happy + negative)
  db/               → SQLite database layer
  data/             → Mock data for seeding
  selectors/        → Centralized selectors
  validation/       → Validation logic
  utils/            → Helpers (retry, logger, actions)
  forms/            → Form filling logic
  types/            → Type definitions

database/
  automation.sqlite

queries.sql
README.md
```

---

## 🗄️ Database Design

**Table: form_fields**

Each record represents a form field:

| Field        | Description                |
|--------------|---------------------------|
| field_name   | Logical field identifier   |
| selector     | CSS selector              |
| action       | type / select / click     |
| value        | Input value               |

📋 **Form Selectors Table**

### 🧾 Input Fields

| Selector                | Property | Example Value       |
|-------------------------|----------|--------------------|
| #Title                  | select   | Mr                 |
| #FirstName              | value    | Steve              |
| #LastName               | value    | Rosenblum          |
| #dob_day                | select   | 10                 |
| #dob_month              | select   | 05                 |
| #dob_year               | select   | 1995               |
| #DayTimeTelephone       | value    | 07123456789        |
| #houseId                | value    | 12                 |
| #postCode               | value    | SW1A 1AA           |
| #Email                  | value    | test@example.com   |
| #ConfirmEmail           | value    | test@example.com   |
| #Password               | value    | Test1234!          |
| #confirmPassword        | value    | Test1234!          |
| #CardHolderName         | value    | Steve Rosenblum    |
| #CardNumber             | value    | 4111111111111111   |
| #ExpiryDateMonthYear    | value    | 12/30              |
| #CardSecurityCode       | value    | 123                |

### 🔘 Action Elements (Clicks / Interactions)

| Selector                       | Property | Example Value |
|---------------------------------|----------|--------------|
| button.primary.bagButton        | click    | -            |
| .xfoBagContainer                | click    | -            |
| #proceedbutton2                | click    | -            |
| #registerLink                  | click    | -            |
| #searchAddressImageButton      | click    | -            |
| #applybutton                   | click    | -            |

### 🎯 Product Selection

| Selector                               | Property | Example Value    |
|-----------------------------------------|----------|-----------------|
| span.productOptionItem                 | click    | Size: 12        |
| span.productOptionItem.productSwatchItem| click    | Color: Green Stripe |

### 📍 Address Selection

| Selector         | Property      | Example Value    |
|------------------|--------------|-----------------|
| #addressSelect   | select       | First available |
| .adr             | read/validate| Address summary |

---

## 🧠 How It Works

### 1. Database-Driven Forms

All form fields are loaded from SQLite (`getFormFields()`), allowing:

- easy updates
- flexibility
- clean separation of data and logic

### 2. Page Object Model (POM)

Each logical page is encapsulated as a class (e.g., `HomePage`, `ProductPage`, `CheckoutPage`, `PaymentPage`), supporting:

- reusable actions
- clear responsibilities
- maintainable structure

### 3. Retry Mechanism

Critical UI actions are wrapped with retry logic to handle:

- dynamic loading
- UI delays
- flaky interactions

### 4. Validation Strategy

Two levels of validation are implemented:

- **Action-level**: Ensures each interaction succeeded (click, type, select)
- **Flow-level**: Ensures correct navigation between steps

### 5. Error Handling

The system includes:

- try/catch blocks
- retry logic
- explicit failure conditions

---

## ❌ Negative Test Scenarios

Additional test cases include:

| Scenario             | Expected Behavior         |
|----------------------|--------------------------|
| No size selected     | Error message shown       |
| Invalid postcode     | Validation error         |
| Email mismatch       | Validation error         |
| Invalid card         | Payment blocked          |

---

## 📊 SQL Queries

**File:** `queries.sql`

Contains SQL for:

- Retrieve all records
- Search by field
- Update a record
- Delete a record

---

## ⚙️ Environment Configuration

To set up environment variables, create a `.env` file in the project root:

```
DEBUG=true
```

**DEBUG**  
Set `DEBUG=true` to enable verbose logging for debugging and development.  
Set `DEBUG=false` (or omit) for minimal logs and clean output during normal runs.
---

## 🛡️ Stability Features

- Explicit waits for UI elements
- Retry mechanism for critical actions
- DOM validation after interactions
- Isolated browser contexts
- Modular architecture

---

## ⚠️ Notes

- _No real purchase is executed_
- _Fake card details are used_
- _reCAPTCHA handling is intentionally skipped (per instructions)_

---

## 💡 Summary

The automation focuses on stability, modular design, and realistic user interaction across a multi-step checkout process.