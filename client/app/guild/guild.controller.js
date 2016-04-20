'use strict';

angular.module('goodDeedHuntingApp')
  .controller('GuildCtrl', function ($scope, $http, $controller, socket) {
    
    angular.extend(this, $controller('CommonCtrl', {$scope: $scope}));

    $scope.guilds = [];

    $http.get('/api/guilds').success(function(guilds) {
      console.info("Got guilds ", guilds);

      $scope.guilds = guilds;
    });

  });
