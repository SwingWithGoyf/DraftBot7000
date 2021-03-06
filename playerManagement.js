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
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForAddMe = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run command **add me** on default draft ${session.userData.draftIdForAddMe}: ${draftResults[0].RowKey._}, is this what you want?`, 'yes|pick another draft');
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
                            'Ready to select a draft for the **add me** operation - which one would you like? (or \'q\' to quit):', 
                            draftListForSelection
                        );
                    } else {
                        session.endConversation('Couldn\'t get draft list, consult tech support!');
                    }
                });
            }
        },
        function(session, results, next) {
            if (results.response) {
                var command = results.response.entity;
                session.userData.draftIdForAddMe = command.substr(0, String(command).indexOf(':'));
            }
            var teamId = helper.GetTeamId(session);
            var userId = helper.GetUserId(session);
            dataOps.GetPlayerDraftMappingById(teamId, session.userData.draftIdForAddMe, userId, function(results, error) {
                if (!error) {
                    if (results && results.length > 0) {
                        session.endConversation('You\'re already in the default draft!');
                    } else {
                        session.send('Alright, let\'s add you as a player!');
                        dataOps.GetSingleUserObj(teamId, userId, function(results, error) {
                            if (!error) {
                                if (results && results.length > 0 && results[0].playerName) {
                                    // user is already in our db, so don't prompt them for a new nickname
                                    session.userData.userName = results[0].playerName._;
                                    console.log(`User ${session.userData.userName} already in the user db, not prompting for a new nickname...`);
                                    next();
                                } else {
                                    builder.Prompts.text(session, 'What should I call you?');
                                }
                            } else {
                                session.endConversation(`Something went wrong querying user by id, contact tech support!`);
                            }                                     
                        });                                    
                    }
                } else {
                    session.endConversation(`Something went wrong querying draft-user mapping, contact tech support!`);
                }
            });           
        },
        function (session, results) {
            if (results.response) {
                session.userData.userName = results.response;
            }

            dataOps.AddPlayer(helper.GetTeamId(session), helper.GetUserId(session), session.userData.userName, session.userData.draftIdForAddMe, function(error) {
                if (!error) {
                    session.endConversation('Successfully added you to the specified draft!');
                } else {
                    session.endConversation(`Something went wrong adding player, contact tech support!`);
                }
            });
        }
    ])
        .triggerAction({
            matches: [/^(@\S+\s)*add me$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });

    bot.dialog('addPlayer', [
        function(session) {
            if (!helper.CheckMessage(session)) {
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForAddPlayer = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run command **add player** on default draft ${session.userData.draftIdForAddPlayer}: ${draftResults[0].RowKey._}, is this what you want?`, 'yes|pick another draft');
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
                            'Ready to select a draft for the **add player** operation - which one would you like? (or \'q\' to quit):', 
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
                session.userData.draftIdForAddPlayer = command.substr(0, String(command).indexOf(':'));
            }    
            
            session.send('Alright, let\'s add a player!');
            builder.Prompts.text(session, 'What should I call the new player?');
        },
        function (session, results, next) {
            if (results.response) {
                session.userData.userNameToAdd = results.response;
                dataOps.GetUserByUserName(helper.GetTeamId(session), session.userData.userNameToAdd, function(results, error) {
                    if (!error) {
                        if (results && results.length > 0) {
                            // assume they mean the user that matches if there is one
                            session.userData.userIdToAdd = results[0].PartitionKey._;
                            next();
                        } else {
                            builder.Prompts.text(session, 'What is the user ID for the new player? (should be of the form \'U8HUL39ML\')');
                        }
                    } else {
                        session.endConversation(`Something went wrong querying player by name, contact tech support!`);
                    }
                });
            }
        },
        function (session, results) {
            if (results.response) {
                session.userData.userIdToAdd = results.response;
            }
            dataOps.AddPlayer(helper.GetTeamId(session), session.userData.userIdToAdd, session.userData.userNameToAdd, session.userData.draftIdForAddPlayer, function(error) {
                if (!error) {
                    session.endConversation('Successfully added the specified player to the specified draft!');
                } else {
                    session.endConversation(`Something went wrong adding player, contact tech support!`);
                }
            });
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
                dataOps.GetDefaultDraftObj(helper.GetTeamId(session), function(draftResults, error) {
                    if (!error) {
                        session.userData.draftIdForListPlayers = draftResults[0].PartitionKey._;
                        builder.Prompts.choice(session, `About to run **list players** command on default draft ${session.userData.draftIdForListPlayers}: ${draftResults[0].RowKey._}, is this what you want?`, 'yes|pick another draft');
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
                            'Ready to select a draft for the **list players** operation - which one would you like? (or \'q\' to quit):', 
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
                session.userData.draftIdForListPlayers = command.substr(0, String(command).indexOf(':'));
            }

            var playerListMessage = {};
            playerListMessage.channelData = {};
            playerListMessage.channelData.text = 'Here are the players for the selected draft:';
            playerListMessage.channelData.response_type = 'in_channel';
            playerListMessage.channelData.attachments = [];

            dataOps.GetPlayerListWithRares(helper.GetTeamId(session), session.userData.draftIdForListPlayers, function(playerResults, error) {
                if (!error) {
                    if (playerResults) {
                        for (var j = 0; j < playerResults.length; j++) {
                            var raresDrafted = 0;
                            var rareList = [];
                            var playerName = 'Undefined';
                            var playerData = playerResults[j];
                            if (playerData.draftedRares && playerData.draftedRares.length > 0) {
                                raresDrafted = playerData.draftedRares.length;
                                var draftedRareArray = playerData.draftedRares;
                                // turn the rare list into a more display friendly form
                                for (var i = 0; i < draftedRareArray.length; i++) {
                                    var rareStr = '';
                                    rareStr += draftedRareArray[i].name;
                                    if (draftedRareArray[i].isFoil) {
                                        rareStr += ' (foil)';
                                    }
                                    rareStr += ` (Buy: $${helper.DecorateBuyPrice(draftedRareArray[i].buyPrice, draftedRareArray[i].name, draftedRareArray[i].isFoil)})`;
                                    rareList.push(rareStr);
                                }
                            }
                            if (playerData.name) {
                                playerName = playerData.name;
                            } 
                            playerListMessage.channelData.attachments.push({
                                fallback: `Player ${playerName} draft info`,
                                color: helper.GetColorFromIndex(j),
                                fields: [
                                    {
                                        title: 'Player:',
                                        value: playerName,
                                        short: true
                                    },
                                    {
                                        title: `Rares drafted (${raresDrafted})`,
                                        value: rareList.join(', '),
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
            matches: [/^(@\S+\s)*list players*$/i, /^(@\S+\s)*remove players*$/i],
            confirmPrompt: 'This will cancel the current operation. Are you sure?'
        });
};