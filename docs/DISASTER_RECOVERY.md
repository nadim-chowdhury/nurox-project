# Nurox ERP Disaster Recovery Plan

This document outlines the standard operating procedures for Disaster Recovery (DR) in Nurox ERP.

## Objectives

- **Recovery Point Objective (RPO)**: ≤ 1 hour
- **Recovery Time Objective (RTO)**: ≤ 4 hours

## 1. Database Backup & Restore

### Automated Backups

- PostgreSQL WAL logs are continuously archived to MinIO/S3, ensuring point-in-time recovery capabilities.
- Daily `pg_dump` backups are taken via a Kubernetes CronJob at 02:00 AM UTC and stored in MinIO/S3. Retention is set to 30 days.

### Restore Procedure (PostgreSQL)

1. **Locate Backup File**: Fetch the latest backup `.sql.gz` from the MinIO/S3 bucket.
2. **Stop Application Traffic**: Scale down the NestJS API pods to 0 to prevent data inconsistency during restore.
   ```bash
   kubectl scale deployment nurox-erp-api --replicas=0 -n nurox-prod
   ```
3. **Restore Database**:
   ```bash
   gunzip -c backup-YYYYMMDD.sql.gz | psql -h $DB_HOST -U $DB_USER -d $DB_NAME
   ```
4. **Verify Integrity**: Run smoke tests or manually verify the database schema and data counts.
5. **Resume Traffic**:
   ```bash
   kubectl scale deployment nurox-erp-api --replicas=2 -n nurox-prod
   ```

## 2. Infrastructure Failure

In the event of a catastrophic cluster failure:

1. Ensure the Helm chart is up-to-date in the git repository.
2. Provision a new Kubernetes cluster.
3. Apply Vault / external secrets.
4. Deploy the infrastructure using Helm:
   ```bash
   helm upgrade --install nurox-erp ./infra/k8s/helm-chart --namespace nurox-prod
   ```
5. Follow the **Restore Procedure** above to migrate data to the new cluster's database instance.

## 3. Incident Management & On-Call

- Alerts trigger via Prometheus -> AlertManager -> PagerDuty.
- P1 Incidents (e.g., Error rate > 5%, Node failure) page the primary on-call engineer immediately.

## 4. Testing & Verification

- **Monthly**: Automated script restores the latest production backup into an isolated staging environment and runs the Playwright E2E suite to verify data integrity.
- **Quarterly**: Table-top exercise or full failover drill to validate the RTO and RPO limits.
