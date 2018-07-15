function CreateTableIfNotExists(tableName) {
    var azure = require('azure-storage');
    var tableSvc = azure.createTableService('DefaultEndpointsProtocol=https;AccountName=cs42764b8a75a82x4a0bx95f;AccountKey=SXmidOGCxdQC8PQnDs5YUlurZT/guHRdZkdi91N9JIqI49COjpZ2lwvHbqxigOvaNFqKG315oGASfUpljw46Fw==;EndpointSuffix=core.windows.net');
    
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
            // console.log('yay table created!');
            // var task = {
            //     PartitionKey: {'_':'hometasks'},
            //     RowKey: {'_': '2'},
            //     description: {'_':'take out the trash'},
            //     dueDate: {'_':new Date(2015, 6, 20), '$':'Edm.DateTime'}
            // };
            // tableSvc.insertOrMergeEntity('mytable',task, function (error, result, response) {
            //     if(!error){
            //         console.log('yay row inserted!');
            //     }
            // });
        }
    });
}

module.exports = {
    CreateTableIfNotExists: CreateTableIfNotExists
};