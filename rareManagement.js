module.exports = function(bot, builder) {
    var helper = require('./helpers.js');
    var dataOps = require('./dataOperations.js');
    bot.dialog('rareManagement', [
        function(session) {
            builder.Prompts.choice(session, 'Ready to manage some rares!  Here are the sub-commands I support (type \'q\' to quit):', [
                'Add rares', 
                'Add rare on behalf',
                'Delete rare', 
                'Delete on behalf', 
                'List rares',
                'Redraft rares'
            ]);
        },
        function (session, results) {
            var command = results.response.entity;
            
            switch (command)
            {
            case 'Add rares':
                session.beginDialog('addRare');
                break;
            case 'Add rare on behalf':
                session.beginDialog('addRareOnBehalf');
                break;
            case 'Delete rare':
                session.beginDialog('deleteRare');
                break;
            case 'Delete on behalf':
                session.beginDialog('deleteRareOnBehalf');
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
            matches: [/^(@\S+\s)*rares*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
    
    bot.dialog('addRare', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForAddRare = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run command \`add rare\` on default draft ${session.userData.draftIdForAddRare}: ${draftResults[0].RowKey._}, is this what you want?`, 'yes|no');
                    } else {
                        session.endConversation('Couldn\'t fetch default draft, contact tech support!');
                    }
                });                
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function(session, results, next) {
            if (results.response.entity === 'yes') {
                next();
            } else {
                dataOps.GetDraftList(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var draftListForSelection = [];
                        for (var i = 0; i < draftResults.length; i++) {
                            draftListForSelection.push(`${draftResults[i].PartitionKey._}: ${draftResults[i].RowKey._}`.substr(0, 20));
                        }

                        builder.Prompts.choice(session, 
                            'Ready to select a draft for the **add rares** operation - which one would you like? (or \'q\' to quit):', 
                            draftListForSelection
                        );
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });
            }
        },
        function(session, results) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.draftIdForAddRare = command.substr(0, String(command).indexOf(':'));
            }

            builder.Prompts.text(session, 'Please enter a **semi-colon** delimited list of rares: (prefix with \'*\' or \'(foil)\' or \'q\' to quit)');
        },
        function(session, results) {
            if (results.response) {
                var rareList = results.response;
                dataOps.AddRareList(helper.GetTeamId(session), session.userData.draftIdForAddRare, helper.GetUserId(session), rareList, function(error, rejectedRares) {
                    if (!error) {
                        if (rejectedRares.length > 0) {
                            session.endConversation(`Could not find a match for some of the specified rares as valid magic cards (check spelling): ${rejectedRares.join(',')}, added the rest successfully`);
                        } else {
                            session.endConversation('Successfully added all specified rares!');
                        }
                    } else {
                        session.endConversation('Something went wrong with add rare, contact tech support!');
                    }
                });
            }
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*add rares*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('addRareOnBehalf', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForAddRareOnBehalf = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run command **add rare on behalf** on default draft ${session.userData.draftIdForAddRareOnBehalf}: ${draftResults[0].RowKey._}, is this what you want?`, 'yes|no');
                    } else {
                        session.endConversation('Couldn\'t fetch default draft, contact tech support!');
                    }
                });                
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function(session, results, next) {
            if (results.response.entity === 'yes') {
                next();
            } else {
                dataOps.GetDraftList(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var draftListForSelection = [];
                        for (var i = 0; i < draftResults.length; i++) {
                            draftListForSelection.push(`${draftResults[i].PartitionKey._}: ${draftResults[i].RowKey._}`.substr(0, 20));
                        }

                        builder.Prompts.choice(session, 
                            'Ready to select a draft for the **add rares on behalf** operation - which one would you like? (or \'q\' to quit):', 
                            draftListForSelection
                        );
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });
            }
        },
        function(session, results) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.draftIdForAddRareOnBehalf = command.substr(0, String(command).indexOf(':'));
            }
            
            dataOps.GetPlayerList(helper.GetTeamId(session), session.userData.draftIdForAddRareOnBehalf, function(playerResults, error) {
                if (!error) {
                    var playerListForSelection = [];
                    for (var i = 0; i < playerResults.length; i++) {
                        playerListForSelection.push(`${i + 1}: ${playerResults[i]}`.substr(0, 20));
                    }

                    builder.Prompts.choice(session, 
                        'Ready to select a player in the draft for whom you\'d like to **add rares** (or \'q\' to quit):', 
                        playerListForSelection
                    );
                } else {
                    session.endConversation('Couldn\'t get player list, consult tech support!');
                }
            });
        },
        function(session, results) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.playerNameForAddRare = command.substr(String(command).indexOf(':') + 2, command.length);
            }

            dataOps.GetUserByUserName(helper.GetTeamId(session), session.userData.playerNameForAddRare, function(results, error) {
                if (!error) {
                    if (results && results.length > 0) {
                        session.userData.playerIdForAddRareOnBehalf = results[0].PartitionKey._;
                        builder.Prompts.text(session, `Please enter a **semi-colon** delimited list of rares for user ${session.userData.playerNameForAddRare}: (prefix with '*' or '(foil)' or 'q' to quit)`);
                    } else {
                        session.endConversation('Couldn\'t get player by player name (length 0), contact tech support!');                        
                    }
                } else {
                    session.endConversation('Couldn\'t get player by player name, contact tech support!');
                }
            });            
        },
        function(session, results) {
            if (results.response) {
                var rareList = results.response;
                dataOps.AddRareList(helper.GetTeamId(session), session.userData.draftIdForAddRareOnBehalf, session.userData.playerIdForAddRareOnBehalf, rareList, function(error, rejectedRares) {
                    if (!error) {
                        if (rejectedRares.length > 0) {
                            session.endConversation(`Could not find a match for some of the specified rares: ${rejectedRares.join(',')}, added the rest successfully`);
                        } else {
                            session.endConversation('Successfully added all specified rares!');
                        }
                    } else {
                        session.endConversation('Something went wrong with add rare, contact tech support!');
                    }
                });
            }
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*add rares* on behalf$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('deleteRare', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForDeleteRare = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run command \`delete rare\` on default draft ${session.userData.draftIdForDeleteRare}: ${draftResults[0].RowKey._}, is this what you want? (:warning: Warning, this will delete **all** of your associated rares for the draft, so type 'q' if this isn't what you want to do)`, 'yes|no');
                    } else {
                        session.endConversation('Couldn\'t fetch default draft, contact tech support!');
                    }
                });                
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function(session, results, next) {
            if (results.response.entity === 'yes') {
                next();
            } else {
                dataOps.GetDraftList(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var draftListForSelection = [];
                        for (var i = 0; i < draftResults.length; i++) {
                            draftListForSelection.push(`${draftResults[i].PartitionKey._}: ${draftResults[i].RowKey._}`.substr(0, 20));
                        }

                        builder.Prompts.choice(session, 
                            'Ready to select a draft for the **delete rares** operation - which one would you like? (or \'q\' to quit):', 
                            draftListForSelection
                        );
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });
            }
        },
        function(session, results) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.draftIdForDeleteRare = command.substr(0, String(command).indexOf(':'));
            }

            dataOps.DeleteRareObj(helper.GetTeamId(session), session.userData.draftIdForDeleteRare, helper.GetUserId(session), function(message, error) {
                if (!error) {
                    if (message) {
                        // case where nothing went wrong but there's a message to surface to the user (e.g. no rares to delete)
                        session.endConversation(message);
                    } else {
                        session.endConversation('Rares deleted successfully!');
                    }
                } else {
                    session.endConversation(`Encountered an unexpected error in delete rare: ${error}`);
                }
            });
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*delete rares*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('deleteRareOnBehalf', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForDeleteRareOnBehalf = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run command **delete rare on behalf** on default draft ${session.userData.draftIdForDeleteRareOnBehalf}: ${draftResults[0].RowKey._}, is this what you want? (:warning:**Warning** this will delete **all** rares for the specified player, select 'q' if this isn't what you want...)`, 'yes|no');
                    } else {
                        session.endConversation('Couldn\'t fetch default draft, contact tech support!');
                    }
                });                
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function(session, results, next) {
            if (results.response.entity === 'yes') {
                next();
            } else {
                dataOps.GetDraftList(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var draftListForSelection = [];
                        for (var i = 0; i < draftResults.length; i++) {
                            draftListForSelection.push(`${draftResults[i].PartitionKey._}: ${draftResults[i].RowKey._}`.substr(0, 20));
                        }

                        builder.Prompts.choice(session, 
                            'Ready to select a draft for the **delete rares on behalf** operation - which one would you like? (or \'q\' to quit):', 
                            draftListForSelection
                        );
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });
            }
        },
        function(session, results) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.draftIdForDeleteRareOnBehalf = command.substr(0, String(command).indexOf(':'));
            }
            
            dataOps.GetPlayerList(helper.GetTeamId(session), session.userData.draftIdForDeleteRareOnBehalf, function(playerResults, error) {
                if (!error) {
                    var playerListForSelection = [];
                    for (var i = 0; i < playerResults.length; i++) {
                        playerListForSelection.push(`${i + 1}: ${playerResults[i]}`.substr(0, 20));
                    }

                    builder.Prompts.choice(session, 
                        'Ready to select a player in the draft for whom you\'d like to **delete rares** (or \'q\' to quit):', 
                        playerListForSelection
                    );
                } else {
                    session.endConversation('Couldn\'t get player list, consult tech support!');
                }
            });
        },
        function(session, results) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.playerNameForDeleteRareOnBehalf = command.substr(String(command).indexOf(':') + 2, command.length);
            
                dataOps.GetUserByUserName(helper.GetTeamId(session), session.userData.playerNameForDeleteRareOnBehalf, function(results, error) {
                    if (!error) {
                        if (results && results.length > 0) {
                            session.userData.playerIdForDeleteRareOnBehalf = results[0].PartitionKey._;
                            dataOps.DeleteRareObj(helper.GetTeamId(session), session.userData.draftIdForDeleteRareOnBehalf, session.userData.playerIdForDeleteRareOnBehalf, function(message, error) {
                                if (!error) {
                                    if (message) {
                                        // case where nothing went wrong but there's a message to surface to the user (e.g. no rares to delete)
                                        session.endConversation(message);
                                    } else {
                                        session.endConversation('Rares deleted successfully!');
                                    }
                                } else {
                                    session.endConversation(`Encountered an unexpected error in delete rare: ${error}`);
                                }
                            });
                        } else {
                            session.endConversation('Couldn\'t get player by player name (length 0), contact tech support!');                        
                        }
                    } else {
                        session.endConversation('Couldn\'t get player by player name, contact tech support!');
                    }
                });
            }            
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*delete rares* on behalf$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('listRares', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForListRares = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run **list rares** command on default draft ${session.userData.draftIdForListRares}: ${draftResults[0].RowKey._}, is this what you want?`, 'yes|no');
                    } else {
                        session.endConversation('Couldn\'t fetch default draft, contact tech support!');
                    }
                });                
            } else {
                session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
            }
        },
        function(session, results, next) {
            if (results.response.entity === 'yes') {
                next();
            } else {
                dataOps.GetDraftList(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        var draftListForSelection = [];
                        for (var i = 0; i < draftResults.length; i++) {
                            draftListForSelection.push(`${draftResults[i].PartitionKey._}: ${draftResults[i].RowKey._}`.substr(0, 20));
                        }

                        builder.Prompts.choice(session, 
                            'Ready to select a draft for the **list rares** operation - which one would you like? (or \'q\' to quit):', 
                            draftListForSelection
                        );
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });
            }
        },
        function(session, results) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.draftIdForListRares = command.substr(0, String(command).indexOf(':'));
            }

            var playerListMessage = {};
            playerListMessage.channelData = {};
            playerListMessage.channelData.text = 'Here are the players for the selected draft:';
            playerListMessage.channelData.response_type = 'in_channel';
            playerListMessage.channelData.attachments = [];

            dataOps.GetRareList(helper.GetTeamId(session), session.userData.draftIdForListRares, function(rareResults, error) {
                if (!error) {
                    if (rareResults) {
                        for (const [key, rareValue] of Object.entries(rareResults)) {
                            playerListMessage.channelData.attachments.push({
                                fallback: `Player ${key} drafted ${rareValue.join(',')}`,
                                color: '#ff8000',
                                fields: [
                                    {
                                        title: 'Player:',
                                        value: key,
                                        short: true
                                    },
                                    {
                                        title: `Rares drafted (${rareValue.length})`,
                                        value: rareValue.join(','),
                                        short: true
                                    }
                                ]
                            });
                        }
                    } else {
                        playerListMessage.channelData.text += 'None';
                    }

                    session.endConversation(playerListMessage);

                } else {
                    session.endConversation('Couldn\'t fetch rare list, contact tech support!');
                }
            });
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*list rare.*$/i, /^(@\S+\s)*show rare.*$/i],
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
            matches: [/^(@\S+\s)*redraft$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};