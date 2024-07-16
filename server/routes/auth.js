const express=require("express");
const router = express.Router();
const {login,verifyToken,register,changePassword,generateNewToken,googleAuth} = require("../controllers/authController");
const { requireLogin } = require("../controllers/authController");

router.post('/login',login);
router.post('/register',register);
router.post('/google',googleAuth);
router.post('/changepassword',requireLogin,changePassword);
router.post('/gennewtoken',requireLogin,generateNewToken);
router.get('/verifyuser',verifyToken);


module.exports = router;