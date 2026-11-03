# Keep this tag in sync with the @playwright/test version in package.json
ARG PLAYWRIGHT_VERSION=v1.63.0
FROM mcr.microsoft.com/playwright:${PLAYWRIGHT_VERSION}-noble

# Allure 2 (allure-commandline) needs Java to generate reports
RUN apt-get update \
    && apt-get install -y --no-install-recommends default-jre-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV CI=true
CMD ["npx", "playwright", "test"]
