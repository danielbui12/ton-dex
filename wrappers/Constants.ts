export abstract class Op {
    // Jetton Wallet
    static transfer = 0xf8a7ea5;
    static transfer_notification = 0x7362d09c;
    static internal_transfer = 0x178d4519;
    static excesses = 0xd53276db;
    static burn = 0x595f07bc;
    static burn_notification = 0x7bdd97de;

    // Jetton Minter
    static provide_wallet_address = 0x2c76b973;
    static take_wallet_address = 0xd1735400;
    static mint = 21;
    static change_admin = 3;
    static change_content = 4;

    // LP account
    static reset_gas = 0x42a0fb43;
    static add_liquidity = 0x3ebe5431;
    static cb_add_liquidity = 0x56dfeb8a;
    static getter_lp_account_data = 0x1d439ae0;
    static direct_add_liquidity = 0x4cf82803;
    static refund_me = 0xbf3f447;
    static cb_refund_me = 0x89446a42;
    static swap = 0x25938561;
    static provide_lp = 0xfcf9e58f;
    static pay_to = 0xf93bb43f;
    static swap_refund_no_liq = 0x5ffe1295;
    static swap_refund_reserve_err = 0x38976e9b;
    static swap_ok_ref = 0x45078540;
    static swap_ok = 0xc64370e5;
    static burn_ok = 0xdda48b6a;
    static refund_ok = 0xde7dbbc2;
    static collect_fees = 0x1fcb7d3d;
    static set_fees = 0x355423e5;
    static getter_pool_data = 0x43c034e6;
    static getter_expected_outputs = 0xed4d8b67;
    static getter_lp_account_address = 0x9163a98a;
    static getter_expected_tokens = 0x9ce632c5;
    static getter_expected_liquidity = 0x8751801f;

    // Router
    static reset_pool_gas = 0xf6aa9737;
    static lock = 0x878f9b0e;
    static unlock = 0x6ae4b0ef;

    static init_code_upgrade = 0xdf1e233d;
    static init_admin_upgrade = 0x2fb94384;
    static cancel_code_upgrade = 0x357ccc67;
    static cancel_admin_upgrade = 0xa4ed9981;
    static finalize_upgrades = 0x6378509f;

    static getter_pool_address = 0xd1db969b;

    static transfer_bounce_locked = 0xa0dbdcb;
    static transfer_bounce_invalid_request = 0x19727ea8;
}

export abstract class Errors {
    // Jetton errors
    static wrong_op = 0xffff;

    // lp account
    static no_liquidity = 80;
    static zero_output = 81;
    static invalid_caller = 82;
    static insufficient_gas = 83;
    static wrong_workchain = 85;

    // pool
    static fee_out_range = 85;
    static invalid_token = 86;
    static low_amount = 87;
    static low_liquidity = 88;
    static wrong_k = 89;
    static math_error = 90;
    static invalid_recipient = 91;

    // router
    static wrong_address = 86;
    static invalid_amount = 87;
    static invalid_call = 88
}


