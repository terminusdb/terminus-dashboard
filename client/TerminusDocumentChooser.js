/*
 * Utility class which allows the user to choose a document by id or by label (if select2 and full text indexing is turned on)
 */

TerminusDocumentChooser = function(ui, root, value, view){
	this.ui = ui;
	this.root = root;
	//this.filter = (currentcls ? FrameHelper.unshorten(currentcls) : false);
	this.choice = value;
	this.view = (view ? view : "id");
	this.show_button = true;
}

TerminusDocumentChooser.prototype.setRoot = function(root){
	this.root = root;
}

TerminusDocumentChooser.prototype.setFilter = function(filter){
	this.filter = filter;
}

TerminusDocumentChooser.prototype.change = function(docid){
	alert("Need to specify doc chooser function (" + docid + ")");
}

TerminusDocumentChooser.prototype.getAsDOM = function(style){
	if(this.view == "label" && 	this.ui.client.platformEndpoint() && this.ui.pluginAvailable("select2")){
		return this.getS2DOM(style);
	}
	return this.getIDDOM();
}

TerminusDocumentChooser.prototype.getS2DOM = function(style){
	var docchooser = document.createElement("span");
	docchooser.setAttribute("class", "terminus-document-chooser terminus-doc-holder");
	var wq = new WOQLQuery(this.ui.client, {});
	var cfilter = wq.getSubclassQueryPattern("Class", "'"+this.root+"'");
	var termcc = new TerminusClassChooser(this.ui, cfilter);
	termcc.empty_choice = "Filter by Type";
	termcc.show_single = false;
	var self = this;
	termcc.change = function(new_class){
		if(new_class){
			self.filter = new_class;
		}
	}
	tdom = termcc.getAsDOM(style);
	if(tdom) docchooser.appendChild(tdom);
	var holder = document.createElement("span");
	holder.setAttribute("class", "terminus-entity-reference-value");
	var sel = document.createElement("select");
	sel.setAttribute("class", "terminus-entity-class-input");
	holder.appendChild(sel);
	var opt = document.createElement("option");
	var lookup = function (params) {
		params.class = self.filter;
		return JSON.stringify(params);
    }
	var searchurl = this.ui.client.dbURL() + "/search";
	var s2config = {
		ajax: {
		    url: searchurl,
		    dataType: 'json',
		    data: lookup,
		    type: "POST",
			contentType: "application/json; charset=utf-8",
		    delay: 250,
		    cache: true
		},
		placeholder: "Enter Document Name",
		width: 200
	};
	jQuery(sel).select2(s2config).change(function(){
		callback(this.value);
	});
	docchooser.appendChild(holder);
	return docchooser;
}

TerminusDocumentChooser.prototype.getIDDOM = function(){
	var docchooser = document.createElement("span");
	docchooser.setAttribute("class", "terminus-document-chooser terminus-doc-holder");
	var dcip = document.createElement("input");
	dcip.setAttribute("class", "terminus-document-chooser terminus-query-text");
	//11092019 dcip.setAttribute("class", "terminus-form-value terminus-document-chooser");
	dcip.setAttribute("placeholder", "Enter Document ID");
	dcip.addEventListener('keypress', function(e){
		var key = e.which || e.keyCode;
		// on enter
		if (key === 13 && dcip.value) {
			self.choice = dcip.value;
			self.change(dcip.value);
		}
	});
	docchooser.appendChild(dcip);
	if(this.show_button){
		var dbut = document.createElement("button");
		dbut.setAttribute("class", "terminus-control-button terminus-query-go-btn");
		var self = this;
		dbut.addEventListener("click", function(){
			if(dcip.value) {
				self.choice = dcip.value;
				self.change(dcip.value);
			}
		});
		//11092019 dbut.appendChild(document.createTextNode("View Document Properties"));
		dbut.appendChild(document.createTextNode("Go"));
		docchooser.appendChild(dbut);
	}
	return docchooser;
}

TerminusDocumentChooser.prototype.toggleView = function(){
	if(this.view == "id") this.view = "label";
	else this.view = "id";
}

TerminusDocumentChooser.prototype.getChangeViewText = function(){
	if(this.view == "id"){
		return "Document Lookup";
	}
	return "Load Document ID";
}
