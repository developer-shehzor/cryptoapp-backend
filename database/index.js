const mongoose = require('mongoose');
const { MONGODB_CONNECTION_STRING } = require('../config/index')

// const connectionString = 'mongodb+srv://developershehzor:shehzor@mern-blog.4osmp.mongodb.net/?retryWrites=true&w=majority&appName=mern-blog';

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(MONGODB_CONNECTION_STRING);
        console.log(`Database connected to host: ${connect.connection.host}`);
        
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

module.exports = dbConnect;