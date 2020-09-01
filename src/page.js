const dom = require('./dom')
class Page {
  container
  #pages
  #current = new Proxy({
    el: null,
    id: undefined
  }, {
    set(t, p, v, r) {
      if (v) {
        if (t.el) {
          t.el.style.display = 'none'
        }
        t.el = v
        t.id = v.id
        v.style.display = ''
      } else {
        t.el = null
        t.id = undefined
      }
      return true
    }
  })
  constructor(containerEl) {
    containerEl.classList.add('pageContainer')
    this.container = containerEl
    this.#pages = containerEl.children
  }
  /**
   * @description 添加page,返回封装后的操作对象.
   * @param {*} id 用于设置元素id
   * @param {*} className 用于设置元素class
   */
  add(id, className = '') {
    let div = dom.div({
      id,
      class: `pageItem ${className}`,
      style: {
        display: 'none'
      }
    })

    if (this.#pages.length === 0) {

      this.#current.el = div

    }
    this.container.appendChild(div)
    return {
      id,
      innerHTML(html) {
        div.innerHTML = html
      },
      appendChild(el) {
        div.appendChild(el)
      },
      removeChild(el) {
        div.removeChild(el)
      },
      addEventListener(type, listener) {
        div.addEventListener(type, listener)
      },
      querySelector(selector) {
        return div.querySelector(selector)
      },
      dom: div
    }
  }
  /**
   * @description  用于切换当前显示page
   * @param {*} id 
   */
  toggle(id) {
    this.#current.el = this.container.querySelector(`#${id}`)
  }
  /**
   *  @description 删除page 
   *  @param {*} id 删除元素的id
   *  
   */
  remove(id) {
    if (id === this.#current.id) {
      this.#current.el = null
    }
    let _div = this.container.querySelector(`#${id}`)
    this.container.removeChild(_div)

  }
  /**
   * @description 返回Dom元素
   * @param {*} 选择器 
   * @returns El
   */
  dom(selector) {
    return this.container.querySelector(selector)
  }
  /**
   * @description 返回当前page总数  
   */
  length() {
    return this.#pages.length
  }
}
module.exports = Page