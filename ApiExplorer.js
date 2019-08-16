/**
 * @file Javascript Api explorer tool
 * @author Kitty Jose
 * @license Copyright 2018-2019 Data Chemist Limited, All Rights Reserved. See LICENSE file for more
 *
 * @summary Displays a demo and description of api calls from WOQLCLient and what happenes under the hood of api calls
 */

 function ApiExplorer(){
   this.client = new WOQLClient();
 }

 ApiExplorer.prototype.draw = function(apiDom){
   return apiDom.appendChild(this.prettifyApiExplorer());
 }

// prettify schema api explorer - nav bar, alert msg, headers ...
ApiExplorer.prototype.prettifyApiExplorer = function(){
  // wrapper
  var wrap = document.createElement('div');
  wrap.setAttribute('class', 'terminus-wrapper terminus-wrapper-height');
  var cont = document.createElement('div');
  cont.setAttribute('class', 'container-fluid');
  wrap.appendChild(cont);
  var row = document.createElement('div');
  row.setAttribute('class', 'row-fluid');
  cont.appendChild(row);

  var body = document.createElement('div');
  body.setAttribute('class', 'terminus-module-body');
  row.appendChild(body);

  var nav = document.createElement('div');
  nav.setAttribute('class', 'span3');

  var api = document.createElement('div');
  api.setAttribute('class', 'terminus-module-body span9 terminus-module-body-white-bg');

  var msg = 'API Explorer helps to understand api calls in depth.'
              + ' User can perform actions and view what happens in the background.'
  var al = getInfoAlertDom('info', 'Info: ', msg);
  api.appendChild(al);

  // header
  api.appendChild(prettifyHeaderDom('Api Explorer'));

  // body
  var cont = document.createElement('div');
  cont.setAttribute('class', 'terminus-module-body');

  // list view of apis
  // connect to server api
  var ul = document.createElement('ul');
  ul.setAttribute('class',' terminus-widget-menu' );
  var li = document.createElement('li');
  li.setAttribute('class', 'active terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(cont);
    var apiCont = self.prettifyConnectExplorer(cont);
    api.appendChild(apiCont);
  })
  ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-link');
  a.appendChild(icon);
  var txt = document.createTextNode('Connect Api');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  nav.appendChild(ul);

  // database api
  var ul = document.createElement('ul');
  ul.setAttribute('class',' terminus-widget-menu');
  var li = document.createElement('li');
  li.setAttribute('class', 'active terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(cont);
    var apiCont = self.prettifyDatabaseExplorer(cont);
    api.appendChild(apiCont);
  })
  ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-database');
  a.appendChild(icon);
  var txt = document.createTextNode('Database Api');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  nav.appendChild(ul);

  // schema
  var li = document.createElement('li');
  li.setAttribute('class', 'active terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(cont);
    var apiCont = self.prettifySchemaApi(cont);
    api.appendChild(apiCont);
  })
  ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-cog');
  a.appendChild(icon);
  var txt = document.createTextNode('Schema Api');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  nav.appendChild(ul);

  // documents
  var li = document.createElement('li');
  li.setAttribute('class', 'active terminus-pointer');
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(cont);
    var apiCont = self.prettifyDocumentApi(cont);
    api.appendChild(apiCont);
  })
  ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-file');
  a.appendChild(icon);
  var txt = document.createTextNode('Document Api');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  nav.appendChild(ul);

  // query
  var li = document.createElement('li');
  li.setAttribute('class', 'active terminus-pointer');
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(cont);
    var apiCont = self.prettifyQueryApi(cont);
    api.appendChild(apiCont);
  })
  ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-search');
  a.appendChild(icon);
  var txt = document.createTextNode('Query Api');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  nav.appendChild(ul);

  body.appendChild(nav);

  var apiCont = self.prettifyConnectExplorer(cont);
  api.appendChild(apiCont);

  body.appendChild(api);
  return wrap;
} // prettifyApiExplorer

