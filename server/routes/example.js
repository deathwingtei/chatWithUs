const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const { requireLogin } = require("../controllers/authController");

router.post('/', requireLogin,exampleController.testMessage2);

module.exports = router;