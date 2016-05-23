describe('LoginController', function() {

    //    beforeEach(module('starter.services'));
    //    beforeEach(module('starter.controllers'));
    beforeEach(module('starter'));

    var rooms = [{
        "id": "string",
        "name": "Room Name",
        "users": 8

    }, {
        "id": "string",
        "name": "Other Name",
        "users": 7
    }];

    var ApiEndPoint, AuthService, $httpBackend, $controller, controller;

    beforeEach(inject(function($injector, $rootScope) {
        ApiEndPoint = $injector.get('ApiEndPoint');
        AuthService = $injector.get('AuthService');
        $httpBackend = $injector.get('$httpBackend');
        $controller = $injector.get('$controller');

        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    describe('$scope.getRooms()', function() {
        var $scope, controller, http, response;

        beforeEach(inject(function($rootScope, _$http_) {
            $scope = $rootScope.$new();
            http = _$http_;
            controller = $controller('LoginController', { $scope: $scope, $http: http });

        }));
        afterEach(function() {
            response = '';
        })
        it("should get a list of rooms from the API", function() {
            
            var position = {
                latitude: 89.9999,
                longitude: 89.9999
            }

            $httpBackend.expectPOST(ApiEndPoint.url + '/api/chat/getrooms').respond(200, rooms);

            var data;
            $scope.getRooms(position).then(function(response){
                data = response;
            });             
            
            $httpBackend.flush();
            
            expect(data).toEqual(rooms);

        });

        it("should transition to tab.chats after getting rooms", function() {

        })

        /*it("should handle errors", function() {

            $httpBackend.expectPOST(ApiEndPoint.url + '/rooms')
                .respond(500);

            $scope.getRooms().then(function(data) {
                    response = data;
                }).catch(function(err){
                    console.log("caught");
                });

            $httpBackend.flush();
            expect(response).toEqual(rooms);

        });*/


    })


})
