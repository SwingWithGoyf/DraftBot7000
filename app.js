/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require('botbuilder-azure');
//var azure = require('azure-storage');
var helper = require('./helpers.js');
var config = require('./config.js');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8000, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var id = (process.env.MicrosoftAppId) || config.appid;
var password = (process.env.MicrosoftAppPassword) || config.secret;

var connector = new builder.ChatConnector({
    appId: id,
    appPassword: password,
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
bot.dialog('quit', function (session) {
    session.endConversation('Ok, nevermind!');
})
    .triggerAction({
        matches: [/^q$/i, /^quit$/i],
        confirmPrompt: 'This will cancel the current operation. Are you sure?'
    });

// ,
// onSelectAction: (session, args, next) => {
//     // Add the help dialog to the dialog stack 
//     // (override the default behavior of replacing the stack)
//     session.beginDialog(args.action, args);
// }

// order dinner command
require('./orderDinner.js')(bot, builder);

// hello commands
require('./hello.js')(bot, builder);

// draft commands
require('./draftManagement.js')(bot, builder);

// draft commands
require('./playerManagement.js')(bot, builder);

// draft commands
require('./rareManagement.js')(bot, builder);

// draft commands
require('./resultManagement.js')(bot, builder);

// fallback handler
bot.dialog('/', [
    function(session) {
        if (!helper.CheckMessage(session)) {
            builder.Prompts.choice(session, 'Welcome to draft bot 7000!  Here\'s the categories of commands I support (type \'q\' to quit):', [
                'Drafts',
                'Players',
                'Rares',
                'Match results'
            ]);
        } else {
            session.endConversation('DEBUG: squelching conversation - only respond to DMs or mentions in channels');
        }
    },
    function (session, results) {
        var command = results.response.entity;
        
        switch(command)
        {
        case 'Drafts':
            session.beginDialog('draftManagement');
            break;
        case 'Players':
            session.beginDialog('playerManagement');
            break;
        case 'Rares':
            session.beginDialog('rareManagement');
            break;
        case 'Match results':
            session.beginDialog('resultManagement');
            break;
        }
    },
    function (session) {
        session.send('Done!');
    }
]);