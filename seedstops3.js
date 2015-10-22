var fs = require('fs');
var bluebird = require('bluebird');
var mongoose = require('mongoose');


//var stopsFile = fs.readFileSync("./google_transit/stops.txt","utf8");
var stopTimesFile = fs.readFileSync("./stop_timesPT3.txt","utf8");
//console.log(stopsFile);


function stopsParse(stopsFile){
    var arrayOfObjects = [];
    var arr = stopsFile.split("\n");
    var newObj;

    keys = arr.shift().split(",");

    arr.forEach(function(stop){
        stop = stop.split(",");
        newObj = {};

        newObj[keys[0]] = stop[0];
        newObj[keys[2]] = stop[2];
        newObj[keys[4]] = stop[4];
        newObj[keys[5]] = stop[5];

        arrayOfObjects.push(newObj);

    })

    return arrayOfObjects;
}

function stopTimesParse(stopTimesFile){
    var arrayOfObjects = [];
    var arr = stopTimesFile.split("\n");
    var newObj;

    keys = arr.shift().split(",");

    arr.forEach(function(stop){
        stop = stop.split(",");
        newObj = {};

        newObj[keys[3]] = stop[3];

        if (stop[0].indexOf("SAT") !== -1) newObj.stop_day = 6;
        else if (stop[0].indexOf("SUN") !== -1) newObj.stop_day = 0;
        else newObj.stop_day = 1;

        newObj.stop_line = stop[0].slice(20,21);
        
        newObj.stop_time = parseInt(stop[1].slice(0,2)) * 60 + parseInt(stop[1].slice(3,5));


        arrayOfObjects.push(newObj);

    })

    return arrayOfObjects;
}

//stopsList = stopsParse(stopsFile);
stopTimesList = stopTimesParse(stopTimesFile);

//console.log(stopsList);
//console.log(stopTimesList);



var StopsModel = require('./server/models/stops-model');
var StopTimesModel = require('./server/models/stop_times-model');

mongoose.connect('mongodb://localhost/subway');

var wipeDB = function () {

    var models = [StopsModel, StopTimesModel];

    models.forEach(function (model) {
        model.find({}).remove(function () {});
    });

    return bluebird.resolve();

};

var seedStops = function () {

    StopsModel.create(stopsList, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('Stops seeded!');
        //process.kill(0);
    });

};

var seedTimes = function () {

    StopTimesModel.create(stopTimesList, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('Stop Times PT3 seeded!');
        process.exit(0);
    })
}

mongoose.connection.once('open', function () {
    seedTimes();
});
