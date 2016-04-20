'use strict';

describe('Controller: GuildCtrl', function () {

  // load the controller's module
  beforeEach(module('goodDeedHuntingApp'));

  var GuildCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GuildCtrl = $controller('GuildCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
