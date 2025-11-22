import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Session = sequelize.define("Session", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.DATE,
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
    },
    focusLevel: {
        type: DataTypes.INTEGER, // maybe 1-10 rating scale
    },
})


export default Session