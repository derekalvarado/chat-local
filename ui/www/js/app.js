/// <reference path="../../typings/tsd.d.ts" />
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'uiGmapgoogle-maps'])
    .constant('ApiEndPoint', {
    url: "https://104.14.157.161:4433/chatapi"
})
    .constant('ChatEndPoint', {
    //    url: "https://chat-local-derekalvarado.c9users.io/"
    url: "http://localhost:3000/"
})
    .constant('Constants', {
    ApiEndPoint: "https://104.14.157.161:4433/chatapi/",
    ChatEndPoint: "https://chat-local-derekalvarado.c9users.io/",
    Environment: "prod"
})
    .run(function ($ionicPlatform, AuthService, localStorageService, $ionicPopup, $rootScope, $ionicLoading) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        if (navigator.geolocation) {
            //watch the user's location
            var watchID = navigator.geolocation.watchPosition(function success(location) {
                console.log("Lat: %s, Lng: %s", location.coords.latitude, location.coords.longitude);
                var position;
                position["Latitude"] = location.coords.latitude;
                position["Longitude"] = location.coords.longitude;
                localStorageService.remove('position');
                localStorageService.setObject('position', position);
            }, function error(err) {
                $ionicPopup.show({
                    template: '<p>This app uses your location to place you into nearby chatrooms. In order to use this app, grant permission to use your location.</p>',
                    title: "Location permission",
                    buttons: [
                        { text: 'Ok' },
                    ]
                });
            });
        }
        //Get authData when app starts up
        var authData = localStorageService.getObject('authData');
        console.log("authData is ", authData);
        if (authData) {
            var expiry = new Date(authData[".expires"]);
            var now = new Date(Date.now());
            //If token hasn't expired yet
            if (expiry > now) {
                AuthService.authentication = authData;
            }
            else {
                //console.log("Token expired, removing auth data");
                //Remove all authData
                AuthService.logOut();
            }
        }
    });
    //Handle showing and hiding spinners for loading events
    $rootScope.$on("loading:show", function () {
        $ionicLoading.show({ template: '<ion-spinner icon="lines"></ion-spinner>' });
    });
    $rootScope.$on("loading:hide", function () {
        $ionicLoading.hide();
    });
})
    .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope) {
        return {
            request: function (config) {
                $rootScope.$broadcast("loading:show");
                return config;
            },
            response: function (response) {
                $rootScope.$broadcast("loading:hide");
                return response;
            }
        };
    });
})
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
        .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })
        .state('tab.map', {
        url: '/map',
        views: {
            'tab-map': {
                templateUrl: 'templates/tab-map.html',
                controller: 'MapController'
            }
        }
    })
        .state('tab.chats', {
        url: '/chats',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-rooms.html',
                controller: 'RoomSelectionController'
            }
        }
    })
        .state('tab.register', {
        url: '/register',
        views: {
            'tab-chats': {
                templateUrl: 'templates/register.html',
                controller: 'LoginController'
            }
        }
    })
        .state('tab.rooms', {
        url: '/rooms',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-rooms.html',
                controller: 'RoomSelectionController'
            }
        }
    })
        .state('tab.room', {
        url: '/room/:roomId',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-room.html',
                controller: 'RoomController'
            }
        }
    })
        .state('tab.chat-detail', {
        url: '/chats/:chatId',
        views: {
            'tab-chats': {
                templateUrl: 'templates/chat-detail.html',
                controller: 'ChatDetailController'
            }
        }
    })
        .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountController'
            }
        }
    })
        .state('tab.login', {
        url: '/login',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-login.html',
                controller: 'LoginController'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/chats');
})
    .config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyAaMB7ShEHVuZtOeqY6aMXSH5EOA2aS48E',
        v: '3.20',
        libraries: 'geometry, visualization',
    });
});
angular.module('starter.controllers', [])
    .controller('ChatDetailController', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})
    .controller('LoginController', LoginController)
    .controller('RoomController', RoomController)
    .controller('RoomSelectionController', RoomSelectionController)
    .controller('MapController', MapController)
    .controller('AccountController', AccountController);
