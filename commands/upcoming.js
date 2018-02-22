const fetch = require('../fetch');

const time_link = function(name, d) {
	return "https://www.timeanddate.com/worldclock/fixedtime.html?" +
		"msg=" + encodeURIComponent(name) +
		"&year=" + d.getUTCFullYear() +
		"&month=" + (d.getUTCMonth() + 1).toString() +
		"&day=" + d.getUTCDate() +
		"&hour=" + d.getUTCHours() +
		"&min=" + d.getUTCMinutes() +
		"&sec=" + d.getUTCSeconds();
};

/* returns a string of number x with suffix, unless it is 0
 * used to print dates */
const num = function(x, suffix) {
	x = Math.floor(x);
	if (x == 0) return "";
	return x.toString() + suffix;
};

exports.run = function(client, message, args) {
    
    const user = message.client;
    const maxContests = 7;
    let validContests = 0;
    let result = "";
    console.log(fetch);
    fetch.upcoming.forEach( (entry) => {
        console.log(entry);

        if (entry.time.getTime() < Date.now())
            return;
        if (entry.time.getTime() > Date.now() + 14 * 24 * 60 * 60 * 1000) // at most 14 days
            return;
        // if (user.has('ignore.' + entry.judge).value() === true)
        //     return;

        validContests++;

        if (validContests <= maxContests) {
            const d = entry.duration / 60;
            console.log(entry);
            const min = Math.ceil((entry.time.getTime() - Date.now()) / (1000 * 60));
            result += entry.name + ', <' + entry.url  + '> ,' + " (" + Math.floor(d / 60) + "h" + (d % 60 == 0? "" : (d % 60 < 10? "0" : "") + (d % 60).toString())+ ")\nStarts in " +
					num(min / (60 * 24), 'd ') + num((min / 60) % 24, 'h ') + (min % 60).toString() + "m\n\n";
        }
    });

    if (maxContests < validContests)
        result += "And other " + (validContests - maxContests) + " scheduled in the next 2 weeks...";

    if (result == "")
        result ="No upcoming contests :(";

    message.channel.sendMessage(result);


}