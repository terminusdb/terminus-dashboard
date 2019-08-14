/**
 * @file Javascript Api explorer tool
 * @author Kitty Jose
 * @license Copyright 2018-2019 Data Chemist Limited, All Rights Reserved. See LICENSE file for more
 *
 * @summary Set of functions used across scripts
 */

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
  sigs.create = {
    spec: "WOQLClient.createDatabase(database_id, options)",
    result: "HTTP 200 on success, 409 for already existing database, otherwise error code",
    args: {database_url : 'url'},
    options: { title: "" }
  };
  sigs.delete = {
      spec: "WOQLClient.deleteDatabase(options)",
      result: "HTTP 200 on success, otherwise error code",
  };
  sigs.getSchema = {
    spec: "WOQLClient.getSchema(schema_url, options)",
    result: "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    options: { format: "turtle" }
  };
  sigs.updateSchema = {
    spec: "WOQLClient.updateSchema(schema_url, schema, options)",
    result: "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args: {document : 'doc'},
    options: { format: "turtle", editmode: "replace"}
  };
  sigs.createDocument = {
    spec: "WOQLClient.createDocument(document_url, document, options)",
    result: "Created Document on success (HTTP 200), Violation Report Otherwise (HTTP 400+)",
    args: {document_url : 'url', document: "doc"},
    options: { format: "turtle", fail_on_id_denied: false}
  };
  sigs.viewDocument = {
    spec: "WOQLClient.viewDocument(document_url, options)",
    result: "Document (HTTP 200), Violation Report Otherwise (HTTP 400+)",
    args: {document_url : 'url'},
    options: { format: "turtle"}
  };
  sigs.updateDocument = {
    spec: "WOQLClient.updateDocument(document_url, document, options)",
    result: "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args: {document_url : 'url', document: "doc"},
    options: { format: "turtle", editmode: "replace"}
  };
  sigs.deleteDocument = {
    spec: "WOQLClient.deleteDocument(document_url, options)",
    result: "Ontology Document on success (HTTP 200), 409 for already existing database, otherwise error code",
    args: {document_url : 'url'},
  };
  sigs.select = {
    spec: "WOQLClient.select(database_url, woql, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {woql: 'woql'},
  };
  sigs.update = {
    spec: "WOQLClient.update(database_url, woql, options)",
    result: "WOQL Result (HTTP 200), otherwise error code",
    args: {woql: 'woql'},
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

/*
txtar    : editor is attached to textar
mode     : format for highlighting, ex: json, html etc.
editable : readOnly false/ nocursor is special value in code editor to set readonly true */
function codeMirrorFormat(txtar, mode, editable){
  console.log('editable', editable);
  //initize auto complete
  CodeMirror.commands.autocomplete = function(cm) {
    cm.showHint({hint: CodeMirror.hint.anyword});
  }

  // initialise code editor on text area
  var htmlEditor = CodeMirror.fromTextArea(txtar, {
    mode                : mode,
    firstLineNumber     : 1,
    lineNumbers         : false,
    lineWrapping        : true,
    smartIndent         : true,
    indentWithTabs      : true,
    newlineAndIndent    : true,
    styleActiveLine     : { nonEmpty: true },
    matchBrackets       : true,
    matchTags           : { bothTags: true },
    findMatchingBrackets: true,
    extraKeys           : { "Ctrl-J": "toMatchingTag", "Ctrl-F": "find", "Tab": "autocomplete" },
    refresh             : true
    //readOnly            : editable
   });

   return htmlEditor;
} // codeMirrorFormat()

// returns dom element for header text
function prettifyHeaderDom(text){
  var hd = document.createElement('div');
  hd.setAttribute('class', 'module-head');
  var h = document.createElement('h3');
  h.innerHTML = text;
  hd.appendChild(h);
  return hd;
} // prettifyHeaderTextDom

// returns dom for alert banner
function getInfoAlertDom(type, label, msg){
  var ald = document.createElement('div');
  if(type == 'info') ald.setAttribute('class', 'alert alert-success');
  else ald.setAttribute('class', 'alert');
  var str = document.createElement('STRONG');
  str.innerHTML = label;
  ald.appendChild(str);
  var txt = document.createTextNode(msg);
  ald.appendChild(txt);
  var button = document.createElement('button');
  button.setAttribute('class','close');
  button.setAttribute('data-dismiss','alert');
  button.setAttribute('type', 'button');
  button.innerHTML = 'x';
  ald.appendChild(button);
  return ald;
} // getInfoAlertDom()

// formats response results from platform 
function prettifyResponse(currForm, action, data){

  var rd = document.createElement('div');
  // get header result
  rd.appendChild(prettifyHeaderDom('Result'));
  var br = document.createElement('BR');
  rd.appendChild(br);

  // setting default values
  var editable = true, mode = 'javascript', txt; // variable to set editor editable/ non editable

  switch(action){
    case 'createDatabase':
      txt = document.createTextNode(data);
      mode = 'text'; // turtle format
      editable = 'noncursor'; // non editable
    break;
    case 'getSchema':
      txt = document.createTextNode(data.contents);
      mode = 'turtle'; // turtle format
      editable = 'noncursor'; // non editable
    break;
    case 'updateSchema':
      txt = document.createTextNode(data.contents);
      mode = 'turtle'; // turtle format
      editable = 'noncursor'; // non editable
    break;
    case 'viewDocument':
      txt = document.createTextNode(data);
      mode = 'turtle'; // turtle format
      editable = 'noncursor'; // non editable
    break;
    case 'createDocument':
      txt = document.createTextNode(data);
      mode = 'turtle'; // turtle format
      editable = true; // editable
    break;
    case 'updateDocument':
      txt = document.createTextNode(data);
      mode = 'turtle'; // turtle format
      editable = true; // editable
    break;
    case 'select':
      txt = document.createTextNode(data);
      mode = 'javascript'; // turtle format
      editable = 'noncursor'; // editable
    break;
    case 'deleteDocument':
      txt = document.createTextNode(data);
      mode = 'javascript'; // turtle format
      editable = 'noncursor'; // editable
    break;
    case 'delete':
      // response is text
      txt = document.createTextNode(data);
      mode = 'html'; // text format
      editable = 'noncursor'; // non editable
    break;
  }
  var textarea = document.createElement('textarea');
  //var decodedTxt = jQuery(textarea).html(data).text();
  textarea.value = data;
  rd.appendChild(textarea);
  var editor = codeMirrorFormat(textarea, mode, editable);
  // refresh load
  setTimeout(function() {
      editor.refresh();
  },1);
  // save changes of code mirror editor
  function updateTextArea() {
    editor.save();
  }
  editor.on('change', updateTextArea);

  var br = document.createElement('BR');
  rd.appendChild(br);

  currForm.appendChild(rd);

  return currForm;
} // processResponseThen

// formats the response from fetch call and spits out Http header and result
function showHttpResult(response, action, currForm){
    //var currForm = document.createElement('div');

    var br = document.createElement('BR');
    currForm.appendChild(br);
    var br = document.createElement('BR');
    currForm.appendChild(br);

    // get header result
    currForm.appendChild(prettifyHeaderDom('HTTP Header'));

    var br = document.createElement('BR');
    currForm.appendChild(br);

     var retHttpHeaders  = '';

     // iterate over all headers
     for (let [key, value] of response.headers) {
       retHttpHeaders = retHttpHeaders +  `${key} = ${value}` + '\n';
       //alert( `${key} = ${value}`);
     }

    // http header result
    var hdres = document.createElement('pre');
    hdres.setAttribute('class', 'prettyprint');
    hdres.setAttribute('style', 'font-size: 18px;padding: 15px;');
    var txt = document.createTextNode(retHttpHeaders);
    hdres.appendChild(txt);
    currForm.appendChild(hdres);

    $.getScript("assets/js/prettify.js", function(){
      prettyPrint() ;
    });

    return response.text()
    .then(function(response){
      prettifyResponse(currForm, action, response); // get return response
    })

} // showHttpResult()
