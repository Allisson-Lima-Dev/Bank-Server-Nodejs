const mongoose = require('mongoose')
require('dotenv').config()

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@bankserver.qa075.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).then(() => {
    console.log("Mongo connected")
}).catch((err) => {
    console.log(err);
})

module.exports = mongoose