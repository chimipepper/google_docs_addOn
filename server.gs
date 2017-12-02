// globals
var API_BASE = '/services/v5_0/RestService.svc/projects/',
    API_BASE_NO_SLASH = '/services/v5_0/RestService.svc/projects',
    ART_ENUMS = {
        requirements: 1,
        testCases: 2,
        testSteps: 7
    },
    //enums are specified on inflectra's server to recognize which number belongs to which artifact
    INITIAL_HIERARCHY_OUTDENT = -20,
    STATUS_ENUM = {
        allSuccess: 1,
        allError: 2,
        someError: 3
    },
    INLINE_STYLING = "style='font-family: sans-serif'";


/*
 * ======================
 * INITIAL LOAD FUNCTIONS
 * ======================
 *
 * These functions are needed for initialization
 * All Google App Script (GAS) files are bundled by the engine
 * at start up so any non-scoped variables declared will be available globally.
 *
 */

// App script boilerplate install function
// opens app on install
function onInstall(e) {
  onOpen(e);
}



// App script boilerplate open function
// opens sidebar
// Method `addItem`  is related to the 'Add-on' menu items. Currently just one is listed 'Start' in the dropdown menu
function onOpen(e) {
  DocumentApp.getUi().createAddonMenu().addItem('Start', 'showSidebar').addToUi();
}



// side bar function gets index.html and opens in side window
function showSidebar() {
  var ui = HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Inflectra Add On');

  DocumentApp.getUi().showSidebar(ui);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}







/*
 *
 * ====================
 * DATA "GET" FUNCTIONS
 * ====================
 *
 * functions used to retrieve data from Spira - things like projects and users, not specific records
 *
 */

// General fetch function, using Google's built in fetch api
// @param: currentUser - user object storing login data from client
// @param: fetcherUrl - url string passed in to connect with Spira
function fetcher(user, fetcherURL) {
    //google base 64 encoded string utils
    var decoded = Utilities.base64Decode(user.api_key);
    var APIKEY = Utilities.newBlob(decoded).getDataAsString();

    //build URL from args
    var fullUrl = user.url + fetcherURL + "username=" + user.userName + APIKEY;
    //set MIME type
    var params = { 'content-type': 'application/json' };

    //call Google fetch function
    var response = UrlFetchApp.fetch(fullUrl, params);
    //returns parsed JSON
    //unparsed response contains error codes if needed
    return JSON.parse(response);
}



// Gets projects accessible by current logged in user
// This function is called on initial log in and therefore also acts as user validation
// @param: currentUser - object with details about the current user
function getProjects(user) {
    var fetcherURL = API_BASE_NO_SLASH + '?';
    return fetcher(user, fetcherURL);
}







/*
 *
 * ====================
 * SELECTION FUNCTIONS
 * ====================
 *
 * functions used to retrieve highlighted text from document and store each paragraph heading as an object
 *
 */

//save all document 
//loop through document to search for heading styles
//if statement to filter through the different styles and log Heading 1 and normal 
//if statement to filter through enter key first --> turns into an array of objects


function getArray() {
  //returns documentselected
  var docBody = DocumentApp.getActiveDocument().getBody();
     Logger.log(docBody);
  var bodyNum=docBody.getNumChildren();
      Logger.log(bodyNum);
//returns the logs of all the elements individually
  for (var i = 0; i < bodyNum; i++) {
      var numChild= docBody.getChild(i).editAsText().getText();
      Logger.log(numChild);
  }
  
 
  
var idName = DocumentApp.getActiveDocument().getId();
  Logger.log(idName);
var urlName = "https://docs.google.com/feeds/download/documents/export/Export?id=" + idName + "&exportFormat=html";
  Logger.log(urlName);
var htmlName = UrlFetchApp.fetch(urlName).getContentText();
  Logger.log(htmlName);

  
  
  
  
  
//for (var i = 0; i < bodyNum; i++) {
//  //add all these separate objects into an array
//  var requirementArray=[];
//  var paragraphStyle= docBody.getChild(i).getHeading();
//  if (paragraphStyle=="Heading 1") {
//    //create a new object with the element as the name (in plain text)
//  }
//  else {
//    //it's normal text and needs to be added to the parent object with .getParentElement() (in the html form)
//  }
//  
//  if (paragraphStyle=="Heading 2") {
//      //this is a sub requirement- look at inflectra api about these and see how to format it
//  }
//   
//  }
  
////sending to client side to create objects  
////object is being created, just not the semicolon?  
//  var requirementName= new Object();
//  var requirementArray= new Array();
//  for (var i = 0; i < bodyNum; i++) {
//         var paragraphStyle= docBody.getChild(i).getHeading();
// //https://www.codecademy.com/en/forum_questions/50c207bd55df51ff27004775      
////append to array
//    if(paragraphStyle=="Heading 1"|| paragraphStyle=="Heading 2") {
//      requirementName.name= docBody.getChild(i).editAsText().getText();
//    } else {
//      requirementName.description= docBody.getChild(i).editAsText().getText();
//    }
//    Logger.log(requirementName);
//  } 
//can see object through console.log  
  
 
//returns info to client side
  return htmlName;
}




/*
 *
 * ==============
 * POST REQUIREMENTS
 * ==============
 *
 */







/*
 *
 * ==============
 * ERROR MESSAGES
 * ==============
 *
 */

// Error notification function
// Assigns string value and routes error call from client.js.html
// @param: type - string identifying the message to be displayed
function error(type) {
    if (type == 'impExp') {
        okWarn('There was an input error. Please check that your entries are correct.');
    } else if (type == 'unknown') {
        okWarn('Unkown error. Please try again later or contact your system administrator');
    } else {
        okWarn('Network error. Please check your username, url, and password. If correct make sure you have the correct permissions.');
    }
}


// Google alert popup with OK button
// @param: dialog - message to show
function okWarn(dialog) {
    var ui = DocumentApp.getUi();
    var response = ui.alert(dialog, ui.ButtonSet.OK);
}
