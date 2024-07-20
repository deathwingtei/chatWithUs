const express=require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireLogin } = require("../controllers/authController");

router.post('/login',authController.login);
router.post('/register',authController.register);
router.post('/google',authController.googleAuth);
router.post('/password/update',requireLogin,authController.changePassword);
router.post('/profile/update',requireLogin,authController.updateProfile);
router.post('/gennewtoken',requireLogin,authController.generateNewToken);
router.get('/verifyuser',authController.verifyToken);


module.exports = router;