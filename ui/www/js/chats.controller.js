
angular.module('ChatsController', [])
.controller('ChatsController', ['$scope','$state','$log','$ionicHistory','Chats','UserService','localStorageService', function(
  $scope, 
  $state, 
  $log, 
  $ionicHistory, 
  Chats, 
  UserService, 
  localStorageService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  

  var authData = UserService.authentication;
  $log.info(authData);
  $scope.$on('$ionicView.enter', function(e) {
    //TODO: Replace these globals with local storage
    
    if (!authData.isAuth & !authData.anonymous) {
      $log.info("Redirecting to login");
      //$ionicHistory.nextViewOptions({disableBack:true});
      $state.go("tab.login");  
    } else {
      $scope.authData = localStorageService.get("authorizationData");
    }
    
    
  });

  $scope.postMessage = function(message) {
    $log.info("Message is ", message);
    $log.info("User is ", user.name);
    
    
    var chat = {
      name: $scope.user.name,
      face: $scope.user.img,
      lastText: message
    }

    Chats.add(chat);
  };
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
}])