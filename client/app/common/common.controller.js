'use strict';

angular.module('goodDeedHuntingApp')
  .controller('CommonCtrl', function ($scope, $http, socket, Common, Geolocation, Earth, Auth) {
    
    var guildDetailModal,
        uDetailModal,
        cmErrModal,
        prevGuildId,
        devices = [
                    {sel: ".device-xs", dim: 200},
                    {sel: ".device-sm", dim: 300},
                    {sel: ".device-md", dim: 400},
                    {sel: ".device-lg", dim: 400}
                  ];

    $scope.uDetail;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isThumbable = Auth.isThumbable;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    function checkModalStates() {
      
      if(!guildDetailModal || guildDetailModal.length === 0) {
        guildDetailModal = $("#gdDetailModal");

        if(guildDetailModal.length > 0) {
          $('#gdNavPills a').click(function (evt) {

            evt.preventDefault();
            $(this).tab('show');
          });
        }
      }

      if(!uDetailModal || uDetailModal.length === 0) {
        uDetailModal = $("#uDetailModal");

        if(uDetailModal.length > 0) {
          $('#udNavPills a').click(function (evt) {

            evt.preventDefault();
            $(this).tab('show');
          });
        }
      }

      if(!cmErrModal || cmErrModal.length === 0) {
        cmErrModal = $("#cmErrModal");
      }

      cmErrModal = $("#cmErrModal");

    }

    $scope.guildDetail = function(guildId) {
      console.info(guildId);

      Common.guildDetail(guildId, function(error, guild) {
         console.info("Got guild ", guild);
        
        $scope.gdDetail = guild;
        
        if(!prevGuildId || prevGuildId !== guild._id) {

          if(!prevGuildId) {
            var dim = ($(devices).filter(function(indx, entry) {
                              return $(entry.sel).is(":visible");
                            })[0] || {dim: 200}).dim;
            $("#gdGlobe").attr({"width": dim, "height": dim});
          }
          
          Earth.createGlobe(guild._memberIds);
          prevGuildId = guild._id;
        }

        checkModalStates();

        guildDetailModal.modal("show");
      });
      
    };

    $scope.userDetail = function(userId) {

      Common.userDetail(userId, function(error, user) {
         console.info("Got user ", user);
        
        $scope.uDetail = user;

        checkModalStates();
        
        uDetailModal.modal("show");

        console.info("Show invoked");
      });
    };

    $scope.updateGeolocation = function (address, userId) {

      Geolocation.geolocation(address, userId, function() {
        console.info("Returned from service call ", arguments);
        
      });
    };

    $scope.getDataUrl = function(img) {
      var canvas = $("#dataUrl")[0],
          ctx;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      return canvas.toDataURL("image/png");
    };

    $scope.handleError = function(msg) {
      $scope.errMsg = msg;

      checkModalStates();

      cmErrModal.modal("show");

    };
    
  });