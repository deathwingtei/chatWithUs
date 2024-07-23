const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

// Define the async function to send an email
async function sendEmail(to, subject, text) {
    const recipientList = Array.isArray(to) ? to : [to]; // Convert to an array if it's a string
    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: recipientList.join(', '), // Join recipients for comma-separated list in the header
        subject,
        text
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = sendEmail;

// result
// console.log('Email sent: ' + info.response);
// {
//   "message": "Email sent successfully",
//   "info": {
//     "accepted": [
//       "p.kittichet@gmail.com"
//     ],
//     "rejected": [],
//     "ehlo": [
//       "SIZE 35882577",
//       "8BITMIME",
//       "AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH",
//       "ENHANCEDSTATUSCODES",
//       "PIPELINING",
//       "CHUNKING",
//       "SMTPUTF8"
//     ],
//     "envelopeTime": 818,
//     "messageTime": 662,
//     "messageSize": 300,
//     "response": "250 2.0.0 OK  1721705929 d9443c01a7336-1fd942014d6sm33780015ad.196 - gsmtp",
//     "envelope": {
//       "from": "devuwebpk@gmail.com",
//       "to": [
//         "p.kittichet@gmail.com"
//       ]
//     },
//     "messageId": "<24d07d31-9892-b0bc-0565-a97385c849a1@gmail.com>"
//   }
// }