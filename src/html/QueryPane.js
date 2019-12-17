const TerminusClient = require('@terminusdb/terminus-client');
const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const ResultPane = require("./ResultPane");
const UTILS = require('../Utils');
const HTMLFrameHelper = require('./HTMLFrameHelper');

function QueryPane(client, query, result){
	this.client = client;
	this.query = query;
	this.result = result;
	this.views = [];
	this.container = document.createElement('span');
    this.container.setAttribute('class', 'terminus-query-pane-cont');
	this.messages = document.createElement('div');
	this.messages.setAttribute('class', 'terminus-query-messages');
	this.fireDefaultQueries();
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
	this.showQuery = (opts && typeof opts.showQuery != "undefined" ? opts.showQuery : true);
	this.editQuery = (opts && typeof opts.editQuery != "undefined" ? opts.editQuery : true);
	this.showHeader = (opts && typeof opts.showHeader != "undefined" ? opts.showHeader : false);
	this.addViews = (opts && typeof opts.addViews != "undefined" ? opts.addViews : false);
	this.intro = (opts && typeof opts.intro != "undefined" ? opts.intro : false);
	this.defaultResultView = { showConfig: "icon", editConfig: "true" };
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
		TerminusClient.FrameHelper.removeChildren(smenus[i]);
	}
}

QueryPane.prototype.getResults = function(query){
	if(query)
		this.input.setQuery(query);
	TerminusClient.FrameHelper.removeChildren(this.sampleQueryDOM);
	this.input.refreshContents();
}

