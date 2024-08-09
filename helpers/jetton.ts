import { Address, Cell } from "@ton/core";

export type InternalTransfer = {
    from: Address | null,
    response: Address | null,
    amount: bigint,
    forwardAmount: bigint,
    payload: Cell | null
};
export type JettonTransfer = {
    to: Address,
    response_address: Address | null,
    amount: bigint,
    custom_payload: Cell | null,
    forward_amount: bigint,
    forward_payload: Cell | null
}

export const parseTransfer = (body: Cell) => {
    const ts = body.beginParse().skip(64 + 32);
    return {
        amount: ts.loadCoins(),
        to: ts.loadAddress(),
        response_address: ts.loadAddressAny(),
        custom_payload: ts.loadMaybeRef(),
        forward_amount: ts.loadCoins(),
        forward_payload: ts.loadMaybeRef()
    }
}
export const parseInternalTransfer = (body: Cell) => {

    const ts = body.beginParse().skip(64 + 32);

    return {
        amount: ts.loadCoins(),
        from: ts.loadAddressAny(),
        response: ts.loadAddressAny(),
        forwardAmount: ts.loadCoins(),
        payload: ts.loadMaybeRef()
    };
};
type JettonTransferNotification = {
    amount: bigint,
    from: Address | null,
    payload: Cell | null
}
export const parseTransferNotification = (body: Cell) => {
    const bs = body.beginParse().skip(64 + 32);
    return {
        amount: bs.loadCoins(),
        from: bs.loadAddressAny(),
        payload: bs.loadMaybeRef()
    }
}

type JettonBurnNotification = {
    amount: bigint,
    from: Address,
    response_address: Address | null,
}
export const parseBurnNotification = (body: Cell) => {
    const ds = body.beginParse().skip(64 + 32);
    const res = {
        amount: ds.loadCoins(),
        from: ds.loadAddress(),
        response_address: ds.loadAddressAny(),
    };

    return res;
}

const testPartial = (cmp: any, match: any) => {
    for (let key in match) {
        if (!(key in cmp)) {
            throw Error(`Unknown key ${key} in ${cmp}`);
        }

        if (match[key] instanceof Address) {
            if (!(cmp[key] instanceof Address)) {
                return false
            }
            if (!(match[key] as Address).equals(cmp[key])) {
                return false
            }
        }
        else if (match[key] instanceof Cell) {
            if (!(cmp[key] instanceof Cell)) {
                return false;
            }
            if (!(match[key] as Cell).equals(cmp[key])) {
                return false;
            }
        }
        else if (match[key] !== cmp[key]) {
            return false;
        }
    }
    return true;
}
export const testJettonBurnNotification = (body: Cell, match: Partial<JettonBurnNotification>) => {
    const res = parseBurnNotification(body);
    return testPartial(res, match);
}

export const testJettonTransfer = (body: Cell, match: Partial<JettonTransfer>) => {
    const res = parseTransfer(body);
    return testPartial(res, match);
}
export const testJettonInternalTransfer = (body: Cell, match: Partial<InternalTransfer>) => {
    const res = parseInternalTransfer(body);
    return testPartial(res, match);
};
export const testJettonNotification = (body: Cell, match: Partial<JettonTransferNotification>) => {
    const res = parseTransferNotification(body);
    return testPartial(res, match);
}
