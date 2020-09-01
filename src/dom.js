const dom = new Proxy({}, {
  get(target, propKey, receiver) {
    if (propKey in target) {
      return Reflect.get(target, propKey, receiver)
    }
    return function (attrs = {}, ...childRen) {
      let el = document.createElement(propKey)
      for (key of Object.getOwnPropertyNames(attrs)) {
        if (key.toLocaleLowerCase() === 'style' && typeof attrs[key] === 'object') {
          let _result = '',
            _obj = attrs[key];
          for (styleKey of Object.keys(_obj)) {
            _result += `${styleKey}:${_obj[styleKey]};`
          }
          _result = `${_result}`
          el.setAttribute(key, _result)
        } else {
          el.setAttribute(key, attrs[key])
        }
      }
      for (child of childRen) {
        if (typeof child === 'string') {
          child = document.createTextNode(child)
        }
        el.appendChild(child)
      }
      return el
    }
  }
})
module.exports = dom