/**
 * MapController Module
 *
 * Description
 */
angular.module('MapController', [])
.controller('MapController', ['localStorageService', '$scope',
    function(localStorageService, $scope) {
        var position = JSON.parse(localStorageService.get('position'));
        console.log("position is ", position);
        $scope.map = {
            center: {
                latitude: position.latitude || 39.859001,
                longitude: position.longitude || -97.906991
            },
            zoom: (position) ? 12 : 2
        }


    }
])
