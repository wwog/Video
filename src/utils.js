const debounce = require('./debounce')
let utils = {
  /**
   * @description 是否为空文本
   * @param {String} str  
   * @return {Boolean} 空文本返回true,反之
   */
  isEmptyText(str) {
    if (!str.replace(/\s*/g, "").length) {
      return true
    }
    return false
  },
  debounce,
  now() {
    return (new Date).getTime()
  },
  throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options)
      options = {};
    var later = function later() {
      previous = options.leading === false ? 0 : utils.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout)
        context = args = null
    };
    return function () {
      var now = utils.now();
      if (!previous && options.leading === false)
        previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout)
          context = args = null
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      }
      return result
    }
  }
}
module.exports = utils