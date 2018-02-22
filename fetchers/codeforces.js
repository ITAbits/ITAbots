"use strict";
// const logger = require('../logger');
const logger = require('winston');
const EventEmitter = require('events');
const schedule = require('node-schedule');
const sql = require("sqlite");
sql.open("./handles.sqlite");
const cfAPI = require('../judgeAPIs/cfAPI');

const bot = require('../bot');
const contest_end_handlers = [];
const in_contest_ids = {};

/* Msgs all users in a contest */
let contest_msg_all = function(msg, contest_id) {
	// ITAbit's contests channel ID. Should put in .env;
	var channelId = '153561098757341184';
	let channel;
	bot.channels.forEach((element) => {
		if(element.id == channelId){
			channel = element;
		}
	});
	channel.send(msg);
	logger.info("Message sent in contests channel.");
};

/* Called when ratings are changed */
let process_final = function(ratings, ev, contest_id) {
	const mp = new Map();
	ratings.forEach((r) => mp.set(r.handle.toLowerCase(), r));
	sql.all(`select * from handles`).then(rows => {
		let msg = 'Ratings for ' + ev.name + ' are out!';
		let rs = []; // ratings for handles from user
        rows.forEach(element => {
			element.cf_handles.forEach((h) => {
				if(mp.has(h))
					rs.push(mp.get(h));
			});
		});
		if(rs.length === 0)
			return;
		rs.sort((a, b) => a.rank - b.rank);
		rs.forEach((r) => {
			let prefix = "-";
			if(r.newRating >= r.oldRating) prefix = "+";
			msg += '\n\n' + r.handle + '\n' + r.oldRating + ' → '+ r.newRating + ' (' + prefix + (r.newRating - r.oldRating) + ')';
		});
		contest_msg_all(msg, null);
    }).catch((error) => {
		logger.error(error);
		logger.error("Can't acess elements in DB.");
	});
};

/* Called when system testing ends, checks for rating changes */
let process_ratings = function(ev, contest_id) {
	contest_msg_all('System testing has finished for ' + /*html_msg.make_link(ev.name, ev.url)*/ev.name + '. Waiting for rating changes.', contest_id);
	cfAPI.wait_for_condition_on_api_call('contest.ratingChanges', {contestId: contest_id},
		/* condition */ (obj) => obj.length > 0,
		/* callback */  () => {
			let in30s = new Date(Date.now() + 30 * 1000);
			schedule.scheduleJob(in30s, () =>
				cfAPI.call_cf_api('contest.ratingChanges', {contestId: contest_id}, 4)
				.on('end', (obj) => process_final(obj, ev, contest_id)));
		});
};

/* Called when system testing starts, checks for end of system testing */
let process_systest = function(ev, contest_id) {
	contest_msg_all('System testing has started for ' + /*html_msg.make_link(ev.name, ev.url)*/ ev.name + '.', contest_id);
	cfAPI.wait_for_condition_on_api_call('contest.standings', {contestId: contest_id, from: 1, count: 1},
		/* condition */ (obj) => obj.contest.phase === 'FINISHED',
		/* callback */  () => process_ratings(ev, contest_id));
};

/* Called when contest ends, checks for start of system testing */
let process_contest_end = function(ev, contest_id) {
	contest_msg_all(/*html_msg.make_link(ev.name, ev.url)*/ ev.name + ' has just ended. Waiting for system testing.', contest_id);
	cfAPI.wait_for_condition_on_api_call('contest.standings', {contestId: contest_id, from: 1, count: 1},
		/* condition */ (obj) => obj.contest.phase === 'SYSTEM_TEST' || obj.contest.phase === 'FINISHED',
		/* callback */  () => process_systest(ev, contest_id));
};

/* Checks if contest really ended (was not extended) and collects participating handles. */
let prelim_contest_end = function(ev, contest_id) {
	in_contest_ids[contest_id] = new Set();

	/* Deletes this info after 5 days */
	let in5d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
	schedule.scheduleJob(in5d, () => delete in_contest_ids[contest_id] );

	const user_handles = new Set();
	sql.all(`select * from handles`).then(rows => {
        rows.forEach(element => {
            user_handles.add(element.handle);
        });
    }).catch((error) => {
		logger.error(error);
		logger.error("Can't acess elements in DB.");
	});
	logger.info("Total handle count: " + user_handles.size);
	cfAPI.call_cf_api('contest.standings', {contestId: contest_id, showUnofficial: true}, 5)
		.on('end', (obj) => {
			const handles_in_contest = new Set();
			obj.rows.forEach((row) => row.party.members.forEach((m) => { if(user_handles.has(m.handle)) handles_in_contest.add(m.handle); }));
			logger.info("CF contest " + ev.name + " has " + handles_in_contest.size + " participants.");
			if(handles_in_contest.size === 0) return;

			sql.all(`select * from handles`).then(rows => {
				rows.forEach(element => {
					if(handles_in_contest.has(element.handle)) in_contest_ids[contest_id].add(element.id);
				});
			}).catch((error) => {
				console.error(error);
				console.log("Can't acess elements in DB.");
			});
			logger.info("CF contest " + ev.name + " has participants from " + in_contest_ids[contest_id].size + " chats.");

			cfAPI.wait_for_condition_on_api_call('contest.standings', {contestId: contest_id, from: 1, count: 1},
				/* condition */ (obj) => obj.contest.phase !== 'BEFORE' && obj.contest.phase !== 'CODING',
				/* callback */  () => process_contest_end(ev, contest_id));
		});
};

module.exports = {
	name: "codeforces",
	updateUpcoming: (upcoming) => {
		const emitter = new EventEmitter();

		contest_end_handlers.forEach((h) => { if (h) h.cancel(); });
		contest_end_handlers.length = 0;

		cfAPI.call_cf_api('contest.list', null, 1).on('end', (parsedData) => {
			try {
				upcoming.length = 0;
				parsedData.forEach( (el) => {
					if (el.phase === "BEFORE" || el.phase === "CODING") {
						const ev = {
							judge: 'codeforces',
							name: el.name,
							url: 'http://codeforces.com/contests/' + el.id,
							time: new Date(el.startTimeSeconds*1000),
							duration: el.durationSeconds
						};
						upcoming.push(ev);
						if (el.type === "CF")
							contest_end_handlers.push(schedule.scheduleJob(new Date((el.startTimeSeconds + el.durationSeconds - 60) * 1000),
								() => { prelim_contest_end(ev, el.id); }));
					}
				});

				upcoming.sort( (a, b) => { return a.time - b.time; });

				emitter.emit('end');
			} catch (e) {
				logger.error('Parse Failed Codeforces\n' + e.message);
			}
		});

		return emitter;
	}
};
