const database = require('../database')

module.exports = database.model('Item',
  {
    name: String,
	author: String
  }
)
