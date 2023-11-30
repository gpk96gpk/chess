//set up pool connection to database
import { Pool, QueryResult } from 'pg';

const pool = new Pool()
module.exports = {
     query: (text: string, params:(err: Error, result: QueryResult<any>) => void) => pool.query(text, params),
}
