const logger = require('winston');

module.exports = message => {
    var prefix = '!';
    if(!message.content.startsWith(prefix)) return;
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    const client = message.client;

    const args = message.content.split(' ');
    const command = args.shift().slice(1);
    // logger.info(command);
    try {
        let cmdFile = require(`../commands/${command}`);
        cmdFile.run(client, message, args);
    } catch (err) {
        logger.error(`Command ${command} failed\n ${err.stack}`);
    }


}