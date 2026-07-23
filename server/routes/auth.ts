import express from "express";
import * as authController from "../controllers/authController";
import { requireLogin } from "../controllers/authController";

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/google', authController.googleAuth);
router.post('/password/update', requireLogin, authController.changePassword);
router.post('/profile/update', requireLogin, authController.updateProfile);
router.post('/gennewtoken', requireLogin, authController.generateNewToken);
router.get('/verifyuser', authController.verifyToken);

export default router;
