var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/subway');
mongoose.connect('mongodb://heroku_kwxd5sdv:1eijvuls0gtofbvpmhos72r2br@ds043714.mongolab.com:43714/heroku_kwxd5sdv');


// Grabbing our server from our server/index.js file.
var server = require('./server');

var PORT = process.env.PORT || 1337;

mongoose.connection.once('open', function () {
    server.listen(PORT, function () {
	    console.log('Server started on port ' + PORT.toString());
	});
});


// ; node seed_s_c_t; node seedstops1A; node seedstops2; node seedstops2A; node seedstops3; node seedstops3A; node seedstops4; node seedstops4A; node seedstops5; node seedstops5A; node seedstops6