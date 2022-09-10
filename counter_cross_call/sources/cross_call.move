module CounterCrossCall::cross_call {
    use std::signer;
    use Counter::counter;

    struct SyncCounter has key, store {
        val: u8,
    }

    fun init_module(account: &signer) {
        move_to(
            account,
            SyncCounter { val: 0 }
        );
    }

    public entry fun sync(account: &signer, contract_addr: address) acquires SyncCounter {
        let is_exists = counter::is_exists(contract_addr);
        if (is_exists) {
            let syn_val = counter::get_count(contract_addr);

            let addr = signer::address_of(account);
            let val = &mut borrow_global_mut<SyncCounter>(addr).val;
            *val = syn_val;
        }
    }
}
