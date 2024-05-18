const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const authRoutes = require('./routes/auth');

require('dotenv').config();
const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/uploads/port_img');
    },
    filename:(req,file,cb)=>{
        cb(null,"port_"+Date.now()+ path.extname(file.originalname) );
    }
});

const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
};

app.use('/auth', authRoutes);
app.use(cors({
    origin: true
}));

app.use(express.urlencoded({extended:true})); //endcode for post data
app.use(express.json());

app.use(express.static(path.join(__dirname,'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/favicon.ico', function(req, res) { 
    res.status(204);
    res.end();    
});

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});


mongoose
  .connect(
    process.env.MONGODB_URL
  )
  .then(result => {
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch(err => console.log(err));

