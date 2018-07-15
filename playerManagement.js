module.exports = function(bot, builder) {
    bot.dialog('playerManagement', [
        function(session) {
            builder.Prompts.choice(session, 'Ready to manage some players!  Here are the sub-commands I support (type \'q\' to quit):', [
                'Add player', 
                'Delete player', 
                'List players'
            ]);
        },
        function (session, results) {
            var command = results.response.entity;
            
            switch (command)
            {
            case 'Add player':
                session.beginDialog('addPlayer');
                break;
            case 'Delete player':
                session.beginDialog('deletePlayer');
                break;
            case 'List players':
                session.beginDialog('listPlayer');
                break;
            }
        },
        function (session) {
            session.endConversation('Done!');
        }
    ])
        .triggerAction({
            matches: [/^players*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('addPlayer', [
        function(session) {
            session.send('Alright, let\'s add a player!');
            //builder.Prompts.text(session, 'Say whatever you want, add player isn\'t implemented :P');
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
            matches: [/^add player$/i, /^remove player$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('deletePlayer', [
        function(session) {
            session.send('Alright, let\'s remove a player!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('Remove player not implemented yet, say whatever you want :P');
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
            matches: [/^delete player$/i, /^remove player$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('listPlayer', [
        function(session) {
            session.send('Alright, let\'s list some players!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('List players not implemented yet, say whatever you want :P');
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
            matches: [/^list players*$/i, /^remove players*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};