angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state) {
  $scope.goto2 = function(){
    $state.go("tab.account");
  };
})
.controller('ChatsCtrl', function(
  $scope, 
  $state, 
  $log, 
  $ionicHistory, 
  Chats, 
  UserSvc, 
  localStorageService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  
  //TODO: replace this with user saved to local storage
  window.loggedin = false;

  $scope.$on('$ionicView.enter', function(e) {
    //TODO: Replace these globals with local storage
    var authData = UserSvc.authentication;
    if (!authData.isAuth & !window.anonymous) {
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
})
.controller('LoginCtrl', function($scope, $state, $log, $ionicHistory, Chats, UserSvc) {
  $scope.user = {};
  $scope.loginData ={};

  $scope.validate = function() {
    $log.info($scope.user);
    //TODO: Validate, replace window with local storage
    window.loggedin = true;
    
    $state.go("tab.chats");
  };
  $scope.login = function(){
    

    UserSvc.login($scope.loginData)
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
    var newUser = {
      name: "random1234",
      img: "img/perry.png",

    }

    UserSvc.setUser(newUser);

    //TODO: replace window with local storage
    window.anonymous = true;
    $ionicHistory.nextViewOptions({disableBack:true});

    $state.go("tab.chats");
  }
})
.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  
});
