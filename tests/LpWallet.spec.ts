import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { LpWallet } from '../wrappers/LpWallet';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('LpWallet', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('LpWallet');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let lpWallet: SandboxContract<LpWallet>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        lpWallet = blockchain.openContract(LpWallet.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await lpWallet.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lpWallet.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and lpWallet are ready to use
    });
});
