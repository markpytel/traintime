var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    stop_id: String,
    xfer_id: String
});

module.exports = mongoose.model('Transfers', schema);