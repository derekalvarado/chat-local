
angular.module('ChatsController', [])
.controller('ChatsController', ['$scope','$state','$log','$ionicHistory','Chats','AuthService','localStorageService', 'ChatEndPoint', function(
  $scope, 
  $state, 
  $log, 
  $ionicHistory, 
  Chats, 
  AuthService, 
  localStorageService,
  ChatEndPoint) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  
  var socket = socket = io.connect(ChatEndPoint.url);
  $scope.$on('$ionicView.enter', function(e) {  
    
    if (!AuthService.authentication.isAuth & !AuthService.authentication.anonymous) {
      $log.info("Redirecting to login");
      $ionicHistory.nextViewOptions({disableBack:true});
      $state.go("tab.login");  
    } else {
      console.log("Connecting socket to ", ChatEndPoint.url);
      
    }
    
  });

  socket.on('chat message', function(chat) {
    console.log('Chat message received... ', chat);
    Chats.add(chat);
    $scope.chats = Chats.all();
    $scope.$apply();

  })
  $scope.postMessage = function(message) {

    if (!socket) {
      console.log("No socket present");
      return;
    }

    var chat = {
      name: AuthService.authentication.name,
      face: AuthService.authentication.face,
      lastText: message
    }

    console.log("Emitting message...");
    socket.emit('chat message', chat);

    //Chats.add(chat);
    $scope.message = "";
  };


  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
}])