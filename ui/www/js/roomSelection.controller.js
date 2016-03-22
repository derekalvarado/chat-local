angular.module('RoomSelectionController', [])
    .controller('RoomSelectionController', ['$scope', '$state', '$log', '$ionicHistory', 'Chats', 'AuthService', 'localStorageService', 'ChatEndPoint', function(
        $scope,
        $state,
        $log,
        $ionicHistory,
        Chats,
        AuthService,
        localStorageService,
        ChatEndPoint) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        $scope.rooms = [{
            "Topic": "Cars",
            "Name": "Zoom Room",
            "Location": {
                "Values": [1.234, 2.345],
                "Longitude": 25.34983,
                "Latitude": 33.09384,
                "Altitude": 678.88
            },
            "Radius": 4,
            "IsPrivate": false,
            "Users": [],
            "UserCount": 8,
            "Id": {
                "Timestamp": 1234,
                "Machine": 1234,
                "Pid": 1234,
                "Increment": 1234,
                "CreationTime": "2009-06-15T13:45:30"
            }
        }, {
            "Topic": "SXSW",
            "Name": "SXSW 2016",
            "Location": {
                "Values": [1.234, 2.345],
                "Longitude": 25.34983,
                "Latitude": 33.09384,
                "Altitude": 678.88
            },
            "Radius": 4,
            "IsPrivate": false,
            "Users": [],
            "UserCount": 8,
            "Id": {
                "Timestamp": 1234,
                "Machine": 1234,
                "Pid": 5678,
                "Increment": 1234,
                "CreationTime": "2009-06-15T13:45:30"
            }
        }];
        $scope.$on('$ionicView.enter', function(e) {

            //TODO: REMOVE THIS BEFORE PROD
            AuthService.authentication.anonymous = true;

            if (!AuthService.authentication.isAuth & !AuthService.authentication.anonymous) {
                $log.info("Redirecting to login");
                $ionicHistory.nextViewOptions({ disableBack: true });
                $state.go("tab.login");
            } 
        });

        $scope.goToRoom = function(roomPid) {

            console.log("goToRoom hit; Pid is ", roomPid);
            Chats.create(roomPid).then(function() {
                console.log("Chats.create finished");
                $state.go('tab.room',{roomId: roomPid})
            })


        }
    }])
