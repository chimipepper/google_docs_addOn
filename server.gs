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
//https://github.com/andrejewski/himalaya
  (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.himalaya = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.stringIncludes = stringIncludes;
exports.isRealNaN = isRealNaN;
exports.arrayIncludes = arrayIncludes;


/*
We don't want to include babel-polyfill in our project.
    - Library authors should be using babel-runtime for non-global polyfilling
    - Adding babel-polyfill/-runtime increases bundle size significantly
  We will include our polyfill instance methods as regular functions.
*/

function startsWith(str, searchString, position) {
  return str.substr(position || 0, searchString.length) === searchString;
}

function endsWith(str, searchString, position) {
  var index = (position || str.length) - searchString.length;
  var lastIndex = str.lastIndexOf(searchString, index);
  return lastIndex !== -1 && lastIndex === index;
}

function stringIncludes(str, searchString, position) {
  return str.indexOf(searchString, position || 0) !== -1;
}

function isRealNaN(x) {
  return typeof x === 'number' && isNaN(x);
}

function arrayIncludes(array, searchElement, position) {
  var len = array.length;
  if (len === 0) return false;

  var lookupIndex = position | 0;
  var isNaNElement = isRealNaN(searchElement);
  var searchIndex = lookupIndex >= 0 ? lookupIndex : len + lookupIndex;
  while (searchIndex < len) {
    var element = array[searchIndex++];
    if (element === searchElement) return true;
    if (isNaNElement && isRealNaN(element)) return true;
  }

  return false;
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splitHead = splitHead;
exports.unquote = unquote;
exports.format = format;
exports.formatAttributes = formatAttributes;
function splitHead(str, sep) {
  var idx = str.indexOf(sep);
  if (idx === -1) return [str];
  return [str.slice(0, idx), str.slice(idx + sep.length)];
}

function unquote(str) {
  var car = str.charAt(0);
  var end = str.length - 1;
  var isQuoteStart = car === '"' || car === "'";
  if (isQuoteStart && car === str.charAt(end)) {
    return str.slice(1, end);
  }
  return str;
}

function format(nodes) {
  return nodes.map(function (node) {
    var type = node.type;
    if (type === 'element') {
      var tagName = node.tagName.toLowerCase();
      var attributes = formatAttributes(node.attributes);
      var children = format(node.children);
      return { type: type, tagName: tagName, attributes: attributes, children: children };
    }

    return { type: type, content: node.content };
  });
}

function formatAttributes(attributes) {
  return attributes.map(function (attribute) {
    var parts = splitHead(attribute.trim(), '=');
    var key = parts[0];
    var value = typeof parts[1] === 'string' ? unquote(parts[1]) : null;
    return { key: key, value: value };
  });
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseDefaults = undefined;
exports.parse = parse;
exports.stringify = stringify;

var _lexer = require('./lexer');

var _lexer2 = _interopRequireDefault(_lexer);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _format = require('./format');

var _stringify = require('./stringify');

var _tags = require('./tags');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { defaults: obj }; }

var parseDefaults = exports.parseDefaults = {
  voidTags: _tags.voidTags,
  closingTags: _tags.closingTags,
  childlessTags: _tags.childlessTags,
  closingTagAncestorBreakers: _tags.closingTagAncestorBreakers
};

function parse(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : parseDefaults;

  var tokens = (0, _lexer2.defaults)(str, options);
  var nodes = (0, _parser2.defaults)(tokens, options);
  return (0, _format.format)(nodes, options);
}

function stringify(ast) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : parseDefaults;

  return (0, _stringify.toHTML)(ast, options);
}

},{"./format":2,"./lexer":4,"./parser":5,"./stringify":6,"./tags":7}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = lexer;
exports.lex = lex;
exports.findTextEnd = findTextEnd;
exports.lexText = lexText;
exports.lexComment = lexComment;
exports.lexTag = lexTag;
exports.isWhitespaceChar = isWhitespaceChar;
exports.lexTagName = lexTagName;
exports.lexTagAttributes = lexTagAttributes;
exports.lexSkipTag = lexSkipTag;

var _compat = require('./compat');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function lexer(str, options) {
  var state = { str: str, options: options, cursor: 0, tokens: [] };
  lex(state);
  return state.tokens;
}

