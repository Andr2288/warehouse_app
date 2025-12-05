-- Тестові дані для warehouse_db
USE warehouse_db;

-- Очистка таблиць
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE products;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Користувачі (пароль: 123456)
INSERT INTO users (name, email, password, role) VALUES
                                                    ('Адміністратор', 'admin@warehouse.com', '$2b$10$K8jrQJWcZ8vZ2vQJWcZ8vOeKjrQJWcZ8vZ2vQJWcZ8vOeKjrQJWc', 'admin'),
                                                    ('Менеджер Петро', 'manager@warehouse.com', '$2b$10$K8jrQJWcZ8vZ2vQJWcZ8vOeKjrQJWcZ8vZ2vQJWcZ8vOeKjrQJWc', 'manager'),
                                                    ('Співробітник Марія', 'employee@warehouse.com', '$2b$10$K8jrQJWcZ8vZ2vQJWcZ8vOeKjrQJWcZ8vZ2vQJWcZ8vOeKjrQJWc', 'employee');

-- Категорії
INSERT INTO categories (name, description) VALUES
    ('Електроніка', 'Комп\'ютери, телефони, планшети'),
('Меблі', 'Офісні та домашні меблі'),
('Канцелярія', 'Папір, ручки, степлери'),
('Інструменти', 'Ручні та електричні інструменти'),
('Матеріали', 'Будівельні та виробничі матеріали');

-- Постачальники
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('ТехноСвіт', 'Іванов Іван', '+380501234567', 'info@technoworld.ua', 'м. Київ, вул. Технічна 15'),
('МебліПлюс', 'Петренко Ольга', '+380671234567', 'sales@mebliplus.ua', 'м. Львів, вул. Меблева 22'),
('ОфісТорг', 'Сидоренко Микола', '+380931234567', 'office@ofistorg.ua', 'м. Харків, вул. Офісна 8'),
('ІнструментБуд', 'Коваленко Світлана', '+380991234567', 'tools@instrumentbud.ua', 'м. Дніпро, вул. Будівельна 45');

-- Товари
INSERT INTO products (name, description, category_id, supplier_id, price, stock_quantity, min_stock_level) VALUES
-- Електроніка
('Ноутбук Lenovo', 'Ноутбук для офісної роботи', 1, 1, 25000.00, 5, 2),
('Монітор Samsung 24"', 'LED монітор для робочого місця', 1, 1, 8500.00, 12, 3),
('Клавіатура бездротова', 'Bluetooth клавіатура', 1, 1, 1200.00, 25, 5),

-- Меблі
     ('Стіл офісний', 'Стіл для комп\'ютера 120x60см', 2, 2, 4500.00, 8, 2),
('Крісло офісне', 'Ергономічне крісло з підлокітниками', 2, 2, 6500.00, 15, 3),
('Шафа для документів', 'Металева шафа з замком', 2, 2, 8900.00, 4, 1),

-- Канцелярія
('Папір А4', 'Білий папір для друку, 500 аркушів', 3, 3, 180.00, 50, 10),
('Ручка кулькова синя', 'Одноразова ручка', 3, 3, 15.00, 200, 50),
('Степлер', 'Металевий степлер №10', 3, 3, 85.00, 20, 5),

-- Інструменти
('Дриль електричний', 'Ударний дриль 600Вт', 4, 4, 2800.00, 6, 2),
('Набір викруток', 'Викрутки хрестові та плоскі 12шт', 4, 4, 450.00, 15, 3);

-- Рух товарів (приходи)
INSERT INTO stock_movements (product_id, user_id, type, quantity, price, note) VALUES
-- Прихід товарів
(1, 1, 'in', 10, 24000.00, 'Початкове завезення ноутбуків'),
(2, 1, 'in', 15, 8200.00, 'Поставка моніторів'),
(3, 1, 'in', 30, 1150.00, 'Клавіатури оптом'),
(4, 2, 'in', 10, 4300.00, 'Офісні столи'),
(5, 2, 'in', 20, 6200.00, 'Крісла для офісу'),
(7, 3, 'in', 100, 170.00, 'Папір А4 велика партія'),
(8, 3, 'in', 500, 12.00, 'Ручки оптом'),

-- Витрати товарів
(1, 2, 'out', 5, 25000.00, 'Продаж ноутбуків відділу IT'),
(2, 2, 'out', 3, 8500.00, 'Монітори для нових робочих місць'),
(3, 3, 'out', 5, 1200.00, 'Клавіатури для співробітників'),
(7, 3, 'out', 50, 180.00, 'Витрата паперу за місяць'),
(8, 3, 'out', 300, 15.00, 'Ручки для офісу');

-- Перевірка підсумків
SELECT
    p.name,
    p.stock_quantity as 'Поточний залишок',
    COALESCE(SUM(CASE WHEN sm.type = 'in' THEN sm.quantity ELSE 0 END), 0) as 'Всього прийнято',
    COALESCE(SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END), 0) as 'Всього видано',
    (COALESCE(SUM(CASE WHEN sm.type = 'in' THEN sm.quantity ELSE 0 END), 0) -
     COALESCE(SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END), 0)) as 'Розрахований залишок'
FROM products p
LEFT JOIN stock_movements sm ON p.id = sm.product_id
GROUP BY p.id, p.name, p.stock_quantity
ORDER BY p.name;