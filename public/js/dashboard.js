document.addEventListener('DOMContentLoaded', function() {
    // Перевірка авторизації
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');

    if (!token || !userInfo) {
        window.location.href = '/';
        return;
    }

    const user = JSON.parse(userInfo);
    
    // Відображення інформації про користувача
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = `(${getRoleDisplayName(user.role)})`;

    // Завантаження даних для dashboard
    loadDashboardData();
});

function getRoleDisplayName(role) {
    const roles = {
        'admin': 'Адміністратор',
        'manager': 'Менеджер',
        'employee': 'Співробітник'
    };
    return roles[role] || role;
}

async function loadDashboardData() {
    const token = localStorage.getItem('authToken');
    
    try {
        // Тут буде завантаження статистики після реалізації API
        console.log('Dashboard data loading...');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/';
}
