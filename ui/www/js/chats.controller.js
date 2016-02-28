
angular.module('ChatsController', [])
.controller('ChatsController', ['$scope','$state','$log','$ionicHistory','Chats','AuthService','localStorageService', function(
  $scope, 
  $state, 
  $log, 
  $ionicHistory, 
  Chats, 
  AuthService, 
  localStorageService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  

  var authData = AuthService.authentication;
  $log.info(authData);
  $scope.$on('$ionicView.enter', function(e) {
    
    
    if (!authData.isAuth & !authData.anonymous) {
      $log.info("Redirecting to login");
      $ionicHistory.nextViewOptions({disableBack:true});
      $state.go("tab.login");  
    } else {
      $scope.authData = localStorageService.get("authorizationData");
    }
    
    
  });

  var socket = io.connect('https://chat-local-derekalvarado.c9users.io/');

  $scope.postMessage = function(message) {

    var chat = {
      name: AuthService.authentication.name,
      face: AuthService.authentication.face,
      lastText: message
    }

    socket.emit('chat message', chat);

    Chats.add(chat);
    $scope.message = "";
  };
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
}])