import { AptosClient, AptosAccount, AptosAccountObject, BCS, TxnBuilderTypes } from "aptos";

const {
    AccountAddress,
    EntryFunction,
    TransactionPayloadEntryFunction,
} = TxnBuilderTypes;

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com";

const accountObject: AptosAccountObject = {
    address: "0x45538d67a76e355d0cd0588631b80f81819dc5daa770f82917030cea98a2b76d",
    privateKeyHex: "0xb603ea8fd2e3c922596585cfb43f8352e8c037ef5663709ee0a2f5844a5c21ad",
    publicKeyHex: "0xd3c0a188f1af4d2ae40aa9b410931086496f3afbf2acfe541aa17865c49f670a",
};
const counterStore = `${accountObject.address}::cross_call::SyncCounter`;
const callModuleAddress = "0x5dfe0e93eed9c2b1bb6bce2c2d2eda1345cbb222a4b5ab4fde6aa35d6540db21";

(async () => {
    const client = new AptosClient(NODE_URL);
    const contractAccount = AptosAccount.fromAptosAccountObject(accountObject);

    let resources = await client.getAccountResources(contractAccount.address());
    let accountResource = resources.find((r) => r.type === counterStore);
    let val = parseInt((accountResource?.data as any).val);
    console.log(`account resource Counter: ${val}.`);

    const entryFunctionPayload = new TransactionPayloadEntryFunction(
        EntryFunction.natural(
            // Fully qualified module name, `AccountAddress::ModuleName`
            `${accountObject.address}::cross_call`,
            // Module function
            "sync",
            // The coin type to transfer
            [],
            // Arguments for function `transfer`: receiver account address and amount to transfer
            [BCS.bcsToBytes(AccountAddress.fromHex(callModuleAddress))],
        ),
    );

    const rawTxn = await client.generateRawTransaction(contractAccount.address(), entryFunctionPayload);
    const bcsTxn = AptosClient.generateBCSTransaction(contractAccount, rawTxn);
    const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);
    await client.waitForTransaction(transactionRes.hash);
    console.log(`sync transaction: ${transactionRes.hash}.`);

    resources = await client.getAccountResources(contractAccount.address());
    accountResource = resources.find((r) => r.type === counterStore);
    val = parseInt((accountResource?.data as any).val);
    console.log(`account resource Counter: ${val}.`);
})();
