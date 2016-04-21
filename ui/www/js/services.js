angular.module('starter.services', [])
    .factory('localStorageService', ['$window', function($window) {
        return {
            set: function(key, value) {
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }

                $window.localStorage[key] = value;
                return value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function(key) {
                return $window.localStorage[key] = null;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }])
    .factory('AuthService', ['$http', '$q', 'localStorageService', 'ApiEndPoint', '$rootScope', function($http, $q, localStorageService, ApiEndPoint, $rootScope) {

        return {
            authentication: {
                anonymous: false,           
                userName: "",
                token: "",
                name: "",
                face: ""
            },
            goAnonymous: function() {
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
            getUser: function() {
                return authentication.userName;
            },
            login: function(loginData) {
                //so nested functions can reference the factory object
                var that = this;
                var data = 'grant_type=password&username=' + encodeURIComponent(loginData.userName) + '&password=' + encodeURIComponent(loginData.password);
                
                var deferred = $q.defer();
                var req = {
                    method: 'POST',
                    url: ApiEndPoint.url + '/token',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                    },
                    transformRequest: function(obj) {
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

                $http(req).then(function(response) {

                    localStorageService.set('authData', response.data);

                    that.authentication.isAuth = true;
                    that.authentication.userName = response.data.userName;
                    that.authentication.access_token = response.data.access_token;

                    deferred.resolve(response);
                }, function(err, status) {
                    that.logOut();
                    deferred.reject(err);
                });

                return deferred.promise;
            },
            logOut: function() {
                localStorageService.remove('authData');
                this.authentication = {};
                
            },

            register: function(registrationObj) {
                var deferred = $q.defer();
                var opts = {
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                };
                $http.post(ApiEndPoint.url + '/api/account/register', registrationObj, opts)
                    .success(function(data) {
                        deferred.resolve(data);
                    });
                return deferred.promise;

            },
            saveRegistration: function(registration) {
                this.logOut();

                return $http.post(ApiEndPoint.url + '/api/Account/Register', registration)
                    .then(function(response) {
                        return response;
                    })
            },

            setUser: function(nameString) {
                console.log("Setting name to ", nameString);
                this.authentication.name = nameString;
            }
        };
    }])
    .factory('ApiService', ['ApiEndPoint', 'AuthService', '$http', '$q', function(ApiEndPoint, AuthService, $http, $q) {

        var radiusMeters = 200;
        return {
            getRadiusFeet: function() {
                return radiusMeters * 3.28084;
            },
            setRadiusMeters: function(radiusFeet) {
                //convert to meters
                radiusMeters = radiusFeet * .3048;
            },

            //getRooms returns the promise from $http.get
            getRooms: function(latLongObj) {
                console.log("In get rooms");
                
                
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
                            "Timestamp": 1234,
                            "Machine": 1234,
                            "Pid": 1234,
                            "Increment": 1234,
                            "CreationTime": "2009-06-15T13:45:30"
                        }
                    }]
                };
                //For testing purposes, comment out for prod
                //if (devRooms) {
                //    console.log("In dev mode: returning hard coded rooms")
                //    setTimeout(function() {
                //        def.resolve(devRooms);
                //    }, 300);

                //    return def.promise;
                //}                
                
                var req = {
                    method: 'POST',
                    url: ApiEndPoint.url + '/api/Chat/Rooms/List',
                    headers: {
                        'Authorization': 'Bearer '+AuthService.authentication.access_token,
                        'Content-Type': 'application/x-www-form-urlencoded'                             
                    },
                    transformRequest: function(obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                        "Longitude":"-97.8535807999",
                        "Latitude":"30.2328586",
                        "Radius": Math.floor(radiusMeters)
                    }
                };
                console.log(req.data);
                $http(req).then(function(response) {
                        console.log("Rooms List returned ", response.data);
                        def.resolve(response);
                    })
                    .then(null, function(err) {
                        def.reject(err);
                    });
                //Promise is returned to the caller in RoomSelectionController
                //To be resolved when $http response comes back
                return def.promise;
            }

        };
    }])
    .factory('Chats', ['ChatEndPoint', '$http', '$q', '$rootScope', function(ChatEndPoint, $http, $q, $rootScope) {

        // Might use a resource here that returns a JSON array
        //TODO: Get this connecting to a Socket.io namespace/room
        var socket;
        var currentPid;
        // Some fake testing data
        var chats = [];/* = [{
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'img/ben.png'
        }, {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'img/max.png'
        }, {
            id: 2,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'img/adam.jpg'
        }, {
            id: 3,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'img/perry.png'
        }, {
            id: 4,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.png'
        }];*/

        return {
            all: function() {
                return chats;
            },
            create: function(roomPid) {
                var that = this;
                //Don't re-establish the connection to the same room
                if (!currentPid || currentPid !== roomPid) {
                    currentPid = roomPid;
                    console.log("ChatService connecting...");
                    return $http.get(ChatEndPoint.url + 'create?pid=' + roomPid)
                } else {
                    console.log("Chats.create: roomPid already created")
                    return $q.when(currentPid);
                }
            },
            connect: function(roomPid) {
                console.log("In Chats.connect: roomPid is ", roomPid);
                console.log("socket is ",socket);
                //dont reconnect to the same namespace
                if (socket && socket.nsp.substring(1) == roomPid) {
                    console.log("In Chats.connect: Socket already established");
                    socket = socket;
                } else {
                    //Make new socket connection
                    console.log("In Chats.connect: Making new socket connection");
                    socket = io.connect(ChatEndPoint.url + roomPid);
                    chats = [];    
                    $rootScope.$emit('chats updated');
                }
                
                socket.on('chat message', function(chat) {
                    console.log('Chat message received... ', chat);
                    chats.unshift(chat);
                    $rootScope.$emit('chats updated');
                })
            },
            remove: function(chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function(chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            },
            add: function(chat) {
                if (socket) {
                    console.log("Chats: emitting message");
                    socket.emit('chat message', chat);
                } else {
                    throw new Error("No socket connected");
                }

            }
        };
    }])
    .factory('googlemaps', ['', function() {
        return {
            none: "none"
        };
    }])