module.exports = {
  prefix: '!',
  token: process.env.DISCORD_TOKEN,
  categories: ['contests', 'site', 'gamejams', 'recommend'],
  db: {
    url: process.env.MONGODB_URI
  }
}
