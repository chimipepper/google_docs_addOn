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
var indentSum = 0;

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
 * LOGOUT FUNCTION
 * ====================
 *
 * user would like to logout- resets sidebar
 *
 */
// Alert pop up for data clear warning
// @param: string - message to be displayed
function warn(string) {
    var getUi = DocumentApp.getUi();
    //alert popup with yes and no button
    var response = getUi.alert(string, getUi.ButtonSet.YES_NO);
    //returns with user choice
    if (response == getUi.Button.YES) {
        return true;
    } else {
        return false;
    }
} //end of logout function



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



/*
 *
 * ====================
 * DATA "GET" FUNCTIONS
 * ====================
 *
 * functions used to retrieve projects user has access to - from Spira
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
//functions will parse through document data to create an array of objects 
//each object will contain a Name and Description property
//Name- name field of the requirement (must have a heading style)
//Description- description field of the requirement 
//any text located between Heading styles will be loaded into the Description field of requirement


function createArtifactObjectArray() {
//document is automatically in xml --> must be turned into html so that elements may be parsed easier
  var idName = DocumentApp.getActiveDocument().getId();
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
  // regEx removes the whole head section, including the stylesheet and meta tag and extraneous span tags
    html = html.replace(/<head>.*<\/head>/, '');
    // remove almost all html attributes
    html = html.replace(/ (id|class|style|start|colspan|rowspan)="[^"]*"/g, '');
    // remove all of the spans, as well as the outer html and body
    html = html.replace(/<(span|\/span|body|\/body|html|\/html)>/g, '');
    // clearly the superior way of denoting line breaks
    html = html.replace(/<br>/g, '<br />');
//html is stored as one string


//javascript library (himalya.js)- javascript html to json parser
//https://github.com/andrejewski/himalaya
//himalya will parse through html and identify elements with heading styles --> will create new objects and will each be assigned as the name property of the object
//text in between heading styles will be saved as description property in a rich text format to keep their formatting as close to the original as possible 
  var htmlBlob = himalaya.parse(html); 
//htmlBlob returns array of html children as objects
//output is final array that will store the objects once they are created and properties are assigned to them --> will be sent to client side
  var output = [];  
  
  
//createArtifact function- assigns name property of object and creates a description array    
 function createArtifact(i, htmlBlob) {
  var result = {};
//i is current index of htmlBlob
    result.name = htmlBlob[i].children[0].content,
    result.description = [];
//4. for loop through htmlBlob again (but only refer to element after current element) and if tagName is not a heading, push it to the description array    
   
//starts where index of your heading tag ended 
//5. else if it IS a heading, it'll stop the loop but the first loop will keep going through the elements array and will keep repeating every time it finds a heading and from there, the function will keep running 
    for (var x = i + 1; x < htmlBlob.length; x++) {
       if (htmlBlob[x].tagName === "h1" || htmlBlob[x].tagName  === "h2" || htmlBlob[i].tagName  === "h3"|| htmlBlob[i].tagName  === "h4"|| htmlBlob[i].tagName  === "h5"|| htmlBlob[i].tagName  === "h6") {
       break;       
       }
      else { 
        
//6. elements with content will be saved as description of the object
          if (htmlBlob[x].tagName  === "p" || htmlBlob[x].tagName  === "ol" || htmlBlob[x].tagName  === "ul"){
             var getContent = htmlBlob[x].children;
//if element is empty, the loop stops, so if statement is required to skip those with no content
            if (!getContent.length) {
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
    } //end of createArtifact function --> returns to first loop 
  
  
//1. loop through entire parsed html array 
  for (var i= 0; i< htmlBlob.length; i++) {
    
//2. categorize heading tags (by tagName properties) and create objects (no assignments yet) 
  if (htmlBlob[i].tagName === "h1" || htmlBlob[i].tagName  === "h2" || htmlBlob[i].tagName  === "h3"|| htmlBlob[i].tagName  === "h4"|| htmlBlob[i].tagName  === "h5"|| htmlBlob[i].tagName  === "h6"){
    
//3. obj is object created from createArtifact function --> as each object is returned, it will be pushed to final output array
//@param: i- current index of htmlBlob
//@param: htmlBlob- parsed html array
   var obj = createArtifact (i, htmlBlob); 
//himalaya.stringify will save html format of description as a string for rich text    
    var finalObj = {};
      finalObj.Description = himalaya.stringify(obj.description); 
      finalObj.Name = obj.name 
      finalObj.RequirementTypeId= 4;
//indentation properties:
//headingValue differentiates objects with different heading styles
//indentPosition indicates the indentation level an object with a specific heading should belong to on the hierarchy 
    if (htmlBlob[i].tagName === "h1"){
      finalObj.headingValue= 1,
      finalObj.indentPosition = 0
    }
    if (htmlBlob[i].tagName === "h2"){
      finalObj.headingValue= 2,
      finalObj.indentPosition = 1

    }
    if (htmlBlob[i].tagName === "h3"){
      finalObj.headingValue= 3,
      finalObj.indentPosition = 2
    }
    if (htmlBlob[i].tagName === "h4"){
      finalObj.headingValue= 4,
      finalObj.indentPosition = 3
    }
    if (htmlBlob[i].tagName === "h5"){
      finalObj.headingValue= 5,
      finalObj.indentPosition = 4

    }
    if (htmlBlob[i].tagName === "h6"){
      finalObj.headingValue= 6,
      finalObj.indentPosition = 5
    }
//object is pushed into final array      
    output.push(finalObj); 
  }
//if element's tagName is not a heading, skip it
   else {
    continue; 
   } //end of else statement
  } //end of first for loop
 return output;
}// end of createArtifactObjectArray function --> returns to client side
  



///*
// *
// * ==============
// * POST REQUIREMENTS
// * ==============
// *
// */
//loop through output array to run a post request for each object 

