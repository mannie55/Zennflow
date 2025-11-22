import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Journal = sequelize.define("Journal", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    entry: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    mood: {
        type: DataTypes.STRING,
    },
})

export default Journal