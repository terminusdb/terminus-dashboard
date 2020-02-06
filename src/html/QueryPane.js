const TerminusClient = require('@terminusdb/terminus-client');
const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const ResultPane = require("./ResultPane");
const UTILS = require('../Utils');
const HTMLHelper = require('./HTMLHelper');
const TerminusViolations = require('./TerminusViolation');

function QueryPane(client, query, result){
	this.client = client;
	this.query = query;
	this.result = result;
	this.views = [];
	this.container = document.createElement('span');
	this.messages = document.createElement('div');
	this.messages.setAttribute('class', 'terminus-query-messages');
	this.defaultResultView = { showConfig: false, editConfig: false };
	this.defaultQueryView = { showQuery: false, editQuery: false };
}

QueryPane.prototype.load = function(repl){
	return this.query.execute(this.client).then( (result) => {
			let nresult = new TerminusClient.WOQLResult(result, this.query);
			this.updateResult(nresult);
	});
}


QueryPane.prototype.fireDefaultQueries = function(){
	let WOQL = TerminusClient.WOQL;
	var query = WOQL.query().classMetadata();
	query.execute(this.client).then((results) => {
		let qcres = new TerminusClient.WOQLResult(results, query);
		this.classMetaDataRes = qcres;
	})
	var query = WOQL.query().propertyMetadata();
	query.execute(this.client).then((results) => {
		let qpres = new TerminusClient.WOQLResult(results, query);
		this.propertyMetaDataRes = qpres;
	})
}

QueryPane.prototype.options = function(opts){
	this.showQuery = (opts && typeof opts.showQuery != "undefined" ? opts.showQuery : false);
	this.editQuery = (opts && typeof opts.editQuery != "undefined" ? opts.editQuery : false);
	this.showHeader = (opts && typeof opts.showHeader != "undefined" ? opts.showHeader : false);
	this.addViews = (opts && typeof opts.addViews != "undefined" ? opts.addViews : false);
	this.intro = (opts && typeof opts.intro != "undefined" ? opts.intro : false);
	var css = (opts && typeof opts.css != "undefined" ? opts.css : 'terminus-query-pane-cont');
    this.container.setAttribute('class', css);
    return this;
}

QueryPane.prototype.getSection = function(sName){
	var btn = document.createElement('button');
	btn.setAttribute('class', 'terminus-query-section');
	btn.appendChild(document.createTextNode(sName));
	return btn;
}

QueryPane.prototype.clearSubMenus = function(btn){
	var par = btn.parentElement.parentElement;
	var smenus = par.getElementsByClassName('terminus-queries-submenu');
	for(var i=0; i<smenus.length; i++){
		HTMLHelper.removeChildren(smenus[i]);
	}
}

QueryPane.prototype.getResults = function(query){
	if(query)
		this.input.setQuery(query);
	HTMLHelper.removeChildren(this.sampleQueryDOM);
	this.sampleQueryDOM.appendChild(document.createTextNode(" Saved Queries "))
	this.input.refreshContents();
}

QueryPane.prototype.AddEvents = function(btn, aval){
	var self = this;
	btn.addEventListener('click', function(){
		let WOQL = TerminusClient.WOQL;
		self.clearSubMenus(this);
		var query;
		switch(this.value){
			case 'Show All Schema Elements':
				query = WOQL.query().elementMetadata();
			break;
			case 'Show All Classes':
				query = WOQL.query().classMetadata();
			break;
			case 'Show All Properties':
				query = WOQL.query().propertyMetadata();
			break;
			case 'Show Document Classes':
				query = WOQL.query().concreteDocumentClasses();
			break;
			case 'Show All Data':
				query = WOQL.query().getEverything();
			break;
			case 'Show all documents':
				query = WOQL.query().documentMetadata();
			break;
			case 'Show data of chosen type':
				var choosen = aval || 'scm:' + this.innerText;
				query = WOQL.query().getDataOfClass(choosen);
			break;
			case 'Show data of chosen property':
				var choosen = aval || 'scm:' + this.innerText;
				query = WOQL.query().getDataOfProperty(choosen);
			break;
			case 'Show data of type':
				return;
			break;
			case 'Show data for property':
				return;
			break;
			default:
				console.log('Invalid Type of query');
			break;
		}
		self.getResults(query);
	})
}

