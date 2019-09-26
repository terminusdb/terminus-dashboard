/**
 * @file Javascript Api explorer tool
 * @author Kitty Jose
 * @license Copyright 2018-2019 Data Chemist Limited, All Rights Reserved. See LICENSE file for more
 *
 * @summary Displays a demo and description of api calls from WOQLCLient and what happens under the hood of api calls
 */
const FrameHelper = require('./FrameHelper');
const TerminusPluginManager = require('./plugins/TerminusPlugin');
const UTILS = require('./Utils')

let apiNavConfig = {
    mainNav: {
        connect: {
    		navText: 'Connect Server Api',
            action : 'connect',
            icon   : 'link',
            defaultSelected: true
    	},
        database: {
            navText: 'Database Api',
            action : 'create',
            icon   : 'database'
        },
        schema: {
            navText: 'Schema Api',
            action : 'schema',
            icon   : 'cog'
        },
        document: {
            navText: 'Document Api',
            action : 'document',
            icon   : 'file'
        },
        query: {
            navText: 'Query Api',
            action : 'query',
            icon   : 'search'
        }
    },
    subNav: {
        database: {
            createDatabase: {
                navText: 'Create database',
                action : 'create',
                icon   : 'plus',
                defaultSelected: true
            },
            deleteDatabase: {
                navText: 'Delete database',
                action : 'delete',
                icon   : 'trash-alt'
            }
        },
        schema: {
            getSchema: {
                navText: 'View Schema',
                action : 'getSchema',
                icon   : 'eye',
                defaultSelected: true
            },
            updateSchema: {
                navText: 'Update Schema',
                action : 'updateSchema',
                icon   : 'arrow-up'
            },
            getClassFrames: {
                navText: 'Get Class Frames',
                action : 'getClassFrames',
                icon   : 'share-alt'
            }
        },
        document: {
            viewDocument: {
        		navText: 'View Document',
                action : 'viewDocument',
                icon   : 'eye',
                defaultSelected: true
        	},
            createDocument: {
                navText: 'Create Document',
                action : 'createDocument',
                icon   : 'plus'
            },
            updateDocument: {
                navText: 'Update Document',
                action : 'updateDocument',
                icon   : 'arrow-up'
            },
            deleteDocument:{
                navText: 'Delete Document',
                action : 'deleteDocument',
                icon   : 'trash-alt'
            }
        },
        query: {
            select: {
                navText: 'Select',
                action : 'select',
                icon   : 'mouse-pointer',
                defaultSelected: true
            },
            update: {
                navText: 'Update',
                action : 'update',
                icon   : 'arrow-up'
            },
            mapping:{
                navText: 'Mapping',
                action : 'lookup',
                icon   : 'random'
            }
        }
    }
}

function ApiExplorer(ui){
    this.ui = ui;
    this.viewer = ui.main;
    this.client = new TerminusClient.WOQLClient();
    this.client.use_fetch = true;
    this.client.return_full_response = true;
    this.pman = new TerminusPluginManager();
}

// Controller provides access to Api explorer functions
ApiExplorer.prototype.getAsDOM = function(){
 	var aec = document.createElement("div");
    aec.setAttribute("class", "terminus-db-controller");
    if(this.ui){
       this.getApiNav(aec, this.viewer);
       this.getApiExplorerDom('connect', this.viewer);
    } // if this.ui
    return aec;
 }

// Toggle selected nav bars
ApiExplorer.prototype.setSelectedNavMenu = function(a){
    UTILS.removeSelectedNavClass("terminus-selected");
    a.classList.add("terminus-selected");
}

ApiExplorer.prototype.setSelectedSubMenu = function(a){
    UTILS.removeSelectedNavClass("terminus-submenu-selected");
    a.classList.add("terminus-submenu-selected");
}

ApiExplorer.prototype.navOnSelect = function(action, nav, viewer){
    UTILS.removeSelectedNavClass("terminus-selected");
    nav.classList.add("terminus-selected");
    this.getApiExplorerDom(action, viewer);
}

