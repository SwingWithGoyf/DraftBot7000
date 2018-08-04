var request = require('request');
var cheerio = require('cheerio');

var exports = module.exports = {};

// Gets all prices and all editions, buy and sell, for a given card name
exports.getSingleCardPrices = function (cardName, callback) {
    var options = {
        url: 'http://cardkingdomcache.azurewebsites.net/both',
        method: 'POST',
        json: true,
        body: [{name: cardName}]
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            callback('Failed.\nstatuscode: ' + response.statusCode + ', error: ' + error);
        }
    });
};

// cards: json array = [{"name":"Oketra's Monument"},{"name":"Legion's Landing", "set": "Ixalan", "foil": false}]
// buyorsell: "buy", "sell" or "both"
// callback: function that takes two arguments
//   1. error string
//   2. json array of cards decorated with prices
exports.getPrices = function(cards, buyorsell, callback) {
    var options = {
        url: 'http://cardkingdomcache.azurewebsites.net/' + buyorsell,
        method: 'POST',
        json: true,
        body: cards
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null, body);
        } else {
            callback('Failed.\nstatuscode: ' + response.statusCode + ', error: ' + error);
        }
    });
};

exports.getCardSellPriceWeb = function(cardName, isFoil, callback) 
{    
    var CARDKINGDOM_SINGLE_SELL = 'https://www.cardkingdom.com/purchasing/mtg_singles/?filter%5Bsort%5D=price_desc&filter%5Bsearch%5D=mtg_advanced&filter%5Bname%5D=';

    var options = {
        url: CARDKINGDOM_SINGLE_SELL + cardName,
        headers: {
            'User-Agent': 'Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 52.0.2743.116 Safari / 537.36 Edge / 15.15063'
        }
    };

    request(options, function (error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            
            var cards = [];
            $('.itemContentWrapper').each(function(i) {
                cards[i] = {};
                cards[i].name = $(this).find('.productDetailTitle').text().replace(/\n/g,'');
                cards[i].set = $(this).find('.productDetailSet').text().replace(/\n/g,'');
                cards[i].price = $(this).find('.usdSellPrice > .sellDollarAmount').text() + '.' + $(this).find('.usdSellPrice > .sellCentsAmount').text();
                cards[i].isFoil = $(this).find('.foil').length !== 0;
            });   
            
            callback(cards, isFoil);
        } else {
            console.log('We’ve encountered an error: ' + error);
            callback({'Error': error});
        }
    });
};


exports.getCardBuyPriceWeb = function(cardName, isFoil, callback) 
{
    var CARDKINGDOM_SINGLE = 'https://www.cardkingdom.com/catalog/view/?filter%5Bsort%5D=most_popular&filter%5Bsearch%5D=mtg_advanced&filter%5Bname%5D=';

    var options = {
        url: CARDKINGDOM_SINGLE + cardName + (isFoil ? '&filter%5Btab%5D=mtg_foil' : ''),
        headers: {
            'User-Agent': 'Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 52.0.2743.116 Safari / 537.36 Edge / 15.15063'
        }
    };

    request(options, function (error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            
            var cards = [];
            $('.itemContentWrapper').each(function(i) {
                cards[i] = {};
                cards[i].name = $(this).find('.productDetailTitle').text().replace(/\n/g,'');
                cards[i].set = $(this).find('.productDetailSet').text().replace(/\n/g,'');
                cards[i].price = $(this).find('.stylePrice').text();
                cards[i].isFoil = $(this).find('.foil').length !== 0;
            });   
            
            callback(cards, isFoil);
        } else {
            console.log('We’ve encountered an error: ' + error);
            callback({'Error': error});
        }
    });
};
