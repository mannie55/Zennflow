//connnect to db

import dotenv from "dotenv"
import app from "./app.js"
import sequelize from "./db/db.js"
import "./models/associations.js"

dotenv.config()

const PORT = process.env.PORT || 3001

//connect to db

async function startServer() {
    try {
        await sequelize.authenticate()
        console.log("✅ Connected to PostgreSQL")

        await sequelize.sync({ alter: true })
        console.log("♻️ Database synced")

        app.listen(PORT, () => {
            console.log(`✅ “Arrr! The server be sailin’ full speed ahead on port ${PORT}, Cap’n!`)
        })
    } catch (error) {
        console.error("☠️❌ “Arrr! Database mutinied, Cap’n — connection failed!” ⚓️", error)
    }
}

startServer()