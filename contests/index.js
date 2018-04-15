// const logger = require('./logger');
// const alerts = require('./alerts');
const fs = require('fs')
const path = require('path')
const schedule = require('node-schedule')

// Getting every available fetcher
const fetchers = fs.readdirSync(path.join(__dirname))
  .filter((file) => { return file.endsWith('.js') })
  .filter((file) => { return file !== 'index.js' })
  .map((file) => { return require(path.join(__dirname, file)) })

const fetch = module.exports = {}

fetch.upcoming = []

fetch.updateUpcoming = function () {
  const upcoming = fetch.upcoming
  upcoming.length = 0
  // alerts.reset_alerts();

  fetchers.forEach((fetcher) => {
    console.log(fetcher)
    let contests = []
    fetcher.updateUpcoming(contests).on('end', () => {
      // logger.info('merging ' + fetcher.name + ' (found: ' + contests.length + ')');
      if (contests.length > 0) {
        // alerts.add_alerts(contests, fetcher);

        upcoming.push.apply(upcoming, contests)
        upcoming.sort((a, b) => { return a.time - b.time })
      }
    })
  })
}

fetch.init = function () {
  // Makes initial fetch and schedules one for 3am everyday
  fetch.updateUpcoming()
  schedule.scheduleJob({ hour: 3, minute: 0, second: 0 }, () => { fetch.updateUpcoming() })
}
