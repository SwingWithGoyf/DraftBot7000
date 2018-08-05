var azure = require('azure-storage');
var tableSvc = azure.createTableService('DefaultEndpointsProtocol=https;AccountName=cs42764b8a75a82x4a0bx95f;AccountKey=SXmidOGCxdQC8PQnDs5YUlurZT/guHRdZkdi91N9JIqI49COjpZ2lwvHbqxigOvaNFqKG315oGASfUpljw46Fw==;EndpointSuffix=core.windows.net');// console.log('yay table created!');
var cardPrice = require('./cardPrice.js');
var helper = require('./helpers.js');

function CreateTableIfNotExists(tableName) {
    tableSvc.createTableIfNotExists(tableName, function(error, result, response) {
        if (!error && result) {
            if (result.created) {
                console.log('table created!');
            } else {
                console.log('table already exists!');
            }
            
            if (response && response.statusCode) {
                console.log(`Response code: ${response.statusCode}`);
                if (response.body && response.body.TableName) {
                    console.log(`Response body table name: ${response.body.TableName}`);
                }
            }
        }
    });
}

function InsertOrMergeEntity(task, tableName, callback) {
    tableSvc.insertOrMergeEntity(tableName, task, function (error, result, response) {
        if (!error && result) {
            if (result.created) {
                console.log('row inserted');
            } else {
                console.log('row updated');
            }
            
            if (response && response.statusCode) {
                console.log(`Response code: ${response.statusCode}`);
            }
        }
        callback(error, result);
    });
}

function MergeEntity(task, tableName, callback) {
    tableSvc.mergeEntity(tableName, task, function (error, result, response) {
        if (!error && result) {
            console.log('row merged');
            if (response && response.statusCode) {
                console.log(`Response code: ${response.statusCode}`);
            }
        }
        callback(error, result);
    });
}

// function RetrieveEntity(tableName, partitionKey, rowKey) {
//     tableSvc.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
//         if (!error && result) {
//             console.log('row retrieved');
            
//             if (response && response.statusCode) {
//                 console.log(`Response code: ${response.statusCode}`);
//             }

//             return result;
//         }
//     });
// }

function QueryEntities(tableName, query, callback) {
    tableSvc.queryEntities(tableName, query, null, function (error, result, response) {
        if (!error && result && result.entries) {
            console.log('query successful');
            
            if (response && response.statusCode) {
                console.log(`Response code: ${response.statusCode}`);
            }
            callback(result.entries, error);
        } else {
            console.log('query had an error!');
            console.log(error);
            callback(null, error);
        }
    });
}

function DeleteEntity(task, tableName, callback) {
    tableSvc.deleteEntity(tableName, task, function(error, response){
        if (!error) {
            console.log('Item deleted!');
        }

        if (response && response.statusCode) {
            console.log(`Response code: ${response.statusCode}`);
        }
        callback(error);
    });
}

function CreateTables(teamId) {
    CreateTableIfNotExists(`${teamId}Drafts`);
    CreateTableIfNotExists(`${teamId}Users`);
    CreateTableIfNotExists(`${teamId}DraftUsers`);
    CreateTableIfNotExists(`${teamId}DraftRares`);
}

function AddDraftObj(teamId, draftName, callback) {
    GetMaxDraftId(teamId, function(maxDraftId) {
        var entGen = azure.TableUtilities.entityGenerator;
        var newDraftId = Number(maxDraftId) + 1;
        var isDefault = (newDraftId === 0); // first draft is default draft, subsequent drafts are not by default
        var task = {
            PartitionKey: entGen.String(String(newDraftId)),
            RowKey: entGen.String(draftName),
            isDefault: entGen.Boolean(isDefault)
        };

        InsertOrMergeEntity(task, `${teamId}Drafts`, function(error, result) {
            if (!error) {
                console.log(result);
            }
            callback(error);
        });
    });
}

function DeleteDraftObj(teamId, draftId, callback) {
    GetSingleDraftObj(teamId, draftId, function(draftResults, error) {
        if (!error && draftResults && draftResults.length > 0) {
            var task = {
                PartitionKey: draftId,
                RowKey: draftResults[0].RowKey._
            };

            DeleteEntity(task, `${teamId}Drafts`, function(error) {
                if (!error) {
                    console.log('Delete draft obj successful!');
                } else {
                    console.log('Something went wrong trying to delete draft obj!');
                }
                callback(error);
            });
        } else {
            console.log(`Hit unexpected error retrieving draft: ${error}`);
        }
    });    
}

