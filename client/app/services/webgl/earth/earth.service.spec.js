'use strict';

describe('Service: earth', function () {

  // load the service's module
  beforeEach(module('goodDeedHuntingApp'));

  // instantiate service
  var earth;
  beforeEach(inject(function (_earth_) {
    earth = _earth_;
  }));

  it('should do something', function () {
    expect(!!earth).toBe(true);
  });

});
