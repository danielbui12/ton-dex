import { toNano } from '@ton/core';
import { LpWallet } from '../wrappers/11_LpWallet';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const lpWallet = provider.open(LpWallet.createFromConfig({}, await compile('LpWallet')));

    await lpWallet.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(lpWallet.address);

    // run methods on `lpWallet`
}
