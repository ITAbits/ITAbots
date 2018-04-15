const Handle = require('../models/contests-handle')
const cfAPI = require('../contests/judgeAPIs/cfAPI')

module.exports = {
  name: 'addhandle',
  description: 'Adiciona a sua handle do Codeforces aos dados do bot',
  category: 'contests',
  usage: '<handle>',
  args: true,
  execute (message, args) {
    const addHandle = async (element) => {
      try {
        await Handle.findOneAndUpdate(
          { discord_id: message.author.id },
          { handle: element.toString() },
          { upsert: true })
        message.reply(`Seu handle foi atualizado para ${element.toString()}!`)
      } catch (err) {
        console.error(err)
        message.reply('Algo deu errado!')
      }
    }

    const handle = args[0]
    cfAPI.call('user.info', { handles: handle }, 2).on('error', () => {
      message.reply(`Handle ${handle} not found in Codeforces.`)
    }).on('end', (data) => {
      // Adds handle with correct case
      addHandle(handle)
    })
  }
}
