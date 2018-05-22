const Item = require('../models/wishlist-item')

module.exports = {
  name: 'addwishlist',
  description: 'Adiciona um item na wishlist da bits',
  category: 'wishlist',
  usage: '<name>',
  args: true,
  execute (message, args) {
    var item = args[0]
    Item.create({name: item, author: message.author.username}, function (err, newItem) {
      if (err) {
        console.log(err)
        message.reply('Algo deu errado!')
      } else {
        message.reply('Seu pedido foi adicionado à lista!')
      }
    })
  }
}
