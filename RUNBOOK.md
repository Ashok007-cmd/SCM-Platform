# SCM Platform — Deployment Runbook

> Pre-Go-Live checklist based on GITHUB_DEPLOYMENT_PLAN.md

---

## Go-Live Checklist

### Phase 1 — Prerequisites
- [x] GitHub repository SCM-Platform created
- [x] Environments configured: Development, Staging, Production
- [x] Production environment has Required Reviewers enabled (Ashok007-cmd)
- [x] All 9 repository secrets created in Settings > Secrets > Actions
- [ ] ACTION REQUIRED: Replace all PLACEHOLDER_UPDATE_WITH_REAL_VALUE secrets with real credentials

### Phase 2 — Infrastructure (Terraform)
- [x] .github/workflows/infrastructure.yml workflow created
- [ ] infrastructure/ Terraform code committed (VPC, EKS, RDS, ElastiCache)
- [ ] AWS S3 bucket created for Terraform remote state
- [ ] DynamoDB table created for Terraform state locking
- [ ] AWS IAM Policies locked down to Least Privilege

### Phase 3 — Continuous Integration
- [x] .github/workflows/backend-ci.yml created (Java 21 + Python 3.12)
- [x] .github/workflows/frontend-ci.yml created (Node 20)
- [ ] Backend application code committed to backend/
- [ ] Frontend application code committed to frontend/
- [ ] Snyk/CodeQL reports 0 critical vulnerabilities on main
- [ ] Docker images build and push successfully to Docker Hub

### Phase 4 — Continuous Deployment (GitOps)
- [x] .github/workflows/deploy.yml created
- [x] kubernetes-manifests/backend/deployment.yaml with Flyway InitContainer
- [x] kubernetes-manifests/frontend/deployment.yaml with Ingress
- [ ] ArgoCD installed on AWS EKS cluster
- [ ] ArgoCD application hooked to this GitHub repository
- [ ] ArgoCD syncs successfully on first deployment

### Phase 5 — Database Migrations
- [x] Flyway InitContainer defined in kubernetes-manifests/backend/deployment.yaml
- [ ] SQL migration scripts added to backend/src/main/resources/db/migration/
- [ ] scm-db-secrets Kubernetes Secret created in EKS
- [ ] scm-config ConfigMap created in EKS with DB host and Kafka endpoints
- [ ] Flyway migration runs cleanly against RDS PostgreSQL

### Phase 6 — Monitoring and Rollback
- [x] monitoring/datadog-values.yaml Helm values created
- [x] tests/postman/scm-smoke-tests.json Newman test collection created
- [ ] Datadog Agent deployed via Helm
- [ ] Replace YOUR_DATADOG_API_KEY and YOUR_DATADOG_APP_KEY in datadog-values.yaml
- [ ] Datadog ingesting logs and APM traces from all pods
- [ ] Error rate alert fires at >5% 5xx errors
- [ ] Slack/PagerDuty notifications wired to Datadog monitors

---

## Rollback Procedure

If Datadog detects a spike in 500 errors after deployment:

Option 1 - Git revert (triggers new ArgoCD sync):
  git revert HEAD~1 && git push origin main

Option 2 - ArgoCD 1-click rollback:
  ArgoCD UI > SCM-Platform app > History > Select previous revision > Rollback

Option 3 - Emergency kubectl rollback:
  kubectl rollout undo deployment/scm-backend -n scm-platform
  kubectl rollout undo deployment/scm-frontend -n scm-platform

---

## Key Contacts

| Role | Contact |
|------|---------|
| Platform Owner | Ashok Kumar (@Ashok007-cmd) |
| CI/CD Automation | GitHub Actions |
| GitOps Sync | ArgoCD |
| APM and Alerting | Datadog |

---

Generated from docs/deployment/GITHUB_DEPLOYMENT_PLAN.md
