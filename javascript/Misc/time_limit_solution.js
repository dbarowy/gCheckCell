//First version of the solution to the time limit imposed by the Google Apps environment 

/**
Given a javascript object, the function will serialize it and save it in a hidden spreadsheet
The spreadsheet is created so that there isn't any other spreadsheet with the same name in the document.
We use ScriptDb to save the name of the sheet where we saved the data and the id of the Spreadsheet document.
*/
function saveState(obj){
  var name="state_saving";
  var sheet;
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var db = ScriptDb.getMyDb();
  var res = db.query({spreadsheet_id:spreadsheet.getId()}); 
  if(res.hasNext()){
    name = res.next().sheet_name;
  }
  else{
     while(spreadsheet.getSheetByName(name)!==null){
    name+="_";
    }
    spreadsheet.insertSheet(name);
    db.save({spreadsheet_id:spreadsheet.getId() ,sheet_name:name});
  }
  sheet = spreadsheet.getSheetByName(name);
  sheet.getRange(1, 1).setValue(Utilities.jsonStringify(obj));
  sheet.hideSheet();
}

/*
Query ScriptDb for data associated with this document. 
Use the name of the sheet saved in ScriptDb to load the json from the hidden sheet and restart the function.
*/

function reload(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var db = ScriptDb.getMyDb();
  var res = db.query({spreadsheet_id:spreadsheet.getId()}); 
  var sheet;
  if(res.hasNext()){
    name = res.next().sheet_name;
  }
  else
    throw new Error("The data you are looking for has not been saved.");
  sheet = spreadsheet.getSheetByName(name);
  time_overrun((Utilities.jsonParse(sheet.getRange(1, 1).getValue())).counter);
}

/*
Call this at the end of the execution to clean up used resources and delete the object from ScriptDb.
*/
function clean_up(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var db = ScriptDb.getMyDb();
  var res = db.query({spreadsheet_id:spreadsheet.getId()});
  var sheet, item;
  if(res.hasNext()){
    item = res.next();
    sheet = spreadsheet.getSheetByName(item.sheet_name);
    SpreadsheetApp.setActiveSheet(sheet);
    spreadsheet.deleteActiveSheet();
    Logger.log(item.toJson());
    db.removeById(item.getId());
  }
}
//Dummy function that runs for about 45 seconds
function do_work(){
  var start = new Date();
  for(var i=0; i<50000; i++)
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, "test data to hash");
  Logger.log((new Date() - start)/1000);
}

function deleteAll() {
  var db = ScriptDb.getMyDb();
  while (true) {
    var result = db.query({}); // get everything, up to limit
    if (result.getSize() == 0) {
      break;
    }
    while (result.hasNext()) {
      db.remove(result.next());
    }
  }
}
/**
If the function has ran for more than a certain amout of time, 
 we save the state and set a trigger to restart the application.
*/
function time_overrun(i){
  var start = (new Date()).getTime();
  if( (typeof i) === 'undefined')
    i=0;
  
  for(; i <= 7; i++) {
    var currTime = (new Date()).getTime();
    if(currTime - start >= 150000) {
      saveState({"counter":i});
      ScriptApp.newTrigger("reload")
   .timeBased()
   .after(60000)
   .create();
      break;
    } else {
      do_work();
    }
  }
  //Termination condition and cleanup
  if(i==8){
    clean_up();
  }
  
}