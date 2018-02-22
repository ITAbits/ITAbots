require('dotenv').config();
var Discord = require('discord.js');
var logger = require('winston');

const bot = new Discord.Client();

const sql = require('sqlite');
sql.open('./handles.sqlite');


const fetch = require('./fetch').init();

require('./util/eventLoader')(bot);

bot.login(process.env.BOT_TOKEN);

module.exports = {} = bot;