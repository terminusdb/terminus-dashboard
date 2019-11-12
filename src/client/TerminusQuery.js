/*const WOQLQuery = require('../query/WOQLQuery'); */
const WOQLResultsViewer = require('../query/WOQLResultsViewer');
const WOQLTextboxGenerator = require('../query/WOQLTextboxGenerator');
const TerminusPluginManager = require('../plugins/TerminusPlugin');
const HTMLFrameHelper = require('./HTMLFrameHelper');
const TerminusClient = require('@terminusdb/terminus-client');

function TerminusQueryViewer(ui, options){
	this.ui = ui;
	this.options = options;
	this.meta = {};
	this.init();
	this.generator = false;
	this.result = false;
	//var y = new TerminusClient.WOQLResult();
	//this.wquery = TerminusClient.WOQL;
	this.pman = new TerminusPluginManager();
	this.gentype = (options && options.generator ? options.generator : "textbox");
	this.generators = {
		"textbox" : { label: "Simple Text Box", value: "textbox"},
	}
	this.loadGenerator();
}

TerminusQueryViewer.prototype.hasGeneratorOptions = function(){
	return false;
	var yup = false;
	for(var gen in this.generators){
		if(yup) return true;
		else yup = true;
	}
	return false;
}

TerminusQueryViewer.prototype.changeGenerator = function(ng){
	if(this.gentype != ng){
		this.gentype = ng;
		this.loadGenerator();
		this.redrawGenerator();
	}
}
TerminusQueryViewer.prototype.redrawGenerator = function(q){
	TerminusClient.FrameHelper.removeChildren(this.inputDOM);
	this.inputDOM.appendChild(this.getQueryButtonsDOM(q));
}

TerminusQueryViewer.prototype.loadGenerator = function(){
	var self = this;
	var nquery = function(q, settings){
		self.query(q, settings)
	}
	if(this.gentype == "textbox"){
		this.generator = new WOQLTextboxGenerator(nquery, this, this.ui);
	}
}

TerminusQueryViewer.prototype.init = function(){
	//var wq = new WOQLQuery(this.ui.client, this.options, this.ui);
	var wq = TerminusClient.WOQL
				.limit(20)
				.start(0)
				.elementMetadata();
	var self = this;
	self.meta = {};
	//wq.execute(woql).then(function(wresult){
	wq.execute(this.ui.client).then(function(wresult){
		var wqlR = new WOQLResultsViewer.WOQLResult(wresult, null ,null, self.ui);
		if(wqlR.hasBindings(wresult)){
			for(var i = 0; i<wresult.bindings.length; i++){
				var el = HTMLFrameHelper.getVariableValueFromBinding("Element", wresult.bindings[i]);
				if(el && typeof self.meta[el] == "undefined"){
					self.meta[el] = wresult.bindings[i];
				}
			}
		}
	})
	.catch(function(e){
		console.error(e);
	});
}

TerminusQueryViewer.prototype.query = function(val, settings, tab){
	var self = this;
	TerminusClient.FrameHelper.removeChildren(this.resultDOM);
	val.execute(this.ui.client)
	.then(function(result){
		var wqRes = new TerminusClient.WOQLResult(result, val);
		self.result = new WOQLResultsViewer.WOQLResultsViewer(self.ui, result, wqRes, self.options, settings, true);
		var nd = self.result.getAsDOM(self.resultDOM, true);
		if(nd){
			 self.resultDOM.appendChild(nd);
		}
	})
	.catch(function(err){
		self.ui.showError(err);
	});
}

TerminusQueryViewer.prototype.getResultViewDom = function(){
	this.resultDOM = document.createElement("div");
	this.resultDOM.setAttribute("class", "terminus-query-results");
}

TerminusQueryViewer.prototype.getAsDOM = function(q){
	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-page");
	if(this.hasGeneratorOptions()){
		qbox.appendChild(this.getQueryCreatorChoiceDOM(q));
	}
	this.resultDOM = document.createElement("div");
	this.resultDOM.setAttribute("class", "terminus-query-results terminus-query-section");

	var qtHolder = document.createElement('span');
	qtHolder.setAttribute('style', 'display: flex;');

	this.qTextBox = this.getQueryTextAreaDOM(q, qtHolder);
	this.buttonsDOM = document.createElement("span");
	this.buttonsDOM.setAttribute("class", "terminus-query-input");
	this.buttonsDOM.appendChild(this.getQueryButtonsDOM(q, this.qTextBox));

	qtHolder.appendChild(this.buttonsDOM);

	qbox.appendChild(qtHolder);
	qbox.appendChild(this.resultDOM);
	return qbox;
}

TerminusQueryViewer.prototype.getQueryCreatorChoiceDOM = function(){
	var qcc = document.createElement("select");
	qcc.setAttribute("class", "terminus-query-generator-selector");
	for(var c in this.generators){
		var gen = this.generators[c];
		var opt = document.createElement("option");
		opt.value = (gen.value ? gen.value : c);
		var lab = (gen.label ? gen.label : c);
		opt.appendChild(document.createTextNode(lab));
		qcc.appendChild(opt);
	}
	var self = this;
	qcc.addEventListener("change", function(){
		self.changeGenerator(this.value);
	});
	return qcc;
}

TerminusQueryViewer.prototype.getQueryButtonsDOM = function(q, qip){
	return this.generator.getAsDOM(q, qip);
}

TerminusQueryViewer.prototype.getQueryTextAreaDOM = function(q, box){
	return this.generator.getQueryTextAreaDOM(q, box);
}

module.exports=TerminusQueryViewer
