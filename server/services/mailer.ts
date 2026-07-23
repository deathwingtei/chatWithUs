import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

async function sendEmail(to: string | string[], subject: string, text: string): Promise<any> {
    const recipientList = Array.isArray(to) ? to : [to];
    const mailOptions = {
        from: process.env.GMAIL_USERNAME,
        to: recipientList.join(', '),
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

export default sendEmail;
