"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const child_process_1 = require("child_process");
// Get Windows host IP from WSL
let host = 'localhost';
if (process.platform === 'linux') {
    try {
        host = (0, child_process_1.execSync)("cat /etc/resolv.conf | grep nameserver | awk '{print $2}'").toString().trim();
        console.log(`Using Windows host: ${host}`);
    }
    catch (e) {
        console.error('Could not determine Windows host IP');
    }
}
const pool = new pg_1.Pool({
    user: 'chessapp',
    host: 'localhost',
    database: 'chess',
    password: 'chessapp',
    port: 5432
});
module.exports = {
    query: (text, params = []) => pool.query(text, params),
};
