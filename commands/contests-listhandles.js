const Handle = require('../models/contests-handle')

module.exports = {
  name: 'listhandles',
  description: 'Mostra todos os handles do codeforces armazenados',
  category: 'contests',
  aliases: ['handles'],
  async execute (message) {
    const handles = await Handle.find()

    if (!handles) {
      return message.channel.send('Não há nenhum handle registrado')
    }

    const text = handles.reduce(
      (txt, handle) => txt.concat(`<@${handle.discord_id}>: (${handle.handle});\n`),
      'Handles: \n'
    )

    message.channel.send(text)
  }
}
