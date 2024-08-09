require('dotenv').config();
import { Address, fromNano, OpenedContract, toNano } from '@ton/core';
import { NetworkProvider, UIProvider } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';
import { JettonWallet } from '../wrappers/11_LpWallet';
import { promptBool, promptAmount, promptAddress, displayContentCell, waitForTransaction } from '../wrappers/ui-utils';
import { waitForStateChange } from './utils';

let minterContract: OpenedContract<JettonMinter>;

const adminActions = ['Mint', 'Change admin'];
const userActions = ['Transfer', 'Info', 'Quit'];

const failedTransMessage = (ui: UIProvider) => {
    ui.write("Failed to get indication of transaction completion from API!\nCheck result manually, or try again\n");

};

const infoAction = async (provider: NetworkProvider, ui: UIProvider) => {
    const jettonData = await minterContract.getJettonData();
    ui.write("Jetton info:\n\n");
    ui.write(`Admin:${jettonData.adminAddress}\n`);
    ui.write(`Total supply:${fromNano(jettonData.totalSupply)}\n`);
    ui.write(`Mintable:${jettonData.mintable}\n`);
    const displayContent = await ui.choose('Display content?', ['yes', 'no'], (c) => c);
    if (displayContent == 'yes') {
        displayContentCell(jettonData.content, ui);
    }
};

const changeAdminAction = async (provider: NetworkProvider, ui: UIProvider) => {
    let retry: boolean;
    let newAdmin: Address;
    let curAdmin = await minterContract.getAdminAddress();
    do {
        retry = false;
        newAdmin = await promptAddress('Please specify new admin address:', ui);
        if (newAdmin.equals(curAdmin)) {
            retry = true;
            ui.write("Address specified matched current admin address!\nPlease pick another one.\n");
        }
        else {
            ui.write(`New admin address is going to be:${newAdmin}\nKindly double check it!\n`);
            retry = !(await promptBool('Is it ok?', ['yes', 'no'], ui));
        }
    } while (retry);

    const isDeployed = await provider.isContractDeployed(minterContract.address);
    if (!isDeployed)
        throw ("Contract isn't deployed yet.");

    await minterContract.sendChangeAdmin(provider.sender(), newAdmin);
    const transDone = await waitForTransaction(provider,
        minterContract.address,
        null,
        10
    );
    if (transDone) {
        const adminAfter = await waitForStateChange(ui, async () => await minterContract.getAdminAddress());
        if (adminAfter.equals(newAdmin)) {
            ui.write("Admin changed successfully");
        } else {
            ui.write("Admin address hasn't changed!\nSomething went wrong!\n");
        }
    }
    else {
    }
};

const mintAction = async (provider: NetworkProvider, ui: UIProvider) => {
    const sender = provider.sender();
    let retry: boolean;
    let mintAddress: Address;
    let mintAmount: string;

    do {
        retry = false;
        const fallbackAddr = sender.address ?? await minterContract.getAdminAddress();
        mintAddress = await promptAddress(`Please specify address to mint to`, ui, fallbackAddr);
        mintAmount = await promptAmount('Please provide mint amount in decimal form:', ui);
        ui.write(`Mint ${mintAmount} tokens to ${mintAddress}\n`);
        retry = !(await promptBool('Is it ok?', ['yes', 'no'], ui));
    } while (retry);

    const totalSupplyBefore = await minterContract.getTotalSupply();
    ui.write(`Minting ${mintAmount} to ${mintAddress}\n`);
    const mintAddressJWallet = await minterContract.getWalletAddress(mintAddress);
    const jWallet = provider.open(JettonWallet.createFromAddress(mintAddressJWallet));

    const nanoMint = toNano(mintAmount);
    const isDeployed = await provider.isContractDeployed(minterContract.address);

    if (!isDeployed)
        throw ("Contract is not deployed yet!");

    await minterContract.sendMint(sender,
        mintAddress,
        nanoMint,
        toNano('0.05'),
        toNano('0.1'));
    const gotTrans = await waitForTransaction(provider,
        minterContract.address,
        null,
        10
    );
    if (gotTrans) {
        ui.write('Transaction submitted.');

        const totalSupply = await waitForStateChange(
            ui,
            async () => await minterContract.getTotalSupply()
        )
        const balance = await waitForStateChange(
            ui,
            async () => await jWallet.getJettonBalance()
        )

        if (totalSupply === totalSupplyBefore + nanoMint) {
            ui.write("Mint successfull!\nCurrent supply: " + fromNano(totalSupply));
            ui.write("Balance: " + fromNano(balance));
        } else {
            ui.write("Mint failed!\nCurrent supply: " + fromNano(totalSupply));
        }
    } else {
        failedTransMessage(ui);
    }
}

