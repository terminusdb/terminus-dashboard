/**
 * @file Javascript Api explorer tool
 * @author Kitty Jose
 * @license Copyright 2018-2019 Data Chemist Limited, All Rights Reserved. See LICENSE file for more
 *
 * @summary Displays a demo and description of api calls from WOQLCLient and what happens under the hood of api calls
 */
const FrameHelper = require('./FrameHelper');
const TerminusPluginManager = require('./plugins/TerminusPlugin');
const UTILS= require('./Utils')

 function ApiExplorer(ui){
    this.ui = ui;
    this.viewer = ui.main;
    this.client = new TerminusDB.WOQLClient();
    this.client.use_fetch = true;
    this.client.return_full_response = true;
    this.pman = new TerminusPluginManager();
 }


// Controller provides access to the Api explorer functions
ApiExplorer.prototype.getAsDOM = function(){
 	var aec = document.createElement("div");
    aec.setAttribute("class", "terminus-db-controller");
    if(this.ui){
       this.getApiNav(aec, this.viewer);
    } // if this.ui
    return aec;
 }

// gets api nav bar
ApiExplorer.prototype.getApiNav = function(navDom, viewer){
    // list view of apis
    var nav = document.createElement('div');
    navDom.appendChild(nav);

    // connect to server api
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'terminus-ul');
    nav.appendChild(ul);

    // connect api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-selected terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        UTILS.removeSelectedNavClass("terminus-selected");
        this.classList.add("terminus-selected");
        self.getApiExplorerDom('connect', viewer);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-link');
    a.appendChild(icon);
    var txt = document.createTextNode('Connect Server Api');
    a.appendChild(txt);
    ul.appendChild(a);

    // database api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        UTILS.removeSelectedNavClass("terminus-selected");
        this.classList.add("terminus-selected");
        self.getApiExplorerDom('create', viewer);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-database');
    a.appendChild(icon);
    var txt = document.createTextNode('Database Api');
    a.appendChild(txt);
    ul.appendChild(a);

    // schema api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        UTILS.removeSelectedNavClass("terminus-selected");
        this.classList.add("terminus-selected");
        self.getApiExplorerDom('schema', viewer);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-cog');
    a.appendChild(icon);
    var txt = document.createTextNode('Schema Api');
    a.appendChild(txt);
    ul.appendChild(a);

    // documents api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        UTILS.removeSelectedNavClass("terminus-selected");
        this.classList.add("terminus-selected");
        self.getApiExplorerDom('document', viewer);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-file');
    a.appendChild(icon);
    var txt = document.createTextNode('Document Api');
    a.appendChild(txt);
    ul.appendChild(a);

    // query api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        UTILS.removeSelectedNavClass("terminus-selected");
        this.classList.add("terminus-selected");
        self.getApiExplorerDom('query', viewer);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-search');
    a.appendChild(icon);
    var txt = document.createTextNode('Query Api');
    a.appendChild(txt);
    ul.appendChild(a);

    this.getApiExplorerDom('connect', viewer);

    return navDom;
} // getApiNav()

