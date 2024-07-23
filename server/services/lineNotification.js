const axios = require('axios');
require('dotenv').config();

async function sendNotification(message) {
    const token = process.env.LINE_NOTIFY_TOKEN;
    const url = "https://notify-api.line.me/api/notify";

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
    };

    const data = new URLSearchParams();
    data.append('message', message);

    try {
        const response = await axios.post(url, data, { headers });
        const result = response.data;
        // console.log("status :", result.status); // 200
        // console.log("message :", result.message); // ok
        return result;
    } catch (error) {
        console.error("error:", error.message);
        throw error;
    }
};

module.exports = sendNotification;