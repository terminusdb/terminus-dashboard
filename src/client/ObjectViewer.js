/**
 * Object for producing a HTML view of a given object in a frame
 */
const HTMLFrameHelper = require('./HTMLFrameHelper');
const FrameHelper = require('../FrameHelper');
function HTMLObjectViewer(renderer){
	this.renderer = renderer;
	this.properties = [];
	this.headerViewer = renderer.getObjectHeaderViewer();
	//this.featureViewers = {};
}

/**
 * Functions for rendering / re-rendering the object as header and body components
 */
HTMLObjectViewer.prototype.render = function(){
	if(this.renderedDOM){
		var renderedDOM = this.getObjectDOM();
		this.renderedDOM.replaceWith(renderedDOM);
		this.renderedDOM = renderedDOM;
	}
	else {
		this.renderedDOM = this.getObjectDOM();
	}
	this.renderedDOM.appendChild(this.getObjectIDMarker(this.renderer));
	if(this.headerViewer){
		this.header = this.headerViewer.getAsDOM(this.renderer);
		if(this.header) this.renderedDOM.appendChild(this.header);
	}
	this.body = this.getObjectBodyDOM();
	if(this.body) this.renderedDOM.appendChild(this.body);
	return this.renderedDOM;
}

HTMLObjectViewer.prototype.getObjectDOM = function(){
	var orientation = this.renderer.getContentOrientation();
	var pcls = "terminus-object-frame-" + orientation;
	if(orientation == "page"){
		var sp = document.createElement("div");
	}
	else {
		var sp = document.createElement("span");
	}
	var css = "terminus-object-frame " + pcls + (this.renderer.parent ? "" : " terminus-root-frame") + " terminus-object-frame-" + this.renderer.mode;
	sp.setAttribute("class", css);
	sp.setAttribute("data-class", this.renderer.subjectClass());
	sp.setAttribute("data-id", this.renderer.subject());
	return sp;
}

HTMLObjectViewer.prototype.getObjectBodyDOM = function(){
	var orientation = this.renderer.getContentOrientation();
	var pcls = "terminus-object-properties-" + orientation;
	if(orientation == "page"){
		var vholder = document.createElement("div");
	}
	else {
		var vholder = document.createElement("span");
	}
    vholder.setAttribute('class', 'terminus-object-properties ' + pcls);
    for(var prop in this.properties){
		if(this.properties[prop]) vholder.appendChild(this.properties[prop]);
	}
	return vholder;
}

HTMLObjectViewer.prototype.getFeatureDOM = function(feature){
	if(this.hasFeatureViewer(feature)){
		return this.featureViewer[feature](this.renderer, this);
	}
}

HTMLObjectViewer.prototype.redraw = function(){
	FrameHelper.removeChildren(this.renderedDOM);
	this.properties = [];
	this.renderer.render(this);
}

HTMLObjectViewer.prototype.redrawHeader = function(){
	if(this.headerViewer && this.header) {
		var nheader = this.headerViewer.getAsDOM(this.renderer);
		this.header.replaceWith(nheader);
		this.header = nheader;
	}
}

HTMLObjectViewer.prototype.redrawBody = function(){
	if(this.body){
		var nbody = this.getObjectBodyDOM();
		this.body.replaceWith(nbody);
		this.body = nbody;
	}
}

/**
 * Adds a rendered version of a property to the internal properties array
 */
HTMLObjectViewer.prototype.addRenderedProperty = function(prop, renderedprop){
	this.properties[prop] = renderedprop;
}

HTMLObjectViewer.prototype.clear = function(){
	FrameHelper.removeChildren(this.renderedDOM);
	this.properties = {};
}

/**
 * Removes the object from the dom
 */
HTMLObjectViewer.prototype.remove = function(){
	this.renderedDOM.parentNode.removeChild(this.renderedDOM);
}