// prettify document api calls - on click of DocumentAPI nav bar
ApiExplorer.prototype.prettifyDocumentApi = function(cont){

  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');
  //view document
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyShowApiDom('viewDocument', body);
    cont.appendChild(dom);
  })
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-eye');
  a.appendChild(icon);
  var txt = document.createTextNode('View Document');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  //create document
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyShowApiDom('createDocument', body);
    cont.appendChild(dom);
  })
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-plus');
  a.appendChild(icon);
  var txt = document.createTextNode('Create Document');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  //update document
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyShowApiDom('updateDocument', body);
    cont.appendChild(dom);
  })
  //ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-arrow-up');
  a.appendChild(icon);
  var txt = document.createTextNode('Update Document');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  //delete document
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyShowApiDom('deleteDocument', body);
    cont.appendChild(dom);
  })
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-trash-alt');
  a.appendChild(icon);
  var txt = document.createTextNode('Delete Document');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);


  cont.appendChild(ul);

  var dom = self.prettifyShowApiDom('viewDocument', body);
  cont.appendChild(dom);

  return cont;
} // prettifyDocumentApi

// prettify query api calls - on click of QueryAPI nav bar - submenus of Query Api defined here
ApiExplorer.prototype.prettifyQueryApi  = function(cont){
  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');
  //woql select
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyQueryApiDom('select', body);
  })
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-mouse-pointer');
  a.appendChild(icon);
  var txt = document.createTextNode('Select');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  //update select
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyQueryApiDom('update', body);
    cont.appendChild(dom);
  })
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-arrow-up');
  a.appendChild(icon);
  var txt = document.createTextNode('Update');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  //mapping
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyQueryApiDom('lookup', body);
    cont.appendChild(dom);
  })
  //ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-random');
  a.appendChild(icon);
  var txt = document.createTextNode('Look up');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  cont.appendChild(ul);

  var dom = self.prettifyQueryApiDom('select', body);
  cont.appendChild(dom);

  return cont;
} //prettifyQueryApi

// prettify schema api calls - on click of SchemaAPI nav bar - submenus of schema Api defined here
ApiExplorer.prototype.prettifySchemaApi = function(cont){

  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');
  //get schema
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyShowApiDom('getSchema', body);
    cont.appendChild(dom);
  })
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-eye');
  a.appendChild(icon);
  var txt = document.createTextNode('View Schema');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  //update schema
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyShowApiDom('updateSchema', body);
    cont.appendChild(dom);
  })
  //ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-arrow-up');
  a.appendChild(icon);
  var txt = document.createTextNode('Update Schema');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  cont.appendChild(ul);

  var dom = self.prettifyShowApiDom('getSchema', body);
  cont.appendChild(dom);

  return cont;
} // prettifySchemaApi

// prettify connect to server api calls - on click of connectAPI nav bar
ApiExplorer.prototype.prettifyConnectExplorer = function(body){
  var self = this;

  var br = document.createElement('BR');
  body.appendChild(br);

  // get header signature
  body.appendChild(prettifyHeaderDom('Signature'));
  var br = document.createElement('BR');
  body.appendChild(br);

  // get signature
  var b = this.prettifySignature('connect');
  body.appendChild(b);
  var br = document.createElement('BR');
  body.appendChild(br);

  // get header Parameter
  body.appendChild(prettifyHeaderDom('Parameters'));

  var br = document.createElement('BR');
  body.appendChild(br);

  //form to get server url
  var form = this.prettifyServerForm();

  body.appendChild(form);
  return body;

} // prettifyConnectExplorer

