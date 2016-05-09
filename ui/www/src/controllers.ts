angular.module('starter.controllers', [])

    .controller('ChatDetailController', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })
    .controller('LoginController', LoginController)
    .controller('RoomController', RoomController)
    .controller('RoomSelectionController', RoomSelectionController)
    .controller('MapController', MapController)
    .controller('AccountController', AccountController);

LoginController.$inject = ['$scope', '$state', '$http', '$log', '$window', '$ionicHistory', '$ionicPopup', '$ionicLoading', '$q', 'Chats', 'ApiService', 'AuthService', 'localStorageService'];
function LoginController($scope, $state, $http, $log, $window, $ionicHistory, $ionicPopup, $ionicLoading, $q, Chats, ApiService, AuthService, localStorageService) {

    $scope.user = {};
    $scope.loginData = {};
    $scope.rooms = undefined;

    $scope.$on('$ionicView.enter', function () {
        $log.info("page entered");
        if (localStorageService.get('locationApproved') !== true) { }
    })


    $scope.login = function () {

        AuthService.login($scope.loginData)
            .then(function (response) {
                console.log("Success");
                $state.go("tab.chats");
            }, function (err) {
                $ionicLoading.hide();
                $ionicPopup.show({
                    template: '<p>Sorry, there was an error contacting the server.</p>',
                    title: "Server Error",
                    buttons: [{
                        text: 'Ok'
                    },]
                })
            });
    }

    $scope.register = function () {
        $scope.register = true;
    }

    //Allow user to continue anonymously
    $scope.goAnonymous = function () {
        var authentication = AuthService.goAnonymous();

        $ionicHistory.nextViewOptions({
            disableBack: true
        });

        return $state.go("tab.chats");
    }


    $scope.getRooms = function (position) {
        //Returns the actual rooms object
        var def = $q.defer();

        ApiService.getRooms(position)
            .then(function (response) {


                console.log("LoginController: rooms is ", response.data);
                def.resolve(response.data);
            })
            .then(null, function (err) {
                $ionicPopup.show({
                    template: '<p>Sorry, there was an error contacting the server.</p>',
                    title: "Server Error",
                    buttons: [{
                        text: 'Ok'
                    },]
                })
                def.reject(err);

            });
        return def.promise;
    }
}

RoomController.$inject = ['AuthService', 'Chats', '$rootScope', '$scope', '$state', '$stateParams', '$ionicNavBarDelegate'];
function RoomController(AuthService, Chats, $rootScope, $scope, $state, $stateParams, $ionicNavBarDelegate) {

    $scope.chats = [];
    var instance = 0;
    $scope.$on('$ionicView.enter', function (e) {
        // console.log("Entered RoomController: roomId is", $stateParams.roomId);
        // console.log("Entered RoomController: roomTitle is ", $stateParams.roomTitle);
        $ionicNavBarDelegate.title($stateParams.roomTitle);
        Chats.connect($stateParams.roomId)
            // .then(function () {
            //     $scope.chats =
            // })
        $scope.chats = Chats.get($stateParams.roomId);
    })

    $rootScope.$on($stateParams.roomId, function (event, chats) {
        // console.log('RoomController: chats update event heard from instance ', instance);
        // console.log("RoomController: new data is ", chats);

        $scope.chats = chats;
        $scope.$apply();
    });

    $scope.postMessage = function (message) {
        console.log("In RoomController.postMessage");
        var chat = {
            name: AuthService.authentication.name,
            face: AuthService.authentication.face,
            lastText: message
        }
        try {
            Chats.postMessage(chat);
        } catch (e) {
            console.log(e);
        }
        $scope.message = "";
    };

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
}

RoomSelectionController.$inject = ['$scope', '$state', '$log', '$ionicHistory', '$ionicPopup', 'Chats', 'ApiService', 'AuthService', 'localStorageService', 'PopupService'];
function RoomSelectionController($scope, $state, $log, $ionicHistory, $ionicPopup, Chats, ApiService, AuthService, localStorageService, PopupService) {

    $scope.rooms = [];
    var position;
    $scope.radius;

    $scope.$on('$ionicView.enter', function (e) {

        //TODO: REMOVE THIS BEFORE PROD
        //AuthService.authentication.anonymous = true;

        //Make sure the users is logged in before proceeding
        if (!AuthService.authentication.access_token && !AuthService.authentication.anonymous) {
            $log.info("Redirecting to login");
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go("tab.login");

        }
        //Get radius
        $scope.radius = ApiService.getRadiusFeet()

        //Get position, catch errors
        try {
            position = localStorageService.getObject("position");

            console.log("Got position: ", position);
        } catch (e) {
            $ionicPopup.show({
                template: '<p>This app uses your location to place you into nearby chatrooms. In order to use this app, grant permission to use your location.</p>',
                title: "Location not found",
                buttons: [
                    { text: 'Ok' },
                ]
            })
        }

        ApiService.getRooms(position)
            .then(function (response) {
                $scope.rooms = response.data;
            }, function (err) {
                console.log(err);
                if (err.status == 401) {
                    PopupService.unauthorized();
                }
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go("tab.login");
            })
    });

    //Call the API with new radius after the user is
    //done moving the slider
    var timeoutId;

    $scope.onInputChange = function (radiusFeet) {
        ApiService.setRadiusMeters($scope.radius);
        if (timeoutId) {
            window.clearTimeout(timeoutId)
        };

        timeoutId = setTimeout(function () {

            ApiService.setRadiusMeters(radiusFeet);
            ApiService.getRooms(position).then(function (response) {
                $scope.rooms = response.data;
            });
        }, 333)
    }

    $scope.goToRoom = function (roomId, roomTitle) {
        console.log("Calling goToRoom with pid", roomId);
        $state.go('tab.room', {
            roomId: roomId,
            roomTitle: roomTitle
        })
    }
}

MapController.$inject = ['localStorageService', 'AuthService', '$scope', '$rootScope'];
function MapController(localStorageService, AuthService, $scope, $rootScope) {


    $scope.user = Object.create(AuthService.authentication);

    $scope.options = {};
    $scope.$on('$ionicView.enter', function () {
        var position = localStorageService.getObject('position') || undefined;
        console.log('Updating map options');
        $scope.map = {
            center: {
                latitude: position.Latitude || 39.859001,
                longitude: position.Longitude || -97.906991
            },
            zoom: (position) ? 12 : 2
        }

        $scope.user = Object.create(AuthService.authentication);
        $scope.options.icon = {}
        $scope.options.icon.url = ($scope.user.face !== '') ? $scope.user.face : undefined;
        $scope.options.icon.scaledSize = new google.maps.Size(30, 30, 'px', 'px');

    });
}

AccountController.$inject = ['AuthService', '$scope', 'PopupService']
function AccountController(AuthService, $scope, PopupService) {
    $scope.logout = function () {
        AuthService.logOut();
        PopupService.logoutSuccess();
    }
}