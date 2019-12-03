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
}

QueryPane.prototype.options = function(opts){
	this.showQuery = (opts && typeof opts.showQuery != "undefined" ? opts.showQuery : true);
	this.editQuery = (opts && typeof opts.editQuery != "undefined" ? opts.editQuery : true);
	this.addViews = (opts && typeof opts.addViews != "undefined" ? opts.addViews : false);
	this.intro = (opts && typeof opts.intro != "undefined" ? opts.intro : false);
	this.defaultResultView = { showConfig: "true", editConfig: "true" };
    return this;
}

QueryPane.prototype.getAsDOM = function(){
	if(this.intro){
		this.container.appendChild(UTILS.getHeaderDom(this.intro));
	}
	//this.container.appendChild(document.createElement('BR'));
	if(this.showQuery) {
		var configspan = document.createElement("span");
		configspan.setAttribute("class", "pane-config-icons");
		this.container.appendChild(configspan);
		var mode = (this.editQuery ? "edit" : "view");
		this.input = this.createInput(mode);
		var ipdom = this.input.getAsDOM(true);
		var ispan = document.createElement("span");
		ispan.setAttribute("class", "query-pane-config");
		var ic = document.createElement("i");
		ic.setAttribute('style', 'margin:10px;')
		configspan.appendChild(ic);
		var self = this;
		function showQueryConfig(){
			configspan.title="Click to Hide Query";
			ic.setAttribute("class", "fas fa fa-times-circle");
			if(configspan.nextSibling){
				self.container.insertBefore(ipdom, configspan.nextSibling);
				if(self.input.snippet.value)
					self.input.stylizeSnippet();
			}
			else {
				self.container.appendChild(ipdom);
				if(self.input.snippet.value)
					self.input.stylizeSnippet();
			}
		}
		function hideQueryConfig(){
			configspan.title="Click to View Query";
            ic.setAttribute("class", "fas fa fa-atom");
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
	//var form = (this.input.format == "js" ? "javascript" : "json");
	//UTILS.stylizeEditor(ui, this.input.snippet, {width: this.input.width, height: this.input.height}, form);
	if(this.views.length == 0){
		this.addView(TerminusClient.WOQL.table(), this.defaultResultView);
	}
	//this is where we want to put in the view headers in the case of the query page
	for(var i = 0; i<this.views.length; i++){
		var vdom = this.views[i].getAsDOM();
		if(vdom){
			this.resultDOM.appendChild(vdom);
		}
	}
	this.container.appendChild(this.resultDOM);
	if(this.addViews) this.container.appendChild(this.getAddViewControl());
	return this.container;
}

QueryPane.prototype.createInput = function(mode){
    let input = new TerminusCodeSnippet("woql", mode);
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

QueryPane.prototype.clearMessages = function(){}
QueryPane.prototype.showError = function(){}

QueryPane.prototype.submitQuery = function(qObj){
	this.clearMessages();
    this.query = qObj;
    qObj.execute(this.client).then((results) => {
		var r = new TerminusClient.WOQLResult(results, qObj);
		this.result = r;
		this.refreshViews();
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
