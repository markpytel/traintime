var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    stop_id: String,
    stop_line: String,
    stop_day: Number,
    stop_time: Number
});

module.exports = mongoose.model('Stop_Times', schema);