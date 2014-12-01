/**
 * Carousel directive
 * 
 * @todo support swipe gestures
 * @todo add scope var to pass current slide
 *
 * @param stretch [integer]
 * @param current [integer]
 */

angular.module('ngSwipe')

.directive('carousel', function($window, swipeUtils) {
  return {
    restrict: 'A',
    scope: {
      stretch: '=?',
      current: '=?'
    },
    transclude: true,
    template: '<div ng-transclude class="slides"></div>',
    link: function(scope, elements, attr, model) {

      // Set up defaults for scope variables

      if(angular.isUndefined(scope.stretch)){
        scope.stretch = 0;
      }else{
        scope.stretch = parseInt(scope.stretch, 10);
      }

      if(angular.isUndefined(scope.current)){
        scope.current = 0;
      }else{
        scope.current = parseInt(scope.current, 10);
      }

      // Get references to various dom elements

      scope.wrapper = elements[0];
      scope.element = elements[0].querySelector(".slides");
      scope.slides = elements[0].querySelectorAll(".slides > *");
      
      // Inject custom css

      swipeUtils.injectCss([
        '[carousel] {',
        '  overflow: hidden;',
        '}',

        '[carousel] .slides {',
        '  white-space: nowrap;',
        '  font-size: 0;',
        '  position: relative;',
        '}',

        '[carousel] .slides > * {',
        '  display: inline-block;',
        '  width: 100%;',
        '}'
      ].join(''), 'ngSwipeCarouselCss');

      // Hack to prevent drag events on slides (especially if they're images)

      for(var ii = 0; ii < scope.slides.length; ii++){
        swipeUtils.disableDrag(scope.slides[ii]);
      }

      // Snap to the current slide

      scope.snapToCurrent = function() {
        swipeUtils.transformTo(scope.element, -(scope.slides[scope.current].offsetLeft), 200);
      };

      // Precalculate various values

      scope.precalc = function() {
        scope.snapToCurrent();

        // Width of all tabs
        
        scope.totalSlideWidth = swipeUtils.computeWidths(scope.slides);

        // Width of slide wrapper

        scope.elementWidth = swipeUtils.computeWidth(scope.element);
      };

      // Update precalc whenever window resizes

      angular.element($window).bind('resize', scope.precalc);

      // Initialize

      swipeUtils.transformTo(scope.element, 0, 0);
      scope.precalc();

      // Handle touch events

      scope.origin = null;

      new Hammer(scope.element).on('panstart panend panleft panright', function(e) {

        // Save the transform when the pan event starts

        if(scope.origin === null){
          scope.origin = swipeUtils.getTransform(scope.element);
        }

        // Update the transform as we drag

        var offset = scope.origin + e.deltaX;

        if(scope.origin !== null){
            if(offset < scope.stretch && offset > -(scope.totalSlideWidth - scope.elementWidth) - scope.stretch){
              swipeUtils.transformTo(scope.element, offset, 0);
            }
        }

        // Reset things when the pan event ends

        if(e.type === 'panend'){
          scope.origin = null;

          // Snap to proper slide

          var closest = Infinity;
          var slide;

          for(var ii = 0; ii < scope.slides.length; ii++){
            var left = scope.slides[ii].offsetLeft;
            var delta = Math.abs(left + offset);
            if(delta < closest){
              closest = delta;
              slide = ii;
            }
          }

          if(closest !== Infinity){ scope.current = slide; }
          scope.snapToCurrent();
        }
      });
    }
  };
});