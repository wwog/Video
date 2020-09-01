let player = page.add('player')
player.appendChild(document.importNode(document.querySelector('#player_t').content, true))

player.playerBtns = document.getElementById('player_btns')
player.playerBtns.btnShow = player.playerBtns.querySelector('.player_show')

//控制栏
player.contorls = player.dom.querySelector('.video_controls')
//play&pause
player.playBtn = player.dom.querySelector('.left_play')
//播放时间显示
player.playTime = player.dom.querySelector('.left_time')
//总长显示
player.duration = player.dom.querySelector('.duration')
//进度条容器
player.progress = player.dom.querySelector('.mid_progress')
player.progress.rect = player.progress.getBoundingClientRect()
//缓冲条
player.buffer = player.dom.querySelector('.p_buffer')
//播放进度条
player.in = player.dom.querySelector('.p_in')
//进度条滑块
player.dot = player.in.querySelector('.dot')
//进度条hoverTime块
player.hoverTime = player.dom.querySelector('.p_ht')
//音量容器
player.volume = player.dom.querySelector('.volume')
//音量按钮
player.volume_btn = player.volume.querySelector('.v_icon')
//音量调节界面
player.volueme_sliderbg = player.volume.querySelector('.v_sliderbg')
//音量调节条
player.volume_slider = player.volume.querySelector('.v_slider')

//音量条
player.volume_in = player.volume.querySelector('.s_in')
//音量调节滑块
player.volume_dot = player.volume.querySelector('.s_dot')
//全屏按钮
player.fullScreenBtn = player.dom.querySelector('.v_full')
//记录全屏
player.fullScreen = false
player.video = player.querySelector('#video')


player.video.addEventListener('pause', e => {
  player.contorls.style.bottom = '0'
})
player.video.addEventListener('play', e => {
  player.contorls.style.bottom = ''
})
//全屏
player.fullScreenBtn.addEventListener('click', e => {

  if (!player.fullScreen) {
    player.dom.webkitRequestFullScreen()
    player.fullScreen = true
    player.fullScreenBtn.classList.remove('rfull')
    player.fullScreenBtn.classList.add('exitfull')
  } else {
    document.webkitCancelFullScreen()
    player.fullScreen = false
    player.fullScreenBtn.classList.remove('exitfull')
    player.fullScreenBtn.classList.add('rfull')
  }

})
//音量控件
player.volume_dot.addEventListener('mousedown', e => {
  player.volume.bool = true
  player.volueme_sliderbg.style.display = 'block'
  let sliderRect = player.volume_slider.getBoundingClientRect()
  player.volueme_sliderbg.addEventListener('mousemove', e => {
    if (player.volume.bool) {
      let coords = e.clientY - sliderRect.y
      if (coords < 0) {
        coords = 0
      } else if (coords > sliderRect.height) {
        coords = coords > sliderRect.height
      }
      let volume = (sliderRect.height - coords) / sliderRect.height
      player.volume_in.style.height = `${volume * 100}%`
      player.video.volume = volume
    }
  })
  document.addEventListener('mouseup', function up() {
    player.volume.bool = false
    removeEventListener('mouseup', up)
    player.volueme_sliderbg.style.display = ''
  })
})

player.video.addEventListener('volumechange', e => {
  if (player.video.volume) {
    player.volume_btn.classList.remove('mute')
    player.volume_btn.classList.add('normal')
  } else {
    player.volume_btn.classList.remove('normal')
    player.volume_btn.classList.add('mute')
  }
})

