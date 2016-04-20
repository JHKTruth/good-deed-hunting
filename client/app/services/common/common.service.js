'use strict';

angular.module('goodDeedHuntingApp')
  .factory('Common', function ($http, Geolocation) {
    
    return {

      userDetail: function (userId, callback) {
        
        $http.get('/api/users/' + userId + "/showBrief").success(function(user) {
          console.info(user);

          callback(null, user);
        }).
        error(function(data, status, headers, config) {
          console.error("Crap something went wrong in Common.userDetail", arguments);

          if(callback) {
            callback(new Error("Error in Common.userDetail " + JSON.stringify(arguments)));
          }
        });
      },

      guildDetail: function (guildId, callback) {
        console.info("Guild Id ", guildId);
        
        $http.get('/api/guilds/' + guildId).success(function(guild) {
          console.info(guild);

          callback(null, guild);
        }).
        error(function(data, status, headers, config) {
          console.error("Crap something went wrong in Common.guildDetail", arguments);

          if(callback) {
            callback(new Error("Error in Common.guildDetail " + JSON.stringify(arguments)));
          }
        });
      }
    };

  });
