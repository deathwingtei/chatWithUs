const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const exampleRoutes = require('./routes/example');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const Socket= require("./socket_with_auth").socket;

require('dotenv').config();
const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/uploads/images');
    },
    filename:(req,file,cb)=>{
        cb(null,"img_"+Date.now()+ path.extname(file.originalname) );
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

app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

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

app.use('/example', exampleRoutes);
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

let PORT = 8081;

mongoose
    .connect(
        process.env.MONGODB_URL
    )
    .then(result => {
        let server = app.listen(PORT, () => {
            // creating socket connection
            Socket.setServer(server);
            Socket.createConnection();
        });
    })
.catch(err => console.log(err));