player.volume_btn.addEventListener('click', e => {
  if (player.video.volume) {
    player.prevolume = player.video.volume
    player.video.volume = 0
    player.volume_in.style.height = '0%'
  } else {
    player.video.volume = player.prevolume
    player.volume_in.style.height = `${player.video.volume * 100}%`
  }
})
//进度条拖动事件,这一版拖动条做得非常烂,后面有机会会把各个原件模块化组成一个播放器.
player.dot.addEventListener('mousedown', e => {
  if (player.video.duration) {
    let start = e.pageX,
      end,
      length,
      overallLength = +getComputedStyle(player.progress).width.replace('px', ''),
      inWidth = +(player.in.style.width || '0%').replace('%', '')

    player.video.pause()
    player.dot.classList.remove('dot_hover')
    player.dot.classList.add('dot_move')
    player.dom.addEventListener('mousemove', function move(e) {
      end = e.pageX
      length = end - start
      if (length < 0) {
        //左移
        length = Math.abs(length)
        result = inWidth - (length / overallLength) * 100
        if (result < 0) {
          player.in.style.width = `${0}%`
        } else {
          player.in.style.width = `${result}%`
        }
      } else {
        //右移
        result = (length / overallLength) * 100 + inWidth
        if (result > 100) {
          player.in.style.width = `${100}%`
        } else {
          player.in.style.width = `${result}%`
        }
      }
      player.dom.addEventListener('mouseup', function up(e) {
        end = e.pageX
        length = end - start
        if (length < 0) {
          //左移
          length = Math.abs(length)
          result = inWidth - (length / overallLength) * 100
          if (result < 0) {
            chageProgressIn(0)
          } else {
            chageProgressIn(result)
          }
        } else {
          //右移
          result = (length / overallLength) * 100 + inWidth
          if (result > 100) {
            chageProgressIn(100)
          } else {
            chageProgressIn(result)
          }
        }
        player.dom.removeEventListener('mousemove', move)
        player.dom.removeEventListener('mouseup', up)
        player.video.play()
        player.dot.classList.remove('dot_move')
        player.dot.classList.add('dot_hover')
      })
    })
  }
})
//进度条弹出框显示
player.progress.addEventListener('mousemove', e => {
  if (player.video.duration) {
    let mid = getComputedStyle(player.hoverTime).width.slice(0, this.length - 2) / 2
      , mouseX = e.clientX - player.progress.rect.x
      , width = player.progress.rect.width
      , time = (mouseX / width) * player.video.duration
    player.hoverTime.style.left = `${mouseX - mid}px`
    if (time < 0) {
      time = 0
    } else if (time > player.video.duration) {
      time = player.video.duration
    }
    player.hoverTime.firstElementChild.textContent = formatSec(time)
  }
})
window.addEventListener('resize', e => {
  _fn(e)
})
let _fn = utils.debounce((e) => {
  player.progress.rect = player.progress.getBoundingClientRect()
}, 500)
player.video.addEventListener('progress', e => {
  let buffered = player.video.buffered
    , time = player.video.currentTime
    , loaded = 0
    , duration = player.video.duration
    , width
  for (let i = 0; i < buffered.length; ++i) {
    if (time > buffered.start(i) && time < buffered.end(i)) {
      loaded = buffered.end(i);
      break
    }
  }
  width = (loaded / duration * 100).toFixed(2) + '%'
  player.buffer.style.width = width
})
//节流触发
player.timeupdata = utils.throttle(() => {
  let time = player.video.currentTime
    , duration = player.video.duration
  player.playTime.textContent = formatSec(time)
  player.in.style.width = (time / duration * 100).toFixed(2) + '%'
}, 1000)
player.video.addEventListener('timeupdate', e => {
  player.timeupdata()
})
player.video.addEventListener('loadedmetadata', e => {
  player.duration.textContent = formatSec(player.video.duration)
})
player.video.addEventListener('pause', e => {
  togglePlay(player.video.paused)
})
player.video.addEventListener('play', e => {
  togglePlay(player.video.paused)
})
player.init = function () {
  player.playTime.textContent = '00:00:00'
  player.duration.textContent = '00:00:00'
  player.in.style.width = '0%'
  player.buffer.style.width = '0%'
}
player.videoSrc = ''
player.hls = new Hls()
player.hls.attachMedia(player.video)
//不知道为什么监听volumechage执行并没有触发,但是异步函数却能触发,这里手动更改
player.volume_in.style.height = player.video.volume * 100 + '%'
player.load = function (url) {
  player.videoSrc = url
  player.init()
  if (this.hls.url) {
    video.pause()
    this.hls.destroy()
    player.hls = new Hls()
    player.hls.attachMedia(player.video)
    player.hls.loadSource(url)
    video.play()
  } else {
    player.hls.loadSource(url)
    video.play()
  }
}
{
  let hls = player.hls
  hls.on(Hls.Events.ERROR, function (event, data) {
    console.log(data);
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.log("fatal network error encountered, try to recover");
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.log("fatal media error encountered, try to recover");
          hls.recoverMediaError();
          break;
        default:
          hls.destroy();
          break;
      }
    }
  });
}

//播放暂停
player.playBtn.addEventListener('click', e => {
  //没有视频信息则跳过
  if (player.video.readyState !== 0) {
    //如果暂停,则播放
    if (player.video.paused) {
      player.video.play()
    } else {
      player.video.pause()
    }
  }
})
/**
 * @description 改变音量
 * @param {*} percentage 
 */
function chageVolume(percentage) {

}
/**
 * @description 移动进度条播放进度
 * @param {*} play 
 */
function chageProgressIn(percentage) {
  player.video.currentTime = (percentage / 100) * player.video.duration
}
/**
 * @description 设定播放暂停按钮样式
 * @param {*} play 
 */
function togglePlay(play) {
  if (play) {
    player.playBtn.classList.remove('play_pause')
    player.playBtn.classList.add('play_play')
  } else {
    player.playBtn.classList.add('play_pause')
    player.playBtn.classList.remove('play_play')

  }
}
function formatSec(sec) {
  sec = sec | 0;
  if (sec < 3600) {
    return ("0" + (sec / 60 | 0)).slice(-2) + ":" + ("0" + sec % 60).slice(-2)
  } else {
    return ("0" + (sec / 3600 | 0)).slice(-2) + ":" + ("0" + (sec % 3600 / 60 | 0)).slice(-2) + ":" + ("0" + sec % 3600 % 60).slice(-2)
  }
}


document.body.style.animation
//底栏提示播放页面按钮
player.playerBtns.btnShow.addEventListener('click', e => {
  let style = player.playerBtns.style
  let show = player.playerBtns.btnShow
  
  let showCl = show.classList
  if (style.width != '') {
    style.width = ''
    style.borderRadius = ''
    showCl.remove('fold')
    showCl.add('unfold')
    page.toggle('info')
    /* show.style='animation:rotate-360 5s linear infinite;' */
  } else {
    style.width = '100%'
    style.borderRadius = '0'
    showCl.remove('unfold')
    showCl.add('fold')
    page.toggle('player')
    /* show.style='' */
  }
})