QueryPane.prototype.getQueryMenu = function(qName){
	var btn = document.createElement('button');
	btn.setAttribute('class', 'terminus-load-queries');
	btn.setAttribute('value', qName);
	btn.appendChild(document.createTextNode(qName));
	this.AddEvents(btn);
	return btn;
}

QueryPane.prototype.getSubDataMenu = function(qName, val, aval){
	var btn = document.createElement('button');
	btn.setAttribute('class', 'terminus-load-queries');
	btn.setAttribute('value', qName);
	btn.appendChild(document.createTextNode(val));
	this.AddEvents(btn, aval);
	return btn;
}

// schema queries
QueryPane.prototype.getSchemaSection = function(d){
	var section = this.getSection('Schema Queries');
	d.appendChild(section);
	var btn = this.getQueryMenu('Show All Schema Elements');
	d.appendChild(btn);
	var btn = this.getQueryMenu('Show All Classes');
	d.appendChild(btn);
	var btn = this.getQueryMenu('Show Document Classes');
	d.appendChild(btn);
	var btn = this.getQueryMenu('Show All Properties');
	d.appendChild(btn);
}

QueryPane.prototype.checkIfDataMenuOpen = function(btn){
	var isOpen = false;
	if(btn.children.length){
		for(var i=0; i<btn.children.length; i++){
			//var child = btn.children[i].getElementsByClassName('terminus-queries-submenu');
			var child = btn.getElementsByClassName('terminus-queries-submenu');
			if(child.length){
				for(var j=0; j<child.length; j++){
					HTMLHelper.removeElement(child[j]);
					isOpen = true;
				}
			}
		}
	}
	return isOpen;
}

QueryPane.prototype.showDataOfTypeEvent = function(btn){
	var self = this;
	btn.addEventListener('click', function(){
		var isMenuOpen = self.checkIfDataMenuOpen(this);
		if(!isMenuOpen){
			var subPar = document.createElement('div');
			subPar.setAttribute('class', 'terminus-queries-submenu');
			if(self.classMetaDataRes && self.classMetaDataRes.hasBindings()){
				for(var i = 0; i<self.classMetaDataRes.bindings.length; i++){
					var text = self.classMetaDataRes.bindings[i]['v:Label']['@value'];
					var val = self.classMetaDataRes.bindings[i]['v:Element'];
					subPar.appendChild(self.getSubDataMenu('Show data of chosen type', text, val));
				}
			}
			btn.appendChild(subPar);
		}		
	})
}

QueryPane.prototype.showPropertyOfTypeEvent = function(btn){
	var self = this;
	btn.addEventListener('click', function(){
		var isMenuOpen = self.checkIfDataMenuOpen(this);
		if(!isMenuOpen){
			var subPar = document.createElement('div');
			subPar.setAttribute('class', 'terminus-queries-submenu');
			if(self.propertyMetaDataRes && self.propertyMetaDataRes.hasBindings()){
				for(var i = 0; i<self.propertyMetaDataRes.bindings.length; i++){
					var text = self.propertyMetaDataRes.bindings[i]['v:Label']['@value'];
					var val = self.propertyMetaDataRes.bindings[i]['v:Property'];
					subPar.appendChild(self.getSubDataMenu('Show data of chosen property', text, val));
				}
			}
			btn.appendChild(subPar);
		}
	})
}

QueryPane.prototype.addCheveronIcon = function(btn){
	var i = document.createElement('i');
	i.setAttribute('class', 'fa fa-chevron-right terminus-query-section');
	btn.appendChild(i);
}