HTMLObjectViewer.prototype.goTo = function(subj, property){
	HTMLFrameHelper.goToName(subj, property);
}

/**
 * Generates a html anchor element to use as a marker to find the object on the page
 */
HTMLObjectViewer.prototype.getObjectIDMarker = function(renderer){
	var idm = document.createElement("a");
	idm.setAttribute("class", "terminus-object-idmarker");
	var sh = FrameHelper.getShorthand(renderer.subject());
    if(!sh) sh = renderer.subject();
    if(sh){
		var bits = sh.split(":");
		if(bits.length > 1) sh = bits[1];
		idm.setAttribute("name", sh);
    }
	return idm;
}

function HTMLObjectHeaderViewer(){}

HTMLObjectHeaderViewer.prototype.getAsDOM = function(renderer){
	var orientation = renderer.getContentOrientation();
	var pcls = "terminus-object-frame-btn terminus-object-header-" + orientation;
	if(orientation == "page"){
		var objDOM = document.createElement("div");
	}
	else {
		var objDOM = document.createElement("span");
	}
	objDOM.setAttribute("class", "terminus-object-header " + pcls);
	if(renderer.showFeature("facet")){
		var facetDOM = this.getObjectFacetDOM(renderer);
		if(facetDOM) objDOM.appendChild(facetDOM);
	}
	if(renderer.showFeature("label")){
		var sumDOM = this.getObjectLabelDOM(renderer);
		if(sumDOM) objDOM.appendChild(sumDOM);
	}
	if(renderer.showFeature("id")){
		var idDOM = this.getObjectIDDOM(renderer);
		if(idDOM) objDOM.appendChild(idDOM);
	}
	if(renderer.showFeature("type")){
		var typeDOM = this.getObjectTypeDOM(renderer);
		if(typeDOM) objDOM.appendChild(typeDOM);
	}
	if(renderer.showFeature("status")){
		var sumDOM = this.getObjectStatusDOM(renderer);
		if(sumDOM) objDOM.appendChild(sumDOM);
	}
	if(renderer.showFeature("view")){
		var viewDOM = this.getViewPropertyDOM(renderer);
		if(viewDOM) objDOM.appendChild(viewDOM);
	}
	if(renderer.showFeature("viewer")){
		var hideDOM = this.getViewerSelectorDOM(renderer);
		if(hideDOM) objDOM.appendChild(hideDOM);
	}
	if(renderer.showFeature("add")){
		var addDOM = this.getAddPropertyDOM(renderer);
		if(addDOM) objDOM.appendChild(addDOM);
	}
	if(renderer.showFeature("control")){
		var controlsDOM = this.getObjectControlsDOM(renderer);
		if(controlsDOM) objDOM.appendChild(controlsDOM);
	}
	if(renderer.showFeature("summary")){
		var controlsDOM = this.getObjectSummaryDOM(renderer);
		if(controlsDOM) objDOM.appendChild(controlsDOM);
	}
	objDOM.addEventListener('click', function(){
		if((this.nextSibling.style.display == 'block') || (this.nextSibling.style.display == '')) 
			this.nextSibling.style.display = 'none';
		else this.nextSibling.style.display = 'block';
	});
	return objDOM;
}

HTMLObjectHeaderViewer.prototype.getObjectSummaryDOM = function(renderer){
	var sum = renderer.getSummary();
	return HTMLFrameHelper.getInfoboxDOM("object-summary", false, sum.long, sum.status);
}

