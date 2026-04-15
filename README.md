# Freemans Checkout Automation

## Overview

This project automates the full product purchase flow on the Freemans website using Puppeteer and TypeScript.

## Features

- Navigate to the product page
- Select product color and size
- Add product to the shopping cart
- Proceed to checkout
- Continue as a guest
- Fill out a multi-page checkout form

## Tech Stack

- Puppeteer (TypeScript)
- SQLite

## Setup

```bash
npm install
npx ts-node src/seedDb.ts
npx ts-node src/index.ts
```

## Database

This project uses a local SQLite database to store:

- selectors
- properties
- values

### SQL Queries

Refer to `queries.sql` for examples on how to:

- Retrieve records
- Search by field
- Update records
- Delete records

---

# 🚀 Project Status Summary

After completing setup and configuration, you'll have:

```text
✔ Puppeteer automation ✔
✔ SQLite integration ✔
✔ Database-driven form filling ✔
✔ Example SQL queries ✔
✔ Documentation ✔
```