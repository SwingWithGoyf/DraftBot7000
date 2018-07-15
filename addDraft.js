module.exports = function(bot, builder) {
  bot.dialog('addDraft', [
    function(session) {
      session.send('Alright, let\'s add a draft!');
      builder.Prompts.text(session, 'What would you like to name the draft?');
    },
    function (session, results) {
      if (results.response) {
        session.userData.draftName = results.response;
        builder.Prompts.text(session, 'Specify a comma delimited list of players to play in the draft (or type \'default\' to add the default crew');
      } 
    },
    function(session, results){
      if(results.response){
        session.userData.players = results.response;
        var msg = 'Thank you. Created draft ' + session.userData.draftName + ' with players ' + session.userData.players;
        session.endDialog(msg);
      }
    }
  ])
    .triggerAction({
      matches: [/^add draft$/i, /^new draft$/i],
      confirmPrompt: 'This will cancel the current operation. Are you sure?'
    });
};