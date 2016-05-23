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
    .factory('RoomService', ['Constants', 'AuthService', 'localStorageService', '$http', '$q', function (Constants, AuthService, localStorageService, $http, $q) {

        var radiusMeters = 200;
        var creationRadiusMeters = 200;
        return {
            createRoom: createRoom,
            getRadiusFeet: getRadiusFeet,
            getRadiusMeters: getRadiusMeters,
            setRadiusMeters: setRadiusMeters,
            getRooms: getRooms
        };

        function getRadiusFeet(radiusMeters) {
            return radiusMeters * 3.28084;
        }
        function setRadiusMeters(radiusFeet) {
            //convert to meters
            radiusMeters = radiusFeet * .3048;
        }
        function getRadiusMeters(radiusFeet) {
            //convert to meters
            return radiusFeet * .3048;
        }
        //getRooms returns the promise from $http.get
        function getRooms(latLongObj) {
            console.log("In RoomService.getRooms");


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
                    "Longitude": latLongObj.longitude,
                    "Latitude": latLongObj.latitude,
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

        function createRoom(roomCreationData) {
            var position = localStorageService.getObject('position')
            console.log("In RoomService.createRoom, position is ", position);
            position.latitude = new Number(position.latitude).toPrecision(9);
            position.longitude = new Number(position.longitude).toPrecision(9);
            var deferred = $q.defer()
            var req = {
                method: 'POST',
                url: Constants.ApiEndPoint + 'api/Chat/Rooms/Create',
                headers: {
                    'Authorization': 'Bearer ' + AuthService.authentication.access_token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                data: {
                    'Longitude': position.longitude,
                    'Latitude': position.latitude,
                    'Altitude': position.altitude,
                    'Radius': roomCreationData.radius,
                    'IsPrivate': false,
                    'Name': roomCreationData.name,
                    'Topic': roomCreationData.topic
                }
            };
            $http(req).then(function (data) {
                console.log(data)
                deferred.resolve(data)
            }, function (err) {
                console.log(err)
                deferred.resolve(err)
            })
            return deferred.promise
        }
    }])
    .factory('Chats', Chats)
    .factory('googlemaps', ['', function () {
        return {
            none: "none"
        };
    }])
    .factory('PopupService', PopupService)

Chats.$inject = ['Constants', '$http', '$q', '$rootScope', 'PopupService'];
function Chats(Constants, $http, $q, $rootScope, PopupService) {
    // Might use a resource here that returns a JSON array
    //TODO: Get this connecting to a Socket.io namespace/room
    var socket;
    var currentId = 0;
    var chats = {};
    var socketManager = {};

    socket = io.connect(Constants.ChatEndPoint);

    socket.on("chat message", function (data) {
        debugger;
        console.log('CHAT SERVICE: Chat message received... ', data);
        if (!chats[data.room]) {
            chats[data.room] = [];
        }
        chats[data.room].unshift(data.chat);
        $rootScope.$emit(data.room, data.chat);
    })

    return {
        all: all,
        connect: connect,
        remove: remove,
        get: get,
        getUserCount: getUserCount,
        postMessage: postMessage
    }

    function all() {
        return chats;
    }

    function connect(id) {
        var def = $q.defer();
        console.log("In Chats.connect: id is ", id);

        if (socket && socket.connected) {
            socket.emit("join", { room: id });
            currentId = id;
            return $q.when(socket);
        } else {
            def.reject("Socket not connected");
        }

        return def.promise;
    }
    //This stopped working after I turned chats into an object
    function remove(chat) {
        //     chats.splice(chats.indexOf(chat), 1);
    }

    function get(id) {
        return chats[id] === undefined ? [] : chats[id];
    }

    function getUserCount(roomIds) {
        console.log("In Chats.getUserCount. roomIds is ", roomIds);
        var deferred = $q.defer();
        var req = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

            },
            data: {
                "roomIds": roomIds
            },
            url: Constants.ChatEndPoint + "connectedUsers"
        }

        $http(req).then(function (response) {
            deferred.resolve(response);


        }, function (err) {
            PopupService.error(err);
        })

        return deferred.promise
    }

    function postMessage(chat) {
        if (socket) {

            console.log("Chats: emitting message ", chat);
            try {
                socket.emit('chat message', {
                    room: currentId,
                    chat: chat
                });
            } catch (e) {
                console.log("postmessage error: ", e);
            }

        } else {
            throw new Error("No socket connected");
        }

    }
}



PopupService.$inject = ['$ionicPopup'];

function PopupService($ionicPopup) {

    return {
        error: error,
        unauthorized: unauthorized,
        noGeoLocation: noGeoLocation,
        logoutSuccess: logoutSuccess,
        success: success
    }
    function error(err) {
        $ionicPopup.show({
            template: "<p>There was an error. </p><br>" + err.Message,
            title: "Error",
            buttons: [
                { text: 'Ok' },
            ]
        })
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
    function noGeoLocation() {
        $ionicPopup.show({
            template: '<p>This app uses your location to place you into nearby chatrooms. In order to use this app, grant permission to use your location.</p>',
            title: "Location permission",
            buttons: [
                { text: 'Ok' },
            ]
        })
    }
    function success() {
        $ionicPopup.show({
            template: "<p>Your room has been created!</p>",
            title: "Success!",
            buttons: [
                { text: 'Ok!' },
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
