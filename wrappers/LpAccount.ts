import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { Op } from './Constants';
import { beginMessage } from '../helpers/common';

export type LpAccountConfig = {
    user: Address;
    pool: Address;
    stored0: bigint;
    stored1: bigint;
};

export function lpAccountConfigToCell(config: LpAccountConfig): Cell {
    return beginCell()
        .storeAddress(config.user)
        .storeAddress(config.pool)
        .storeCoins(config.stored0)
        .storeCoins(config.stored1)
        .endCell();
}

export class LpAccount implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendInternalMessage(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body,
        });
    }

    static createFromAddress(address: Address) {
        return new LpAccount(address);
    }

    static createFromConfig(config: LpAccountConfig, code: Cell, workchain = 0) {
        const data = lpAccountConfigToCell(config);
        const init = { code, data };
        return new LpAccount(contractAddress(workchain, init), init);
    }

    static addLiquidityMsg(params: {
        newAmount0: bigint;
        newAmount1: bigint;
        minLPOut: bigint;
    }): Cell {
        return beginMessage({ op: Op.add_liquidity })
            .storeCoins(params.newAmount0)
            .storeCoins(params.newAmount1)
            .storeCoins(params.minLPOut)
            .endCell();
    }

    static directAddLiquidityMsg(params: {
        amount0: number;
        amount1: number;
        minLPOut: number;
    }): Cell {
        return beginMessage({ op: Op.direct_add_liquidity })
            .storeCoins(params.amount0)
            .storeCoins(params.amount1)
            .storeCoins(params.minLPOut)
            .endCell();
    }

    static refundMeMsg(): Cell {
        return beginMessage({ op: Op.refund_me })
            .endCell();
    }


    static getLPAccountDataMsg(): Cell {
        return beginMessage({ op: Op.getter_lp_account_data })
            .endCell();
    }


}
