/**
 * object renderer binds to object frame - provides filters, sorts and manipulations of underlying object frame
 * and coordinates viewer to draw updates

 * Object Renderer - provides sorting / filtering / state management of objects
 * @param obj ObjectFrame object - contains underlying data and frame structure
 * @param parent PropertyRenderer - property that owns this object (if any)
 * @param options options json
 * @returns
 */
function ObjectRenderer(obj, parent, options){
	if(options && options.features){
		this.features = options.features;
	}
	else {
		this.features = ["body", "id", "type", "summary", "status", "label", "facet", "control", "viewer", "view", "comment"];
	}
	if(options && options.controls){
		this.controls = options.controls;
	}
	else {
		this.controls = ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"];
	}
	this.objframe = obj;
	this.parent = parent;
	this.options = this.setOptions(options);
	this.properties = {};
	this.originalProperties = false;
	this.newProperties = [];
}


ObjectRenderer.prototype.setOptions = function(options){
	options = (options ? options : {});
	if(options.mode) this.mode = options.mode;
	else {
		this.mode = (this.parent && this.parent.mode ? this.parent.mode : "view");
		options.mode = this.mode;
	}
	if(options.view) this.view = options.view;
	else {
		this.view = (this.parent && this.parent.view ? this.parent.view : "full");
		options.view = this.view;
	}
	if(options.facet) this.facet = options.facet;
	else this.facet = this.getDefaultFacet();
	this.hide_disabled_controls = (options && options.hide_disabled_controls ? options.hide_disabled_controls : true);
	this.facets = {
		label: 	["facet", "status", "label"],
		summary: ["facet", "satus", "label", "type", "summary", "status", "facet"],
		line: ["facet", "label", "comment", "id", "type", "body", "status", "facet"],
		page: ["facet", "label", "comment", "id", "control", "type", "body", "status", "facet", "view", "viewer"].concat(this.controls)
	}
	if(options && options.facets){
		for(var facet in options.facets){
			this.facets[facet] = options.facets[facet];
		}
	}
	return options;
}

ObjectRenderer.prototype.getOptionsForProperty = function(prop){
	var opts = {};
	if(this.options.features){ opts.features = this.options.features };
	if(this.options.controls){ opts.controls = this.options.controls};
	return opts;
}

ObjectRenderer.prototype.render = function(viewer){
	this.buildPropertyRenderers();
	this.viewer = (viewer ? viewer: this.getViewerForObject());
	for(var prop in this.properties){
		var renderedprop = this.properties[prop].render();
		if(renderedprop && this.showFeature("body")) this.viewer.addRenderedProperty(prop, renderedprop);
	}
	return this.viewer.render(this.view);
}

ObjectRenderer.prototype.buildPropertyRenderers = function(){
	var props = this.getPropertiesToRender();
	if(this.originalProperties === false) this.originalProperties = props;
	var renders = {};
	for(var j = 0; j<props.length; j++){
		if(typeof this.properties[props[j]] == "undefined"){
			renders[props[j]] = new PropertyRenderer(props[j], this, this.getOptionsForProperty(props[j]));
		}
		else {
			renders[props[j]] = this.properties[props[j]];
		}
		if(this.newProperties.indexOf(props[j]) != -1) {
			renders[props[j]].setNew(); 
			renders[props[j]].mode = "edit"; 
		}
	}
	this.properties = renders;
}

ObjectRenderer.prototype.subject = function(){
	if(this.objframe) return this.objframe.subjid;
	return false;
}

ObjectRenderer.prototype.property = function(){
	if(this.parent) return this.parent.property();
	return false;
}

ObjectRenderer.prototype.parentObject = function(){
	if(this.parent && this.parent.parent && this.parent.parent.objframe){
		return this.parent.parent.objframe;
	}
	return false;
}

ObjectRenderer.prototype.objtype = function(){
	return this.objframe.cls;
}

ObjectRenderer.prototype.root = function(){
	if(this.parent) return false;
	return true;
}

ObjectRenderer.prototype.load = function(link){
	var self = this;
	if(this.controller){
		this.controller.ui.loadDocument(link);
		this.controller.ui.viewer.redraw();		
	}
	else if(this.parent) {
		this.parent.load(link);
	}
}

