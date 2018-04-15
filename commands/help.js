const { prefix, categories } = require('config');

module.exports = {
	name: 'help',
	description: 'Mostra essa mensagem de novo (e de novo ( e de novo ( e ... ) ) )',
	aliases: ['commands', 'ajuda', 'comandos'],
	usage: '<command name>',
	execute(message, args) {
		const { commands } = message.client;
		const used_categories = commands
			.map(c => c.category)
			.filter((c, i, cs) => cs.indexOf(c) === i) // get unique elements
			.filter(c => categories.includes(c))
		const data = [];

		if (!args.length) {
			data.push('Aqui está uma lista com todos os meus comandos, divididos por categoria:\n');
			data.push(
				used_categories.map(
					(category) => `**${category}**: ` + commands
						.filter(command => command.category == category)
						.map(command => command.name)
						.join(', ')
				).join('\n\n')
			);
			data.push(`\nVocê pode digitar \`${prefix}help <command name>\` para saber mais informacoes sobre um comando!`);
			data.push(`Você pode digitar \`${prefix}help <category>\` para saber detalhes de todos os comandos de uma categoria!`);
		}
		else {
			let help_commands;
			if (commands.has(args[0])) {
				help_commands = [commands.get(args[0])];
			} else if (used_categories.includes(args[0])) {
				help_commands = commands.filter(c => c.category === args[0])
			} else {
				return message.reply('Esse não é um comando (ou categoria) válido!');
			}

			help_commands.forEach(command => {
				data.push(`**Nome:** ${command.name}`);

				if (command.description) data.push(`**Descrição:** ${command.description}`);
				if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
				if (command.usage) data.push(`**Uso:** ${prefix}${command.name} ${command.usage}`);

				data.push('\n');
			});
		}

		message.author.send(data, { split: true })
			.then(() => {
				if (message.channel.type !== 'dm') {
					message.channel.send('Eu te enviei uma DM com todos os comandos');
				}
			})
			.catch(() => message.reply('Aparentemente eu não posso te mandar DM`s'));
	},
};
