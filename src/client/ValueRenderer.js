const HTMLPropertyViewer = require('./PropertyViewer');
const RenderingMap = require('./RenderingMap');
const HTMLDataViewer = require('./DataViewer');

function ValueRenderer(dataframe, index, parent, options){
	this.frame = dataframe;
	this.index = index;
	this.parent = parent;
	this.originalValue = this.value();
	this.renderer_type = "value";
	this.options = this.setOptions(options);
}

ValueRenderer.prototype.depth = function(){return (this.parent ? this.parent.depth() : false);};
ValueRenderer.prototype.property = function(){ return (this.parent ? this.parent.property() : false);};
ValueRenderer.prototype.subject = function(){ return (this.parent ? this.parent.subject() : false);};
ValueRenderer.prototype.subjectClass = function(){ return (this.parent ? this.parent.subjectClass() : false);};
ValueRenderer.prototype.type = function(){	return (this.frame ? this.frame.range : false);};
ValueRenderer.prototype.range = function(){	return (this.frame ? this.frame.range : false);};
ValueRenderer.prototype.value = function(){	return (this.frame ? this.frame.get() : false);};
ValueRenderer.prototype.isDocument = function(){	return (this.frame ? this.frame.isDocument() : false);};
ValueRenderer.prototype.currentViewer = function(){	return this.viewerType;}

ValueRenderer.prototype.copy = function(nf){
	var nvr = new ValueRenderer(nf, false, this.parent, this.options);
	nvr.mode = this.mode;
	nvr.view = this.view;
	return nvr;
}

ValueRenderer.prototype.setFacet = function(facet){
	this.facet = facet;
	this.parent.redraw();
}

ValueRenderer.prototype.parentFacetChange = function(pfacet){
	if(pfacet == "page") this.setFacet("page");
	if(pfacet == "multiline") this.setFacet("line");
	if(pfacet == "line") this.setFacet("inline");
	if(pfacet == "summary") this.setFacet("icon");
}

ValueRenderer.prototype.getDefaultFacet = function(){
	if(this.parent.currentFacet() == "page" || this.parent.currentFacet() == "multiline"){
		return "line";
	}
	return "inline";
}

ValueRenderer.prototype.getAvailableFacets = function(){
	return Object.values(this.facets);
}

ValueRenderer.prototype.getDefaultFacets = function(){
	var defs = {
		page: {
			label: "Full Page", value: "page",
			features: ["facet", "type", "cardinality", "body", "status", "facet", "viewer", "control"],
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"]
		},
		line: {
			label: "Single Line", value: "line",
			features: ["facet", "type", "cardinality", "body", "status", "facet", "viewer", "control"],
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"]
		},
		inline: {
			label: "Inline", value: "inline",
			features: ["facet", "type", "cardinality", "body", "status", "facet", "viewer", "control"],
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"]
		},
		label: {
			label: "Label", value: "label",
			features: ["facet", "status", "body"],
			controls: []
		},
		icon: {
			label: "Snippet", value: "icon",
			features: ["facet", "summary"],
			controls: []
		}
	}
	return defs;
}

ValueRenderer.prototype.currentFacet = function(){
	return this.facet;
}

ValueRenderer.prototype.setOptions = function(options){
	return TerminusDashboard.RenderingMap.decorateRenderer(options, this);
}

ValueRenderer.prototype.hideDisabledControls = function(){
	return this.hide_disabled_controls;
}

ValueRenderer.prototype.setMode = function(mode){
	this.mode = mode;
	this.options.mode = mode;
	this.viewerType = false;
	this.redraw();
}

ValueRenderer.prototype.setView = function(view){
	this.view = view;
	this.options.view = view;
	this.redraw();
}

ValueRenderer.prototype.getAPIURL = function(a, b){
	if(this.parent && this.parent.parent){
		if(client = this.parent.parent.getClient()){
			var apiurl = client.dbURL() + a + "/" + b;
			return apiurl;
		}
	}
	return false;
}

ValueRenderer.prototype.getClient = function(){
	if(this.parent && this.parent.parent){
		return this.parent.parent.getClient();
	}
	return false;
}

ValueRenderer.prototype.getController = function(){
	if(this.parent && this.parent.parent){
		return this.parent.parent.getController();
	}
	return false;
}

ValueRenderer.prototype.DBURL = function(){
	if(this.parent && this.parent.parent){
		if(client = this.parent.parent.getClient()){
			return client.dbURL();
		}
	}
	return false;
}

ValueRenderer.prototype.getEntityReference = function(url, cls, entities, opts){
	if(this.parent && this.parent.parent){
		if(client = this.parent.parent.getClient()){
			return client.getEntityReference(url, cls, entities, opts);
		}
	}
}

ValueRenderer.prototype.badData = function(bd){
	alert("bad data " + bd);
}

ValueRenderer.prototype.setNew = function(){
	this.new_value = true;
}

ValueRenderer.prototype.isNew = function(){
	if(this.new_value){
		return true;
	}
	return this.parent.isNew();
}


ValueRenderer.prototype.isUpdated = function(){
	if(this.frame.get() != this.originalValue){
		return true;
	}
	return false;
}

