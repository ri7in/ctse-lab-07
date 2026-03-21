# Azure Microservices Lab — FX Rate Dashboard
> SLIIT SE4010 | Sample Project

## Project Structure
```
azure-microservices-lab/
├── gateway/              ← Node.js microservice (Docker container)
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
└── frontend/             ← React SPA (Azure Static Web App)
    ├── public/index.html
    ├── src/App.jsx
    ├── src/index.js
    └── package.json
```

## What This App Does
- **Gateway Service**: Express.js REST API serving mock FX exchange rates (LKR base)
- **Frontend**: React dashboard displaying buy/sell/mid rates per currency

---

## Lab Walkthrough

### Before You Start
Make sure you have:
- Azure CLI: `az --version` (need 2.50+)
- Docker Desktop running: `docker --version`
- Node.js 18+: `node --version`
- Git: `git --version`

---

### Task 1 — Login to Azure

```bash
az login
az account show
```

If you have multiple subscriptions:
```bash
az account list --output table
az account set --subscription "<Your Subscription Name>"
```

---

### Task 2 — Create Resource Group & Container Registry

```bash
# Create resource group
az group create --name microservices-rg --location eastus

# Create container registry (name must be globally unique — append your student ID if needed)
az acr create \
  --resource-group microservices-rg \
  --name sliitmicroregistry \
  --sku Basic

# Log Docker into ACR
az acr login --name sliitmicroregistry
```

---

### Task 3 — Build & Push Docker Image

```bash
# Clone and enter the project
git clone https://github.com/<your-username>/azure-microservices-lab.git
cd azure-microservices-lab

# Build the gateway image
docker build -t sliitmicroregistry.azurecr.io/gateway:v1 ./gateway

# Verify it built
docker images | grep gateway

# Push to ACR
docker push sliitmicroregistry.azurecr.io/gateway:v1

# Verify in ACR
az acr repository list --name sliitmicroregistry --output table
az acr repository show-tags --name sliitmicroregistry --repository gateway --output table
```

---

### Task 4 — Deploy Container App

```bash
# Register providers
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

# Create the Container Apps environment
az containerapp env create \
  --name micro-env \
  --resource-group microservices-rg \
  --location eastus

# Enable ACR admin credentials
az acr update -n sliitmicroregistry --admin-enabled true

# Get your ACR password (note it down)
az acr credential show --name sliitmicroregistry

# Deploy the container app
az containerapp create \
  --name gateway \
  --resource-group microservices-rg \
  --environment micro-env \
  --image sliitmicroregistry.azurecr.io/gateway:v1 \
  --target-port 3000 \
  --ingress external \
  --registry-server sliitmicroregistry.azurecr.io \
  --registry-username sliitmicroregistry \
  --registry-password <your-acr-password>

# Get the public URL
az containerapp show \
  --name gateway \
  --resource-group microservices-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

Test your gateway:
```bash
curl https://<your-gateway-fqdn>/health
curl https://<your-gateway-fqdn>/api/rates
```

---

### Task 5 — Deploy Static Web App Frontend

Push your code to GitHub first, then:

```bash
az staticwebapp create \
  --name sliit-frontend-app \
  --resource-group microservices-rg \
  --location eastus \
  --source https://github.com/<your-username>/azure-microservices-lab \
  --branch main \
  --app-location "/frontend" \
  --output-location "build"

# After deploy, connect frontend to your gateway
az staticwebapp appsettings set \
  --name sliit-frontend-app \
  --resource-group microservices-rg \
  --setting-names REACT_APP_API_URL=https://<your-gateway-fqdn>

# Get frontend URL
az staticwebapp show \
  --name sliit-frontend-app \
  --resource-group microservices-rg \
  --query defaultHostname \
  --output tsv
```

---

### Task 6 — Verify & Cleanup

```bash
# List all resources
az resource list --resource-group microservices-rg --output table

# Check gateway logs
az containerapp logs show --name gateway --resource-group microservices-rg --follow false

# ⚠️ ONLY run this AFTER screenshots — deletes everything!
az group delete --name microservices-rg --yes
```

---

## API Endpoints (Gateway)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/rates | All FX rates (LKR base) |
| GET | /api/rates/:currency | Single currency rate |
| GET | /api/info | Service info |

## Testing Locally

```bash
# Run gateway
cd gateway
npm install
npm start
# → http://localhost:3000/health

# Run frontend (in another terminal)
cd frontend
npm install
npm start
# → http://localhost:3001
```
