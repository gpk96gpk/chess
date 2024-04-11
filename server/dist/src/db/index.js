"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//set up pool connection to database
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.POSTGRES_HOST || 'db',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'chess',
});
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});
module.exports = {
    query: (text, params) => {
        return pool
            .query(text, params)
            .catch(e => {
            console.error('Error executing query', e.stack);
            throw e;
        });
    },
};
