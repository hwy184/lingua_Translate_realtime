#!/bin/bash

echo "Starting all services..."

# Lingua Client
(
  cd Lingua_client
  npm run dev
) &

# Backend Gateway
(
  cd backend_gateway
  npm run dev
) &

# Python Services
(
  cd python-services
  source venv/bin/activate
  uvicorn main:app --reload
) &

wait