QueryPane.prototype.AddEvents = function(btn){
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
			case 'Show Document Classes':
				query = WOQL.query().documentMetadata();
			break;
			case 'Show All Properties':
				query = WOQL.query().propertyMetadata();
			break;
			case 'Show All Data':
				query = WOQL.query().getEverything();
			break;
			case 'Show data of chosen type':
				var choosen = 'scm:' + this.innerText;
				query = WOQL.query().getDataOfClass(choosen);
			break;
			case 'Show property of chosen type':
				var choosen = 'scm:' + this.innerText;
				query = WOQL.query().getDataOfProperty(choosen);
			break;
			case 'Show data of type':
				return;
			case 'Show property of type':
				return;
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

QueryPane.prototype.getSubDataMenu = function(qName, val){
	var btn = document.createElement('button');
	btn.setAttribute('class', 'terminus-load-queries');
	btn.setAttribute('value', qName);
	btn.appendChild(document.createTextNode(val));
	this.AddEvents(btn);
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
					TerminusClient.FrameHelper.removeElement(child[j]);
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
					subPar.appendChild(self.getSubDataMenu('Show data of chosen type', text));
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
					subPar.appendChild(self.getSubDataMenu('Show property of chosen type', text));
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
	var btn = this.getQueryMenu('Show property of type');
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
	var btn = this.getQueryMenu('Show All Documents');
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
	this.sampleQueryDOM = i;
	var self = this;
	i.addEventListener('click', function(e){
		if(e.target !== this) return;
		if(this.children.length)
			TerminusClient.FrameHelper.removeChildren(this);
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
			configspan.title="Click to Hide Query";
			ic.setAttribute("class", "fas fa fa-times-circle");
			configspan.classList.remove('terminus-click-to-view-query');
			var qicon = self.getSampleQueriesDOM();
			if(configspan.nextSibling){
				self.container.insertBefore(ipdom, configspan.nextSibling);
			}
			else {
				self.container.appendChild(ipdom);
				ipdom.appendChild(qicon);
			}
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
	this.resultDOM.setAttribute("class", "terminus-query-results");
	if(this.views.length == 0){
		this.addView(TerminusClient.WOQL.table(), this.defaultResultView);
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
	if(this.messages.children.length) TerminusClient.FrameHelper.removeChildren(this.messages);
}

QueryPane.prototype.getBusyLoader = function(){
     var pd = document.createElement('div');
     var pbc = document.createElement('div');
     pbc.setAttribute('class', 'term-progress-bar-container');
     pd.appendChild(pbc);

     var pbsa = document.createElement('div');
     pbsa.setAttribute('class', 'term-progress-bar term-stripes animated reverse slower');
     pbc.appendChild(pbsa);
     var pbia = document.createElement('span');
     pbia.setAttribute('class', 'term-progress-bar-inner');
     pbsa.appendChild(pbia);
	 return pd;
}

QueryPane.prototype.showBusy = function(msg){
	var msgHolder = document.createElement('div');
	msgHolder.setAttribute('class', 'terminus-busy-msg')
	msgHolder.appendChild(document.createTextNode(msg));
	msgHolder.appendChild(this.getBusyLoader());
	this.messages.appendChild(msgHolder);
	this.container.insertBefore(this.messages, this.querySnippet);
}

QueryPane.prototype.showError = function(e){
	var md = document.createElement('div');
	md.setAttribute('class', 'terminus-show-msg-error');
	md.appendChild(document.createTextNode(e));
	this.messages.appendChild(md);
	if(this.container)
		this.container.insertBefore(this.messages, this.resultDOM);
}

QueryPane.prototype.showNoBindings = function(){
	nor = document.createElement('div');
	nor.setAttribute('class', 'terminus-no-res-alert');
	nor.appendChild(document.createTextNode("No results available for this query"));
	if(this.container)
		this.container.insertBefore(nor, this.resultDOM);
}

QueryPane.prototype.submitQuery = function(qObj){
	this.clearMessages();
	if(typeof qObj == 'string'){
		this.showError(qObj);
		return;
	}
    this.query = qObj;
	this.showBusy('Fetching results ...');
	var self = this;
    qObj.execute(this.client).then((results) => {
		var r = new TerminusClient.WOQLResult(results, qObj);
		this.result = r;
		self.clearMessages();
		if(this.result.hasBindings())
			this.refreshViews();
		else this.showNoBindings();
	})
}

QueryPane.prototype.refreshViews = function(){
	for(var i = 0; i<this.views.length; i++){
		this.views[i].updateResult(this.result);
	}
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
	var sel = HTMLFrameHelper.getSelectionControl("view", opts, false,newView);
	this.selector = sel;
	vd.appendChild(sel);
	return vd;
}




/*
descr: Show results editor on click of Add View
params: query object, query snippet
QueryPane.prototype.showRuleEditor = function(woql, vd, qSnippet){
var cancel = document.createElement('icon');
//cancel.appendChild(document.createTextNode('cancel'));
cancel.setAttribute('class', 'fa fa-times terminus-pointer terminus-cancel-rule-editor');
vd.appendChild(cancel);
var rSnippet = this.thv.getEditor(1350, 250, 'Enter Rules ...');
//var rEditor = document.createElement('div');
vd.setAttribute('class', 'terminus-rule-editor');
//vd.setAttribute('style', 'border: 1px solid orange');
this.qpane.addRuleDom = rSnippet.actionButton;
vd.appendChild(UTILS.getHeaderDom('Rule Editor:'));
vd.appendChild(rSnippet.dom);
qSnippet.dom.appendChild(vd);
var self = this;
cancel.addEventListener('click', function(){
    TerminusClient.FrameHelper.removeChildren(vd);
    self.addView(woql, qSnippet);
})
this.qpane.addRuleDom.addEventListener('click', function(){
    try{
        self.submitView(woql, qSnippet, rSnippet);
        self.hideAddViewEditor(vd);
    }
    catch(e){
        self.ui.showError('Error in rule editor: ' + e);
    }
})
return rSnippet;
}
*/


/*

QueryPane.prototype.getWOQLEditor = function(){
    var tcs = new TerminusCodeSnippet("woql", "edit");
	var snippet = tcs.getAsDOM();
	var dimensions = {};
	dimensions.width = width;
	dimensions.height = height;
	UTILS.stylizeEditor(this.ui, snippet.snippetText, dimensions, 'javascript');
	return snippet;
}

QueryPane.prototype.showConfigEditor = function(result, config, span){
    var cSnippet = this.getEditor(300, 250,
                        JSON.stringify(config, undefined, 2));
    var self = this;
    cSnippet.actionButton.addEventListener('click', function(){
        try{
            //self.submitConfigRules(woql, cSnippet, qSnippet, rSnippet);
			var cObj = UTILS.getqObjFromInput(cSnippet.snippetText.value);
			TerminusClient.FrameHelper.removeChildren(span);
			span.appendChild(self.showResult(result, cObj));
        }
        catch(e){
            //self.ui.showError('Error in config editor: ' + e);
			console.log('Error in config editor: ' + e);
        }
    })
    return cSnippet;
}

QueryPane.prototype.submitConfig = function(result, config, span, cdom){
	var cSnippet = this.showConfigEditor(result, config, span);
	cdom.appendChild(cSnippet.dom);
}

QueryPane.prototype.showConfig = function(result, config, span, cdom){
	var cbtn = document.createElement('button');
    //cbtn.setAttribute('style', 'margin-top: 10px;');
    cbtn.setAttribute('class', 'terminus-btn terminus-query-config-btn');
    cbtn.appendChild(document.createTextNode('Config'));
    //rSnippet.dom.appendChild(cbtn);
    //qSnippet.dom.appendChild(cbtn);
    var self = this;
    cbtn.addEventListener('click', function(){
		TerminusClient.FrameHelper.removeChildren(cdom);
        self.submitConfig(result, config, span, cdom);
    })
    return cbtn;
}


/*QueryPane.prototype.addResultViewerOLD = function(label, rule, ruleviewer){
	let rv = new ResultViewer(rule);
	if(ruleviewer) rv.setRuleViewer(ruleviewer);
	this.result_viewers[label] = rv;
	return this;
}

QueryPane.prototype.addResultViewer = function(rule){
	alert("rule " + JSON.stringify(rule));
	this.result_viewers.push(rule);
	return this;
}



QueryPane.prototype.addLibrary = function(lib){
	this.libraries.push(lib);
	return this;
}

QueryPane.prototype.render = function(lib){
	var qps = document.createElement("span");
	for(var i = 0; i<this.query_viewers.length; i++){
		var qv = this.query_viewers[i];
		if(qv){
			let v = qv.render();
			if(v) qps.appendChild(v);
		}
	}

	for(var k in this.result_viewers){
		var rv = this.result_viewers[k];
		if(rv){
			var x = rv.render();
			if(x) qps.appendChild(x);
		}
	}
	return qps;
}

function ResultViewer(rule){
	this.rules = [];
	if(rule) this.rules.push(rule);
}

ResultViewer.prototype.render = function(){
	alert("rv");
	var span = document.createElement("span");
	if(this.ruleviewer){
		let r = this.ruleviewer.render();
		if(r) span.appendChild(r);
	}
	return span;
}

ResultViewer.prototype.setRuleViewer = function(rv){
	this.ruleviewer = rv;
}

*/

module.exports = QueryPane;
