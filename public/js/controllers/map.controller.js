app.controller('MapController', function($scope, MapFactory) {

	$scope.map = MapFactory.get_location();
	$scope.data = [];

	$scope.getNearbyStations = function (){
		MapFactory.get_nearbyStations().then(function(data){
			//console.log(data);
			$scope.data = data;
		});
	}
});