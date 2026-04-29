# 🚀 Codex 

Codex is a modern, full-stack SaaS application built with a React frontend, a Node.js/Express backend, and a MongoDB database. It integrates Google's Gemini AI for intelligent processing and Stripe for seamless payment handling.

The project is fully containerized and features a highly robust, 7-stage CI/CD pipeline orchestrated by Jenkins, ensuring that every code change is automatically built, tested, scanned for vulnerabilities, and safely promoted to production.

---

## 🛠️ Tech Stack & Architecture

### **Application Core**
* **Frontend:** React.js (served securely via Nginx)
* **Backend:** Node.js (v20) & Express.js
* **Database:** MongoDB (In-memory for CI testing, Persistent Atlas cluster for Production)
* **Integrations:** Google Gemini AI API, Stripe Billing API

### **DevOps & Infrastructure**
* **Containerization:** Docker & Docker Compose
* **CI/CD:** Jenkins (Declarative Pipeline)
* **Testing:** Jest & Supertest (Unit & Integration Testing)
* **Code Quality:** ESLint, SonarCloud
* **Security Scanning:** Aqua Security Trivy, `npm audit`
* **Monitoring & Observability:** Prometheus, Grafana

---

## ⚙️ CI/CD Pipeline Lifecycle

This project utilizes a highly automated Continuous Integration and Continuous Deployment (CI/CD) pipeline defined in our `Jenkinsfile`. The pipeline is strictly gated and progresses through 7 distinct stages:

### 1. 📦 Build
* Pulls the latest source code from GitHub.
* Installs frontend and backend dependencies using clean, offline-preferred npm installs.
* Builds multi-stage Docker images for both the frontend and backend, keeping production images lightweight by discarding build-time dependencies.

### 2. 🧪 Test
* Spins up an ephemeral, in-memory MongoDB instance to ensure tests run in complete isolation without affecting external databases.
* Executes the Jest automated test suite against backend API routes (Authentication, Notes, AI endpoints) and frontend components.
* Generates LCOV test coverage reports and archives them as Jenkins artifacts.

### 3. 📊 Code Quality
* Runs ESLint with a strict zero-tolerance policy for warnings (`--max-warnings 0`) to enforce clean code hygiene.
* Executes a deep static analysis scan using **SonarCloud** (via SonarScanner) to detect code smells, technical debt, and bugs, ensuring high maintainability.

### 4. 🔐 Security Scan
* **Dependency Scanning:** Runs `npm audit` to parse for highly critical or severe vulnerabilities in third-party Node packages.
* **Container Scanning:** Utilizes **Aqua Security Trivy** to scan the compiled Docker images for OS-level vulnerabilities (e.g., Alpine Linux CVEs) before they are ever deployed.

### 5. 🚀 Deploy (Staging) & Smoke Testing
* Dynamically injects staging environment variables.
* Uses Docker Compose to provision an isolated Staging environment.
* **Automated Smoke Test:** Executes a localized health check (`docker exec`) from *inside* the backend container to bypass Docker network isolation boundaries. If the application does not return a `200 OK` status within the retry window, the pipeline fails and tears down the orphaned staging environment.

### 6. 🏷️ Release
* Authenticates with DockerHub and pushes the validated images, tagging them with the specific build version (e.g., `v1.0.x`).
* Tags the Git commit with the release version for full traceability.
* Dynamically patches `docker-compose.prod.yml` to resolve Docker-out-of-Docker (DooD) volume mapping constraints.
* Injects secure production secrets (Stripe, Gemini, Mongo URIs) and deploys the live application to the production environment.

### 7. 📈 Monitoring
* Validates the health of the production observability stack.
* Actively polls the **Prometheus** instance and the application's `/metrics` endpoint to guarantee live telemetry (CPU usage, memory consumption, request rates) is successfully flowing into **Grafana**.

---

## 💻 Local Development Setup

To run this project locally, you will need [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

**1. Clone the repository**
```bash
git clone [https://github.com/ArnavSharma2007/Codex.git](https://github.com/ArnavSharma2007/Codex.git)
cd Codex
