//set up pool connection to database

const { Pool } = require("pg")

const pool = new Pool()
module.exports = {
     query: (text, params) => pool.query(text, params),
}
