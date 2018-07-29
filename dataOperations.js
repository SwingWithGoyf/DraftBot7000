var azure = require('azure-storage');
var tableSvc = azure.createTableService('DefaultEndpointsProtocol=https;AccountName=cs42764b8a75a82x4a0bx95f;AccountKey=SXmidOGCxdQC8PQnDs5YUlurZT/guHRdZkdi91N9JIqI49COjpZ2lwvHbqxigOvaNFqKG315oGASfUpljw46Fw==;EndpointSuffix=core.windows.net');// console.log('yay table created!');

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
        callback(error);
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

        InsertOrMergeEntity(task, `${teamId}Drafts`, function(error) {
            callback(error);
        });
    });
}

function DeleteDraftObj(teamId, draftId, callback) {
    GetSingleDraftObj(teamId, draftId, function(draftResults) {
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

function AddPlayer(teamId, playerId, playerName, draftId, callback) {
    var entGen = azure.TableUtilities.entityGenerator;
    var playerTask = {
        PartitionKey: entGen.String(playerId),
        RowKey: entGen.String(playerName)
    };

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

module.exports = {
    CreateTables: CreateTables,
    AddDraftObj: AddDraftObj,
    GetSingleDraftObj: GetSingleDraftObj,
    GetDefaultDraftObj: GetDefaultDraftObj,
    GetDraftList: GetDraftList,
    DeleteDraftObj: DeleteDraftObj,
    AddPlayer: AddPlayer
};