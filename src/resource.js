const https = require('https')
const net = require('electron').net
const x2js = require('fast-xml-parser')
const { request } = require('http')
const xmlConfig = {
  trimValues: true,
  textNodeName: '_t',
  ignoreAttributes: false,
  attributeNamePrefix: '_',
  parseAttributeValue: true
}
let resource = {
  /**
   *  @description 获取爱奇艺top
   *  @param {number} type 1电影 2电视剧 4动漫 6综艺 
   * */
  pushIqyTop(type, size = 25, page = 1) {
    return new Promise((resolve, reject) => {
      const iqiyi = https.get(`https://pcw-api.iqiyi.com/album/album/fytoplist?cid=${type}&dim=hour&type=realTime&size=${size}&page=${page}`)
      iqiyi.on('response', (res) => {
        let data = ''
        res.on('data', chunk => {
          data += chunk.toString()
        })
        res.on('end', () => {
          resolve(data)
        })
        res.on('error', e => {
          reject(e.message)
        })
      })
    })
  },
  pushHotSearch() {
    return new Promise((resolve, reject) => {
      const iqiyi = https.get(`https://search.video.iqiyi.com/m?if=hotQueryNew&platform=14&children_tab=1&from=pcw_searchbox&hot_query_type=1&pagesize=5`)
      iqiyi.on('response', (res) => {
        let data = ''
        res.on('data', chunk => {
          data += chunk.toString()
        })
        res.on('end', () => {
          resolve(data)
        })
        res.on('error', e => {
          reject(e.message)
        })
      })
    })
  },
  pushBdtop() {
    return new Promise((resolve, reject) => {
      let api = 'https://v.baidu.com/videoapi/?page_name=index&format=json&block_sign=list_index_top_movie_all,index_top_tv_all,index_top_tamasha,index_top_cartoon'
      const bdTop = https.get(api)
      bdTop.on('response', res => {
        let data = ''
        res.on('data', chunk => {
          data += chunk.toString()
        })
        res.on('end', () => {
          resolve(data)
        })
        res.on('error', e => {
          reject(e.message)
        })
      })
    })
  },
  queryName(name) {
    return new Promise((resolve, reject) => {
      let query = `?ac=list&wd=${name}`
      let resCount = 0
      let result = []
      api.forEach(v => {
        let req = net.request({
          url: `${v.url}${query}`,
          method: 'GET'
        })
        req.on('error', (e) => {
          reject(e.message)
        })
        req.on('response', res => {
          let data = ''
          res.on('data', chunk => {
            data += chunk.toString()
          })

          res.on('end', () => {
            let json = x2js.parse(data, xmlConfig)
            if (json.rss) {
              if (json.rss.list) {
                if (json.rss.list.video && json.rss.list.video.length != 0) {
                  let videos = json.rss.list.video
                  result.push([v.name, videos, v.url])
                }
              }
            }
            if (++resCount == api.length) {
              resolve(result)
            }
          })
        })
        req.end()
      })
    })
  },
  request(requestUrl) {
    return new Promise((resolve, reject) => {
      let req = net.request({
        url: requestUrl,
        method: 'GET'
      })
      req.on('error', e => {
        reject(e.message)
      })
      req.on('response', res => {
        let data = ''
        res.on('data', chunk => {
          data += chunk.toString()
        })
        res.on('end', () => {
          let json = x2js.parse(data,xmlConfig)
          resolve(json)
        })
      })
      req.end()
    })
  }
}
let api = [{
  "name": "ok",
  "url": "http://cj.okzy.tv/inc/api.php",
  "d": "?ac=list wd pg ids"
},
{
  "name": "最大",
  "url": "http://www.zdziyuan.com/inc/api.php"
},
{
  "name": "豆瓣",
  "url": "http://v.1988cj.com/inc/api.php"
},
{
  "name": "酷云",
  "url": "http://caiji.kuyun98.com/inc/ldg_api.php"
},
{
  "name": "芒果",
  "url": "https://api.shijiapi.com/api.php/provide/vod/at/xml/"
},
{
  "name": "速播",
  "url": "https://www.subo988.com/inc/api.php"
},
{
  "name": "最新",
  "url": "http://api.zuixinapi.com/inc/api.php"
},
{
  "name": "酷播",
  "url": "http://api.kbzyapi.com/inc/api.php"
},
{
  "name": "永久",
  "url": "http://cj.yongjiuzyw.com/inc/api.php"
}
]
module.exports = resource