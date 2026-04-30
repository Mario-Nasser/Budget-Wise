// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     // Replace with your MongoDB URI
//     await mongoose.connect('mongodb://localhost:27017/testDB');
//     console.log("connected");
    
//   } catch (err) {
//     console.error(err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/financeDB');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;