import { AptosClient, AptosAccount, AptosAccountObject } from "aptos";

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com";

const accountObject: AptosAccountObject = {
    address: "0x5dfe0e93eed9c2b1bb6bce2c2d2eda1345cbb222a4b5ab4fde6aa35d6540db21",
    privateKeyHex: "0xdd8789da35d3769c17be943f5426b2cb9e7bd889b91cdd64dd12e72c7f2de7a7",
    publicKeyHex: "0xaeb063fcbfb7aca97749d97616951aedfc7bae33855ea7dfd707b23c43c9fc98",
};
const counterStore = `${accountObject.address}::counter::Counter`;

(async () => {
    const client = new AptosClient(NODE_URL);
    const account = AptosAccount.fromAptosAccountObject(accountObject);

    let resources = await client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === counterStore);
    let val = parseInt((accountResource?.data as any).val);
    console.log(`account resource Counter: ${val}.`);

    const payload: { function: string; arguments: string[]; type: string; type_arguments: any[] } = {
        type: "script_function_payload",
        function: `${accountObject.address}::counter::increment`,
        type_arguments: [],
        arguments: []
    };

    const txn_request = await client.generateTransaction(account.address(), payload, { max_gas_amount: "2000" });
    const signed_txn = await client.signTransaction(account, txn_request);
    const res = await client.submitTransaction(signed_txn);
    await client.waitForTransaction(res["hash"]);
    console.log(`increment transaction: ${res["hash"]}.`);

    resources = await client.getAccountResources(account.address());
    accountResource = resources.find((r) => r.type === counterStore);
    val = parseInt((accountResource?.data as any).val);
    console.log(`account resource Counter: ${val}.`);
})();
