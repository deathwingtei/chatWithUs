import express from 'express';
import * as chatController from '../controllers/chatController';
import { requireLogin } from "../controllers/authController";

const router = express.Router();

router.post('/', requireLogin, chatController.chatRoom);
router.post('/admin', requireLogin, chatController.adminChatRoom);
router.post('/archive_chat', requireLogin, chatController.archiveChat);
router.get('/previous', requireLogin, chatController.previousChat);
router.get('/previous_cus', requireLogin, chatController.previousCustomerChat);
router.get('/get_user_list', requireLogin, chatController.getUserList);

export default router;
