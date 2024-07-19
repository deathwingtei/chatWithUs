const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireLogin } = require("../controllers/authController");

router.post('/', requireLogin,chatController.chatRoom);
router.post('/admin', requireLogin,chatController.adminChatRoom);
router.post('/archive_chat', requireLogin,chatController.archiveChat);
router.get('/previous', requireLogin,chatController.previousChat);
router.get('/previous_cus', requireLogin,chatController.previousCustomerChat);
router.get('/get_user_list', requireLogin,chatController.getUserList);

module.exports = router;