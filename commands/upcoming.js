const fetch = require('../fetch');

exports.run = function(client, message, args) {
    
    const user = message.client;
    const maxContests = 7;
    let validContests = 0;
    let result = "";
    console.log('ue');
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
            const min = Math.ceil((entry.time.getTime() - Date.now()) / (1000 * 60));
            result += entry.name + ',' + entry.url;
        }
    });

    if (maxContests < validContests)
        result += "And other " + (validContests - maxContests) + " scheduled in the next 2 weeks...";

    if (result == "")
        result ="No upcoming contests :(";

    message.channel.sendMessage(result);


}