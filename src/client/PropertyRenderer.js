const FrameHelper = require('../FrameHelper');
const ValueRenderer = require('./ValueRenderer');
const RenderingMap = require('./RenderingMap');
const PropertyViewer = require('./PropertyViewer');
const ObjectRenderer = require('./ObjectRenderer');

function PropertyRenderer(prop, parent, options){
	this.predicate = prop;
	this.parent = parent;
	this.cframe = this.parent.objframe.getPropertyClassFrame(this.predicate);
	this.options = this.setOptions(options);
	this.originalValues = false;
	this.changed = false;
	this.values = [];
}

PropertyRenderer.prototype.setOptions = function(options){
	return RenderingMap.decorateRenderer(options, this);
}


PropertyRenderer.prototype.getOptionsForChild = function(){
	var opts = {};
	if(this.options.features){ opts.features = this.options.features };
	if(this.options.controls){ opts.controls = this.options.controls};
	//return opts;
	return this.options;
}

PropertyRenderer.prototype.getOptionsForValue = function(df, index){
	return this.getOptionsForChild();
}

PropertyRenderer.prototype.getOptionsForObject = function(objframe){
	return this.getOptionsForChild();
}


PropertyRenderer.prototype.render = function(viewer){
 	this.buildValueRenderers();
 	if(this.cframe && this.cframe.property){
 		this.viewer = (viewer ? viewer : this.getViewerForProperty());
 		for(var i = 0; i<this.values.length; i++){
 			var renderedval = this.values[i].render();
 			if(renderedval && this.showFeature("body")) this.viewer.addRenderedValue(renderedval);
 		}
 		return this.viewer.render();
 	}
} 

/*
 * Creates the array of object renderer or value renderer objects corresponding to the property values. 
 */
PropertyRenderer.prototype.buildValueRenderers = function(){
 	var adorig = (this.originalValues === false ? true : false);
 	this.cframe = this.parent.objframe.getPropertyClassFrame(this.predicate);
 	if(!this.cframe){
 		console.error("No frame for " + this.property() + " id: " + this.subject());
 		return false;
 	}
 	if(this.cframe && this.cframe.isData()){
 		var dataframes = this.getDataFramesToRender();
 		if(dataframes.length == 0){
 			alert(this.predicate);
 		}
 		var vals = [];
 		for(var i = this.values.length; i<dataframes.length; i++){
 			var vr = new ValueRenderer(dataframes[i], i, this, this.getOptionsForValue(dataframes[i], i));
 			this.values.push(vr);
 			vals.push(vr.value());
 		}
 		if(adorig) this.originalValues = vals;
 	}
 	else {
 		if(adorig) this.originalValues = [];
 		var kids = this.getChildrenToRender();
 		if(kids && kids.length){
 			for(var i = this.values.length; i<kids.length; i++){
 				try {
	 				var kidf = new ObjectRenderer(kids[i], this, this.getOptionsForObject(kids[i]));
	 				if(adorig) this.originalValues.push(kidf.subject());
	 				this.values.push(kidf);
 				}
 				catch(e){
 					alert(JSON.stringify(ObjectRenderer));
 					alert(e.toString() + " " + i);
 					alert(typeof ObjectRenderer);
 				}
 			}
 		}
 	}
}

/*
 * Returns the array of values that should be rendered (enables value filtering)
 */
PropertyRenderer.prototype.getDataFramesToRender = function(options){
 	var allvals = this.parent.objframe.getDataFrames(this.property());
 	return allvals;
}

/*
 * Returns the array of child / objects that should be rendered (enables value filtering)
 */
PropertyRenderer.prototype.getChildrenToRender = function(options){
 	/*var sort = this.standardSort;
 	var filter = function(){return true};
 	for(var i = 0; i<options.map.patterns.length; i++){
 		if(this.objframe.matchesPattern("sort", options.map.patterns[i])){
 			sort = options.map.patterns[i].sort;
 		}
 		if(this.objframe.matchesPattern("filter", options.map.patterns[i])){
 			filter = options.map.patterns[i].filter;
 		}
 	}
 	return sort(this.values, filter);*/
 	if(FrameHelper.viewIncludesChildren(this.view, "property")){
 		var allkids = this.parent.objframe.getChildren(this.property());
 	}
 	else {
 		var allkids = [];
 	}
 	return allkids;
}