ObjectRenderer.prototype.copy = function(nkid){
	nkid = (nkid ? nkid : this.objframe);
	var other = new ObjectRenderer(nkid, this.parent, this.options);
	return other;
}

ObjectRenderer.prototype.clone = function(){
	if(this.root()){
		this.objframe = this.objframe.clone("_:");
		this.objframe.newDoc = true;
		this.setMode("edit");
	}
	else {
		var nkid = this.objframe.clone(FrameHelper.genBNID());
		var parentobj = this.parentObject();
		var prop = this.property();
		if(parentobj && prop){
			if(typeof parentobj.children[prop] == "undefined"){
				parentobj.children[prop] = [];
			}
			parentobj.children[prop].push(nkid);
			var newrend = this.copy(nkid);
			this.parent.values.push(newrend);
		}
		this.parent.redraw();
	}
}

ObjectRenderer.prototype.cancel = function(){
	this.reset();
	this.setMode("view");
}

ObjectRenderer.prototype.save = function(){
	if(this.controller){
		if(this.isNewDocument()){
			var demandid = this.inputID();
			if(demandid == "_:") demandid = "";
			this.controller.createDocument(demandid);
		}
		else {
			this.controller.updateDocument();
		}
	}
	else if(this.parent) {
		this.parent.save();
	}
}

ObjectRenderer.prototype.delete = function(){
	var dval = this.subject();
	if(this.controller && this.root()){
		if(!this.isNewDocument()){
			this.controller.deleteDocument(dval);
		}
		this.nukeViewer();
	}
	else {
		if(this.parent){
			this.parent.deletePropertyValue(dval);		
			this.parent.redraw();
		}
	}
}

ObjectRenderer.prototype.reset = function(){
	this.objframe.reset();
	var nprops = {};
	for(var i = 0; i<this.originalProperties.length; i++){
		var prop = this.originalProperties[i];
		if(typeof this.properties[prop] == "object"){
			this.properties[prop].reset();
			nprops[prop] = this.properties[prop];
		}
	}
	this.properties = nprops;
	this.redraw();
}

ObjectRenderer.prototype.deleteProperty = function(prop){
	this.objframe.removeProperty(prop);
	delete(this.properties[prop]);
	this.updated();
}

ObjectRenderer.prototype.addProperty = function(prop){
	this.objframe.addProperty(prop);
	this.updated();
	this.redraw();
}

ObjectRenderer.prototype.addNewProperty = function(prop){
	this.objframe.addProperty(prop);
	this.updated();
	this.newProperties.push(prop);
	this.redraw();
	this.goToProperty(prop);
}

ObjectRenderer.prototype.addPropertyClass = function(prop, cls){
	this.objframe.addProperty(prop, cls);
	this.updated();
}

ObjectRenderer.prototype.changeClass = function(cls){
	if(this.parent){
		this.parent.addClass(cls);		
		this.parent.deletePropertyValue(this.subject());		
	}
}

ObjectRenderer.prototype.getClassMeta = function(cls){
	var ctl = this.getController();
	if(ctl && ctl.classmeta && ctl.classmeta[cls]){
		return ctl.classmeta[cls];
	}
	return false;
}


ObjectRenderer.prototype.getController = function(){
	if(this.controller){
		return this.controller;
	}
	if(this.parent && this.parent.parent){
		return this.parent.parent.getController();
	}
	return false;
}

ObjectRenderer.prototype.getClient = function(){
	if(this.controller){
		var cl = this.controller.getClient();
		if(cl) return cl;
		return false;
	}
	else {
		if(this.parent && this.parent.parent){
			return(this.parent.parent.getClient())
		}
	}
	return false;
}

ObjectRenderer.prototype.inputID = function(){
	if(this.idDOM){
		return this.idDOM.value;
	}
	return false;
}

ObjectRenderer.prototype.isNew = function(){
	if(this.new_object){
		return true;
	}
	if(this.isPartOfNewDocument()){
		return true;
	}
	if(this.parent) return this.parent.isNew();
	return false;
}

ObjectRenderer.prototype.setNew = function(){
	this.new_object = true;
}

ObjectRenderer.prototype.isUpdated = function(){
	var i = 0;
	for(var prop in this.properties){
		if(this.originalProperties[i] != prop) return true;
		if(this.properties[prop].isUpdated()) return true;
		i++;		
	}
	if(i != this.originalProperties.length) return true;
	return false;
}

