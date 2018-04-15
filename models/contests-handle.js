const database = require('../database')

module.exports = database.model('Handle',
  {
    discord_id: {
      type: String,
      index: true,
      unique: true
    },
    handle: String
  }
)
