describe('LoginController', function(){
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

	beforeEach(inject(function(_$controller_, _$q_, _UserSvc_, _$httpBackend_) {
		$controller = _$controller_;
		$httpBackend = _$httpBackend_;
		UserSvc = _UserSvc_;
		$q = _$q_;
	}))

	it('should return user token', function() {
		var response; 

		var expectedUrl = /https:\/\/api.chatlocal.com\/v1\/user\/login/;
		$httpBackend.when('POST', expectedUrl)
			.respond(200, tokenData);
		$httpBackend.when('POST', expectedUrl)
		.respond(200, tokenData);


		UserSvc.login(testUser)
			.then(function(data) {
				response = data;
			});

		$httpBackend.flush();

		expect(response).toEqual(tokenData);




	})

})