ObjectRenderer.prototype.childUpdated = function(){
	this.viewer.redrawHeader();
	if(this.parent) this.parent.childUpdated();
}

ObjectRenderer.prototype.updated = ObjectRenderer.prototype.childUpdated;

ObjectRenderer.prototype.isNewDocument = function(){
	if(this.root() && this.objframe.isnew()) return true;
	return false;
}

ObjectRenderer.prototype.isPartOfNewDocument = function(){
	if(this.isNewDocument()) return true;
	if(this.parent && this.parent.parent){
		return this.parent.parent.isPartOfNewDocument();
	}
	return false;
}

ObjectRenderer.prototype.setFacet = function(facet, nocascade){
	this.facet = facet;
	if(!nocascade){
		for(var prop in this.properties){
			this.properties[prop].parentFacetChange(facet);
		}
	}
	if(this.parent){
		this.parent.redraw();
	}
	else {
		this.redraw();
	}
}

ObjectRenderer.prototype.getAvailableFacets = function(){
	var facets = [];
	facets.push({label: "Full Page", value: "page"});
	facets.push({label: "Single Line", value: "line"});
	facets.push({label: "Summary", value: "summary"});
	facets.push({label: "Label", value: "label"});
	return facets;
}

ObjectRenderer.prototype.currentFacet = function(){
	return this.facet;
}

ObjectRenderer.prototype.getDefaultFacet = function(){
	if(!this.parent) return "page";
	var pfacet = this.parent.currentFacet();
	if(pfacet == "page"){
		return "page";
	}
	if(pfacet == "multiline") return "line";
	if(pfacet == "line") return "summary";
	return "label";
}

ObjectRenderer.prototype.parentFacetChange = function(pfacet){
	if(pfacet == "page") this.setFacet("page");
	if(pfacet == "multiline") this.setFacet("summary");
	if(pfacet == "line") this.setFacet("summary");
	if(pfacet == "summary") this.setFacet("summary");
}

ObjectRenderer.prototype.getContentOrientation = function(){
	if(this.currentFacet() == "page"){
		return "page";
	}
	if(this.currentFacet() == "line"){
		return "line";
	}
	return "label";
}

ObjectRenderer.prototype.getLabel = function(){
	for(var prop in this.properties){
		if(FrameHelper.getShorthand(prop) == "rdfs:label"){
			var prend = this.properties[prop];
			var vrend = prend.values[0];
			if(vrend){
				var sum = vrend.getSummary();
				if(sum.long != "empty") return sum.long;
			}
		}
	}
	var s = this.subject();
	if(s && s.substring(0, 2) == "_:"){
		var ty = this.objtype();
		var sh = FrameHelper.getShorthand(ty);
		if(sh){
			var b = sh.split(":");
			if(b.length > 1){
				return "New " + b[1];
			}
		}
		return "New Object";
	}
	return false;
}

ObjectRenderer.prototype.getSummary = function(){
	var ret = { status: "ok" };
	if(this.isUpdated()) ret.status = "updated";
	if(this.isNew()) ret.status = "new";
	ret.propcount = 0;
	for(var prop in this.properties){
		ret.propcount++;
	}
	ret.long = ret.propcount + " properties";
	return ret;	
}

ObjectRenderer.prototype.getObjectHeaderViewer = function(){
	return new HTMLObjectHeaderViewer();
}

ObjectRenderer.prototype.getViewerForObject = function(format){
	if(format && format == "json"){
		var nv = new JSONObjectViewer(this);
	}
	else var nv = new HTMLObjectViewer(this);
	return nv;
}

ObjectRenderer.prototype.getFeaturesForFacet = function(facet){
	return this.facets[facet];
}
 
ObjectRenderer.prototype.hideDisabledControls = function(){
	return this.hide_disabled_controls;
}

ObjectRenderer.prototype.showFeature = function(which){
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
	if(this.isNewDocument() && which == "clone") return false;
	if(which == 'hide' && this.view == "hidden") return false;
	if(which == 'show' && this.view != "hidden") return false;
	var fets = this.getFeaturesForFacet(this.facet);
	if (fets.indexOf(which) != -1){
		return true;
	}
	return false;
}

