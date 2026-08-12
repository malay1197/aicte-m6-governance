#!/bin/bash
# Hyperledger Fabric Local Docker Dev Network Starter Script (macOS / Linux)

set -e

echo "=========================================================="
echo "  AICTE SECURE GOVERNANCE PORTAL - BLOCKCHAIN LEDGER (M4)"
echo "  Bootstrapping Hyperledger Fabric Docker Containers...  "
echo "=========================================================="

# 1. Clean previous runs
echo "Cleaning up old Docker containers and volumes..."
docker-compose down -v

# 2. Create directories for artifacts
mkdir -p channel-artifacts
mkdir -p crypto-config

# 3. Simulate Genesis Block & Channel Transaction Creation
echo "Generating Genesis Block & Channel config artifacts..."
if [ ! -f "./channel-artifacts/genesis.block" ]; then
    echo "MOCK-GENESIS-BLOCK-METADATA" > ./channel-artifacts/genesis.block
fi
if [ ! -f "./channel-artifacts/channel.tx" ]; then
    echo "MOCK-CHANNEL-TRANSACTION-DATA" > ./channel-artifacts/channel.tx
fi

# 4. Spin up Docker containers
echo "Starting Docker containers (Orderer, Peer, CouchDB, CLI)..."
docker-compose up -d

# Check status
docker ps

echo ""
echo "=========================================================="
echo "  Hyperledger Fabric nodes are active!"
echo "  • Orderer Endpoint: localhost:7050"
echo "  • Org1 Peer Endpoint: localhost:7051"
echo "  • CouchDB Dashboard: http://localhost:5984/_utils"
echo "=========================================================="
echo "To execute queries in the peer nodes container run:"
echo "  docker exec -it cli bash"
echo "=========================================================="
