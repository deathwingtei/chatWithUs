const os = require('os');
const jsonwebtoken = require("jsonwebtoken");

exports.signature = (key, str) => {
    let signed = crypto.createHmac('sha256', key)
    .update(str)
    .digest('hex');
    return signed
}

exports.microtime = (getAsFloat) =>  {
    let s, now = (Date.now ? Date.now() : new Date().getTime()) / 1000;

    // Getting microtime as a float is easy
    if(getAsFloat) {
        return now
    }

    // Dirty trick to only get the integer part
    s = now | 0

    return (Math.round((now - s) * 1000) / 1000) + ' ' + s
}

exports.getIPAddress = ()=>{
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
      var iface = interfaces[devName];
  
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      }
    }
    return '0.0.0.0';
}

exports.curerntDate = (returntype = "") =>{
    let currentDate = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    let date_time_ex = currentDate.split(" ");
    let time_ex = date_time_ex[1].split(":");
    let date_ex = date_time_ex[0].split("/");
    let day = parseInt(date_ex[0])<10 ? "0"+parseInt(date_ex[0]) : parseInt(date_ex[0]);
    let month = parseInt(date_ex[1])<10 ? "0"+parseInt(date_ex[1]) : parseInt(date_ex[1]);
    let year = parseInt(date_ex[2])-543;
    let formattedDateTime = year+"-"+month+"-"+day+" "+date_time_ex[1];
    if(returntype=="date")
    {
        formattedDateTime = year+"-"+month+"-"+day;
    }
    if(returntype=="time")
    {
        formattedDateTime = date_time_ex[1];
    }
    if(returntype=="time_no_second")
    {
        formattedDateTime = time_ex[0]+":"+time_ex[1];
    }

    return formattedDateTime;
}

exports.encodesl = (input) => {
    const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');

    const digits = input.split('').map(Number);
    const result = [];

    for (;;) {
        let isZero = true;

        // Divide the number in `digits` by the alphabet size
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

exports.decodesl = (input) => {
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const map = new Map(
        Array.from(alphabet, Array.of)
    );

    const fromBase = BigInt(alphabet.length);
    let value = 0n;

    for (const c of input) {
        value = fromBase * value + BigInt(map.get(c));
    }

    return String(value);
};

exports.verifyTokenNoStatus = (token) => {
    try {
        // Verify the token and decode the payload
        const decoded = jsonwebtoken.verify(token,  process.env.JWT_SECRET);
        console.log(decoded)
    return decoded.data;
    } catch (error) {
        return false;
    }
}