// create nav bars
ApiExplorer.prototype.createNavs = function(navConfig, viewer, ul){
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    if(navConfig.defaultSelected) a.classList.add('terminus-selected');
    var self = this;
    a.addEventListener("click", function(){
        self.navOnSelect(navConfig.action, this, viewer);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-' + navConfig.icon);
    a.appendChild(icon);
    var txt = document.createTextNode(navConfig.navText);
    a.appendChild(txt);
    ul.appendChild(a);
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
    // loop over apiNavConfig
    for (var key in apiNavConfig.mainNav){
        if (apiNavConfig.mainNav.hasOwnProperty(key)) {
            this.createNavs(apiNavConfig.mainNav[key], viewer, ul);
        }
    } // for apiNavConfig

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
    // body
    var cont = document.createElement('div');
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

// on trigger of click event - change dom
ApiExplorer.prototype.changeSubApiDom = function(curSubMenu, action, cont, body){
    FrameHelper.removeChildren(body);
    switch(curSubMenu){
        case 'database':
            var dom = this.getDatabaseDom(action, body);
        break;
        case 'schema':  // getShowApiDom() deals with schema and document
             var dom = this.getShowApiDom(action, body);
        break;
        case 'document': // getShowApiDom() deals with schema and document
             var dom = this.getShowApiDom(action, body);
        break;
        case 'query':
            var dom = this.getQueryApiDom(action, body);
        break;
        default:
            console.log('Invalid Api Config');
        break;
    }
    cont.appendChild(dom);
}

ApiExplorer.prototype.subNavOnSelect = function(curSubMenu, subMenuConfig, subNav, cont, body){
    this.setSelectedSubMenu(subNav);
    this.changeSubApiDom(curSubMenu, subMenuConfig.action, cont, body);
}

// create sub nav bars
ApiExplorer.prototype.createSubNavs = function(curSubMenu, subMenuConfig, cont, body, ul){
    var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    if(subMenuConfig.defaultSelected) a.classList.add('terminus-submenu-selected');
    var self = this;
    a.addEventListener("click", function() {
        self.subNavOnSelect(curSubMenu, subMenuConfig, this, cont, body);
    })
    var icon = document.createElement('i');
    icon.setAttribute('class', 'terminus-menu-icon fa fa-' + subMenuConfig.icon);
    a.appendChild(icon);
    var txt = document.createTextNode(subMenuConfig.navText);
    a.appendChild(txt);
    ul.appendChild(a);
}

// get document api calls - on click of DocumentAPI nav bar
ApiExplorer.prototype.getDocumentApi = function(cont){
    var body = document.createElement('div');
    // list view of Databse tools
    var ul = document.createElement('ul');
    ul.setAttribute('class','terminus-ul-horizontal');
    // loop over apiNavConfig
    for (var key in apiNavConfig.subNav.document){
        if (apiNavConfig.subNav.document.hasOwnProperty(key)) {
            this.createSubNavs('document', apiNavConfig.subNav.document[key], cont, body, ul);
        }
    } // for apiNavConfig
    cont.appendChild(ul);
    var dom = this.getShowApiDom(apiNavConfig.subNav.document.viewDocument.action, body);
    cont.appendChild(dom);
    return cont;
} // getDocumentApi

// get query api calls - on click of QueryAPI nav bar - submenus of Query Api defined here
ApiExplorer.prototype.getQueryApi  = function(cont){
    var body = document.createElement('div');
    // list view of Databse tools
    var ul = document.createElement('ul');
    ul.setAttribute('class','terminus-ul-horizontal');
    // loop over apiNavConfig
    for (var key in apiNavConfig.subNav.query){
        if (apiNavConfig.subNav.query.hasOwnProperty(key)) {
            this.createSubNavs('query', apiNavConfig.subNav.query[key], cont, body, ul);
        }
    } // for apiNavConfig
    cont.appendChild(ul);
    var dom = this.getQueryApiDom(apiNavConfig.subNav.query.select.action, body);
    cont.appendChild(dom);
    return cont;
} //getQueryApi

// get schema api calls - on click of SchemaAPI nav bar - submenus of schema Api defined here
ApiExplorer.prototype.getSchemaApi = function(cont){
    var body = document.createElement('div');
    // list view of Databse tools
    var ul = document.createElement('ul');
    ul.setAttribute('class','terminus-ul-horizontal');
    // loop over apiNavConfig
    for (var key in apiNavConfig.subNav.schema){
        if (apiNavConfig.subNav.schema.hasOwnProperty(key)) {
            this.createSubNavs('schema', apiNavConfig.subNav.schema[key], cont, body, ul);
        }
    } // for apiNavConfig
    cont.appendChild(ul);
    var dom = this.getShowApiDom(apiNavConfig.subNav.schema.getSchema.action, body);
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
  inpId.setAttribute('class', 'terminus-input-text');
  inpId.setAttribute('placeholder', 'URL : server_url');
  if(this.val) inpId.value = this.val;
  cd.appendChild(inpId);

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
    //opts = {};
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
  // loop over apiNavConfig
  for (var key in apiNavConfig.subNav.database){
      if (apiNavConfig.subNav.database.hasOwnProperty(key)) {
          this.createSubNavs('database', apiNavConfig.subNav.database[key], cont, body, ul);
      }
  } // for apiNavConfig
  cont.appendChild(ul);
  // landing page
  var dom = this.getDatabaseDom(apiNavConfig.subNav.database.createDatabase.action, body);
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
    UTILS.stylizeEditor(this.ui, inpTxtAr, 'api-doc', 'javascript');
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
       inpEnc.setAttribute('style', 'height: 50px;width: 300px;padding: 10px;');
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
       inpEnc.setAttribute('style', 'height: 50px;width: 300px;padding: 10px;');
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
       UTILS.stylizeEditor(this.ui, schDoc, 'api-doc', 'turtle');

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
