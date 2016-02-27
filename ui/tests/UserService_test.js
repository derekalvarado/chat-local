describe('UserService', function() {
    beforeEach(module('starter'));
    var UserService, $httpBackend, ApiEndPoint;

    var successfulResult = {
        "access_token": "SOQKXtrLlTL1ScSh31qQFgxZHu2y6ajKUTRHuztnpuL6SdAJ68rFCjHXsGKnQRJmgNhb3D1eMFM2OI6k04UljKtuYx4UyT9wzSZU7ILz6AXsv5FXkDz_Qnn5YRI6ojYQyroYkJoOYa_CTyA_wMVUj5v78qE5gUxrfh0haVpN5aODRZA48jK6h_qzfVAmQPFJbzJPY8RhAPZNKUg3rNMSo4DHVRM1N0JmpwvRw3LjvfY72oUIHBQQPYWvXlpRZ7CAkEiViMaGccrDFfO_vr2cVS3WCunlZOZoM9Oy7d9r6fci2ffJU660ARbRrFUb8lg0Cgi0NwqiKjOqNy24zffvVz7mRg_rSLnOAXBIYL3ZVkuL-eqg3dAmqDG7V8YsJDPuRsGLmS8yXmjuErR_8DuW6_KJ7johwII0deOWgCtDrOgYJTTe7ktpC92XrFAJqlLTYZCsNuIt2bDXJQym2CvYpqGda10f_9bK8tFyCEGSEiSD0SHO9miRCYhd6G-_WZY7",
        "token_type": "bearer",
        "expires_in": 1209599,
        "userName": "youremail@domain.com",
        ".issued": "Wed, 17 Feb 2016 21:13:50 GMT",
        ".expires": "Wed, 02 Mar 2016 21:13:50 GMT"
    }

    beforeEach(inject(function($injector) {
        localStorageService = $injector.get('localStorageService');
        UserService = $injector.get('UserService');
        $httpBackend = $injector.get('$httpBackend');
        ApiEndPoint = $injector.get('ApiEndPoint');

        $httpBackend.when('GET', /.*\.html/).respond(200);
        
    }));
    
    describe('Login', function() {

        it("should set UserService.authentication.isAuth === true", function() {
            var testCredentials = {
                "Email":"d@d.com",
                "Password":"password1"
            };


            $httpBackend.expectPOST(ApiEndPoint+'/token')
                .respond(200, successfulResult);
            var result = UserService.login(testCredentials);
            $httpBackend.flush();

            expect(UserService.authentication.isAuth).toBe(true);
        });
    });

})