// get schema api explorer - nav bar, alert msg, headers ...
ApiExplorer.prototype.getApiExplorerDom = function(view, viewer){

  // clear of viewer
  FrameHelper.removeChildren(viewer);

  // wrapper
  var wrap = document.createElement('div');
  //wrap.setAttribute('class', 'terminus-wrapper terminus-wrapper-height');
  viewer.appendChild(wrap);
  var cont = document.createElement('div');
  cont.setAttribute('class', 'container-fluid');
  wrap.appendChild(cont);
  var row = document.createElement('div');
  row.setAttribute('class', 'row-fluid');
  cont.appendChild(row);

  var body = document.createElement('div');
  body.setAttribute('class', 'terminus-module-body');
  row.appendChild(body);

  var api = document.createElement('div');
  api.setAttribute('class', 'terminus-module-body span9 terminus-module-body-white-bg terminus-module-body-width');

  body.appendChild(api);

  var msg = 'API Explorer helps to understand api calls in depth.'
              + ' User can perform actions and view what happens in the background.'
  var al = UTILS.getInfoAlertDom('info', 'Info: ', msg);
  api.appendChild(al);

  // header
  api.appendChild(UTILS.getHeaderDom('Api Explorer'));

  // body
  var cont = document.createElement('div');
  //cont.setAttribute('class', 'terminus-module-body');

  var self = this;
  switch(view){
    case 'connect':
      var apiCont = self.getConnectExplorer(cont);
      api.appendChild(apiCont);
    break;
    case 'create':
      var apiCont = self.getDatabaseExplorer(cont);
      api.appendChild(apiCont);
    break;
    case 'schema':
      var apiCont = self.getSchemaApi(cont);
      api.appendChild(apiCont);
    break;
    case 'document':
      var apiCont = self.getDocumentApi(cont);
      api.appendChild(apiCont);
    break;
    case 'query':
      var apiCont = self.getQueryApi(cont);
      api.appendChild(apiCont);
    break;

  }// switch(api)

  return wrap;
} // getApiExplorerDom

ApiExplorer.prototype.setSelectedNavMenu = function(a){
    UTILS.removeSelectedNavClass("terminus-selected");
    a.classList.add("terminus-selected");
}

ApiExplorer.prototype.setSelectedSubMenu = function(a){
    UTILS.removeSelectedNavClass("terminus-submenu-selected");
    a.classList.add("terminus-submenu-selected");
}

// on trigger of click event - change dom
ApiExplorer.prototype.changeApiDom = function(action, cont, body){
    FrameHelper.removeChildren(body);
    var dom = this.getShowApiDom(action, body);
    cont.appendChild(dom);
}

// get document api calls - on click of DocumentAPI nav bar
ApiExplorer.prototype.getDocumentApi = function(cont){

  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');

  // view document api
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-submenu-selected terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedNavMenu(this);
      self.changeApiDom('viewDocument', cont, body);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-eye');
  a.appendChild(icon);
  var txt = document.createTextNode('View Document');
  a.appendChild(txt);
  ul.appendChild(a);

  // create document api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        self.setSelectedNavMenu(this);
        self.changeApiDom('createDocument', cont, body);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-plus');
    a.appendChild(icon);
    var txt = document.createTextNode('Create Document');
    a.appendChild(txt);
    ul.appendChild(a);

    // update document api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        self.setSelectedNavMenu(this);
        self.changeApiDom('updateDocument', cont, body);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-arrow-up');
    a.appendChild(icon);
    var txt = document.createTextNode('Update Document');
    a.appendChild(txt);
    ul.appendChild(a);

    // delete document api
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        self.setSelectedNavMenu(this);
        self.changeApiDom('deleteDocument', cont, body);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-trash-alt');
    a.appendChild(icon);
    var txt = document.createTextNode('Delete Document');
    a.appendChild(txt);
    ul.appendChild(a);

    cont.appendChild(ul);

    var dom = self.getShowApiDom('viewDocument', body);
    cont.appendChild(dom);

    return cont;
} // getDocumentApi

// get query api calls - on click of QueryAPI nav bar - submenus of Query Api defined here
ApiExplorer.prototype.getQueryApi  = function(cont){
  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');

  //woql select
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-submenu-selected terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      FrameHelper.removeChildren(body);
      var dom = self.getQueryApiDom('select', body);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-mouse-pointer');
  a.appendChild(icon);
  var txt = document.createTextNode('Select');
  a.appendChild(txt);
  ul.appendChild(a);

  //update select
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      FrameHelper.removeChildren(body);
      var dom = self.getQueryApiDom('update', body);
      cont.appendChild(dom);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-arrow-up');
  a.appendChild(icon);
  var txt = document.createTextNode('Update');
  a.appendChild(txt);
  ul.appendChild(a);

  //mapping
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      FrameHelper.removeChildren(body);
      var dom = self.getQueryApiDom('lookup', body);
      cont.appendChild(dom);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-random');
  a.appendChild(icon);
  var txt = document.createTextNode('Look up');
  a.appendChild(txt);
  ul.appendChild(a);

  cont.appendChild(ul);

  var dom = self.getQueryApiDom('select', body);
  cont.appendChild(dom);

  return cont;
} //getQueryApi

