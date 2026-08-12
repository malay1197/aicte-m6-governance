# AICTE Secure Governance Ledger - Hyperledger Fabric Stack (Module M4)

This directory contains the complete Docker Compose configurations and initialization scripts to bootstrap a local **Hyperledger Fabric private permissioned blockchain** network.

---

## Directory Architecture

* `docker-compose.yaml`: Configures the active containers and environment variables.
* `configtx.yaml`: Defines organizational profiles, channel parameters, and Raft/Solo consensus.
* `chaincode/`: Contains the smart contract implementation in Javascript.
  * `ledger-contract.js`: Encodes the transaction rules to commit report hashes and audit verification logs.
* `start-network.ps1`: Automated startup script for Windows PowerShell.
* `start-network.sh`: Automated startup script for macOS & Linux bash.

---

## Infrastructure Nodes Configured (Docker)

1. **Orderer Node** (`orderer.example.com`):
   * Orchestrates transaction sequencing, packages transactions into blocks, and guarantees consensus distribution to validation peers.
2. **Org1 Peer Node** (`peer0.org1.example.com`):
   * Inspects, endorses, and commits transaction blocks. Hosts the state ledger.
3. **CouchDB State Database** (`couchdb0`):
   * Acts as the secondary state store for Org1 Peer, enabling rich JSON queries (e.g., verifying report hashes by signer and timestamp).
4. **CLI Helper Container** (`cli`):
   * Houses the Fabric tool binaries to execute administrative tasks, install chaincodes, and bootstrap channels.

---

## Quick Start Instructions

### Prerequisites
Make sure **Docker Desktop** is running on your machine.

### Startup (Windows)
Open PowerShell inside the `blockchain` folder and run:
```powershell
.\start-network.ps1
```

### Startup (macOS / Linux)
Open Terminal inside the `blockchain` folder and run:
```bash
chmod +x start-network.sh
./start-network.sh
```

---

## Verifying the Ledger State
Once the network starts, you can check the state database directly:
* Access the CouchDB administration panel at: [http://localhost:5984/_utils](http://localhost:5984/_utils)
* Login credentials:
  * **User**: `admin`
  * **Password**: `password`
