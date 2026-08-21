#!/usr/bin/env bash
# Per-boot reconciliation: bring PostgreSQL up and ensure the dev database
# exists. Idempotent and safe to run on every environment start.
set -euo pipefail

sudo pg_ctlcluster 16 main start || true
until sudo -u postgres pg_isready -q; do sleep 1; done

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='gizznote'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE gizznote LOGIN PASSWORD 'gizznote';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='gizznote'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE gizznote OWNER gizznote;"

echo "PostgreSQL is ready on 127.0.0.1:5432 (database: gizznote)."