// data queries
QueryPane.prototype.getDataSection = function(d){
	var section = this.getSection('Data Queries');
	d.appendChild(section);
	// div to populate submenu on data of type
	var bd = document.createElement('div');
	bd.setAttribute('class', 'terminus-query-submenu');
	d.appendChild(bd);
	var btn = this.getQueryMenu('Show data of type');
	bd.appendChild(btn);
	this.addCheveronIcon(btn);
	this.showDataOfTypeEvent(btn);
	// div to populate submenu on property of type
	var bd = document.createElement('div');
	bd.setAttribute('class', 'terminus-query-submenu');
	d.appendChild(bd);
	var btn = this.getQueryMenu('Show data for property');
	bd.appendChild(btn);
	this.showPropertyOfTypeEvent(btn);
	this.addCheveronIcon(btn);
	var btn = this.getQueryMenu('Show All Data');
	d.appendChild(btn);
}

QueryPane.prototype.fireDocumentEvent = function(document){
	let WOQL = TerminusClient.WOQL;
	var query = WOQL.query().documentProperties(document);
	this.getResults(query);
}

QueryPane.prototype.getEnterDocumentIdDOM = function(){
	var sp = document.createElement('span');
	sp.setAttribute('class', 'terminus-display-flex');
	var inp = document.createElement('input');
	inp.setAttribute('class', 'terminus-doc-id-input');
	inp.setAttribute('placeholder', 'doc:myDocId');
	var sub = document.createElement('button');
	sub.setAttribute('class', 'terminus-btn terminus-doc-id-input-submit');
	sub.appendChild(document.createTextNode('Submit'));
	var self = this;
	sub.addEventListener('click', function(){
		self.fireDocumentEvent(inp.value);
	})
	sp.appendChild(inp);
	sp.appendChild(sub);
	return sp;
}

// document queries
QueryPane.prototype.getDocumentSection = function(d){
	var section = this.getSection('Document Queries');
	d.appendChild(section);
	var btn = this.getQueryMenu('Show all documents');
	d.appendChild(btn);
	d.appendChild(this.getEnterDocumentIdDOM());
}

// bottom color transaprent
QueryPane.prototype.getQueryMenuBlock = function(){
	var d = document.createElement('div');
	d.setAttribute('class', 'terminus-load-queries');
	this.getSchemaSection(d);
	this.getDataSection(d);
	this.getDocumentSection(d);
	return d;
}

QueryPane.prototype.getSampleQueriesDOM = function(){
	var i = document.createElement('icon');
	i.setAttribute('class', 'fa fa-ellipsis-v terminus-ellipsis-icon');
	i.setAttribute('title', 'Click to load sample Queries');
	i.setAttribute('value', false);
	i.appendChild(document.createTextNode(" Saved Queries "))
	this.sampleQueryDOM = i;
	var self = this;
	i.addEventListener('click', function(e){
		if(e.target !== this) return;
		if(this.children.length) {
			HTMLHelper.removeChildren(this);
			this.appendChild(document.createTextNode(" Saved Queries "))
		}
		else{
			var d = self.getQueryMenuBlock();
			this.appendChild(d);
		}
	})
	return i;
}

