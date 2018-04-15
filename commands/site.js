module.exports = {
  name: 'site',
  description: 'Fala há quanto tempo estamos sem site',
  category: 'site',
  execute (message, args) {
    let today = Date.now()
    let start = Date.UTC(2017, 8, 20)
    let interval = Math.floor((today - start) / (24 * 60 * 60 * 1000))

    let idPrecious = '368906096230006785'

    message.channel.send('Estamos a ' + interval + ' dias sem site, mas o <@' + idPrecious + '> está trabalhando duro nele!')
  }
}
