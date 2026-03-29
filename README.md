<div align="center">

# SCM Platform

### Enterprise Supply Chain Management — Built from Scratch

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0078D4?style=for-the-badge&logo=github&logoColor=white)](https://ashok007-cmd.github.io/SCM-Platform/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/Ashok007-cmd/SCM-Platform/deploy-pages.yml?style=for-the-badge&label=Deploy&logo=githubactions&logoColor=white)](https://github.com/Ashok007-cmd/SCM-Platform/actions/workflows/deploy-pages.yml)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

**A full-stack, production-grade Supply Chain Management platform built entirely by [Ashok Kumar](https://github.com/Ashok007-cmd).**
12 integrated modules · AI demand forecasting · Spring Boot 3.2 + React 18 + FastAPI · ArgoCD GitOps · AWS EKS

<br/>

[**→ View Live Demo**](https://ashok007-cmd.github.io/SCM-Platform/) &nbsp;·&nbsp; [Architecture](#architecture) &nbsp;·&nbsp; [Getting Started](#getting-started) &nbsp;·&nbsp; [Tech Stack](#tech-stack)

</div>

---

## What This Is

SCM Platform solves real supply chain problems: demand forecast failures, inventory blind spots, supplier risk, and logistics delays — all in one unified dashboard.

Built as my first end-to-end production project, it covers every layer of a modern software system:
- A **Java Spring Boot REST API** with JWT security, Flyway migrations, and Kafka event streaming
- A **Python FastAPI ML service** running Prophet + XGBoost demand forecasting
- A **React 18 TypeScript dashboard** with live charts, animated KPIs, and 12 SCM modules
- A **full CI/CD pipeline** deploying to Kubernetes on AWS EKS via ArgoCD GitOps

---

## Live Demo

**[https://ashok007-cmd.github.io/SCM-Platform/](https://ashok007-cmd.github.io/SCM-Platform/)**

The frontend is auto-deployed on every push to `main` via GitHub Actions. The dashboard demonstrates all 12 modules with real UI, charts, and animations.

---

## 12 Modules

| # | Module | What it does |
|---|--------|--------------|
| 1 | **Dashboard** | Real-time KPIs, order trend chart, inventory flow, top products by value |
| 2 | **Inventory** | Multi-warehouse stock levels, low-stock alerts, reserve and adjust quantities |
| 3 | **Orders** | Full lifecycle — create → confirm → ship → deliver → cancel |
| 4 | **Suppliers** | Risk scoring, on-time rate, approved vendor management |
| 5 | **Logistics** | Carrier tracking, shipment events, delay detection |
| 6 | **Warehouse** | Capacity utilization, zone management, occupancy analytics |
| 7 | **Forecasting** | AI demand forecasting with confidence intervals and reorder recommendations |
| 8 | **Procurement** | Purchase orders, approval workflows, spend tracking |
| 9 | **Quality** | Incoming goods inspection, defect rate analytics |
| 10 | **Finance** | Revenue, procurement spend, cash flow, gross margin |
| 11 | **Compliance** | ESG records, regulatory tracking, certificate expiry alerts |
| 12 | **Analytics** | Cross-module KPIs, supplier rankings, OTIF rate, period comparison |

---

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │           GitHub Actions CI/CD               │
                    │  build → test → push image → ArgoCD sync    │
                    └────────────────┬────────────────────────────┘
                                     │
              ┌──────────────────────▼──────────────────────┐
              │                 AWS EKS                       │
              │  ┌─────────────┐  ┌──────────────────────┐  │
              │  │ Spring Boot │  │  FastAPI + ML Models  │  │
              │  │ REST API    │  │  Prophet + XGBoost    │  │
              │  │ :8080       │  │  :8000                │  │
              │  └──────┬──────┘  └──────────────────────┘  │
              │         │                                      │
              │  ┌──────▼──────┐  ┌──────────┐  ┌────────┐  │
              │  │ PostgreSQL  │  │  Redis   │  │ Kafka  │  │
              │  │ (AWS RDS)   │  │ (Cache)  │  │ Events │  │
              │  └─────────────┘  └──────────┘  └────────┘  │
              └─────────────────────────────────────────────┘
                                     │
              ┌──────────────────────▼──────────────────────┐
              │         React 18 Frontend (GitHub Pages)      │
              │   TypeScript · Tailwind · Recharts · Zustand  │
              └─────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend — Spring Boot 3.2 (Java 21)
- REST API with domain-driven structure: `inventory`, `orders`, `suppliers`, `logistics`
- JWT authentication with custom `JwtTokenProvider` (JJWT 0.12.6)
- Spring Security with role-based access: `ADMIN`, `WAREHOUSE_MANAGER`, `SALES_MANAGER`, etc.
- Flyway database migrations with PostgreSQL 16
- Spring Cache (Redis) on frequently-read endpoints
- Apache Kafka for inter-service events

### AI/ML Service — FastAPI + Python 3.12
- Demand forecasting endpoint using Prophet + XGBoost ensemble
- Supplier risk scoring
- Route optimization
- Async endpoints, Pydantic v2 settings, structured logging

### Frontend — React 18 + TypeScript
- Vite build, Tailwind CSS, Radix UI primitives
- TanStack React Query for server state with 60-second auto-refresh
- Zustand for client state
- Recharts — Area, Bar, Line, Pie, Composed charts
- React Hook Form + Zod validation
- Smooth CSS animations: staggered card entrance, skeleton loading, page transitions
- HashRouter for GitHub Pages compatibility

### Infrastructure
| Layer | Technology |
|-------|-----------|
| Cloud | AWS (EKS 1.29, RDS PostgreSQL 16, ElastiCache Redis, S3, IAM) |
| IaC | Terraform — VPC, EKS cluster, RDS, Redis modules |
| Containers | Docker multi-stage builds (distroless final stage) |
| Orchestration | Kubernetes + Helm, HorizontalPodAutoscaler |
| GitOps | ArgoCD — auto-syncs K8s state from this repository |
| CI/CD | GitHub Actions — 4 pipelines (infra, backend, frontend, deploy) |
| Monitoring | Datadog APM, custom alert monitors, Prometheus metrics |

---

## Getting Started

### Prerequisites
- Docker + Docker Compose
- Node.js 20+, Java 21 (JDK), Python 3.12

### Run locally in 3 commands

```bash
git clone https://github.com/Ashok007-cmd/SCM-Platform.git
cd SCM-Platform
docker compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Spring Boot API | http://localhost:8080 |
| AI/ML API docs | http://localhost:8001/docs |
| Kafka UI | http://localhost:8090 |
| Health | http://localhost:8080/actuator/health |

### Individual services

```bash
# Backend (Spring Boot)
cd backend/spring-services
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Frontend (React)
cd frontend && npm install && npm run dev

# AI/ML service (FastAPI)
cd backend/ai-ml-services
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

---

## CI/CD Pipelines

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `deploy-pages.yml` | Push to `main` | Builds React app, deploys to GitHub Pages |
| `backend-ci.yml` | PR / push | Maven test, pytest, CodeQL scan, Docker push |
| `frontend-ci.yml` | PR / push | ESLint, Vitest coverage, Vite build, Docker push |
| `deploy.yml` | CI success | Updates K8s image tags, ArgoCD sync, Newman smoke tests |
| `infrastructure.yml` | Push to `infrastructure/**` | Terraform init → plan → apply |

---

## Project Structure

```
SCM-Platform/
├── .github/workflows/          5 GitHub Actions pipelines
├── backend/
│   ├── spring-services/        Spring Boot 3.2 — domain/inventory, order, supplier, logistics
│   └── ai-ml-services/         FastAPI — forecast, supplier_risk, route_optimization
├── frontend/                   React 18 + TypeScript — 12 pages + MainLayout
├── infrastructure/             Terraform — VPC, EKS, RDS, Redis
├── kubernetes-manifests/       K8s Deployments, Services, ConfigMaps, HPAs
├── monitoring/                 Datadog Helm values + alert monitors
├── tests/postman/              Newman API smoke test collection
├── docs/deployment/            6-phase deployment plan
├── docker-compose.yml          Full local dev stack
├── .env.example                All environment variables documented
└── RUNBOOK.md                  Go-live checklist + rollback procedures
```

---

## Database Schema

PostgreSQL 16, managed by Flyway migrations.

**13 tables:** `suppliers` · `products` · `inventory` · `customers` · `orders` · `order_items` · `purchase_orders` · `po_items` · `shipments` · `shipment_events` · `quality_inspections` · `warehouses` · `compliance_records`

Features: PostgreSQL ENUM types, generated columns, GIN trigram indexes for full-text search, automatic `updated_at` triggers on all tables.

---

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time notifications via WebSocket
- [ ] Blockchain supplier traceability
- [ ] Carbon footprint tracking per shipment
- [ ] EDI integration (AS2 / X12)
- [ ] Multi-tenant SaaS mode

---

## Author

**Ashok Kumar** — [@Ashok007-cmd](https://github.com/Ashok007-cmd)

This is my first end-to-end production project. Every line of code, every pipeline, every architecture decision was designed and built by me. It represents what I've learned about building real software that works at scale.

---

<div align="center">

[![Live Demo](https://img.shields.io/badge/Try%20the%20Live%20Demo-0078D4?style=for-the-badge&logo=github&logoColor=white)](https://ashok007-cmd.github.io/SCM-Platform/)

*MIT License · Built to solve real supply chain challenges*

</div>
