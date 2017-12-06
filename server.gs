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
  
 
//id of google doc page   
var idName = DocumentApp.getActiveDocument().getId();
  Logger.log(idName);
   var forDriveScope = DriveApp.getStorageUsed();
  Logger.log(forDriveScope)
//google export url to get google doc text (in html format) of the specific google doc id 
var urlName = "https://docs.google.com/feeds/download/documents/export/Export?id=" + idName + "&exportFormat=html&format=html";
  Logger.log(urlName);
 var param = {
    method: "get",
   headers: {
        "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
    },
    muteHttpExceptions:true,
  };
  
//api request- returns html in a string 
var html = UrlFetchApp.fetch(urlName, param).getContentText();
  Logger.log(html);
  
  // removes the whole head section, including the stylesheet and meta tag
    html = html.replace(/<head>.*<\/head>/, '');
    // remove almost all html attributes
    html = html.replace(/ (id|class|style|start|colspan|rowspan)="[^"]*"/g, '');
    // remove all of the spans, as well as the outer html and body
    html = html.replace(/<(span|\/span|body|\/body|html|\/html)>/g, '');
    // clearly the superior way of denoting line breaks
    html = html.replace(/<br>/g, '<br />');
   Logger.log(html);  
  
  
//html is one string
 var obj= html.match(/<h(.)>.*?<\/h\1>/g);
//grabs EVERYTHING in between the first and last p tag  
//  var obj2= html.match(/<p>.*<\/p>/g);
// var obj3=html.match();
  Logger.log(obj);
//   Logger.log(obj2);
//  Logger.log(obj3);
    

//creates representation of an XML document from given html var 
var xmlDoc = Xml.parse(html,true);
var bodyHtml = xmlDoc.html.body.toXmlString(); 
//get's the document's root element node
//element is representation of xml element node 
xmlDoc = XmlService.parse(bodyHtml);
var root = xmlDoc.getRootElement();  
//the root element is the parent of all other elements
//body tag is the parent of all of the other elements  
Logger.log(root);
 
  
  

  

  
  
  
  
  
  
 
//var childrenArray=[];
//    childrenArray= root.getChildren();
//Logger.log(childrenArray);
////returns array of all the tags in the doc 
//  for (var j=0; j<childrenArray.length; j++){
//      var headingArray = [];
//
//  }
//for loop through all the children to get only heading tags







  
  
  
//  var reqHeadingArray=obj.map(function(obj3) {  
//    var reqObject={};
//    reqObject["name"]= obj3;
//    Logger.log(reqObject);
//    return obj3;
//  }); 
//var reqHeadingArray=[];
//  reqHeadingArray.push(obj3);
//    Logger.log(reqHeadingArray);
  
//var reqHeadingArray=[];
//var objLength= obj.length;
//  Logger.log(objLength);
//  for (var j=0; j<objLength; j++){
//    obj[j]=new Object();
//    reqHeadingArray.push(obj[j]);       
//    Logger.log(reqHeadingArray);
//  };
//  
//  for (var k=0; k<reqHeadingArray.length;k++){
//    reqHeadingArray[k].name= obj.;
//    Logger.log(reqHeadingArray);  
//  }
  


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
  

//can see object through console.log  
  
 
//returns info to client side
  return html;
}




/*
 *
 * ==============
 * POST REQUIREMENTS
 * ==============
 *
 */
//loop through requirementArray to send to inflectra 






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
