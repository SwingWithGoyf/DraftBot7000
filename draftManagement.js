module.exports = function(bot, builder) {
    var helper = require('./helpers.js');
    var dataOps = require('./dataOperations.js');
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
            
            switch (command)
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
            matches: [/^(@\S+\s)*draft*$/i],
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
            if (results.response){
                session.userData.players = results.response;
                dataOps.AddDraftObj(helper.GetTeamId(session), session.userData.draftName, function(error) {
                    if (!error) {
                        session.endConversation(`Thank you. Created draft ${session.userData.draftName} with players ${session.userData.players}`);
                    } else {
                        session.endConversation(`Something went wrong, contact tech support!`);
                    }
                });
            }
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*add draft$/i, /^(@\S+\s)*new draft$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('deleteDraft', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                session.send('Alright, let\'s remove a draft!');
                dataOps.GetDraftList(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var draftListForDelete = [];
                        for (var i = 0; i < draftResults.length; i++) {
                            draftListForDelete.push(`${draftResults[i].PartitionKey._}: ${draftResults[i].RowKey._}`.substr(0, 20));
                        }

                        builder.Prompts.choice(session, 
                            'Ready to remove a draft - which one would you like to delete? (or \'q\' to quit):', 
                            draftListForDelete
                        );
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });                
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function (session, results) {
            var command = results.response.entity;
            var extractedDraftId = command.substr(0, String(command).indexOf(':'));
            dataOps.DeleteDraftObj(helper.GetTeamId(session), extractedDraftId, function(error) {
                if (!error) {
                    session.endConversation('Delete successful!');
                } else {
                    session.endConversation(`Something went wrong, contact tech support!`);
                }
            });
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*delete draft$/i, /^(@\S+\s)*remove draft$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('listDraft', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                session.send('Here are the drafts I know about:');

                dataOps.GetDraftList(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var draftResultOutput = '';

                        for (var i = 0; i < draftResults.length; i++) {
                            draftResultOutput += `${draftResults[i].PartitionKey._}: ${draftResults[i].RowKey._}\n\n`;
                        }
                        session.endConversation(draftResultOutput);
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });
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
            matches: [/^(@\S+\s)*list drafts*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};