function lex(state) {
  var str = state.str;

  var len = str.length;
  while (state.cursor < len) {
    var start = state.cursor;
    lexText(state);
    if (state.cursor === start) {
      var isComment = (0, _compat.startsWith)(str, '!--', state.cursor + 1);
      if (isComment) {
        lexComment(state);
      } else {
        var tagName = lexTag(state);
        var safeTag = tagName.toLowerCase();
        var childlessTags = state.options.childlessTags;

        if ((0, _compat.arrayIncludes)(childlessTags, safeTag)) {
          lexSkipTag(tagName, state);
        }
      }
    }
  }
}

var alphanumeric = /[A-Za-z0-9]/;
function findTextEnd(str, index) {
  while (true) {
    var textEnd = str.indexOf('<', index);
    if (textEnd === -1) {
      return textEnd;
    }
    var char = str.charAt(textEnd + 1);
    if (char === '/' || char === '!' || alphanumeric.test(char)) {
      return textEnd;
    }
    index = textEnd + 1;
  }
}

function lexText(state) {
  var type = 'text';
  var str = state.str,
      cursor = state.cursor;

  var textEnd = findTextEnd(str, cursor);
  if (textEnd === -1) {
    // there is only text left
    var _content = str.slice(cursor);
    state.cursor = str.length;
    state.tokens.push({ type: type, content: _content });
    return;
  }

  if (textEnd === cursor) return;

  var content = str.slice(cursor, textEnd);
  state.cursor = textEnd;
  state.tokens.push({ type: type, content: content });
}

function lexComment(state) {
  state.cursor += 4; // "<!--".length
  var str = state.str,
      cursor = state.cursor;

  var commentEnd = str.indexOf('-->', cursor);
  var type = 'comment';
  if (commentEnd === -1) {
    // there is only the comment left
    var _content2 = str.slice(cursor);
    state.cursor = str.length;
    state.tokens.push({ type: type, content: _content2 });
    return;
  }

  var content = str.slice(cursor, commentEnd);
  state.cursor = commentEnd + 3; // "-->".length
  state.tokens.push({ type: type, content: content });
}

function lexTag(state) {
  var str = state.str;

  {
    var secondChar = str.charAt(state.cursor + 1);
    var close = secondChar === '/';
    state.tokens.push({ type: 'tag-start', close: close });
    state.cursor += close ? 2 : 1;
  }
  var tagName = lexTagName(state);
  lexTagAttributes(state);
  {
    var firstChar = str.charAt(state.cursor);
    var _close = firstChar === '/';
    state.tokens.push({ type: 'tag-end', close: _close });
    state.cursor += _close ? 2 : 1;
  }
  return tagName;
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-white-space
var whitespace = /\s/;
function isWhitespaceChar(char) {
  return whitespace.test(char);
}

function lexTagName(state) {
  var str = state.str,
      cursor = state.cursor;

  var len = str.length;
  var start = cursor;
  while (start < len) {
    var char = str.charAt(start);
    var isTagChar = !(isWhitespaceChar(char) || char === '/' || char === '>');
    if (isTagChar) break;
    start++;
  }

  var end = start + 1;
  while (end < len) {
    var _char = str.charAt(end);
    var _isTagChar = !(isWhitespaceChar(_char) || _char === '/' || _char === '>');
    if (!_isTagChar) break;
    end++;
  }

  state.cursor = end;
  var tagName = str.slice(start, end);
  state.tokens.push({ type: 'tag', content: tagName });
  return tagName;
}

function lexTagAttributes(state) {
  var str = state.str,
      tokens = state.tokens;

  var cursor = state.cursor;
  var quote = null; // null, single-, or double-quote
  var wordBegin = cursor; // index of word start
  var words = []; // "key", "key=value", "key='value'", etc
  var len = str.length;
  while (cursor < len) {
    var char = str.charAt(cursor);
    if (quote) {
      var isQuoteEnd = char === quote;
      if (isQuoteEnd) {
        quote = null;
      }
      cursor++;
      continue;
    }

    var isTagEnd = char === '/' || char === '>';
    if (isTagEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor));
      }
      break;
    }

    var isWordEnd = isWhitespaceChar(char);
    if (isWordEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor));
      }
      wordBegin = cursor + 1;
      cursor++;
      continue;
    }

    var isQuoteStart = char === '\'' || char === '"';
    if (isQuoteStart) {
      quote = char;
      cursor++;
      continue;
    }

    cursor++;
  }
  state.cursor = cursor;

  var wLen = words.length;
  var type = 'attribute';
  for (var i = 0; i < wLen; i++) {
    var word = words[i];
    var isNotPair = word.indexOf('=') === -1;
    if (isNotPair) {
      var secondWord = words[i + 1];
      if (secondWord && (0, _compat.startsWith)(secondWord, '=')) {
        if (secondWord.length > 1) {
          var newWord = word + secondWord;
          tokens.push({ type: type, content: newWord });
          i += 1;
          continue;
        }
        var thirdWord = words[i + 2];
        i += 1;
        if (thirdWord) {
          var _newWord = word + '=' + thirdWord;
          tokens.push({ type: type, content: _newWord });
          i += 1;
          continue;
        }
      }
    }
    if ((0, _compat.endsWith)(word, '=')) {
      var _secondWord = words[i + 1];
      if (_secondWord && !(0, _compat.stringIncludes)(_secondWord, '=')) {
        var _newWord3 = word + _secondWord;
        tokens.push({ type: type, content: _newWord3 });
        i += 1;
        continue;
      }

      var _newWord2 = word.slice(0, -1);
      tokens.push({ type: type, content: _newWord2 });
      continue;
    }

    tokens.push({ type: type, content: word });
  }
}

