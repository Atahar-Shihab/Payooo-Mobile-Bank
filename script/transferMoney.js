const transferMoneySection = document.getElementById('transfer-money');
transferMoneySection.addEventListener('click', function(event) {
    if (event.target.id === 'transfer-money-btn') {
        const accno = getValueFromInput('transfer-money-number');
        const amount = getValueFromInput('transfer-money-amount');
        const pin = getValueFromInput('transfer-money-pin');
        const currentBalance = getBalance();
    }
});