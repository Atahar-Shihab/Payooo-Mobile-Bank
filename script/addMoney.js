document.getElementById("add-money-btn").addEventListener('click', function() {

    const bankAccount = getValueFromInput('add-money-bank');

    if (bankAccount === 'Select bank') {
        alert('Please select a bank account.');
        return;
    }

    const accno = getValueFromInput('add-money-number');
    if (accno.length != 11) {
        alert('Invalid account number. Please try again.');
        return;
    }


    const amount = getValueFromInput('add-money-amount');
    if (isNaN(amount) || amount <= 0) {
        alert('Invalid amount. Please enter a positive number.');
        return;
    }
    const pin = getValueFromInput('add-money-pin');
    if (pin !== "0000") {
        alert('Invalid PIN. Please try again.');
        return;
    }
    else {
        const currentBalance = getBalance();
        const newBalance = currentBalance + Number(amount);
        setBalance(newBalance);
        alert(`Money added successfully! from ${bankAccount} bank at ${new Date().toLocaleString()}. Amount: ${amount} Taka. Account number: ${accno}. New balance: ${newBalance} Taka.`);






        const history = document.getElementById('history-container');

        if (history.innerText == 'No transactions yet.') {
            console.log('No transactions yet.');
            history.innerText = '';
        }

        


        const newHistory = document.createElement('div');
        newHistory.innerHTML = `
        <div class="transaction-card p-5 bg-base-100">

        Add Money Success from ${bankAccount} bank at ${new Date().toLocaleString()}. Amount: ${amount} Taka. Account number: ${accno}. New balance: ${newBalance} Taka.
        </div>


        `;
        history.append(newHistory);
    



    }
    



    

});