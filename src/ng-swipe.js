angular.module('ngSwipe', [])

.service('swipeUtils', function($window) {
  var scope = this;  

  /*
   * Inject the supplied css content into the dom.
   * A unique id can be supplied to ensure the content is only
   * injected once.
   *
   * @param css [string]
   * @param id [string]
   */

  scope.injectCss = function(content, id) {
    if(!id || !document.getElementById(id)){
      var css = document.createElement('style');
      if(id){ css.id = id; }
      css.type = 'text/css';
      css.innerHTML = content;
      document.body.appendChild(css);
    }
  };

  /*
   * Compute the width of an element
   */

  scope.computeWidth = function(el) {
    return parseFloat($window.getComputedStyle(el).width);
  };

  /*
   * Compute the combined width of multiple elements
   *
   */

  scope.computeWidths = function(els) {
    var total = 0;
    for(var ii = 0; ii < els.length; ii++){
      total += scope.computeWidth(els[ii]);
    }
    return total;
  };

  /*
   * Get the prefixed version of a css attribute
   */

  scope.prefixCache = {};

  scope.prefixed = function(attr) {
    if(scope.prefixCache[attr]){
      scope.prefixCache[attr];
    }else{
      return Hammer.prefixed(document.body.style, attr);
    }
  };

  /*
   * Horizontally transform the provided element
   *
   * @todo support 3d transforms
   * @todo support vertical transforms
   */

  scope.transformTo = function(el, pos, speed, easing) {
    el.style[scope.prefixed('transitionDuration')] = (speed || 0) + 'ms';
    el.style[scope.prefixed('transitionTimingFunction')] = easing || 'ease-out';
    el.style[scope.prefixed('transform')] = 'translate(' + (pos) + 'px,0)';
  };

  /*
   * Retrive the current transform of an element
   *
   * @todo support 3d transforms
   * @todo support vertical transforms
   * @fixme need a more robust way to parse transform values
   */

  scope.getTransform = function(el) {
    var matches = el.style[scope.prefixed('transform')].match(/translate\((-?\d+)/);
    if(matches){
      return parseFloat(matches[1]);
    }
  };

  /*
   * Hack to disable user drag on an element
   */

  scope.disableDrag = function(el) {
    el.style[scope.prefixed('userDrag')] = 'none';
  };
});