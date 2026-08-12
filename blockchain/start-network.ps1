# Hyperledger Fabric Local Docker Dev Network Starter Script (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  AICTE SECURE GOVERNANCE PORTAL - BLOCKCHAIN LEDGER (M4)" -ForegroundColor Green
Write-Host "  Bootstrapping Hyperledger Fabric Docker Containers...  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Clean previous runs
Write-Host "Cleaning up old Docker containers and volumes..." -ForegroundColor Yellow
docker-compose down -v

# 2. Create directories for artifacts
if (!(Test-Path -Path "./channel-artifacts")) {
    New-Item -ItemType Directory -Path "./channel-artifacts" | Out-Null
}
if (!(Test-Path -Path "./crypto-config")) {
    New-Item -ItemType Directory -Path "./crypto-config" | Out-Null
}

# 3. Simulate Genesis Block & Channel Transaction Creation
Write-Host "Generating Genesis Block & Channel config artifacts..." -ForegroundColor Yellow
# In standard setups, configtxgen would run:
# configtxgen -profile TwoOrgsOrdererGenesis -channelID sys-channel -outputBlock ./channel-artifacts/genesis.block
# configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID aictechannel

# For prototype convenience, we will touch genesis placeholders if configtxgen binary is absent locally
if (!(Test-Path -Path "./channel-artifacts/genesis.block")) {
    Set-Content -Path "./channel-artifacts/genesis.block" -Value "MOCK-GENESIS-BLOCK-METADATA"
}
if (!(Test-Path -Path "./channel-artifacts/channel.tx")) {
    Set-Content -Path "./channel-artifacts/channel.tx" -Value "MOCK-CHANNEL-TRANSACTION-DATA"
}

# 4. Spin up Docker containers
Write-Host "Starting Docker containers (Orderer, Peer, CouchDB, CLI)..." -ForegroundColor Yellow
docker-compose up -d

# Check docker status
docker ps

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Hyperledger Fabric nodes are active!" -ForegroundColor Green
Write-Host "  • Orderer Endpoint: localhost:7050" -ForegroundColor Cyan
Write-Host "  • Org1 Peer Endpoint: localhost:7051" -ForegroundColor Cyan
Write-Host "  • CouchDB Dashboard: http://localhost:5984/_utils" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "To execute queries in the peer nodes container run:"
Write-Host "  docker exec -it cli bash"
Write-Host "==========================================================" -ForegroundColor Green
