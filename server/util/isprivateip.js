const os = require('os');
var checkIp = require('check-ip');

// const is_ip_private = require('private-ip');

getIPAddress = ()=>{
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

const chkip = checkIp(getIPAddress());

let isprivate = false;

if (chkip.isValid && chkip.isPublicIp) {
  isprivate = false;
}else{
  isprivate = true;
}

module.exports = isprivate;