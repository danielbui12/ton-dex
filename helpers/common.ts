import { Builder, beginCell } from "@ton/ton";
import { Address, toNano } from "@ton/core";

export const zeroAddress = new Address(0, Buffer.alloc(32, 0));

export const randomAddress = (wc: number = 0) => {
    const buf = Buffer.alloc(32);
    for (let i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 256);
    }
    return new Address(wc, buf);
};

export const differentAddress = (old: Address) => {
    let newAddr: Address;
    do {
        newAddr = randomAddress(old.workChain);
    } while (newAddr.equals(old));

    return newAddr;
}

const getRandom = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

export const getRandomInt = (min: number, max: number) => {
    return Math.round(getRandom(min, max));
}

export const getRandomTon = (min: number, max: number): bigint => {
    return toNano(getRandom(min, max).toFixed(9));
}

export function beginMessage(params: { op: bigint | number }): Builder {
    return beginCell()
        .storeUint(params.op, 32)
        .storeUint(
            Math.floor(Math.random() * Math.pow(2, 31)), // query id
            64
        );
}
