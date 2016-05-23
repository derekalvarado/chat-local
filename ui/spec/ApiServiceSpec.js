describe('ApiService', function() {
  beforeEach(module('starter'));
  var ApiEndPoint, ApiService, $httpBackend;


  beforeEach(inject(function($injector) {
    ApiEndPoint = $injector.get('ApiEndPoint');
    ApiService = $injector.get('ApiService');
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', /.*\.html/).respond(200);
  }));


  var rooms = [{
    "id": "string",
    "name": "Room Name",
    "users": 8

  }, {
    "id": "string",
    "name": "Other Name",
    "users": 7
  }];

  it("should return a list of rooms", function() {
    var position = {
      latitude: 89.9999,
      longitude: 89.9999
    }

    $httpBackend.expectPOST(ApiEndPoint.url + '/api/chat/getrooms').respond(200, rooms);

    var data;
    ApiService.getRooms(position).then(function(response) {
      data = response.data;
    });

    $httpBackend.flush();
    console.log(data);
    expect(data).toEqual(rooms);
  })
})
