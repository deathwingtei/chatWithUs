require('dotenv').config();
const private_ip = require("./isprivateip");
let dbUrl = "";

if (private_ip)
{
    dbUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/portDB";
}
else
{
    dbUrl = process.env.MONGODB_SERVER_URL 
}
const options = {
    useNewUrlParser:true,
    useUnifiedTopology:true
};

module.exports.options = options;
module.exports.url = dbUrl;