describe('Test', function() {
    beforeEach(module('starter'));
//    beforeEach(module('starter.services'));
//    beforeEach(module('starter.controllers'));

    var scope;
    var $cordovaDevice;
    beforeEach(angular.mock.inject(function($rootScope){
        
        scope = $rootScope.$new();
        $cordovaDevice = {};
    }))
    it("Should be true", function() {
        expect(true).toBe(true);
    })



})
