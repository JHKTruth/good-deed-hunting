'use strict';

angular.module('goodDeedHuntingApp')
  .factory('Geolocation', function ($http) {
    
    return {
      geolocation: function (address, userId, callback) {
        $http.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + address).
          success(function(data, status, headers, config) {
            console.info("Data ", arguments);

            if(status === 200) {
              var location = data.results[0].geometry.location,
                  lng = location.lng,
                  lat = location.lat;

              $http.put("/api/users/" + userId + "/geolocation/" + lng + "/" + lat).
                success(function() {
                  console.info("Successfully updated user's location");

                  if(callback) {
                    callback(null, location);
                  }
                }).
                error(function() {
                  console.error("Error in updating user's location for Geolocation");
                  
                  if(callback) {
                    callback(new Error("Error in updating user's location " + JSON.stringify(arguments)));
                  }
                });
              }else {
                console.error("Crap something went wrong in Geolocation", arguments);

                if(callback) {
                  callback(new Error("Error in Geolocation " + JSON.stringify(arguments)));
                }
              }
            
          }).
          error(function(data, status, headers, config) {
            console.error("Crap something went wrong in Geolocation", arguments);

            if(callback) {
              callback(new Error("Error in Geolocation " + JSON.stringify(arguments)));
            }
          });
      }
    };
  });
