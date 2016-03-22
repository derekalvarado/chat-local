angular.module('RoomController', [])
  .controller('RoomController', [
    'ChatEndPoint',
    'AuthService',
    'Chats',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    function(
      ChatEndPoint,
      AuthService,
      Chats,
      $rootScope,
      $scope,
      $state,
      $stateParams) {

      $scope.$on('$ionicView.enter', function(e) {
        console.log($stateParams.roomId);
        
      })
      $scope.chats;
      $scope.chats = Chats.all();
      $rootScope.$on('chats updated', function() {
        console.log('RoomController: chats update event heard');
        $scope.chats = Chats.all();
        $scope.$apply();
      });

      $scope.postMessage = function(message) {
        var chat = {
          name: AuthService.authentication.name,
          face: AuthService.authentication.face,
          lastText: message
        }
        try {
          Chats.add(chat);  
        } 
        catch (e) {
          console.log(e);
        } 
        $scope.message = "";
      };

      $scope.remove = function(chat) {
        Chats.remove(chat);
      };
    }
  ])
