// Mobile Navigation Toggle
document.getElementById('nav-toggle').addEventListener('click', function() {
    const navOnMobile = document.getElementById('navOnMobile');
    navOnMobile.style.right ='0';
});

document.getElementById('nav-close').addEventListener('click', function() {
    const navOnMobile = document.getElementById('navOnMobile');
    navOnMobile.style.right = '-229px';
});