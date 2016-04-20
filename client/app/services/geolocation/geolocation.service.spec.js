'use strict';

describe('Service: Geolocation', function () {

  // load the service's module
  beforeEach(module('goodDeedHuntingApp'));

  // instantiate service
  var geolocation;
  beforeEach(inject(function (_geolocation_) {
    geolocation = _geolocation_;
  }));

  it('should do something', function () {
    expect(!!geolocation).toBe(true);
  });

});
