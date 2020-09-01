const utils = require('../../../src/utils')

//添加主页
let home = page.add('home')

{
  //从模板中载入
  home.appendChild(document.importNode(document.querySelector('#home_t').content, true))
  //搜索按钮,文本框,返回列表
  let search_btn = home.querySelector('#search_btn')
  let search_text = home.querySelector('#search_text')
  let search_ul = home.querySelector('#search_list')
  let home_bot = home.querySelector('.home_bot')
  //添加方法:切换列表显示
  search_ul.show = function (isshow = true) {
    if (isshow) {
      this.style.display = ''
    } else {
      this.style.display = 'none'
    }
  }
  const bdTop = {
    'index_top_tv_all': '电视剧',
    'index_top_movie_all': '电影',
    'index_top_cartoon': '动漫',
    'index_top_tamasha': '综艺'
  }
  //获取热搜,总榜
  ipcRenderer.send('push', 'init')
  //爱奇艺推荐
  ipcRenderer.on('init_iqiyi', (e, type, arg) => {
    let result = JSON.parse(arg).data
    let ul = document.createElement('ul')
    ul.className = 'top_list'
    let div = document.createElement('div')
    div.className = 'list_type'
    div.innerHTML = `
                    <img src="../../images/48.png" style="width:24px;height:24px;">  爱奇艺Top ${type}
                    `
    home_bot.appendChild(div)
    for (let i = 0; i < result.length; i++) {
      let title = result[i].album_name
      let img = result[i].album_pic_url.slice(0, -4) + '_260_360' + '.jpg'
      let actor = '', _actor = result[i].album_main_actor
      for (let i = 0; i < _actor.length; i++) {
        actor += _actor[i].tag_name + ' '
      }
      let type = '', _type = result[i].categories;
      for (let i = 0; i < _type.length; i++) {
        type += _type[i].name + ' '
      }
      let li = createItem(title, img, actor, type)
      ul.appendChild(li)
    }
    home_bot.appendChild(ul)
  })
  //百度榜单
  ipcRenderer.on('init_bdTop', (e, arg) => {
    let result = JSON.parse(arg)
    for (let i = 0; i < result.length; i++) {
      if (result[i].name == '动漫') {
        continue
      }
      let ul = document.createElement('ul')
      ul.className = 'top_list'
      let div = document.createElement('div')
      div.className = 'list_type'
      div.innerHTML = `<img src="../../images/48.png" style="width:24px;height:24px;"> 百度Top ${bdTop[result[i].name]}`
      home_bot.appendChild(div)
      let videos = result[i].data.videos
      for (let i = 0; i < videos.length; i++) {
        let actor = videos[i].actor[0].name == "" ? "未知" : videos[i].actor[0].name
        let li = createItem(videos[i].title, videos[i].imgv_url, actor, videos[i].type[0].name)
        ul.appendChild(li)
      }
      home_bot.appendChild(ul)
    }
  })
  //热门搜索
  ipcRenderer.on('init_hot_s', (e, arg) => {
    let result = JSON.parse(arg).hot_query[0].hot_query_info;
    let hot_title = document.createElement('li')
    hot_title.className = 'result-title'
    hot_title.textContent = '热门搜索'
    search_ul.appendChild(hot_title)
    for (let i = 0; i < result.length; i++) {
      let li = document.createElement('li')
      li.className = 'result-item'
      if (i < 3) {
        li.innerHTML = `<em class="em_top">${i + 1}</em>${result[i].query}`
      } else {
        li.innerHTML = `<em>${i + 1}</em>${result[i].query}`
      }
      search_ul.appendChild(li)
    }
  })
  //创建影片项目
  function createItem(title, img, actor, type) {
    let li = document.createElement('li')
    li.className = 'list_item'
    li.innerHTML = `
                  <div class="video_img">
                    <img src="${img}">
                  <div>
                  <div class="video_meta">
                    <div class="video_meta_title" title="${title}">${title}</div>
                    <div class="video_meta_actor">
                      <span class="actor_tip">主演:</span>
                      <span class="actor_val" title="${actor}">${actor}</span>
                    </div>
                    <div class="video_meta_type">
                      <span class="type_tip">类型:</span>
                      <span class="type_val" title="${type}">${type}</span>
                    </div>
                  </div>
                  `
    return li
  }
  // 列表焦点显示逻辑
  search_ul.addEventListener('mouseenter', e => {
    search_ul._Focus = true
  })
  search_ul.addEventListener('mouseleave', e => {
    search_ul._Focus = false
  })
  search_ul.addEventListener('mousedown', e => {
    e.preventDefault()
    search_text.focus()
  })
  search_text.addEventListener('focus', e => {
    search_ul.show()
  })
  search_text.addEventListener('blur', e => {
    if (!search_ul._Focus) {
      search_ul.show(false)
    }
  })
  // 逻辑结束

  //清理搜索返回结果
  function clearSearchResultItem() {
    let reA = search_ul.querySelectorAll('.result-search')
    Array.prototype.forEach.call(reA, (v) => {
      search_ul.removeChild(v)
    })
  }
  //防抖动输入搜索
  let reqSearch = utils.debounce((val) => {
    let ajax = new XMLHttpRequest
    ajax.open('GET', `https://suggest.video.iqiyi.com/?rltnum=5&platform=11&key=${val}`)
    ajax.send()
    ajax.onload = e => {
      let result = JSON.parse(ajax.responseText).data;
      clearSearchResultItem()
      if (result.length && result.length !== 0) {
        for (let i = result.length - 1; i >= 0; i--) {
          let li = document.createElement('li')
          li.className = 'result-item result-search'
          li.innerHTML = result[i].name
          search_ul.insertBefore(li, search_ul.children[0])
        }
      }
    }

  }, 500)
  //搜索框输入提示
  search_text.addEventListener('keyup', e => {
    let val = search_text.value
    if (e.keyCode === 13) {
      search_btn.click()
    }else{
      reqSearch(val)
    }
  })
  //搜索item点击
  search_ul.addEventListener('click', e => {
    let path = e.path
    for (let i = 0; i < path.length; i++) {
      if ((path[i].className + '').includes('result-item')) {
        let query = path[i].lastChild.nodeValue;
        search_text.value = query
        submit(search_text.value)
        break
      }
    }
  })

  //搜索按钮点击
  search_btn.addEventListener('click', e => {
    if (utils.isEmptyText(search_text.value)) {
      alert('未检查搜索内容')
    } else {
      submit(search_text.value)
    }
  })
  //列表item点击
  home_bot.addEventListener('click', e => {
    let path = e.path
    for (let i = 0; i < path.length; i++) {
      if ((path[i].className + '').includes('list_item')) {
        let query = path[i].querySelector('.video_meta_title').title;
        submit(query)
        break
      }
    }
  })
  function submit(name) {
    popups.show()
    popups.loading()
    popups.queryName = name
    ipcRenderer.send('query', name)
  }
}