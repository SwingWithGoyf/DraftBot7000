module.exports = function(bot, builder) {
    bot.dialog('rareManagement', [
        function(session) {
            builder.Prompts.choice(session, 'Ready to manage some rares!  Here are the sub-commands I support (type \'q\' to quit):', [
                'Add rare', 
                'Delete rare', 
                'List rares',
                'Redraft rares'
            ]);
        },
        function (session, results) {
            var command = results.response.entity;
            
            switch (command)
            {
            case 'Add rare':
                session.beginDialog('addRare');
                break;
            case 'Delete rare':
                session.beginDialog('deleteRare');
                break;
            case 'List rares':
                session.beginDialog('listRares');
                break;
            case 'Redraft rares':
                session.beginDialog('redraft');
                break;
            }
        },
        function (session) {
            session.endConversation('Done!');
        }
    ])
        .triggerAction({
            matches: [/^rares*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
    
    bot.dialog('addRare', [
        function(session) {
            session.send('Alright, let\'s add a rare!');
            //builder.Prompts.text(session, 'Say whatever you want, add rare isn\'t implemented :P');
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
            matches: [/^add rares*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('deleteRare', [
        function(session) {
            session.send('Alright, let\'s remove a rare!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('Remove rare not implemented yet, say whatever you want :P');
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
            matches: [/^delete rares*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('listRares', [
        function(session) {
            session.send('Alright, let\'s list some rares!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('List rares not implemented yet, say whatever you want :P');
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

    bot.dialog('redraft', [
        function(session) {
            session.send('Alright, let\'s redraft some rares!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('Redraft rares not implemented yet, say whatever you want :P');
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
            matches: [/^redraft$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};