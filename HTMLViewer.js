/**
 * Object for producing a HTML view of a given object in a frame
 */
function HTMLObjectViewer(renderer){
	this.renderer = renderer;
	this.properties = [];
	this.headerViewer = renderer.getObjectHeaderViewer();
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
	var pcls = "object-frame-" + orientation;
	if(orientation == "page"){
		var sp = document.createElement("div");			
	}
	else { 
		var sp = document.createElement("span");			
	}
	var css = "object-frame " + pcls + (this.renderer.parent ? "" : " root-frame") + " object-frame-" + this.renderer.mode;
	sp.setAttribute("class", css);
	sp.setAttribute("data-class", this.renderer.objtype());
	sp.setAttribute("data-id", this.renderer.subject());
	return sp;
}

HTMLObjectViewer.prototype.getObjectBodyDOM = function(){
	var orientation = this.renderer.getContentOrientation();
	var pcls = "object-properties-" + orientation;
	if(orientation == "page"){
		var vholder = document.createElement("div");			
	}
	else { 
		var vholder = document.createElement("span");			
	}
    vholder.setAttribute('class', 'object-properties ' + pcls);
    for(var prop in this.properties){
		if(this.properties[prop]) vholder.appendChild(this.properties[prop]);
	}
	return vholder;
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
	idm.setAttribute("class", "object-idmarker");
	var sh = FrameHelper.getShorthand(renderer.subject());
    if(!sh) sh = renderer.subject();
	var bits = sh.split(":");
	if(bits.length > 1) sh = bits[1];
	idm.setAttribute("name", sh);
	return idm;
}	

function HTMLObjectHeaderViewer(){}

HTMLObjectHeaderViewer.prototype.getAsDOM = function(renderer){
	var orientation = renderer.getContentOrientation();
	var pcls = "object-header-" + orientation;
	if(orientation == "page"){
		var objDOM = document.createElement("div");			
	}
	else { 
		var objDOM = document.createElement("span");			
	}
	objDOM.setAttribute("class", "object-header " + pcls);
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
	return objDOM;
}

HTMLObjectHeaderViewer.prototype.getObjectSummaryDOM = function(renderer){
	var sum = renderer.getSummary();
	return HTMLFrameHelper.getInfoboxDOM("object-summary", false, sum.long, sum.status);
}

