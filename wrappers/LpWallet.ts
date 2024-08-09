import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type LpWalletConfig = {};

export function lpWalletConfigToCell(config: LpWalletConfig): Cell {
    return beginCell().endCell();
}

export class LpWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new LpWallet(address);
    }

    static createFromConfig(config: LpWalletConfig, code: Cell, workchain = 0) {
        const data = lpWalletConfigToCell(config);
        const init = { code, data };
        return new LpWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
