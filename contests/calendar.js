// const logger = require('winston')
const EventEmitter = require('events')
const ical = require('ical')

module.exports = {
  name: 'calendar',
  updateUpcoming: (upcoming) => {
    const emitter = new EventEmitter()

    ical.fromURL(
      'https://calendar.google.com/calendar/ical/t313lnucdcm49hus40p3bjhq44%40group.calendar.google.com/public/basic.ics',
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

          let entry = {
            judge: 'calendar',
            name: el.summary,
            url: 'https://calendar.google.com/calendar/embed?src=t313lnucdcm49hus40p3bjhq44%40group.calendar.google.com&ctz=America/Sao_Paulo',
            time: new Date(el.start),
            duration: (el.end - el.start) / 1000
          }

          let url
          if (typeof el.description !== 'undefined') { url = el.description.split(/\s/g)[0] }
          if (typeof url !== 'undefined' && /^http/.test(url)) { entry.url = url }

          let ending = new Date(entry.time)
          ending.setSeconds(ending.getSeconds() + entry.duration)
          if (ending.getTime() >= Date.now()) { upcoming.push(entry) }
        }

        upcoming.sort((a, b) => { return a.time - b.time })

        emitter.emit('end')
      }
    )

    return emitter
  }
}
