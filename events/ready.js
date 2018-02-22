const logger = require('winston');

module.exports = client => {
    try{
        client.user.settings.inlineEmbedMedia = false;
        client.user.settings.inlineAttachmentMedia = false;
        logger.info("I'm online!");
    } catch (err){
        logger.error("No user found for client!");
    }
}