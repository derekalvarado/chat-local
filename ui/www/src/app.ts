
/// <reference path="../../typings/tsd.d.ts" />
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ngCordova', 'ionic', 'starter.controllers', 'starter.services', 'uiGmapgoogle-maps'])

  .constant('Constants', {
    ApiEndPoint: "http://credimus.ddns.net:8080/chatapi/",
    //ChatEndPoint: "https://chat-local-derekalvarado.c9users.io/",
    ChatEndPoint: "http://localhost:3000/",
    Environment: "prod"
  })
  .run(function ($ionicPlatform, AuthService, localStorageService, PopupService, $rootScope, $ionicLoading) {

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
        var position = { latitude: null, longitude: null, altitude: null };
        var watchID = navigator.geolocation.watchPosition(function success(location) {
          console.log("Lat: %s, Lng: %s",
            location.coords.latitude,
            location.coords.longitude
          );



          position.latitude = location.coords.latitude;
          position.longitude = location.coords.longitude;
          position.altitude = location.coords.altitude;
          localStorageService.setObject('position', position);

        }, function error(err) {
           PopupService.noGeoLocation();
          })
      }

      //Get authData when app starts up
      var authData = localStorageService.getObject('authData');
      console.log("authData is ", authData)

      if (authData) {
        AuthService.authentication = authData;
      }


    });
    //Handle showing and hiding spinners for loading events
    $rootScope.$on("loading:show", function () {
      $ionicLoading.show({ template: '<ion-spinner icon="lines"></ion-spinner>' });
    })
    $rootScope.$on("loading:hide", function () {
      $ionicLoading.hide();
    })
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
      }
    })
  })

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {


    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:
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
        params: {
          roomTitle: "Unknown Chat Room"
        },
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
      .state('tab.camera', {
        url: '/account/camera',
        views: {
          'tab-account': {
            templateUrl: 'templates/camera.html',
            controller: 'CameraController'
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
    $urlRouterProvider.otherwise('/tab/rooms');
  })
  .config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyAaMB7ShEHVuZtOeqY6aMXSH5EOA2aS48E',
      v: '3.20',
      libraries: 'geometry, visualization',


    })
  })