// get schema api calls - on click of SchemaAPI nav bar - submenus of schema Api defined here
ApiExplorer.prototype.getSchemaApi = function(cont){

  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');

  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');

  //get schema
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-submenu-selected terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      self.changeApiDom('getSchema', cont, body);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-eye');
  a.appendChild(icon);
  var txt = document.createTextNode('View Schema');
  a.appendChild(txt);
  ul.appendChild(a);

  //update schema
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      self.changeApiDom('updateSchema', cont, body);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-arrow-up');
  a.appendChild(icon);
  var txt = document.createTextNode('Update Schema');
  a.appendChild(txt);
  ul.appendChild(a);

  //get class frames
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      self.changeApiDom('getClassFrames', cont, body);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-share-alt');
  a.appendChild(icon);
  var txt = document.createTextNode('Get Class Frames');
  a.appendChild(txt);
  ul.appendChild(a);

  cont.appendChild(ul);

  var dom = self.getShowApiDom('getSchema', body);
  cont.appendChild(dom);

  return cont;
} // getSchemaApi

// get connect to server api calls - on click of connectAPI nav bar
ApiExplorer.prototype.getConnectExplorer = function(body){
  var self = this;

  var br = document.createElement('BR');
  body.appendChild(br);

  // get signature
  var b = this.getSignature('connect');
  body.appendChild(b);

  // get header Parameter
  body.appendChild(UTILS.getHeaderDom('Parameters'));

  var br = document.createElement('BR');
  body.appendChild(br);

  //form to get server url
  var form = this.getServerForm();

  body.appendChild(form);
  return body;

} // getConnectExplorer

//get create & delete db form
ApiExplorer.prototype.getServerForm = function(){
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
    self.client.connect(input.url, input.key)
    .then(function(response){
      FrameHelper.removeChildren(resd);
      var resultDom = UTILS.showHttpResult(response, 'connect', resd, self.ui);
    });
  }) // button click
  return form;
} // getServerForm()

// get database api calls - on click of databaseAPI nav bar - submenus of database Api defined here
ApiExplorer.prototype.getDatabaseExplorer = function(cont){

  var body = document.createElement('div');

  // list view of Databse tools
  var ul = document.createElement('ul');
  ul.setAttribute('class','terminus-ul-horizontal');

  //create db
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-submenu-selected terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      FrameHelper.removeChildren(body);
      var dom = self.getDatabaseDom('create', body);
      cont.appendChild(dom);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-plus');
  a.appendChild(icon);
  var txt = document.createTextNode('Create database');
  a.appendChild(txt);
  ul.appendChild(a);

  //delete db
  var a = document.createElement('a');
  a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
  var self = this;
  a.addEventListener("click", function(){
      self.setSelectedSubMenu(this);
      FrameHelper.removeChildren(body);
      var dom = self.getDatabaseDom('delete', body);
      cont.appendChild(dom);
  })
  var icon = document.createElement('i');
  icon.setAttribute('class', 'terminus-menu-icon fa fa-trash-alt');
  a.appendChild(icon);
  var txt = document.createTextNode('Delete database');
  a.appendChild(txt);
  ul.appendChild(a);

  cont.appendChild(ul);

  // landing page
  var dom = self.getDatabaseDom('create', body);
  cont.appendChild(dom);

  return cont;
} // getDatabaseExplorer


// get database dom
 ApiExplorer.prototype.getDatabaseDom = function(mode, body){
  var self = this;

  var br = document.createElement('BR');
  body.appendChild(br);

  // get signature
  var b = this.getSignature(mode);
  body.appendChild(b);

  // get header Parameter
  body.appendChild(UTILS.getHeaderDom('Parameters'));

  var br = document.createElement('BR');
  body.appendChild(br);

  //form to get database id
  if(mode == 'create') var form = this.getDBForm(mode);
  else var form = this.getDBForm(mode);

  body.appendChild(form);
  return body;

}// getDatabaseDom()

