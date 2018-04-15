ITAbots
=======

O bot do discord da ITAbits

Uso
---

Basta criar um arquivo default.js na pasta config preenchendo as seguintes informações:
```js
module.exports = {
  prefix: '!', // prefixo das mensagens para o bot no discord
  token: 'token-do-bot-do-discord',
  categories: ['contests', 'site', 'gamejams', 'recommend'], // quais categorias do bot quer usar
  db: {
    url: 'mongodb://localhost/itabots' // url do banco de dados
  }
}
```

Ou setar as variaveis de ambiente necessárias para se utilizar o config/production.js (para usar no Heroku por exemplo)

Desenvolvimento
---------------

- Comandos:


Para adicionar novas funcionalidades, basta seguir o template de criação de um novo comando:

```js
// categoria-nomedocomando.js:
module.exports = {
  name: 'nome-do-comando',
  description: 'descrição do que o comando faz',
  category: 'categoria-do-comando (e.g: contests, gamejams, site, etc...',
  usage: '<arg1> <arg2>', // o nome de cada um dos argumentos necessarios
  args: true, // caso os argumentos sejam obrigatórios
  execute (message, args) {
    // message é a interface para se comunicar de volta com o cliente
    // args é um array com os argumentos separados
  }
}
```

- Armazenar dados

Para criar um novo modelo de armazenamento, basta criar um arquivo `"models/categoria-nomedomodelo.js"` seguindo os moldes de [`"models/contests-handle.js"`](./models/contests-handle.js)

- Categorias

Se quiser adicionar funcionalidades genericas para uma nova categoria, fazer tudo dentro de uma pasta com o nome daquela categoria (ver como é feito para *contests*)

- Standard.js

Estamos usando o padrão de código [standard.js](https://standardjs.com/), então antes de dar push cheque se o código está todo no padrao usando `npm run test`

- Documentações relevantes:
  - [discord.js](https://discordjs.guide/#/)
  - [mongoose](http://mongoosejs.com/docs/guide.html)
  - [standardjs](https://standardjs.com/)

