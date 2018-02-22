const sql = require("sqlite");
sql.open("./handles.sqlite");
const cfAPI = require('../judgeAPIs/cfAPI');

exports.run = function(client, message, args) {
    args.forEach(element => {
        cfAPI.call_cf_api('user.info', {handles: element}, 2).on('error', () => {
            message.reply(`Handle ${element} not found in Codeforces.`);
        }).on('end', (data) => {
            // Adds handle with correct case
            add_handle(element);
        });
    });

    function add_handle(element) {
        sql.get(`select * from handles where id ="${message.author.id}"`).then(row => {
            console.log(row);
            if (!row) {
                console.log(element);
                sql.run("INSERT INTO handles (id, handle) VALUES (?, ?)", [message.author.id, element.toString()]);
                message.reply("Seu handle foi adicionado com sucesso!");
            } else {
                sql.run(`UPDATE handles SET handle = ${element.toString()} WHERE id = ${message.author.id}`);
                message.reply(`Seu handle foi atualizado para ${element.toString()}!`);
            }
        }).catch(() => {
            console.log('entrou no catch');
            console.error;
            sql.run("CREATE TABLE IF NOT EXISTS handles (id INTEGER PRIMARY KEY, handle TEXT)").then(() => {
                sql.run("INSERT INTO handles (id, handle) VALUES (?, ?)", [message.author.id, element.toString()]);
                message.reply("Seu handle foi adicionado com sucesso!");
            });
        })
    }
}