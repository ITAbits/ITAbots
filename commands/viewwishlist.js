const Item = require('../models/wishlist-item')

module.exports = {
  name: 'viewwishlist',
  description: 'Mostra a wish list da ITAbits.',
  category: 'wishlist',
  usage: '',
  args: false,
  execute (message, args) {
    Item.find({}, function (err, items) {
      if (err) {
        console.log(err)
        message.reply('Algo deu errado!')
      } else {
        var toReply = ''
        items.forEach(function(item){
          toReply.concat(item.name, ' - ', item.author, '\n')
        })
        message.reply(toReply)
      }
    })
  }
}
