import os from 'os';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';

export const signature = (key: string, str: string): string => {
    let signed = crypto.createHmac('sha256', key)
    .update(str)
    .digest('hex');
    return signed;
};

export const microtime = (getAsFloat?: boolean): number | string => {
    let s: number, now = (Date.now ? Date.now() : new Date().getTime()) / 1000;

    if (getAsFloat) {
        return now;
    }

    s = now | 0;
    return (Math.round((now - s) * 1000) / 1000) + ' ' + s;
};

export const getIPAddress = (): string => {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        if (iface) {
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
    return '0.0.0.0';
};

export const curerntDate = (returntype: string = ""): string => {
    let currentDate = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    let date_time_ex = currentDate.split(" ");
    let time_ex = date_time_ex[1] ? date_time_ex[1].split(":") : ["00", "00"];
    let date_ex = date_time_ex[0].split("/");
    let day = parseInt(date_ex[0]) < 10 ? "0" + parseInt(date_ex[0]) : parseInt(date_ex[0]);
    let month = parseInt(date_ex[1]) < 10 ? "0" + parseInt(date_ex[1]) : parseInt(date_ex[1]);
    let year = parseInt(date_ex[2]) - 543;
    let formattedDateTime = year + "-" + month + "-" + day + " " + date_time_ex[1];
    if (returntype === "date") {
        formattedDateTime = year + "-" + month + "-" + day;
    } else if (returntype === "time") {
        formattedDateTime = date_time_ex[1];
    } else if (returntype === "time_no_second") {
        formattedDateTime = time_ex[0] + ":" + time_ex[1];
    }

    return formattedDateTime;
};

export const encodesl = (input: string): string => {
    const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
    const digits = input.split('').map(Number);
    const result: string[] = [];

    for (;;) {
        let isZero = true;
        let carry = 0;

        for (let i = 0; i < digits.length; i++) {
            const digit = 10 * carry + digits[i];
            if (digit !== 0) {
                isZero = false;
            }
            digits[i] = digit / alphabet.length >>> 0;
            carry = digit % alphabet.length;
        }

        if (isZero) {
            break;
        }

        result.push(alphabet[carry]);
    }

    return result.reverse().join('') || alphabet[0];
};

export const decodesl = (input: string): string => {
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const map = new Map(
        Array.from(alphabet, (char) => [char, BigInt(alphabet.indexOf(char))])
    );

    const fromBase = BigInt(alphabet.length);
    let value = 0n;

    for (const c of input) {
        const val = map.get(c);
        if (val !== undefined) {
            value = fromBase * value + val;
        }
    }

    return String(value);
};

export const verifyTokenNoStatus = (token: string): any => {
    try {
        const secret = process.env.JWT_SECRET || '';
        const decoded = jsonwebtoken.verify(token, secret) as any;
        console.log(decoded);
        return decoded.data;
    } catch (error) {
        return false;
    }
};
