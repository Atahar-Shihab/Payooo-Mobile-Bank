const getBonusSection = document.getElementById('get-bonus');
getBonusSection.addEventListener('click', function(event) {
    if (event.target.id === 'get-bonus-btn') {
        const amount = getValueFromInput('get-bonus-amount');
        const pin = getValueFromInput('get-bonus-pin');
        const currentBalance = getBalance();
        if (amount <= 0) {
            alert('Invalid amount. Please enter a positive number.');
            return;
        }
        if (pin !== "0000") {
            alert('Invalid PIN. Please try again.');
            return;
        }
        const newBalance = currentBalance + amount;
        setBalance(newBalance);
        alert(`Bonus received! You have received ${amount} Taka. Your new balance is ${newBalance} Taka.`);

        const history = document.getElementById('history-container');

        if (history.innerText === 'No transactions yet.') {
            history.innerText = '';
        }
        history.innerText += `Bonus received: ${amount} Taka\n`;
    }
});