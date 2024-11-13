const mongoose = require('mongoose');
async function ConnectMongoDb(url) {
  return await mongoose.connect(url);
}

module.exports = { ConnectMongoDb };