const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://dbUser:Ruzzel123@cluster0.vpmlxq7.mongodb.net/hotel_booking?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
})
.catch(err => {
    console.log('❌ MongoDB Connection Failed:');
    console.log('Error:', err.message);
    process.exit(1);
});