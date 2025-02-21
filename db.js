const mongoose = require('mongoose')
require('dotenv').config()


async function ConnectToDB() {
    try {
        // console.log(process.env.MONGODB_URI)
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout DB if too slow
        })
        console.log("Connected....")
    } catch (error) {
        console.log(error)
    }
}


module.exports = ConnectToDB
