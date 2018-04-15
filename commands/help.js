const { prefix } = require('config');

module.exports = {
	name: 'help',
	description: 'Mostra essa mensagem de novo (e de novo ( e de novo ( e ... ) ) )',
	aliases: ['commands', 'ajuda', 'comandos'],
	usage: '<command name>',
	execute(message, args) {
		const { commands } = message.client;
		const data = [];

		if (!args.length) {
			data.push('Aqui está uma lista com todos os meus comandos, divididos por categoria:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nVocê pode digitar \`${prefix}help <command name>\` para saber mais informacoes sobre um comando!`);
		}
		else {
			if (!commands.has(args[0])) {
				return message.reply('Esse não é um comando válido!');
			}

			const command = commands.get(args[0]);

			data.push(`**Nome:** ${command.name}`);

			if (command.description) data.push(`**Descrição:** ${command.description}`);
			if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
			if (command.usage) data.push(`**Uso:** ${prefix}${command.name} ${command.usage}`);
		}

		message.author.send(data, { split: true })
			.then(() => {
				if (message.channel.type !== 'dm') {
					message.channel.send('Eu te enviei uma DM com todos os comandos');
				}
			})
			.catch(() => message.reply('aparentemente eu não posso te mandar DM`s'));
	},
};
