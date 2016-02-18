describe('ChatsCtrl', function(){
	beforeEach(module('starter'));

	var $controller;

	beforeEach(inject(function(_$controller_, _Chats_) {
		$controller = _$controller_;
		Chats = _Chats_;
	}))

	describe('Chat.all()', function() {
		it('Should return an array', function() {
			expect(Array.isArray(Chats.all())).toBe(true);
		})
	})
	describe('Chat.add()', function() {
		it('Should be a numeric value representing'+
			' length of chats array', function() {
			expect(typeof Chats.add()).toBe('number');
		})
	})

	describe('$scope.postMessage', function() {
		it('Pushes a new message to the front of the chats array', function() {
			var $scope = {};

			var controller = $controller('ChatsCtrl', {$scope: $scope});
			chat = {};

			var originalLength = Chats.all().length;
			expect(Chats.add(chat)).toEqual(originalLength+1)
			
		})
	})

})