PropertyRenderer.prototype.redraw = function(){
 	this.viewer.clear();
 	this.render(this.viewer);
}

PropertyRenderer.prototype.extract = function(){
 	var extracts = [];
 	for(var i = 0; i<this.values.length; i++){
 		var val = this.values[i].extract();
 		if(val !== "" && typeof val != "undefined") extracts.push(val);
 	}
 	if(this.cframe.isData()){
 		return extracts;
 	}
 	else {
 		var extr = {};
 		for(var i = 0; i<extracts.length; i++){
 			for(var subjid in extracts[i]){
 				extr[subjid] = extracts[i][subjid];
 			}
 		}
 		return extr;
 	}
}

/*
 * simple wrapper functions
 */
PropertyRenderer.prototype.currentViewer = function(){return this.viewerType;}
PropertyRenderer.prototype.property = function(){return this.predicate;}
PropertyRenderer.prototype.subject = function(){return (this.parent ? this.parent.subject() : false);};
PropertyRenderer.prototype.depth = function(){return (this.parent ? this.parent.depth() : false);};
PropertyRenderer.prototype.subjectClass = function(){return (this.parent ? this.parent.subjectClass() : false);};
PropertyRenderer.prototype.updated = function(){ return (this.parent ? this.parent.childUpdated() : false);};
PropertyRenderer.prototype.range = function(){	return (this.cframe ? this.cframe.range : "");};
PropertyRenderer.prototype.getLabel = function(){ return (this.cframe ? this.cframe.getLabel() : "" );};
PropertyRenderer.prototype.getComment = function(){ return (this.cframe ? this.cframe.getComment() : false);}
PropertyRenderer.prototype.load = function(link){ return (this.parent ? this.parent.load(link) : false);}
PropertyRenderer.prototype.hasCardinalityRestriction = function(){return (this.cframe ? this.cframe.hasRestriction() : false);};
PropertyRenderer.prototype.getRestriction = function(){return (this.cframe ? this.cframe.restriction : false);};
PropertyRenderer.prototype.isClassChoice = function(){	return (this.cframe ? this.cframe.isClassChoice() : false);};
PropertyRenderer.prototype.currentFacet = function(){	return this.facet;} ;
PropertyRenderer.prototype.save = function(){ return (this.parent ? this.parent.save() : false);};

PropertyRenderer.prototype.cancel = function(){
	this.reset();
	this.setMode("view");
}

PropertyRenderer.prototype.getAvailableClassChoices = function(){ 
	if(this.cframe){
		var cf = this.cframe.getClassChoices();
		if(this.parent){
			var choices = [];
			for(var i = 0; i < cf.length; i++){
				var clsmeta = this.parent.getClassMeta(cf[i]);
				var lab = ((clsmeta && clsmeta.Label && clsmeta.Label["@value"]) ? clsmeta.Label["@value"] : FrameHelper.labelFromURL(cf[i]));
				choices.push({value: cf[i], label: lab});
			}
			return choices;
		}
		return cf;
		
	}
	return false;
};


PropertyRenderer.prototype.delete = function(){
	var prop = this.predicate;
	if(prop){
		this.reset();
		this.parent.deleteProperty(prop);	
		this.parent.redraw();
	}
}

PropertyRenderer.prototype.add = function(view){
	this.parent.addProperty(this.property(), view);
	this.updated();
	if(view) {
		this.values[this.values.length-1].setMode(view);
		this.values[this.values.length-1].setNew();
	}
	this.redraw();
	this.goToValue(this.values.length-1);
}

PropertyRenderer.prototype.goToValue = function(index){
	this.viewer.goTo(this.subject(), this.property(), index);
}

PropertyRenderer.prototype.addClass = function(cls){
	this.parent.addPropertyClass(this.property(), cls);
	this.updated();
	var newb = this.values[this.values.length-1];
	if(newb){
		newb.setNew();
		newb.setMode("edit");
	}
	this.redraw();
	if(newb) this.viewer.goTo(newb.subject());
}

