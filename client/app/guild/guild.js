'use strict';

angular.module('goodDeedHuntingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/guild', {
        templateUrl: 'app/guild/guild.html',
        controller: 'GuildCtrl'
      });
  });
