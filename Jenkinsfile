// Jenkinsfile — CI/CD Pipeline (Docker)
// Playwright TypeScript Framework — Amazon AU UI + Petstore API
// Author: Ragul Kulandaivelu
// Branch:  ci/allure-docker-setup

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'qa', 'stage', 'prod'],
            description: 'Run up to this environment'
        )
        choice(
            name: 'SUITE',
            choices: ['all', 'ui', 'api'],
            description: 'Which test suite to run (all = UI + API)'
        )
    }

    environment {
        DOCKER_IMAGE = 'amazon-au-playwright'
        BASE_URL     = 'https://www.amazon.com.au'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    stages {

        // ── Lint & type-check ──────────────────────────────────────────────
        stage('Lint & Typecheck') {
            steps {
                sh 'npm ci'
                sh 'npx tsc --noEmit'
            }
        }

        // ── Build Docker image ─────────────────────────────────────────────
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
                sh "docker images | grep ${DOCKER_IMAGE}"
            }
        }

        // ══════════════════════════════════════════════════════════════════
        //  DEV — always runs
        // ══════════════════════════════════════════════════════════════════
        stage('Deploy to Dev') {
            steps { echo 'Deployed to Dev' }
        }

        stage('Dev — UI Tests') {
            when { expression { params.SUITE in ['all', 'ui'] } }
            steps {
                sh 'rm -rf allure-results-dev-ui && mkdir -p reports-dev/ui/html allure-results-dev-ui'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=dev \\
                        -e BASE_URL=${BASE_URL} \\
                        -v \${WORKSPACE}/reports-dev/ui/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-dev-ui:/app/allure-results \\
                        -v \${WORKSPACE}/verification:/app/verification \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=chromium-ui
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-dev/ui/allure'
                    sh 'npx allure generate allure-results-dev-ui --clean -o reports-dev/ui/allure || true'
                    publishHTML(target: [
                        reportName: 'Dev UI — Playwright Report',
                        reportDir:  'reports-dev/ui/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Dev UI — Allure Report',
                        reportDir:  'reports-dev/ui/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    archiveArtifacts artifacts: 'verification/**/*.png', allowEmptyArchive: true
                }
            }
        }

        stage('Dev — API Tests') {
            when { expression { params.SUITE in ['all', 'api'] } }
            steps {
                sh 'rm -rf allure-results-dev-api && mkdir -p reports-dev/api/html allure-results-dev-api'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=dev \\
                        -v \${WORKSPACE}/reports-dev/api/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-dev-api:/app/allure-results \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=api-pipeline
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-dev/api/allure'
                    sh 'npx allure generate allure-results-dev-api --clean -o reports-dev/api/allure || true'
                    publishHTML(target: [
                        reportName: 'Dev API — Playwright Report',
                        reportDir:  'reports-dev/api/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Dev API — Allure Report',
                        reportDir:  'reports-dev/api/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════
        //  QA — runs when env is qa / stage / prod
        // ══════════════════════════════════════════════════════════════════
        stage('Deploy to QA') {
            when { expression { params.ENVIRONMENT in ['qa', 'stage', 'prod'] } }
            steps { echo 'Deployed to QA' }
        }

        stage('QA — UI Tests') {
            when { expression { params.ENVIRONMENT in ['qa', 'stage', 'prod'] && params.SUITE in ['all', 'ui'] } }
            steps {
                sh 'rm -rf allure-results-qa-ui && mkdir -p reports-qa/ui/html allure-results-qa-ui'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=qa \\
                        -e BASE_URL=${BASE_URL} \\
                        -v \${WORKSPACE}/reports-qa/ui/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-qa-ui:/app/allure-results \\
                        -v \${WORKSPACE}/verification:/app/verification \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=chromium-ui
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-qa/ui/allure'
                    sh 'npx allure generate allure-results-qa-ui --clean -o reports-qa/ui/allure || true'
                    publishHTML(target: [
                        reportName: 'QA UI — Playwright Report',
                        reportDir:  'reports-qa/ui/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'QA UI — Allure Report',
                        reportDir:  'reports-qa/ui/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    archiveArtifacts artifacts: 'verification/**/*.png', allowEmptyArchive: true
                }
            }
        }

        stage('QA — API Tests') {
            when { expression { params.ENVIRONMENT in ['qa', 'stage', 'prod'] && params.SUITE in ['all', 'api'] } }
            steps {
                sh 'rm -rf allure-results-qa-api && mkdir -p reports-qa/api/html allure-results-qa-api'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=qa \\
                        -v \${WORKSPACE}/reports-qa/api/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-qa-api:/app/allure-results \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=api-pipeline
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-qa/api/allure'
                    sh 'npx allure generate allure-results-qa-api --clean -o reports-qa/api/allure || true'
                    publishHTML(target: [
                        reportName: 'QA API — Playwright Report',
                        reportDir:  'reports-qa/api/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'QA API — Allure Report',
                        reportDir:  'reports-qa/api/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════
        //  STAGE — runs when env is stage / prod
        // ══════════════════════════════════════════════════════════════════
        stage('Deploy to Stage') {
            when { expression { params.ENVIRONMENT in ['stage', 'prod'] } }
            steps { echo 'Deployed to Stage' }
        }

        stage('Stage — UI Tests') {
            when { expression { params.ENVIRONMENT in ['stage', 'prod'] && params.SUITE in ['all', 'ui'] } }
            steps {
                sh 'rm -rf allure-results-stage-ui && mkdir -p reports-stage/ui/html allure-results-stage-ui'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=stage \\
                        -e BASE_URL=${BASE_URL} \\
                        -v \${WORKSPACE}/reports-stage/ui/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-stage-ui:/app/allure-results \\
                        -v \${WORKSPACE}/verification:/app/verification \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=chromium-ui
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-stage/ui/allure'
                    sh 'npx allure generate allure-results-stage-ui --clean -o reports-stage/ui/allure || true'
                    publishHTML(target: [
                        reportName: 'Stage UI — Playwright Report',
                        reportDir:  'reports-stage/ui/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Stage UI — Allure Report',
                        reportDir:  'reports-stage/ui/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    archiveArtifacts artifacts: 'verification/**/*.png', allowEmptyArchive: true
                }
            }
        }

        stage('Stage — API Tests') {
            when { expression { params.ENVIRONMENT in ['stage', 'prod'] && params.SUITE in ['all', 'api'] } }
            steps {
                sh 'rm -rf allure-results-stage-api && mkdir -p reports-stage/api/html allure-results-stage-api'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=stage \\
                        -v \${WORKSPACE}/reports-stage/api/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-stage-api:/app/allure-results \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=api-pipeline
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-stage/api/allure'
                    sh 'npx allure generate allure-results-stage-api --clean -o reports-stage/api/allure || true'
                    publishHTML(target: [
                        reportName: 'Stage API — Playwright Report',
                        reportDir:  'reports-stage/api/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Stage API — Allure Report',
                        reportDir:  'reports-stage/api/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════
        //  PROD — manual approval gate + smoke only
        // ══════════════════════════════════════════════════════════════════
        stage('Approval for Prod') {
            when { expression { params.ENVIRONMENT == 'prod' } }
            steps {
                input message: 'Deploy to Prod?', ok: 'Yes, Deploy!'
            }
        }

        stage('Deploy to Prod') {
            when { expression { params.ENVIRONMENT == 'prod' } }
            steps { echo 'Deployed to Prod' }
        }

        stage('Prod — UI Tests') {
            when { expression { params.ENVIRONMENT == 'prod' && params.SUITE in ['all', 'ui'] } }
            steps {
                sh 'rm -rf allure-results-prod-ui && mkdir -p reports-prod/ui/html allure-results-prod-ui'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=prod \\
                        -e BASE_URL=${BASE_URL} \\
                        -v \${WORKSPACE}/reports-prod/ui/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-prod-ui:/app/allure-results \\
                        -v \${WORKSPACE}/verification:/app/verification \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=chromium-ui
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-prod/ui/allure'
                    sh 'npx allure generate allure-results-prod-ui --clean -o reports-prod/ui/allure || true'
                    publishHTML(target: [
                        reportName: 'Prod UI — Playwright Report',
                        reportDir:  'reports-prod/ui/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Prod UI — Allure Report',
                        reportDir:  'reports-prod/ui/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    archiveArtifacts artifacts: 'verification/**/*.png', allowEmptyArchive: true
                }
            }
        }

        stage('Prod — API Tests') {
            when { expression { params.ENVIRONMENT == 'prod' && params.SUITE in ['all', 'api'] } }
            steps {
                sh 'rm -rf allure-results-prod-api && mkdir -p reports-prod/api/html allure-results-prod-api'
                sh """
                    docker run --rm \\
                        -e CI=true \\
                        -e TEST_ENV=prod \\
                        -v \${WORKSPACE}/reports-prod/api/html:/app/playwright-report \\
                        -v \${WORKSPACE}/allure-results-prod-api:/app/allure-results \\
                        ${DOCKER_IMAGE} \\
                        npx playwright test --project=api-pipeline
                """
            }
            post {
                always {
                    sh 'mkdir -p reports-prod/api/allure'
                    sh 'npx allure generate allure-results-prod-api --clean -o reports-prod/api/allure || true'
                    publishHTML(target: [
                        reportName: 'Prod API — Playwright Report',
                        reportDir:  'reports-prod/api/html',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Prod API — Allure Report',
                        reportDir:  'reports-prod/api/allure',
                        reportFiles: 'index.html',
                        keepAll: true, alwaysLinkToLastBuild: true
                    ])
                }
            }
        }
    }

    // ── Global post ────────────────────────────────────────────────────────
    post {
        always {
            sh "docker rmi ${DOCKER_IMAGE} || true"
        }
        success {
            echo 'PIPELINE: SUCCESS'
        }
        failure {
            echo 'PIPELINE: FAILED'
        }
    }
}
