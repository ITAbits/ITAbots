exports.run = function(client, message, args) {
    message.channel.send("Hi. I am the bits bot. And these are my commands:\n\n"
    + '!help: shows this message again (and again (and again( and ...)));\n\n'
    + '!upcoming: shows the next contests avaible on the next week on the most popular online judges\n\n'
    + '!addhandle <handle>: adds your codeforces handle to my database.\n\n'
    + '!listhandles: show all handles in my database\n\n'
    + '!site: remember precious boy to work on our site\n\n'
    + 'If someone in my database participates in a codeforces contest, I will put the results in the contest channel!\n\n'
    + '#BoraBits!\n'
    );
}