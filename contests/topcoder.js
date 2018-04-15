// const logger = require('winston')
const EventEmitter = require('events')
const ical = require('ical')

module.exports = {
  name: 'topcoder',
  updateUpcoming: (upcoming) => {
    const emitter = new EventEmitter()

    ical.fromURL(
      'https://calendar.google.com/calendar/ical/appirio.com_bhga3musitat85mhdrng9035jg%40group.calendar.google.com/public/basic.ics',
      {},
      (err, data) => {
        if (err) {
          // TODO: better handle error
          console.error(err)
        }

        upcoming.length = 0

        for (let key in data) {
          if (!data.hasOwnProperty(key)) { return }
          let el = data[key]

          if (/(SRM|TCO)/g.test(el.summary)) {
            let entry = {
              judge: 'topcoder',
              name: el.summary,
              url: 'http://topcoder.com/',
              time: new Date(el.start),
              duration: (el.end - el.start) / 1000
            }

            let ending = new Date(entry.time)
            ending.setSeconds(ending.getSeconds() + entry.duration)
            if (ending.getTime() >= Date.now()) { upcoming.push(entry) }
          }
        }

        upcoming.sort((a, b) => { return a.time - b.time })

        emitter.emit('end')
      }
    )

    return emitter
  }
}
