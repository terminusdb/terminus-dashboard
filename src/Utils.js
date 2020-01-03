/**
 * @file Javascript Api explorer tool
 * @author Kitty Jose
 * @license Copyright 2018-2019 Data Chemist Limited, All Rights Reserved. See LICENSE file for more
 *
 * @summary Set of functions used across scripts
 */
const Codemirror= require('./plugins/codemirror.terminus');
const TerminusClient = require('@terminusdb/terminus-client');
const HTMLHelper = require('./html/HTMLHelper');

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
    spec   : "WOQLClient.connect(surl, key)",
    descr  : "\n\nConnect to a Terminus server at the given URI with an API key"
                + "Stores the terminus:ServerCapability document returned in the connection register"
                + "which stores, the url, key, capabilities, and database meta-data for the connected server"
                + "If the curl argument is false or null, the this.server will be used if present,"
                + " or the promise will be rejected."
                + "\n1)The first (surl) argument: {string} argument it is the Server Url"
                + "\n2)The second(key) argument: {string} argument contains an API key",
    result : "HTTP 200 on success, 409 for already existing database, otherwise error code",
    args   : {server_url : 'url', key: 'Api key'},
    options: { title: "", description: "" }
  };
  sigs.create = {
    spec    : "WOQLClient.createDatabase(dburl, details, key)",
    descr   : "\n\nCreate a Terminus Database"
                + "\n1)The first (dburl) argument:{string}, it is a terminusDB Url or a terminusDB Id "
                + "\n2)The second(details) argument:{object}, details which is the payload"
                + "\n which included information of the new database to be created"
                +  "\n3)The third (key) argument:{string}, contains an API key ",
    result : "HTTP 200 on success, 409 for already existing database, otherwise error code",
    args   : {database_url : 'url', details: '', key: ' Api key'},
    options: { title: "", description: "" }
  };
  sigs.delete = {
      spec  : "WOQLClient.deleteDatabase(dburl, key)",
      descr : "\n\nDeletes a Database"
                + "\n1)The first (dburl) argument: {string}, it is a terminusDB Url or a terminusDB Id "
                + "\n2)The second(key) argument: {string}, contains an API key",
      result: "HTTP 200 on success, otherwise error code",
  };
  sigs.getSchema = {
    spec   : "WOQLClient.getSchema(surl, options)",
    descr  : "\n\nGets the schema of a database."
             +"\n1)The first (surl) argument: {string}, it is a dbUrl/schema"
             + "\n2)The second(key) argument: {string}, contains an API key",
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
    spec    : "WOQLClient.updateSchema(schurl, docs, options)",
    descr   : "\n\nUpdates the Schema of the specified database"
                +"\n1)The first (surl) argument :{string}, is a dbUrl/schema"
                + "\n2)The second(docs) argument:{object}, is a valid owl ontology (new schema to be updated) in turtle format"
                + "\n3)The third (key) argument:{string}, contains an API key",
    result : "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args   : {document : 'doc'},
    options: { format: "turtle", editmode: "replace"}
  };
  sigs.createDocument = {
    spec   : "WOQLClient.createDocument(docurl, document, options)",
    descr  : "\n\nCreates a new document in the specified database"
              + "\n1)The first (docurl) argument: {string}, is a dbUrl/document/document_id"
              + "\n2)The second(document) argument: {object}, is a valid document in json-ld"
              + "\n3)The third (key) argument:{string}, contains an API key",
    result : "Created Document on success (HTTP 200), Violation Report Otherwise (HTTP 400+)",
    args   : {document_url : 'url', document: "doc"},
    options: { format: "turtle", fail_on_id_denied: false}
  };
  sigs.viewDocument = {
    spec    : "WOQLClient.getDocument(docurl, options)",
    descr   : "\n\nRetrieves a document from the specified database"
              + "\n1)The first (docurl) argument: {string}, is a dbUrl/document/document_id"
              + "\n2)The second (key) argument: {string}, contains an API key",
    result : "Document (HTTP 200), Violation Report Otherwise (HTTP 400+)",
    args   : {document_url : 'url'},
    options: { format: "turtle"}
  };
  sigs.updateDocument = {
    spec   : "WOQLClient.updateDocument(docurl, document, options)",
    descr  : "\n\nUpdates a document in the specified database with a new version"
                + "\n1)The first (docurl) argument: {string}, is a dbUrl/document/document_id"
                + "\n2)The second(document) argument: {object}, is a valid document in json-ld"
                + "\n3)The third (key) argument:{string} argument contains an API key",
    result : "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args   : {document_url : 'url', document: "doc"},
    options: { format: "turtle", editmode: "replace"}
  };
  sigs.deleteDocument = {
    spec  : "WOQLClient.deleteDocument(docurl, key)",
    descr : "\n\nDeletes a document from the specified database"
            + "\n1)The first (docurl) argument: {string},is a dbUrl/document/document_id"
            + "\n2)The second (key) argument: {string}, contains an API key",
    result: "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args  : {document_url : 'url'},
  };
  sigs.select = {
    spec: "WOQLClient.select(dburl, query, options)",
    descr: "\n\nExecutes a read-only WOQL query on the specified database and returns the results"
              + "\n1)The first (docurl) argument: {string}, is a terminusDB Url or a terminusDB Id"
              + "\n2)The second (query) argument: {object}, a valid query in json-ld format "
              + "\n3)The third (key) argument:{string}, contains an API key",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {woql: 'woql'},
  };
  sigs.update = {
    spec  : "WOQLClient.update(dburl, query, options)",
    descr : "\n\nExecutes a WOQL query on the specified database which updates the state and returns the results"
              + "\n1)The first (dburl) argument: {string}, is a terminusDB Url or a terminusDB Id"
              + "\n2)The second (query) argument: {object}, a valid query in json-ld format "
              + "\n3)The third (key) argument:{string}, contains an API key",
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

function getButton(text){
  var button = document.createElement('button');
  button.setAttribute('class', 'terminus-btn');
  button.setAttribute('value', text);
  button.appendChild(document.createTextNode(text));
  return button;
}

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
		HTMLHelper.removeChildren(cm);
	}
}

