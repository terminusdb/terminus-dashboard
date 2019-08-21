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
	this.objframe = obj;
	this.parent = parent;
	this.options = this.setOptions(options);
	this.properties = {};
	this.originalProperties = false;
	this.newProperties = [];
}

//options has to include mode, viewer, facet, controls, features, hide_disabled_controls

ObjectRenderer.prototype.setOptions = function(options){
	//var rendconf = new RendererConfigurationMatcher(options);
	return RenderingMap.decorateRenderer(options, this);
	/*rendconf.setObjectRenderingConfiguration(this);
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
	//this.loadConfigurationFromOptions(options);
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
	return options;*/
}

ObjectRenderer.prototype.getOptionsForProperty = function(prop){
	return this.options;
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

ObjectRenderer.prototype.depth = function(){
	if(this.parent) return (this.parent.depth() + 1);
	return 0;
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

ObjectRenderer.prototype.root = function(){
	if(this.parent) return false;
	return true;
}

ObjectRenderer.prototype.load = function(link){
	var self = this;
	if(this.controller){
		this.controller.loadDocument(link);
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
		return this.controller.getClient();
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

ObjectRenderer.prototype.getDefaultFacets = function(){
	var defs = {
		page: {
			label: "Full Page", value: "page", 
			features: ["facet", "label", "comment", "id", "control", "type", "body", "status", "facet", "view", "viewer"],
			controls: ["delete", "clone", "add", "reset", "cancel", "update", "mode", "show", "hide"] 
		},
		line: {
			label: "Single Line", value: "line",
			features: ["facet", "label", "comment", "id", "type", "body", "status", "facet"], 
			controls: [] 
		},
		summary: {
			label: "Summary", value: "summary",
			features: ["facet", "satus", "label", "type", "summary", "status", "facet"], 
			controls: [] 
		},
		label: {
			label: "Label", value: "label",
			features: ["facet", "status", "label"],
			controls: []
		}
	}
	return defs;
}

ObjectRenderer.prototype.getAvailableFacets = function(){
	return Object.keys(this.facets);
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
		var ty = this.subjectClass();
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
	return this.header_viewer;
}

ObjectRenderer.prototype.getViewerForObject = function(format){
	if(format){
		return RenderingMap.getViewerForObject(this, format);
	}
	else {
		return this.viewer; 
	}
}

ObjectRenderer.prototype.getFeaturesForFacet = function(facet){
	return this.facets[facet].features.concat(this.facets[facet].controls);
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

ObjectRenderer.prototype.currentViewer = function(){return this.viewerType;}


ObjectRenderer.prototype.setViewer = function(viewer){
	var nviewer = this.getViewerForObject(viewer);
	if(nviewer){
		this.viewerType = viewer;
		this.viewer = nviewer;
		this.viewer.redraw();
	}
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

