const Handle = require('../models/contests-handle')
const cfAPI = require('../contests/judgeAPIs/cfAPI');

module.exports = {
    name: 'addhandle',
    description: 'Adiciona a sua handle do Codeforces aos dados do bot',
    args: true,
    usage: '<handle>',
    execute(message, args) {
        const add_handle = async (element) => {
            try {
                await Handle.findOneAndUpdate(
                    { discord_id: message.author.id },
                    { handle: element.toString() },
                    { upsert: true })
                message.reply(`Seu handle foi atualizado para ${element.toString()}!`);
            } catch (err) {
                console.error(err);
                message.reply('Algo deu errado!')
            }
        }

        args.forEach(element => {
            cfAPI.call_cf_api('user.info', { handles: element }, 2).on('error', () => {
                message.reply(`Handle ${element} not found in Codeforces.`);
            }).on('end', (data) => {
                // Adds handle with correct case
                add_handle(element);
            });
        });


    }
}