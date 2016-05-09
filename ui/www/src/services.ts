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
                    })
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
                    console.log("In dev mode: returning hard coded rooms")
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
        var currentId = 0;
        var chats = {};
        var socketManager = {};

        return {
            all: all,
            connect: connect,
            remove: remove,
            get: get,
            postMessage: postMessage
        }

        function all() {
            return chats;
        }

        function connect(id) {
            var def = $q.defer();
            console.log("In Chats.connect: id is ", id);

            if (id != currentId) {

                currentId = id;
            }

            if (socketManager[id] && socketManager[id]["connected"]) {
                console.log("In Chats.connect: socket already connected to correct namespace");
                console.log("In Chats.connect: socket is ", socketManager[id]);
                socket = socketManager[id];
                $rootScope.$emit(id, chats);
                return $q.when(socket);
            } else {

                socket = io.connect(Constants.ChatEndPoint);
                socket.emit("join", { room: id });
                chats[id] = [];
                socket.on("connect", function(){
                    console.log("Socket fired connect event!")
                    socketManager[id] = socket;
                    def.resolve();
                })
                socket.on("chat message", function (data) {
                    console.log('CHAT SERVICE: Chat message received... ', data);
                    chats[data.room].unshift(data.chat);
                    $rootScope.$emit(id, chats[id]);
                })

                // chats = [];
                // $rootScope.$emit('chats updated', chats);


            }
            return def.promise;
        }

        function remove(chat) {
            chats.splice(chats.indexOf(chat), 1);
        }

        function get(id) {

            return chats[id];
        }

        function postMessage(chat) {
            if (socket) {

                console.log("Chats: emitting message ", chat);
                socket.emit('chat message', {
                    room: currentId,
                    chat: chat
                });
            } else {
                throw new Error("No socket connected");
            }

        }
    }])
    .factory('googlemaps', ['', function () {
        return {
            none: "none"
        };
    }])
    .factory('PopupService', PopupService)

PopupService.$inject = ['$ionicPopup'];
function PopupService($ionicPopup) {
    return {
        unauthorized: unauthorized,
        logoutSuccess: logoutSuccess
    }

    function failedToConnect() {
        $ionicPopup.show({
            template: "<p>Couldn't connect to chat room.</p>",
            title: "Error",
            buttons: [
                { text: 'Ok' },
            ]
        })
    }
    function unauthorized() {
        $ionicPopup.show({
            template: '<p>You have been logged out. Please log in. </p>',
            title: "Location not found",
            buttons: [
                { text: 'Ok' },
            ]
        })
    }


    function logoutSuccess() {
        $ionicPopup.show({
            template: '<p>Successfully logged out.</p>',
            title: "Log Out",
            buttons: [
                { text: 'Ok' },
            ]
        })
    }
}