/* ui: terminus ui reference
   txt: text area to be stylized
   view: defines the size of editor to appear in pages (schema/ query)
   mode: format to be displayed in
*/
function stylizeEditor(ui, txt, view, mode){
  if(ui){
      var cmConfig = ui.pluginAvailable("codemirror");
      if(!(cmConfig)) return;
      var cm = new Codemirror(txt, mode, cmConfig);
  }
  else{
      var cm = new Codemirror(txt, mode, {});
  }
	var ar = cm.colorizeTextArea(view);
	cm.updateTextArea(ar);
}

/* ui: terminus ui reference
   txt: text area to be stylized
   dom: stylized pre area is appended to dom
   mode: format to be displayed in
*/
function stylizeCodeDisplay(ui, txt, dom, mode){
    if(ui){
        var cmConfig = ui.pluginAvailable("codemirror");
        if(!(cmConfig)) return false;
        var cm = new Codemirror(txt, mode, cmConfig);
    }
    else var cm = new Codemirror(txt, mode, {});
    var pr = cm.colorizePre();
    if(dom) dom.appendChild(pr);
    return true;
}

/* name: classname to find and remove classes from elements
*/
function removeSelectedNavClass(name){
    var el = document.getElementsByClassName(name);
    if (el.length < 1) return;
    for(var i=0; i<(el.length + 1); i++){
        el[i].classList.remove(name);
    }
}

function setSelectedSubMenu(a){
    removeSelectedNavClass("terminus-submenu-selected");
    a.classList.add("terminus-submenu-selected");
}

