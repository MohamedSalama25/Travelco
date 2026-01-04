const os = require("os");

function getLocalIPs() {
    const nets = os.networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results;
}

function checkIP(allowedIPs = []) {
    const myIPs = getLocalIPs();

    return myIPs.some(ip => allowedIPs.includes(ip));
}

module.exports = checkIP;
