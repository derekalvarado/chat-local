// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'MapController','starter.services', 'uiGmapgoogle-maps'])
.constant('ApiEndPoint', {
    url: "https://credimus.ddns.net:4433/ChatApi"
})
.constant('ChatEndPoint', {
  url: "https://chat-local-derekalvarado.c9users.io/"
})
.run(function($ionicPlatform, localStorageService, $ionicPopup) {
  $ionicPlatform.ready(function() {
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
        navigator.geolocation.getCurrentPosition(function success(location) {
            console.log("Lat: %s, Lng: %s",
                location.coords.latitude,
                location.coords.longitude
            );
            var position = {};
            position.latitude = location.coords.latitude;
            position.longitude = location.coords.longitude;


            localStorageService.remove('position');
            localStorageService.setObject('position', position);

        },
        function error(err) {

            $ionicPopup.show({
                template: '<p>This app uses your location to place you into nearby chatrooms. In order to use this app, grant permission to use your location.',
                title: "Location permission",
                buttons: [
                    { text: 'Ok' },
                ]
            })
        })
      }

  });
})

.config(function($stateProvider, $urlRouterProvider) {

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
                    templateUrl: 'templates/tab-chats.html',
                    controller: 'ChatsController'
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
                    templateUrl: 'templates/login.html',
                    controller: 'LoginController'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/chat');
})
.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyAaMB7ShEHVuZtOeqY6aMXSH5EOA2aS48E',
    v: '3.20',
    libraries: 'geometry, visualization',


  })
})