PropertyRenderer.prototype.reset = function(){
	this.parent.objframe.reset(this.predicate);
	if(this.cframe && this.cframe.isData()){
		for(var i = 0; i<this.values.length; i++){
			this.values[i].reset();
		}
		this.values = [];
	}
	else {
		var nvals = [];
		for(var i = 0; i<this.originalValues.length; i++){
			for(var j = 0; j<this.values.length; j++){
				this.values[j].reset();
				if(this.values[j].subject() == this.originalValues[i]){
					nvals.push(this.values[j]);
				}
			}
		}
		this.values = nvals;
	}
	this.redraw();	
	this.parent.childUpdated();
}

PropertyRenderer.prototype.deletePropertyValue = function(value, index){
	this.parent.objframe.removePropertyValue(this.property(), value, index);
	var nvals = [];
	for(var i = 0; i<this.values.length; i++){
		if(typeof index == "undefined"){
			if(this.values[i].subject() == value){
				this.values[i].reset();
			}
			else {
				nvals.push(this.values[i]);
			}
		}
		else if(i != index){
			this.values[i].index = nvals.length;
			nvals.push(this.values[i]);
		}
		else {
			this.values[i].reset();
		}
	}
	this.values = nvals;
	this.parent.childUpdated();
	this.parent.redraw();
}

PropertyRenderer.prototype.addPropertyValue = function(value){
	this.updated();
	return this.parent.objframe.addPropertyValue(this.property(), value);
}

/*
 * Checks to see if an action (add, clone, delete) which affects the cardinality of the property is allowed by cardinality rules.
 */
PropertyRenderer.prototype.cardControlAllows = function(action){
	if(this.cframe.hasRestriction()){
		var rest = this.cframe.restriction;
		var currentnum = this.values.length;
		if(action == "add" || action == "clone"){
			if(rest.max && currentnum >= rest.max){
				return false;
			}
		}
		if(action == "delete" && (rest.min)){
			return false;
		}
	}
	return true;
}

PropertyRenderer.prototype.isNew = function(){
	if(this.new_property){
		return true;
	}
	return this.parent.isNew();
}

PropertyRenderer.prototype.setNew = function(){
	this.new_property = true;
}


PropertyRenderer.prototype.isUpdated = function(){
	if(this.values.length != this.originalValues.length) return true;
	for(var i = 0 ; i < this.values.length; i++){
		if(this.cframe && this.cframe.isData()){
			if(this.values[i].value() != this.originalValues[i]){
				return true;
			}
		}
		else {
			if(this.values[i].subject() != this.originalValues[i]) {
				return true;
			}
			if(this.values[i].isUpdated()) {
				return true;
			}
		}
	}
	return false;
}

PropertyRenderer.prototype.childUpdated = function(){
	this.viewer.redrawHeader();
	if(this.parent) this.parent.childUpdated();
}


/**
 * Sets mode of viewer to either "view" or "edit"
 */
PropertyRenderer.prototype.setMode = function(mode){
	this.mode = mode;
	for(var i = 0; i<this.values.length; i++){
		this.values[i].setMode(mode);
	}
	this.redraw();
}

/*
 * Jump to property value
 */
PropertyRenderer.prototype.getViewableValues = function(){
	var viewables = [];
	if(this.cframe && this.cframe.isData())
	for(var i = 0; i<this.values.length; i++){
		var sum = this.values[i].getSummary();
		var lab = sum.long;
		viewables.push({label: lab, value: i});
	}
	return viewables;
}

PropertyRenderer.prototype.hideDisabledControls = function(){
	return this.hide_disabled_controls;
}

PropertyRenderer.prototype.setFacet = function(facet, nocascade){
	this.facet = facet;
	if(!nocascade){
		for(var i = 0; i<this.values.length; i++){
			this.values[i].parentFacetChange(facet);
		}
	}
	this.redraw();
}

PropertyRenderer.prototype.parentFacetChange = function(facet){
	if(facet == 'page'){
		if(!(this.facet == "page" || this.facet == "multiline")){
			this.setFacet('multiline');
		}
	}
	if(facet == 'line'){
		this.setFacet("label");
	}
		
}



