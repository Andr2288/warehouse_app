let products = [];
let categories = [];
let suppliers = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;

    // Показуємо кнопку додавання для менеджерів та адмінів
    if (canEdit()) {
        document.getElementById('addProductBtn').style.display = 'block';
    }

    // Завантажуємо дані
    loadCategories();
    loadSuppliers();
    loadProducts();

    // События
    document.getElementById('addProductBtn').addEventListener('click', openAddModal);
    document.getElementById('productForm').addEventListener('submit', handleSubmit);
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('lowStockFilter').addEventListener('change', filterProducts);
});

async function loadCategories() {
    try {
        const response = await apiRequest('/api/categories');
        if (response.success) {
            categories = response.data;
            updateCategoryFilters();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadSuppliers() {
    try {
        const response = await apiRequest('/api/suppliers');
        if (response.success) {
            suppliers = response.data;
            updateSupplierOptions();
        }
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

async function loadProducts() {
    try {
        const response = await apiRequest('/api/products');
        if (response.success) {
            products = response.data;
            renderProducts(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function updateCategoryFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const productCategory = document.getElementById('productCategory');
    
    // Очищаємо і додаємо опції
    categoryFilter.innerHTML = '<option value="">Всі категорії</option>';
    productCategory.innerHTML = '<option value="">Оберіть категорію</option>';
    
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        productCategory.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });
}

function updateSupplierOptions() {
    const productSupplier = document.getElementById('productSupplier');
    
    productSupplier.innerHTML = '<option value="">Оберіть постачальника</option>';
    
    suppliers.forEach(supplier => {
        productSupplier.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
    });
}

function renderProducts(productsToRender) {
    const container = document.getElementById('productsTable');
    
    if (productsToRender.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Товари не знайдені</p>';
        return;
    }

    let html = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Категорія</th>
                        <th>Постачальник</th>
                        <th>Ціна</th>
                        <th>На складі</th>
                        <th>Мін. залишок</th>
                        <th>Статус</th>
                        ${canEdit() ? '<th>Дії</th>' : ''}
                    </tr>
                </thead>
                <tbody>
    `;

    productsToRender.forEach(product => {
        const isLowStock = product.stock_quantity <= product.min_stock_level;
        const statusClass = isLowStock ? 'status-low' : 'status-normal';
        const statusText = isLowStock ? 'Мало на складі' : 'В наявності';

        html += `
            <tr>
                <td>
                    <strong>${product.name}</strong>
                    ${product.description ? `<br><small style="color: #666;">${product.description}</small>` : ''}
                </td>
                <td>${product.category_name || 'Без категорії'}</td>
                <td>${product.supplier_name || 'Без постачальника'}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock_quantity}</td>
                <td>${product.min_stock_level}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                ${canEdit() ? `
                    <td>
                        <div class="btn-group">
                            <button onclick="editProduct(${product.id})" class="btn btn-small btn-edit">Редагувати</button>
                            <button onclick="deleteProduct(${product.id})" class="btn btn-small btn-delete">Видалити</button>
                        </div>
                    </td>
                ` : ''}
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryId = document.getElementById('categoryFilter').value;
    const showLowStock = document.getElementById('lowStockFilter').checked;

    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryId || product.category_id == categoryId;
        const matchesLowStock = !showLowStock || product.stock_quantity <= product.min_stock_level;

        return matchesSearch && matchesCategory && matchesLowStock;
    });

    renderProducts(filtered);
}

function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Додати товар';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'flex';
}

async function editProduct(id) {
    try {
        const response = await apiRequest(`/api/products/${id}`);
        if (response.success) {
            const product = response.data;
            editingProductId = id;
            
            document.getElementById('modalTitle').textContent = 'Редагувати товар';
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productCategory').value = product.category_id || '';
            document.getElementById('productSupplier').value = product.supplier_id || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productStock').value = product.stock_quantity || '';
            document.getElementById('productMinStock').value = product.min_stock_level || '';
            
            document.getElementById('productModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showMessage('Помилка при завантаженні товару', 'error');
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const productData = {};
    formData.forEach((value, key) => {
        productData[key] = value;
    });

    try {
        const url = editingProductId 
            ? `/api/products/${editingProductId}`
            : '/api/products';
        const method = editingProductId ? 'PUT' : 'POST';

        const response = await apiRequest(url, {
            method: method,
            body: JSON.stringify(productData)
        });

        if (response.success) {
            showMessage(response.message);
            closeModal();
            loadProducts();
        } else {
            showMessage(response.message || 'Помилка при збереженні', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Помилка при збереженні товару', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) {
        return;
    }

    try {
        const response = await apiRequest(`/api/products/${id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showMessage(response.message);
            loadProducts();
        } else {
            showMessage(response.message || 'Помилка при видаленні', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Помилка при видаленні товару', 'error');
    }
}
