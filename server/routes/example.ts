import express from 'express';
import * as exampleController from '../controllers/exampleController';
import { requireLogin } from "../controllers/authController";

const router = express.Router();

router.post('/', requireLogin, exampleController.testMessage2);
router.get('/testnoti', exampleController.testNoti);
router.get('/testemail', exampleController.testEmail);

export default router;