ObjectRenderer.prototype.cardControlAllows = function(action){
	if(!this.parent) return true;
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

ObjectRenderer.prototype.goToProperty = function(prop){
	this.viewer.goTo(this.subject(), prop);
}

ObjectRenderer.prototype.setMode = function(mode){
	this.mode = mode;
	for(var prop in this.properties){
		this.properties[prop].setMode(mode);
	}
	this.viewer.redraw();
}

ObjectRenderer.prototype.setView = function(view){
	var views = {
		"full": {
			
		},
		"hidden": {
			
		}
	};
	this.view = view;
	this.viewer.redraw();
}

ObjectRenderer.prototype.currentViewer = function(){return this.viewerType;}


ObjectRenderer.prototype.setViewer = function(viewer){
	this.viewerType = viewer;
	this.viewer = this.getViewerForObject(viewer);
	this.viewer.redraw();
}

ObjectRenderer.prototype.hide = function(){
	this.setView("hidden");
}

ObjectRenderer.prototype.show = function(){
	this.setView("full");
}

ObjectRenderer.prototype.nukeViewer = function(){
	this.viewer.remove();
}

ObjectRenderer.prototype.getViewableProperties = function(){
	return this.objframe.getFilledPropertyList();	
}

ObjectRenderer.prototype.getAddableProperties = function(){
	var props = this.objframe.getMissingPropertyList();	
	return props;
}

ObjectRenderer.prototype.getAvailableViewers = function(){
	if(typeof ObjectValuesMap == "object"){
		var dt = FrameHelper.getShorthand(this.objtype());
		return ObjectValuesMap.getAvailableViewers(dt);		
	}
	var bits = [{value: "html", label: "HTML"}];
	bits.push({value: 'json', label: "JSON"});
	return bits;
}

ObjectRenderer.prototype.getPropertiesToRender = function(options){
	var sort = this.standardSort;
	var filter = function(){return true};
	if(options && options.map && options.map.patterns){
		for(var i = 0; i<options.map.patterns.length; i++){
			if(this.objframe.matchesPattern({property: this.property(), action: "sort"}, options.map.patterns[i])){
				sort = options.map.patterns[i].sort;
			}
			if(this.objframe.matchesPattern({property: this.property(), action: "filter"}, options.map.patterns[i])){
				filter = options.map.patterns[i].filter;
			}
		}
	}
	return sort(this.objframe, filter);
}

ObjectRenderer.prototype.standardSort = function(objframe, filter){
	var sorted = [];
	var rdft = FrameHelper.getStdURL("rdfs", "label");
	if(objframe.dataframes[rdft] && filter(objframe, rdft, objframe.dataframes[rdft])){
		sorted.push(rdft);
	}
	var rdfc = FrameHelper.getStdURL("rdfs", "comment");
	if(objframe.dataframes[rdfc]){
		sorted.push(rdfc);
	}
	for(var prop in objframe.dataframes){
		if(sorted.indexOf(prop) == -1) sorted.push(prop);
	}
	for(var prop in objframe.children){
		if(sorted.indexOf(prop) == -1) sorted.push(prop);		
	}
	return sorted;
}


ObjectRenderer.prototype.redraw = function(){
	this.viewer.clear();
	this.render(this.viewer);
}

ObjectRenderer.prototype.extract = function(){
	var extracts = {};
	for(var i in this.properties){
		var extracted = this.properties[i].extract();
		if(!FrameHelper.empty(extracted)){
			extracts[i] = extracted;
		}
	}
	if(FrameHelper.empty(extracts) && this.parent){
		return false;
	}
	else {
		extracts["rdf:type"] = this.objframe.cls;
		var full = {};
		full[this.subject()] = extracts;
		return full;	
	}
}

function PropertyRenderer(prop, parent, options){
	if(options && options.features){
		this.features = options.features;
	}
	else {
		this.features = ["body", "type", "cardinality", "summary", "label", "status", "facet", "control", "viewer", "view", "comment", "id", "toolbox", "help	"];
	}
	if(options && options.controls){
		this.controls = options.controls;
	}
	else {
		this.controls = ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"];
	}
	this.predicate = prop;
	this.parent = parent;
	this.cframe = this.parent.objframe.getPropertyClassFrame(this.predicate);
	this.options = this.setOptions(options);
	this.originalValues = false;
	this.changed = false;
	this.values = [];
}

PropertyRenderer.prototype.setOptions = function(options){
	options = (options ? options : {});
	if(options.mode) this.mode = options.mode;
	else {
		this.mode = (this.parent && this.parent.mode ? this.parent.mode : "view");
		options.mode = this.mode;
	}
	if(options.view) this.view = options.view;
	else {
		this.view = (this.parent && this.parent.view ? this.parent.view : "full");
		options.view = this.view;
	}
	if(options.viewer) this.viewerType = options.viewer;
	else this.viewerType = this.getViewerForDataValue();
	if(options.facet) this.facet = options.facet;
	else this.facet = this.getDefaultFacet();
	this.hide_disabled_controls = (options && options.hide_disabled_controls ? options.hide_disabled_controls : true);
	this.facets = {
		icon: 	["facet", "summary"],
		label: 	["facet", "status", "label", "summary"],
		summary: ["facet", "satus", "label", "type", "cardinality", "body", "status", "facet", "viewer"],
		line: ["facet", "label", "comment", "id", "control", "type", "cardinality", "body", "status", "facet", "viewer"].concat(this.controls),
		multiline: ["facet", "label", "comment", "id", "control", "type", "cardinality", "body", "status", "facet", "view", "viewer"].concat(this.controls),
		page: ["facet", "label", "comment", "id", "control", "type", "cardinality", "body", "status", "facet", "view", "viewer"].concat(this.controls)
	}
	if(options && options.facets){
		for(var facet in options.facets){
			this.facets[facet] = options.facets[facet];
		}
	}
	return options;
}


PropertyRenderer.prototype.getOptionsForChild = function(){
	var opts = {};
	if(this.options.features){ opts.features = this.options.features };
	if(this.options.controls){ opts.controls = this.options.controls};
	return opts;
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
 		this.viewer = (viewer ? viewer : this.getViewerForProperty(this.cframe));
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
 				var kidf = new ObjectRenderer(kids[i], this, this.getOptionsForObject(kids[i]));
 				if(adorig) this.originalValues.push(kidf.subject());
 				this.values.push(kidf);
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
 		if(this.cframe.isClassChoice()){
 			alert("class frame anomaly " + JSON.stringify(extr));
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
				var lab = ((clsmeta && clsmeta.Label && clsmeta.Label.data) ? clsmeta.Label.data : FrameHelper.labelFromURL(cf[i]));
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

PropertyRenderer.prototype.getAvailableFacets = function(){
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
	if(this.cframe && this.cframe.isData()){
		var dt = this.cframe.getTypeShorthand();
		var ft = this.cframe.ftype();
		if(this.mode == "view"){
				return RenderingMap.getAvailableViewers(dt, ft);		
		}
		return RenderingMap.getAvailableEditors(dt, ft);				
	}
}

PropertyRenderer.prototype.getViewerForDataValue = function(){
	if(this.cframe && this.cframe.isData()){
		var dt = this.cframe.getTypeShorthand();
		var ft = this.cframe.ftype();
		if(this.mode == "edit"){
			return RenderingMap.getEditorForFrame(dt, ft);				
		}
		return RenderingMap.getViewerForFrame(dt, ft);		
	}
}

PropertyRenderer.prototype.setViewer = function(viewer){
	this.viewerType = viewer;
	for(var i = 0; i<this.values.length; i++){
		this.values[i].setViewer(viewer);
	}
	this.redraw();
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

PropertyRenderer.prototype.getViewerForProperty = function(cframe){
	return new HTMLPropertyViewer(this);
}

PropertyRenderer.prototype.getPropertyHeaderViewer = function(){
	return new HTMLPropertyHeaderViewer();
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
	return this.facets[facet];
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


function ValueRenderer(dataframe, index, parent, options){
	if(options && options.features){
		this.features = options.features;
	}
	else {
		this.features = ["body", "type", "cardinality", "summary", "status", "facet", "control", "viewer"];
	}
	if(options && options.controls){
		this.controls = options.controls;
	}
	else {
		this.controls = ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"];
	}
	this.frame = dataframe;
	this.index = index;
	this.parent = parent;
	this.options = this.setOptions(options);
	this.originalValue = this.value();
} 

ValueRenderer.prototype.property = function(){ return (this.parent ? this.parent.property() : false);};
ValueRenderer.prototype.subject = function(){ return (this.parent ? this.parent.subject() : false);};
ValueRenderer.prototype.type = function(){	return (this.frame ? this.frame.range : false);};
ValueRenderer.prototype.value = function(){	return (this.frame ? this.frame.get() : false);};
ValueRenderer.prototype.isEntity = function(){	return (this.frame ? this.frame.isEntity() : false);};
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
	var facets = [];
	facets.push({label: "Full Page", value: "page"});
	facets.push({label: "Single Line", value: "line"});
	facets.push({label: "Inline", value: "inline"});
	facets.push({label: "Label", value: "label"});
	facets.push({label: "Snippet", value: "icon"});
	return facets;
}

ValueRenderer.prototype.currentFacet = function(){
	return this.facet;
}

ValueRenderer.prototype.setOptions = function(options){
	options = (options ? options : {});
	if(options.mode) this.mode = options.mode;
	else {
		this.mode = (this.parent && this.parent.mode ? this.parent.mode : "view");
		options.mode = this.mode;
	}
	if(options.view) this.view = options.view;
	else {
		this.view = (this.parent && this.parent.view ? this.parent.view : "full");
		options.view = this.view;
	}
	if(options.viewer) this.viewerType = options.viewer;
	else this.viewerType = this.getViewerForDataValue();
	if(options.facet) this.facet = options.facet;
	else this.facet = this.getDefaultFacet();
	this.text_summary_length = (options && options.summary_length ? options.summary_length : 12);
	this.hide_disabled_controls = (options && options.hide_disabled_controls ? options.hide_disabled_controls : true);
	this.facets = {
		icon: 	["facet", "summary"],
		label: 	["facet", "status", "body"],
		inline: ["facet", "type", "cardinality", "body", "status", "facet", "viewer", "control"].concat(this.controls),
		line: ["facet", "type", "cardinality", "body", "status", "facet", "viewer", "control"].concat(this.controls),
		page: ["facet", "type", "cardinality", "body", "status", "facet", "viewer", "control"].concat(this.controls)
	}
	if(options && options.facets){
		for(var facet in options.facets){
			this.facets[facet] = options.facets[facet];
		}
	}
	return options;
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
		var ctrl = this.parent.parent.getController();
		if(ctrl){
			var apiurl = ctrl.server + "/rest/" + ctrl.db + "/" + a + "/" + b;
			return apiurl;
		}
	}
	return false;
}

ValueRenderer.prototype.DBURL = function(){
	if(this.parent && this.parent.parent){
		var ctrl = this.parent.parent.getController();
		if(ctrl){
			return ctrl.server + "/" + ctrl.db;
		}
	}	
	return false;
}

ValueRenderer.prototype.getEntityReference = function(url, cls, entities, opts){
	if(this.parent && this.parent.parent){
		var client = this.parent.parent.getClient();
		if(client){
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
	return new HTMLDataViewer(this);
}

ValueRenderer.prototype.getFeaturesForFacet = function(facet){
	return this.facets[facet];
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
	if(val !== "" && val !== false && this.frame.isDatatypeProperty()){
		var objlit = { data: this.value()}
		if(this.frame.isString()) objlit.lang = this.frame.lang();
		else objlit.type = this.type();
		return objlit;
	}
	else return val;
} 

ValueRenderer.prototype.getValueHeaderViewer = function(){
	return new HTMLDataHeaderViewer();
}

ValueRenderer.prototype.getDataValueViewer = function(){
	if(!this.viewerType) {
		this.viewerType = this.getViewerForDataValue();
	}
	return RenderingMap.getViewer(this.viewerType);		
}

ValueRenderer.prototype.getAvailableViewers = function(){
	var dt = this.frame.getTypeShorthand();
	var ft = this.frame.ftype();
	if(this.mode == "view"){
		return RenderingMap.getAvailableViewers(dt, ft);		
	}
	return RenderingMap.getAvailableEditors(dt, ft);				
}

ValueRenderer.prototype.setViewer = function(viewer){
	this.viewerType = viewer;
	this.redraw();
}

ValueRenderer.prototype.getViewerForDataValue = function(){
	var dt = this.frame.getTypeShorthand();
	var ft = this.frame.ftype();
	if(this.mode == "edit"){
		return RenderingMap.getEditorForFrame(dt, ft);				
	}
	return RenderingMap.getViewerForFrame(dt, ft);		
}

ValueRenderer.prototype.redraw = function(){
	this.viewer.clear();
	this.render(this.viewer);
}
