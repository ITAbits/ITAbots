const sql = require("sqlite");
sql.open("./handles.sqlite");

exports.run = function(client, message, args) {
    args.forEach(element => {
        sql.get(`select * from handles where id ="${message.author.id}"`).then(row => {
            console.log(row);
            if (!row) {
                console.log('Entrou no if');
                console.log(element);
                sql.run("INSERT INTO handles (id, handle) VALUES (?, ?)", [message.author.id, element.toString()]);
            } else {
                // sql.run(`UPDATE handles SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
            }
        }).catch(() => {
            console.log('entrou no catch');
            console.error;
            sql.run("CREATE TABLE IF NOT EXISTS handles (id INTEGER PRIMARY KEY, handle TEXT)").then(() => {
                sql.run("INSERT INTO handles (id, handle) VALUES (?, ?)", [message.author.id, element.toString()]);
            });
        })
    });
}