const sql = require("sqlite");
sql.open("./handles.sqlite");

exports.run = function(client, message, args) {
    sql.get(`SELECT * FROM handles WHERE id ="${message.author.id}"`).then(row => {
        if (!row) return message.reply("You have no handle registered.");
        message.reply(`Your handle is ${row.handle}`);
    });
}