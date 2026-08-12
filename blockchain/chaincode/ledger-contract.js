'use strict';

const { Contract } = require('fabric-contract-api');

class AicteLedgerContract extends Contract {

    // 1. Initialise the ledger with placeholder records
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const audits = [
            {
                docId: 'file-001',
                name: 'AICTE_Budget_2026_Q3.pdf',
                hash: '0x892e8bf723da890bf2a3e9c8821a9980d28711e9a2bc91e772153c3d2890fb91',
                timestamp: '2026-08-05 11:30 AM',
                signer: 'admin_aicte'
            },
            {
                docId: 'file-002',
                name: 'SIH_Incubation_Grants_Final.xlsx',
                hash: '0xf3a890b7218d22e8bf287c8811e92bc9153c99e9c88e77c3d215bda90ab228fc',
                timestamp: '2026-08-05 12:45 PM',
                signer: 'admin_aicte'
            }
        ];

        for (let i = 0; i < audits.length; i++) {
            audits[i].docType = 'auditRecord';
            await ctx.stub.putState(audits[i].hash, Buffer.from(JSON.stringify(audits[i])));
            console.info('Added <--> ', audits[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // 2. Commit a new report hash to the blockchain state database
    async recordHash(ctx, docId, name, hash, timestamp, signer) {
        console.info('============= START : Record Hash ===========');
        
        const record = {
            docId,
            name,
            hash,
            timestamp,
            signer,
            docType: 'auditRecord'
        };

        // Put the record into state with the hash as the key
        await ctx.stub.putState(hash, Buffer.from(JSON.stringify(record)));
        console.info('Hash Record Committed successfully to Block.');
        return JSON.stringify(record);
    }

    // 3. Query/Verify a hash from the blockchain ledger
    async verifyHash(ctx, hash) {
        console.info('============= START : Verify Hash ===========');
        const recordAsBytes = await ctx.stub.getState(hash);
        
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`Hash: ${hash} does not exist on the Hyperledger registry.`);
        }
        
        console.info('Hash Record verified successfully: ', recordAsBytes.toString());
        return recordAsBytes.toString();
    }
}

module.exports = AicteLedgerContract;
