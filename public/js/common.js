// Спільні функції для всіх сторінок

// Перевірка авторизації
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');

    if (!token || !userInfo) {
        window.location.href = '/';
        return null;
    }

    return JSON.parse(userInfo);
}

// Отримання ролі користувача
function getRoleDisplayName(role) {
    const roles = {
        'admin': 'Адміністратор',
        'manager': 'Менеджер',
        'employee': 'Співробітник'
    };
    return roles[role] || role;
}

// Перевірка чи користувач може редагувати
function canEdit() {
    const user = checkAuth();
    return user && (user.role === 'admin' || user.role === 'manager');
}

// Вихід з системи
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/';
}

// Ініціалізація інформації про користувача
function initUserInfo() {
    const user = checkAuth();
    if (user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = `(${getRoleDisplayName(user.role)})`;
    }
}

// API запити
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, mergedOptions);
        const data = await response.json();

        if (response.status === 401) {
            logout();
            return;
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showMessage('Помилка підключення до сервера', 'error');
        throw error;
    }
}

// Показ повідомлень
function showMessage(message, type = 'success') {
    // Видаляємо попереднє повідомлення
    const existing = document.querySelector('.message-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `message-toast message-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        z-index: 2000;
        max-width: 300px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        ${type === 'success' ? 'background: #00b894;' : 'background: #d63031;'}
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// Форматування дати
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Форматування ціни
function formatPrice(price) {
    return parseFloat(price || 0).toFixed(2) + ' грн';
}

// Закриття модального вікна
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

// Підтвердження дії
function confirm(message) {
    return window.confirm(message);
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    initUserInfo();
    
    // Закриття модальних вікон при кліку на overlay
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
        if (e.target.classList.contains('close')) {
            closeModal();
        }
    });
});
