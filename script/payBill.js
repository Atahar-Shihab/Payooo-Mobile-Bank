const payBillSection = document.getElementById('pay-bill');
payBillSection.addEventListener('click', function(event) {
    if (event.target.id === 'pay-bill-btn') {
        const biller = getValueFromInput('pay-bill-biller');
        const amount = getValueFromInput('pay-bill-amount');
        const pin = getValueFromInput('pay-bill-pin');
        const currentBalance = getBalance();
        if (biller === 'Select biller') {
            alert('Please select a biller.');
            return;
        }
        if (amount <= 0) {
            alert('Invalid amount. Please enter a positive number.');
            return;
        }
        if (pin !== "0000") {
            alert('Invalid PIN. Please try again.');
            return;
        }
        if (currentBalance < amount) {
            alert('Insufficient balance. Please try again.');
            return;
        }
        const newBalance = currentBalance - amount;
        setBalance(newBalance);
        alert(`Payment successful! You have paid ${amount} Taka to ${biller}. Your new balance is ${newBalance} Taka.`);

        const history = document.getElementById('history-container');

        if (history.innerText === 'No transactions yet.') {
            history.innerText = '';
        }
        history.innerText += `Payment to ${biller}: ${amount} Taka\n`;
        }
    });
    

