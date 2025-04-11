const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected successfully");
    }catch(err){
        console.log("Error in db.js connectDB")
        console.log(err);
    }
};

module.exports = connectDB;