HTMLObjectHeaderViewer.prototype.getObjectControlsDOM = function(renderer){
	var controlsDOM = document.createElement("span");
	controlsDOM.setAttribute("class", "object-controls");
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
		mpropDOM.setAttribute("class", "object-facet");
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
		input.setAttribute("class", "object-id-input");
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
			mpropDOM.setAttribute("class", "property-change-class");
			var mlabDOM = document.createElement("span");
			mlabDOM.setAttribute("class", "property-change-label");
			mlabDOM.appendChild(document.createTextNode("Type"));
			mpropDOM.appendChild(mlabDOM);
			var callback = function(cls){
				if(cls){
					renderer.changeClass(cls);
				}
			}
			var sel = HTMLFrameHelper.getSelectionControl("change-class", cs, renderer.objtype(), callback);
			mpropDOM.appendChild(sel);
			return mpropDOM;
		}
	}
	var cm = renderer.getClassMeta(renderer.objtype());
	var lab = renderer.objtype();
	var cmt = "All objects have types, identified by a unique URL";
	if(cm){
		lab = (cm.Label && cm.Label.data ? cm.Label.data : lab);
		cmt = (cm.Comment && cm.Comment.data ? renderer.objtype() + " " + cm.Comment.data : cmt);
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
		mpropDOM.setAttribute("class", "object-add-property");
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
		mpropDOM.setAttribute("class", "object-view-property");
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
		mpropDOM.setAttribute("class", "object-viewer");
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
	dpropDOM.setAttribute("class", "object-update");
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

/**
 * Property Viewer 
 */
function HTMLPropertyViewer(renderer){
	this.renderer = renderer;
	this.values = [];
	this.headerViewer = renderer.getPropertyHeaderViewer();
}


/**
 * Draws the property as header and body components
 */
HTMLPropertyViewer.prototype.render = function(){
	if(this.propDOM){
		var npropDOM = this.getPropertyDOM();
		this.propDOM.replaceWith(npropDOM);
		this.propDOM = npropDOM;
	}
	else {
		this.propDOM = this.getPropertyDOM();
	}
	this.propDOM.appendChild(this.getPropertyIDMarker(this.renderer));
	if(this.headerViewer){
		this.header = this.headerViewer.getAsDOM(this.renderer);
		if(this.header) this.propDOM.appendChild(this.header);
	}
	this.body = this.getPropertyBodyDOM();
	if(this.body) this.propDOM.appendChild(this.body);
	return this.propDOM;
}

HTMLPropertyViewer.prototype.getPropertyDOM = function(){
	var orientation = this.renderer.getContentOrientation();
	var pcls = "property-frame-" + orientation;
	if(orientation == "label"){
		var sp = document.createElement("span");			
	}
	else { 
		var sp = document.createElement("div");			
	}
	sp.setAttribute("class", "property-frame "+ sp + " property-frame-" + this.renderer.mode);
	sp.setAttribute('data-property', this.renderer.property());
	return sp;
}

HTMLPropertyViewer.prototype.getPropertyBodyDOM = function(){
	var orientation = this.renderer.getContentOrientation();
	var pcls = "property-values-" + orientation;
	if(orientation == "page"){
		var vholder = document.createElement("div");			
	}
	else { 
		var vholder = document.createElement("span");			
	}
    vholder.setAttribute('class', 'property-values ' + pcls);
	for(var i =0; i<this.values.length; i++){
		vholder.appendChild(this.values[i]);
	}
	return vholder;
}

HTMLPropertyViewer.prototype.addRenderedValue = function(renderedval){
	this.values.push(renderedval);	
}

HTMLPropertyViewer.prototype.clear = function(){
	FrameHelper.removeChildren(this.propDOM);
	this.values = [];
}


/**
 * Removes the property from the dom
 */
HTMLPropertyViewer.prototype.remove = function(){
	this.propDOM.parentNode.removeChild(this.propDOM);	
}

/**
 * Redraws the property to reflect an updated state
 */
HTMLPropertyViewer.prototype.redraw = function(){
	var npropDOM = this.getPropertyDOM();
	this.propDOM.replaceWith(npropDOM);
	this.propDOM = npropDOM;
	this.values = [];
	this.renderer.render(this);
}

HTMLPropertyViewer.prototype.redrawHeader = function(){
	if(this.headerViewer && this.header) {
		var nheader = this.headerViewer.getAsDOM(this.renderer);
		this.header.replaceWith(nheader);
		this.header = nheader;
	}
}

HTMLPropertyViewer.prototype.redrawBody = function(){
	if(this.body){
		var nbody = this.getPropertyBodyDOM();
		this.body.replaceWith(nbody);
		this.body = nbody;
	}
}

/**
 * Generates a html anchor element to use as a marker to find the property on the page
 */
HTMLPropertyViewer.prototype.getPropertyIDMarker = function(renderer){
	var idm = document.createElement("a");
	idm.setAttribute("class", "property-idmarker");
	var subj = FrameHelper.getShorthand(renderer.subject());
	if(!subj ) subj = renderer.subject();
	var bits = subj .split(":");
	if(bits.length > 1) subj = bits[1];
	var prop = FrameHelper.getShorthand(renderer.property());
	if(!prop ) prop = renderer.property();
	var bits = prop.split(":");
	if(bits.length > 1) prop = bits[1];
	idm.setAttribute("name", subj + "_" + prop);
	return idm;
}

HTMLPropertyViewer.prototype.goTo = function(subj, property, index){
	HTMLFrameHelper.goToName(subj, property, index);
}

function HTMLPropertyHeaderViewer(){}

HTMLPropertyHeaderViewer.prototype.getAsDOM = function(renderer){
	var orientation = renderer.getContentOrientation();
	var pcls = "property-header-" + orientation;
	if(orientation == "page"){
		var objDOM = document.createElement("div");			
	}
	else { 
		var objDOM = document.createElement("span");			
	}
	objDOM.setAttribute("class", "property-header " + pcls);
	var wrapper = document.createElement("span");
	wrapper.setAttribute("class", "property-header-wrapper");
	if(renderer.showFeature("control")){
		var controlsDOM = this.getPropertyControlsDOM(renderer);
		if(controlsDOM) wrapper.appendChild(controlsDOM);
	}
	if(renderer.showFeature("label")){
		var sumDOM = this.getPropertyLabelDOM(renderer);
		if(renderer.showFeature("status")){
			var statDOM = this.getPropertyStatusDOM(renderer);
			if(statDOM) sumDOM.prepend(statDOM);
		}
		if(sumDOM) wrapper.appendChild(sumDOM);
	}
	else if(renderer.showFeature("status")){
		var statDOM = this.getPropertyStatusDOM(renderer);
		if(statDOM) wrapper.appendChild(statDOM);	
	}
	if(renderer.showFeature("summary")){
		var sumDOM = this.getPropertySummaryDOM(renderer);
		if(sumDOM) wrapper.appendChild(sumDOM);
	}
	var prelude = document.createElement("span");
	prelude.setAttribute("class", "property-header-info property-header-info-"+renderer.currentFacet());
	if(renderer.showFeature("facet")){
		var facetDOM = this.getPropertyFacetDOM(renderer);
		if(facetDOM) prelude.appendChild(facetDOM);
	}
	if(renderer.showFeature("view")){
		var viewDOM = this.getViewValueDOM(renderer);
		if(viewDOM) prelude.appendChild(viewDOM);		
	}
	if(renderer.showFeature("id")){
		var idDOM = this.getPropertyIDDOM(renderer);
		if(idDOM) prelude.appendChild(idDOM);
	}
	if(renderer.showFeature("type")){
		var typeDOM = this.getPropertyRangeDOM(renderer);
		if(typeDOM) prelude.appendChild(typeDOM);		
	}
	if(renderer.showFeature("cardinality") && renderer.hasCardinalityRestriction()){
		var hideDOM = this.getPropertyCardinalityDOM(renderer);
		if(hideDOM) prelude.appendChild(hideDOM);
	}
	if(renderer.showFeature("comment")){
		var sumDOM = this.getPropertyCommentDOM(renderer);
		if(sumDOM) prelude.appendChild(sumDOM);
	}
	wrapper.appendChild(prelude);
	objDOM.appendChild(wrapper);
	return objDOM;
}

HTMLPropertyHeaderViewer.prototype.getPropertyFacetDOM = function(renderer){
	var viewables = renderer.getAvailableFacets();
	var self = this;
	if(viewables && viewables.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "property-facet");
		var callback = function(val){
			if(val){
				renderer.setFacet(val);
			}
		}
		var sel = HTMLFrameHelper.getSelectionControl("property-facet", viewables, renderer.currentFacet(), callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLPropertyHeaderViewer.prototype.getPropertyIDDOM = function(renderer){
	return HTMLFrameHelper.getInfoboxDOM("property-id", "Property", renderer.property(), "This property is identified by this unique URL: " + renderer.property());
}

HTMLPropertyHeaderViewer.prototype.getPropertyRangeDOM = function(renderer){
	return HTMLFrameHelper.getInfoboxDOM("property-type", "Type", renderer.range(), "The type of arguments that this property accepts");
}

HTMLPropertyHeaderViewer.prototype.getPropertySummaryDOM = function(renderer){
	var sum = renderer.getSummary();
	return HTMLFrameHelper.getInfoboxDOM("property-summary", false, sum.long, sum.status);
}

HTMLPropertyHeaderViewer.prototype.getPropertyStatusDOM = function(renderer){
	var sum = renderer.getSummary();
	return HTMLFrameHelper.getInfoboxDOM("status-"+sum.status, false, sum.status, sum.status);
}

HTMLPropertyHeaderViewer.prototype.getPropertyLabelDOM = function(renderer){
	var lab = renderer.getLabel();
	return HTMLFrameHelper.getInfoboxDOM("property-label", false, lab);
}

HTMLPropertyHeaderViewer.prototype.getPropertyCommentDOM = function(renderer){
	var lab = renderer.getComment();
	return HTMLFrameHelper.getInfoboxDOM("property-comment", false, lab);
}

HTMLPropertyHeaderViewer.prototype.getPropertyCardinalityDOM = function(renderer){
	var restriction = renderer.getRestriction();
	if(restriction.min && restriction.max){
		if(restriction.min == restriction.max){
			var lab = restriction.min;
			var help = "Cardinality: " + restriction.min;
		}
		else {
			var lab = restriction.min + "-" + restriction.max;
			var help = "Minimum Cardinality: " + restriction.min;
			help += ", Maximum Cardinality: " + restriction.max;
		}
	}
	else if(restriction.min){
		var lab = ">"+(restriction.min-1);
		var help = "Minimum Cardinality: " + restriction.min;
	}
	else if(restriction.max){
		var lab = "<"+(restriction.max+1);
		var help = "Maximum Cardinality: " + restriction.max;		
	}
	else {
		return false;
	}
	return HTMLFrameHelper.getInfoboxDOM("property-cardinality", "Cardinality", lab, help);
}

HTMLPropertyHeaderViewer.prototype.getPropertyControlsDOM = function(renderer){
	var controlsDOM = document.createElement("span");
	controlsDOM.setAttribute("class", "property-controls");
	if(renderer.showFeature("mode")){
		var viewsDOM = HTMLFrameHelper.getModeSelectorDOM("property", renderer);
		if(viewsDOM) controlsDOM.appendChild(viewsDOM);
	}
	if(renderer.showFeature("delete")){
		var dpropDOM = this.getPropertyDeleteDOM(renderer);
		if(dpropDOM) controlsDOM.appendChild(dpropDOM);
	}
	if(renderer.showFeature("add") && !renderer.isClassChoice()){
		var addDOM = this.getAddValueDOM(renderer);
		if(addDOM) controlsDOM.appendChild(addDOM);		
	}
	if(renderer.showFeature("reset")){
		var rpropDOM = this.getPropertyResetDOM(renderer);
		if(rpropDOM) controlsDOM.appendChild(rpropDOM);
	}
	if(renderer.showFeature("update")){
		var upropDOM = this.getPropertyUpdateDOM(renderer);
		if(upropDOM) controlsDOM.appendChild(upropDOM);
	}
	if(renderer.showFeature("show")){
		var showDOM = this.getPropertyShowDOM(renderer);
		if(showDOM) controlsDOM.appendChild(showDOM);		
	}
	if(renderer.showFeature("hide")){
		var hideDOM = this.getPropertyHideDOM(renderer);
		if(hideDOM) controlsDOM.appendChild(hideDOM);
	}
	if(renderer.showFeature("viewer")){
		var hideDOM = this.getViewerSelectorDOM(renderer);
		if(hideDOM) controlsDOM.appendChild(hideDOM);
	}
	if(renderer.showFeature("add") && renderer.isClassChoice()){
		var addDOM = this.getAddValueDOM(renderer);
		if(addDOM) controlsDOM.appendChild(addDOM);		
	}
	return controlsDOM;
}

HTMLPropertyHeaderViewer.prototype.getAddValueDOM = function(renderer){
	if(renderer.isClassChoice()){
		var cs = renderer.getAvailableClassChoices();
		if(cs && cs.length){
			var mpropDOM = document.createElement("span");
			mpropDOM.setAttribute("class", "property-add-class");
			cs.unshift({ value: "", label: "Add Type"});
			var callback = function(cls){
				if(cls){
					renderer.addClass(cls);
				}
			}
			var sel = HTMLFrameHelper.getSelectionControl("add-property", cs, "", callback);
			mpropDOM.appendChild(sel);
			return mpropDOM;
		}
	}
	else {
		var callback = function(){renderer.add("edit")};
		var disabled = (renderer.cardControlAllows("add") ? false : "Cardinality Rules Forbid Add");
		return HTMLFrameHelper.getActionControl("property", "add", "Add", callback, disabled);
	}
	return false;
}

HTMLPropertyHeaderViewer.prototype.getViewValueDOM = function(renderer){
	var viewables = renderer.getViewableValues();
	var self = this;
	if(viewables && viewables.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "property-view-value");
		viewables.unshift({ value: "", label: "View Value"});
		var callback = function(val){
			renderer.goToValue(val);
		}
		var sel = HTMLFrameHelper.getSelectionControl("view-values", viewables, "", callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLPropertyHeaderViewer.prototype.getPropertyDeleteDOM = function(renderer){
	var callback = function(){renderer.delete()};
	var disabled = (renderer.cardControlAllows("delete") ? false : "Cardinality Rules Forbid Delete");
	return HTMLFrameHelper.getActionControl("property", "delete", "Delete", callback, disabled);
}

HTMLPropertyHeaderViewer.prototype.getPropertyHideDOM = function(renderer){
	var callback = function(){renderer.hide()};
	return HTMLFrameHelper.getActionControl("property", "hide", "Hide", callback);
}

HTMLPropertyHeaderViewer.prototype.getPropertyResetDOM = function(renderer){
	var callback = function(){renderer.reset()};
	var disabled = (renderer.isUpdated() ? false : "Nothing to reset");
	return HTMLFrameHelper.getActionControl("property", "reset", "Reset", callback, disabled);
}

HTMLPropertyHeaderViewer.prototype.getPropertyShowDOM = function(renderer){
	var callback = function(){renderer.show()};
	return HTMLFrameHelper.getActionControl("property", "show", "Show", callback);
}

HTMLPropertyHeaderViewer.prototype.getPropertyUpdateDOM = function(renderer){
	var dpropDOM = document.createElement("span");
	dpropDOM.setAttribute("class", "property-update");
	var disabled = (renderer.isUpdated() ? false : "No Change");
	var saveback = function(){renderer.save()};
	dpropDOM.appendChild(HTMLFrameHelper.getActionControl("property", "save", "Save", saveback, disabled));		
	return dpropDOM;
}

HTMLPropertyHeaderViewer.prototype.getViewerSelectorDOM = function(renderer){
	var viewers = renderer.getAvailableViewers();
	if(viewers && viewers.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "property-viewer");
		var callback = function(viewer){
			if(viewer){
				renderer.setViewer(viewer);
			}
		}
		var selected = renderer.currentViewer();
		var sel = HTMLFrameHelper.getSelectionControl("property-viewers", viewers, selected, callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLPropertyHeaderViewer.prototype.showValue = function(renderer, index){
	var htmlid = renderer.subject() + "->" + renderer.property() + "_" + index;
	window.location = (""+window.location).replace(/#[A-Za-z0-9_]*$/,'') + "#" + htmlid;
} 

function HTMLDataViewer(renderer){
	this.renderer = renderer;	
	this.headerViewer = renderer.getValueHeaderViewer();
}

/**
 * Draws the property as header and body components
 */
HTMLDataViewer.prototype.render = function(){
	if(this.valDOM){
		var nvalDOM = this.getValueDOM();
		this.valDOM.replaceWith(nvalDOM);
		this.valDOM = nvalDOM;
	}
	else {
		this.valDOM = this.getValueDOM();
	}
	this.valDOM.appendChild(this.getValueIDMarker(this.renderer));
	this.body = this.getValueBodyDOM();
	if(this.body) this.valDOM.appendChild(this.body);
	if(this.headerViewer){
		this.header = this.headerViewer.getAsDOM(this.renderer);
		if(this.header) this.valDOM.appendChild(this.header);		
	}
	return this.valDOM;
}

HTMLDataViewer.prototype.getValueDOM = function(){
	if(this.renderer.currentFacet() == "page"){
		var sp = document.createElement("div");
	}
	else {
		var sp = document.createElement("span");
	}
	sp.setAttribute("class", "property-value property-value-" + this.renderer.currentFacet() + " property-value-" + this.renderer.mode);
	if(this.renderer.mode == "view"){
		sp.setAttribute('data-value', this.renderer.value());		
	}
	return sp;
}

HTMLDataViewer.prototype.getValueBodyDOM = function(){
	if(this.renderer.currentFacet() == "page"){
		var vholder = document.createElement("div");			
	}
	else {
		var vholder = document.createElement("span");
	}
    vholder.setAttribute('class', 'property-value-body property-value-body-'+this.renderer.currentFacet());
    if(this.renderer.showFeature("body")){
        var valueViewer = this.renderer.getDataValueViewer();
    	var vdom = valueViewer.getDOM(this.renderer, this);
    }
    else if(this.renderer.showFeature("summary")){
		var vdom = this.getSummaryDOM();
    }
    else {
    	return false;
    }
    if(vdom) vholder.appendChild(vdom);
	return vholder;
}

/**
 * Removes the value from the dom
 */
HTMLDataViewer.prototype.remove = function(){
	this.valDOM.parentNode.removeChild(this.valDOM);	
}

HTMLDataViewer.prototype.redrawHeader = function(){
	if(this.headerViewer && this.header) {
		var nheader = this.headerViewer.getAsDOM(this.renderer);
		this.header.replaceWith(nheader);
		this.header = nheader;
	}
}

HTMLDataViewer.prototype.redrawBody = function(){
	if(this.body){
		var nbody = this.getValueBodyDOM();
		this.body.replaceWith(nbody);
		this.body = nbody;
	}
}

/**
 * Generates a html anchor element to use as a marker to find the property on the page
 */
HTMLDataViewer.prototype.getValueIDMarker = function(renderer){
	var idm = document.createElement("a");
	idm.setAttribute("class", "value-idmarker");
	var subj = FrameHelper.getShorthand(renderer.subject());
	if(!subj ) subj = renderer.subject();
	var bits = subj .split(":");
	if(bits.length > 1) subj = bits[1];
	var prop = FrameHelper.getShorthand(renderer.property());
	if(!prop ) prop = renderer.property();
	var bits = prop.split(":");
	if(bits.length > 1) prop = bits[1];
	idm.setAttribute("name", subj + "_" + prop + "_" + renderer.index);
	return idm;
}

HTMLDataViewer.prototype.getSummaryDOM = function(){
	var sum = this.renderer.getSummary();
	return HTMLFrameHelper.getInfoboxDOM("value-summary", false, sum.long, sum.long);
}

HTMLDataViewer.prototype.internalLink = function(link){
	var self = this;
	var onclick = function(e){
		e.preventDefault();
		self.renderer.load(link);
	}
	var a = document.createElement("a");
	a.onClick = onclick;
	a.href="";
	a.addEventListener("click", onclick);
	var sh = FrameHelper.getShorthand(link);
	if(sh){
		a.setAttribute("title", link);
		a.appendChild(document.createTextNode(sh));
	}
	else {
		a.appendChild(document.createTextNode(link));
	}
	return a;
}

HTMLDataViewer.prototype.clear = function(){
	FrameHelper.removeChildren(this.valDOM);
}


function HTMLDataHeaderViewer(){}

HTMLDataHeaderViewer.prototype.getAsDOM = function(renderer){
	if(renderer.currentFacet() == "page"){
		var objDOM = document.createElement("div");
	}
	else {
		var objDOM = document.createElement("span");
	}
	objDOM.setAttribute("class", "value-header value-header-" + renderer.currentFacet());
	if(renderer.showFeature("facet")){
		var facetDOM = this.getValueFacetDOM(renderer);
		if(facetDOM) objDOM.appendChild(facetDOM);
	}
	if(renderer.showFeature("viewer")){
		var hideDOM = this.getViewerSelectorDOM(renderer);
		if(hideDOM) objDOM.appendChild(hideDOM);
	}
	if(renderer.showFeature("type")){
		var typeDOM = this.getValueTypeDOM(renderer);
		if(typeDOM) objDOM.appendChild(typeDOM);		
	}
	if(renderer.showFeature("status")){
		var sumDOM = this.getValueStatusDOM(renderer);
		if(sumDOM) objDOM.appendChild(sumDOM);
	}
	if(renderer.showFeature("control")){
		var controlsDOM = this.getValueControlsDOM(renderer);
		if(controlsDOM) objDOM.appendChild(controlsDOM);
	}
	return objDOM;
}

HTMLDataHeaderViewer.prototype.getValueFacetDOM = function(renderer){
	var viewables = renderer.getAvailableFacets();
	var self = this;
	if(viewables && viewables.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "value-facet");
		var callback = function(val){
			if(val){
				renderer.setFacet(val);
			}
		}
		var sel = HTMLFrameHelper.getSelectionControl("value-facet", viewables, renderer.currentFacet(), callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}


HTMLDataHeaderViewer.prototype.getValueTypeDOM = function(renderer){
	return HTMLFrameHelper.getInfoboxDOM("value-type", "Type", renderer.type(), "All data values have types, identified by a unique URL");
}

HTMLDataHeaderViewer.prototype.getValueStatusDOM = function(renderer){
	var sum = renderer.getSummary();
	return HTMLFrameHelper.getInfoboxDOM("status-"+sum.status, false, sum.status, sum.status);
}


HTMLDataHeaderViewer.prototype.getValueControlsDOM = function(renderer){
	var controlsDOM = document.createElement("span");
	controlsDOM.setAttribute("class", "value-controls");
	if(renderer.showFeature("mode")){
		var viewsDOM = HTMLFrameHelper.getModeSelectorDOM("value", renderer);
		if(viewsDOM) controlsDOM.appendChild(viewsDOM);
	}
	if(renderer.showFeature("delete")){
		var dpropDOM = this.getValueDeleteDOM(renderer);
		if(dpropDOM) controlsDOM.appendChild(dpropDOM);
	}
	if(renderer.showFeature("clone")){
		var cpropDOM = this.getValueCloneDOM(renderer);
		if(cpropDOM) controlsDOM.appendChild(cpropDOM);
	}
	if(renderer.showFeature("reset")){
		var rpropDOM = this.getValueResetDOM(renderer);
		if(rpropDOM) controlsDOM.appendChild(rpropDOM);
	}
	if(renderer.showFeature("update")){
		var upropDOM = this.getValueUpdateDOM(renderer);
		if(upropDOM) controlsDOM.appendChild(upropDOM);
	}
	if(renderer.showFeature("show")){
		var showDOM = this.getValueShowDOM(renderer);
		if(showDOM) controlsDOM.appendChild(showDOM);
	}
	if(renderer.showFeature("hide")){
		var hideDOM = this.getValueHideDOM(renderer);
		if(hideDOM) controlsDOM.appendChild(hideDOM);
	}
	return controlsDOM;
}

HTMLDataHeaderViewer.prototype.getValueDeleteDOM = function(renderer){
	var callback = function(){renderer.delete()};
	var disabled = (renderer.cardControlAllows("delete") ? false : "Cardinality Rules Forbid Delete");
	return HTMLFrameHelper.getActionControl("value", "delete", "Delete", callback, disabled);
}

HTMLDataHeaderViewer.prototype.getValueResetDOM = function(renderer){
	var callback = function(){renderer.reset()};
	var disabled = (renderer.isUpdated() ? false : "Nothing to reset");
	return HTMLFrameHelper.getActionControl("value", "reset", "Reset", callback, disabled);
}

HTMLDataHeaderViewer.prototype.getValueShowDOM = function(renderer){
	var callback = function(){renderer.show()};
	return HTMLFrameHelper.getActionControl("value", "show", "Show", callback);
}

HTMLDataHeaderViewer.prototype.getValueHideDOM = function(renderer){
	var callback = function(){renderer.hide()};
	return HTMLFrameHelper.getActionControl("value", "hide", "Hide", callback);
}

HTMLDataHeaderViewer.prototype.getValueCloneDOM = function(renderer){
	var callback = function(){renderer.clone()};
	var disabled = (renderer.cardControlAllows("clone") ? false : "Cardinality Rules Forbid Clone");
	return HTMLFrameHelper.getActionControl("value", "clone", "Clone", callback, disabled);
}

HTMLDataHeaderViewer.prototype.getValueUpdateDOM = function(renderer){
	var dpropDOM = document.createElement("span");
	dpropDOM.setAttribute("class", "value-update");
	var saveback = function(){renderer.save()};
	var disabled = (renderer.isUpdated() ? false : "Nothing to save - no change");
	dpropDOM.appendChild(HTMLFrameHelper.getActionControl("value", "save", "Save", saveback, disabled));		
	return dpropDOM;
}

HTMLDataHeaderViewer.prototype.getViewerSelectorDOM = function(renderer){
	var viewers = renderer.getAvailableViewers();
	if(viewers && viewers.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "value-viewer");
		var callback = function(viewer){
			if(viewer){
				renderer.setViewer(viewer);
			}
		}
		var selected = renderer.currentViewer();
		var sel = HTMLFrameHelper.getSelectionControl("data-viewer", viewers, selected, callback);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

let HTMLFrameHelper = {};

HTMLFrameHelper.getActionControl = function(type, control, label, callback, disabled){
	var dpropDOM = document.createElement("span");
	dpropDOM.setAttribute("class", type + "-" + control);
	var button = document.createElement("button");
	button.appendChild(document.createTextNode(label));
	if(disabled){
		button.setAttribute("class", "frame-control-action action-disabled " + type + "-" + control + "-disabled");
		button.setAttribute("title", disabled);
	}
	else {
		button.setAttribute("class", "frame-control-action " + type + "-" + control);
		button.addEventListener("click", function(){
			callback(control);
		});
	}
	dpropDOM.appendChild(button);
	return dpropDOM;	
}

HTMLFrameHelper.getClassSelect = function(clist){
	if(!clist) return false;
	var s = document.createElement("select");
	s.setAttribute("class", "class-select");
	var opt1 = document.createElement("option");
	opt1.setAttribute("class", "class-choice");
	opt1.value = "";
	opt1.appendChild(document.createTextNode("Select Document Type to Create"));
	s.appendChild(opt1);
	if(clist.length){
		for(var i = 0; i<clist.length; i++){
			var fl = FrameHelper.labelFromURL(clist[i]);
			if(fl == "Nothing") continue;
			var opt = document.createElement("option");
			opt.setAttribute("class", "class-choice");
			opt.value = clist[i];
			opt.appendChild(document.createTextNode(fl));		
			s.appendChild(opt);
		}
	}
	else {
		if(clist.bindings){
			var added = [];
			for(var i = 0; i<clist.bindings.length; i++){
				if(clist.bindings[i].Class && added.indexOf(clist.bindings[i].Class) == -1){
					added.push(clist.bindings[i].Class);
					var opt = document.createElement("option");
					opt.setAttribute("class", "class-choice");
					opt.value = clist.bindings[i].Class;
					var lab = clist.bindings[i].Label;
					if(!lab || lab == "unknown"){
						lab = FrameHelper.labelFromURL(clist.bindings[i].Class);
					}
					if(lab.data) lab = lab.data;
					opt.appendChild(document.createTextNode(lab));		
					s.appendChild(opt);
				}
			}
		}
	}
	return s;
}

HTMLFrameHelper.getSelectionControl = function(type, options, selected, callback){
	var sel = document.createElement("select");
	sel.setAttribute("class", "frame-control-selection " + type);
	for(var i = 0; i < options.length; i++){
		var opt = document.createElement("option");
		if(typeof options[i] == "object"){
			opt.value = options[i].value;
			var label = (options[i].label ?  document.createTextNode(options[i].label) : document.createTextNode(FrameHelper.labelFromURL(options[i].value)));
			opt.appendChild(label);			
		}
		else {
			opt.value = options[i];
			label = FrameHelper.labelFromURL(opt.value);
			opt.appendChild(document.createTextNode(label));			
		}
		if(selected == opt.value){
			opt.setAttribute("selected", "selected");
		}
		sel.appendChild(opt);
	}
	sel.addEventListener("change", function(){
		callback(this.value);
	});
	return sel;
}

HTMLFrameHelper.getModeSelectorDOM = function(which, renderer){
	var viewsDOM = document.createElement("span");
	viewsDOM.setAttribute("class", which+"-mode");
	if(renderer.mode == "view"){
		var callback = function(){ renderer.setMode("edit");}
		viewsDOM.appendChild(HTMLFrameHelper.getActionControl(which+"-mode", "edit", " Edit ", callback));
	}
	else if(renderer.isNew()){
		return false;
	}
	else {
		var callback = function(){ renderer.cancel();}
		viewsDOM.appendChild(HTMLFrameHelper.getActionControl(which, "cancel", "Cancel", callback));
	}
	return viewsDOM;
}

HTMLFrameHelper.goToName = function(s, p, i){
	var url = window.location.href;
	if(url){
		var wbits = url.split("#");
		var loc = wbits[0];
		var sh = FrameHelper.getShorthand(s);
	    if(!sh) sh = s;
		var bits = sh.split(":");
		if(bits.length > 1) sh = bits[1];
		var htmlid = sh;
		if(p){
			var prop = FrameHelper.getShorthand(p);
			if(!prop ) prop = p;
			var bits = prop.split(":");
			if(bits.length > 1) prop = bits[1];		
			htmlid += "_" + prop;
			if(i){
				htmlid += "_" + i;
			}
		}
		window.location = loc + "#" + htmlid;
	}
}

HTMLFrameHelper.getInfoboxDOM = function(type, label, value, help, input){
	var infoDOM = document.createElement("span");
	infoDOM.setAttribute("class", "frame-infobox " + type);
	if(help){
		infoDOM.setAttribute("title", help);
	}
	if(label){
		var linfo = document.createElement("span");
		linfo.setAttribute("class", "frame-infobox-label " + type + "-label");
		linfo.appendChild(document.createTextNode(label));
		infoDOM.appendChild(linfo);
	}
	var lval = document.createElement("span");
	lval.setAttribute("class", "frame-infobox-value " + type + "-value");
	if(input){
		input.value = value;
		lval.appendChild(input);
	}
	else if(value) {
		var sh = FrameHelper.getShorthand(value);
        if(sh){
    	   	var bits = sh.split(":");
            sh = bits[1];
   			lval.setAttribute("title", value);
			lval.appendChild(document.createTextNode(sh));
		}
		else {
			lval.appendChild(document.createTextNode(value));
		}
	}
	infoDOM.appendChild(lval);
	return infoDOM;
}

function JSONObjectViewer(renderer){
	this.renderer = renderer;
	this.properties = [];
}

/**
 * Functions for rendering / re-rendering the object as header and body components
 */
JSONObjectViewer.prototype.render = function(){
	alert("render json tbd");
}
JSONObjectViewer.prototype.redraw = function(){
	alert('redraw json tbd');
}

