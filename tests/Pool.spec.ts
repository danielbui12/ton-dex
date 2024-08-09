import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Pool } from '../wrappers/Pool';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Pool', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Pool');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let pool: SandboxContract<Pool>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        pool = blockchain.openContract(Pool.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await pool.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: pool.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and pool are ready to use
    });
});
