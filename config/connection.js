const mongo = require('mongoose');
const config = require('config');

const connectDB = async () => {
    try {
        await mongo.connect(config.get('MONGO_URL'), (err) => {
            if (!err) {
                console.log("MongoDB is connected");
            }
        })
    } catch (err) {
        console.error(err);
        process.exit(1)
    }
}

module.exports = connectDB;