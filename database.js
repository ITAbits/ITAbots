const { db } = require('config');
const mongoose = require('mongoose');

mongoose.connect(db.url);

const test = async () => {
  //await Handle.remove().exec();
  let testHandle = new Handle({ discord_id: 'test', handle: 'test' });
  try {
    await testHandle.save();
    const handles = await Handle.find();
    console.log('DB TEST', handles);
  } catch (err) {
    console.log(err)
  }
}
//test();

module.exports = mongoose