//get create & delete db form
ApiExplorer.prototype.getDBForm = function(mode){
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
    inpLabel.innerHTML = 'Document:';
    fd.appendChild(inpLabel);
    var cd = document.createElement('div');
    cd.setAttribute('class', 'terminus-controls');
    fd.appendChild(cd);
    var inpTxtAr = document.createElement('textarea');
    inpTxtAr.setAttribute('type', 'text');
    inpTxtAr.setAttribute('class', 'terminus-input-text');
    inpTxtAr.setAttribute('placeholder', 'Enter document to create database');
    cd.appendChild(inpTxtAr);
    UTILS.stylizeEditor(this.ui, inpTxtAr, 'document', 'javascript');
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
  inpKey.setAttribute('class', 'terminus-input-text');
  inpKey.setAttribute('placeholder', 'key');
  cd.appendChild(inpKey);

  var button = document.createElement('button');
  button.setAttribute('class', 'terminus-btn terminus-send-api-btn');
  button.setAttribute('type', 'button');
  button.innerHTML = 'Send Api';
  var gatherips = function(){
    var input = {};
    input.id = inpId.value;
    input.doc = JSON.parse(inpTxtAr.value);
    input.key = inpKey.value;
    return input;
  }
  var self = this;
  if(mode == 'create'){
    button.addEventListener("click", function(form){
      var input = gatherips();
      var buttonSelf = this;
      self.client.createDatabase(input.id, input.doc, input.key)
      .then(function(response){
        var currForm = buttonSelf.parentNode;
        var resultDom = UTILS.showHttpResult(response, 'create', currForm, self.ui);
      });
    }) // button click
  } // if(mode == 'create')
  else{
    button.addEventListener("click", function(){
      var buttonSelf = this;
      opts = {};
      self.client.deleteDatabase(inpId.value, opts)
      .then(function(response){
        var currForm = buttonSelf.parentNode;
        var resultDom = UTILS.showHttpResult(response, 'delete', currForm, self.ui);
      });
    }) // button click
  } // if(mode == 'delete')
  form.appendChild(button);
  return form;
} // getDBForm()

// get query api dom
ApiExplorer.prototype.getQueryApiDom = function(action, body){

  var br = document.createElement('BR');
  body.appendChild(br);

  // signature
  var b = this.getSignature(action);
  body.appendChild(b);

  // get header Parameter
  body.appendChild(UTILS.getHeaderDom('Parameters'));
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
  UTILS.stylizeEditor(this.ui, txtar, 'query', 'javascript');
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
    self.client.select(inpId.value, txtar.value, opts)
    .then(function(response){
      var currForm = buttonSelf.parentNode;
      var resultDom = UTILS.showHttpResult(response, 'select', currForm, self.ui);
    });
  }) // button click
  fd.appendChild(button);
  body.appendChild(form);
  return body;
} // getQueryApiDom

