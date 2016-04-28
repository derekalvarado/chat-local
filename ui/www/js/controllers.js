angular.module('starter.controllers', [])

    .controller('ChatDetailController', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })
    .controller('LoginController', ['ApiEndPoint',
        '$scope',
        '$state',
        '$http',
        '$log',
        '$window',
        '$ionicHistory',
        '$ionicPopup',
        '$ionicLoading',
        '$q',
        'Chats',
        'ApiService',
        'AuthService',
        'localStorageService',
        function (
            ApiEndPoint,
            $scope,
            $state,
            $http,
            $log,
            $window,
            $ionicHistory,
            $ionicPopup,
            $ionicLoading,
            $q,
            Chats,
            ApiService,
            AuthService,
            localStorageService) {

            $scope.user = {};
            $scope.loginData = {};
            $scope.rooms;

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

                        rooms = response.data;
                        console.log("LoginController: rooms is ", rooms);
                        def.resolve(rooms);
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
    ])
    .controller('RoomController', [
        'ChatEndPoint',
        'AuthService',
        'Chats',
        '$rootScope',
        '$scope',
        '$state',
        '$stateParams',
        function (
            ChatEndPoint,
            AuthService,
            Chats,
            $rootScope,
            $scope,
            $state,
            $stateParams) {

            $scope.$on('$ionicView.enter', function (e) {
                console.log("Entered RoomController: room id is", $stateParams.id);
                Chats.create($stateParams.id).then(
                    Chats.connect($stateParams.id)
                )

            })

            $scope.chats = Chats.all();
            $rootScope.$on('chats updated', function () {
                console.log('RoomController: chats update event heard');
                $scope.chats = Chats.all();
                $scope.$apply();
            });

            $scope.postMessage = function (message) {
                console.log("In RoomController: Called postMessage");
                var chat = {
                    name: AuthService.authentication.name,
                    face: AuthService.authentication.face,
                    lastText: message
                }
                try {
                    Chats.add(chat);
                } catch (e) {
                    console.log(e);
                }
                $scope.message = "";
            };

            $scope.remove = function (chat) {
                Chats.remove(chat);
            };
        }
    ])
    .controller('RoomSelectionController', [
        '$scope',
        '$state',
        '$log',
        '$ionicHistory',
        'Chats',
        'ApiService',
        'AuthService',
        'localStorageService',
        'ChatEndPoint',
        function (
            $scope,
            $state,
            $log,
            $ionicHistory,
            Chats,
            ApiService,
            AuthService,
            localStorageService,
            ChatEndPoint) {

            $scope.rooms = [];

            var position;

            $scope.radius;

            $scope.$on('$ionicView.enter', function (e) {

                //TODO: REMOVE THIS BEFORE PROD
                //AuthService.authentication.anonymous = true;

                //Make sure the users is logged in before proceeding
                if (!AuthService.authentication.access_token & !AuthService.authentication.anonymous) {
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


                ApiService.getRooms(position).then(function (response) {
                    $scope.rooms = response.data;
                })
            });
            $scope.$on('$ionicView.loaded', function (e) {
                console.log("Loaded event occurred");
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

            $scope.goToRoom = function (id) {
                console.log("Calling goToRoom with pid", id);
                $state.go('tab.room', {
                    id: id
                })
            }
        }
    ])
    .controller('MapController', ['localStorageService', 'AuthService', '$scope', '$rootScope',
        function (localStorageService, AuthService, $scope, $rootScope) {
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
            $scope.$on('$ionicView.enter', function () {
                console.log('Updating map options');

                $scope.user = Object.create(AuthService.authentication);
                $scope.options.icon = {}
                $scope.options.icon.url = ($scope.user.face !== '') ? $scope.user.face : undefined;
                $scope.options.icon.scaledSize = new google.maps.Size(30, 30, 'px', 'px');

            });
        }
    ])
    .controller('AccountController', ['AuthService', '$scope', function (AuthService, $scope) {
        $scope.logout = function () {
            AuthService.logOut();
        }
    }]);