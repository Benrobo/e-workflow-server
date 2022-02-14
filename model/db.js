import dotenv from "dotenv"

import pg from "pg"


const { Pool } = pg

dotenv.config()

export const conn = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
})