function SetDefaultDraft(teamId, draftId, callback) {
    var entGen = azure.TableUtilities.entityGenerator;
    GetSingleDraftObj(teamId, draftId, function(draftResults, error) {
        if (!error && draftResults && draftResults.length > 0) {
            GetDefaultDraftObj(teamId, function(defaultResults, error) {
                if (!error && defaultResults && defaultResults.length > 0) {
                    var oldDefaultTask = {
                        PartitionKey: entGen.String(defaultResults[0].PartitionKey._),
                        RowKey: entGen.String(defaultResults[0].RowKey._),
                        isDefault: false
                    };
                    var newDefaultTask = {
                        PartitionKey: entGen.String(draftResults[0].PartitionKey._),
                        RowKey: entGen.String(draftResults[0].RowKey._),
                        isDefault: true
                    };

                    MergeEntity(oldDefaultTask, `${teamId}Drafts`, function(error) {
                        if (!error) {
                            console.log(`Merging old default draft successful`);
                            MergeEntity(newDefaultTask, `${teamId}Drafts`, function(error) {
                                if (!error) {
                                    console.log(`Merging new default draft successful`);
                                }
                                callback(error);
                            });                                                        
                        } else {
                            callback(error);
                        }                        
                    });

                } else {
                    console.log(`Hit unexpected error retrieving default draft: ${error}`);
                    callback(error);
                }
            }); 
        } else {
            console.log(`Hit unexpected error retrieving single draft: ${error}`);
            callback(error);
        }
    });   
}

