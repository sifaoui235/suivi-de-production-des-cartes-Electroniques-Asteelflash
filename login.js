// login.js
// Remplace Firebase Authentication par une vérification simple côté client.
// Identifiants de démonstration : adapte-les si besoin.
const VALID_EMAIL = 'admin@asteelflash.com';
const VALID_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loginError.textContent = '';

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
            // sessionStorage : la session est valable tant que l'onglet reste ouvert
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'Dash.html';
        } else {
            loginError.textContent = 'Email ou mot de passe incorrect.';
        }
    });

});
