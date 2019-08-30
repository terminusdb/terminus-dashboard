function WOQLTextboxGenerator(tq, qman, ui){
	this.query = tq;
	this.wquery = qman.wquery;
	this.pman = new TerminusPluginManager();
	this.ui = ui;
}

WOQLTextboxGenerator.prototype.stylizeEditor = function(txt){
	if(this.pman.pluginAvailable("codemirror")){
		var cm = new Codemirror(txt, 'javascript');
		var ar = cm.colorizeTextArea('query');
		cm.updateTextArea(ar);
	}
}

WOQLTextboxGenerator.prototype.deleteStylizedEditor = function(qip){
	if(this.pman.pluginAvailable("codemirror")){
		var cm = qip.nextElementSibling;
		cm.setAttribute('class', 'terminus-hide');
		FrameHelper.removeChildren(cm);
	}
}

WOQLTextboxGenerator.prototype.getAsDOM = function(q){
	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-textbox-input");
	var qip = document.createElement("textarea");
	qip.setAttribute("class", "terminus-query-box");
	qip.setAttribute("placeholder", "Enter new query or load queries from example buttons provided below ...");
	qip.setAttribute("style", "min-width: 400px; min-height: 60px;");
	if(q) qip.value = q;
	qbox.appendChild(qip);
	this.stylizeEditor(qip);
	var self = this;
	var qbut = document.createElement("button");
	qbut.setAttribute("class", "terminus-control-button terminus-btn")
	qbut.appendChild(document.createTextNode("Send Query"));
	qbut.addEventListener("click", function(){
		self.query(qip.value);
	})
	var qbuts = document.createElement("div");
	qbuts.setAttribute("class", "terminus-control-buttons");
	qbuts.appendChild(qbut);
	qbox.appendChild(qbuts);
	var qexs = document.createElement("div");
	qexs.setAttribute("class", "terminus-query-examples terminus-db-list-title ");
	var qh = document.createElement("H3");
	qh.appendChild(document.createTextNode("Examples"));
	qh.setAttribute('class', 'terminus-full-css-margin-top terminus-module-head');
	qexs.appendChild(qh);
	var nqbut = document.createElement("button");
	nqbut.appendChild(document.createTextNode("Show All Classes"));
	nqbut.setAttribute("class", "terminus-control-button terminus-btn");
	nqbut.addEventListener("click", function(){
		self.deleteStylizedEditor(qip);
		qip.value = self.wquery.getClassMetaDataQuery();
		self.stylizeEditor(qip);
		self.query(qip.value);
	})

	var aqbut = document.createElement("button");
	aqbut.appendChild(document.createTextNode("Show Document Classes"));
	aqbut.setAttribute("class", "terminus-control-button terminus-btn");
	aqbut.addEventListener("click", function(){
		self.deleteStylizedEditor(qip);
		qip.value = self.wquery.getClassMetaDataQuery(self.wquery.getSubclassQueryPattern("Class", "dcog/'Document'")
														+ ", not(" + self.wquery.getAbstractQueryPattern("Class") + ")");
		self.stylizeEditor(qip);
		self.query(qip.value);
	})

	var ebut = document.createElement("button");
	ebut.appendChild(document.createTextNode("Show All Schema Elements"));
	ebut.setAttribute("class", "terminus-control-button terminus-btn");
	var self = this;
	ebut.addEventListener("click", function(){
		self.deleteStylizedEditor(qip);
		qip.value = self.wquery.getElementMetaDataQuery();
    	self.stylizeEditor(qip);
		self.query(qip.value);
	})
	var dbut = document.createElement("button");
	dbut.appendChild(document.createTextNode("Show All Documents"));
	dbut.setAttribute("class", "terminus-control-button terminus-btn");
	dbut.addEventListener("click", function(){
		self.deleteStylizedEditor(qip);
		qip.value = self.wquery.getAllDocumentQuery();
		self.stylizeEditor(qip);
		self.query(qip.value);
	})
	var pbut = document.createElement("button");
	pbut.appendChild(document.createTextNode("Show All Data"));
	pbut.setAttribute("class", "terminus-control-button terminus-btn");
	pbut.addEventListener("click", function(){
		self.deleteStylizedEditor(qip);
		qip.value = self.wquery.getEverythingQuery();
		self.stylizeEditor(qip);
		self.query(qip.value);
	})

	var prbut = document.createElement("button");
	prbut.appendChild(document.createTextNode("Show All Properties"));
	prbut.setAttribute("class", "terminus-control-button terminus-btn");
	prbut.addEventListener("click", function(){
		self.deleteStylizedEditor(qip);
		qip.value = self.wquery.getPropertyListQuery();
		self.stylizeEditor(qip);
		self.query(qip.value);
	})

	var termcc = new TerminusClassChooser(this.ui);
	termcc.empty_choice = "Choose a class to view data ...";
	var self = this;
	termcc.change = function(new_class){
		if(new_class){
			self.deleteStylizedEditor(qip);
			qip.value = self.wquery.getDataOfChosenClassQuery(new_class);
			self.stylizeEditor(qip);
			self.query(qip.value);
		}
	}
	var tcdom = termcc.getAsDOM();

	var termpc = new TerminusPropertyChooser(this.ui);
	termpc.empty_choice = "Choose a property to view data ...";
	var self = this;
	termpc.change = function(new_property){
		if(new_property){
			self.deleteStylizedEditor(qip);
			qip.value = self.wquery.getDataOfChosenPropertyQuery(new_property);
			self.stylizeEditor(qip);
			self.query(qip.value);
		}
	}
	var pdom = termpc.getAsDOM();

	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-form-value terminus-document-chooser terminus-doc-input-text");
	dcip.setAttribute("placeholder", "Enter Document ID");
	dcip.addEventListener('keypress', function(e){
		// on enter
		var key = e.which || e.keyCode;
		if (key === 13) { // 13 is enter
			self.deleteStylizedEditor(qip);
    		qip.value = self.wquery.getDocumentQuery(dcip.value);
    		self.stylizeEditor(qip);
    		self.query(qip.value);
		}
	})

	qexs.appendChild(ebut);
	qexs.appendChild(nqbut);
	qexs.appendChild(aqbut);
	qexs.appendChild(prbut);
	qexs.appendChild(dbut);
	qexs.appendChild(pbut);
	qbox.appendChild(qexs);
	qbox.appendChild(tcdom);
	qbox.appendChild(pdom);
	qbox.appendChild(dcip);

	return qbox;
}