// General fetch function, using Google's built in fetch api
// @param: body - json object
// @param: currentUser - user object storing login data from client
// @param: postUrl - url string passed in to connect with Spira
function poster(body, currentUser, postUrl) {
  var decoded = Utilities.base64Decode(currentUser.api_key);
  var APIKEY = Utilities.newBlob(decoded).getDataAsString();
//build URL from api requirements
  var fullUrl = currentUser.url + postUrl + "username=" + currentUser.userName + APIKEY;
//POST params
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
 return response; //-->returns to indentation function
}

//getIndentSum function will return the current indentation position
//@param: currentIndex- the current index object that the output loop is reiterating
//@param: current- the headingValue of the currentIndex
//@param: output- the array of document objects
//@param: previous- the index before the currentIndex
function getIndentSum (currentIndex, current,output, previous) {
  if (currentIndex === output[0]) {
     indentSum = 0; 
  }
  if (current === 1) {
     indentSum = 0; 
  }
  if (current - previous === 0) {
      indentSum= indentSum + 0;
  }
  if (current- previous >= 1 && currentIndex !== output[0]) {
      indentSum= indentSum + 1
  }
  if (current-previous < 0) {
//      indentSum= indentSum + 0; 
    var currentIP = currentIndex.indentPosition;
      if (indentSum > currentIP) {
            var difference= currentIP - indentSum;
            indentSum = indentSum + difference;
      }
      if (indentSum < currentIP) {
        indentSum = 0
      } 
  }
} //end of getIndentSum function

