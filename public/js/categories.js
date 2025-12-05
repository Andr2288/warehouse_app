let categories = [];
let editingCategoryId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;

    // Показуємо кнопку додавання для менеджерів та адмінів
    if (canEdit()) {
        document.getElementById('addCategoryBtn').style.display = 'block';
    }

    // Завантажуємо дані
    loadCategories();

    // Events
    document.getElementById('addCategoryBtn').addEventListener('click', openAddModal);
    document.getElementById('categoryForm').addEventListener('submit', handleSubmit);
});

async function loadCategories() {
    try {
        const response = await apiRequest('/api/categories');
        if (response.success) {
            categories = response.data;
            renderCategories(categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategories(categoriesToRender) {
    const container = document.getElementById('categoriesTable');
    
    if (categoriesToRender.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Категорії не знайдені</p>';
        return;
    }

    let html = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Назва</th>
                        <th>Опис</th>
                        <th>Створена</th>
                        ${canEdit() ? '<th>Дії</th>' : ''}
                    </tr>
                </thead>
                <tbody>
    `;

    categoriesToRender.forEach(category => {
        html += `
            <tr>
                <td><strong>${category.name}</strong></td>
                <td>${category.description || '<em>Без опису</em>'}</td>
                <td>${formatDate(category.created_at)}</td>
                ${canEdit() ? `
                    <td>
                        <div class="btn-group">
                            <button onclick="editCategory(${category.id})" class="btn btn-small btn-edit">Редагувати</button>
                            <button onclick="deleteCategory(${category.id})" class="btn btn-small btn-delete">Видалити</button>
                        </div>
                    </td>
                ` : ''}
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function openAddModal() {
    editingCategoryId = null;
    document.getElementById('modalTitle').textContent = 'Додати категорію';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').style.display = 'flex';
}

async function editCategory(id) {
    try {
        const response = await apiRequest(`/api/categories/${id}`);
        if (response.success) {
            const category = response.data;
            editingCategoryId = id;
            
            document.getElementById('modalTitle').textContent = 'Редагувати категорію';
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';
            
            document.getElementById('categoryModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading category:', error);
        showMessage('Помилка при завантаженні категорії', 'error');
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const categoryData = {};
    formData.forEach((value, key) => {
        categoryData[key] = value;
    });

    try {
        const url = editingCategoryId 
            ? `/api/categories/${editingCategoryId}`
            : '/api/categories';
        const method = editingCategoryId ? 'PUT' : 'POST';

        const response = await apiRequest(url, {
            method: method,
            body: JSON.stringify(categoryData)
        });

        if (response.success) {
            showMessage(response.message);
            closeModal();
            loadCategories();
        } else {
            showMessage(response.message || 'Помилка при збереженні', 'error');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showMessage('Помилка при збереженні категорії', 'error');
    }
}

async function deleteCategory(id) {
    if (!confirm('Ви впевнені, що хочете видалити цю категорію? Всі товари в ній будуть без категорії.')) {
        return;
    }

    try {
        const response = await apiRequest(`/api/categories/${id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showMessage(response.message);
            loadCategories();
        } else {
            showMessage(response.message || 'Помилка при видаленні', 'error');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showMessage('Помилка при видаленні категорії', 'error');
    }
}