ApiExplorer.prototype.getClassFramesForm = function(){
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
    var inpUrl = document.createElement('input');
    inpUrl.setAttribute('type', 'text');
    inpUrl.setAttribute('id', 'basicinput');
    inpUrl.setAttribute('class', 'span8 terminus-input-text');
    inpUrl.setAttribute('placeholder', 'URL : database_url');
    if(this.val) inpUrl.value = this.val;
    cd.appendChild(inpUrl);
    var icon = document.createElement('i');
    icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
    cd.appendChild(icon);
    var fd = document.createElement('div');
    fd.setAttribute('class', 'terminus-control-group');
    form.appendChild(fd);
    var inpLabel = document.createElement('label');
    inpLabel.setAttribute('class', 'terminus-control-label');
    inpLabel.setAttribute('for', 'basicinput');
    inpLabel.innerHTML = 'Url/ ID:';
    fd.appendChild(inpLabel);
    var cd = document.createElement('div');
    cd.setAttribute('class', 'terminus-controls');
    fd.appendChild(cd);
    var inpDocUrl = document.createElement('input');
    inpDocUrl.setAttribute('type', 'text');
    inpDocUrl.setAttribute('id', 'basicinput');
    inpDocUrl.setAttribute('class', 'span8 terminus-input-text');
    inpDocUrl.setAttribute('placeholder', 'Url or ID of document class');
    cd.appendChild(inpDocUrl);
    var icon = document.createElement('i');
    icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
    cd.appendChild(icon);
    var fd = document.createElement('div');
    fd.setAttribute('class', 'terminus-control-group');
    form.appendChild(fd);
    var optLabel = document.createElement('label');
    optLabel.setAttribute('class', 'terminus-control-label');
    optLabel.setAttribute('for', 'basicinput');
    optLabel.innerHTML = 'Options:';
    fd.appendChild(optLabel);
    var cd = document.createElement('div');
    cd.setAttribute('class', 'terminus-controls');
    fd.appendChild(cd);
    var optInp = document.createElement('input');
    optInp.setAttribute('type', 'text');
    optInp.setAttribute('id', 'basicinput');
    optInp.setAttribute('class', 'span8 terminus-input-text');
    optInp.setAttribute('placeholder', 'options');
    cd.appendChild(optInp);
    var button = document.createElement('button');
    button.setAttribute('class', 'terminus-btn terminus-send-api-btn');
    button.setAttribute('type', 'button');
    button.innerHTML = 'Send Api';
    var gatherips = function(){
        var input = {};
        input.url = inpUrl.value;
        input.docUrl = inpDocUrl.value;
        input.options = optInp.value;
        return input;
    }
    var self = this;
    button.addEventListener("click", function(form){
      var input = gatherips();
      var buttonSelf = this;
      opts = {};
      opts.explorer = true;
      self.client.getClassFrame(input.url, input.docUrl, opts)
      .then(function(response){
          var currForm = buttonSelf.parentNode;
          var resultDom = UTILS.showHttpResult(response, 'getClassFrames', currForm, self.ui);
      });
    }) // button click
    form.appendChild(button);
    return form;
}

