/**
 * MapController Module
 *
 * Description
 */
angular.module('MapController', [])
.controller('MapController', ['localStorageService', 'AuthService', '$scope', '$rootScope',
    function(localStorageService, AuthService, $scope, $rootScope) {
        $scope.position = JSON.parse(localStorageService.get('position')) || undefined;
        console.log("Position is ", $scope.position);

        
        $scope.user = Object.create(AuthService.authentication);


        $scope.options = {};
        $scope.map = {
            center: {
                latitude: $scope.position.latitude || 39.859001,
                longitude: $scope.position.longitude || -97.906991
            },
            zoom: ($scope.position) ? 12 : 2
        }

        //Emitted from AuthService
        $scope.$on('$ionicView.enter', function() {
            console.log('Updating map options');
            $scope.user = Object.create(AuthService.authentication);
            $scope.options.icon = {}
            $scope.options.icon.url = ($scope.user.face !== '') ? $scope.user.face : undefined;
            $scope.options.icon.scaledSize = new google.maps.Size(30,30,'px','px');
        });


    }
]);
