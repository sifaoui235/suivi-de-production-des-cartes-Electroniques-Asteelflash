// auth-guard.js
// Remplace onAuthStateChanged(Firebase) par une vérification simple de sessionStorage.

if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'Login.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const logoutLink = document.getElementById('logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', function () {
            sessionStorage.removeItem('isLoggedIn');
        });
    }
});
