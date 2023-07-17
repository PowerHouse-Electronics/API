const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/FinalProject",);
        console.log('DB online');
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la BD ver logs');
    }
}
module.exports = connectDB