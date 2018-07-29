module.exports = function(bot, builder) {
    var helper = require('./helpers.js');
    var dataOps = require('./dataOperations.js');
    bot.dialog('playerManagement', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                builder.Prompts.choice(session, 'Ready to manage some players!  Here are the sub-commands I support (type \'q\' to quit):', [
                    'Add me', 
                    'Add player', 
                    'Delete player', 
                    'List players'
                ]);
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function (session, results) {
            var command = results.response.entity;
            
            switch (command)
            {
            case 'Add me':
                session.beginDialog('addMe');
                break;
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
            matches: [/^(@\S+\s)*players*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('addMe', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                session.send('Alright, let\'s add you as a player!');
                //TODO: more sophisticated logic for user name (I currently have 'foo' stored for your nickname, is this okay?)
                builder.Prompts.text(session, 'What should I call you?');
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function (session, results) {
            if (results.response) {
                var userName = results.response;
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var defaultDraftId = draftResults[0].PartitionKey._;
                        dataOps.GetPlayerDraftMappingById(helper.GetTeamId(session), defaultDraftId, helper.GetUserId(session), function(results, error) {
                            if (!error) {
                                var userExisted = false;
                                if (results && results.length > 0) {
                                    userExisted = true;
                                }
                                dataOps.AddPlayer(helper.GetTeamId(session), helper.GetUserId(session), userName, defaultDraftId, function(error) {
                                    if (!error) {
                                        if (userExisted) {
                                            session.endConversation('You were already part of the default draft!');
                                        } else {
                                            session.endConversation('Successfully added you to the default draft!');
                                        }
                                    } else {
                                        session.endConversation(`Something went wrong adding player, contact tech support!`);
                                    }
                                });
                            } else {
                                session.endConversation(`Something went wrong querying draft-user mapping, contact tech support!`);
                            }
                        });
                    } else {
                        session.endConversation('Couldn\'t get default draft, consult tech support!');
                    }
                });
            }
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*add me$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('addPlayer', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                session.send('Alright, let\'s add a player!');
                //builder.Prompts.text(session, 'Say whatever you want, add player isn\'t implemented :P');
                session.endDialog('Not implemented yet!');
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
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
            matches: [/^(@\S+\s)*add player$/i, /^remove player$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('deletePlayer', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                session.send('Alright, let\'s remove a player!');
                // code to look up drafts in storage and offer a choice goes here
                //builder.Prompts.text('Remove player not implemented yet, say whatever you want :P');
                session.endDialog('Not implemented yet!');
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
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
            matches: [/^delete player$/i, /^(@\S+\s)*remove player$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('listPlayer', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                session.send('Alright, let\'s list some players!');
                // code to look up drafts in storage and offer a choice goes here
                //builder.Prompts.text('List players not implemented yet, say whatever you want :P');
                session.endDialog('Not implemented yet!');
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
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
            matches: [/^(@\S+\s)*list players*$/i, /^(@\S+\s)*remove players*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};