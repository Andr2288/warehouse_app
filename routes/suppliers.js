const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

// Всі маршрути потребують авторизації
router.use(authenticateUser);

// Отримати всіх постачальників
router.get('/', supplierController.getAll);

// Отримати постачальника за ID
router.get('/:id', supplierController.getById);

module.exports = router;
