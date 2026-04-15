# Freemans Checkout Automation

End-to-end automation project for the Freemans checkout flow, built with Puppeteer and TypeScript.

---

## 🚀 Overview

This project simulates a full user purchase journey on the Freemans website, including both:

- ✅ Happy flow (successful purchase process)
- ❌ Negative scenarios (validation and failure handling)

The goal is to demonstrate robust UI automation with proper validation, stability handling, and clean architecture.

---

## ✨ Key Features

### 🟢 Happy Flow
- Navigate to product page
- Select color and size
- Add item to cart
- Proceed to checkout (guest)
- Fill multi-step form (DB-driven)
- Complete delivery and payment steps

### 🔴 Negative Scenarios
- Missing size selection
- Invalid postcode
- Email mismatch
- Invalid card details (iframe handling)

---

## 🧠 Highlights

- **Retry mechanism** for handling flaky UI interactions
- **Separation of concerns** (flows, actions, navigation, utils)
- **Database-driven inputs** using SQLite (no hardcoded form data)
- **Real DOM validation** (no assumptions about UI behavior)
- **iframe handling** for secure payment fields

---

## 🛠 Tech Stack

- **Puppeteer** (TypeScript)
- **SQLite**
- Node.js

---

## 📁 Project Structure

```text
src/
  flows/
    happyFlow.ts
    negativeFlows.ts
  actions.ts
  navigation.ts
  formFiller.ts
  db.ts
  formData.ts
  selectors.ts
  utils.ts
  index.ts
```

---

## ⚙️ Setup & Run

```bash
npm install
npx ts-node src/seedDb.ts
npx ts-node src/index.ts
```

---



## 🗂️ Selectors Reference

### 📋 Form Field Selectors

| Field Name        | Selector              | Action  | Value               |
|-------------------|-----------------------|---------|---------------------|
| title             | #Title                | select  | Mr                  |
| firstName         | #FirstName            | type    | Steve               |
| lastName          | #LastName             | type    | Rosenblum           |
| day               | #dob_day              | select  | 10                  |
| month             | #dob_month            | select  | 05                  |
| year              | #dob_year             | select  | 1995                |
| phone             | #DayTimeTelephone     | type    | 07123456789         |
| house             | #houseId              | type    | 12                  |
| postcode          | #postCode             | type    | SW1A 1AA            |
| email             | #Email                | type    | test@example.com    |
| confirmEmail      | #ConfirmEmail         | type    | test@example.com    |
| password          | #Password             | type    | Test1234!           |
| confirmPassword   | #confirmPassword      | type    | Test1234!           |
| cardName          | #CardHolderName       | type    | Steve Rosenblum     |
| cardNumber        | #cardNumber           | type    | 4111111111111111    |
| expiry            | #expiryDate           | type    | 12/30               |
| cvv               | #cardSecurityCode     | type    | 123                 |


### 📊 Action Elements Table

| Element            | Selector                      | Action |
|--------------------|-------------------------------|--------|
| Add To Bag         | button.primary.bagButton      | click  |
| Checkout           | #proceedbutton2               | click  |
| Guest Checkout     | #registerLink                 | click  |
| Find Address       | #searchAddressImageButton     | click  |
| Apply              | #applybutton                  | click  |






---

## 🗄 Database

The project uses SQLite to store:

- Form field selectors
- Input values
- Action types (type / click / select)

This enables flexible and reusable test data without hardcoding.

---

## 📌 Notes

- Negative tests validate system behavior, not just UI messages
- Retry is applied only to state-changing actions, not assertions
- Payment inputs are handled via iframe context

---

## ✅ Status

```text
✔ Full happy flow automation
✔ Negative scenario coverage
✔ Stable execution (retry + validation)
✔ Clean, modular structure
✔ Ready for submission
```