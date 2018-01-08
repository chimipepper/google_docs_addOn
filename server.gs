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
 * 
 *
 */

//loop through document to search for heading styles
//if statement to filter through the different styles and log Heading 1 and normal 
//if statement to filter through enter key first --> turns into an array of objects

//user in parentheses
function getArray() {
  //returns documentselected
  var docBody = DocumentApp.getActiveDocument().getBody();
//     Logger.log(docBody);
  var bodyNum=docBody.getNumChildren();
//      Logger.log(bodyNum);
//returns the logs of all the elements individually
  for (var i = 0; i < bodyNum; i++) {
      var numChild= docBody.getChild(i).editAsText().getText();
//      Logger.log(numChild); 
  }
  
 
//xml doc of document 
var idName = DocumentApp.getActiveDocument().getId();
//  Logger.log(idName);
   var forDriveScope = DriveApp.getStorageUsed();
  Logger.log(forDriveScope)
//google export url to get google doc text (in html format) of the specific google doc id 
var urlName = "https://docs.google.com/feeds/download/documents/export/Export?id=" + idName + "&exportFormat=html&format=html";
 var param = {
    method: "get",
   headers: {
        "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
    },
    muteHttpExceptions:true,
  };
  
//api request- returns html in a string 
var html = UrlFetchApp.fetch(urlName, param).getContentText();
  
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
//regEx cleans up html string  
 var obj2= html.match(/<h(.)>.*?<\/h\1>/g);
//grabs EVERYTHING in between the first and last p tag  
//  var obj2= html.match(/<p>.*<\/p>/g);
//  Logger.log(obj);
//   Logger.log(obj2);
 
  


//-----------------------------------------------------------------------------------START OF HIMALAYA.JS ------------------------------------------------------------------------------------------------------------------------------->

//-------------------------------------------------------------------------------------END OF HIMALAYA.JS ------------------------------------------------------------------------------------------------------------------------------->

  //loop through all objects of htmlBlob to separate headings and p tags 
  // use original function
  //for loop first for headings (by tagnames) --> create new object
  //foor loop second time for pushing everything else into description array
 var htmlBlob = himalaya.parse(html); 
  Logger.log(htmlBlob);
//returns array of html children as objects
  
  
var output = [];  
    function createArtifact(i, htmlBlob) {
//3. function: assign name tag depending on the htag --> set description array (it will still be empty)       
          var result = {};
 //i is refering to the index of the header tag you've alrady found
     result.name = htmlBlob[i].children[0].content,
     result.description = [];
 //4. for loop through input again (but only refer to sibling of the htag you have already chosen) and if it isn't a heading, push it to the description array    
//starts where index of your heading tag ended      
       for (var x = i + 1; x < htmlBlob.length; x++) {
        if (htmlBlob[x].tagName === "h1" || htmlBlob[x].tagName  === "h2") {
         break;       
        }
//5. else if it IS a heading, it'll stop the loop but the first loop will keep going through the elements array and will keep repeating every time it finds a heading and from there, the function will keep running 
//break in loop is not working
      else { 
//the description is not being pushed onto the description
//6. create if statements to differentiate between the types of elements so that you can wrap them in tags to keep their original rich text formatting
          if (htmlBlob[x].tagName  === "p" || htmlBlob[x].tagName  === "ol"){
            //if there is nothing in the content property, the loop stops, so if statement is required to skip those with no content
             var getContent = htmlBlob[x].children;
            if (getContent.length === 0.0) {
              Logger.log("this is a zero");
                continue;
            }
            else {
                   var getPValue = htmlBlob[x];
                    result.description.push(getPValue);
            }
          } //end of if statement 
          } //end of else statement
       } //end of second for loop
       return result;
    } //end of createArtifact function
  
  
//1. loop through all the html array 
  for (var i= 0; i< htmlBlob.length; i++) {
   //establish function first
    //2. find heading tags and create objects (no assignments yet) --> do function when you come across the h tags
  if (htmlBlob[i].tagName === "h1" || htmlBlob[i].tagName  === "h2"){
    //obj is going to be the object returned from the function --> that will be pushed to the final array
   var obj = createArtifact (i, htmlBlob); //enter corresponding parameters --> returns the object
    //save it as a new object to assign the stringify 
   var finalObj = obj;
      finalObj.Description = himalaya.stringify(obj.description); 
      finalObj.Name = obj.name
      finalObj.RequirementTypeId= 4;
    output.push(finalObj); //object is pushed into array  
  }
  else {
    continue; //skip it otherwise 
  } //end of else statement
       }  //end of first for loop
 
Logger.log(output); 
  return output;
  
}// getArray function 
  


///*
// *
// * ==============
// * POST REQUIREMENTS
// * ==============
// *
// */
////loop through output to send to inflectra 
////test POST 
//<------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------->
// General fetch function, using Google's built in fetch api
// @param: body - json object
// @param: currentUser - user object storing login data from client
// @param: postUrl - url string passed in to connect with Spira
function poster(body, currentUser, postUrl) {
     var decoded = Utilities.base64Decode(currentUser.api_key);
    var APIKEY = Utilities.newBlob(decoded).getDataAsString();
  //build URL from args
    var fullUrl = currentUser.url + postUrl + "username=" + currentUser.userName + APIKEY;
    //POST headers
    var params = {
        'method': 'post',
        'contentType': 'application/json',
        'muteHttpExceptions': true,
        'payload': JSON.stringify(body)
    };
    //call Google fetch function
    var response = UrlFetchApp.fetch(fullUrl, params);
    //returns parsed JSON
    //unparsed response contains error codes if needed
    return response;
    //return JSON.parse(response);
  
}

function postToSpira(user, output) {
//    var testPost = {
//      Name: "TESTING POST REQUEST AGAIN3",
//      RequirementTypeId:4,
//      Description: "<h1>POST TEST</h1>"
//}
    for (var t=0; t<output.length;t++) {
      var outputObject=output[t];
         Logger.log(output[t]);
      //swtich to project id that's chosen------------------------------------------------------------------------->    
    var postUrl = API_BASE + 1 + '/requirements?';
  //projectId
    var response = poster(output[t], user, postUrl);
         }
  return response;
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
