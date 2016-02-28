angular.module('LoginController', [])
.controller('LoginController', function(
  $scope,
  $state, 
  $log,
  $window, 
  $ionicHistory,
  $ionicPopup, 
  Chats, 
  AuthService,
  localStorageService) {

  $scope.user = {};
  $scope.loginData ={};

  $scope.validate = function() {
    $log.info($scope.user);
    //TODO: Validate, replace window with local storage
    window.loggedin = true;
    
    $state.go("tab.chats");
  };


  $scope.$on('$ionicView.enter', function() {
    $log.info("page entered");
    if (localStorageService.get('locationApproved') !== true) {
    }
  })
  $scope.login = function(){

    AuthService.login($scope.loginData)
      .then(function (response) {
        console.log("Success");
        $state.go("tab.chats");
    }, function(err) {
        console.log("Couldn't log you in");
    });
      
  }
  $scope.register = function(){
    $scope.register = true;
  }

  $scope.goAnonymous = function(){
    var authentication = AuthService.goAnonymous();

    $ionicHistory.nextViewOptions({disableBack:true});

    $state.go("tab.chats");
    return authentication;
  }
})