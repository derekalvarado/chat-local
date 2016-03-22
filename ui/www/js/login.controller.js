angular.module('LoginController', [])
  .controller('LoginController', function(
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

      $ionicHistory.nextViewOptions({ disableBack: true });

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
            buttons: [
              { text: 'Ok' },
            ]
          })
          def.reject(err);

        });
      return def.promise;
    }
  })
