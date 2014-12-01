angular.module('app')
  .controller('tabsController', function($scope) {
    $scope.values = [1, 2, 3, 4];
    $scope.labels = ['Alpha', 'Beta', 'Omega', 'Daffy Duck'];
    $scope.current = 0;
  });