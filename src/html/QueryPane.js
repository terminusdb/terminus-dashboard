const TerminusClient = require('@terminusdb/terminus-client');
const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const WOQLRule = require("../viewer/WOQLRule");
const UTILS = require('../Utils');

function QueryPane(client, query, result){
	this.client = client;
	this.query = query;
	this.result = result;	
    this.input = new TerminusCodeSnippet("woql", "edit");
    this.views = [];
    if(this.query){
    	this.input.setQuery(this.query);
    }
    this.container = document.createElement('div');
    this.container.setAttribute('class', 'terminus-query-pane-cont');
}

QueryPane.prototype.addView = function(config){
	this.views.push(config);
}

QueryPane.prototype.getAsDOM = function(ui){
	this.container.appendChild(UTILS.getHeaderDom('Enter New Query'));
	this.container.appendChild(this.input.getAsDOM()); 
	var form = (this.input.format == "js" ? "javascript" : "json");
	UTILS.stylizeEditor(ui, this.input.snippet, {width: this.input.width, height: this.input.height}, form);
	if(this.views.length){
		for(var i = 0; i<this.views.length; i++){
			var vdom = this.getViewDOM(this.views[i], ui);
			if(vdom){
				this.container.appendChild(vdom); 
			}				
		}
	}
	else {
		var nview = TerminusClient.WOQL.table();
		var vdom = this.getViewDOM(nview, ui);
		if(vdom){
			this.container.appendChild(vdom); 
		}
		this.views.push(nview);
	}
	return this.container;
}

QueryPane.prototype.options = function(options){
	this.options = options;
	return this;
}

/*
descr: Returns Add View button
params: query object, query snippet
*/
QueryPane.prototype.getViewDOM = function(config, ui){
	let editor = new TerminusCodeSnippet("rule", "edit");
	var self = this;
	editor.submit = function(qObj){
		self.submitQuery(qObj, ui);
	}
	if(editor.setQuery(config)){
		config.editor = editor;
	}
	else {
		//if(config.)
	}
	if(this.result){
		
	}
	return editor.getAsDOM();
}

QueryPane.prototype.submitQuery = function(qObj, ui){
    if(ui) ui.clearMessages();
    this.query = qObj;
    qObj.execute(self.client).then((results) => {
        self.processResults(qObj, WOQL, self.thv, results, qSnippet);
        self.addView(WOQL, qSnippet);
        self.generateResultsFromRules(WOQL, qSnippet);
    })
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


QueryPane.prototype.getAddViewControl = function(){ 
	var vd = document.createElement('div');
	vd.setAttribute('class', 'terminus-add-view-editor');
	var cbtn = document.createElement('button');
	vd.appendChild(cbtn);
	cbtn.setAttribute('style', 'margin-top: 10px;');
	cbtn.setAttribute('class', 'terminus-btn');
	cbtn.appendChild(document.createTextNode('Add View'));
	qSnippet.result.appendChild(vd);
	var self = this;
	cbtn.addEventListener('click', function(){
	    let editor = self.showRuleEditor(woql, vd, qSnippet);
	})
	return vd;
}


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
} */

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



module.exports = QueryPane;
