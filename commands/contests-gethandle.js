const Handle = require('../models/contests-handle')

module.exports = {
    name: 'gethandle',
    description: 'TODO',
    aliases: ['myhandle', 'handle'],
    async execute(message) {
        try {
            const handle = await Handle.findOne({ discord_id: message.author.id });
            console.log(handle);
            if (!handle) {
                return message.reply("You have no handle registered.");
            }
            message.reply(`Your handle is ${row.handle}`);

        } catch (err) {
            console.error(err);
            message.reply('Algo deu errado!')
        }
    }
}