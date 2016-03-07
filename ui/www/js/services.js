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
        isAuth: false,
        userName: "",
        name:"",
        face: ""
      },
      goAnonymous: function() {
        this.authentication.anonymous = true;

        var name = 'user';
        //create a long number for use in getting a gravatar from gravatar.com
        var gravatarRandom = Math.floor(Math.random() * (999999999999999-100000000000000)) + 100000000000000;
        console.log("gravatarRandom is ", gravatarRandom);
        for (var i = 0; i < 5; i++) {
          name += Math.floor(Math.random() * (10 - 0) + 0);
        }

        this.authentication.name = name;

        this.authentication.face = "http://www.gravatar.com/avatar/"+gravatarRandom+"?d=identicon";
        $rootScope.$emit('authentication updated');
        return this.authentication;
      },
      getUser: function() {
          return authentication.userName;
      },
      login: function(loginData) {
          //so nested functions can reference the factory object
          var that = this;
          var data = 'grant_type=password&userName=' + encodeURIComponent(loginData.userName) + '&password=' + encodeURIComponent(loginData.password);

          var deferred = $q.defer();

          $http.post(ApiEndPoint.url + '/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
              .success(function(response) {
                  localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName });

                  that.authentication.isAuth = true;
                  that.authentication.userName = loginData.userName;

                  deferred.resolve(response);
              }).error(function(err, status) {
                  that.logOut();
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

.factory('ApiService', function() {
  return {
    getRooms: function(latLongObj) {
        var deferred = q.defer();
        var opts = {
            "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };
        $http.get(ApiEndPoint.url + '/api/chat/getrooms', latLongObj, opts)
            .success(function(data) {
                deferred.resolve(data)
            })
            .error(function(err, status) {
              deferred.reject(err);
            })
        return deferred.promise;
    }

  };
})
.factory('Chats', function() {
    
    // Might use a resource here that returns a JSON array
    io.connect('https://chat-local-derekalvarado.c9users.io/');
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
.factory('googlemaps', ['', function(){
  return {
    none: "none"
  };
}])
