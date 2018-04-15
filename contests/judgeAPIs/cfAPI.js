const logger = require('winston')
const http = require('http')
const EventEmitter = require('events')
const schedule = require('node-schedule')
const qs = require('querystring')

const cfApi = module.exports = {}

/* Calls method name with arguments args (from codeforces API), returns an emitter that calls 'end' returning the parsed JSON when the request ends. The emitter returns 'error' instead if something went wrong */
cfApi.call = function (name, args, retryTimes) {
  const emitter = new EventEmitter()

  emitter.on('error', (extraInfo) => {
    logger.error('Call to ' + name + ' failed. ' + extraInfo)
  })

  let try_
  try_ = function (times) {
    logger.info('CF request: ' + 'http://codeforces.com/api/' + name + '?' + qs.stringify(args))
    http.get('http://codeforces.com/api/' + name + '?' + qs.stringify(args), (res) => {
      if (res.statusCode !== 200) {
        res.resume()
        if (times > 0) try_(times - 1)
        else emitter.emit('error', 'Status Code: ' + res.statusCode)
        return
      }
      res.setEncoding('utf8')

      let data = ''

      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        let obj
        try {
          logger.info(data.substr(0, 1000))
          obj = JSON.parse(data)
          if (obj.status === 'FAILED') {
            if (times > 0) try_(times - 1)
            else emitter.emit('error', 'Comment: ' + obj.comment)
            return
          }
        } catch (e) {
          if (times > 0) try_(times - 1)
          else emitter.emit('error', '')
          return
        }
        emitter.emit('end', obj.result)
      }).on('error', (e) => {
        if (times > 0) try_(times - 1)
        else emitter.emit('error', e.message)
      })
    }).on('error', (e) => {
      if (times > 0) try_(times - 1)
      else emitter.emit('error', e.message)
    })
  }
  try_(retryTimes)

  return emitter
}

/* Calls cf api function 'name' every 30 seconds until condition is satisfied, and then calls callback. Tries at most for 3 days, if it is not satisfied, then it gives up. */
cfApi.waitForConditionOnApiCall = function (name, args, condition, callback) {
  // const emitter = new EventEmitter()
  let countCalls = 0
  let handle = schedule.scheduleJob('/30 * * * * *', () => {
    cfApi.call(name, args, 0)
      .on('end', (obj) => {
        if (condition(obj)) {
          handle.cancel()
          callback(obj)
        } else if (countCalls++ > 2 * 60 * 24 * 3) { handle.cancel() } // 3 days
      }).on('error', () => {
        if (countCalls++ > 2 * 60 * 24 * 3) { handle.cancel() }// 3 days
      })
  })
}