function lexSkipTag(tagName, state) {
  var str = state.str,
      cursor = state.cursor,
      tokens = state.tokens;

  var len = str.length;
  var index = cursor;
  while (index < len) {
    var nextTag = str.indexOf('</', index);
    if (nextTag === -1) {
      lexText(state);
      break;
    }

    var tagState = { str: str, cursor: nextTag + 2, tokens: [] };
    var name = lexTagName(tagState);
    var safeTagName = tagName.toLowerCase();
    if (safeTagName !== name.toLowerCase()) {
      index = tagState.cursor;
      continue;
    }

    var content = str.slice(cursor, nextTag);
    tokens.push({ type: 'text', content: content });
    var openTag = { type: 'tag-start', close: true };
    var closeTag = { type: 'tag-end', close: false };
    lexTagAttributes(tagState);
    tokens.push.apply(tokens, [openTag].concat(_toConsumableArray(tagState.tokens), [closeTag]));
    state.cursor = tagState.cursor + 1;
    break;
  }
}

},{"./compat":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = parser;
exports.hasTerminalParent = hasTerminalParent;
exports.parse = parse;

var _compat = require('./compat');

function parser(tokens, options) {
  var root = { tagName: null, children: [] };
  var state = { tokens: tokens, options: options, cursor: 0, stack: [root] };
  parse(state);
  return root.children;
}

function hasTerminalParent(tagName, stack, terminals) {
  var tagParents = terminals[tagName];
  if (tagParents) {
    var currentIndex = stack.length - 1;
    while (currentIndex >= 0) {
      var parentTagName = stack[currentIndex].tagName;
      if (parentTagName === tagName) {
        break;
      }
      if ((0, _compat.arrayIncludes)(tagParents, parentTagName)) {
        return true;
      }
      currentIndex--;
    }
  }
  return false;
}

function parse(state) {
  var tokens = state.tokens,
      options = state.options;
  var stack = state.stack;

  var nodes = stack[stack.length - 1].children;
  var len = tokens.length;
  var cursor = state.cursor;

  while (cursor < len) {
    var token = tokens[cursor];
    if (token.type !== 'tag-start') {
      nodes.push(token);
      cursor++;
      continue;
    }

    var tagToken = tokens[++cursor];
    cursor++;
    var tagName = tagToken.content.toLowerCase();
    if (token.close) {
      var item = void 0;
      while (item = stack.pop()) {
        if (tagName === item.tagName) break;
      }
      while (cursor < len) {
        var endToken = tokens[cursor];
        if (endToken.type !== 'tag-end') break;
        cursor++;
      }
      break;
    }

    var isClosingTag = (0, _compat.arrayIncludes)(options.closingTags, tagName);
    var shouldRewindToAutoClose = isClosingTag;
    if (shouldRewindToAutoClose) {
      var terminals = options.closingTagAncestorBreakers;

      shouldRewindToAutoClose = !hasTerminalParent(tagName, stack, terminals);
    }

    if (shouldRewindToAutoClose) {
      // rewind the stack to just above the previous
      // closing tag of the same name
      var currentIndex = stack.length - 1;
      while (currentIndex > 0) {
        if (tagName === stack[currentIndex].tagName) {
          stack = stack.slice(0, currentIndex);
          var previousIndex = currentIndex - 1;
          nodes = stack[previousIndex].children;
          break;
        }
        currentIndex = currentIndex - 1;
      }
    }

    var attributes = [];
    var attrToken = void 0;
    while (cursor < len) {
      attrToken = tokens[cursor];
      if (attrToken.type === 'tag-end') break;
      attributes.push(attrToken.content);
      cursor++;
    }

    cursor++;
    var children = [];
    nodes.push({
      type: 'element',
      tagName: tagToken.content,
      attributes: attributes,
      children: children
    });

    var hasChildren = !(attrToken.close || (0, _compat.arrayIncludes)(options.voidTags, tagName));
    if (hasChildren) {
      stack.push({ tagName: tagName, children: children });
      var innerState = { tokens: tokens, options: options, cursor: cursor, stack: stack };
      parse(innerState);
      cursor = innerState.cursor;
    }
  }
  state.cursor = cursor;
}

},{"./compat":1}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatAttributes = formatAttributes;
exports.toHTML = toHTML;

