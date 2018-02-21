const sql = require("sqlite");
sql.open("./handles.sqlite");
const cfAPI = require('../judgeAPIs/cfAPI');

exports.run = function(client, message, args) {
    var resultTxt = '';

    sql.all(`select * from handles`).then(rows => {
        rows.forEach(element => {
            resultTxt = resultTxt.concat(`<@${element.id}>: (${element.handle}); `)
        });
        message.channel.send(resultTxt);
    });

}
