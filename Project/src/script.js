function transform() {
    var loginForm = document.getElementById("login-form");
    var btnReverse = document.getElementById("btn-reverse");
    var registrationForm = document.getElementById("signup-form");
    var textReverse = document.getElementById("reverse-text");

    if (parseFloat(getComputedStyle(loginForm).opacity) === 0) {
        loginForm.style.opacity = 1;
        registrationForm.style.opacity = 0;

        textReverse.classList.remove('spin-backwards-text');
        textReverse.classList.add('spin-forwards-text');
        btnReverse.classList.remove('spin-backwards');
        btnReverse.classList.add('spin-forwards');
        textReverse.textContent = "You don't have an account? Click here";
    } else {
        loginForm.style.opacity = 0;
        registrationForm.style.opacity = 1;

        btnReverse.classList.remove('spin-forwards');
        btnReverse.classList.add('spin-backwards');
        textReverse.classList.remove('spin-forwards-text');
        textReverse.classList.add('spin-backwards-text');
        textReverse.textContent = "You already have an account? Click here";
    }
}

document.getElementById('redirectButton').addEventListener('click', function() {
    window.location.href = 'popup.html'; // Change 'target_page.html' to your desired URL
});
