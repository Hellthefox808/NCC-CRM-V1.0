# Runbook: Production Deployment & Zero-Downtime Rollback

**Component:** 19 Jharkhand Battalion NCC Command Centre Platform  
**Target Environments:** Staging / Production Container Clusters (AWS ECS / Docker Swarm / Kubernetes / VPS)  
**Strategy:** Rolling Zero-Downtime Deployment with Automated Upstream Drain  

---

## 1. Pre-Deployment Verification Checklist

Before deploying any artifact to staging or production, confirm that the following quality gates have completed cleanly:

- [ ] `npm run typecheck` exits with code `0` (0 TypeScript errors).
- [ ] `npm run lint` exits with code `0` (0 ESLint errors/warnings).
- [ ] `npm run test` executes all 206 tests with 100% pass rate.
- [ ] `npm run build` completes with zero bundling warnings.
- [ ] Git commit hash is tagged and synchronized on `main` branch.
- [ ] All database migrations (Prisma / Supabase SQL) are non-destructive and backward compatible with running versions.

---

## 2. Container Build & Image Packaging

Build the immutable production container using the multi-stage `Dockerfile`:

```bash
# 1. Set image tag and commit SHA
export COMMIT_SHA=$(git rev-parse --short HEAD)
export IMAGE_TAG="ncc-crm:${COMMIT_SHA}"

# 2. Build multi-stage production container
docker build -t ${IMAGE_TAG} -t ncc-crm:latest .

# 3. Authenticate to container registry (e.g. AWS ECR / GitHub Container Registry)
echo $REGISTRY_PASSWORD | docker login ghcr.io -u $REGISTRY_USER --password-stdin

# 4. Tag and push container image
docker tag ncc-crm:latest ghcr.io/hellthefox808/ncc-crm:${COMMIT_SHA}
docker tag ncc-crm:latest ghcr.io/hellthefox808/ncc-crm:latest
docker push ghcr.io/hellthefox808/ncc-crm:${COMMIT_SHA}
docker push ghcr.io/hellthefox808/ncc-crm:latest
```

---

## 3. Rolling Deployment Sequence

The platform uses Nginx upstream load balancing with `least_conn` and `proxy_next_upstream` to achieve zero-downtime rolling upgrades across backend instances.

### Step 3.1: Upgrade Node 1
1. Direct traffic away from Node 1 or rely on Nginx health checks.
2. Stop Node 1:
   ```bash
   docker stop ncc_app_1 && docker rm ncc_app_1
   ```
3. Run new image on Node 1:
   ```bash
   docker run -d --name ncc_app_1 \
     --network ncc_internal \
     --env-file /etc/ncc/production.env \
     -e PORT=3000 \
     ghcr.io/hellthefox808/ncc-crm:${COMMIT_SHA}
   ```
4. Await readiness check on Node 1:
   ```bash
   curl --fail --retry 10 --retry-delay 2 http://localhost:3001/api/v1/health?type=readiness
   ```

### Step 3.2: Upgrade Node 2
1. Stop Node 2:
   ```bash
   docker stop ncc_app_2 && docker rm ncc_app_2
   ```
2. Run new image on Node 2:
   ```bash
   docker run -d --name ncc_app_2 \
     --network ncc_internal \
     --env-file /etc/ncc/production.env \
     -e PORT=3000 \
     ghcr.io/hellthefox808/ncc-crm:${COMMIT_SHA}
   ```
3. Await readiness check on Node 2:
   ```bash
   curl --fail --retry 10 --retry-delay 2 http://localhost:3002/api/v1/health?type=readiness
   ```

### Step 3.3: Reload Nginx
```bash
docker exec ncc_nginx nginx -s reload
```

---

## 4. Post-Deployment Verification (Smoke Tests)

Execute the automated post-deployment health and telemetry check:

```bash
# 1. Verify Liveness
curl -s -o /dev/null -w "%{http_code}\n" https://ncc.sbu.ac.in/api/v1/health?type=liveness
# Expected: 200

# 2. Verify Readiness (Database, Redis, Memory)
curl -s https://ncc.sbu.ac.in/api/v1/health?type=readiness | jq .
# Expected: { "status": "ok", "checks": { "database": "pass", "cache": "pass" } }

# 3. Verify Cache Telemetry
curl -s https://ncc.sbu.ac.in/api/v1/metrics | jq .
```

---

## 5. Emergency Rollback Procedure

If error rates exceed 1% or health checks fail after deployment:

1. **Identify Previous Stable Release**:
   ```bash
   export PREVIOUS_STABLE_SHA="<last-known-good-commit-sha>"
   ```

2. **Rollback Node 1 & Node 2**:
   ```bash
   docker stop ncc_app_1 && docker rm ncc_app_1
   docker run -d --name ncc_app_1 --network ncc_internal --env-file /etc/ncc/production.env \
     ghcr.io/hellthefox808/ncc-crm:${PREVIOUS_STABLE_SHA}

   docker stop ncc_app_2 && docker rm ncc_app_2
   docker run -d --name ncc_app_2 --network ncc_internal --env-file /etc/ncc/production.env \
     ghcr.io/hellthefox808/ncc-crm:${PREVIOUS_STABLE_SHA}
   ```

3. **Reload Nginx**:
   ```bash
   docker exec ncc_nginx nginx -s reload
   ```

4. **Verify Restored Health**:
   ```bash
   curl -s -f https://ncc.sbu.ac.in/api/v1/health?type=readiness
   ```