HTMLObjectHeaderViewer.prototype.getObjectControlsDOM = function(renderer){
	var controlsDOM = document.createElement("span");
	controlsDOM.setAttribute("class", "terminus-object-controls");
	if(renderer.showFeature("mode")){
		var viewsDOM = HTMLFrameHelper.getModeSelectorDOM("object", renderer);
		if(viewsDOM) controlsDOM.appendChild(viewsDOM);
	}
	if(renderer.showFeature("delete")){
		var dpropDOM = this.getObjectDeleteDOM(renderer);
		if(dpropDOM) controlsDOM.appendChild(dpropDOM);
	}
	if(renderer.showFeature("clone")){
		var cpropDOM = this.getObjectCloneDOM(renderer);
		if(cpropDOM) controlsDOM.appendChild(cpropDOM);
	}
	if(renderer.showFeature("reset")){
		var rpropDOM = this.getObjectResetDOM(renderer);
		if(rpropDOM) controlsDOM.appendChild(rpropDOM);
	}
	if(renderer.showFeature("update")){
		var upropDOM = this.getObjectUpdateDOM(renderer);
		if(upropDOM) controlsDOM.appendChild(upropDOM);
	}
	if(renderer.showFeature("show")){
		var showDOM = this.getObjectShowDOM(renderer);
		if(showDOM) controlsDOM.appendChild(showDOM);
	}
	if(renderer.showFeature("hide")){
		var hideDOM = this.getObjectHideDOM(renderer);
		if(hideDOM) controlsDOM.appendChild(hideDOM);
	}
	return controlsDOM;
}

