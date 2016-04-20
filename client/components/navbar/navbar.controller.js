'use strict';

angular.module('goodDeedHuntingApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }, {
      'title': 'Guilds',
      'link': '/guild'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    var shopModal;

    $scope.buyGoodies = function() {

      if(!shopModal || shopModal.length === 0) {
        shopModal = $("#shopModal");

        if(shopModal.length > 0) {
          $('#shopNavPills a').click(function (evt) {

            evt.preventDefault();
            $(this).tab('show');
          });
        }
      }

      shopModal.modal("show");
    };

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });