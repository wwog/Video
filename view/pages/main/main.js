const { remote, ipcRenderer } = require('electron')
const Page = require('../../../src/page')
const main = document.querySelector('main')

let page = new Page(main)
//获取当前窗口
const win = remote.getCurrentWindow()
//控制按钮组
const controls = document.getElementsByClassName('controls')[0].children
const bot_btns = document.querySelector('footer').getElementsByTagName('li')
const popups = document.getElementById('popups')

//记录主进程运行的推送
let mainPush = {
  hot: null,
  hot_search: null
}
let windowOptions = {
  //_max:记录窗口最大化
  _max: false,
  _current: bot_btns[0],
  title: "具映",
  /**
   * @param {HTMLLIElement} value
   */
  set current(value) {
    this._current.classList.remove('current')
    this._current = value
    this._current.classList.add('current')
  },
  get current() {
    return this._current
  },
  get max() {
    this._max = !this._max
    return !this._max
  }
}


//------------------事件
//主进程推送总榜单事件,只会触发一次
ipcRenderer.once('hot', (e, arg) => {
  mainPush.hot = JSON.parse(arg).data
})
//主进程推送热搜榜事件,只会触发一次
ipcRenderer.once('hot_search', (e, arg) => {
  mainPush.hot_search = JSON.parse(arg).hot_query[0].hot_query_info

})
//最小化单击事件
controls[0].addEventListener('click', () => {

  win.minimize()
})

//最大化|还原单击事件
controls[1].addEventListener('click', () => {
  //透明窗口调用函数最大化后isMaximized()无法正确返回.
  //如果最大化为真(双击拖拽区域最大化),则调用restore
  if (win.isMaximized()) {
    win.restore()
    windowOptions._max = false
  } else {
    if (windowOptions.max) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})
//关闭单击事件
controls[2].addEventListener('click', () => {
  win.close()
})
//底栏选项
for (let i = 0; i < bot_btns.length; i++) {
  bot_btns[i].addEventListener('click', e => {
    popups.hide()
    page.toggle(bot_btns[i].getAttribute('data-id'))
    windowOptions.current = bot_btns[i]
  })
}



//popups
popups.show = function () {
  this.style.height = `${main.clientHeight - 10}px`
}
popups.hide = function () {
  this.style.height = `0px`
  this.clearQueryItems()
}
popups.loadingDom = popups.querySelector('#loading')
popups.queryTable = popups.querySelector('table')
popups.loading = function (show = true) {
  //载入中提示...
  show ? this.loadingDom.style.display = '' : this.loadingDom.style.display = 'none'
}
popups.createQueryItem = function (name, key, last, note, id = 0, api = '') {
  let tr = document.createElement('tr')
  tr.className = 'queryItem'
  tr.setAttribute('data-api', api)
  tr.setAttribute('data-id', id)

  tr.innerHTML = `
  <td data-info="${name}">${name}</td>
  <td data-info="${key}">${key}</td>
  <td data-info="${last}">${last}</td>
  <td data-info="${note}">${note}</td>
  `
  this.queryTable.appendChild(tr)
  return tr
}
popups.clearQueryItems = function () {
  let items = this.queryTable.querySelectorAll('.queryItem')
  items.forEach(v => {
    this.queryTable.removeChild(v)
  })
  this.queryTable.style.display = 'none'
}
popups.hideDom = popups.querySelector('#popups_hide')
popups.hideDom.addEventListener('click', e => {
  popups.hide()
})
popups.warpper = popups.querySelector('.popups_warpper')
ipcRenderer.on('query', (e, videos) => {
  popups.loading(false)
  popups.queryTable.style.display = ''
  if (videos.length) {
    videos.forEach(v => {
      if (!v[1].length) {
        popups.createQueryItem(v[1].name, v[0], v[1].last, v[1].note, v[1].id, v[2])
      } else {
        v[1].forEach(val => {
          popups.createQueryItem(val.name, v[0], val.last, val.note, val.id, v[2])
        })
      }
    })
  } else {
    let tr = popups.createQueryItem(popups.queryName, '无', '无', '尝试更换名称进行搜索')
    tr.style.color = 'red'
  }
})
//查询结构表格点击
popups.queryTable.addEventListener('click', e => {
  let path = e.path
  for (let i = 0; i < path.length; i++) {
    if ((path[i].className + '').includes('queryItem')) {
      let api = path[i].getAttribute('data-api')
      let id = path[i].getAttribute('data-id')
      let requstUrl = `${api}?ac=videolist&ids=${id}`
      ipcRenderer.send('detail', requstUrl)
    }
  }
})

//test code