ValueRenderer.prototype.getSummary = function(){
	var ret = { status: "ok" };
	if(this.isNew()) ret.status = "new";
	else if(this.isUpdated()) ret.status = "updated";
	var val = this.frame.get();
	if(val){
		if(val.length && val.length > this.text_summary_length){
			ret.long = val.substring(0, this.text_summary_length) + "..." + " (" + val.length + " characters)";
		}
		else {
			ret.long = val;
		}
	}
	else {
		ret.long = "empty";
	}
	return ret;
}

ValueRenderer.prototype.cardControlAllows = function(action){
	if(this.parent.cframe.hasRestriction()){
		var rest = this.parent.cframe.restriction;
		var currentnum = this.parent.values.length;
		if(action == "add" || action == "clone"){
			if(rest.max && currentnum >= rest.max){
				return false;
			}
		}
		if(action == "delete" && (rest.min && currentnum <= rest.min)){
			return false;
		}
	}
	return true;
}

ValueRenderer.prototype.set = function(v){
	this.frame.set(v);
	this.viewer.redrawHeader();
	this.parent.childUpdated();
}

ValueRenderer.prototype.delete = function(){
	this.parent.deletePropertyValue(this.value(), this.index);
	this.parent.parent.redraw();
}

ValueRenderer.prototype.load = function(link){
	this.parent.load(link);
}

ValueRenderer.prototype.hide = function(){
	this.setView("hidden");
}

ValueRenderer.prototype.show = function(){
	this.setView("full");
}

ValueRenderer.prototype.cancel = function(){
	this.reset();
	this.setMode("view");
}

ValueRenderer.prototype.save = function(){
	if(this.parent) {
		this.parent.save();
	}
}

ValueRenderer.prototype.reset = function(){
	this.set(this.originalValue);
	this.redraw();
}

ValueRenderer.prototype.clone = function(){
	var newb = this.parent.addPropertyValue(this.value());
	var nrend = this.copy(newb);
	nrend.setNew();
	nrend.mode = "edit";
	nrend.index = this.parent.values.length;
	this.parent.values.push(nrend);
	this.parent.childUpdated();
	this.parent.redraw();
	this.parent.goToValue(this.parent.values.length-1);
}

ValueRenderer.prototype.getViewerForValue = function(){
	return new HTMLDataViewer.HTMLDataViewer(this);
}

ValueRenderer.prototype.getFeaturesForFacet = function(facet){
	return this.facets[facet].features.concat(this.facets[facet].controls);
}

ValueRenderer.prototype.showFeature = function(which){
	if(this.features.indexOf(which) == -1 && this.controls.indexOf(which) == -1) {
		return false;
	}
	var cardcontrols = ["delete", "clone", "add"];
	if(cardcontrols.indexOf(which) != -1){
		if(!this.cardControlAllows(which)) return false;
	}
	var updcontrols = ["update", "reset"];
	if(this.hideDisabledControls() && updcontrols.indexOf(which) != -1 ){
		if(!this.isUpdated()){
			return false;
		}
	}
	if(which == 'hide' && this.view == "hidden") return false;
	if(which == 'show' && this.view != "hidden") return false;
	var fets = this.getFeaturesForFacet(this.facet);
	return (fets.indexOf(which) != -1);
}


ValueRenderer.prototype.render = function(viewer){
	this.viewer = (viewer ? viewer : this.getViewerForValue());
	return this.viewer.render();
}

ValueRenderer.prototype.extract = function(){
	var val = this.value();
	if(val !== "" && val !== false){
		if(this.frame.isDatatypeProperty()){
			var objlit = { "@value": this.value()}
			//var objlit = { data: this.value()}
			if(this.frame.isString()) objlit["@language"] = this.frame.lang();
			else objlit["@type"] = this.type();
			return objlit;
		}
		else if(this.frame.isChoice() || this.frame.isDocument()){
			return {"@id": val}
		}
	}
	else return val;
}

ValueRenderer.prototype.getValueHeaderViewer = function(){
	return new HTMLDataViewer.HTMLDataHeaderViewer();
}

ValueRenderer.prototype.getDataValueViewer = function(){
	if(!this.viewerType) {
		this.viewerType = this.getViewerForDataValue();
	}
	return TerminusDashboard.RenderingMap.getViewer(this.viewerType, this.viewerOptions);
}

ValueRenderer.prototype.getAvailableViewers = function(){
	var dt = this.frame.getTypeShorthand();
	if(!dt){
		//alert("here");
	}
	var ft = this.frame.ftype();
	if(this.mode == "view"){
		return TerminusDashboard.RenderingMap.getAvailableDataViewers(dt, ft);
	}
	return TerminusDashboard.RenderingMap.getAvailableDataEditors(dt, ft);
}

ValueRenderer.prototype.setViewer = function(viewer){
	this.viewerType = viewer;
	this.redraw();
}

ValueRenderer.prototype.getViewerForDataValue = function(){
	var dt = this.frame.getTypeShorthand();
	var ft = this.frame.ftype();
	if(this.mode == "edit"){
		return TerminusDashboard.RenderingMap.getEditorForDataFrame(dt, ft);
	}
	return TerminusDashboard.RenderingMap.getViewerForDataFrame(dt, ft);
}

ValueRenderer.prototype.redraw = function(){
	this.viewer.clear();
	this.render(this.viewer);
}





module.exports=ValueRenderer
