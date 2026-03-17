document.getElementById('login-btn').addEventListener('click', function() {
    const numberInput = document.getElementById('input-number');
    const number = numberInput.value;
    console.log(number);
    

    const pinInput = document.getElementById('input-pin');
    const pin = pinInput.value;
    console.log(pin);

    if (number === '00000000000' && pin === '0000') {
       alert('Login successful! Welcome to Payooo Mobile Bank.');
       window.location.assign('/home.html');
        
    } else {
        alert('Invalid mobile number or pin. Please try again.');
        return;
    }
});

