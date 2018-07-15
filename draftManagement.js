module.exports = function(bot, builder) {
    var helper = require('./helpers.js');
    bot.dialog('draftManagement', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                builder.Prompts.choice(session, 'Ready to manage some drafts!  Here are the sub-commands I support (type \'q\' to quit):', [
                    'Add draft', 
                    'Delete draft', 
                    'List drafts', 
                    'Set default draft' // needed?
                ]);
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function (session, results) {
            var command = results.response.entity;
            
            switch(command)
            {
            case 'Add draft':
                session.beginDialog('addDraft');
                break;
            case 'Delete draft':
                session.beginDialog('deleteDraft');
                break;
            case 'List drafts':
                session.beginDialog('listDraft');
                break;
            case 'Set default draft':
                session.send('Not implemented!');
                break;
            }
        },
        function (session) {
            session.endConversation('Done!');
        }
    ])
        .triggerAction({
            matches: [/^drafts*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('addDraft', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                session.send('Alright, let\'s add a draft!');
                builder.Prompts.text(session, 'What would you like to name the draft?');
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
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

    bot.dialog('deleteDraft', [
        function(session) {
            session.send('Alright, let\'s remove a draft!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('Not implemented yet, say whatever you want :P');
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
            matches: [/^delete draft$/i, /^remove draft$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('listDraft', [
        function(session) {
            session.send('Alright, let\'s list a draft!');
            // code to look up drafts in storage and offer a choice goes here
            //builder.Prompts.text('Not implemented yet, say whatever you want :P');
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
            matches: [/^list drafts*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};