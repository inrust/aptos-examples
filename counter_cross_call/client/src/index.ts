import { AptosClient, AptosAccount, AptosAccountObject, BCS, TxnBuilderTypes } from "aptos";

const {
    AccountAddress,
    EntryFunction,
    TransactionPayloadEntryFunction,
} = TxnBuilderTypes;

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";

const accountObject: AptosAccountObject = {
    address: "0x43239e71ccc047ea2d3752eba79279cf9d091ecb6a04d8cf5103e1e9ae847958",
    privateKeyHex: "0x66cf8f4f7dd05ef45dab961884f9c3d612d6fbefba978b4d1e607d8d932e507b",
    publicKeyHex: "0x88e8d7ca7febf84b2b5f2a9eddfad05893f15e2b75c163a9123fe8f3e27ec172",
};
const counterStore = `${accountObject.address}::cross_call::SyncCounter`;
const callModuleAddress = "0x9f53ba21527d32dd88e533946b085f9ab813d8ed40c13bbe2c667ea3a7e2b60f";

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
