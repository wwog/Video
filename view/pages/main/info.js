//添加视频详情页
let info = page.add('info')
{
  info.appendChild(document.importNode(document.querySelector('#info_t').content, true))
  ipcRenderer.on('detail', (e, flag, video) => {
    if (flag) {
      let json = videoParse(video)
      info.innerHTML('')
      info.appendChild(createItem(json))
      info.appendChild(createEpisode(json.m3u8Arr))
      bot_btns[1].click()
    } else {
      alert('接口不匹配')
    }
  })
  function createItem(videoJson) {
    let div = document.createElement('div')
    div.className = 'video_info'
    div.innerHTML = `
      <img src="${videoJson.pic}">
      <div class='info_wapper'>
        <h1>${videoJson.name}</h1>
        <div class='video_last'><span>更新: </span> ${videoJson.last}</div>
        <div class='video_note'><span>状态: </span> ${videoJson.note}</div>
        <div class='video_actor'><span>演员表: </span> ${videoJson.actor}</div>
        <div class='video_des'><span>影片描述: </span> ${videoJson.des}</div>
      </div>
    `
    return div
  }
  
  function getMainHeight(unit = false) {
    let h = getComputedStyle(main).height
    if (unit) {
      return h
    } else {
      return h.slice(0, -2)
    }
  }
  function createEpisode(arr) {
    let div_warpper = document.createElement('div')
    div_warpper.className = 'allEpisode'
    arr.forEach(v => {
      let div = document.createElement('div')
      div.className = 'episode'
      let k_v = v.split('$')
      div.textContent = k_v[0]
      div.setAttribute('data-url', k_v[1])
      div_warpper.appendChild(div)
      div.addEventListener('click', e => {
        player.load(k_v[1])
        player.playerBtns.style.display = ''
        player.playerBtns.btnShow.click()
      })
    })
  
    return div_warpper
  }
  function videoParse(video) {
    let m3u8Arr = []
    let urlArr = []
    if (video.dl) {
      if (video.dl.dd) {
        if (video.dl.dd.length) {
          let dd = video.dl.dd
          for (let i = 0; i < dd.length; i++) {
  
            if ((dd[i]._flag + '').includes('m3u8')) {
              m3u8Arr = (dd[i]._t + '').split('#')
            } else {
              urlArr = (dd[i]._t + '').split('#')
            }
          }
          return {
            name: video.name,
            actor: video.actor,
            des: video.des,
            pic: video.pic,
            last: video.last,
            note: video.note,
            m3u8Arr,
            urlArr
          }
        }
      }
    }
    return false
  }
}

//test
