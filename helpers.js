function CheckMessage(session) {
  if (session.message && session.message.address && session.message.address.conversation && session.message.address.channelId) {
    var address = session.message.address;
    session.send('DEBUG: Hello!  Your user ID is ' + session.message.user.id);

    if (address.channelId.toLowerCase() === 'slack') {
      session.send('DEBUG: I see that you\'re on a slack endpoint!');
      var messageInfo = address.conversation.id.split(':');
      if (messageInfo.length <= 2) {
        session.send('DEBUG: Error, conversation ID was in an unexpected format');
      } else {
        var channelId = messageInfo[2];
        var teamId = messageInfo[1];
        var text = session.message.text;
        session.send('DEBUG: You typed ' + text + ', your user ID is ' + session.message.user.id + ', your channel is ' + 
                    channelId + ', and your team is ' + teamId);
        if (channelId.charAt(0) === 'D') {
          session.send('DEBUG: This message was sent as a DM');
        } else if (channelId.charAt(0) === 'C') {
          session.send('DEBUG: This message was sent in a channel');
        } else {
          session.send('DEBUG: This message was sent in neither a channel nor a DM');
        }
        if (session.message.entities && session.message.entities.length > 0 && session.message.entities[0].mentioned && session.message.entities[0].mentioned.name === 'azurebot') {
          session.send('DEBUG: you mentioned me');
        } else {
          session.send('DEBUG: you did not mention me');
        }
      } 
    } else if (address.channelId.toLowerCase() === 'emulator') {
      session.send('DEBUG: I see that you\'re on an emulator endpoint!');
      if (session.message.text.indexOf('azurebot') >= 0) {
        session.send('DEBUG: You mentioned me');
      } else {
        session.send('DEBUG: You did not mention me');
      }
    }
    session.send('Debug info: your channel ID is ' + address.conversation.id + ' and your messaging type is ' + address.channelId);
  }
}

module.exports = {
  CheckMessage: CheckMessage
};