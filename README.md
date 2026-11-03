# Unified Playwright Automation Framework (UI & API)

An enterprise-grade test automation framework built using **Playwright**, **TypeScript**, and the **Page Object Model (POM)** pattern. This repository unifies front-end web interaction tests (Amazon Australia) and backend RESTful API validation (Swagger Petstore) into a single CI/CD pipeline, with HTML, Reporting Labs and **Allure** reporting and optional **Docker** runs for dev and QA.

## 🚀 Key Architectural Highlights

- **Page Object Model (POM):** Decouples DOM element locators and user interaction flows from test specifications to guarantee maintenance scalability.
- **Resilient Locators:** Replaced fragile CSS classes and position-based XPaths with semantic HTML identifiers, accessible ARIA roles, and strict regex filter boundaries.
- **Race Condition Prevention:** Implemented concurrent `Promise.all` blocks to cleanly synchronize user action dispatches with network routing redirects.
- **Stateful Thread Isolation:** Enforces strict `serial` execution on stateful API CRUD pipelines while keeping completely stateless UI flows optimized for maximum multi-worker execution parallelism.
- **Multi-Report Output:** Playwright HTML, Reporting Labs and Allure reports from the same run.
- **Containerised Runs:** Dockerfile + docker-compose services for repeatable `dev` and `qa` executions.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- Java 8+ (only to generate/open Allure reports locally; Docker runs include their own Java)
- Docker Desktop (only for the `docker:dev` / `docker:qa` scripts)

### 1. Clone & Install Dependencies

```
npm install
```

Commit the updated `package-lock.json` afterwards. The Dockerfile uses `npm ci`, which fails if the lock file is out of date.

### 2. Enable the Allure Reporter (one-time)

```
node setup.js
```

This adds `['allure-playwright']` to the `reporter` list in `playwright.config.ts` (a `.bak` backup is saved) and adds the Allure folders to `.gitignore`. It is safe to re-run. If it cannot patch your config automatically, add `['allure-playwright']` to the `reporter` array by hand.

### 3. Install Playwright Test Engine Browsers

```
npx playwright install --with-deps
```

---

## 🖥️ Test Execution Engine Commands

| Command | Description |
|---|---|
| `npm run test` | Cleans old results, then runs the full UI + API suite |
| `npm run test:ui` | Amazon Australia UI tests only (`chromium-ui` project); screenshots saved under `verification/` |
| `npm run test:api` | Swagger Petstore API tests only (`api-pipeline` project, serial CRUD flow, no browser UI) |
| `npm run test:headed` | Runs with a visible browser |
| `npm run test:debug` | Opens the Playwright Inspector |
| `npm run report` | Opens the Playwright HTML report |

### Allure Reports

| Command | Description |
|---|---|
| `npm run allure:serve` | Builds a temporary report from `allure-results/` and opens it |
| `npm run allure:generate` | Generates a static report into `allure-report/` |
| `npm run allure:open` | Opens `allure-report/` |

Typical flow: `npm run test:ui` then `npm run allure:serve`.
`npm run test` runs `clean` first (via `pretest`), which also removes `allure-results/` and `allure-report/`, so every run starts fresh.

### Docker Runs (dev / QA)

| Command | Description |
|---|---|
| `npm run docker:dev` | Runs the suite in a container using `.env.dev`, then opens `allure-report-dev/` |
| `npm run docker:qa` | Runs the suite in a container using `.env.qa`, then opens `allure-report-qa/` |

- Docker Desktop must be running; the first build takes a few minutes.
- The Dockerfile pins the Playwright image to `v1.63.0`. Keep it in step with `@playwright/test` in `package.json`.
- `.env.dev` and `.env.qa` set `TEST_ENV` and `BASE_URL` (both currently `https://www.amazon.com.au`, since Amazon has no separate environments). Add `baseURL: process.env.BASE_URL` to `use` in `playwright.config.ts` if you want the URL driven from these files.
- Amazon may show CAPTCHA or bot checks to headless traffic from containers, so UI tests can behave differently in Docker than locally. The API tests are unaffected.

---

## 📂 Framework Directory Structure

```
├── .github/workflows/
│   └── playwright.yml           # Automated CI Pipeline Engine Rules
├── config/
│   └── api.config.ts            # Centralized API Paths, Headers & Fake Builders
├── pages/
│   └── AmazonHome.page.ts       # Part A: UI Page Object Model Class
├── tests/
│   ├── amazonUi.spec.ts         # Part A: UI Web Interaction Suite
│   └── petstoreApi.spec.ts      # Part B: API CRUD Serial Pipeline Suite
├── verification/                # UI Full Page Screenshots
├── reporting-labs/              # Reporting Labs output
├── allure-results/              # Raw Allure data (git-ignored)
├── allure-report/               # Generated Allure report (git-ignored)
├── allure-results-dev|qa/       # Docker run results (git-ignored)
├── allure-report-dev|qa/        # Docker run reports (git-ignored)
├── Dockerfile                   # Playwright image + Java for Allure
├── docker-compose.yml           # tests-dev and tests-qa services
├── .env.dev / .env.qa           # Per-environment variables
├── playwright.config.ts         # Multi-Project Environment Runner Configurations
├── reporting-labs.config.ts     # Reporting Labs configuration
├── setup.js                     # One-time Allure reporter / .gitignore patch
├── tsconfig.json                # TypeScript Standard Core Rules Configuration
└── package.json                 # Project Metadata, Scripts & Core Version Controls
```

---

## ⚙️ CI Note

`playwright.yml` currently sits in the repository root. GitHub Actions only runs workflows from `.github/workflows/`, so move it if you want the pipeline to run:

```
mkdir -p .github/workflows && git mv playwright.yml .github/workflows/playwright.yml
```

## 🧯 Troubleshooting

- **`allure-results/` is empty:** the `allure-playwright` reporter is missing from `playwright.config.ts`. Re-run `node setup.js` or add it by hand.
- **`allure` fails with a Java error:** install Java 8+ (`java -version` to check).
- **`npm ci` fails in Docker:** run `npm install` locally and commit `package-lock.json`.
- **Docker image tag not found:** change `PLAYWRIGHT_VERSION` at the top of the `Dockerfile`.
