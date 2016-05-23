describe('AuthService', function() {
    beforeEach(module('starter'));

    var AuthService, localStorageService, ApiEndPoint, $httpBackend;

    beforeEach(inject(function($injector, _$httpBackend_) {
        
        AuthService = $injector.get('AuthService');
        ApiEndPoint = $injector.get('ApiEndPoint');
        $httpBackend = _$httpBackend_;
        
        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    var successfulResult = {
        "access_token": "SOQKXtrLlTL1ScSh31qQFgxZHu2y6ajKUTRHuztnpuL6SdAJ68rFCjHXsGKnQRJmgNhb3D1eMFM2OI6k04UljKtuYx4UyT9wzSZU7ILz6AXsv5FXkDz_Qnn5YRI6ojYQyroYkJoOYa_CTyA_wMVUj5v78qE5gUxrfh0//haVpN5aODRZA48jK6h_qzfVAmQPFJbzJPY8RhAPZNKUg3rNMSo4DHVRM1N0JmpwvRw3LjvfY72oUIHBQQPYWvXlpRZ//7CAkEiViMaGccrDFfO_vr2cVS3WCunlZOZoM9Oy7d9r6fci2ffJU660ARbRrFUb8lg0Cgi0NwqiKjOqNy24zffvVz7//mRg_rSLnOAXBIYL3ZVkuL-eqg3dAmqDG7V8YsJDPuRsGLmS8yXmjuErR_8DuW6_KJ7johwII0deOWgCtDrOgYJTTe7//ktpC92XrFAJqlLTYZCsNuIt2bDXJQym2CvYpqGda10f_9bK8tFyCEGSEiSD0SHO9miRCYhd6G-_WZY7",
        "token_type": "bearer",
        "expires_in": 1209599,
        "userName": "youremail@domain.com",
        ".issued": "Wed, 17 Feb 2016 21:13:50 GMT",
        ".expires": "Wed, 02 Mar 2016 21:13:50 GMT"
    };

    it("should set AuthService.authentication.isAuth === true", function() {
        
        var testCredentials = {
            "Email": "d@d.com",
            "Password": "password1"
        }
        
        $httpBackend.expectPOST(ApiEndPoint.url + '/token')
            .respond(200, successfulResult);
        
        var result = AuthService.login(testCredentials);
        $httpBackend.flush()
        expect(AuthService.authentication.isAuth).toBe(true);
    });

});
