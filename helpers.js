var theTeamId = '';

function CheckMessage(session) {
    var shouldSquelch = true;
    var dataOps = require('./dataOperations.js');

    if (session.message && session.message.address && session.message.address.conversation && session.message.address.channelId) {
        var address = session.message.address;
        //session.send('DEBUG: Hello!  Your user ID is ' + session.message.user.id);

        if (address.channelId.toLowerCase() === 'slack') {
            //session.send('DEBUG: I see that you\'re on a slack endpoint!');
            var messageInfo = address.conversation.id.split(':');
            if (messageInfo.length <= 2) {
                session.send('DEBUG: Error, conversation ID was in an unexpected format');
            } else {
                var channelId = messageInfo[2];
                var teamId = messageInfo[1];
                var text = session.message.text;

                if (session.message.user && session.message.user.id && session.message.user.id.split(':').length >= 2) {
                    session.userData.userId = session.message.user.id.split(':')[0];
                    console.log('DEBUG: You\'re on a slack endpoint, you typed ' + text + ', your user ID is ' + session.userData.userId + ', your channel is ' + 
                        channelId + ', and your team is ' + teamId);
                }
                session.userData.teamId = teamId;
                theTeamId = teamId;
                session.userData.userId = session.message.user.id.replace(`:${teamId}`, '');
                dataOps.CreateTables(teamId);
                if (channelId.charAt(0) === 'D') {
                    //session.send('DEBUG: This message was sent as a DM');
                    console.log('DEBUG: This message was sent as a DM');
                    shouldSquelch = false;
                } else if (channelId.charAt(0) === 'C') {
                    console.log('DEBUG: This message was sent in a channel');
                    //session.send('DEBUG: This message was sent in a channel');
                } else {
                    console.log('DEBUG: This message was sent in neither a channel nor a DM');
                    //session.send('DEBUG: This message was sent in neither a channel nor a DM');
                }
                if (session.message.entities && session.message.entities.length > 0 && session.message.entities[0].mentioned && session.message.entities[0].mentioned.name === 'azurebot') {
                    //session.send('DEBUG: you mentioned me');
                    console.log('DEBUG: you mentioned me');
                    shouldSquelch = false;
                } else {
                    console.log('DEBUG: you did not mention me');
                    //session.send('DEBUG: you did not mention me');
                }
            } 
        } else if (address.channelId.toLowerCase() === 'emulator') {
            shouldSquelch = false;
            dataOps.CreateTables('emulator');
            session.userData.teamId = 'emulator';
            theTeamId = 'emulator';
            session.send('DEBUG: I see that you\'re on an emulator endpoint!');
            if (session.message.text.indexOf('azurebot') >= 0) {
                session.send('DEBUG: You mentioned me');
            } else {
                session.send('DEBUG: You did not mention me');
            }
        }
        
        return shouldSquelch;
    }
}

function GetTeamId(session) {
    if (theTeamId === '') {
        theTeamId = session.userData.teamId;
    }
    return theTeamId;
}

function GetUserId(session) {
    return session.userData.userId;
}

function ToTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        if (txt.toLowerCase() === 'the' || txt.toLowerCase() === 'of') {
            return txt.toLowerCase();
        } else {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    });
}

function IsRareFoil(cardName) {
    var isFoil = false;
    if (cardName.indexOf('*') !== -1 || cardName.indexOf('(foil)') !== -1)
    {
        isFoil = true;
    }

    return isFoil;
}

function DecorateBuyPrice(price, cardName, isFoil) {
    //<www.google.com|foo>
    var decoratedPrice = '<';
    decoratedPrice += 'https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=';
    decoratedPrice += unDecorateCardName(cardName);
    if (isFoil) {
        decoratedPrice += '&filter%5Btab%5D=mtg_foil';
    }
    decoratedPrice += '|';
    decoratedPrice += price;
    decoratedPrice += '>';
    return decoratedPrice;
}

function DecorateSellPrice(price, cardName) {
    //<www.google.com|foo>
    var decoratedPrice = '<';
    decoratedPrice += 'https://www.cardkingdom.com/purchasing/mtg_singles/?filter%5Bsort%5D=price_desc&filter%5Bsearch%5D=mtg_advanced&filter%5Bname%5D=';
    decoratedPrice += unDecorateCardName(cardName);
    decoratedPrice += '|';
    decoratedPrice += price;
    decoratedPrice += '>';
    return decoratedPrice;
}

function unDecorateCardName(cardName) {
    var unDecoratedCardName = '';
    unDecoratedCardName = cardName.replace('[[', '');
    unDecoratedCardName = unDecoratedCardName.replace(']]', '');
    unDecoratedCardName = unDecoratedCardName.replace('$', '');
    unDecoratedCardName = unDecoratedCardName.replace('*', '');
    unDecoratedCardName = unDecoratedCardName.replace('`', '');
    unDecoratedCardName = unDecoratedCardName.replace('(foil)', '');
    unDecoratedCardName = unDecoratedCardName.trim();

    return unDecoratedCardName;
}

function GetColorFromIndex(index) {
    var colorText = '';
    switch (index % 6)
    {
    case 0:
        colorText = '#ff8000';
        break;
    case 1:
        colorText = '#dddd00';
        break;
    case 2:
        colorText = '#0080ff';
        break;
    case 3:
        colorText = '#ff0000';
        break;
    case 4:
        colorText = '#ff00ff';
        break;
    case 5:
        colorText = '#11aaff';
        break;
    }

    return colorText;
}


module.exports = {
    CheckMessage: CheckMessage,
    GetTeamId: GetTeamId,
    GetUserId: GetUserId,
    ToTitleCase: ToTitleCase,
    IsRareFoil: IsRareFoil,
    DecorateBuyPrice: DecorateBuyPrice,
    DecorateSellPrice: DecorateSellPrice,
    GetColorFromIndex: GetColorFromIndex
};