function setSelected(el, className){
    var par = el.parentElement;
    for(var i=0; i<par.childNodes.length; i++){
        if(par.childNodes[i].classList.contains(className))
            par.childNodes[i].classList.remove(className);
    }
    el.classList.add(className);
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
	//checkDocumentSubMenus(terminator);
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

function toggleVisibility(el){
	if(el.classList.contains('terminus-display')){
		el.classList.remove('terminus-display');
		el.classList.add('terminus-hide');
	}
    else if(el.classList.contains('terminus-hide')){
        el.classList.remove('terminus-hide');
		el.classList.add('terminus-display');
	}
}

function extractValueFromCell(cellValue){
    var ihtml = new DOMParser().parseFromString(cellValue, "text/xml");
    return ihtml.firstChild.innerHTML;
}

function displayDocumentSubMenus(ui) {
	//display submenus on click of documents
	if(ui.showControl("get_document")) {
		var gd = document.getElementsByClassName('terminus-get-doc');
		showSubMenus(gd[0]);
	}
	if(ui.showControl("create_document")) {
		var cd = document.getElementsByClassName('terminus-create-doc');
		showSubMenus(cd[0]);
	}
}

function checkForMandatoryId(){
    var objId = document.getElementsByClassName('terminus-object-id-input');
    if(objId.length>0){
        if(!objId[0].value){
            objId[0].setAttribute('placeholder', 'Required field');
            objId[0].style.background = '#f8d7da';
            return false;
        }
        else return true;
    }
}

function showSubMenus (el){
	el.classList.remove('terminus-hide');
	el.classList.add('terminus-display');
}

// function which generates query based on current settings from different screens of dashboard
function getCurrentWoqlQueryObject(query, settings){
	var qval;
    if(!query) query = settings.query;
	switch(query){
		case 'Show_All_Schema_Elements':
			qval = TerminusClient.WOQL.limit(settings.pageLength)
                        .start(settings.start)
                        .elementMetadata();
		break;
		case 'Show_All_Classes':
			qval = TerminusClient.WOQL.limit(settings.pageLength)
                        .start(settings.start)
                        .classMetadata();
		break;
		case 'Show_All_Data':
			qval = TerminusClient.WOQL.limit(settings.pageLength)
                        .start(settings.start)
                        .getEverything();
		break;
		case 'Show_All_Documents':
			qval = TerminusClient.WOQL.limit(settings.pageLength)
                        .start(settings.start)
                        .getAllDocuments();
		break;
        case 'Show_All_Document_classes':
            qval = TerminusClient.WOQL.limit(settings.pageLength)
                        .start(settings.start)
                        .documentMetadata();
        break;
        case 'Show_Document_Classes':
            qval = TerminusClient.WOQL.limit(settings.pageLength)
                        .start(settings.start).and(
                        TerminusClient.WOQL.quad("v:Element", "rdf:type", "owl:Class", "db:schema"),
                        TerminusClient.WOQL.abstract("v:Element"),
                        TerminusClient.WOQL.sub("v:Element", "tcs:Document"),
                        TerminusClient.WOQL.opt().quad("v:Element", "rdfs:label", "v:Label", "db:schema"),
                        TerminusClient.WOQL.opt().quad("v:Element", "rdfs:comment", "v:Comment", "db:schema"));
        break;
        case 'Show_All_Properties':
            qval = TerminusClient.WOQL.limit(settings.pageLength)
                        .start(settings.start)
                        .propertyMetadata();
        break;
		default:
			console.log('Invalid query ' + query + ' passed in WOQLTextboxGenerator');
		break;
	}
	return qval;
}

// removes spaces
function trimValue(text){
    (text).replace(/[\s\t\r\n\f]/g,'');
    return text;
}

// query string
function getqObjFromInput(q){
    const WOQL = TerminusClient.WOQL ;
    //var query = 'WOQL.' + q;
    var query = q;
    try {
        var qObj = eval(query);
        this.qObj = qObj;
        return qObj;
    }
    catch(e){
        console.log('Error in getting woql object ',e.toString());
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
               toggleVisibility,
               extractValueFromCell,
               displayDocumentSubMenus,
               setSelectedSubMenu,
               checkForMandatoryId,
               activateSelectedNav,
               getCurrentWoqlQueryObject,
               getButton,
               trimValue,
               setSelected,
               getqObjFromInput}
