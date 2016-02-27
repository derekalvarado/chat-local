angular.module('starter.controllers', ['ChatsController', 'LoginController'])

.controller('DashController', function($scope, $state) {

})



.controller('ChatDetailController', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountController', function($scope) {
  
});
