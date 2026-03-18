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