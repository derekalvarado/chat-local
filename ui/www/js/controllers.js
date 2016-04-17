//Moved a lot of controllers out of here into their own <name>.controller.js file
angular.module('starter.controllers', [])

.controller('ChatDetailController', function($scope, $stateParams, Chats) {
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
        '$q',
        'Chats',
        'ApiService',
        'AuthService',
        'localStorageService',
        function(
            ApiEndPoint,
            $scope,
            $state,
            $http,
            $log,
            $window,
            $ionicHistory,
            $ionicPopup,
            $q,
            Chats,
            ApiService,
            AuthService,
            localStorageService) {

            $scope.user = {};
            $scope.loginData = {};
            $scope.rooms;


            //Not sure what this does, probably from some online template
            $scope.validate = function() {
                $log.info($scope.user);
                //TODO: Validate, replace window with local storage
                window.loggedin = true;

                $state.go("tab.chats");
            };


            $scope.$on('$ionicView.enter', function() {
                $log.info("page entered");
                if (localStorageService.get('locationApproved') !== true) {}
            })


            $scope.login = function() {

                AuthService.login($scope.loginData)
                    .then(function(response) {
                        console.log("Success");
                        $state.go("tab.chats");
                    }, function(err) {
                        console.log("Couldn't log you in");
                    });

            }


            $scope.register = function() {
                $scope.register = true;
            }


            $scope.goAnonymous = function() {
                var authentication = AuthService.goAnonymous();

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                return $state.go("tab.chats");

            }


            $scope.getRooms = function(position) {
                //Returns the actual rooms object
                var def = $q.defer();

                ApiService.getRooms(position)
                    .then(function(response) {

                        rooms = response.data;
                        console.log("LoginController: rooms is ", rooms);
                        def.resolve(rooms);
                    })
                    .then(null, function(err) {
                        $ionicPopup.show({
                            template: '<p>Sorry, there was an error contacting the server.</p>',
                            title: "Server Error",
                            buttons: [{
                                text: 'Ok'
                            }, ]
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
        function(
            ChatEndPoint,
            AuthService,
            Chats,
            $rootScope,
            $scope,
            $state,
            $stateParams) {

            $scope.$on('$ionicView.enter', function(e) {
                console.log($stateParams.roomId);
                Chats.connect($stateParams.roomId);
            })
            $scope.chats;
            $scope.chats = Chats.all();
            $rootScope.$on('chats updated', function() {
                console.log('RoomController: chats update event heard');
                $scope.chats = Chats.all();
                $scope.$apply();
            });

            $scope.postMessage = function(message) {
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

            $scope.remove = function(chat) {
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
        function(
            $scope,
            $state,
            $log,
            $ionicHistory,
            Chats,
            ApiService,
            AuthService,
            localStorageService,
            ChatEndPoint) {

            $scope.rooms;
            /*[{
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
            }];*/
            
            var position;
            
            $scope.radius;

            $scope.$on('$ionicView.enter', function(e) {

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
                    console.log("Got position: ",position);    
                } catch (e) {
                    $ionicPopup.show({
                      template: '<p>This app uses your location to place you into nearby chatrooms. In order to use this app, grant permission to use your location.</p>',
                      title: "Location not found",
                      buttons: [
                        { text: 'Ok' },
                      ]
                    })
                }

                
                ApiService.getRooms(position).then(function(response){
                    $scope.rooms = response.data;
                }) 
            });
            $scope.$on('$ionicView.loaded', function(e) {
                console.log("Loaded event occurred");
            });

            var timeoutId;

            $scope.onInputChange = function(radiusFeet) {
                if (timeoutId) {
                    window.clearTimeout(timeoutId)
                };
                ApiService.setRadiusMeters($scope.radius);
                timeoutId = setTimeout(function() {
                    
                    ApiService.setRadiusMeters(radiusFeet); 
                    ApiService.getRooms(position).then(function(response) {
                        $scope.rooms = response.data;
                    }) ;
                },333)                
            }

            $scope.goToRoom = function(roomPid) {
                //Call /create on socket server  
                Chats.create(roomPid).then(function() {
                    //console.log("Chats.create finished");
                    $state.go('tab.room', {
                        roomId: roomPid
                    })
                })
            }
        }
    ])
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
                $scope.options.icon.scaledSize = new google.maps.Size(30, 30, 'px', 'px');
            });
        }
    ])
    .controller('AccountController', ['AuthService', '$scope', function(AuthService, $scope) {
        $scope.logout = function() {
            AuthService.logOut();
        }
    }]);