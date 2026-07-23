import os from 'os';
const checkIp = require('check-ip');

const getIPAddress = (): string => {
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

const chkip = checkIp(getIPAddress());

let isprivate: boolean = false;

if (chkip.isValid && chkip.isPublicIp) {
    isprivate = false;
} else {
    isprivate = true;
}

export default isprivate;
