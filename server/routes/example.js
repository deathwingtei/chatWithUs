const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

router.post('/', exampleController.testMessage);

module.exports = router;