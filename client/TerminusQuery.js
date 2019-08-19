function TerminusQueryViewer(ui, query, options){
	this.ui = ui;
	this.options;
	this.wquery = new WOQLQuery(this.ui.client, this.options);
	this.init(query);
}

TerminusQueryViewer.prototype.init = function(q){
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

TerminusQueryViewer.prototype.query = function(val, qresults){
	var self = this;
	FrameHelper.removeChildren(qresults);
	this.wquery.execute(val)
	.then(function(result){
		qresults.appendChild(document.createTextNode("Results: "));
		var rv = new WOQLResultsViewer(result, this.options);
		var nd = rv.getDOM();
		if(nd){
			qresults.appendChild(nd);
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
	var qres = document.createElement("div");
	qres.setAttribute("class", "terminus-query-results");
	var qquery = document.createElement("div");
	var qip = document.createElement("textarea");
	qip.setAttribute("class", "terminus-query-box");
	qip.setAttribute("placeholder", "enter your query");
	qip.setAttribute("style", "min-width: 400px; min-height: 60px;");
	if(q) qip.value = q;
	qquery.appendChild(qip);
	var self = this;
	var qbut = document.createElement("button");
	qbut.setAttribute("class", "terminus-control-button")
	qbut.appendChild(document.createTextNode("Send Query"));
	qbut.addEventListener("click", function(){
		self.query(qip.value, qres);
	})
	var qbuts = document.createElement("div");
	qbuts.setAttribute("class", "terminus-control-buttons");
	qbuts.appendChild(qbut);
	qbox.appendChild(qres);
	qbox.appendChild(qquery);
	qbox.appendChild(qbuts);
	var qexs = document.createElement("div");
	qexs.setAttribute("class", "terminus-query-examples");
	var qh = document.createElement("H3");
	qh.appendChild(document.createTextNode("Examples"));
	qexs.appendChild(qh)
	var nqbut = document.createElement("button");
	nqbut.appendChild(document.createTextNode("Show All Classes"));
	nqbut.setAttribute("class", "terminus-control-button");
	nqbut.addEventListener("click", function(){
		qip.value = self.wquery.getClassMetaDataQuery(); 
		self.query(qip.value, qres);
	})

	var aqbut = document.createElement("button");
	aqbut.appendChild(document.createTextNode("Show Document Classes"));
	aqbut.setAttribute("class", "terminus-control-button");
	aqbut.addEventListener("click", function(){
		qip.value = self.wquery.getClassMetaDataQuery(self.wquery.getSubclassQueryPattern("Class", "dcog/'Document'") + ", not(" + self.wquery.getAbstractQueryPattern("Class") + ")");
		self.query(qip.value, qres);
	})

	var ebut = document.createElement("button");
	ebut.appendChild(document.createTextNode("Show All Schema Elements"));
	ebut.setAttribute("class", "terminus-control-button");
	ebut.addEventListener("click", function(){
		qip.value = self.wquery.getElementMetaDataQuery(); 
		self.query(qip.value, qres);
	})
	var dbut = document.createElement("button");
	dbut.appendChild(document.createTextNode("Show All Documents"));
	dbut.setAttribute("class", "terminus-control-button");
	dbut.addEventListener("click", function(){
		qip.value = self.wquery.getDocumentQuery(); 
		self.query(qip.value, qres);
	})
	var pbut = document.createElement("button");
	pbut.appendChild(document.createTextNode("Show All Data"));
	pbut.setAttribute("class", "terminus-control-button");
	pbut.addEventListener("click", function(){
		qip.value = self.wquery.getEverythingQuery(); 
		self.query(qip.value, qres);
	})
		
	qexs.appendChild(nqbut);
	qexs.appendChild(ebut);
	qexs.appendChild(dbut);
	qexs.appendChild(pbut);
	qexs.appendChild(aqbut);
	qbox.appendChild(qexs);
	return qbox;
}

