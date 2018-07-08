/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

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
bot.dialog('/', function(session) {
    if (session.message && session.message.address && session.message.address.conversation && session.message.address.channelId && session.message.address.from) {
        var address = session.message.address;
        session.send(`DEBUG: Hello!  Your user ID is ${address.from.id}`);

        if (address.channelId.toLowerCase() === "slack") {
            session.send("DEBUG: I see that you're on a slack endpoint!");
            var messageInfo = address.conversation.id.split(':');
            if (messageInfo.length <= 2) {
                session.send("DEBUG: Error, conversation ID was in an unexpected format");
            } else {
                var channelId = messageInfo[2];
                var teamId = messageInfo[1];
                var text = address.text;
                session.send(`DEBUG: You typed ${text}, your user ID is ${address.from.id}, your channel is ${channelId}, and your team is ${teamId}`);
                if (channelId.charAt(0) === 'D') {
                    session.send(`DEBUG: This message was sent as a DM`);
                } else if (channelId.char(0) === 'C') {
                    session.send(`DEBUG: This message was sent in a channel`);
                } else {
                    session.send(`DEBUG: This message was sent in neither a channel nor a DM`);
                }
            } 
        } else if (address.channelId.toLowerCase() === "emulator") {
            session.send("DEBUG: I see that you're on an emulator endpoint!");
        }
        session.send(`Debug info: your channel ID is ${address.conversation.id} and your messaging type is ${address.channelId}`);
    }
    if (session.message.text.toLowerCase().indexOf("draftbot") > -1) {
        session.send("Welcome to draft bot 7000!  Here's some useful info: lorem ipsum etc");
    }
    session.endDialog();
});