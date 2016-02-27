angular.module('starter.services', [])
    .factory('localStorageService', ['$window', function($window) {
        return {
            set: function(key, value) {
                if (typeof value === 'string') {
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

.factory('UserService', ['$http', '$q', 'localStorageService', 'ApiEndPoint', function($http, $q, localStorageService, ApiEndPoint) {
        "use strict";

        //TODO: fix this hardcoded stuff
        var currentUser = {
            name: "Derek",
            img: "img/adam.jpg",
        };

        
        

        var _saveRegistration = function(registration) {
            _logOut();

            return $http.post(ApiEndPoint + '/api/Account/Register', registration)
                .then(function(response) {
                    return response;
                })
        };



        return {
            
            getUser: function() {
                return currentUser;
            },
            login: function(loginData) {
                //so nested functions can reference the return object
                var that = this;
                var data = 'grant_type=password&username=' + encodeURIComponent(loginData.username) + '&password=' + encodeURIComponent(loginData.password);

                var deferred = $q.defer();

                $http.post(ApiEndPoint + '/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                    .success(function(response) {
                        localStorageService.set('authorizationData', { token: response.access_token, username: loginData.username });

                        that.authentication.isAuth = true;
                        that.authentication.username = loginData.username;

                        deferred.resolve(response);
                    }).error(function(err, status) {
                        _logOut();
                        deferred.reject(err);
                    })

                return deferred.promise;
            },
            logOut: function() {


                localStorageService.remove('authorizationData');

                this.authentication.isAuth = false;
                this.authentication.userName = "";

            },
            register: function(registrationObj) {
                var deferred = $q.defer();
                var opts = {
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                };
                $http.post(ApiEndPoint + '/api/account/register', registrationObj, opts)
                    .success(function(data) {
                        deferred.resolve(data);
                    });
                return deferred.promise;

            },
            authentication: {
                anonymous: false,
                isAuth: false,
                username: ""

            },
            setUser: function(userObj) {
                console.log("Setting user to ", userObj);
                currentUser = userObj;
            }
        };
    }])
    .factory('Chats', function() {
        "use strict";
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
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
        }];

        return {
            all: function() {
                return chats;
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
                return chats.unshift(chat);
            }
        };
    })
