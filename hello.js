module.exports = function(bot, builder) {
  bot.dialog('hello', [
    function (session) {
      for (var i = 0; i < session.message.entities.length; i++) {
        session.send('Entity #' + 'i' + ': ' + session.message.entities[i]);
      }
      // capture session user information
      session.userData = {'userId': session.message.user.id, 'jobTitle': 'Senior Developer'};
      builder.Prompts.text(session, 'Hello... What\'s your handle, sassafras?');
    },
    function (session, results) {
      session.userData.name = results.response;
      builder.Prompts.number(session, 'Hi ' + results.response + ', How many years have you been derfing? (Btw, your id is ' + session.userData.userId + ' and your title is ' + session.userData.jobTitle + ')'); 
    },
    function (session, results) {
      session.userData.coding = results.response;
      builder.Prompts.choice(session, 'What language do you code Node using?', ['JavaScript', 'CoffeeScript', 'TypeScript']);
    },
    function (session, results) {
      session.userData.language = results.response.entity;
      var msg = 'Got it... ' + session.userData.name + ' you\'ve been derfing for ' + session.userData.coding 
                + ' years and use ' + session.userData.language + '.';
      session.endDialog(msg);
    }
  ])
    .triggerAction({
      matches: [/^hello$/i, /^hi$/i , /^yo$/i, /^sup$/i]
    });
};