var _compat = require('./compat');

function formatAttributes(attributes) {
  return attributes.reduce(function (attrs, attribute) {
    var key = attribute.key,
        value = attribute.value;

    if (value === null) {
      return attrs + ' ' + key;
    }
    var quoteEscape = value.indexOf('\'') !== -1;
    var quote = quoteEscape ? '"' : '\'';
    return attrs + ' ' + key + '=' + quote + value + quote;
  }, '');
}

function toHTML(tree, options) {
  return tree.map(function (node) {
    if (node.type === 'text') {
      return node.content;
    }
    if (node.type === 'comment') {
      return '<!--' + node.content + '-->';
    }
    var tagName = node.tagName,
        attributes = node.attributes,
        children = node.children;

    var isSelfClosing = (0, _compat.arrayIncludes)(options.voidTags, tagName.toLowerCase());
    return isSelfClosing ? '<' + tagName + formatAttributes(attributes) + '>' : '<' + tagName + formatAttributes(attributes) + '>' + toHTML(children, options) + '</' + tagName + '>';
  }).join('');
}

exports.defaults = { toHTML: toHTML };

},{"./compat":1}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
  Tags which contain arbitary non-parsed content
  For example: <script> JavaScript should not be parsed
*/
var childlessTags = exports.childlessTags = ['style', 'script', 'template'];

/*
  Tags which auto-close because they cannot be nested
  For example: <p>Outer<p>Inner is <p>Outer</p><p>Inner</p>
*/
var closingTags = exports.closingTags = ['html', 'head', 'body', 'p', 'dt', 'dd', 'li', 'option', 'thead', 'th', 'tbody', 'tr', 'td', 'tfoot', 'colgroup'];

/*
  Closing tags which have ancestor tags which
  may exist within them which prevent the
  closing tag from auto-closing.
  For example: in <li><ul><li></ul></li>,
  the top-level <li> should not auto-close.
*/
var closingTagAncestorBreakers = exports.closingTagAncestorBreakers = {
  li: ['ul', 'ol', 'menu'],
  dt: ['dl'],
  dd: ['dl'],
  tbody: ['table'],
  thead: ['table'],
  tfoot: ['table'],
  tr: ['table'],
  td: ['table']

  /*
    Tags which do not need the closing tag
    For example: <img> does not need </img>
  */
};var voidTags = exports.voidTags = ['!doctype', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

},{}]},{},[3])(3)
}); 
//# sourceMappingURL=himalaya.js.map

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
      finalObj.description = himalaya.stringify(obj.description); 
      finalObj.name = obj.name
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

function postToSpira(user) {
    var testPost = {
      "Name": "TESTING POST REQUEST AGAIN",
      "RequirementTypeId":4,
      "Description": "<h1>POST TEST</h1>"
}
//swtich to project id that's chosen------------------------------------------------------------------------->    
    var postUrl = API_BASE + 1 + '/requirements?';
  //projectId
    var response = poster(testPost, user, postUrl);
   Logger.log(response);
  return response;
} 





//<------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------->


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
