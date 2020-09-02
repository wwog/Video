# Video

#### 介绍
跨平台视频资源播放器
资源来源网络,如有侵权,联系删库.

#### 坑
学习electron框架使用开发
不会在做更新,整理几个已知问题(个人平台windows10,不确定是否其他平台会遇到)
1.尽量不要使用透明窗口,否则会遇到各种数不完的错误
  问题1:透明窗口调用maximize后其实窗口并不是处在最大化,所以isMaximized无脑返回false.双击拖拽区域的最大化才是最大化.
        这里我把透明窗口maximize后的状态称为伪最大化.
        导致1:由于底层认为窗口并不是处于最大化,restore方法无法还原透明窗口maximize后的伪最大化
              解决:unmaximize可以取消伪最大化
        导致2:伪最大化后,双击拖拽区域并不会还原,底层处理结果认为窗口并不是最大化,所以伪最大化后双击会进行最大化.
              解决方案1:禁止拖拽区域双击最大化====>产生又一个坑,拖拽区域其实是electron调用底层接口生成的区域,所以会有不同的系统表现
                        由于这种底层处理跟我们的页面代码无关,所以无法通过前端页面的手段取消(可能有其他方法我不知道).
                             解决:生成窗口的配置中,将最大化禁止,这样双击titleBar将不会进行最大化,在我们的最大化按钮点击中在进行解禁操作结束再禁止.
              解决方案2:手写最大化还原(比较困难)
  问题2:透明窗口会导致你全屏元素时,屏幕四周可以进行resize.可以运行程序代码,全屏任意视频,鼠标放置任意边,你会发现可以进行拖动.
        Ps.这个给BUG不会管你是使用electron的setFullscreen还是dom的requestFullScreen
        导致1:软件体验差.
              解决:程序没有解决,只能在你全屏后禁止resize.这么看解决很简单,但是我没有处理是为什么呢,因为我使用的dom的requestFullScreen让某个元素全屏.
                   后果呢就是,esc会退出全屏.所以我没有管,因为还需要监听dom的FullScreenchage.想了下bug这么多不差这一个,反正能看能全屏不是吗?下次不就不会踩坑了.
              
2.窗口require表现与node并不一直甚至很大差别,node中重复require是没有影响的,因为内存中会记录你第一次的引入.
  这个问题其实很好理解,他实现的这种垫片不完善.虽然是小问题,可现代编辑器太智能了.
  导致:写的时候vscode会自动引入需要的模块,莫名其妙的报错就会出现.
       解决:不要用纯原生来写electron,配个webpack打包把electron比喻成纯浏览器就好.这时候我才觉得框架是真香,啥都有默认.

其实还有许多坑,但是都比较好解决,这里就不举例了
总结就是,electron创建的窗口不要透明,当成网页来写,用上合适的工具会事半功倍.

```javascript
   let 原生 = 写时爽,调试哭
```
