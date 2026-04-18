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
                sh """
                    docker build -t ${BACKEND_IMAGE} -t arnavsharma2007/codex-backend:latest ./backend
                    docker build \\
                        --build-arg VITE_BACKEND_URL=http://localhost:5000 \\
                        -t ${FRONTEND_IMAGE} \\
                        -t arnavsharma2007/codex-frontend:latest \\
                        ./frontend
                """
            }
        }

        stage('🧪 2 — Test') {
            steps {
                dir('backend') {
                    withEnv([
                        "MONGO_URI=${env.MONGO_URI ?: ''}",
                        "JWT_SECRET=${env.JWT_SECRET ?: ''}",
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
                    sh """
                        npx sonar-scanner \\
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                            -Dsonar.organization=${SONAR_ORG} \\
                            -Dsonar.host.url=https://sonarcloud.io \\
                            -Dsonar.login=${SONAR_TOKEN} \\
                            -Dsonar.sources=backend/,frontend/src \\
                            -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/tests/**,**/dist/**,**/*.test.*,**/*.spec.* \\
                            -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info \\
                            -Dsonar.branch.name=${env.BRANCH_NAME ?: 'main'}
                    """
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
                
                sh """
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b . || true

                    if [ -f "./trivy" ]; then
                        ./trivy image --severity HIGH,CRITICAL ${BACKEND_IMAGE} || true
                        ./trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE} || true
                    fi
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'backend/npm-audit-backend.json,frontend/npm-audit-frontend.json', allowEmptyArchive: true
                }
            }
        }

        stage('🚀 5 — Deploy (Staging)') {
            steps {
sh """
                    curl -sSL "https://github.com/docker/compose/releases/download/v2.26.0/docker-compose-\$(uname -s)-\$(uname -m)" -o ./docker-compose
                    chmod +x ./docker-compose

                    cat > .env.staging << EOF
MONGO_URI=${env.MONGO_URI ?: ''}
JWT_SECRET=${env.JWT_SECRET ?: ''}
GEMINI_API_KEY=${env.GEMINI_API_KEY ?: ''}
STRIPE_SECRET=${env.STRIPE_SECRET ?: 'sk_test_placeholder'}
STRIPE_PUBLISHABLE_KEY=${env.STRIPE_PUBLISHABLE_KEY ?: 'pk_test_placeholder'}
STRIPE_WEBHOOK_SECRET=${env.STRIPE_WEBHOOK_SECRET ?: 'whsec_placeholder'}
BACKEND_ADMIN_KEY=admin_staging
ALERT_WEBHOOK_URL=${env.ALERT_WEBHOOK_URL ?: ''}
GRAFANA_PASSWORD=staging-admin
IMAGE_TAG=${env.IMAGE_VERSION ?: 'latest'}
PORT=5001
EOF

                    ./docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging down --remove-orphans || true
                    ./docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d backend

                    sleep 20
                """

                    ./docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging down --remove-orphans || true
                    ./docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d backend

                    sleep 20
                """

                sh """
                    for i in 1 2 3 4 5; do
                        RESPONSE=\$(curl -s -o /tmp/health_response.json -w "%{http_code}" --max-time 10 ${STAGING_BACKEND_URL}/health 2>/dev/null || echo "000")

                        if [ "\$RESPONSE" = "200" ]; then
                            BODY=\$(cat /tmp/health_response.json)
                            STATUS=\$(echo "\$BODY" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);console.log(j.status)}catch(e){console.log('unknown');}})")
                            
                            if [ "\$STATUS" = "ok" ]; then
                                exit 0
                            fi
                        fi
                        sleep 10
                    done
                    echo "================================================"
                    echo "❌ SMOKE TEST FAILED — /health did not return { status: ok }"
                    echo "   Last response: \$(cat /tmp/health_response.json 2>/dev/null || echo 'no response')"
                    echo "================================================"
                    
                    # ADD THESE TWO LINES TO PRINT THE CRASH LOGS:
                    echo "── BACKEND CONTAINER LOGS ──"
                    ./docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging logs backend
                    
                    exit 1
                """
            }
            post {
                failure {
                    sh './docker-compose -f docker-compose.yml -f docker-compose.staging.yml down --remove-orphans || true'
                }
            }
        }

        stage('🏷️  6 — Release') {
            when { branch 'main' }
            steps {
                sh """
                    echo "\${DOCKERHUB_CREDS_PSW}" | docker login -u "\${DOCKERHUB_CREDS_USR}" --password-stdin
                    docker push ${BACKEND_IMAGE}
                    docker push arnavsharma2007/codex-backend:latest
                    docker push ${FRONTEND_IMAGE}
                    docker push arnavsharma2007/codex-frontend:latest
                    docker logout
                """

                sh """
                    git config user.email "jenkins@codex-ci.local"
                    git config user.name "Jenkins CI"
                    git tag -a ${IMAGE_VERSION} -m "Release ${IMAGE_VERSION}" || true
                    git push origin ${IMAGE_VERSION} || true
                """

                sh """
                    cat > .env.prod << EOF
MONGO_URI=${env.MONGO_URI ?: ''}
JWT_SECRET=${env.JWT_SECRET ?: ''}
GEMINI_API_KEY=${env.GEMINI_API_KEY ?: ''}
STRIPE_SECRET=${env.STRIPE_SECRET ?: 'sk_prod_placeholder'}
STRIPE_PUBLISHABLE_KEY=${env.STRIPE_PUBLISHABLE_KEY ?: 'pk_prod_placeholder'}
STRIPE_WEBHOOK_SECRET=${env.STRIPE_WEBHOOK_SECRET ?: 'whsec_placeholder'}
BACKEND_ADMIN_KEY=admin_prod_secure
ALERT_WEBHOOK_URL=${env.ALERT_WEBHOOK_URL ?: ''}
GRAFANA_PROD_PASSWORD=prod-secure-admin
IMAGE_TAG=${env.IMAGE_VERSION ?: 'latest'}
EOF

                    ./docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod pull
                    ./docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
                """
            }
        }

        stage('📈 7 — Monitoring') {
            steps {
                sh """
                    curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/-/healthy || true
                    curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || true
                    curl -s http://localhost:5000/metrics | head -5 || true
                """
            }
        }
    }

    post {
        always {
            script {
                node {
                    sh 'rm -f .env.staging .env.prod ./docker-compose ./trivy || true'
                    cleanWs(cleanWhenNotBuilt: false, deleteDirs: true, disableDeferredWipeout: true)
                }
            }
        }
    }
}
