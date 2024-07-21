const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const { requireLogin } = require("../controllers/authController");

router.post('/', requireLogin,exampleController.testMessage2);
router.get('/testnoti', exampleController.testNoti);
router.get('/testemail', exampleController.testEmail);

module.exports = router;