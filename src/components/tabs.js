/**
 * Tabs directive
 *
 * @param values [array]
 * @param labels [array]
 * @param current [integer]
 */

angular.module('ngSwipe')

.directive('tabs', function($timeout, $window, swipeUtils) {
  return {
    restrict: 'A',
    scope: {
      values: '=',
      labels: '=',
      current: '='
    },
    template: [
      '<div class="tabs">',
      '  <div class="tab" ng-repeat="label in labels track by $index" ng-class="{current: $index == current}">{{label}}</div>',
      '</div>',
    ].join(''),
    link: function(scope, elements, attr, model) {

      // Inject custom css

      swipeUtils.injectCss([
        '[tabs] {',
        '  overflow: hidden;',
        '}',

        '[tabs] .tabs {',
        '  white-space: nowrap;',
        '  font-size: 0;',
        '}',

        '[tabs] .tab {',
        '  display: inline-block;',
        '}'
      ].join(''), 'ngSwipeCarouselCss');

      // Get references to various dom elements

      scope.wrapper = elements[0];
      scope.element = elements[0].querySelector(".tabs");

      // Precalculate various values

      scope.precalc = function() {

        // Initialize array of tab elements when it changes

        scope.tabs = scope.element.querySelectorAll('.tab');

        // Assign index to a data attribute

        angular.forEach(scope.tabs, function(tab, index) {
          tab['data-index'] = index;
        });

        // Compute total tab width

        scope.totalTabWidth = swipeUtils.computeWidths(scope.tabs);

        // Compute wrapper width

        scope.wrapperWidth = swipeUtils.computeWidth(scope.wrapper);
      };

      // Update precalc when tab values change

      scope.$watchCollection(['values', 'labels'], function() {
        $timeout(function() { // We need to wait until the elements have been created by angular
          scope.precalc();
        });
      });

      // Update precalc whenever window resizes

      angular.element($window).bind('resize', scope.precalc);

      // Snap to the selected tab when selection changes

      scope.$watch('current', function(current) {
        scope.snapTo(current);
      });

      // Initialize

      swipeUtils.transformTo(scope.element, 0, 0);
      scope.precalc();

      // Snap to a particular tab

      scope.snapTo = function(index) {
        scope.current = index;

        // Is this tab visible without centering?

        var offsetLeft = scope.tabs[index].offsetWidth / 2;
        var offsetRight = scope.tabs[index].offsetWidth / 2;

        for(var ii = 0; ii < scope.tabs.length; ii++){
          if(ii < index){
            offsetLeft += scope.tabs[ii].offsetWidth;
          }

          if(ii > index){
            offsetRight += scope.tabs[ii].offsetWidth;
          }
        }

        var wrapperCenter = scope.wrapperWidth / 2;

        // Left align

        if(offsetLeft <= wrapperCenter){
          swipeUtils.transformTo(scope.element, 0, 200);

        // Right align

        }else if(offsetRight <= wrapperCenter){
          swipeUtils.transformTo(scope.element, scope.wrapperWidth - scope.totalTabWidth, 200);

        // Center on selected tab

        }else{
          var center = wrapperCenter - scope.getCenter(index);
          scope.transformTo(scope.container, center, 200);
        }
      }

      // Calculate the center of a tab

      scope.getCenter = function(index) {
        var tab = scope.elements[index];
        var center = tab.offsetLeft + swipeUtils.computeWidth(tab) / 2;
        return center;
      };

      // Handle taps on tabs

      new Hammer(scope.draggable).on('tap', function(e) {
        var index = e.target['data-index'];
        if(index >= 0){
          scope.$apply(function() {
            scope.current = index;
          });
        }
      });

      // Handle dragging the menu

      var panStart = null;

      new Hammer(scope.draggable).on('panstart panend panleft panright', function(e) {
        // Save the transform when the pan event starts

        if(panStart === null){
          panStart = scope.getTransform(scope.container);
        }

        // If the new offset isn't beyond the edges of the tabs, update the transform as we drag

        var offset = panStart + e.deltaX;

        if(panStart !== null){
          if(offset < 0 && -offset + scope.container.offsetWidth < scope.totalElementWidth){
            scope.transformTo(scope.container, offset, 0);
          }
        }

        // Reset things when the pan event ends

        if(e.type === 'panend'){
          panStart = null;

          // Apply some deceleration magic, with some sensible limitations at the edges

          var velocityCubed = e.velocityX * e.velocityX * e.velocityX;

          var velocityAbs = Math.abs(e.velocityX);
          var decelerationDistance, decelerationTime;
        
          if(velocityAbs < 0.1){
            decelerationDistance = 1;
            decelerationTime = 100;
          }else if(velocityAbs < 1){
            decelerationDistance = 300;
            decelerationTime = 150;
          }else if(velocityAbs < 1.5){
            decelerationDistance = 450;
            decelerationTime = 225;
          }else{
            decelerationDistance = 600;
            decelerationTime = 300;
          }

          var deceleratedOffset = offset - e.velocity * decelerationDistance;
          if(deceleratedOffset > 0){ deceleratedOffset = 0; }
          if(-deceleratedOffset + scope.container.offsetWidth > scope.totalElementWidth){ deceleratedOffset = scope.container.offsetWidth - scope.totalElementWidth; }

          // var decelerationTime = (e.velocityX / e.velocityX) * Math.abs(offset - deceleratedOffset);

          scope.transformTo(scope.container, deceleratedOffset, decelerationTime * velocityAbs);
          
          // scope.current = scope.closestIndex(panStart + e.deltaX);
          // scope.snapTo(scope.current);
        }
      });
    }
  }

  scope.cubicEasing = function(t, b, c, d){
    t /= d;
    return c * t * t * t + b;
  }
});