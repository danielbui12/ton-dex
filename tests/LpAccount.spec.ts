import { Blockchain, EventMessageSent, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, toNano } from '@ton/core';
import { LpAccount } from '../wrappers/LpAccount';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { randomAddress } from '../helpers/common';
import { Pool } from '../wrappers/Pool';
import { CommonFunction } from '../wrappers/Common';

describe('LpAccount', () => {
    let lpAccountCode: Cell,
        poolCode: Cell;

    beforeAll(async () => {
        lpAccountCode = await compile('LpAccount');
        poolCode = await compile('Pool');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>,
        user: SandboxContract<TreasuryContract>,
        pool: SandboxContract<TreasuryContract>,
        stranger: SandboxContract<TreasuryContract>;
    let lpAccount: SandboxContract<LpAccount>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        pool = await blockchain.treasury('pool');
        user = await blockchain.treasury('user');
        stranger = await blockchain.treasury('stranger');

        lpAccount = blockchain.openContract(LpAccount.createFromConfig({
            user: user.address,
            pool: pool.address,
            stored0: toNano(0),
            stored1: toNano(0),
        }, lpAccountCode));
        const deployResult = await lpAccount.sendDeploy(deployer.getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lpAccount.address,
            deploy: true,
            success: true,
        });
    });

    it("should reset gas", async () => {
        const sendWrongAddress = await lpAccount.sendInternalMessage(
            stranger.getSender(),
            toNano('10000'),
            CommonFunction.resetGasMsg(),
        );

        const sendWrongAddressEvents = sendWrongAddress.events as EventMessageSent[];
        // `sendWrongAddressEvents[1].body` contains `wrong_op` code
        expect(sendWrongAddressEvents[1].type).toEqual('message_sent');
        expect(sendWrongAddressEvents[1].bounced).toEqual(true);

        const send = await lpAccount.sendInternalMessage(
            user.getSender(),
            toNano('10000'),
            CommonFunction.resetGasMsg(),
        );
        const sendEvents = send.events as EventMessageSent[];
        expect(sendEvents[1].type).toEqual('message_sent');
        expect(sendEvents[1].bounced).toEqual(false);
    });

});
