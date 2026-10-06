# Unified Playwright Automation Framework (UI & API)

An enterprise-grade test automation framework built using **Playwright**, **TypeScript**, and the **Page Object Model (POM)** pattern. This repository unifies both front-end web interaction tests and backend RESTful API validation layers into a single, cohesive CI/CD pipeline.

## 🚀 Key Architectural Highlights
- **Page Object Model (POM):** Decouples DOM element locators and user interaction flows from test specifications to guarantee maintenance scalability.
- **Resilient Locators:** Replaced fragile CSS classes and position-based XPaths with semantic HTML identifiers, accessible ARIA roles, and strict regex filter boundaries.
- **Race Condition Prevention:** Implemented concurrent `Promise.all` blocks to cleanly synchronize user action dispatches with network routing redirects.
- **Stateful Thread Isolation:** Enforces strict `serial` execution on stateful API CRUD pipelines while keeping completely stateless UI flows optimized for maximum multi-worker execution parallelism.

---

## 🛠️ Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org) installed locally (v18 or higher recommended).

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Install Playwright Test Engine Browsers
```bash
npx playwright install --with-deps
```

---

## 🖥️ Test Execution Engine Commands

### Run Full Test Matrix Suite
Executes all UI and API integration blocks sequentially or in parallel depending on configuration conditions.
```bash
npm run test
```

### Run Front-End UI Tests Only (Amazon Australia)
Launches the browser engine to run core UI assertions, automatically generating visual proof captures under the `verification/` folder.
```bash
npm run test:ui
```

### Run Backend API Tests Only (Swagger Petstore REST)
Drops heavy browser layers to execute fast programmatic CRUD schema testing inside a pure headless console worker.
```bash
npm run test:api
```

### Review Interactive HTML Execution Reports
```bash
npm run report
```

---

## 📂 Framework Directory Structure
```text
├── .github/workflows/
│   └── playwright.yml           # Automated CI Pipeline Engine Rules
├── config/
│   └── api.config.ts            # Centralized API Paths, Headers & Fake Builders
├── pages/
│   └── AmazonHome.page.ts       # Part A: UI Page Object Model Class
├── tests/
│   ├── amazonUi.spec.ts         # Part A: UI Web Interaction Suite
│   └── petstoreApi.spec.ts      # Part B: API CRUD Serial Pipeline Suite
├── verification/                # Target repository folder for UI Full Page Screenshots
├── playwright.config.ts         # Multi-Project Environment Runner Configurations
├── tsconfig.json                # TypeScript Standard Core Rules Configuration
└── package.json                 # Project Metadata, Scripts & Core Version Controls
```
