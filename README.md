# google_docs_addOn
Inflectra Google Docs Add-On Project
Connecting users to Inflectra's API so that they can select document data to add as a requirement

SpiraTeam Google Docs Integration Add-on
The web-based interface of SpiraTeam® is ideal for creating and managing requirements for a new project. However when migrating requirements for an existing project from another system, it is useful to be able to load in a batch of requirements, rather than having to manually enter them one at a time.

To simplify this task we’ve created a Google Docs add-on for SpiraTeam® that can export requirements from a document into SpiraTeam®.

SpiraTeam Google Docs Integration Screenshot

Installation
The add-on runs using the Google App Script Engine so all of the files must be downloaded into a single file and run using Google App Script. Google App Script Docs.

The easiest path is to simply create a new Google App Script project and import all of the downloaded files, then you may test the code in an IDE-like test environment.

Usage
You must have a SpiraTeam® account with the proper permissions to utilize this app. For usage instructions reference the SpiraTeam® documentation located at SpiraTeam® Product Add-ons and Downloads.

Working with the Code
As an add-in to Google Docs, this code uses Google Apps Script. To run and test the app you need to install the code inside the Google Apps Script Editor - with code in Google Drive. This environment allows simple testing of the add-in on a Google worksheet.

The code is commented relatively fully throughout. In overview:

HTML files describe the UI
there is a small amount of custom CSS but generally it is based on default Google design standards for the package
client side js is in the .js.html files. As with the CSS these are actually just HTML files. They are added as templates inside the base HTML file.
client side js controls user interactions with the HTML ui - ie the add-in UI. For instance, when a button is clicked this js will send a call to the server, and will also handle success/failure messages from the server
Because server code cannot store dynamic information, the js also stores data - both static base data and user selected data. This can then be sent to the server as needed
there is one server.gs file. This is all the server side code - it is standard javascript, but limited to older functionality (ie no map or reduce functions). It also allows calling of all relevant Google Apps Script classes and methods. This code handles all access to the sheet data, manipulation of the sheet, and getting and sending data to Spira.
