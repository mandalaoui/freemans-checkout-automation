# Freemans Checkout Automation

End-to-end checkout automation project for the Freemans website, built with **Puppeteer**, **TypeScript**, and **SQLite**.

## Overview

This project automates a product purchase journey on the Freemans website:

- navigating to a product page
- selecting product options
- adding the product to the bag
- proceeding through checkout as a guest
- filling the multi-page checkout form up to the point of purchase

The project also includes several negative test scenarios to validate form behavior and error handling.

## Project Goals

The purpose of this project is to demonstrate:
- reliable browser automation with Puppeteer
- structured and reusable test architecture
- database-driven form input handling
- validation of critical checkout steps
- handling of common UI instability using retries and explicit checks

## Tech Stack

- **TypeScript**
- **Puppeteer**
- **SQLite**
- **Node.js**

## Main Flows

### Happy Flow

The happy flow automates the following steps:

1. Open Freemans homepage
2. Accept cookies (if shown)
3. Navigate to a product page
4. Select color and size
5. Add the item to the shopping bag
6. Open the bag
7. Proceed to checkout
8. Continue as guest
9. Fill personal details form
10. Find and select address
11. Fill remaining account details
12. Continue through delivery step
13. Choose payment option
14. Fill payment details
15. Verify readiness for final purchase step

### Negative Flows

The project includes the following negative scenarios:

- adding to bag without selecting a size
- entering an invalid postcode
- entering mismatched email / confirm email values
- entering invalid card details

## Project Structure

```text
src/
  flows/
    happyFlow.ts
    negativeFlows.ts
  actions.ts
  browser.ts
  db.ts
  formData.ts
  formFiller.ts
  navigation.ts
  selectors.ts
  seedDb.ts
  types.ts
  utils.ts
  index.ts

database/
  form_selectors.sqlite

queries.sql
README.md
```

## Database Design

The project uses a local SQLite database file to store reusable form data.

**Table: form_fields**

Each row represents a field used during checkout, including:

- field name
- selector
- action type
- value

Typical stored actions:
- type
- select
- click

This allows the automation to remain flexible and reduces hardcoded input values inside the flow logic.

### SQL Queries

A dedicated `queries.sql` file is included with the required SQL operations:
- Retrieve all records
- Search by field name
- Update a record
- Delete a record

## Setup

Install dependencies:

```bash
npm install
```

Seed the database:

```bash
npx ts-node src/seedDb.ts
```

Run the automation:

```bash
npx ts-node src/index.ts
```

## How It Works

### 1. Browser Isolation

Each main run uses a fresh browser context to avoid stale session state, saved login state, or cookie-related inconsistencies.

### 2. Modular Architecture

The code is split by responsibility:

- `actions.ts` – low-level reusable browser actions
- `navigation.ts` – page-to-page navigation logic
- `formFiller.ts` – DB-driven form filling and validation
- `flows/` – happy and negative business flows
- `db.ts` – SQLite access layer
- `utils.ts` – shared helpers such as retry and step runner

### 3. Validation Strategy

The project validates automation on two levels:

- **action-level validation**  
  verifies that clicks, typing, and selections succeeded
- **flow-level validation**  
  verifies that the automation reached the correct next checkout state

This helps prevent false-positive success in cases where the UI responded unexpectedly.

### 4. Retry Handling

Critical state-changing actions use retry logic to make the automation more stable against transient UI timing issues.

## Example Stored Form Fields

Examples of data stored in SQLite include:

| Field Name    | Selector             | Action | Example Value         |
|---------------|----------------------|--------|----------------------|
| title         | #Title               | select | Mr                   |
| firstName     | #FirstName           | type   | Steve                |
| lastName      | #LastName            | type   | Rosenblum            |
| postcode      | #postCode            | type   | SW1A 1AA             |
| email         | #Email               | type   | test@example.com     |
| confirmEmail  | #ConfirmEmail        | type   | test@example.com     |
| cardName      | #CardHolderName      | type   | Steve Rosenblum      |
| cardNumber    | #CardNumber          | type   | 4111111111111111     |
| expiry        | #ExpiryDateMonthYear | type   | 12/30                |
| cvv           | #CardSecurityCode    | type   | 123                  |

## Key Stability Features

- explicit waits for visible selectors
- DOM-based validation after important actions
- retry wrapper for flaky UI interactions
- isolated browser contexts for predictable runs
- clean separation between page actions and business flow logic

## Notes

- The script fills the checkout flow up to the point of actual purchase.
- No real purchase is made.
- A fake card number is used for testing purposes only.
- reCAPTCHA handling is intentionally not implemented, according to the task instructions.

## Submission Contents

This repository includes:

- TypeScript source code using Puppeteer
- README.md with setup and execution instructions
- SQLite database artifact (form_selectors.sqlite)
- queries.sql containing the required SQL queries

## Status

- Happy flow implemented
- Negative scenarios implemented
- SQLite integration completed
- SQL queries file included
- Error handling and retry logic included
- Ready for submission