// get schema & document dom
 ApiExplorer.prototype.getShowApiDom = function(action, body){
   var self = this;

   var br = document.createElement('BR');
   body.appendChild(br);

   // signature
   var b = this.getSignature(action);
   body.appendChild(b);

   // get header Parameter
   body.appendChild(UTILS.getHeaderDom('Parameters'));
   var br = document.createElement('BR');
   body.appendChild(br);

   // get input
   switch(action){
     case 'getSchema':
       // form to input schema url
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       // schema url
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

       //encoding
       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var encLabel = document.createElement('label');
       encLabel.setAttribute('class', 'terminus-control-label');
       encLabel.setAttribute('for', 'basicinput');
       encLabel.innerHTML = 'Encoding:';
       fd.appendChild(encLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpEnc = document.createElement('select');
       inpEnc.setAttribute('type', 'text');
       inpEnc.setAttribute('placeholder', 'turtle');
       var optTurt = document.createElement('option');
       optTurt.setAttribute('value', 'terminus:turtle');
       optTurt.appendChild(document.createTextNode('turtle'));
       inpEnc.appendChild(optTurt);
       var optJld = document.createElement('option');
       optJld.setAttribute('value', 'terminus:jsonld');
       optJld.appendChild(document.createTextNode('jsonLD'));
       inpEnc.appendChild(optJld);
       cd.appendChild(inpEnc);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
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
       inpKey.setAttribute('class', 'terminus-input-text');
       inpKey.setAttribute('placeholder', 'Key');
       cd.appendChild(inpKey);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       // gather the dom objects
       var gatherips = {};
       gatherips.url = inpId;
       gatherips.enc = inpEnc;
       gatherips.key  = inpKey;

       body.appendChild(formDoc);

       //form to get schema
       var form = this.getApiForm(action, gatherips);
       body.appendChild(form);
     break;
     case 'getClassFrames':
        var form = this.getClassFramesForm();
        body.appendChild(form);
     break;
     case 'updateSchema':
       // form to input schema url
       var formDoc = document.createElement('form');
       formDoc.setAttribute('class', 'terminus-form-horizontal row-fluid');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       // schema url
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

       //encoding
       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var encLabel = document.createElement('label');
       encLabel.setAttribute('class', 'terminus-control-label');
       encLabel.setAttribute('for', 'basicinput');
       encLabel.innerHTML = 'Encoding:';
       fd.appendChild(encLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var inpEnc = document.createElement('select');
       inpEnc.setAttribute('type', 'text');
       inpEnc.setAttribute('placeholder', 'turtle');
       var optTurt = document.createElement('option');
       optTurt.setAttribute('value', 'terminus:turtle');
       optTurt.appendChild(document.createTextNode('turtle'));
       inpEnc.appendChild(optTurt);
       var optJld = document.createElement('option');
       optJld.setAttribute('value', 'terminus:jsonld');
       optJld.appendChild(document.createTextNode('jsonLD'));
       inpEnc.appendChild(optJld);
       cd.appendChild(inpEnc);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
       var schLabel = document.createElement('label');
       schLabel.setAttribute('class', 'terminus-control-label');
       schLabel.setAttribute('for', 'basicinput');
       schLabel.innerHTML = 'Schema:';
       fd.appendChild(schLabel);
       var cd = document.createElement('div');
       cd.setAttribute('class', 'terminus-controls');
       fd.appendChild(cd);
       var schDoc = document.createElement('textarea');
       cd.appendChild(schDoc);
       schDoc.setAttribute('class', 'terminus-api-explorer-text-area');
       stylizeEditor(this.ui, schDoc, 'schema', 'turtle');

       var fd = document.createElement('div');
       fd.setAttribute('class', 'terminus-control-group');
       formDoc.appendChild(fd);
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
       inpKey.setAttribute('class', 'terminus-input-text');
       inpKey.setAttribute('placeholder', 'Key');
       cd.appendChild(inpKey);
       var icon = document.createElement('i');
       icon.setAttribute('class', 'fa fa-asterisk terminus-mandatory-icon');
       cd.appendChild(icon);

       // gather the dom objects
       var gatherips = {};
       gatherips.url = inpId;
       gatherips.enc = inpEnc;
       gatherips.key = inpKey;
       gatherips.doc = schDoc;

       //form to update schema
       var form = this.getApiForm(action, gatherips);
       body.appendChild(formDoc);
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

       var form = this.getApiForm(action, inpId);

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

       var form = this.getApiForm(action, inpId);

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
       UTILS.stylizeEditor(this.ui, txtar, 'document', 'javascript');

       /*var editor = codeMirrorFormat(txtar, 'javascript', true);
       // refresh load
       setTimeout(function() {
           editor.refresh();
       },1);
       // save changes of code mirror editor
       function updateTextArea() {
         editor.save();
       }
       editor.on('change', updateTextArea); */

        body.appendChild(formDoc);

        var br = document.createElement('BR');
        body.appendChild(br);

        // gather the dom objects
        var gatherips = {};
        gatherips.schemaUrlDom =  inpId;
        gatherips.schemaTextDom =  txtar;
        gatherips.htmlEditor =  editor;

        //form to update schema
        var form = this.getApiForm(action, gatherips);
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
       UTILS.stylizeEditor(this.ui, txtar, 'document', 'turtle');

       body.appendChild(formDoc);

       var br = document.createElement('BR');
       body.appendChild(br);

       // gather the dom objects
       var gatherips = {};
       gatherips.schemaUrlDom =  inpId;
       gatherips.schemaTextDom =  txtar;
       gatherips.htmlEditor =  editor;

       //form to update schema
       var form = this.getApiForm(action, gatherips);
       body.appendChild(form);

     break;
   }// switch(action)

   return body;
 } // getShowApiDom()

// define event listeners on send api of schema & documents
ApiExplorer.prototype.getApiForm = function(action, input){
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
        var opts = {};
        opts['terminus:encoding'] = input.enc.value;
        opts['terminus:user_key'] = input.key.value;
        var schurl = input.url.value;
        var buttonSelf = this;
        self.client.getSchema(schurl, opts)
        .then(function(response){
          FrameHelper.removeChildren(resd);
          var resultDom = UTILS.showHttpResult(response, 'getSchema', resd, self.ui);
        });
      }) // button click
    break;
    case 'updateSchema':
      button.addEventListener("click", function(){
        var buttonSelf = this;
        opts = {};
        opts['terminus:encoding'] = input.enc.value;
        opts['terminus:user_key'] = input.key.value;
        var schurl = input.url.value;
        console.log('opts', opts);
        self.client.connectionConfig.connected_mode = false;
        self.client.updateSchema(schurl, input.doc.value, opts)
        .then(function(response){
          var gtxtar = document.createElement('textarea');
          gtxtar.setAttribute('readonly', true);
          gtxtar.innerHTML = response;
          var currForm = buttonSelf.parentNode;
          currForm.appendChild(gtxtar);
          UTILS.stylizeEditor(this.ui, txtar, 'schema', 'turtle');
        });
      }) // button click
    break;
    case 'viewDocument':
      button.addEventListener("click", function(){
      var dcurl = input.value;
      var buttonSelf = this;
      var opts = {};
      opts.format = 'turtle';
      self.client.getDocument(dcurl, opts)
      .then(function(response){
        FrameHelper.removeChildren(resd);
        var resultDom = UTILS.showHttpResult(response, action, resd, self.ui);
      });
    }) // button click
    break;
    case 'deleteDocument':
      button.addEventListener("click", function(){
      var dcurl = input.value;
      var buttonSelf = this;
      var opts = {};
      self.client.deleteDocument(dcurl, opts)
      .then(function(response){
        FrameHelper.removeChildren(resd);
        var resultDom = UTILS.showHttpResult(response, action, resd, self.ui);
      });
    }) // button click
    break;
    case 'createDocument':
      button.addEventListener("click", function(){
        var dcurl = input.schemaUrlDom.value;
        var payload = input.htmlEditor.getValue();
        var buttonSelf = this;
        opts = {};
        self.client.createDocument(dcurl, payload, opts)
        .then(function(response){
          FrameHelper.removeChildren(resd);
          var resultDom = UTILS.showHttpResult(response, action, resd, self.ui);
        });
      }) // button click
    break;
    case 'updateDocument':
      button.addEventListener("click", function(){
        var dcurl = input.schemaUrlDom.value;
        var payload = input.htmlEditor.getValue();
        var buttonSelf = this;
        opts = {};
        opts.editmode = 'replace';
        opts.format = 'json';
        self.client.updateDocument(dcurl, payload, opts)
        .then(function(response){
          FrameHelper.removeChildren(resd);
          var resultDom = UTILS.showHttpResult(response, action, resd, self.ui);
        });
      }) // button click
    break;
  } // switch(action)

  var br = document.createElement('BR');
  form.appendChild(br);
  var br = document.createElement('BR');
  form.appendChild(br);

  return form;
} // getApiForm()

// get signature of api calls
ApiExplorer.prototype.getSignature = function(action){
    var api = document.createElement('div');

    // get header signature
    var sg = document.createElement('button');
    sg.appendChild(document.createTextNode('Click to read Api Signature'));
    sg.setAttribute('class', 'terminus-collapsible');
    ic = document.createElement('i');
    ic.setAttribute('class', 'terminus-cheveron-float fa fa-chevron-down');
    sg.appendChild(ic);
    api.appendChild(sg);

    var br = document.createElement('BR');
    api.appendChild(br);

    var cl = document.createElement('div');
    cl.setAttribute('class', 'terminus-collapsible-content content');

    var sig = UTILS.getFunctionSignature(action);
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
    cl.appendChild(pre);
    api.appendChild(cl);
    var br = document.createElement('BR');
    api.appendChild(br);

    sg.addEventListener('click', function(){
        UTILS.tolggleContent(ic, cl);
    });

    return api;
} // getSignature()

// displays signature only on click
function tolggleSignatureContent(content){
    if (content.style.display === "block")
        content.style.display = "none";
    else content.style.display = "block";
}

module.exports=ApiExplorer
