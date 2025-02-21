const mongoose = require('mongoose')
require('dotenv').config()


async function ConnectToDB() {
    try {
        // console.log(process.env.MONGODB_URI)
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected....")
    } catch (error) {
        console.log(error)
    }
}


module.exports = ConnectToDB
