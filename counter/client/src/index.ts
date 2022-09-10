import { AptosClient, AptosAccount, AptosAccountObject } from "aptos";

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";

const accountObject: AptosAccountObject = {
    address: "0x9f53ba21527d32dd88e533946b085f9ab813d8ed40c13bbe2c667ea3a7e2b60f",
    privateKeyHex: "0x29f4c504c2b36cdf7b7de6671689616ec9309ccdeddef37a4f90b87b16de936a",
    publicKeyHex: "0xf18043587ad20acd5df1f8d16595d09079dd04e58df5a0943f60eaabb28f39ad",
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

    const txn_request = await client.generateTransaction(account.address(), payload);
    const signed_txn = await client.signTransaction(account, txn_request);
    const res = await client.submitTransaction(signed_txn);
    await client.waitForTransaction(res["hash"]);
    console.log(`increment transaction: ${res["hash"]}.`);

    resources = await client.getAccountResources(account.address());
    accountResource = resources.find((r) => r.type === counterStore);
    val = parseInt((accountResource?.data as any).val);
    console.log(`account resource Counter: ${val}.`);
})();
