module.exports = function(bot, builder) {
  // This dialog help the user order dinner to be delivered to their hotel room.
  var dinnerMenu = {
    'Potato Salad - $5.99': {
      Description: 'Potato Salad',
      Price: 5.99
    },
    'Tuna Sandwich - $6.89': {
      Description: 'Tuna Sandwich',
      Price: 6.89
    },
    'Clam Chowder - $4.50':{
      Description: 'Clam Chowder',
      Price: 4.50
    }
  };

  bot.dialog('orderDinner', [
    function(session){
      session.send('Lets order some dinner!');
      builder.Prompts.choice(session, 'Dinner menu:', dinnerMenu);
    },
    function (session, results) {
      if (results.response) {
        var order = dinnerMenu[results.response.entity];
        var msg = 'You ordered: ' + order.Description + ' for a total of $' + order.Price + '.';
        session.userData.order = order;
        session.send(msg);
        builder.Prompts.text(session, 'What is your room number?');
      } 
    },
    function(session, results){
      if(results.response){
        session.userData.room = results.response;
        var msg = 'Thank you. Your order will be delivered to room #' + session.userData.room;
        session.endDialog(msg);
      }
    }
  ])
    .triggerAction({
      matches: /^order dinner$/i,
      confirmPrompt: 'This will cancel your order. Are you sure?'
    });
};