import { AptosClient, AptosAccount, AptosAccountObject } from "aptos";

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";

const accountObject: AptosAccountObject = {
    address: "0x2780fe38b9e3a5a92cb56190aab75d4fa63a01d24c777810e2e4fb0a320deb9d",
    privateKeyHex: "0xaa1507a6e87e39d558b1f3fb9359585e6aa9cadcbe8a2cb71dfa91f6809880ff",
    publicKeyHex: "0xf515928a64f2f9149597c55c4557f1f3c56a36560811bd515375bb8713ebcc92",
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
