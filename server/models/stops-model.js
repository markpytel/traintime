var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    stop_id: String,
    stop_name: String,
    stop_lat: Number,
    stop_lon: Number
});

module.exports = mongoose.model('Stops', schema);