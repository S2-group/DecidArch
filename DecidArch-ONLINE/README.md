# Introduction
The online version of DecidArch has been prompted by the pandemic, and has been succesfully used in several online courses. The online version has been built with Google Sheets, and is available (as a read only version) at https://docs.google.com/spreadsheets/d/12an87TuO02kPAUPjzua9m9YYaH3dSgR3xtAJ0isX6jc/edit?usp=sharing. If you want to run the game yourself, use the above link and make a copy of the spreadsheet; this will give you editing rights on your personal copy.

The game mechanics are similar to the table top game that uses physical cards. To learn how to play the game, please refer to the game manual for the table top version.

# Contents of the spreadsheet

The spreadsheet contains several tabs:
- **Game table** - this is the virtual table on which the game is played. At the start of the game, the Project and Stakeholder cards are placed face up on the table.
- **Decision taking (Group)** - this is the group decision taking template in which the group collaboratively registers their design decisions.
- **Decision preparation (4x: Player 1, 2, 3, 4)** - these are the individual decision preparation templates, one for each player. Every player uses one of the preparation templates to prepare their suggestion for a design issue
- **Scoring sheet** - contains the scoring sheet to be filled out at the end of the game to calculate the group's final score.
- **Draw, Concern cards, Event cards** - these are technical sheets used for the game engine (see below) that should not be directly consulted or changed during the game. These tabs are left visible in the read only version but can be hidden (right click > hide tab) before playing the game.

Additionally, the spreadsheet contains code (available via Extensions > Apps Script) that provides the game engine.

# How to run the game
- On the Game table, press the red 'Start new game' button (located in cell B2) to clear the table and shuffle the deck. You will see a popup message that asks whether you want to proceed stating __This will clear the game table and reshuffle the cards!__. 
  - When you run the game for the first time, you may be prompted to allow the script to run from your account. After you have confirmed, press the 'Start new game' button once again to start the game with the proper permissions. This confirmation is required once, subsequent runs of the game from your account will start without interruption.
- After using the 'Start new game' button to (virtually) shuffle the card decks, you can draw a card by pressing the green 'Draw card' button. This will put a Concern card face up on the table. The game then proceeds as explained in the game manual (individual decision preparation, group decision making, next card is drawn). 
- After four concern cards, the next card that is drawn will be an event card that is placed at the end of the row (note that on smaller screens, the row may extend beyond the screen width so players may need to scroll or zoom out to see the whole game table). 
- After the event card is played, the next concern card will be placed in a row above the previous row.
- This continues until all concern cards have been played and the game displays a message that the game has finished.

# Game engine
The game engine uses three tabs for bookkeeping:
- **Draw** - keeps track of the cards that have been drawn and their position on the table.
- **Concern cards** - contains the virtual deck of concern cards (the card contents are available in the hidden column E)
- **Event cards** - contains the virtual deck of event cards (the card contents are available in the hidden column E)

The game engine code (available via Extensions > Apps Script) consists of two functions:

## `resetGame()`
This function is called from the 'Start new game' button. It first asks the user whether they want to proceed
```javascript
var ui = SpreadsheetApp.getUi(); 

  var result = ui.alert(
     'Please confirm',
     'This will clear the game table and reshuffle the cards!',
      ui.ButtonSet.OK_CANCEL);
```  

if the user confirms, first the table is cleared by clearing the bookkeeping in the 'Draw' tab and removing the card contents from the 'Game table' tab
```javascript
 if (result == ui.Button.OK) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();  
  var cardsdrawn = ss.getSheetByName('Draw');
  var table = ss.getSheetByName('Game table');
  
  // clear the drawn cards from the table
  cardsdrawn.getRange("C2:C13").clear();
  table.getRange("B4:Z8").clear();  
```  

Then, the concern card and events card decks are 'shuffled' by copying the contents of the 'Randomization' column (column A) to the 'Current game values' (column B) on the Concern cards and Event cards tabs respectively
```javascript
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
```

The 'Randomization' columns are filled with randomized numbers between 0 and 1 that change everytime an action is performed on the spreadsheet (https://support.google.com/docs/answer/3093438?sjid=8475475487473897318-EU). By copying the current values to another column and using the copy during the game, these values become fixed for the current game.
        
## `drawCard()`
This function is called from the 'Draw card' button. This function uses the 'Draw' tab for bookkeeping.
```javascript
var ss = SpreadsheetApp.getActiveSpreadsheet();
var draw = ss.getSheetByName('Draw');
```

It draws a concern card 4 times, and then an event card as fifth card for a total of 12 cards (10 concern cards + 2 event cards after the 4th and 8th concern card.)
- `var numcards = 12;`

On every click, it searches for the first empty cell in the 'Draw' column (column C)
```javascript
 range = draw.getRange("C1:C13");
  var gameFinished = true;
  for (var row = 2; row <= numcards + 1; row++) {
    var theCell = range.getCell(row, col);
    if (theCell.getValue() == "") {
```
It then marks that cell with an 'x' and, since an empty cell was found, concludes that the game is not yet finished
```javascript
      theCell.setValue("x");
      gameFinished = false;
```
In order to determine what type of card was drawn, we look at the value in column A of the Draw tab. This row contains the values 'Concern cards' 
 (4 consecutive rows) and 'Event cards' (every fifth row). 
```javascript
      // what kind of card have we drawn?
      var cardType = draw.getRange(row, 1).getValue(); // look at the value in column A
```
The values in Row A correspond to the names of the tabs that contain the shuffled card decks (see the explanation for the `resetGame()` function), so we can use the value found to copy the right card contents to the 'Game table' tab.  
```javascript
      // now pick up the card contents from the deck, and put it on the table     
      var deck = ss.getSheetByName(cardType);
      var table = ss.getSheetByName('Game table')
      var tableTarget = draw.getRange(row, 5).getValue();      
      var cardId = draw.getRange(row, 4).getValue();
```
The `tableTarget` is hard coded in the Draw tab, in column E (the first card goes to B8, the second to D8, et cetera). The `cardId` is calculated in the Card ID column via a lookup using the (copy of the) randomized numbers in the Concern cards resp. Event cards tabs.

Finally, the card contents for the `cardId` are copied to the `tableTarget` cell on the Game table tab.
```javascript
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
```

The complete code for the game engine can be found in the Code.gs file in this Github repository. 