//prettify create & delete db form
ApiExplorer.prototype.prettifyServerForm = function(){
  // form
  var form = document.createElement('form');
  form.setAttribute('class', 'terminus-form-horizontal row-fluid');

  var fd = document.createElement('div');
  fd.setAttribute('class', 'terminus-control-group');
  form.appendChild(fd);
  var inpLabel = document.createElement('label');
  inpLabel.setAttribute('class', 'terminus-control-label');
  inpLabel.setAttribute('for', 'basicinput');
  inpLabel.innerHTML = 'Url:';
  fd.appendChild(inpLabel);
  var cd = document.createElement('div');
  cd.setAttribute('class', 'terminus-controls');
  fd.appendChild(cd);
  var inpId = document.createElement('input');
  inpId.setAttribute('type', 'text');
  inpId.setAttribute('id', 'basicinput');
  inpId.setAttribute('class', 'span8 terminus-input-text');
  inpId.setAttribute('placeholder', 'URL : server_url');
  if(this.val) inpId.value = this.val;
  cd.appendChild(inpId);
  var icon = document.createElement('i');
  icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
  cd.appendChild(icon);

  var fd = document.createElement('div');
  fd.setAttribute('class', 'terminus-control-group');
  form.appendChild(fd);
  var keyLabel = document.createElement('label');
  keyLabel.setAttribute('class', 'terminus-control-label');
  keyLabel.setAttribute('for', 'basicinput');
  keyLabel.innerHTML = 'Key:';
  fd.appendChild(keyLabel);
  var cd = document.createElement('div');
  cd.setAttribute('class', 'terminus-controls');
  fd.appendChild(cd);
  var key = document.createElement('input');
  key.setAttribute('type', 'text');
  key.setAttribute('id', 'basicinput');
  key.setAttribute('class', 'span8 terminus-input-text');
  key.setAttribute('placeholder', 'Key : key');
  if(this.val) key.value = this.val;
  cd.appendChild(key);

  var button = document.createElement('button');
  button.setAttribute('class', 'terminus-btn terminus-send-api-btn');
  button.setAttribute('type', 'button');
  button.innerHTML = 'Send Api';
  var gatherips = function(){
    var input = {};
    input.url = inpId.value;
    input.key = key.value;
    return input;
  }
  var resd = document.createElement('div');
  form.appendChild(button);
  form.appendChild(resd);
  var self = this;
  button.addEventListener("click", function(){
    var buttonSelf = this;
    opts = {};
    var input = gatherips();
    opts.explorer = true;
    self.client.connect(input.url, input.key)
    .then(function(response){
      FrameHelper.removeChildren(resd);
      //var currForm = buttonSelf.parentNode;
      var resultDom = showHttpResult(response, 'connect', resd);
    });
  }) // button click
  return form;
} // prettifyServerForm()

// prettify database api calls - on click of databaseAPI nav bar - submenus of database Api defined here
ApiExplorer.prototype.prettifyDatabaseExplorer = function(cont){

  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');
  //create db
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  var self = this;
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyDatabaseDom('create', body);
    cont.appendChild(dom);
  })
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-plus');
  a.appendChild(icon);
  var txt = document.createTextNode('Create database');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);

  //delete db
  var li = document.createElement('li');
  li.setAttribute('class', 'terminus-li-horizontal terminus-pointer');
  li.addEventListener("click", function(){
    FrameHelper.removeChildren(body);
    var dom = self.prettifyDatabaseDom('delete', body);
    cont.appendChild(dom);
  })
  //ul.appendChild(li);
  var a = document.createElement('a');
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-sub-menu-icon fa fa-trash-alt');
  a.appendChild(icon);
  var txt = document.createTextNode('Delete database');
  a.appendChild(txt);
  li.appendChild(a);
  var icon = document.createElement('i');
  ul.appendChild(li);
  cont.appendChild(ul);

  // landing page
  var dom = self.prettifyDatabaseDom('create', body);
  cont.appendChild(dom);

  return cont;
} // prettifyDatabaseExplorer