function GetSingleDraftObj(teamId, draftId, callback) {
    var query = new azure.TableQuery()
        .where('PartitionKey eq ?', draftId)
        .top(1);
    
    QueryEntities(`${teamId}Drafts`, query, function(results, error) {
        if (!error) {
            console.log('Get draft by ID successful!');
            callback(results, error);
        } else {
            console.log('Get draft by ID hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetSingleUserObj(teamId, userId, callback) {
    var query = new azure.TableQuery()
        .where('PartitionKey eq ?', userId)
        .top(1);
    
    QueryEntities(`${teamId}Users`, query, function(results, error) {
        if (!error) {
            console.log('Get user by ID successful!');
            callback(results, error);
        } else {
            console.log('Get user by ID hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetUserByUserName(teamId, userName, callback) {
    var query = new azure.TableQuery()
        .where('playerName eq ?', userName)
        .top(1);
    
    QueryEntities(`${teamId}Users`, query, function(results, error) {
        if (!error) {
            console.log('Get user by ID successful!');
            callback(results, error);
        } else {
            console.log('Get user by ID hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetDefaultDraftObj(teamId, callback) {
    var query = new azure.TableQuery()
        .where('isDefault eq ?bool?', true)
        .top(1);
    
    QueryEntities(`${teamId}Drafts`, query, function(results, error) {
        if (!error) {
            console.log('Get default draft successful!');
            callback(results, error);
        } else {
            console.log('Get default draft hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetMaxDraftId(teamId, callback) {
    GetDraftList(teamId, function(draftResults) {
        var draftIdMax = -1;

        for (var i = 0; i < draftResults.length; i++) {
            if (draftResults[i].PartitionKey._ > draftIdMax) {
                draftIdMax = draftResults[i].PartitionKey._;
            }
        }
        callback(draftIdMax);
    });
}

function GetMaxRareId(teamId, callback) {
    var query = new azure.TableQuery()
        .top(1000);

    QueryEntities(`${teamId}DraftRares`, query, function(rareResults, error) {
        if (!error) {
            var rareIdMax = -1;

            for (var i = 0; i < rareResults.length; i++) {
                var curRareId = rareResults[i].RowKey._;
                curRareId = curRareId.substr(0, curRareId.indexOf('-'));
                if (curRareId > rareIdMax) {
                    rareIdMax = curRareId;
                }
            }
            callback(rareIdMax, null);
        } else {
            console.log(`Hit unexpected error when querying max rare id: ${error}`);
            callback(-2, error);
        }
    });
}

function GetDraftByName(teamId, draftName, callback) {
    var query = new azure.TableQuery()
        .where('RowKey eq ?', draftName)
        .top(1);

    QueryEntities(`${teamId}Drafts`, query, function(results, error) {
        if (!error) {
            console.log('Get draft by name successful!');
            callback(results, error);
        } else {
            console.log('Get draft by name hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetDraftList(teamId, callback) {
    var query = new azure.TableQuery()
        .top(100);

    QueryEntities(`${teamId}Drafts`, query, function(results, error) {
        if (!error) {
            console.log('Get draft list successful!');
            callback(results, error);
        } else {
            console.log('Get draft list hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetPlayerList(teamId, draftId, callback) {
    var userQuery = new azure.TableQuery()
        .top(100);

    QueryEntities(`${teamId}Users`, userQuery, function(userResults, error) {
        if (!error) {
            if (userResults && userResults.length > 0) {
                var draftUserQuery = new azure.TableQuery()
                    .where('PartitionKey eq ?', draftId)
                    .top(100);

                QueryEntities(`${teamId}DraftUsers`, draftUserQuery, function(draftUserResults, error) {
                    if (!error) {
                        console.log('Get player list successful!');
                        var playerList = [];
                        for (var i = 0; i < draftUserResults.length; i++) {
                            var playerFound = false;
                            var playerName = '';
                            for (var j = 0; j < userResults.length; j++) {
                                if (userResults[j].PartitionKey._ === draftUserResults[i].RowKey._) {
                                    playerFound = true;
                                    playerName = userResults[j].playerName._;
                                    break;
                                }
                            }
                            if (playerFound) {
                                playerList.push(playerName);
                            } else {
                                console.log('Error in data - user is in draft-user mapping table but not in user table!');
                            }
                        }

                        callback(playerList, error);
                    } else {
                        console.log('Get draft user query hit a failure!');
                        console.log(error);
                        callback(null, error);
                    }
                });
            }
        } else {
            console.log('Get draft user queryhit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetPlayerInfoWithRares(teamId, draftId, userId, callback) {
    var userNameQuery = new azure.TableQuery()
        .where('PartitionKey eq ?', userId)
        .top(1);
    var entGen = azure.TableUtilities.entityGenerator;

    QueryEntities(`${teamId}Users`, userNameQuery, function(userResults, error) {
        if (!error && userResults && userResults.length > 0) {
            console.log('Got player name!');
            
            var playerResult = 
                {
                    name: userResults[0].playerName._,
                    draftedRares: [],
                    redraftedRares: []
                };

            // now get the rares
            //todo: query redrafted cards too (have to change when to callback)
            var filter1 = azure.TableQuery.stringFilter('PartitionKey', azure.TableUtilities.QueryComparisons.EQUAL, String(draftId));
            var filter2 = azure.TableQuery.stringFilter('draftedUserId', azure.TableUtilities.QueryComparisons.EQUAL, userId);
            var finalFilter = azure.TableQuery.combineFilters(filter1, azure.TableUtilities.TableOperators.AND, filter2);
            var draftRaresQuery = new azure.TableQuery()
                .where(finalFilter)
                .top(100);

            QueryEntities(`${teamId}DraftRares`, draftRaresQuery, function(draftRareResults, error) {
                if (!error) {
                    var cardPriceBlob = [];
                    if (draftRareResults && draftRareResults.length > 0) {
                        for (var j = 0; j < draftRareResults.length; j++) {
                            playerResult.draftedRares.push(
                                {
                                    name: draftRareResults[j].rareName._, 
                                    isFoil: draftRareResults[j].isFoil._,
                                    buyPrice: draftRareResults[j].buyPrice._,
                                    sellPrice: draftRareResults[j].sellPrice._,
                                    RowKey: draftRareResults[j].RowKey._
                                });
                            cardPriceBlob.push({'name':draftRareResults[j].rareName._, 'foil': draftRareResults[j].isFoil._});
                        }

                        // also update the prices
                        cardPrice.getPrices(cardPriceBlob, 'both', function(error, cards) {
                            if (!error) {
                                for (var k = 0; k < playerResult.draftedRares.length; k++) {
                                    var curCard = playerResult.draftedRares[k];
                                    var buyPrice = 0;
                                    for (var m = 0; m < cards.buyprices.length; m++) {
                                        buyPrice = (cards.buyprices[m].minPrice == null) ? 0 : cards.buyprices[m].minPrice;
                                        var buyName = cards.buyprices[m].name;
                                        if (buyName === curCard.name) {
                                            break;
                                        }
                                    }

                                    var sellPrice = 0;
                                    for (var n = 0; n < cards.sellprices.length; n++) {
                                        sellPrice = (cards.sellprices[m].minPrice == null) ? 0 : cards.sellprices[m].minPrice;
                                        var sellName = cards.sellprices[m].name;
                                        if (sellName === curCard.name) {
                                            break;
                                        }
                                    }

                                    var updatePriceTask = {
                                        PartitionKey: entGen.String(draftId),
                                        RowKey: entGen.String(playerResult.draftedRares[k].RowKey),
                                        rareName: entGen.String(curCard.name),
                                        buyPrice: entGen.Double(buyPrice),
                                        sellPrice: entGen.Double(sellPrice)
                                    };

                                    console.log(`Attempting to update card ${curCard.name} with buy price ${buyPrice} and sell price ${sellPrice}`);

                                    MergeEntity(updatePriceTask, `${teamId}DraftRares`, function(error) {
                                        if (!error) {
                                            console.log('Updated price successfully');
                                        } else {
                                            console.log(`Hit unexpected error trying to update card prices: ${error}`);
                                            callback(null, error);
                                        }
                                    });

                                }
                            } else {
                                console.log(`Hit unexpected error getting prices: ${error}`);
                                callback(null, error);
                            }
                        });
                    } 

                    callback(playerResult, null);
                } else {
                    console.log(`Unexpected error getting draft rare mapping: ${error}`);
                    callback(null, error);        
                }
            });

        } else {
            console.log(`Unexpected error getting player list: ${error}`);
            callback(null, error);
        }
    });
}

function GetPlayerListWithRares(teamId, draftId, callback) {
    var draftUserQuery = new azure.TableQuery()
        .where('PartitionKey eq ?', draftId)
        .top(100);

    QueryEntities(`${teamId}DraftUsers`, draftUserQuery, function(draftUserResults, error) {
        if (!error) {
            console.log('Get player list successful!');

            var successfulQueries = 0;
            var playerList = [];

            // loop over all users
            for (var i = 0; i < draftUserResults.length; i++) {
                var curUserId = draftUserResults[i].RowKey._;
                
                GetPlayerInfoWithRares(teamId, draftId, curUserId, function(playerResult, error) {
                    if (!error && playerResult) {
                        console.log('Got player info successfully');
                        successfulQueries++;
                        playerList.push(playerResult);
                        if (successfulQueries === draftUserResults.length) {
                            callback(playerList, null);
                        }
                    } else {
                        console.log(`Hit unexpected error querying player info: ${error}`);
                        callback(null, error);
                    }
                });
            }
        } else {
            console.log(`Unexpected error getting player list: ${error}`);
            callback(null, error);
        }
    });
}

function GetPlayerById(teamId, playerId, callback) {
    var query = new azure.TableQuery()
        .where('PartitionKey eq ?', playerId)
        .top(1);

    QueryEntities(`${teamId}Users`, query, function(results, error) {
        if (!error) {
            console.log('Get player by id successful!');
            callback(results, error);
        } else {
            console.log('Get player by id hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function GetPlayerDraftMappingById(teamId, draftId, playerId, callback) {
    var filter1 = azure.TableQuery.stringFilter('PartitionKey', azure.TableUtilities.QueryComparisons.EQUAL, String(draftId));
    var filter2 = azure.TableQuery.stringFilter('RowKey', azure.TableUtilities.QueryComparisons.EQUAL, playerId);
    var finalFilter = azure.TableQuery.combineFilters(filter1, azure.TableUtilities.TableOperators.AND, filter2);
    var query = new azure.TableQuery()
        .where(finalFilter)
        .top(1);

    QueryEntities(`${teamId}DraftUsers`, query, function(results, error) {
        if (!error) {
            console.log('Get player draft mapping successful!');
            callback(results, error);
        } else {
            console.log('Get player draft mapping hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

function AddPlayer(teamId, playerId, playerName, draftId, callback) {
    var entGen = azure.TableUtilities.entityGenerator;
    var playerTask = {
        PartitionKey: entGen.String(playerId),
        RowKey: entGen.String(playerId),
        playerName: entGen.String(playerName)
    };

    // Check if the player entry is already present, if so, update, otherwise, insert
    GetPlayerById(teamId, playerId, function(results, error) {
        if (!error)
        {
            if (results.length > 0) {
                MergeEntity(playerTask, `${teamId}Users`, function(error) {
                    if (!error) {
                        console.log('Updated user successfully in Users table!');
                        var draftPlayerTask = {
                            PartitionKey: entGen.String(String(draftId)),
                            RowKey: entGen.String(playerId)
                        };
                        InsertOrMergeEntity(draftPlayerTask, `${teamId}DraftUsers`, function(error) {
                            if (!error) {
                                console.log('Created and/or updated user-draft mapping in DraftUsers table!');
                            } else {
                                console.log('Something went wrong trying to insert in DraftUsers table!');
                                console.log(error);
                            }
                            callback(error);
                        });
                    } else {
                        console.log('Something went wrong trying to insert in Users table!');
                        console.log(error);
                        callback(error);
                    }
                });
            } else {
                InsertOrMergeEntity(playerTask, `${teamId}Users`, function(error) {
                    if (!error) {
                        console.log('Created and/or updated user successfully in Users table!');
                        var draftPlayerTask = {
                            PartitionKey: entGen.String(String(draftId)),
                            RowKey: entGen.String(playerId)
                        };
                        InsertOrMergeEntity(draftPlayerTask, `${teamId}DraftUsers`, function(error) {
                            if (!error) {
                                console.log('Created and/or updated user-draft mapping in DraftUsers table!');
                            } else {
                                console.log('Something went wrong trying to insert in DraftUsers table!');
                                console.log(error);
                            }
                            callback(error);
                        });
                    } else {
                        console.log('Something went wrong trying to insert in Users table!');
                        console.log(error);
                        callback(error);
                    }
                });
            }
        } else {
            console.log('Something went wrong trying to query from Users table!');
        }    
    });
}

function AddDefaultCrew(teamId, draftId, callback) {
    var defaultCrew = [
        {
            name: 'Charles',
            id: 'U8GFFQ9Q9'
        },
        {
            name: 'Mack',
            id: 'U8GEW2GFM'
        },
        {
            name: 'Mike',
            id: 'U9AV4N9FY'
        },
        {
            name: 'Kael',
            id: 'U8HP5UFQA'
        },
        {
            name: 'Matt',
            id: 'U8GFGNQ0K'
        },
        {
            name: 'Adrian',
            id: 'U8H5E7HLG'
        },
        {
            name: 'Mikko',
            id: 'UB36VQ2KZ'
        }
    ];
    
    if (teamId === 'T8H399MDG') {
        defaultCrew.push(
            {
                name: 'JeremyDev',
                id: 'U8HUL39ML'
            }
        );
    } else {
        defaultCrew.push(
            {
                name: 'Jeremy',
                id: 'U8GLE7FJ8'
            }
        );
    }
    
    for (var j = 0; j < defaultCrew.length; j++) {
        AddPlayer(teamId, defaultCrew[j].id, defaultCrew[j].name, draftId, function(results, error) {
            if (!error) {
                console.log(`Successfully added player in default crew!`);
            } else {
                console.log('Adding default crew hit an error!');
                console.log(error);
                callback(error);
            }
        });
    }
}

function AddRareObj(teamId, draftId, userId, rareName, buyPrice, sellPrice, rareNum, callback) {
    var entGen = azure.TableUtilities.entityGenerator;
    
    // use the web to determine if this is a valid magic card (if not, return it in the callback)
    //todo: read from a "truth" db for cards, not scrape card kingdom
    //todo: handle foils
    cardPrice.getCardBuyPriceWeb(rareName, false, function(cards) {
        if (cards && cards.length > 0) {
            console.log('Succesfully found magic card.');

            GetMaxRareId(teamId, function(maxRareId, error) {
                if (!error && maxRareId > -2) { // -1 is returned if there are no rares, so compare to -2
                    var newRareId = Number(maxRareId) + rareNum + 1;
                    var draftRareTask = {
                        PartitionKey: entGen.String(String(draftId)),
                        RowKey: entGen.String(String(newRareId) + '-' + String(userId)),
                        rareName: entGen.String(rareName),
                        draftedUserId: entGen.String(userId),
                        redraftedUserId: entGen.String(null),
                        redrafted: entGen.Boolean(false),
                        isFoil: entGen.Boolean(false),  //todo: handle foils
                        setSymbol: entGen.String(null),  //todo: handle sets
                        buyPrice: entGen.Double(buyPrice),
                        sellPrice: entGen.Double(sellPrice)
                    };

                    if (rareName.toLowerCase() === 'yes' || rareName.toLowerCase() === 'no' || rareName.toLowerCase() === 'q') {
                        callback('Unexpected input to add rare!');
                    } else {
                        InsertOrMergeEntity(draftRareTask, `${teamId}DraftRares`, function(error) {
                            if (!error) {
                                console.log('Created and/or updated user-draft mapping in DraftRares table!');
                            } else {
                                console.log('Something went wrong trying to insert in DraftRares table!');
                                console.log(error);
                            }
                            callback(null, error);
                        });
                    }
                } else {
                    console.log(`Hit unexpected error trying to query max rare id from AddRareObj: ${error}`);
                    callback(null, error);
                }
            });
        } else {
            var error = 'Input not a valid magic card';
            console.log(error);
            callback(rareName, error);
        }
    });
}

function AddRareList(teamId, draftId, userId, rareList, callback) {
    var rareArray = rareList.split(';');
    //var successfulAdds = 0;

    var cardBlob = [];
    for (var i = 0; i < rareArray.length; i++) {
        //format for each card: {"name":"Legion's Landing", "set": "Ixalan", "foil": false}
        var curRare = rareArray[i];
        var isFoil = helper.IsRareFoil(curRare);
        curRare = curRare.replace('(foil)', '').replace('*', '').trim();
        curRare = helper.ToTitleCase(curRare);
        //todo: handle foils
        cardBlob.push({'name': curRare, 'foil': isFoil});

        //todo: sort out bugs 
        // - Charles has a bug querying foils for buy price
        // - can't use rare name as rowkey in DraftRares - doesn't allow more than one of a rare in a draft (use rare ID instead)
    }

    cardPrice.getPrices(cardBlob, 'both', function(error, cards) {
        var rejectedCards = [];
        var successfulAdds = 0;
        if (!error) {
            for (var i = 0; i < cards.buyprices.length; i++) {
                var cardPriceObj = cards.buyprices[i];
                var buyPrice = (cards.buyprices[i].minPrice == null) ? 0 : cards.buyprices[i].minPrice;
                var sellPrice = 0;

                // find the sell price
                if (cards.sellprices && cards.sellprices.length > 0) {
                    for (var j = 0; j < cards.sellprices.length; j++) {
                        if (cards.sellprices[j].name === cardPriceObj.name) {
                            sellPrice = (cards.sellprices[j].minPrice == null) ? 0 : cards.sellprices[j].minPrice;
                            break;
                        }
                    }
                }

                //todo: figure out the right set so we store the right price
                AddRareObj(teamId, draftId, userId, cardPriceObj.name, buyPrice, sellPrice, i, function(rejectedRare, error) {
                    if (!error) {
                        successfulAdds++;
                        console.log(`Added rare #${successfulAdds} from the list`);
                    } else {
                        console.log(`Hit error while adding rare from list: ${error}`);
                        if (rejectedRare) {
                            console.log(`Rare was not found as a valid magic card: ${rejectedRare}`);
                            rejectedCards.push(rejectedRare);
                        } else {
                            callback(error, null);
                        }
                    }
        
                    if (successfulAdds === (rareArray.length - rejectedCards.length)) {
                        callback(error, rejectedCards);
                    }
                });
            }
        } else {
            console.log(`Hit error while getting prices: ${error}`);
        }
    });
}

function DeleteRareObj(teamId, draftId, userId, callback) {
    var filter1 = azure.TableQuery.stringFilter('PartitionKey', azure.TableUtilities.QueryComparisons.EQUAL, String(draftId));
    var filter2 = azure.TableQuery.stringFilter('draftedUserId', azure.TableUtilities.QueryComparisons.EQUAL, userId);
    var finalFilter = azure.TableQuery.combineFilters(filter1, azure.TableUtilities.TableOperators.AND, filter2);
    var query = new azure.TableQuery()
        .where(finalFilter);

    QueryEntities(`${teamId}DraftRares`, query, function(results, error) {
        if (!error) {
            if (results && results.length > 0) {
                var successfulDeletes = 0;
                for (var i = 0; i < results.length; i++) {
                    var task = {
                        PartitionKey: results[i].PartitionKey._,
                        RowKey: results[i].RowKey._
                    };

                    DeleteEntity(task, `${teamId}DraftRares`, function(error) {
                        if (!error) {
                            console.log('Delete rare obj successful!');
                            successfulDeletes++;
                        } else {
                            console.log(`Something went wrong trying to delete rare obj: ${error}`);
                            callback(null, error);
                        }

                        if (successfulDeletes === results.length) {
                            callback(null, error);
                        }
                    });
                }
            } else {
                var infoMsg = 'User has no rares, nothing to do';
                console.log(infoMsg);
                callback(infoMsg, error);
            }
        } else {
            console.log(`Hit unexpected error retrieving draft: ${error}`);
            callback(error);
        }
    });
}

function GetRareList(teamId, draftId, callback) {
    var userQuery = new azure.TableQuery()
        .top(100);

    QueryEntities(`${teamId}Users`, userQuery, function(userResults, error) {
        if (!error) {
            if (userResults && userResults.length > 0) {
                var draftUserQuery = new azure.TableQuery()
                    .where('PartitionKey eq ?', draftId)
                    .top(100);

                QueryEntities(`${teamId}DraftRares`, draftUserQuery, function(draftRareResults, error) {
                    if (!error) {
                        console.log('Get rare list successful!');
                        var playerList = {};
                        for (var i = 0; i < draftRareResults.length; i++) {
                            var playerFound = false;
                            var playerName = '';
                            // find the player corresponding to the drafter
                            for (var j = 0; j < userResults.length; j++) {
                                if (userResults[j].PartitionKey._ === draftRareResults[i].draftedUserId._) {
                                    playerFound = true;
                                    playerName = userResults[j].playerName._;
                                    break;
                                }
                            }
                            // now push the rare onto an array per-player
                            if (playerFound) {
                                if (!playerList[playerName]) {
                                    playerList[playerName] = [];
                                }
                                playerList[playerName].push(draftRareResults[i].RowKey._);
                            } else {
                                console.log('Error in data - user is in draft-user mapping table but not in user table!');
                                break;
                            }
                        }

                        callback(playerList, error);
                    } else {
                        console.log('Get draft user queryhit a failure!');
                        console.log(error);
                        callback(null, error);
                    }
                });
            }
        } else {
            console.log('Get draft user query hit a failure!');
            console.log(error);
            callback(null, error);
        }
    });
}

module.exports = {
    CreateTables: CreateTables,
    AddDraftObj: AddDraftObj,
    GetSingleDraftObj: GetSingleDraftObj,
    GetSingleUserObj: GetSingleUserObj,
    GetDefaultDraftObj: GetDefaultDraftObj,
    SetDefaultDraft: SetDefaultDraft,
    GetDraftByName: GetDraftByName,
    GetDraftList: GetDraftList,
    GetPlayerList: GetPlayerList,
    GetPlayerListWithRares: GetPlayerListWithRares,
    GetPlayerDraftMappingById: GetPlayerDraftMappingById,
    GetUserByUserName: GetUserByUserName,
    DeleteDraftObj: DeleteDraftObj,
    AddPlayer: AddPlayer,
    AddDefaultCrew: AddDefaultCrew,
    AddRareObj: AddRareObj,
    AddRareList: AddRareList,
    DeleteRareObj: DeleteRareObj,  
    GetRareList: GetRareList
};