//! This contract implements simple counter backed by storage on blockchain.
//!
//! The contract provides methods to [increment] / [decrement] counter and
//! get it's current value [get_num] or [reset].
module Counter::counter {
    use std::signer;

    struct Counter has key, store {
        val: u8,
    }

    fun init_module(account: &signer) {
        move_to(
            account,
            Counter { val: 0 }
        );
    }

    /// Return the counter value
    public fun get_count(addr: address): u8 acquires Counter {
        borrow_global<Counter>(addr).val
    }

    /// Increment the counter
    public entry fun increment(account: &signer) acquires Counter {
        let addr = signer::address_of(account);
        let val = &mut borrow_global_mut<Counter>(addr).val;
        *val = *val + 1;
    }

    /// Reset to zero
    public entry fun reset(account: &signer) acquires Counter {
        let addr = signer::address_of(account);
        let val = &mut borrow_global_mut<Counter>(addr).val;
        *val = 0;
    }

    /// Delete the `Counter` resource under `account` and return its value
    public entry fun delete(account: &signer): u8 acquires Counter {
        let addr = signer::address_of(account);
        let c = move_from<Counter>(addr);
        let Counter { val } = c;
        val
    }

    /// Determine if a resource exists
    public fun is_exists(addr: address): bool {
        exists<Counter>(addr)
    }

    #[test(account = @0xC0FFEE)]
    fun test_init(account: signer) acquires Counter {
        init_module(&account);

        let addr = signer::address_of(&account);
        assert!(get_count(addr) == 0, 0);
    }

    #[test(account = @0xC0FFEE)]
    fun test_increment(account: signer) acquires Counter {
        init_module(&account);

        let addr = signer::address_of(&account);
        increment(&account);
        increment(&account);
        increment(&account);
        assert!(get_count(addr) == 3, 0);
    }

    #[test(account = @0xC0FFEE)]
    fun test_increment_and_reset(account: signer) acquires Counter {
        init_module(&account);

        let addr = signer::address_of(&account);
        increment(&account);
        increment(&account);
        increment(&account);
        reset(&account);
        assert!(get_count(addr) == 0, 0);
    }
}
