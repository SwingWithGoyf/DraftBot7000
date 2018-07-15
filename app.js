/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var helper = require('./helpers.js');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8000, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);
//var tableSvc = azure.createTableService("DefaultEndpointsProtocol=https;AccountName=cs42764b8a75a82x4a0bx95f;AccountKey=SXmidOGCxdQC8PQnDs5YUlurZT/guHRdZkdi91N9JIqI49COjpZ2lwvHbqxigOvaNFqKG315oGASfUpljw46Fw==;EndpointSuffix=core.windows.net");
// tableSvc.createTableIfNotExists('mytable',function(error, result, response) {
//     if(!error) {
//         console.log("yay table created!");
//         var task = {
//             PartitionKey: {'_':'hometasks'},
//             RowKey: {'_': '2'},
//             description: {'_':'take out the trash'},
//             dueDate: {'_':new Date(2015, 6, 20), '$':'Edm.DateTime'}
//         };
//         tableSvc.insertOrMergeEntity('mytable',task, function (error, result, response) {
//             if(!error){
//               console.log("yay row inserted!");
//             }
//         });
//     }
// });

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector).set('storage', tableStorage);

// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('help', function (session, args, next) {
    session.endDialog("This is a bot that can help you be a better herf derf. <br/>Currently supported commands are 'hello' and 'order dinner'");
})
.triggerAction({
    matches: /^help$/i
    // ,
    // onSelectAction: (session, args, next) => {
    //     // Add the help dialog to the dialog stack 
    //     // (override the default behavior of replacing the stack)
    //     session.beginDialog(args.action, args);
    // }
});

// order dinner command
require('./orderDinner.js')(bot, builder);

// hello commands
require('./hello.js')(bot, builder);

// fallback handler
bot.dialog('/', [
    function(session) {
        helper.CheckMessage(session);
        builder.Prompts.choice(session, "Welcome to draft bot 7000!  Here's the commands I support:", ["Add draft", "List draft", "List rares", "Add result"]);
    },
    function (session, results) {
        var command = results.response.entity;
        switch(command)
        {
            case "Add draft":
                break;
            case "List draft":
                break;
            case "List rares":
                break;
            case "Add result":
                break;
        }
        var msg = `You picked ${command}`;
        session.endDialog(msg);
    }
]);