describe('LoginController:', function(){
	var tokenData = {
	  "access_token":"imSXTs2OqSrGWzsFQhIXziFCO3rF...",
	  "token_type":"bearer",
	  "expires_in":1209599,
	  "userName":"alice@example.com",
	  ".issued":"Wed, 01 Oct 2014 01:22:33 GMT",
	  ".expires":"Wed, 15 Oct 2014 01:22:33 GMT"
	};

	var testUser = {
		"grant_type":"password",
		"username":"derek",
		"password":"password",

	};


	beforeEach(module('starter'));

	var $controller;
	var $httpBackend;
	var UserService;
	var $q;
	var $scope;

	beforeEach(inject(function($controller, _$q_, _UserService_, $rootScope) {		
		
		UserService = _UserService_;
		$q = _$q_;
		
		$scope = $rootScope.$new();
		$controller('LoginController', {$scope: $scope});

	}))
	//handle injecting the API routes
	beforeEach(inject(function(_$httpBackend_, _ApiEndPoint_){
		$httpBackend = _$httpBackend_;
		ApiEndPoint = _ApiEndPoint_;
		
		var allOtherIonicPages = /.*\.html/;
		$httpBackend.when('POST', ApiEndPoint+'/token')
			.respond(200, tokenData);					
		$httpBackend.when('POST', ApiEndPoint+'/api/account/register')
			.respond(200, tokenData);		

		//Handle all other gets that will occur after the POST
		//using a RegExp
		$httpBackend.when('GET', allOtherIonicPages)
			.respond(200);
	}))

	describe('Login button', function() {
		it('should return user token', function() {
			var response; 

			UserService.login(testUser)
				.then(function(data) {
					response = data;
				});

			$httpBackend.flush();

			expect(response).toEqual(tokenData);

		})
	});
		
	describe('$scope.goAnonymous()', function() {
		var localStorageService;
		var $window;
		//Setup
		beforeEach(inject(function($injector){
			localStorageService = $injector.get('localStorageService');
			$window = $injector.get('$window');
		}))
			
		//Start tests
		it('should set "user\\d+" on the window  ', function() {
			var username = $scope.goAnonymous();
//			var username = 'user';
//
//			for (var i = 0; i < 5; i++) {
//				username += Math.floor(Math.random() * (10 - 0) + 0);
//			}
//
			var storedUsername = localStorageService.get('username');

			expect(storedUsername).toMatch(/user\d+/);			
		});

		it('should set in UserService.authentication.anonymous === true', function() {
			$scope.goAnonymous();			

			expect(UserService.authentication.anonymous).toBe(true);
		});
	});

	describe('Registration', function() {

		it("should receive a token when everything is correct", function() {
			var expectedUrl = ApiEndPoint+"/api/account/register";
			var deferred = $q.defer();

			var response;
			var testRegistration = {
				"Email": "derek@derek.com",
				"Password": "password1",
				"ConfirmPassword": "password1"
			}

			deferred = UserService.register(testRegistration)
				.then(function(data){
					response = data;
				});

			$httpBackend.flush();

			expect(response).toEqual(tokenData);
		});

		it("should use the correct headers", function() {
			//{"headers": {"Accept": "application/json","Content-Type": "application/json"}};
			var expectedUrl = ApiEndPoint+"/api/account/register";
			var expectedHeaders = function (headers) {
				return angular.fromJson(headers).Accept === 'application/json';
			};


			//Fake a post from the controller
			$httpBackend.expectPOST(expectedUrl, undefined, expectedHeaders)
				.respond(200, tokenData);

			var deferred = $q.defer();

			var response;
			var testRegistration = {
				"Email": "derek@derek.com",
				"Password": "password1",
				"ConfirmPassword": "password1"
			}

			deferred = UserService.register(testRegistration)
				.then(function(data){
					response = data;
				});

			$httpBackend.flush();

			expect(response).toEqual(tokenData);
		});
	});
})