LoginController.$inject = ['ApiEndPoint', '$scope', '$state', '$http', '$log', '$window', '$ionicHistory', '$ionicPopup', '$ionicLoading', '$q', 'Chats', 'ApiService', 'AuthService', 'localStorageService'];
function LoginController(ApiEndPoint, $scope, $state, $http, $log, $window, $ionicHistory, $ionicPopup, $ionicLoading, $q, Chats, ApiService, AuthService, localStorageService) {
    $scope.user = {};
    $scope.loginData = {};
    $scope.rooms = undefined;
    $scope.$on('$ionicView.enter', function () {
        $log.info("page entered");
        if (localStorageService.get('locationApproved') !== true) { }
    });
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
            });
        });
    };
    $scope.register = function () {
        $scope.register = true;
    };
    //Allow user to continue anonymously
    $scope.goAnonymous = function () {
        var authentication = AuthService.goAnonymous();
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        return $state.go("tab.chats");
    };
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
            });
            def.reject(err);
        });
        return def.promise;
    };
}
RoomController.$inject = ['ChatEndPoint', 'AuthService', 'Chats', '$rootScope', '$scope', '$state', '$stateParams'];
function RoomController(ChatEndPoint, AuthService, Chats, $rootScope, $scope, $state, $stateParams) {
    $scope.$on('$ionicView.enter', function (e) {
        console.log("Entered RoomController: room roomId is", $stateParams.roomId);
        Chats.create($stateParams.roomId).then(Chats.connect($stateParams.roomId));
    });
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
        };
        try {
            Chats.add(chat);
        }
        catch (e) {
            console.log(e);
        }
        $scope.message = "";
    };
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
}
RoomSelectionController.$inject = ['$scope', '$state', '$log', '$ionicHistory', '$ionicPopup', 'Chats', 'ApiService', 'AuthService', 'localStorageService', 'PopupService', 'ChatEndPoint'];
function RoomSelectionController($scope, $state, $log, $ionicHistory, $ionicPopup, Chats, ApiService, AuthService, localStorageService, PopupService, ChatEndPoint) {
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
        $scope.radius = ApiService.getRadiusFeet();
        //Get position, catch errors
        try {
            position = localStorageService.getObject("position");
            console.log("Got position: ", position);
        }
        catch (e) {
            $ionicPopup.show({
                template: '<p>This app uses your location to place you into nearby chatrooms. In order to use this app, grant permission to use your location.</p>',
                title: "Location not found",
                buttons: [
                    { text: 'Ok' },
                ]
            });
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
        });
    });
    //Call the API with new radius after the user is
    //done moving the slider
    var timeoutId;
    $scope.onInputChange = function (radiusFeet) {
        ApiService.setRadiusMeters($scope.radius);
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
        ;
        timeoutId = setTimeout(function () {
            ApiService.setRadiusMeters(radiusFeet);
            ApiService.getRooms(position).then(function (response) {
                $scope.rooms = response.data;
            });
        }, 333);
    };
    $scope.goToRoom = function (roomId) {
        console.log("Calling goToRoom with pid", roomId);
        $state.go('tab.room', {
            roomId: roomId
        });
    };
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
        };
        $scope.user = Object.create(AuthService.authentication);
        $scope.options.icon = {};
        $scope.options.icon.url = ($scope.user.face !== '') ? $scope.user.face : undefined;
        $scope.options.icon.scaledSize = new google.maps.Size(30, 30, 'px', 'px');
    });
}
AccountController.$inject = ['AuthService', '$scope', 'PopupService'];
function AccountController(AuthService, $scope, PopupService) {
    $scope.logout = function () {
        AuthService.logOut();
        PopupService.logoutSuccess();
    };
}
angular.module('starter.services', [])
    .factory('localStorageService', ['$window', function ($window) {
        return {
            set: function (key, value) {
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                $window.localStorage[key] = value;
                return value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function (key) {
                return $window.localStorage[key] = null;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }])
    .factory('AuthService', ['$http', '$q', 'localStorageService', 'Constants', '$rootScope', function ($http, $q, localStorageService, Constants, $rootScope) {
        return {
            authentication: {
                anonymous: false,
                userName: "",
                token: "",
                name: "",
                face: ""
            },
            goAnonymous: function () {
                this.authentication.anonymous = true;
                var name = 'user';
                //create a long number for use in getting a gravatar from gravatar.com
                var gravatarRandom = Math.floor(Math.random() * (999999999999999 - 100000000000000)) + 100000000000000;
                console.log("gravatarRandom is ", gravatarRandom);
                for (var i = 0; i < 5; i++) {
                    name += Math.floor(Math.random() * (10 - 0) + 0);
                }
                this.authentication.name = name;
                this.authentication.face = "http://www.gravatar.com/avatar/" + gravatarRandom + "?d=identicon";
                console.log("emitting");
                $rootScope.$broadcast('authentication updated');
                return this.authentication;
            },
            getUser: function () {
                return this.authentication.userName;
            },
            login: function (loginData) {
                //so nested functions can reference the factory object
                var that = this;
                //var data = 'grant_type=password&username=' + encodeURIComponent(loginData.userName) + '&password=' + encodeURIComponent(loginData.password);
                var deferred = $q.defer();
                var req = {
                    method: 'POST',
                    url: Constants.ApiEndPoint + 'token',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                    },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                        "grant_type": "password",
                        "username": loginData.userName,
                        "password": loginData.password
                    }
                };
                $http(req).then(function (response) {
                    localStorageService.set('authData', response.data);
                    that.authentication.isAuth = true;
                    that.authentication.userName = response.data.userName;
                    that.authentication.access_token = response.data.access_token;
                    deferred.resolve(response);
                }, function (err, status) {
                    that.logOut();
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            logOut: function () {
                localStorageService.remove('authData');
                this.authentication = {};
                return true;
            },
            register: function (registrationObj) {
                var deferred = $q.defer();
                var opts = {
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                };
                $http.post(Constants.ApiEndPoint + 'api/account/register', registrationObj, opts)
                    .success(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            saveRegistration: function (registration) {
                this.logOut();
                return $http.post(Constants.ApiEndPoint + 'api/Account/Register', registration)
                    .then(function (response) {
                    return response;
                });
            },
            setUser: function (nameString) {
                console.log("Setting name to ", nameString);
                this.authentication.name = nameString;
            }
        };
    }])
    .factory('ApiService', ['Constants', 'AuthService', '$http', '$q', function (Constants, AuthService, $http, $q) {
        var radiusMeters = 200;
        return {
            getRadiusFeet: function () {
                return radiusMeters * 3.28084;
            },
            setRadiusMeters: function (radiusFeet) {
                //convert to meters
                radiusMeters = radiusFeet * .3048;
            },
            //getRooms returns the promise from $http.get
            getRooms: function (latLongObj) {
                console.log("In ApiService.getRooms");
                var def = $q.defer();
                var devRooms = {
                    data: [{
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
                                "Timestamp": 5678,
                                "Machine": 5678,
                                "Pid": 5678,
                                "Increment": 5678,
                                "CreationTime": "2009-06-15T13:45:30"
                            }
                        }]
                };
                //For testing purposes,
                if (Constants.Environment == "dev") {
                    console.log("In dev mode: returning hard coded rooms");
                    setTimeout(function () {
                        def.resolve(devRooms);
                    }, 300);
                    return def.promise;
                }
                var req = {
                    method: 'POST',
                    url: Constants.ApiEndPoint + 'api/Chat/Rooms/List',
                    headers: {
                        'Authorization': 'Bearer ' + AuthService.authentication.access_token,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                        "Longitude": latLongObj.Longitude,
                        "Latitude": latLongObj.Latitude,
                        "Radius": Math.floor(radiusMeters)
                    }
                };
                console.log(req.data);
                $http(req).then(function (response) {
                    console.log(response);
                    console.log("Rooms List returned ", response.data);
                    def.resolve(response);
                })
                    .then(null, function (err) {
                    console.log(err);
                    def.reject(err);
                });
                //Promise is returned to the caller in RoomSelectionController
                //To be resolved when $http response comes back
                return def.promise;
            }
        };
    }])
    .factory('Chats', ['Constants', '$http', '$q', '$rootScope', function (Constants, $http, $q, $rootScope) {
        // Might use a resource here that returns a JSON array
        //TODO: Get this connecting to a Socket.io namespace/room
        var socket;
        var currentPid;
        var chats;
        return {
            all: function () {
                return chats;
            },
            create: function (id) {
                var that = this;
                //Don't re-establish the connection to the same room
                if (!currentPid || currentPid !== id) {
                    currentPid = id;
                    console.log("ChatService connecting...");
                    return $http.get(Constants.ChatEndPoint + 'create?pid=' + id);
                }
                else {
                    console.log("Chats.create: id already created");
                    return $q.when(currentPid);
                }
            },
            connect: function (id) {
                console.log("In Chats.connect: id is ", id);
                //dont reconnect to the same namespace
                if (socket && socket.nsp.substring(1) == id) {
                    console.log("In Chats.connect: Socket already established");
                    socket = socket;
                }
                else {
                    //Make new socket connection
                    console.log("In Chats.connect: Making new socket connection");
                    console.log("In Chats.connect: Constants.ChatEndPoint is ", Constants.ChatEndPoint);
                    socket = io.connect(Constants.ChatEndPoint + id);
                    console.log("In Chats.connect: socket is ", socket);
                    chats = [];
                    $rootScope.$emit('chats updated');
                }
                socket.on('chat message', function (chat) {
                    console.log('Chat message received... ', chat);
                    chats.unshift(chat);
                    $rootScope.$emit('chats updated');
                });
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            },
            add: function (chat) {
                if (socket) {
                    console.log("Chats: emitting message");
                    socket.emit('chat message', chat);
                }
                else {
                    throw new Error("No socket connected");
                }
            }
        };
    }])
    .factory('googlemaps', ['', function () {
        return {
            none: "none"
        };
    }])
    .factory('PopupService', PopupService);
PopupService.$inject = ['$ionicPopup'];
function PopupService($ionicPopup) {
    return {
        unauthorized: unauthorized,
        logoutSuccess: logoutSuccess
    };
    function unauthorized() {
        $ionicPopup.show({
            template: '<p>You have been logged out. Please log in. </p>',
            title: "Location not found",
            buttons: [
                { text: 'Ok' },
            ]
        });
    }
    function logoutSuccess() {
        $ionicPopup.show({
            template: '<p>Successfully logged out.</p>',
            title: "Log Out",
            buttons: [
                { text: 'Ok' },
            ]
        });
    }
}
//# sourceMappingURL=app.js.map