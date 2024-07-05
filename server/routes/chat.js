const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireLogin } = require("../controllers/authController");

router.post('/', requireLogin,chatController.chatRoom);
router.get('/previous', requireLogin,chatController.previousChat);

module.exports = router;