// prettify database dom
 ApiExplorer.prototype.prettifyDatabaseDom = function(mode, body){
  var self = this;

  var br = document.createElement('BR');
  body.appendChild(br);

  // get header signature
  body.appendChild(prettifyHeaderDom('Signature'));
  var br = document.createElement('BR');
  body.appendChild(br);

  // get signature
  var b = this.prettifySignature(mode);
  body.appendChild(b);
  var br = document.createElement('BR');
  body.appendChild(br);

  // get header Parameter
  body.appendChild(prettifyHeaderDom('Parameters'));

  var br = document.createElement('BR');
  body.appendChild(br);

  //form to get database id
  if(mode == 'create') var form = this.prettifyDBForm(mode);
  else var form = this.prettifyDBForm(mode);

  body.appendChild(form);
  return body;

}// prettifyDatabaseDom()

//prettify create & delete db form
ApiExplorer.prototype.prettifyDBForm = function(mode){
  // form
  var form = document.createElement('form');
  form.setAttribute('class', 'terminus-form-horizontal row-fluid');

  var fd = document.createElement('div');
  fd.setAttribute('class', 'terminus-control-group');
  form.appendChild(fd);
  var inpLabel = document.createElement('label');
  inpLabel.setAttribute('class', 'terminus-control-label');
  inpLabel.setAttribute('for', 'basicinput');
  inpLabel.innerHTML = 'Url:';
  fd.appendChild(inpLabel);
  var cd = document.createElement('div');
  cd.setAttribute('class', 'terminus-controls');
  fd.appendChild(cd);
  var inpId = document.createElement('input');
  inpId.setAttribute('type', 'text');
  inpId.setAttribute('id', 'basicinput');
  inpId.setAttribute('class', 'span8 terminus-input-text');
  inpId.setAttribute('placeholder', 'URL : server/database_id');
  if(this.val) inpId.value = this.val;
  cd.appendChild(inpId);
  var icon = document.createElement('i');
  icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
  cd.appendChild(icon);

  if(mode == 'create'){
    var fd = document.createElement('div');
    fd.setAttribute('class', 'terminus-control-group');
    form.appendChild(fd);
    var inpLabel = document.createElement('label');
    inpLabel.setAttribute('class', 'terminus-control-label');
    inpLabel.setAttribute('for', 'basicinput');
    inpLabel.innerHTML = 'Title:';
    fd.appendChild(inpLabel);
    var cd = document.createElement('div');
    cd.setAttribute('class', 'terminus-controls');
    fd.appendChild(cd);
    var inpTit = document.createElement('input');
    inpTit.setAttribute('type', 'text');
    inpTit.setAttribute('id', 'basicinput');
    inpTit.setAttribute('class', 'span8 terminus-input-text');
    inpTit.setAttribute('placeholder', 'database title');
    cd.appendChild(inpTit);
    var icon = document.createElement('i');
    icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
    cd.appendChild(icon);
  } // if(mode == 'create')

  var fd = document.createElement('div');
  fd.setAttribute('class', 'terminus-control-group');
  form.appendChild(fd);
  var keyLabel = document.createElement('label');
  keyLabel.setAttribute('class', 'terminus-control-label');
  keyLabel.setAttribute('for', 'basicinput');
  keyLabel.innerHTML = 'Key:';
  fd.appendChild(keyLabel);
  var cd = document.createElement('div');
  cd.setAttribute('class', 'terminus-controls');
  fd.appendChild(cd);
  var inpKey = document.createElement('input');
  inpKey.setAttribute('type', 'text');
  inpKey.setAttribute('id', 'basicinput');
  inpKey.setAttribute('class', 'span8 terminus-input-text');
  inpKey.setAttribute('placeholder', 'key');
  cd.appendChild(inpKey);

  var button = document.createElement('button');
  button.setAttribute('class', 'terminus-btn terminus-send-api-btn');
  button.setAttribute('type', 'button');
  button.innerHTML = 'Send Api';
  var gatherips = function(){
    var input = {};
    input.id = inpId.value;
    input.title = inpTit.value;
    return input;
  }
  var self = this;
  if(mode == 'create'){
    button.addEventListener("click", function(form){
      var input = gatherips();
      var buttonSelf = this;
      opts = {};
      opts.explorer = true;
      opts.title = input.title;
      self.client.createDatabase(input.id, opts, '')
      .then(function(response){
        var currForm = buttonSelf.parentNode;
        var resultDom = showHttpResult(response, 'create', currForm);
      });
    }) // button click
  } // if(mode == 'create')
  else{
    button.addEventListener("click", function(){
      var buttonSelf = this;
      opts = {};
      opts.explorer = true;
      self.client.deleteDatabase(inpId.value, opts)
      .then(function(response){
        var currForm = buttonSelf.parentNode;
        var resultDom = showHttpResult(response, 'delete', currForm);
      });
    }) // button click
  } // if(mode == 'delete')
  form.appendChild(button);
  return form;
} // prettifyDBForm()

