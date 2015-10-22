app.factory('MapFactory', function($http) {

    var myLatlng;
    var startPos;
    var stations = [];
    var map;

    function get_nearbyStations() {

        return $http.post('/times/', {
                stations: stations
            })
            .then(function(response) {

                var stopLatlng = new google.maps.LatLng(response.data.station.stop_lat, response.data.station.stop_lon)
                var destMarker = new google.maps.Marker({
                    position: stopLatlng
                });

                destMarker.setMap(map);

                var line = new google.maps.Polyline({
                    path: [
                        myLatlng,
                        stopLatlng
                    ],
                    strokeColor: "#0000FF",
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                    map: map
                });

                return response.data.times;
            })
    }

    function callback(results, status) {
        stations = [];
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];

                stations.push(place.geometry.location.H);
            }
        }
    }

    function get_location() {
        var geoSuccess = function(position) {
            startPos = position;
            initialize_gmaps(startPos);

        };
        navigator.geolocation.getCurrentPosition(geoSuccess);

    };

    function initialize_gmaps(startPos) {

        myLatlng = new google.maps.LatLng(startPos.coords.latitude, startPos.coords.longitude);


        // set the map options hash
        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // set the options for the subway search
        var request = {
            location: myLatlng,
            //radius: '400',
            rankBy: google.maps.places.RankBy.DISTANCE,
            types: ['subway_station']
        };

        // get the maps div's HTML obj
        var map_canvas_obj = document.getElementById("map-canvas");
        // initialize a new Google Map with the options
        map = new google.maps.Map(map_canvas_obj, mapOptions);
        // Add the transit layer to the map
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(map);
        // Add the marker to the map
        var marker = new google.maps.Marker({
            position: myLatlng,
            draggable: true
        });
        // Add the marker to the map by calling setMap()
        marker.setMap(map);

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);

        google.maps.event.addListener(marker, 'dragend', function(evt) {

            myLatlng = new google.maps.LatLng(evt.latLng.lat(), evt.latLng.lng());

            var newStartPos = {};
            newStartPos.coords = {};
            newStartPos.coords.latitude = evt.latLng.lat();
            newStartPos.coords.longitude = evt.latLng.lng();

            initialize_gmaps(newStartPos);
        });

        return map;
    }

    return {
        initialize_gmaps: initialize_gmaps,
        get_location: get_location,
        get_nearbyStations: get_nearbyStations
    };

});