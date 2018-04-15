'use strict'
// const logger = require('../logger');
const logger = require('winston')
const EventEmitter = require('events')
const schedule = require('node-schedule')
const cfAPI = require('./judgeAPIs/cfAPI')

const Handles = require('../models/contests-handle')

const bot = require('../bot')
const contestEndHandlers = []
const inContestIds = {}

/* Msgs all users in a contest */
let contestMsgAll = function (msg, contestId) {
  // ITAbit's contests channel ID. Should put in .env;
  let channelId = '153561098757341184'
  let channel
  bot.channels.forEach((element) => {
    if (element.id === channelId) {
      channel = element
    }
  })
  channel.send(msg)
  logger.info('Message sent in contests channel.')
}

/* Called when ratings are changed */
let processFinal = async function (ratings, ev, contestId) {
  const mp = new Map()
  ratings.forEach((r) => mp.set(r.handle.toLowerCase(), r))
  try {
    const handles = await Handles.find()
    let msg = 'Ratings for ' + ev.name + ' are out!'
    let rs = [] // ratings for handles from user
    handles.forEach(element => {
      element.cfHandles.forEach((h) => {
        if (mp.has(h)) { rs.push(mp.get(h)) }
      })
    })
    if (rs.length === 0) { return }
    rs.sort((a, b) => a.rank - b.rank)
    rs.forEach((r) => {
      let prefix = '-'
      if (r.newRating >= r.oldRating) prefix = '+'
      msg += '\n\n' + r.handle + '\n' + r.oldRating + ' → ' + r.newRating + ' (' + prefix + (r.newRating - r.oldRating) + ')'
    })
    contestMsgAll(msg, null)
  } catch (error) {
    logger.error("Can't acess elements in DB.")
    logger.error(error)
  }
}

/* Called when system testing ends, checks for rating changes */
let processRatings = function (ev, contestId) {
  contestMsgAll('System testing has finished for ' + /* htmlMsg.makeLink(ev.name, ev.url) */ev.name + '. Waiting for rating changes.', contestId)
  cfAPI.waitForConditionOnApiCall('contest.ratingChanges', { contestId: contestId },
    /* condition */(obj) => obj.length > 0,
    /* callback */() => {
      let in30s = new Date(Date.now() + 30 * 1000)
      schedule.scheduleJob(in30s, () =>
        cfAPI.call('contest.ratingChanges', { contestId: contestId }, 4)
          .on('end', (obj) => processFinal(obj, ev, contestId)))
    })
}

/* Called when system testing starts, checks for end of system testing */
let processSystest = function (ev, contestId) {
  contestMsgAll('System testing has started for ' + /* htmlMsg.makeLink(ev.name, ev.url) */ ev.name + '.', contestId)
  cfAPI.waitForConditionOnApiCall('contest.standings', { contestId: contestId, from: 1, count: 1 },
    /* condition */(obj) => obj.contest.phase === 'FINISHED',
    /* callback */() => processRatings(ev, contestId))
}

/* Called when contest ends, checks for start of system testing */
let processContestEnd = function (ev, contestId) {
  contestMsgAll(/* htmlMsg.makeLink(ev.name, ev.url) */ ev.name + ' has just ended. Waiting for system testing.', contestId)
  cfAPI.waitForConditionOnApiCall('contest.standings', { contestId: contestId, from: 1, count: 1 },
    /* condition */(obj) => obj.contest.phase === 'SYSTEMtEST' || obj.contest.phase === 'FINISHED',
    /* callback */() => processSystest(ev, contestId))
}

/* Checks if contest really ended (was not extended) and collects participating handles. */
let prelimContestEnd = async function (ev, contestId) {
  inContestIds[contestId] = new Set()

  /* Deletes this info after 5 days */
  let in5d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  schedule.scheduleJob(in5d, () => delete inContestIds[contestId])

  const userHandles = new Set()
  try {
    const handles = await Handles.find()
    handles.forEach(element => {
      userHandles.add(element.handle)
    })
  } catch (error) {
    logger.error(error)
    logger.error("Can't acess elements in DB.")
  }

  logger.info('Total handle count: ' + userHandles.size)
  cfAPI.call('contest.standings', { contestId: contestId, showUnofficial: true }, 5)
    .on('end', async (obj) => {
      const handlesInContest = new Set()
      obj.rows.forEach((row) => row.party.members.forEach((m) => { if (userHandles.has(m.handle)) handlesInContest.add(m.handle) }))
      logger.info('CF contest ' + ev.name + ' has ' + handlesInContest.size + ' participants.')
      if (handlesInContest.size === 0) return

      try {
        const handles = await Handles.find()
        handles.forEach(element => {
          if (handlesInContest.has(element.handle)) inContestIds[contestId].add(element.id)
        })
      } catch (error) {
        console.error(error)
        console.log("Can't acess elements in DB.")
      }
      logger.info('CF contest ' + ev.name + ' has participants from ' + inContestIds[contestId].size + ' chats.')

      cfAPI.waitForConditionOnApiCall('contest.standings', { contestId: contestId, from: 1, count: 1 },
        /* condition */(obj) => obj.contest.phase !== 'BEFORE' && obj.contest.phase !== 'CODING',
        /* callback */() => processContestEnd(ev, contestId))
    })
}

module.exports = {
  name: 'codeforces',
  updateUpcoming: (upcoming) => {
    const emitter = new EventEmitter()

    contestEndHandlers.forEach((h) => { if (h) h.cancel() })
    contestEndHandlers.length = 0

    cfAPI.call('contest.list', null, 1).on('end', (parsedData) => {
      try {
        upcoming.length = 0
        parsedData.forEach((el) => {
          if (el.phase === 'BEFORE' || el.phase === 'CODING') {
            const ev = {
              judge: 'codeforces',
              name: el.name,
              url: 'http://codeforces.com/contests/' + el.id,
              time: new Date(el.startTimeSeconds * 1000),
              duration: el.durationSeconds
            }
            upcoming.push(ev)
            if (el.type === 'CF') {
              contestEndHandlers.push(schedule.scheduleJob(new Date((el.startTimeSeconds + el.durationSeconds - 60) * 1000),
                () => { prelimContestEnd(ev, el.id) }))
            }
          }
        })

        upcoming.sort((a, b) => { return a.time - b.time })

        emitter.emit('end')
      } catch (e) {
        logger.error('Parse Failed Codeforces\n' + e.message)
      }
    })

    return emitter
  }
}
