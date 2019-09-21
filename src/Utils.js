/**
 * @file Javascript Api explorer tool
 * @author Kitty Jose
 * @license Copyright 2018-2019 Data Chemist Limited, All Rights Reserved. See LICENSE file for more
 *
 * @summary Set of functions used across scripts
 */
const Codemirror= require('./plugins/codemirror.terminus');
const FrameHelper = require('./FrameHelper');
// function to read Files
function readFile(file){
  if (window.XMLHttpRequest){
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
  }
  else{
    // code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET",file,false);
  xmlhttp.send();
  xmlDoc=xmlhttp.responseText;
  return xmlDoc;
} // readFile()

// function to write api call signatures from woql client
function getFunctionSignature(which){
  var sigs = {};
  sigs.connect = {
    spec   : "WOQLClient.connect(server_url, key)",
    descr  : "\n\nConnect to a Terminus server at the given URI with an API key"
                + "Stores the terminus:ServerCapability document returned in the connection register"
                + "which stores, the url, key, capabilities, and database meta-data for the connected server"
                + "If the curl argument is false or null, the this.server will be used if present,"
                + " or the promise will be rejected.",
    result : "HTTP 200 on success, 409 for already existing database, otherwise error code",
    args   : {server_url : 'url', key: 'Api key'},
    options: { title: "", description: "" }
  };
  sigs.create = {
    spec    : "WOQLClient.createDatabase(database_url, details, key)",
    descr   : "\n\nCreate a Terminus Database by posting a terminus:"
                + "The dburl argument can be \n1) a valid URL of a terminus database or \n2) a valid Terminus "
                + "database id or \n3) can be omitted"
                + "\nin case 2) the current server will be used, "
    		        + "\nin case 3) the database id will be set from the @id field of the terminuse:Database document."
                + "\nThe second (details) argument contains a \nterminus:Database document with a mandatory "
                + "\nrdfs:label field and an optional rdfs:comment field."
                +  "\nThe third (key) argument contains an optional API key ",
    result : "HTTP 200 on success, 409 for already existing database, otherwise error code",
    args   : {database_url : 'url', details: '', key: ' Api key'},
    options: { title: "", description: "" }
  };
  sigs.delete = {
      spec  : "WOQLClient.deleteDatabase(database_url, options)",
      descr : "\n\nDeletes a Database"
                + "\nThe first (dburl) argument can \n1) a valid URL of a terminus database or \n2) a valid database id"
                + " or \n3) ommitted in case \n2) the current server will be used, and in case \n3) the current server "
                + "and database will be used. \nThe second argument (opts) is an options json - no options are"
                + " currently supported for this function",
      result: "HTTP 200 on success, otherwise error code",
  };
  sigs.getSchema = {
    spec   : "WOQLClient.getSchema(schema_url, options)",
    descr  : "\n\nGets the schema of a database. \nThe first (schurl) argument can be "
              + "\n1) a valid URL of a terminus database or \n2) a valid database id or "
              + "\n3) omitted, \nin case 2) the current server will be used, and \nin case 3) the current server and"
              + "database will be used the second argument (opts) is an options json - "
              + "\nopts.format is optional and defines which format is requested (*json / turtle)"
              + "\nopts.key is an optional API key",
    result : "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    options: { format: "turtle" }
  };
  sigs.getClassFrames = {
    spec   : "WOQLClient.getClassFrame = function(cfurl, cls, opts)",
    descr  : "\n\nRetrieves a WOQL query on the specified database which updates the state and returns the results"
              +  "\nThe first (cfurl) argument can be"
              + "\n1) a valid URL of a terminus database or"
              +  "\n2) omitted - the current database will be used"
              +  "\nthe second argument (cls) is the URL / ID of a document class that exists in the database schema"
              +  "\nthe third argument (opts) is an options json - opts.key is an optional API key",
    result : "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    options: { format: "turtle" }
  };
  sigs.updateSchema = {
    spec    : "WOQLClient.updateSchema(schema_url, docs, options)",
    descr   : "\n\nUpdates the Schema of the specified database"
              + "\nThe first (schurl) argument can be \n1) a valid URL of a terminus database or \n2)"
              + " a valid database id or \n3) omitted, \nin case 2) the current server will be used,"
              + " and \nin case 3) the current server and database will be used"
              + "\nThe second argument (doc) is a valid owl ontology in json-ld or turtle format"
              + "\nthe third argument (opts) is an options json - "
     		      + "opts.format is used to specify which format is being used (*json / turtle)"
     		      + "opts.key is an optional API key",
    result : "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args   : {document : 'doc'},
    options: { format: "turtle", editmode: "replace"}
  };
  sigs.createDocument = {
    spec   : "WOQLClient.createDocument(document_url, document, options)",
    descr  : "\n\nCreates a new document in the specified database"
              + "\nThe first (docurl) argument can be"
              + "\n1) a valid URL of a terminus database (an id will be randomly assigned) or"
              + "\n2) a valid URL or of a terminus document (the document will be given the passed URL) or"
              + "\n3) a valid terminus document id (the current server and database will be used)"
              + "\n4) can be ommitted (the URL will be taken from the document if present)"
              + "\nThe second argument (doc) is a valid document in json-ld"
              + "\nthe third argument (opts) is an options json - opts.key is an optional API key",
    result : "Created Document on success (HTTP 200), Violation Report Otherwise (HTTP 400+)",
    args   : {document_url : 'url', document: "doc"},
    options: { format: "turtle", fail_on_id_denied: false}
  };
  sigs.viewDocument = {
    spec    : "WOQLClient.getDocument(document_url, options)",
    descr   : "\n\nRetrieves a document from the specified database"
              + "\nThe first (docurl) argument can be"
              + "\n1) a valid URL of a terminus document or"
              + "\n2) a valid ID of a terminus document in the current database"
              + "\nthe second argument (opts) is an options json - "
              + "\nopts.key is an optional API key"
              + "\nopts.shape is frame | *document ",
    result : "Document (HTTP 200), Violation Report Otherwise (HTTP 400+)",
    args   : {document_url : 'url'},
    options: { format: "turtle"}
  };
  sigs.updateDocument = {
    spec   : "WOQLClient.updateDocument(document_url, document, options)",
    descr  : "\n\nUpdates a document in the specified database with a new version"
              + "\nThe first (docurl) argument can be"
              + "\n1) a valid URL of a terminus document or "
              + "\n2) a valid ID of a terminus document in the current database or"
              + "\n3) ommitted in which case the id will be taken from the document @id field"
              + "\nthe second argument (doc) is a document in json-ld format"
              + "\nthe third argument (opts) is an options json - opts.key is an optional API key",
    result : "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args   : {document_url : 'url', document: "doc"},
    options: { format: "turtle", editmode: "replace"}
  };
  sigs.deleteDocument = {
    spec  : "WOQLClient.deleteDocument(document_url, options)",
    descr : "\n\nDeletes a document from the specified database"
            + "\nThe first (docurl) argument can be"
            + "\n1) a valid URL of a terminus document or"
            + "\n2) a valid ID of a terminus document in the current database"
            + "\n3) omitted - the current document will be used"
            + "\nthe second argument (opts) is an options json - opts.key is an optional API key",
    result: "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args  : {document_url : 'url'},
  };
  sigs.select = {
    spec: "WOQLClient.select(database_url, woql, options)",
    descr: "\n\nExecutes a read-only WOQL query on the specified database and returns the results"
              + "\nThe first (qurl) argument can be "
              + "\n1) a valid URL of a terminus database or "
              + "\n2) omitted - the current database will be used "
              + "\nthe second argument (woql) is a woql select statement encoded as a string"
              + "\nthe third argument (opts) is an options json - opts.key is an optional API key",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {woql: 'woql'},
  };
  sigs.update = {
    spec  : "WOQLClient.update(database_url, woql, options)",
    descr : "\n\nExecutes a WOQL query on the specified database which updates the state and returns the results"
            + "\nThe first (qurl) argument can be "
            + "\n1) a valid URL of a terminus database or "
            + "\n2) omitted - the current database will be used "
            + "\nthe second argument (woql) is a woql select statement encoded as a string"
            + "\nthe third argument (opts) is an options json - opts.key is an optional API key",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args  : {woql: 'woql'},
  };
  sigs.lookup = {
    spec: "WOQLClient.lookup(database_url, woql, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {class: 'url', term: 'string'},
  };
  sigs.map = {
    spec: "WOQLClient.lookup(source, target, woql, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {source: 'json', target: "json", woql: 'json'},
  };
  sigs.getClassFrame = {
    spec: "WOQLClient.getClassFrame(class, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {class: 'url'},
  };
  sigs.getPropertyFrame = {
    spec: "WOQLClient.getPropertyFrame(class, property, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {class: 'url', property: 'url'},
  };
  sigs.getFilledPropertyFrame = {
    spec: "WOQLClient.getPropertyFrame(document_url, property, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {document_url: 'url', property: 'url'},
  };
  sigs.getSubClasses = {
    spec: "WOQLClient.getSubClasses(class, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {class: 'url'},
  };
  return sigs[which];
}//getFunctionSignature

// returns dom element for header text
function getHeaderDom(text){
  var hd = document.createElement('div');
  hd.setAttribute('class', 'terminus-module-head');
  var h = document.createElement('h3');
  h.innerHTML = text;
  hd.appendChild(h);
  return hd;
} // getHeaderTextDom

// returns dom for alert banner
function getInfoAlertDom(type, label, msg){
  var ald = document.createElement('div');
  if(type == 'info') ald.setAttribute('class', 'terminus-alert terminus-alert-success');
  else ald.setAttribute('class', 'alert');
  var str = document.createElement('STRONG');
  str.innerHTML = label;
  ald.appendChild(str);
  var txt = document.createTextNode(msg);
  ald.appendChild(txt);
  return ald;
} // getInfoAlertDom()

// formats response results from platform
function getResponse(currForm, action, response, terminator){

  var rd = document.createElement('div');

  // get header result
  rd.appendChild(getHeaderDom('Result'));
  var br = document.createElement('BR');
  rd.appendChild(br);

  var data = JSON.stringify(response, 0, 4);

  var pre = document.createElement('pre');
  pre.setAttribute('class', 'terminus-api-view terminus-scheme-pre');
  pre.innerHTML = data;

  var cm = stylizeCodeDisplay(terminator, pre, rd, 'javascript');
  if(!cm) rd.appendChild(pre);

  var br = document.createElement('BR');
  rd.appendChild(br);

  currForm.appendChild(rd);

  return currForm;
}

// formats the response from fetch call and spits out Http header and result
function showHttpResult(response, action, currForm, terminator){
    //var currForm = document.createElement('div');

    var br = document.createElement('BR');
    currForm.appendChild(br);
    var br = document.createElement('BR');
    currForm.appendChild(br);

    // get header result
    currForm.appendChild(getHeaderDom('HTTP Header'));

    var br = document.createElement('BR');
    currForm.appendChild(br);

     var retHttpHeaders  = '';

     // iterate over all headers
     for (let [key, value] of response.headers) {
       retHttpHeaders = retHttpHeaders +  `${key} = ${value}` + '\n';
     }

    // http header result
    var hdres = document.createElement('pre');
    hdres.setAttribute('class', 'terminus-api-signature-pre');
    var txt = document.createTextNode(retHttpHeaders);
    hdres.appendChild(txt);

    var cm = stylizeCodeDisplay(terminator, hdres, currForm, 'message/http');
    if(!cm) currForm.appendChild(hdres);

    return response.json()
    .then(function(response){
      getResponse(currForm, action, response, terminator); // get return response
    })

} // UTILS.showHttpResult()


function deleteStylizedEditor(ui, qip){
    if(ui.pluginAvailable("codemirror")){
		var cm = qip.nextElementSibling;
		cm.setAttribute('class', 'terminus-hide');
		FrameHelper.removeChildren(cm);
	}
}

/* ui: terminus ui reference
   txt: text area to be stylized
   view: defines the size of editor to appear in pages (schema/ query)
   mode: format to be displayed in
*/
function stylizeEditor(ui, txt, view, mode){
    var cmConfig = ui.pluginAvailable("codemirror");
    if(!(cmConfig)) return;
	var cm = new Codemirror(txt, mode, cmConfig);
	var ar = cm.colorizeTextArea(view);
	cm.updateTextArea(ar);
}

/* ui: terminus ui reference
   txt: text area to be stylized
   dom: stylized pre area is appended to dom
   mode: format to be displayed in
*/
function stylizeCodeDisplay(ui, txt, dom, mode){
    var cmConfig = ui.pluginAvailable("codemirror");
    if(!(cmConfig)) return false;
    var cm = new Codemirror(txt, mode, cmConfig);
    var pr = cm.colorizePre();
    dom.appendChild(pr);
    return true;
}

/* name: classname to find and remove classes from elements
*/
function removeSelectedNavClass(name){
    var el = document.getElementsByClassName(name);
    for(var i=0; i<el.length; i++){
        el[i].classList.remove(name);
    }
}

// toggles between contents
function tolggleContent(icon, content){
    if (content.style.display === "block"){
        removeSelectedNavClass("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
        content.style.display = "none";
    }
    else{
        removeSelectedNavClass("fa-chevron-down");
        icon.classList.add("fa-chevron-up");
        content.style.display = "block";
    }
}

// controls current selected nav bar
function activateSelectedNav(nav, terminator){
    removeSelectedNavClass("terminus-selected");
	checkDocumentSubMenus(terminator);
	nav.classList.add("terminus-selected");
}

function hideDocumentSubMenus(el){
	if(el.classList.contains('terminus-display')){
		el.classList.remove('terminus-display');
		el.classList.add('terminus-hide');
	}
}

function checkDocumentSubMenus(terminator){
	if(terminator.ui.showControl("get_document")) {
		var gd = document.getElementsByClassName('terminus-get-doc');
		hideDocumentSubMenus(gd[0]);
	}
	if(terminator.ui.showControl("create_document")) {
		var cd = document.getElementsByClassName('terminus-create-doc');
		hideDocumentSubMenus(cd[0]);
	}
}

module.exports={tolggleContent,
               removeSelectedNavClass,
               stylizeCodeDisplay,
               stylizeEditor,
               deleteStylizedEditor,
               showHttpResult,
               getHeaderDom,
               getInfoAlertDom,
               getFunctionSignature,
               activateSelectedNav}
