// const logger = require('../logger');
const logger = require('winston')
const https = require('https')
const EventEmitter = require('events')

module.exports = {
  name: 'csacademy',
  updateUpcoming: (upcoming) => {
    const emitter = new EventEmitter()

    const options = {
      hostname: 'csacademy.com',
      path: '/contests/',
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      }
    }

    https.get(options, (res) => {
      let error

      if (res.statusCode !== 200) {
        error = new Error('Fetch Failed [' + res.statusCode + '] CSAcademy')
      }

      if (error) {
        logger.error(error.message)
        res.resume() // free
        return
      }

      res.setEncoding('utf8')

      let rawStateJSON = ''

      upcoming.length = 0
      res.on('data', (chunk) => { rawStateJSON += chunk })
      res.on('end', () => {
        try {
          let stateJSON = JSON.parse(rawStateJSON)
          stateJSON.state.Contest.forEach(contest => {
            if (!contest.rated) return

            let entry = {
              judge: 'csacademy',
              name: 'CSAcademy ' + contest.longName,
              url: 'https://csacademy.com/contest/' + contest.name,
              time: new Date(contest.startTime * 1000),
              duration: contest.endTime - contest.startTime
            }

            let ending = new Date(entry.time)
            ending.setSeconds(ending.getSeconds() + entry.duration)
            if (ending.getTime() >= Date.now()) { upcoming.push(entry) }
          })

          upcoming.sort((a, b) => { return a.time - b.time })

          emitter.emit('end')
        } catch (e) {
          logger.error('Parse Failed CSAcademy\n' + e.message)
        }
      })
    }).on('error', (e) => {
      logger.error('Request Error CSAcademy\n' + e.message)
    })

    return emitter
  }
}
