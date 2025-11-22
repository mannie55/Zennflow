import express from "express"
import cors from "cors"
import morgan from "morgan"

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

//base route

app.get("/", (req, res) => {
    res.json({ message: "✅ “Aye aye, Cap’n! The FocusFlow API be alive and kickin’, sailin’ smooth through the digital seas!” ⚓️" })
})

export default app