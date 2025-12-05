document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    // Перевірка чи користувач вже авторизований
    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = '/dashboard.html';
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Заповніть всі поля');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));

                showSuccess('Успішний вхід! Перенаправлення...');

                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                showError(data.message || 'Помилка авторизації');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Помилка підключення до сервера');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'error-message';
        errorMessage.style.display = 'block';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'success-message';
        errorMessage.style.display = 'block';
    }
});