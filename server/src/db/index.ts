import { Pool, QueryResult } from 'pg';
import { execSync } from 'child_process';

// Get Windows host IP from WSL
let host = 'localhost';
if (process.platform === 'linux') {
  try {
    host = execSync("cat /etc/resolv.conf | grep nameserver | awk '{print $2}'").toString().trim();
    console.log(`Using Windows host: ${host}`);
  } catch (e) {
    console.error('Could not determine Windows host IP');
  }
}

const pool = new Pool({
  user: 'chessapp',
  host: 'localhost',
  database: 'chess',
  password: 'chessapp',
  port: 5432
});

module.exports = {
  query: (text: string, params: any[] = []): Promise<QueryResult<any>> => pool.query(text, params),
};