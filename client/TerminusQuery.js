function TerminusQueryViewer(ui, options){
	this.ui = ui;
	this.options = options;
	this.meta = {};
	this.init();
	this.generator = false;
	this.result = false;
	this.wquery = new WOQLQuery(ui.client, this.options);
	this.results_first = true;
	this.gentype = (options && options.generator ? options.generator : "textbox");
	this.generators = {
		"textbox" : { label: "Simple Text Box", value: "textbox"},
	}
	if(ui.pluginAvailable("jqueryui")){
		this.generators.gbrowse = { label: "Graph Browser", value: "gbrowse"};
	}
	this.loadGenerator();
}


TerminusQueryViewer.prototype.changeGenerator = function(ng){
	if(this.gentype != ng){
		this.gentype = ng;
		this.loadGenerator();
		this.redrawGenerator();
	}
}
TerminusQueryViewer.prototype.redrawGenerator = function(q){
	FrameHelper.removeChildren(this.inputDOM);
	this.inputDOM.appendChild(this.getQueryInputDOM(q));
}

TerminusQueryViewer.prototype.loadGenerator = function(){
	var self = this;
	var nquery = function(q){
		self.query(q)
	}
	if(this.gentype == "textbox"){
	//	this.generator = new WOQLTextboxGenerator(nquery, this, this.ui);
	}
	else if(this.gentype == "gbrowse"){
		//this.generator = new WOQLGraphBrowserGenerator(nquery, this, this.ui);
	}
}

TerminusQueryViewer.prototype.init = function(){
	var wq = new WOQLQuery(this.ui.client, this.options);
	var woql = wq.getElementMetaDataQuery();
	var self = this;
	self.meta = {};
	wq.execute(woql).then(function(wresult){
		if(wresult.hasBindings()){
			for(var i = 0; i<wresult.bindings.length; i++){
				var el = wresult.bindings[i].Element;
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

TerminusQueryViewer.prototype.query = function(val){
	var self = this;
	FrameHelper.removeChildren(this.resultDOM);
	this.wquery.execute(val)
	.then(function(result){
		if(true || !self.result){
			self.result = new WOQLResultsViewer(result, self.options);
		}
		else {
			//self.result.newResult(result);
		}
		var nd = self.result.getAsDOM();
		if(nd){
			self.resultDOM.appendChild(nd);
		}
	})
	.catch(function(err){
		console.error(err);
		self.ui.showError(err);
	});
}

TerminusQueryViewer.prototype.getAsDOM = function(q){
	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-page");
	qbox.appendChild(this.getQueryCreatorChoiceDOM(q));
	this.resultDOM = document.createElement("div");
	this.resultDOM.setAttribute("class", "terminus-query-results");
	this.inputDOM = document.createElement("div");
	this.inputDOM.setAttribute("class", "terminus-query-input");
	this.inputDOM.appendChild(this.getQueryInputDOM(q));
	if(this.results_first){
		qbox.appendChild(this.resultDOM);
		qbox.appendChild(this.inputDOM);
	}
	else {
		qbox.appendChild(this.inputDOM);
		qbox.appendChild(this.resultDOM);
	}
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

TerminusQueryViewer.prototype.getQueryInputDOM = function(q){
	//input options ...
	//this.inputDOM.appendChild(this.getQueryCreatorChoiceDOM());
	return this.generator.getAsDOM(q);
}
