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


addmoney.classList.add('hidden');
cashout.classList.add('hidden');

const selectedSection = document.getElementById(id);
selectedSection.classList.remove('hidden');



}
