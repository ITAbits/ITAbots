module.exports = client => {
    console.log("I'm online!");
    try{
        client.user.settings.inlineEmbedMedia = false;
        client.user.settings.inlineAttachmentMedia = false;
    } catch (err){
        console.log("No user found for client!");
    }
}