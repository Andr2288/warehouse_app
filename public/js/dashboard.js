document.addEventListener('DOMContentLoaded', function() {
    // Перевірка авторизації
    const user = checkAuth();
    if (!user) return;

    // Завантаження даних для dashboard
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Отримуємо базові дані
        const [products, categories, suppliers] = await Promise.all([
            apiRequest('/api/products'),
            apiRequest('/api/categories'),
            apiRequest('/api/suppliers')
        ]);

        // Оновлюємо статистику
        document.getElementById('totalProducts').textContent = products?.data?.length || 0;
        document.getElementById('totalCategories').textContent = categories?.data?.length || 0;
        document.getElementById('totalSuppliers').textContent = suppliers?.data?.length || 0;

        // Підраховуємо товари з малими залишками
        const lowStockProducts = products?.data?.filter(p => p.stock_quantity <= p.min_stock_level) || [];
        document.getElementById('lowStockCount').textContent = lowStockProducts.length;

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Залишаємо значення по замовчуванню
    }
}