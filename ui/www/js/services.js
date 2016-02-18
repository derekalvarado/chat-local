angular.module('starter.services', [])
.factory('localStorageService', ['$window', function($window){
  return {
    set: function(key, value) {
      if (typeof value === 'string') {
        value = JSON.stringify(value);
      }

      $window.localStorage[key] = value;
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

.factory('UserSvc', ['$http', '$q', 'localStorageService', 'ApiEndPoint', function($http, $q, localStorageService, ApiEndPoint){
  "use strict";

  var serviceBase = "https://credimus.ddns.net:4433/ChatApi"//ApiEndPoint.url;
  var currentUser = {
    name: "Derek",
    img: "img/adam.jpg",    
  };

  var _authentication = {
    isAuth: false,
    username: ""
  };
  var _logOut = function () {

      localStorageService.remove('authorizationData');

      _authentication.isAuth = false;
      _authentication.userName = "";

  };

  var _saveRegistration = function (registration) {
    _logOut();

    return $http.post(serviceBase + '/api/Account/Register', registration)
                .then(function (response) {
                  return response;
                })
  };

  var _login = function (loginData) {
    var data = 'grant_type=password&username='+encodeURIComponent(loginData.username)+'&password='+encodeURIComponent(loginData.password);

    //var data = 'grant_type=password&username=33ssrj%2Bc8q7mvme3cfsw%40sharklasers.com&password=Password1!'
    console.log(data);
    var deferred = $q.defer();

    $http.post(serviceBase+'/token', data, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .success(function (response){
          localStorageService.set('authorizationData', {token: response.access_token, username: loginData.username});

          _authentication.isAuth = true;
          _authentication.username =  loginData.username;

          deferred.resolve(response);
        }).error(function(err, status){
          _logOut();
          deferred.reject(err);
        })

        return deferred.promise;
  };

  return {
    getUser: function() {
      return currentUser;
    },
    login: _login,
    //register: _register,
    authentication: _authentication,
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


