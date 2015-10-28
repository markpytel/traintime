var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var StopTimesModel = require('./models/stop_times-model');
var TransfersModel = require('./models/transfers-model');
var StopsModel = require('./models/stops-model');
var bluebird = require('bluebird');

var app = express(); // Create an express app!
module.exports = app; // Export it so it can be require('')'d

// The path of our public directory. ([ROOT]/public)
var publicPath = path.join(__dirname, '../public');
var bowerPath = path.join(__dirname, '../bower_components');

// The path of our index.html file. ([ROOT]/index.html)
var indexHtmlPath = path.join(__dirname, '../index.html');

// http://nodejs.org/docs/latest/api/globals.html#globals_dirname
// for more information about __dirname

// http://nodejs.org/api/path.html#path_path_join_path1_path2
// for more information about path.join

// When our server gets a request and the url matches
// something in our public folder, serve up that file
// e.g. angular.js, style.css
app.use(express.static(publicPath));
app.use(express.static(bowerPath));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// If we're hitting our home page, serve up our index.html file!
app.get('/', function (req, res) {
    res.sendFile(indexHtmlPath);
});

app.use(function (req, res, next) {
	// console.log('made it')
	next();
});

app.post('/times/', function (req, res) {
    console.log("getting into route")

    var stations = req.body.stations;
    var index = 0;

    console.log("Stations: ", stations)

    function getTimes(stop) {
        console.log("Stop in getTimes: ", stop)
        var date = new Date();
        var day = 0;
        var time = 0;
        var result = [];
        var lineItem = {};
        var total = {};
        var stopArr = [stop.stop_id.slice(0,3)+"S", stop.stop_id.slice(0,3)+"N"];

        console.log("StopArr in getTimes ", stopArr)

        if (date.getUTCDay() === 0) day = 0;
        else if (date.getUTCDay() === 6) day = 6;
        else day = 1;

        time += date.getHours() * 60;
        time += date.getMinutes();
        //console.log(time);

        function makeItem (thing) {
            lineItem = {};
            lineItem.line = thing.stop_line;
            lineItem.ttnt = thing.stop_time - time;
            //lineItem.direct = thing.stop_id.slice(3,4);
            lineItem.direct = false;
            if (thing.stop_id.slice(3,4) === "N") lineItem.direct = true;
            lineItem.station = stop.stop_name;
            result.push(lineItem);
        }

        function getXfer () {
            return TransfersModel.find({stop_id: stop.stop_id, xfer_id: {$ne: stop.stop_id}})
            .exec()
            .then(function (xfer){

                console.log("xfer in getXfer: ", xfer)
  
                if (xfer.length) {
           
                    xfer.forEach(function(transfer){
                        stopArr.push(transfer.xfer_id + "N");
                        stopArr.push(transfer.xfer_id + "S");
                    });
                    console.log(stopArr);
                }
            }).then(null, console.log);
        }

        getXfer().then(function(){

            console.log("Getting into train time finding part")
            
            StopTimesModel.find({stop_id: {$in: stopArr}, stop_day: day, stop_time:{$gt: time, $lt: time+20}})
            .exec().then(function (trainTimes) {

                console.log("Traintimes in stoptimesmodel: ", trainTimes)

                trainTimes.forEach(function(arrTime){
                    if (arrTime.stop_id.slice(0,1) === '9') arrTime.stop_line = 'S'
                })


                trainTimes.forEach(makeItem);

                total.times = result;
                total.station = stop;

                res.status(200).json(total);  
            })
            .then(null, next);
        })
    }

    function findStation(index) {
        StopsModel.findOne({stop_lat: stations[index]}).exec()
        .then(function(stop){
            console.log("Stop found: ", stop);
            if (stop) getTimes(stop);
            else {
                index++;
                findStation(index);
            }
        });
    }

    findStation(index);

});