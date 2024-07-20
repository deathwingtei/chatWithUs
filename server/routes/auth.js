const express=require("express");
const router = express.Router();
const {login,verifyToken,register,changePassword,updateProfile,generateNewToken,googleAuth} = require("../controllers/authController");
const { requireLogin } = require("../controllers/authController");

router.post('/login',login);
router.post('/register',register);
router.post('/google',googleAuth);
router.post('/password/update',requireLogin,changePassword);
router.post('/profile/update',requireLogin,updateProfile);
router.post('/gennewtoken',requireLogin,generateNewToken);
router.get('/verifyuser',verifyToken);


module.exports = router;