QueryPane.prototype.getAsDOM = function(){
	if(this.intro){
		this.container.appendChild(UTILS.getHeaderDom(this.intro));
	}
	if(this.showQuery) {
		this.fireDefaultQueries();
		var configspan = document.createElement("span");
		configspan.setAttribute("class", "pane-config-icons");
		this.querySnippet = configspan;
		this.container.appendChild(configspan);
		var mode = (this.editQuery ? "edit" : "view");
		this.input = this.createInput(mode);
		var ipdom = this.input.getAsDOM(true);
		var ispan = document.createElement("span");
		ispan.setAttribute("class", "query-pane-config");
		var ic = document.createElement("i");
		//ic.setAttribute('style', 'margin:10px;')
		configspan.appendChild(ic);
		var self = this;
		function showQueryConfig(){
			if(self.showQuery != "always"){
				configspan.title="Click to Hide Query";
				ic.setAttribute("class", "fas fa fa-times-circle");
			}
			configspan.classList.remove('terminus-click-to-view-query');
			if(configspan.nextSibling){
				self.container.insertBefore(ipdom, configspan.nextSibling);
			}
			else {
				self.container.appendChild(ipdom);
			}
			var qicon = self.getSampleQueriesDOM();
			var sqd = document.createElement("span");
			sqd.setAttribute("class", "sample-queries-pane");
			sqd.appendChild(qicon);
			ipdom.appendChild(sqd);
			self.input.stylizeSnippet();
		}
		function hideQueryConfig(){
			configspan.title="Click to View Query";
            ic.setAttribute("class", "fas fa fa-search terminus-query-view-icon");
			configspan.classList.add('terminus-click-to-view-query');
			self.container.removeChild(ipdom);
		}
		configspan.addEventListener("click", () => {
			if(this.showingQuery) hideQueryConfig();
			else showQueryConfig();
			this.showingQuery = !this.showingQuery;
		});
		showQueryConfig();
		if(this.showQuery == "icon") hideQueryConfig();
	}
	this.resultDOM = document.createElement("span");
	if(this.showQuery){
		this.resultDOM.setAttribute("class", "terminus-query-results-full");
	}
	else {
		this.resultDOM.setAttribute("class", "terminus-query-results");
	}
	this.resultDOM.appendChild(this.messages);
	if(this.views.length == 0){
		this.addView(TerminusClient.View.table(), this.defaultResultView);
	}
	//this is where we want to put in the view headers in the case of the query page
	for(var i = 0; i<this.views.length; i++){
		var vdom = this.views[i].getAsDOM();
		if(vdom){
			if(this.showHeader){
				var closable = (this.views.length != 1);
				//var qhdr = this.getResultPaneHeader(closable);
				//vdom.prepend(qhdr);
			}
			this.resultDOM.appendChild(vdom);
		}
	}
	this.container.appendChild(this.resultDOM);
	if(this.addViews) this.container.appendChild(this.getAddViewControl());
	return this.container;
}


QueryPane.prototype.getResultPaneHeader = function(closable){
	var c = document.createElement('div');
	var savePaneButton = document.createElement('button');
	savePaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
	savePaneButton.appendChild(document.createTextNode('Save'));
	c.appendChild(savePaneButton);
	if(closable){
		var closePaneButton = document.createElement('button');
		closePaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
		closePaneButton.appendChild(document.createTextNode('Close'));
		c.appendChild(closePaneButton);
	}
	var collapsePaneButton = document.createElement('button');
	collapsePaneButton.setAttribute('class', 'terminus-btn terminus-query-btn');
	collapsePaneButton.appendChild(document.createTextNode('Collapse'));
	c.appendChild(collapsePaneButton);
	return c;
}

QueryPane.prototype.createInput = function(mode){
    let input = new TerminusCodeSnippet("woql", mode, null, 800);
    if(this.query){
    	input.setQuery(this.query);
	}
	var self = this;
	input.submit = function(qObj){
		self.submitQuery(qObj);
	};
	return input;
}

QueryPane.prototype.updateQuery = function(qObj){
	this.query = qObj;
	if(this.input) this.input.setQuery(this.query);
}

QueryPane.prototype.updateResult = function(result){
	this.result = result;
	this.updateQuery(result.query);
	this.refreshViews();
}

QueryPane.prototype.addView = function(config, options){
	var nrp = new ResultPane(this.client, this, config).options(options);
	if(this.result){
		nrp.setResult(this.result);
	}
	this.views.push(nrp);
	return nrp;
}

QueryPane.prototype.empty = function(){
	return (typeof this.query == "undefined");
}

QueryPane.prototype.clearMessages = function(){
	if(this.messages.children.length) HTMLHelper.removeChildren(this.messages);
}

