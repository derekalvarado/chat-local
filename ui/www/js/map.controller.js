/**
 * MapController Module
 *
 * Description
 */
angular.module('MapController', [])
.controller('MapController', ['localStorageService', '$scope',
    function(localStorageService, $scope) {
        $scope.position = JSON.parse(localStorageService.get('position')) || undefined;
        console.log("Position is ", $scope.position);
        $scope.map = {
            center: {
                latitude: $scope.position.latitude || 39.859001,
                longitude: $scope.position.longitude || -97.906991
            },
            zoom: ($scope.position) ? 12 : 2
        }


    }
])
