'use strict';

angular.module('goodDeedHuntingApp')
  .controller('MainCtrl', function ($scope, $http, $controller, socket) {

    angular.extend(this, $controller('CommonCtrl', {$scope: $scope}));

    $scope.deeds = [];
    $scope.lastDeedTime = new Date().getTime();

    $http.get('/api/deeds/page/' + $scope.lastDeedTime).success(function(deeds) {
      $scope.deeds = deeds;
      socket.syncUpdates('deed', $scope.deeds);
    });

    $scope.addDeed = function() {
      
    };

    $scope.deedDetail = function(deedId) {
      console.info(deedId);

    };

    $scope.thumbsDeed = function(deed, addition) {
      console.info("Thumbs ", deed);
      deed.deedPluses += addition;
      
      $http.put('/api/deeds/' + deed._id + "/updatePlus/" + addition).success(function() {
        console.info("Updated thumbs " + arguments);
        
      }).
      error(function(data, status, headers, config) {
        console.error("Crap something went wrong in updating thumbs", JSON.stringify(arguments));

      });
    };

    $scope.deleteDeed = function(deed) {
      $http.delete('/api/deeds/' + deed._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('deed');
    });
  });