PropertyRenderer.prototype.getDefaultFacets = function(){
	var defs = {
		page: {
			label: "Full Page", value: "page", 
			features: ["facet", "label", "comment", "id", "control", "type", "cardinality", "body", "status", "facet", "view", "viewer"], 
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"]
		},
		multiline: {
			label: "Multiple Lines", value: "multiline",
			features: ["facet", "label", "comment", "id", "control", "type", "cardinality", "body", "status", "facet", "view", "viewer"], 
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"]
		},
		line: {
			label: "Single Line", value: "line",
			features: ["facet", "label", "comment", "id", "control", "type", "cardinality", "body", "status", "facet", "viewer"], 
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"]
		},
		summary: {
			label: "Summary", value: "summary",
			features: ["facet", "satus", "label", "type", "cardinality", "body", "status", "facet", "viewer"], 
			controls: [] 
		},
		label: {
			label: "Label", value: "label",
			features: ["facet", "status", "label", "summary"],
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

PropertyRenderer.prototype.getAvailableFacets = function(){
	return Object.values(this.facets);
	var facets = [];
	facets.push({label: "Full Page", value: "page"});
	facets.push({label: "Multiple Lines", value: "multiline"});
	facets.push({label: "Single Line", value: "line"});
	facets.push({label: "Summary", value: "summary"});
	facets.push({label: "Label", value: "label"});
	facets.push({label: "Snippet", value: "icon"});
	return facets;
}

PropertyRenderer.prototype.getContentOrientation = function(facet){
	if(this.currentFacet() == "page" || this.containsPage()){
		return "page";
	}
	if(this.currentFacet() == "line" || this.currentFacet() == "multiline" || this.currentFacet() == "summary"){
		return "line";
	}
	return "label";
}


PropertyRenderer.prototype.getDefaultFacet = function(){
	if(this.cframe && this.cframe.isObject()){
		return "page";
	}
	return "multiline";
}

/*
 * Viewers for specific properties
 */

PropertyRenderer.prototype.hide = function(){
	this.setView("hidden");
}

PropertyRenderer.prototype.show = function(){
	this.setView("full");
}

PropertyRenderer.prototype.setView = function(view){
	this.view = view;
	this.redraw();
}

PropertyRenderer.prototype.getAvailableViewers = function(){
	if(this.mode == "view"){
		return RenderingMap.getAvailablePropertyViewers(this);		
	}
	return RenderingMap.getAvailablePropertyEditors(this);				
}

PropertyRenderer.prototype.nukeViewer = function(){
	this.viewer.remove();
}

PropertyRenderer.prototype.containsPage = function(){
	//collapsed facets do not show their values
	if(this.currentFacet() == "icon" || this.currentFacet() == "label") return false;
	for(var i = 0; i<this.values.length; i++){
		if(this.values[i].facet == "page") {
			return true;
		}
	}
	return false;
}

PropertyRenderer.prototype.getViewerForProperty = function(ptype){
	if(this.mode == "edit"){
		return RenderingMap.getEditorForProperty(ptype, this);				
	}
	return RenderingMap.getViewerForProperty(ptype, this);	
}

PropertyRenderer.prototype.getPropertyHeaderViewer = function(){
	return new PropertyViewer.HTMLPropertyHeaderViewer();
}

PropertyRenderer.prototype.getSummary = function(){
	var status = "ok";
	if(this.isNew()) status = "new";
	else if(this.isUpdated()) status = "updated";
	var ret = {
		status: status,
		valcount: this.values.length
	};
	ret.long = ((ret.valcount != 1) ? "(" + ret.valcount + ") " : "");
	for(var i = 0; i<this.values.length; i++){
		vsum = this.values[i].getSummary();
		ret.long += vsum.long;
		if(i < this.values.length-1) ret.long += ", ";
	}
	return ret;	
}

PropertyRenderer.prototype.getFeaturesForFacet = function(facet){
	return this.facets[facet].features.concat(this.facets[facet].controls);
}
 
PropertyRenderer.prototype.showFeature = function(which){
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

module.exports=PropertyRenderer

