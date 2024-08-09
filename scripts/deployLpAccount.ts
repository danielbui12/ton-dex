import { toNano } from '@ton/core';
import { LpAccount } from '../wrappers/LpAccount';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const lpAccount = provider.open(LpAccount.createFromConfig({}, await compile('LpAccount')));

    await lpAccount.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(lpAccount.address);

    // run methods on `lpAccount`
}
