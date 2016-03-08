//Moved a lot of controllers out of here into their own <name>.controller.js file
angular.module('starter.controllers', ['ChatsController', 'LoginController', 'MapController'])

.controller('DashController', function($scope, $state) {

})



.controller('ChatDetailController', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountController', function($scope) {
  
});
