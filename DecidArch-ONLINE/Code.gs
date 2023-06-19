function resetGame() {
  
  var ui = SpreadsheetApp.getUi(); 

  var result = ui.alert(
     'Please confirm',
     'This will clear the game table and reshuffle the cards!',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  if (result == ui.Button.OK) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();  
  var cardsdrawn = ss.getSheetByName('Draw');
  var table = ss.getSheetByName('Game table');
  
  // clear the drawn cards from the table
  cardsdrawn.getRange("C2:C13").clear();
  table.getRange("B4:Z8").clear();  
  
  // shuffle the concern cards deck
  var concerndeck = ss.getSheetByName('Concern cards');  
  var concernrandcol = 2; // B
  var numconcerncards = 10;
  concerndeck.getRange("A2:A11").copyValuesToRange(concerndeck, concernrandcol, concernrandcol, 2, numconcerncards + 1);
  
  // shuffle the event cards deck
  var eventdeck = ss.getSheetByName('Event cards');  
  var eventrandcol = 2; // B
  var numeventcards = 4;
  eventdeck.getRange("A2:A11").copyValuesToRange(eventdeck, eventrandcol, eventrandcol, 2, numeventcards + 1);
    
  } else {
    // User clicked "No" or X in the title bar.
    // do nothing
  } 
  
}

function drawCard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var draw = ss.getSheetByName('Draw');
  
  var col = 1; // col C
  var numcards = 12;
  
  // draw a new card
  range = draw.getRange("C1:C13");
  var gameFinished = true;
  for (var row = 2; row <= numcards + 1; row++) {
    var theCell = range.getCell(row, col);
    if (theCell.getValue() == "") {
      theCell.setValue("x");
      gameFinished = false;
      
      // what kind of card have we drawn?
      var cardType = draw.getRange(row, 1).getValue(); // look at the value in column A
      
      // now pick up the card contents from the deck, and put it on the table     
      var deck = ss.getSheetByName(cardType);
      var table = ss.getSheetByName('Game table')
      var tableTarget = draw.getRange(row, 5).getValue();      
      var cardId = draw.getRange(row, 4).getValue();
      //var cardRange = deck.getRange(row, column)
      for (var cardRow = 2; cardRow <= numcards + 1; cardRow++) {
        theCardIdCell = ("D2:D13");
        foundCardId = deck.getRange(cardRow, 4).getValue(); // column D
        if(foundCardId == cardId) {
          // put the card on the table
          
          var tableposition = tableTarget + ":" + tableTarget;
          
          deck.getRange(cardRow, 5).copyTo(table.getRange(tableposition),SpreadsheetApp.CopyPasteType.PASTE_FORMAT)
          
          break;
        }
      }
      break;      
    }    
  }
  if(gameFinished == true) {
     Browser.msgBox("Game finished")
  }  
}