// prettify query api dom
ApiExplorer.prototype.prettifyQueryApiDom = function(action, body){

  var br = document.createElement('BR');
  body.appendChild(br);
  // get header signature
  body.appendChild(prettifyHeaderDom('Signature'));
  var br = document.createElement('BR');
  body.appendChild(br);

 // signature
  var b = this.prettifySignature(action);
  body.appendChild(b);
  var br = document.createElement('BR');
  body.appendChild(br);
  // get header Parameter
  body.appendChild(prettifyHeaderDom('Parameters'));
  var br = document.createElement('BR');
  body.appendChild(br);

  var form = document.createElement('form');
  form.setAttribute('class', 'terminus-form-horizontal row-fluid');

  var fd = document.createElement('div');
  fd.setAttribute('class', 'terminus-control-group');
  form.appendChild(fd);
  var inpLabel = document.createElement('label');
  inpLabel.setAttribute('class', 'terminus-control-label');
  inpLabel.setAttribute('for', 'basicinput');
  inpLabel.innerHTML = 'Url:';
  fd.appendChild(inpLabel);
  var cd = document.createElement('div');
  cd.setAttribute('class', 'terminus-controls');
  fd.appendChild(cd);
  var inpId = document.createElement('input');
  inpId.setAttribute('type', 'text');
  inpId.setAttribute('id', 'basicinput');
  inpId.setAttribute('class', 'span8 terminus-input-text');
  inpId.setAttribute('placeholder', 'URL : server/database_id');
  if (this.value) inpId.value = this.val;
  cd.appendChild(inpId);
  var icon = document.createElement('i');
  icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
  cd.appendChild(icon);
  fd.appendChild(cd);

  var fd = document.createElement('div');
  fd.setAttribute('class', 'terminus-control-group');
  form.appendChild(fd);
  var inpLabel = document.createElement('label');
  inpLabel.setAttribute('class', 'terminus-control-label');
  inpLabel.setAttribute('for', 'basicinput');
  inpLabel.innerHTML = 'Query:';
  fd.appendChild(inpLabel);
  var cd = document.createElement('div');
  cd.setAttribute('class', 'terminus-controls');
  fd.appendChild(cd);
  var txtar = document.createElement('textarea');
  if(this.value) txtar.value = this.val;
  cd.appendChild(txtar);
  txtar.setAttribute('class', 'terminus-api-explorer-text-area');
  cd.appendChild(txtar);
  fd.appendChild(cd);

  var editor = codeMirrorFormat(txtar, 'turtle', true) ;
  editor.save();
  setTimeout(function() {
      editor.refresh();
  },1);
  // save changes of code mirror editor
  function updateTextArea() {
    editor.save();
    var currQuery = editor.getValue();
  }
  editor.on('change', updateTextArea);

  var br = document.createElement('BR');
  fd.appendChild(br);

  var button = document.createElement('button');
  button.setAttribute('class', 'terminus-btn terminus-send-api-btn');
  button.setAttribute('type', 'button');
  button.innerHTML = 'Send Api';
  var self = this;
  button.addEventListener("click", function(){
    var buttonSelf = this;
    var opts = {};
    opts.explorer = true;
    self.client.select(inpId.value, txtar.value, opts)
    .then(function(response){
      var currForm = buttonSelf.parentNode;
      var resultDom = showHttpResult(response, 'select', currForm);
    });
  }) // button click
  fd.appendChild(button);
  body.appendChild(form);
  return body;
} // prettifyQueryApiDom