//this will return the indent position depending on the current indent sum 
//@param: currentIndex- the current index object that the output loop is reiterating
//@param: current- the headingValue of the currentIndex
//@param: output- the array of document objects
 function indentation(currentIndex,output, previousIndex, nextIndex) { 
//compare the headingValues of currentIndex object and previousIndex object of output array 

   var current= currentIndex.headingValue; 
   if (currentIndex === output[0]) {
     if (current !== 1 && nextIndex !== 1){
        var headingAlert = DocumentApp.getUi();
        var alertMessage = headingAlert.alert('Error: Please change the formatting of the first title to Heading1');
        var indentPositionValue = "Change Heading";
        return indentPositionValue;
       }
     if (current !== 1){
      var indentPositionValue = "Skip Object";
      return indentPositionValue;
     }
     var previous= 0;
     getIndentSum(currentIndex, current, output, previous); 
     var indentPositionValue = -10
   }
    else {
//if H1, indentSum is reset to 0- if it's not output[0] and H1, reset to 0 
      var previous = previousIndex.headingValue;
      if (current ===1) {
        var indentPositionValue = -6;
        getIndentSum(currentIndex, current, output, previous); 
        return indentPositionValue;
      }
//if current obj H = previous obj H, indent position = 0 AND add 0 to indentSum
      if (current- previous === 0){
        var indentPositionValue = 0;
        getIndentSum(currentIndex, current, output, previous); 
      }
//if the currentIndex headingValue > previous obj H, object will be indented indent position= 1 AND add 1 to indentSum
      if (current- previous >= 1){
        var indentPositionValue = 1;
        getIndentSum(currentIndex, current,output, previous); 
      }
//if current obj H < previous obj H, indent position = indentSum - obj.indentPosition IF the indentSum > indentPosition
      if (current- previous < 0){
        var currentIP = currentIndex.indentPosition;
      if (indentSum >= currentIP) {
        var indentPositionValue= currentIP-indentSum;
        getIndentSum(currentIndex, current, output, previous); 
      }
//indent position = 0 IF indentSum < indentPosition          
      if (indentSum < currentIP) {
        var indentPositionValue= 0;
      }    
    }
   }// end of else statement
 return indentPositionValue;
} //end of indentation function --> return to postAllArtifactsToSpira function


function postAllArtifactsToSpira(user, output,selectedProject) {
// Display a dialog box with a message asking user if they'd like to continue, and "Yes" and "No" buttons
// user can also close the dialog by clicking the close button in its title bar.
  var ui = DocumentApp.getUi();
  var alertResponse = ui.alert('Are you sure you want to continue?', ui.ButtonSet.YES_NO);
// Process the user's response
//if "Yes", poster function will run
  if (alertResponse == ui.Button.YES) {
   for (var t= 0; t< output.length; t++) {
//if document's first object does not have a heading 1 style, this object will be skipped
     var indentPosition= indentation(output[t],output,output[t-1], output[t+1])
     if (indentPosition === "Skip Object") {
       continue;
// if indentPosition of next index of skipped index is not an h1, throw error message 
     }
     if (indentPosition === "Change Heading") {
       var response = "CHANGE HEADING";
       break;
     }
    var postUrl = API_BASE + selectedProject + '/requirements/indent/' + indentPosition + '?';
    var response = poster(output[t], user, postUrl);
    var parsedResponse =  JSON.parse(response);
    if(parsedResponse.Message == "Authentication failed."){
      error();
      var response= "Authentication failed";
      break;
    }
//Modal popup displays the progress of the post request     
   var htmlOutput = HtmlService.createHtmlOutput('<p ' + INLINE_STYLING + '>' + 'Sending ' + (t + 1) + ' of ' + (output.length) + '</p>').setWidth(200).setHeight(75);
   DocumentApp.getUi().showModalDialog(htmlOutput, 'Progress');
   }//end of for loop
//if user cancels request, function will not run
 } else if (alertResponse == ui.Button.NO) {
    var response = "Cancelled"; 
 } else {
    var response = "Close Button Clicked"; 
 }
 return JSON.parse(response);
} //end of postAllArtifactsToSpira function





/*
 *
 * ==============
 * STATUS MESSAGES
 * ==============
 *
 */
function okWarn(dialog) {
    var ui = DocumentApp.getUi();
    var response = ui.alert(dialog, ui.ButtonSet.OK);
}

// Alert pop up for export success
// @param: message - string sent from the export function
function exportSuccess(message) {
    if (message ==  STATUS_ENUM.allSuccess) {
       okWarn("All done!");
    } else if (message == STATUS_ENUM.someError) {
       okWarn("Sorry, but there were some problems. Check the notes on the relevant ID field for explanations.");
    } else if (message == STATUS_ENUM.alLError){
       okWarn("We're really sorry, but we couldn't send anything to SpiraTeam - please check notes on the ID fields  for more information.");
    }
}

