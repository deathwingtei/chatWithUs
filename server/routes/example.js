const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

router.get('/', exampleController.testMessage);

module.exports = router;