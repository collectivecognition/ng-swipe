angular.module('ngSwipe', [])

.service('swipeUtils', function() {
  var utils = {

    /*
     * Inject the supplied css content into the dom.
     * A unique id can be supplied to ensure the content is only
     * injected once.
     *
     * @param css [string]
     * @param id [string]
     */

    injectCss: function(css, id) {
      if(!id || !document.getElementById(id)){
        var css = document.createElement('style');
        if(id){ css.id = id; }
        css.type = 'text/css';
        css.innerHTML = css;
        document.body.appendChild(css);
      }
    },

    /*
     * Attempt to detect which vendor prefix is required for css
     * animation support.
     *
     * @todo Handle css animation not being supported
     * @todo Ensure we're handling all possible prefixes
     */

    detectCssPrefix: function() {
      var props = [
        {attribute: 'transform', prefix: ''},
        {attribute: 'webkitTransform', prefix: '-webkit-'},
        {attribute: 'mozTransform', prefix: '-moz-'},
        {attribute: 'msTransform', prefix: '-ms-'}
      ];

      var validPrefix;

      for(var ii = 0; ii < props.length; ii++){
        var prop = props[ii];
        if(typeof document.body.style[prop.attribute] !== 'undefined'){
          validPrefix = prop.property;
          break;
        }
      }

      return validPrefix;
    },

    /*
     * Calculate a valid vendor prefix on startup
     */

    validPrefix: utils.detectCssPrefix()
  };

  return utils;
});
/**
 * Carousel directive
 * TODO
 */

angular.module('ngSwipe')

.directive('carousel', function($timeout, $window, swipeUtils) {
  return {
    restrict: 'A',
    scope: {},
    transclude: true,
    template: '<div ng-transclude class="slides"></div>',
    link: function(scope, elements, attr, model) {

      // Get references to various dom elements

      scope.wrapper = elements[0];
      scope.element = elements[0].querySelector(".slides");
      scope.slides = elements[0].querySelectorAll(".slides > *");
      
      // Inject custom css

      swipeUtils.injectCss(
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

      // Detect which transform property to use for animation
      // TODO: Make this DRY

      scope.detectTransformProperty = function() {
        var props = [
          {attribute: 'transform', property: 'transform'},
          {attribute: 'webkitTransform', property: '-webkit-transform'},
        ];

        scope.transformProperty = "";
        for(var ii = 0; ii < props.length; ii++){
          var prop = props[ii];
          if(typeof document.body.style[prop.attribute] !== 'undefined'){
            scope.transformProperty = prop.property;
            break;
          }
        }
      };

      scope.detectTransformProperty();

      // Precalculate various values

      scope.precalc = function() {

        // Width of all tabs

        var total = 0;
        for(var ii = 0; ii < scope.slides.length; ii++){
          var width = parseInt($window.getComputedStyle(scope.slides[ii]).width);
          total += width;

        }
        scope.totalSlideWidth = total;

        // Width of slide wrapper

        scope.elementWidth = parseInt($window.getComputedStyle(scope.element).width);
      };

      scope.precalc();

      angular.element($window).bind('resize', scope.precalc);

      // Animate transforms

      scope.transformTo = function(el, pos, speed, timingFunction) {
        el.style.transitionDuration = (speed || 0) + 'ms';
        el.style.transitionTimingFunction = 'ease-out';
        el.style.transform = "translate(" + (pos) + "px,0)";
      };

      scope.transformTo(scope.element, 0, 0); // Initialize transform

      // Calculate the current transform

      scope.getTransform = function(el) {

        // FIXME: Need a more robust way of determining position

        var matches = el.style.transform.match(/translate\((-?\d+)/);
        if(matches){
          return parseFloat(matches[1]);
        }
      };

      // Handle dragging

      var panStart = null;
      console.log('aaahh', scope.element)

      new Hammer(scope.element).on('dragstart panstart panend panleft panright', function(e) {

        e.preventDefault();
        console.log(e);

        // Save the transform when the pan event starts

        if(panStart === null){
          panStart = scope.getTransform(scope.element);
        }

        // Update the transform as we drag

        var offset = panStart + e.deltaX;

        if(panStart !== null){
            if(offset < 0 && offset > -(scope.totalSlideWidth - scope.elementWidth)){
              scope.transformTo(scope.element, offset, 0);
            }
        }

        // Reset things when the pan event ends

        if(e.type === 'panend'){
          panStart = null;

          // Snap to proper slide

          var closest = Infinity;
          var slide;

          for(var ii = 0; ii < scope.slides.length; ii++){
            var left = scope.slides[ii].offsetLeft;
            var delta = Math.abs(left + offset);
            if(delta < closest){
              closest = delta;
              slide = scope.slides[ii];
            }
          }

          scope.transformTo(scope.element, -slide.offsetLeft, 200);
        }
      });
    }
  };
});