const express=require("express");
const router = express.Router();
const {login,verifyToken,register,changePassword,generateNewToken} = require("../controllers/authController");
const { requireLogin } = require("../controllers/authController");

router.post('/login',login);
router.post('/register',register);
router.post('/changepassword',requireLogin,changePassword);
router.get('/verifyuser',verifyToken);
router.post('/gennewtoken',requireLogin,generateNewToken);

module.exports = router;