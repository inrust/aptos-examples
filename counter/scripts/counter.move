script {
    use Counter::counter;

    fun main(account: &signer) {
        counter::increment(account);
    }
}
