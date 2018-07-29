module.exports = function(bot, builder) {
    bot.dialog('resultManagement', [
        function(session) {
            builder.Prompts.choice(session, 'Ready to manage some results!  Here are the sub-commands I support (type \'q\' to quit):', [
                'Add result', 
                'Standings'
            ]);
        },
        function (session, results) {
            var command = results.response.entity;
            
            switch (command)
            {
            case 'Add result':
                session.beginDialog('addResult');
                break;
            case 'Standings':
                session.beginDialog('standings');
                break;
            }
        },
        function (session) {
            session.endConversation('Done!');
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*results*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('addResult', [
        function(session) {
            session.send('Alright, let\'s add a result!');
            //builder.Prompts.text(session, 'Say whatever you want, add result isn\'t implemented :P');
            session.endDialog('Not implemented yet!');
        // },
        // function (session, results) {
        //     if (results.response) {
        //         session.userData.draftName = results.response;
        //         builder.Prompts.text(session, 'Specify a comma delimited list of players to play in the draft (or type \'default\' to add the default crew');
        //     } 
        // },
        // function(session, results){
        //     if(results.response){
        //         session.userData.players = results.response;
        //         var msg = 'Thank you. Created draft ' + session.userData.draftName + ' with players ' + session.userData.players;
        //         session.endDialog(msg);
        //     }
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*add results*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('standings', [
        function(session) {
            session.send('Alright, let\'s list some results!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('Standings not implemented yet, say whatever you want :P');
            session.endDialog('Not implemented yet!');
        }
        //       builder.Prompts.text(session, 'What would you like to name the draft?');
        //     },
        //     function (session, results) {
        //       if (results.response) {
        //         session.userData.draftName = results.response;
        //         builder.Prompts.text(session, 'Specify a comma delimited list of players to play in the draft (or type \'default\' to add the default crew');
        //       } 
        //     },
        //     function(session, results){
        //       if(results.response){
        //         session.userData.players = results.response;
        //         var msg = 'Thank you. Created draft ' + session.userData.draftName + ' with players ' + session.userData.players;
        //         session.endDialog(msg);
        //       }
        //     }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*standings*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};