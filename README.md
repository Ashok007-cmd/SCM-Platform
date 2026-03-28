# SCM Platform

> Enterprise Supply Chain Management Platform — 12 modules, AI demand forecasting (Prophet + XGBoost), Spring Boot 3.2, React 18, FastAPI, ArgoCD GitOps, AWS EKS, Terraform IaC, Datadog monitoring.

[![Release](https://img.shields.io/github/v/release/Ashok007-cmd/SCM-Platform?style=flat-square&color=blue)](https://github.com/Ashok007-cmd/SCM-Platform/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

**SCM Platform** is a production-grade, full-stack supply chain management system built to address modern supply chain challenges — visibility gaps, demand forecast failures, supplier risk, and sustainability compliance.

It features **12 integrated modules**, an **AI/ML forecasting engine** (Prophet + XGBoost), a **React 18 dashboard**, and a fully automated **CI/CD pipeline** deploying to **AWS EKS** via **ArgoCD GitOps**.

---

## Key Features

- **AI Demand Forecasting** — Prophet + XGBoost ensemble with confidence intervals and reorder recommendations
- **Real-Time Inventory** — Multi-warehouse stock tracking with low-stock alerts
- **End-to-End Order Management** — Full lifecycle from creation to delivery
- **Supplier Risk Management** — Dynamic risk scoring, performance tracking, compliance
- **Shipment Tracking** — Live carrier integration with delay detection
- **Compliance and ESG** — Certificate management, trade compliance, expiry alerts
- **Analytics Dashboard** — OTIF rate, perfect order rate, inventory turnover
- **Event-Driven Architecture** — Apache Kafka for real-time inter-service communication
- **GitOps Deployment** — ArgoCD automatically syncs Kubernetes state from Git

---

## 12 SCM Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Dashboard** | Real-time KPIs, alerts, order trend and inventory flow charts |
| 2 | **Inventory** | Stock levels, reservations, multi-warehouse tracking |
| 3 | **Orders** | Full lifecycle — create, confirm, ship, deliver, cancel |
| 4 | **Suppliers** | Risk scoring, on-time delivery rate, approved vendor list |
| 5 | **Logistics** | Carrier tracking, shipment events, delay detection |
| 6 | **Warehouse** | Capacity utilization, zone management, occupancy charts |
| 7 | **Forecasting** | AI demand forecasting with confidence band visualization |
| 8 | **Procurement** | Purchase orders, approval workflows, spend tracking |
| 9 | **Quality** | Incoming goods inspection, defect rate analytics |
| 10 | **Finance** | Revenue, procurement spend, cash flow, gross margin |
| 11 | **Compliance** | ESG tracking, regulatory records, certificate expiry alerts |
| 12 | **Analytics** | Cross-module KPIs, supplier rankings, period comparison |

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| REST API | Spring Boot 3.2, Java 21 |
| AI/ML Service | FastAPI, Python 3.12, Prophet, XGBoost, LightGBM |
| Primary Database | PostgreSQL 16 (AWS RDS) with Flyway migrations |
| Cache | Redis (AWS ElastiCache) |
| Messaging | Apache Kafka / Confluent Cloud |
| Security | OAuth 2.0, JWT, Spring Security |
| Monitoring | Datadog APM, Micrometer metrics |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Radix UI primitives |
| Server State | TanStack React Query |
| Client State | Zustand |
| Charts | Recharts (Area, Bar, Line, Pie, Composed) |
| Forms | React Hook Form + Zod validation |
| Testing | Vitest, Testing Library |

### Infrastructure and DevOps
| Layer | Technology |
|-------|-----------|
| Cloud | AWS (EKS, RDS, ElastiCache, S3, IAM) |
| IaC | Terraform (VPC, EKS 1.29, RDS, Redis) |
| Containers | Docker multi-stage builds |
| Orchestration | Kubernetes + Helm |
| GitOps | ArgoCD |
| CI/CD | GitHub Actions — 4 automated pipelines |
| Monitoring | Datadog APM, log collection, custom alert monitors |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+, Java 21 (JDK), Python 3.12

### Local Development

```bash
git clone https://github.com/Ashok007-cmd/SCM-Platform.git
cd SCM-Platform
cp .env.example .env
docker compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| AI/ML API Docs | http://localhost:8001/docs |
| Kafka UI | http://localhost:8090 |
| Health Check | http://localhost:8080/actuator/health |

### Individual Services

```bash
# Spring Boot backend
cd backend/spring-services
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# React frontend
cd frontend && npm install && npm run dev

# FastAPI AI/ML service
cd backend/ai-ml-services
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

---

## CI/CD Pipeline

| Workflow | Trigger | Actions |
|----------|---------|---------|
| infrastructure.yml | Push to infrastructure/** | Terraform init, plan, apply |
| backend-ci.yml | PR / push to main | mvn test, pytest, CodeQL, Docker push |
| frontend-ci.yml | PR / push to main | ESLint, Vitest, Vite build, Docker push |
| deploy.yml | CI success on main | Update K8s image tags, ArgoCD sync, Newman tests |

**Environments:** Development to Staging to Production (requires reviewer approval)

---

## Database Schema

PostgreSQL 16 managed by Flyway — 12 tables:

suppliers, products, inventory, customers, orders, order_items, purchase_orders, po_items, shipments, shipment_events, quality_inspections, warehouses, compliance_records

Includes ENUM types, generated columns, GIN trigram indexes, and automatic updated_at triggers on all tables.

---

## Repository Structure

```
SCM-Platform/
├── .github/workflows/        GitHub Actions CI/CD — 4 pipelines
├── backend/
│   ├── spring-services/      Spring Boot 3.2 REST API + Flyway
│   └── ai-ml-services/       FastAPI + Prophet + XGBoost
├── frontend/                 React 18 + TypeScript + Vite — 13 pages
├── infrastructure/           Terraform — AWS VPC, EKS, RDS, Redis
├── kubernetes-manifests/     K8s deployments + Flyway InitContainers
├── monitoring/               Datadog Helm values + custom monitors
├── tests/postman/            Newman API smoke test suite
├── docs/deployment/          6-phase deployment plan
├── docker-compose.yml        Full local development stack
├── .env.example              All environment variables documented
└── RUNBOOK.md                Go-live checklist + rollback guide
```

---

## Business Case

| Metric | Target |
|--------|--------|
| Implementation Timeline | 40 weeks |
| Total Budget | $3.5M |
| ROI over 3 years | 220% |
| Platform Uptime SLA | 99.9% |
| Demand Forecast Accuracy | Above 85% MAPE |
| Order Fulfillment Rate | Above 98% |

---

## Roadmap

- [ ] Mobile application (React Native)
- [ ] Blockchain-based supplier traceability
- [ ] Carbon footprint tracking per shipment
- [ ] EDI integration (AS2 / X12)
- [ ] Multi-tenant SaaS mode
- [ ] ML anomaly detection and route optimization

---

## Documentation

| Resource | Description |
|----------|-------------|
| [Deployment Plan](docs/deployment/GITHUB_DEPLOYMENT_PLAN.md) | 6-phase GitHub-native CI/CD setup guide |
| [RUNBOOK.md](RUNBOOK.md) | Go-live checklist and rollback procedures |
| [.env.example](.env.example) | All environment variables with descriptions |
| [Release Notes](https://github.com/Ashok007-cmd/SCM-Platform/releases) | Version history and changelog |

---

## Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit changes: git commit -m 'Add your feature'
4. Push: git push origin feature/your-feature
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.

---

*Built to solve real-world supply chain disruption challenges.*
