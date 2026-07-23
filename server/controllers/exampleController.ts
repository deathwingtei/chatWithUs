import { Request, Response } from 'express';
import { getIO } from "../socket";
import { socket as Socket } from "../socket_with_auth";
import sendEmail from '../services/mailer';
import sendNotification from '../services/lineNotification';

export const testMessage = (req: Request, res: Response): any => {
    const jsondata = {
        username: req.body.username,
        message: req.body.message,
        time: req.body.time,
    };
    getIO().emit('chat:message', jsondata);
    return res.status(200).json(jsondata);
};

export const testMessage2 = (req: Request, res: Response): any => {
    const jsondata = {
        email: req.body.email,
        message: req.body.message,
        time: req.body.time,
    };
    const soc = Socket.getIo();
    if (soc) {
        soc.to(req.body.email).emit('chat:message', jsondata);
    }
    return res.status(200).json(jsondata);
};

export const testNoti = async (req: Request, res: Response): Promise<any> => {
    const message = "test this";
    try {
        const result = await sendNotification(message);
        res.status(200).json({ status: result.status, message: result.message });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const testEmail = async (req: Request, res: Response): Promise<any> => {
    const to = "p.kittichet@gmail.com";
    const subject = "Test Email";
    const text = "Node.js Test Email Gmail";

    try {
        const info = await sendEmail(to, subject, text);
        res.status(200).send({ message: 'Email sent successfully', info });
    } catch (error) {
        res.status(500).send({ message: 'Failed to send email', error });
    }
};
