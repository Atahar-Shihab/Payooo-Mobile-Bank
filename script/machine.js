function getValueFromInput(id) {

        const inputField = document.getElementById(id);

        return inputField.value;

}

function getBalance() {

    const balanceElement = document.getElementById('balance');

    return Number(balanceElement.innerText);

}


function setBalance(value){
    const balanceElement = document.getElementById('balance');
    balanceElement.innerText = value;

}


function showonly(id) {

    

const addmoney = document.getElementById('add-money');
const cashout = document.getElementById('cashout');
const transactions = document.getElementById('history');
const transfer = document.getElementById('transfer-money');
const paybill = document.getElementById('pay-bill');
const bonus = document.getElementById('get-bonus');




addmoney.classList.add('hidden');
cashout.classList.add('hidden');
transactions.classList.add('hidden');
transfer.classList.add('hidden');
paybill.classList.add('hidden');
bonus.classList.add('hidden');

const selectedSection = document.getElementById(id);
selectedSection.classList.remove('hidden');



}
