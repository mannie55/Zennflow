import User from "./user.js"
import Task from "./task.js"
import Session from "./session.js"
import Journal from "./journal.js"

//define relationships

User.hasMany(Task, { foreignKey: "userId", onDelete: "CASCADE" })
Task.belongsTo(User)

User.hasMany(Session, { foreignKey: "userId", onDelete: "CASCADE" })
Session.belongsTo(User)

User.hasMany(Journal, { foreignKey: "userId", onDelete: "CASCADE" })
Journal.belongsTo(User)

export { User, Task, Session, Journal }