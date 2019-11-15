const TerminusPluginManager = require('./plugins/TerminusPlugin');
const HTMLFrameHelper = require('./html/HTMLFrameHelper');
const TerminusClient = require('@terminusdb/terminus-client');
const TerminusHTMLViewer = require("./TerminusHTMLViewer");

function TerminusQueryViewer(ui, options){
	this.ui = ui;
	this.options = options;
	this.meta = {};
	this.pman = new TerminusPluginManager();
	this.thv = new TerminusHTMLViewer(ui.client);
}

TerminusQueryViewer.prototype.query = function(val, settings, tab){
	var self = this;
	TerminusClient.FrameHelper.removeChildren(this.resultDOM);
	this.wquery.execute(val)
	.then(function(result){
		self.result = new WOQLResultsViewer.WOQLResultsViewer(self.ui, result, self.wquery, self.options, settings, true);
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
	var qvc = {
			inputs: {"js": {}, "json": {}},
			results: {"table": {}, "graph": {}, "stream" : {}}
		};

	var wqv = this.thv.querypane(q, this.qvc);



	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-page");
	qbox.setAttribute("style", "2px solid black");
	if(wqv){
		qbox.appendChild(wqv);
	}

	/*var woql = TerminusClient.WOQL.from(this.ui.client.connectionConfig.dbURL()).limit(30).start(0).simpleGraphQuery();
	var wqv = this.thv.woql(woql, this.qvc);
	if(wqv){
		qbox.appendChild(wqv);
	}
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
	qbox.appendChild(this.resultDOM);*/
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


module.exports=TerminusQueryViewer
