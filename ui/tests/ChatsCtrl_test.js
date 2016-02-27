describe('ChatsController:', function(){
	beforeEach(module('starter'));
	
	
	var Chats, $controller, $rootScope;	

	beforeEach(inject(function($injector, $rootScope ) {
		Chats = $injector.get('Chats');
		
		scope = $rootScope.$new();
		$controller = $injector.get('$controller');
		
		
		$controller('ChatsController', {$scope: scope});
	}))

	describe('Chats.all()', function() {
		it('Should return an array', function() {
			expect(Array.isArray(Chats.all())).toBe(true);
		})
	})
	describe('Chat.add()', function() {
		it('should return a numeric value representing length of chats array', function() {

			//var $scope.user.name = 'Derek',
			//	$scope.user.img = "something.jpg",
			//	message = "hi";

			var chatMsg = {};				
			expect(typeof Chats.add(chatMsg)).toBe('number');
		})
	})

	describe("$scope.$on('$ionicView.enter')'", function() {
		var UserService, $state, $rootScope;

		beforeEach(inject(function($injector, _UserService_) {
			$state = $injector.get('$state');
			$rootScope = $injector.get('$rootScope');
			UserService = _UserService_;
			spyOn($state, 'go');
			
			//console.log(UserService.authentication);
		}));

		it("should call $state.go", function() {
			
			UserService.authentication.isAuth = false;
			UserService.authentication.anonymous = false;

			$rootScope.$broadcast('$ionicView.enter');
			expect($state.go).toHaveBeenCalled();
		});

		it("should not call $state.go when UserService.authentication.anonymous === true", function() {
			
			
			UserService.authentication.anonymous = true;

			$rootScope.$broadcast('$ionicView.enter');
			expect($state.go).not.toHaveBeenCalled();
		});
		
		it("should not call $state.go when UserService.authentication.isAuth === true", function() {
			
			UserService.authentication.isAuth = true;
			

			$rootScope.$broadcast('$ionicView.enter');
			expect($state.go).not.toHaveBeenCalled();
		});

		
	})

//	describe('$scope.postMessage', function() {
//		it('Pushes a new message to the front of the chats array', function() {
//			var $scope = {};
//
//
//			chat = {};
//
//			var originalLength = Chats.all().length;
//			expect(Chats.add(chat)).toEqual(originalLength+1)
//			
//		})
//	})

})