const transferAction = async (provider: NetworkProvider, ui: UIProvider) => {
    const sender = provider.sender();
    let retry: boolean;
    let toAddress: Address;
    let toAmount: string;

    do {
        retry = false;
        toAddress = await promptAddress(`Please specify address to transfer to`, ui);
        toAmount = await promptAmount('Please provide transfer amount without decimals:', ui);
        ui.write(`transfer ${toAmount} tokens to ${toAddress}\n`);
        retry = !(await promptBool('Is it ok?', ['yes', 'no'], ui));
    } while (retry);

    ui.write(`Transferring ${toAmount} to ${toAddress}\n`);
    const senderJWalletAddress = await minterContract.getWalletAddress(sender.address!);
    const senderJWallet = provider.open(JettonWallet.createFromAddress(senderJWalletAddress));

    const receiverJWalletAddress = await minterContract.getWalletAddress(toAddress);
    const receiverJWallet = provider.open(JettonWallet.createFromAddress(receiverJWalletAddress));

    const nanoTransfer = toNano(toAmount);
    const isDeployed = await provider.isContractDeployed(minterContract.address);

    if (!isDeployed)
        throw ("Contract is not deployed yet!");

    await senderJWallet.sendTransfer(
        sender,
        toNano('0.1'), //tons
        nanoTransfer,
        toAddress,
        sender.address!,
        null,
        toNano('0.05'),
        null
    );

    const gotTrans = await waitForTransaction(provider,
        senderJWallet.address,
        null,
        10
    );

    if (gotTrans) {
        ui.write('Transaction submitted.');

        const senderBalance = await waitForStateChange(
            ui,
            async () => await senderJWallet.getJettonBalance()
        )
        const receiverBalance = await waitForStateChange(
            ui,
            async () => await receiverJWallet.getJettonBalance()
        )

        ui.write("Sender balance: " + fromNano(senderBalance));
        ui.write("Receiver Balance: " + fromNano(receiverBalance));

    } else {
        failedTransMessage(ui);
    }
}

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const sender = provider.sender();
    const hasSender = sender.address !== undefined;
    let done = false;
    let retry: boolean;
    let minterAddress: Address;

    do {
        retry = false;
        minterAddress = await promptAddress('Please enter minter address:', ui);
        const contractState = await provider.isContractDeployed(minterAddress);
        if (!contractState) {
            retry = true;
            ui.write("This contract is not active!\nPlease use another address, or deploy it first\n");
        }
    } while (retry);

    minterContract = provider.open(JettonMinter.createFromAddress(minterAddress));
    const isAdmin = hasSender ? (await minterContract.getAdminAddress()).equals(sender.address) : true;
    let actionList: string[];
    if (isAdmin) {
        actionList = [...adminActions, ...userActions];
        ui.write("Current wallet is minter admin!\n");
    }
    else {
        actionList = userActions;
        ui.write("Current wallet is not admin!\nAvaliable actions restricted\n");
    }

    do {
        const action = await ui.choose("Pick action:", actionList, (c) => c);
        switch (action) {
            case 'Mint':
                await mintAction(provider, ui);
                break;
            case 'Change admin':
                await changeAdminAction(provider, ui);
                break;
            case 'Transfer':
                await transferAction(provider, ui);
                break;
            case 'Info':
                await infoAction(provider, ui);
                break;
            case 'Quit':
                done = true;
                break;
        }
    } while (!done);
}
