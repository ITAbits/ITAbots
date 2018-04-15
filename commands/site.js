module.exports = {
    name: 'site',
    description: 'Fala há quanto tempo estamos sem site',
    category: 'site',
    execute(message, args) {
        var today = Date.now();
        var start = Date.UTC(2017, 8, 20);
        var interval = Math.floor((today - start) / (24 * 60 * 60 * 1000));

        var idPrecious = '368906096230006785';

        message.channel.send('Estamos a ' + interval + ' dias sem site, mas o <@' + idPrecious + '> está trabalhando duro nele!');

    }
}