const mongoose = require('mongoose');
const Student = require('../models/studentModel');
const {connectMongoDB}= require('../databases/mongoDb/connectMongoDB');

require('dotenv').config();

const clearAllMongoDB = async () => {
    try {
        await connectMongoDB();
        await Student.deleteMany({});
        console.log('Cleared all data in MongoDB');
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
    finally{
        await mongoose.disconnect();
    }

};

clearAllMongoDB();