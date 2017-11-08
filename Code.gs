function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Inflectra Add On');
  DocumentApp.getUi().showSidebar(ui);
}




// used to show or hide / hide / show a specific panel
// @param: panel - string. suffix for items to act on (eg if id = panel-help, choice = "help")
function panelToggle (panel) {
    panelId = "#panel-" + panel;
    $(panelId).toggleClass("offscreen");
}
function hidePanel (panel) {
    panelId = "#panel-" + panel;
    $(panelId).addClass("offscreen");
}
function showPanel (panel) {
    panelId = "#panel-" + panel;
    $(panelId).removeClass("offscreen");
}
