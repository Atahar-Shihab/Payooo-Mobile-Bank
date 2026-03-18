document.getElementById('cashout-btn').addEventListener('click', function() {
    const cashoutnumberInput = document.getElementById("cashout-number");
    const cashoutnumber = cashoutnumberInput.value;

    if (cashoutnumber.length != 11) {
        alert('Invalid mobile number. Please try again.');
        return;
    }

    const cashoutamountInput = document.getElementById('cashout-amount');
    const cashoutamount = cashoutamountInput.value;
   
    const balanceElement = document.getElementById('balance');
    const balance = balanceElement.innerText;

    const newBalance = Number(balance) - Number(cashoutamount);


    if(newBalance < 0) {
        alert('Insufficient balance. Please try again.');
        return;
    }

    const cashoutPinInput = document.getElementById('cashout-pin');
    const pin = cashoutPinInput.value;
    if (pin === '0000') {
        alert(`Cashout successful! You have withdrawn ${cashoutamount} Taka. Your new balance is ${newBalance} Taka.`);
        document.getElementById('balance').innerText = newBalance;

                const history = document.getElementById('history-container');

        if (history.innerText === 'No transactions yet.') {
            history.innerText = '';
        }

        


        const newHistory = document.createElement('div');
        newHistory.innerHTML = `
        <div class="transaction-card p-5 bg-base-100">
        Cashout from ${cashoutnumber} at ${new Date().toLocaleString()}. Amount: ${cashoutamount} Taka. New balance: ${newBalance} Taka.
        
        </div>


        `;
        history.append(newHistory);
    } else {
        alert('Invalid pin. Please try again.');
        return;
    }

});