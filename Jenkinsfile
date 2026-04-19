// ═══════════════════════════════════════════════════════════════════════
// Dev@Deakin Codex — Jenkins Declarative Pipeline
// ═══════════════════════════════════════════════════════════════════════

pipeline {
    agent any

    environment {
        APP_NAME        = 'codex'
        IMAGE_VERSION   = "v1.0.${BUILD_NUMBER}"
        BACKEND_IMAGE   = "arnavsharma2007/codex-backend:${IMAGE_VERSION}"
        FRONTEND_IMAGE  = "arnavsharma2007/codex-frontend:${IMAGE_VERSION}"
        STAGING_BACKEND_URL = 'http://localhost:5001'
        NODE_VERSION    = '20'

        SONAR_PROJECT_KEY = 'ArnavSharma2007_Codex' 
        SONAR_ORG         = 'arnavsharma2007'

        STRIPE_SECRET          = 'sk_test_placeholder'
        STRIPE_PUBLISHABLE_KEY = 'pk_test_placeholder'
        STRIPE_WEBHOOK_SECRET  = 'whsec_placeholder'
        ALERT_WEBHOOK_URL      = ''

        DOCKERHUB_CREDS     = credentials('dockerhub-credentials')
        SONAR_TOKEN         = credentials('sonarcloud-token')
        MONGO_URI           = credentials('mongo-uri')
        JWT_SECRET          = credentials('jwt-secret')
        GEMINI_API_KEY      = credentials('gemini-api-key')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('📦 1 — Build') {
            steps {
                echo '── Installing backend dependencies ──'
                dir('backend') {
                    sh 'node --version && npm --version'
                    sh 'npm ci --prefer-offline'
                }

                echo '── Installing frontend dependencies ──'
                dir('frontend') {
                    sh 'npm install --legacy-peer-deps'
                }

                echo '── Building Docker images ──'
                sh '''
                    docker build -t $BACKEND_IMAGE -t arnavsharma2007/codex-backend:latest ./backend
                    docker build \
                        --build-arg VITE_BACKEND_URL=http://localhost:5000 \
                        -t $FRONTEND_IMAGE \
                        -t arnavsharma2007/codex-frontend:latest \
                        ./frontend
                '''
            }
        }

        stage('🧪 2 — Test') {
            steps {
                dir('backend') {
                    withEnv([
                        "NODE_ENV=test",
                        "PORT=5001"
                    ]) {
                        sh 'npm run test:ci'
                    }
                    junit allowEmptyResults: false, testResults: 'junit.xml'
                }

                dir('frontend') {
                    sh 'npm run test:ci'
                    junit allowEmptyResults: false, testResults: 'junit.xml'
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true,
                        reportDir: 'backend/coverage/lcov-report', reportFiles: 'index.html', reportName: 'Backend Coverage Report'
                    ])
                }
            }
        }

        stage('📊 3 — Code Quality') {
            steps {
                dir('backend') {
                    sh '''#!/bin/bash
                        npm run lint 2>&1 | tee eslint-backend.log
                        exit_code=${PIPESTATUS[0]}
                        if [ $exit_code -ne 0 ]; then
                            echo "❌ ESLINT: Backend has linting errors"
                            exit 1
                        fi
                    '''
                }

                dir('frontend') {
                    sh 'npm run lint 2>&1 | tee eslint-frontend.log || true'
                }

                withSonarQubeEnv('SonarCloud') {
                    sh '''
                        npx sonar-scanner \
                            -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                            -Dsonar.organization=$SONAR_ORG \
                            -Dsonar.host.url=https://sonarcloud.io \
                            -Dsonar.login=$SONAR_TOKEN \
                            -Dsonar.sources=backend/,frontend/src \
                            -Dsonar.exclusions="**/node_modules/**,**/coverage/**,**/tests/**,**/dist/**,**/*.test.*,**/*.spec.*" \
                            -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info \
                            -Dsonar.branch.name=${BRANCH_NAME:-main}
                    '''
                }
            }
        }

        stage('🔐 4 — Security Scan') {
            steps {
                dir('backend') {
                    sh '''
                        npm audit --audit-level=none --json > npm-audit-backend.json 2>&1 || true
                        node -e "
                        const fs = require('fs');
                        const report = JSON.parse(fs.readFileSync('npm-audit-backend.json', 'utf8'));
                        const dangerous = Object.values(report.vulnerabilities || {}).filter(v => v.severity === 'high' || v.severity === 'critical');
                        if (dangerous.length > 0) {
                            console.log('⚠️  HIGH/CRITICAL VULNERABILITIES FOUND:');
                            dangerous.forEach(v => console.log('  • [' + v.severity.toUpperCase() + '] ' + v.name));
                            process.exit(1);
                        } else {
                            console.log('✅ No HIGH/CRITICAL vulnerabilities found in backend');
                        }
                        "
                    '''
                }

                dir('frontend') {
                    sh '''
                        npm audit --audit-level=none --json > npm-audit-frontend.json 2>&1 || true
                        node -e "
                        const fs = require('fs');
                        const report = JSON.parse(fs.readFileSync('npm-audit-frontend.json', 'utf8'));
                        const dangerous = Object.values(report.vulnerabilities || {}).filter(v => v.severity === 'high' || v.severity === 'critical');
                        if (dangerous.length > 0) {
                            console.log('⚠️  HIGH/CRITICAL VULNERABILITIES FOUND in frontend:');
                            dangerous.forEach(v => console.log('  • [' + v.severity.toUpperCase() + '] ' + v.name));
                        } else {
                            console.log('✅ No HIGH/CRITICAL vulnerabilities in frontend');
                        }
                        " || true
                    '''
                }
                
                sh '''
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b . || true

                    if [ -f "./trivy" ]; then
                        ./trivy image --severity HIGH,CRITICAL --ignore-unfixed --format table $BACKEND_IMAGE || true
                        ./trivy image --severity HIGH,CRITICAL --ignore-unfixed --format table $FRONTEND_IMAGE || true
                    fi
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'backend/npm-audit-backend.json,frontend/npm-audit-frontend.json', allowEmptyArchive: true
                }
            }
        }

        stage('🚀 5 — Deploy (Staging)') {
            steps {
                sh '''
                    curl -sSL "https://github.com/docker/compose/releases/download/v2.26.0/docker-compose-$(uname -s)-$(uname -m)" -o ./docker-compose
                    chmod +x ./docker-compose

                    echo "MONGO_URI=$MONGO_URI" > .env.staging
                    echo "JWT_SECRET=$JWT_SECRET" >> .env.staging
                    echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> .env.staging
                    echo "STRIPE_SECRET=$STRIPE_SECRET" >> .env.staging
                    echo "STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" >> .env.staging
                    echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" >> .env.staging
                    echo "BACKEND_ADMIN_KEY=admin_staging" >> .env.staging
                    echo "ALERT_WEBHOOK_URL=$ALERT_WEBHOOK_URL" >> .env.staging
                    echo "GRAFANA_PASSWORD=staging-admin" >> .env.staging
                    echo "DOCKER_USERNAME=arnavsharma2007" >> .env.staging
                    echo "IMAGE_TAG=$IMAGE_VERSION" >> .env.staging
                    echo "PORT=5001" >> .env.staging
                    echo "HOST=0.0.0.0" >> .env.staging

                    ./docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging down --remove-orphans || true
                    ./docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d backend

                    sleep 20
                '''

                sh '''
                    for i in 1 2 3 4 5; do
                        BODY=$(docker exec codex-backend-staging wget -qO- http://127.0.0.1:5001/health 2>/dev/null || echo "FAILED")

                        if echo "$BODY" | grep -q '"status":"ok"'; then
                            echo "✅ SMOKE TEST PASSED"
                            exit 0
                        fi
                        
                        echo "Health check attempt $i failed. Retrying in 10s..."
                        sleep 10
                    done
                    
                    echo "================================================"
                    echo "❌ SMOKE TEST FAILED — /health did not return { status: ok }"
                    echo "   Last response: $BODY"
                    echo "================================================"
                    
                    echo "── BACKEND CONTAINER LOGS ──"
                    docker logs codex-backend-staging
                    
                    exit 1
                '''
            }
            post {
                failure {
                    sh './docker-compose -f docker-compose.yml -f docker-compose.staging.yml down --remove-orphans || true'
                }
            }
        }

        stage('🏷️  6 — Release') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDS_PSW" | docker login -u "$DOCKERHUB_CREDS_USR" --password-stdin
                    docker push $BACKEND_IMAGE
                    docker push arnavsharma2007/codex-backend:latest
                    docker push $FRONTEND_IMAGE
                    docker push arnavsharma2007/codex-frontend:latest
                    docker logout
                '''

                sh '''
                    git config user.email "jenkins@codex-ci.local"
                    git config user.name "Jenkins CI"
                    git tag -a $IMAGE_VERSION -m "Release $IMAGE_VERSION" || true
                    git push origin $IMAGE_VERSION || true
                '''

                sh '''
                    # 1. Swap the hardcoded USERNAME with your actual DockerHub username
                    sed -i 's/USERNAME/arnavsharma2007/g' docker-compose*.yml || true
                    
                    # 2. DELETE the prometheus.yml volume mount to fix the Docker-out-of-Docker crash
                    sed -i '/prometheus.yml/d' docker-compose*.yml || true

                    echo "MONGO_URI=$MONGO_URI" > .env.prod
                    echo "JWT_SECRET=$JWT_SECRET" >> .env.prod
                    echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> .env.prod
                    echo "STRIPE_SECRET=$STRIPE_SECRET" >> .env.prod
                    echo "STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" >> .env.prod
                    echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" >> .env.prod
                    echo "BACKEND_ADMIN_KEY=admin_prod_secure" >> .env.prod
                    echo "ALERT_WEBHOOK_URL=$ALERT_WEBHOOK_URL" >> .env.prod
                    echo "GRAFANA_PROD_PASSWORD=prod-secure-admin" >> .env.prod
                    echo "DOCKER_USERNAME=arnavsharma2007" >> .env.prod
                    echo "IMAGE_TAG=$IMAGE_VERSION" >> .env.prod
                    echo "PORT=5000" >> .env.prod
                    echo "HOST=0.0.0.0" >> .env.prod

                    ./docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod pull
                    ./docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
                '''
            }
        }

        stage('📈 7 — Monitoring') {
            steps {
                sh '''
                    echo "── Checking Prometheus Health ──"
                    docker exec codex-prometheus-prod wget -qS -O- http://127.0.0.1:9090/-/healthy 2>/dev/null || echo "Prometheus not found or unreachable"
                    
                    echo "── Checking Frontend Health ──"
                    docker exec codex-frontend-prod wget -qS -O- http://127.0.0.1:3001/api/health 2>/dev/null || echo "Frontend not found or unreachable"
                    
                    echo "── Checking Backend Metrics ──"
                    docker exec codex-backend-prod wget -qO- http://127.0.0.1:5000/metrics 2>/dev/null | head -5 || echo "Backend metrics unreachable"
                '''
            }
        }
    }

    post {
        always {
            script {
                node {
                    sh '''
                        rm -f .env.staging .env.prod ./docker-compose ./trivy || true
                    '''
                    cleanWs(cleanWhenNotBuilt: false, deleteDirs: true, disableDeferredWipeout: true)
                }
            }
        }
    }
}
