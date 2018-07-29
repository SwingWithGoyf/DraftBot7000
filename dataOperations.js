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

function InsertOrMergeEntity(task, tableName) {
    tableSvc.insertOrMergeEntity(tableName, task, function (error, result, response) {
        if (!error && result) {
            console.log('row inserted');
            
            if (response && response.statusCode) {
                console.log(`Response code: ${response.statusCode}`);
            }
        }
    });
}

function RetrieveEntity(tableName, partitionKey, rowKey) {
    tableSvc.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
        if (!error && result) {
            console.log('row retrieved');
            
            if (response && response.statusCode) {
                console.log(`Response code: ${response.statusCode}`);
            }

            return result;
        }
    });
}

function QueryEntities(tableName, query, callback) {
    tableSvc.queryEntities(tableName, query, null, function (error, result, response) {
        if (!error && result && result.entries) {
            console.log('query successful');
            
            if (response && response.statusCode) {
                console.log(`Response code: ${response.statusCode}`);
            }

            callback(result.entries);
        }
    });
}

function CreateTables(teamId) {
    CreateTableIfNotExists(`${teamId}Drafts`);
    CreateTableIfNotExists(`${teamId}Users`);
}

function AddDraftObj(teamId, draftName) {
    GetMaxDraftId(teamId, function(maxDraftId) {
        var task = {
            PartitionKey: {'_':String(Number(maxDraftId) + 1)},
            RowKey: {'_':draftName},
            draftData: {'_':''}
        };

        InsertOrMergeEntity(task, `${teamId}Drafts`);
    });
}

function GetSingleDraftObj(draftId, teamId) {
    return RetrieveEntity(`${teamId}Drafts`, draftId, 1);
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

    return QueryEntities(`${teamId}Drafts`, query, callback);
}

module.exports = {
    CreateTables: CreateTables,
    AddDraftObj: AddDraftObj,
    GetSingleDraftObj: GetSingleDraftObj,
    GetDraftList: GetDraftList
};