// prettify schema & document dom
 ApiExplorer.prototype.prettifyShowApiDom = function(action, body){
   var self = this;

   var br = document.createElement('BR');
   body.appendChild(br);

   // get header signature
   body.appendChild(prettifyHeaderDom('Signature'));
   var br = document.createElement('BR');
   body.appendChild(br);

  // signature
   var b = this.prettifySignature(action);
   body.appendChild(b);
   var br = document.createElement('BR');
   body.appendChild(br);
   // get header Parameter
   body.appendChild(prettifyHeaderDom('Parameters'));
   var br = document.createElement('BR');
   body.appendChild(br);

   // get input
   switch(action){
     case 'getSchema':
       // form to input schema url
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Url:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpId = document.createElement('input');
       inpId.setAttribute('type', 'text');
       inpId.setAttribute('id', 'basicinput');
       inpId.setAttribute('class', 'span8 terminus-input-text');
       inpId.setAttribute('placeholder', 'URL : server/database_id');
       cd.appendChild(inpId);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       body.appendChild(formDoc);

       //form to get schema
       var form = this.prettifyApiForm(action, inpId);
       body.appendChild(form);
     break;
     case 'updateSchema':
       // form to input schema url
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Url:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpId = document.createElement('input');
       inpId.setAttribute('type', 'text');
       inpId.setAttribute('id', 'basicinput');
       inpId.setAttribute('class', 'span8 terminus-input-text');
       inpId.setAttribute('placeholder', 'URL : server/database_id');
       cd.appendChild(inpId);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       body.appendChild(formDoc);

       var br = document.createElement('BR');
       body.appendChild(br);

       // text area
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Schema:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var txtar = document.createElement('textarea');
       cd.appendChild(txtar);
       txtar.setAttribute('class', 'terminus-api-explorer-text-area');
       var editor = codeMirrorFormat(txtar, 'turtle', true);
       // refresh load
       setTimeout(function() {
           editor.refresh();
       },1);
       // save changes of code mirror editor
       function updateTextArea() {
         editor.save();
       }
       editor.on('change', updateTextArea);
        body.appendChild(formDoc);

        var br = document.createElement('BR');
        body.appendChild(br);

        // gather the dom objects
        var gatherips = {};
        gatherips.schemaUrlDom =  inpId;
        gatherips.schemaTextDom =  txtar;
        gatherips.htmlEditor =  editor;

        //form to update schema
        var form = this.prettifyApiForm(action, gatherips);
        body.appendChild(form);
     break;
     case 'viewDocument':
       // form
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Url:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpId = document.createElement('input');
       inpId.setAttribute('type', 'text');
       inpId.setAttribute('id', 'basicinput');
       inpId.setAttribute('class', 'span8 terminus-input-text');
       inpId.setAttribute('placeholder', 'URL : server/database_id/document/document_id');
       cd.appendChild(inpId);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       body.appendChild(formDoc);

       var form = this.prettifyApiForm(action, inpId);

       body.appendChild(form);

     break;//viewDocument
     case 'deleteDocument':
       // form
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Url:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpId = document.createElement('input');
       inpId.setAttribute('type', 'text');
       inpId.setAttribute('id', 'basicinput');
       inpId.setAttribute('class', 'span8 terminus-input-text');
       inpId.setAttribute('placeholder', 'URL : server/database_id/document/document_id');
       cd.appendChild(inpId);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       body.appendChild(formDoc);

       var form = this.prettifyApiForm(action, inpId);

       body.appendChild(form);
     break;
     case 'createDocument':
       // form to input schema url
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Url:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpId = document.createElement('input');
       inpId.setAttribute('type', 'text');
       inpId.setAttribute('id', 'basicinput');
       inpId.setAttribute('class', 'span8 terminus-input-text');
       inpId.setAttribute('placeholder', 'URL : server/database_id/document/document_id');
       cd.appendChild(inpId);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       body.appendChild(formDoc);

       var br = document.createElement('BR');
       body.appendChild(br);

       // text area
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Document:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var txtar = document.createElement('textarea');
       cd.appendChild(txtar);
       txtar.setAttribute('class', 'terminus-api-explorer-text-area');

       var editor = codeMirrorFormat(txtar, 'javascript', true);
       // refresh load
       setTimeout(function() {
           editor.refresh();
       },1);
       // save changes of code mirror editor
       function updateTextArea() {
         editor.save();
       }
       editor.on('change', updateTextArea);

        body.appendChild(formDoc);

        var br = document.createElement('BR');
        body.appendChild(br);

        // gather the dom objects
        var gatherips = {};
        gatherips.schemaUrlDom =  inpId;
        gatherips.schemaTextDom =  txtar;
        gatherips.htmlEditor =  editor;

        //form to update schema
        var form = this.prettifyApiForm(action, gatherips);
        body.appendChild(form);

     break;
     case 'updateDocument':
       // form to input schema url
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Url:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpId = document.createElement('input');
       inpId.setAttribute('type', 'text');
       inpId.setAttribute('id', 'basicinput');
       inpId.setAttribute('class', 'span8 terminus-input-text');
       inpId.setAttribute('placeholder', 'URL : server/database_id/document/document_id');
       cd.appendChild(inpId);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       body.appendChild(formDoc);

       var br = document.createElement('BR');
       body.appendChild(br);

       // text area
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var inpLabel = document.createElement('label');
       inpLabel.setAttribute('class', 'terminus-control-label');
       inpLabel.setAttribute('for', 'basicinput');
       inpLabel.innerHTML = 'Document:';
       fd.appendChild(inpLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var txtar = document.createElement('textarea');
       cd.appendChild(txtar);
       txtar.setAttribute('class', 'terminus-api-explorer-text-area');

       var editor = codeMirrorFormat(txtar, 'javascript', true);
       // refresh load
       setTimeout(function() {
           editor.refresh();
       },1);
       // save changes of code mirror editor
       function updateTextArea() {
         editor.save();
       }
       editor.on('change', updateTextArea);

        body.appendChild(formDoc);

        var br = document.createElement('BR');
        body.appendChild(br);

        // gather the dom objects
        var gatherips = {};
        gatherips.schemaUrlDom =  inpId;
        gatherips.schemaTextDom =  txtar;
        gatherips.htmlEditor =  editor;

        //form to update schema
        var form = this.prettifyApiForm(action, gatherips);
        body.appendChild(form);

     break;
   }// switch(action)

   return body;
 } // prettifyShowApiDom()

// define event listeners on send api of schema & documents
ApiExplorer.prototype.prettifyApiForm = function(action, input){
  // form
  var form = document.createElement('form');
  form.setAttribute('class', 'terminus-form-horizontal row-fluid');

  var button = document.createElement('button');
  button.setAttribute('class', 'terminus-btn terminus-send-api-btn');
  button.setAttribute('type', 'button');
  button.innerHTML = 'Send Api';
  form.appendChild(button);
  var resd = document.createElement('div');
  form.appendChild(resd);
  var self = this;
  switch(action){
    case 'getSchema':
      button.addEventListener("click", function(){
        var schurl = input.value;
        var buttonSelf = this;
        var opts = {};
        opts.explorer = true;
        opts.format = 'turtle';
        opts.responseType = 'text';
        self.client.getSchema(schurl, opts)
        .then(function(response){
          FrameHelper.removeChildren(resd);
          var resultDom = showHttpResult(response, 'getSchema', resd);
        });
      }) // button click
    break;
    case 'updateSchema':
      button.addEventListener("click", function(){
        var schurl = input.schemaUrlDom.value;
        var payload = input.htmlEditor.getValue();
        var buttonSelf = this;
        opts = {};
        opts.explorer = true;
        opts.format = 'turtle';
        self.client.updateSchema(schurl, payload, opts)
        .then(function(response){
          var gtxtar = document.createElement('textarea');
          gtxtar.setAttribute('readonly', true);
          gtxtar.innerHTML = response;
          var currForm = buttonSelf.parentNode;
          currForm.appendChild(gtxtar);

          var editor = codeMirrorFormat(gtxtar, 'turtle', true) ;
          editor.save();
          setTimeout(function() {
              editor.refresh();
          },1);
          // save changes of code mirror editor
          function updateTextArea() {
            editor.save();
          }
          editor.on('change', updateTextArea);
        });
      }) // button click
    break;
    case 'viewDocument':
      button.addEventListener("click", function(){
      var dcurl = input.value;
      var buttonSelf = this;
      var opts = {};
      opts.explorer = true;
      opts.format = 'turtle';
      self.client.getDocument(dcurl, opts)
      .then(function(response){
        FrameHelper.removeChildren(resd);
        var resultDom = showHttpResult(response, action, resd);
      });
    }) // button click
    break;
    case 'deleteDocument':
      button.addEventListener("click", function(){
      var dcurl = input.value;
      var buttonSelf = this;
      var opts = {};
      opts.explorer = true;
      self.client.deleteDocument(dcurl, opts)
      .then(function(response){
        FrameHelper.removeChildren(resd);
        var resultDom = showHttpResult(response, action, resd);
      });
    }) // button click
    break;
    case 'createDocument':
      button.addEventListener("click", function(){
        var dcurl = input.schemaUrlDom.value;
        var payload = input.htmlEditor.getValue();
        var buttonSelf = this;
        opts = {};
        opts.explorer = true;
        self.client.createDocument(dcurl, payload, opts)
        .then(function(response){
          FrameHelper.removeChildren(resd);
          var resultDom = showHttpResult(response, action, resd);
        });
      }) // button click
    break;
    case 'updateDocument':
      button.addEventListener("click", function(){
        var dcurl = input.schemaUrlDom.value;
        var payload = input.htmlEditor.getValue();
        var buttonSelf = this;
        opts = {};
        opts.explorer = true;
        opts.editmode = 'replace';
        opts.format = 'json';
        self.client.updateDocument(dcurl, payload, opts)
        .then(function(response){
          FrameHelper.removeChildren(resd);
          var resultDom = showHttpResult(response, action, resd);
        });
      }) // button click
    break;
  } // switch(action)

  var br = document.createElement('BR');
  form.appendChild(br);
  var br = document.createElement('BR');
  form.appendChild(br);

  return form;
} // prettifyApiForm()

// prettify signature of api calls
ApiExplorer.prototype.prettifySignature = function(action){
  var d = document.createElement('div');
  var sig = getFunctionSignature(action);
  var txt = document.createTextNode(sig.spec);
  var pre = document.createElement('pre');
  pre.setAttribute('class', 'terminus-api-signature-pre');
  pre.appendChild(txt);
  var txt =  document.createTextNode(sig.descr);
  pre.appendChild(txt);
  var br = document.createElement('BR');
  pre.appendChild(br);
  var br = document.createElement('BR');
  pre.appendChild(br);
  var txt = document.createTextNode(sig.result);
  pre.appendChild(txt);
  d.appendChild(pre);
  prettyPrint() ;
  /*$.getScript("assets/js/prettify.js", function(){
    prettyPrint() ;
  });*/
  return d;
} // prettifySignature()