QueryPane.prototype.getBusyLoader = function(){
     var pbc = document.createElement('div');
     pbc.setAttribute('class', 'term-progress-bar-container');
     var pbsa = document.createElement('div');
     pbsa.setAttribute('class', 'term-progress-bar term-stripes animated reverse slower');
     pbc.appendChild(pbsa);
     var pbia = document.createElement('span');
     pbia.setAttribute('class', 'term-progress-bar-inner');
     pbsa.appendChild(pbia);
	 return pbc;
}

QueryPane.prototype.showBusy = function(msg){
	var msgHolder = document.createElement('div');
	msgHolder.setAttribute('class', 'terminus-busy-msg')
	msgHolder.appendChild(document.createTextNode(msg));
	msgHolder.appendChild(this.getBusyLoader());
	this.messages.appendChild(msgHolder);
}

QueryPane.prototype.showError = function(e){
	this.showMessage(e, "error");
}

QueryPane.prototype.showMessage = function(m, type){
	var md = document.createElement('div');
	md.setAttribute('class', 'terminus-show-msg-' + type);
	md.appendChild(document.createTextNode(m));
	this.messages.appendChild(md);
}

QueryPane.prototype.showNoBindings = function(){
	nor = document.createElement('div');
	nor.setAttribute('class', 'terminus-show-msg-warning');
	nor.appendChild(document.createTextNode("No results available for this query"));
	this.clearMessages();
	this.messages.appendChild(nor);
}	

QueryPane.prototype.submitQuery = function(qObj){
	this.clearMessages();
	if(!qObj){
		this.showError("Query could not be extracted from input box - remember that the last element in the query must be a WOQL object")
	}
	if(typeof qObj == 'string'){
		this.showError(qObj);
		return;
	}
    this.query = qObj;
	this.showBusy('Fetching results ...');
	var self = this;
	var start = Date.now();
    qObj.execute(this.client).then((results) => {
		var r = new TerminusClient.WOQLResult(results, qObj);
		this.result = r;
		this.clearMessages();
		if(this.result.hasBindings()){
			var delta = Date.now() - start;
			this.showMessage("Query returned " + this.result.count() + " results in " + (delta/1000) + " seconds", "info");
			this.refreshViews();
		}
		else this.showNoBindings();
	}).catch((error) => {
		this.clearMessages();
		if(error.data && error.data['terminus:witnesses']){
			this.showViolations(error.data['terminus:witnesses']);
		}
		else {
			this.showError(error);
		}
	});
}

QueryPane.prototype.refreshViews = function(){
	for(var i = 0; i<this.views.length; i++){
		this.views[i].updateResult(this.result);
	}
}

QueryPane.prototype.showViolations = function(vios){
    var nvios = new TerminusViolations(vios, this); 
	this.messages.appendChild(nvios.getAsDOM(""));
}

QueryPane.prototype.getAddViewControl = function(){
	var vd = document.createElement('div');
	vd.setAttribute('class', 'terminus-add-view-selector');
	var self = this;
	var WOQL = TerminusClient.WOQL;
	var newView = function(val){
		self.selector.value = "";
		var c= eval('WOQL.' + val + "()");
		var nv = self.addView(c, self.defaultResultView);
		if(self.result){
			nv.setResult(self.result);
		}
		var vdom = nv.getAsDOM();
		if(vdom){
			self.resultDOM.appendChild(vdom);
		}
	}
	var opts = [
		{ value: "", label: "Add another view of results"},
		{ value: "table", label: "Add Table View"},
		{ value: "stream", label: "Add Stream View"},
		{ value: "graph", label: "Add Graph View"},
		{ value: "chooser", label: "Add Drop-down View"},
		{ value: "map", label: "Add Map View"}
	];
	var sel = HTMLHelper.getSelectionControl("view", opts, false,newView);
	this.selector = sel;
	vd.appendChild(sel);
	return vd;
}

module.exports = QueryPane;