HTMLObjectHeaderViewer.prototype.getObjectFacetDOM = function(renderer){
	var viewables = renderer.getAvailableFacets();
	var self = this;
	if(viewables && viewables.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-object-facet");
		var callback = function(val){
			if(val){
				renderer.setFacet(val);
			}
		}
		var sel = HTMLFrameHelper.getSelectionControl("object-facet", viewables, renderer.currentFacet(), callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLObjectHeaderViewer.prototype.getObjectLabelDOM = function(renderer){
	var lab = renderer.getLabel();
	if(lab){
		return HTMLFrameHelper.getInfoboxDOM("object-label", false, lab);
	}
	return false;
}

HTMLObjectHeaderViewer.prototype.getObjectIDDOM = function(renderer){
	var val = renderer.subject();
	var input = false;
	if(renderer.mode == "edit" && renderer.isNewDocument()){
		if(renderer.idDOM) val = renderer.idDOM.value;
		input = document.createElement("input");
		input.setAttribute("class", "terminus-object-id-input");
		if(val == "_:") val = "";
		renderer.idDOM = input;
	}
	else {
		if(renderer.isNewDocument() && val == "_:") val = "New Document";
	}
	return HTMLFrameHelper.getInfoboxDOM("object-id", "ID", val, "Every fragment of data is identified by a unique URL", input);
}

HTMLObjectHeaderViewer.prototype.getObjectTypeDOM = function(renderer){
	if(renderer.mode == "edit" && renderer.parent && renderer.parent.isClassChoice() && renderer.isNew()){
		var cs = renderer.parent.getAvailableClassChoices();
		if(cs && cs.length){
			var mpropDOM = document.createElement("span");
			mpropDOM.setAttribute("class", "terminus-property-change-class");
			var mlabDOM = document.createElement("span");
			mlabDOM.setAttribute("class", "terminus-property-change-label");
			mlabDOM.appendChild(document.createTextNode("Type"));
			mpropDOM.appendChild(mlabDOM);
			var callback = function(cls){
				if(cls){
					renderer.changeClass(cls);
				}
			}
			var sel = HTMLFrameHelper.getSelectionControl("change-class", cs, renderer.subjectClass(), callback);
			mpropDOM.appendChild(sel);
			return mpropDOM;
		}
	}
	var cm = renderer.getClassMeta(renderer.subjectClass());
	var lab = renderer.subjectClass();
	var cmt = "All objects have types, identified by a unique URL";
	if(cm){
		lab = (cm.Label && cm.Label["@value"] ? cm.Label["@value"]: lab);
		cmt = (cm.Comment && cm.Comment["@value"] ? renderer.subjectClass() + " " + cm.Comment["@value"] : cmt);
	}
	return HTMLFrameHelper.getInfoboxDOM("object-type", "Type", lab, cmt);
}

HTMLObjectHeaderViewer.prototype.getObjectStatusDOM = function(renderer){
	var sum = renderer.getSummary();
	return HTMLFrameHelper.getInfoboxDOM("status-"+sum.status, false, sum.status, sum.status);
}

HTMLObjectHeaderViewer.prototype.getAddPropertyDOM = function(renderer){
	var addables = renderer.getAddableProperties();
	if(addables && addables.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-object-add-property");
		addables.unshift({ value: "", label: "Add New Property"});
		var callback = function(add){
			if(add){
				renderer.addNewProperty(add);
			}
		}
		var disabled = (renderer.cardControlAllows("add") ? false : "Cardinality Rules Forbid Add");
		var sel = HTMLFrameHelper.getSelectionControl("add-property", addables, "", callback, disabled);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLObjectHeaderViewer.prototype.getViewPropertyDOM = function(renderer){
	var viewables = renderer.getViewableProperties();
	var self = this;
	if(viewables && viewables.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-object-view-property");
		viewables.unshift({ value: "", label: "View Property"});
		var callback = function(add){
			if(add){
				renderer.goToProperty(add);
			}
		}
		var sel = HTMLFrameHelper.getSelectionControl("view-property", viewables, "", callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLObjectHeaderViewer.prototype.getObjectDeleteDOM = function(renderer){
	var callback = function(){renderer.delete()};
	var disabled = (renderer.cardControlAllows("delete") ? false : "Cardinality Rules Forbid Delete");
	return HTMLFrameHelper.getActionControl("object", "delete", "Delete", callback, disabled);
}

HTMLObjectHeaderViewer.prototype.getObjectCloneDOM = function(renderer){
	var callback = function(){renderer.clone()};
	var disabled = (renderer.cardControlAllows("clone") ? false : "Cardinality Rules Forbid Clone");
	return HTMLFrameHelper.getActionControl("object", "clone", "Clone", callback, disabled);
}

HTMLObjectHeaderViewer.prototype.getObjectResetDOM = function(renderer){
	var callback = function(){renderer.reset()};
	var disabled = (renderer.isUpdated() ? false : "Nothing to reset");
	return HTMLFrameHelper.getActionControl("object", "reset", "Reset", callback, disabled);
}

HTMLObjectHeaderViewer.prototype.getViewerSelectorDOM = function(renderer){
	var viewers = renderer.getAvailableViewers();
	if(viewers && viewers.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-object-viewer");
		var callback = function(viewer){
			if(viewer){
				renderer.setViewer(viewer);
			}
		}
		var selected = renderer.currentViewer();
		var sel = HTMLFrameHelper.getSelectionControl('object-viewer', viewers, selected, callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLObjectHeaderViewer.prototype.getObjectHideDOM = function(renderer){
	var callback = function(){renderer.hide()};
	return HTMLFrameHelper.getActionControl("object", "hide", "Hide", callback);
}

HTMLObjectHeaderViewer.prototype.getObjectShowDOM = function(renderer){
	var callback = function(){renderer.show()};
	return HTMLFrameHelper.getActionControl("object", "show", "Show", callback);
}

HTMLObjectHeaderViewer.prototype.getObjectUpdateDOM = function(renderer){
	var dpropDOM = document.createElement("span");
	dpropDOM.setAttribute("class", "terminus-object-update");
	if(renderer.isNewDocument()){
		var disabled = false;//(renderer.isUpdated() ? false : "No changes");
	}
	else {
		var disabled = (renderer.isUpdated() ? false : "No changes");
	}
	var saveback = function(){renderer.save()};
	dpropDOM.appendChild(HTMLFrameHelper.getActionControl("object", "save", "Save", saveback, disabled));
	return dpropDOM;
}

module.exports={HTMLObjectViewer,HTMLObjectHeaderViewer}
