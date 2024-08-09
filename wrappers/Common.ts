import { Cell } from "@ton/core";
import { Op } from "./Constants";
import { beginMessage } from "../helpers/common";

export class CommonFunction {
    static resetGasMsg(): Cell {
        return beginMessage({ op: Op.reset_gas })
            .endCell();
    }
}