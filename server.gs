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



// Gets components for selected project.
// @param: currentUser - object with details about the current user
// @param: projectId - int id for current project
function getComponents(user, projectId) {
    var fetcherURL = API_BASE + projectId + '/components?active_only=true&include_deleted=false&';
    return fetcher(currentUser, fetcherURL);
}



// Gets custom fields for selected project and artifact
// @param: currentUser - object with details about the current user
// @param: projectId - int id for current project
// @param: artifactName - string name of the current artifact
function getCustoms(user, projectId, artifactName) {
    var fetcherURL = API_BASE + projectId + '/custom-properties/' + artifactName + '?';
    return fetcher(currentUser, fetcherURL);
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




//highlight all text 
//save as an array
//split into different objects 
//split depending on paragraph heading
//for loop with if statement-if a specific style, send to spirateam








////original selection function
//function getSelectedText(info) {
//  var selection = DocumentApp.getActiveDocument().getSelection();
//         Logger.log(selection);
//  var selected =selection.getRangeElements()[0].getElement().editAsText().getText();
//       //for loop to go through all the elements 
//       Logger.log(selected);
//  var requirementName= new Object();
////   DocumentApp.getUi().alert(selection.getRangeElements()[0].getElement().editAsText().getText()); 
//  var selectedInformation={
//    'name':selected,
//    'type': "default"
//  };
//  return selectedInformation;
//}


//creates an array of the different sentences but always only returns the last sentences
//need to narrow down paragraph headings
function getSelectedText(info) {
  var selection = DocumentApp.getActiveDocument().getBody();
         Logger.log(selection);
  //saves document content as text
  var selected =selection.editAsText().getText();
//creates an array of sentences
  var splitSelected= selected.split('\n');
  
  var requirementName= new Object();
  var requirementArray=[];
//for loop goes through splitSelected array and saves each separately as an object   
  for (var i = 0; i < splitSelected.length; i++) {
            requirementName.name= splitSelected[i];
            requirementName.type="default";
    }
//they are separate objects but how do i save them to an array
  return splitSelected;
}














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
