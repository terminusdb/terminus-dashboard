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
	var block = document.createElement('div');
	block.setAttribute('style', 'display: flex; margin: 10px 10px 0px 0px;');
	var br = document.createElement('br');
	block.appendChild(br);
	if(this.propDOM){
		var npropDOM = this.getPropertyDOM();
		block.appendChild(npropDOM);
		this.propDOM.replaceWith(npropDOM);
		//11092019 this.propDOM = npropDOM;
		this.propDOM = block;
	}
	else {
		block.appendChild(this.getPropertyDOM());
		this.propDOM = block;
		//11092019 this.propDOM = this.getPropertyDOM();
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
	var pcls = " terminus-property-frame-display terminus-property-frame-" + orientation;
	if(orientation == "label"){
		var sp = document.createElement("span");
	}
	else {
		var sp = document.createElement("div");
	}
	//terminus-property-frame-spacer

	sp.setAttribute("class", "WHATER terminus-property-frame "+ sp + " terminus-property-frame-" + this.renderer.mode + " " + pcls);
	sp.setAttribute('data-property', this.renderer.property());
	return sp;
}

HTMLPropertyViewer.prototype.getPropertyBodyDOM = function(){
	var orientation = this.renderer.getContentOrientation();
	var pcls = "terminus-property-values-" + orientation;
	if(orientation == "page"){
		var vholder = document.createElement("div");
	}
	else {
		var vholder = document.createElement("span");
	}
    vholder.setAttribute('class', 'terminus-property-values ' + pcls + ' terminus-property-values-align');
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
	idm.setAttribute("class", "terminus-property-idmarker");
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
	var pcls = "terminus-property-header-" + orientation;
	if(orientation == "page"){
		var objDOM = document.createElement("div");
	}
	else {
		var objDOM = document.createElement("span");
	}
	objDOM.setAttribute("class", "terminus-text terminus-property-header " + pcls);
	var wrapper = document.createElement("span");
	wrapper.setAttribute("class", "terminus-property-header-wrapper");
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
	prelude.setAttribute("class", "terminus-property-header-info terminus-property-header-info-"+renderer.currentFacet());
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
		mpropDOM.setAttribute("class", "terminus-property-facet");
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

HTMLPropertyHeaderViewer.prototype.getActionControlDOM = function(settingsDOM, renderer){
	if(renderer.showFeature("mode")){
		var viewsDOM = HTMLFrameHelper.getModeSelectorDOM("property", renderer);
		if (viewsDOM) settingsDOM.appendChild(viewsDOM);
	}
	if(renderer.showFeature("delete")){
		var dpropDOM = this.getPropertyDeleteDOM(renderer);
		if (dpropDOM) settingsDOM.appendChild(dpropDOM);
	}
	if(renderer.showFeature("add") && !renderer.isClassChoice()){
		var addDOM = this.getAddValueDOM(renderer);
		if(addDOM) settingsDOM.appendChild(addDOM);
	}
	if(renderer.showFeature("reset")){
		var rpropDOM = this.getPropertyResetDOM(renderer);
		if(rpropDOM) settingsDOM.appendChild(rpropDOM);
	}
	if(renderer.showFeature("update")){
		var upropDOM = this.getPropertyUpdateDOM(renderer);
		if(upropDOM) settingsDOM.appendChild(upropDOM);
	}
	if(renderer.showFeature("show")){
		var showDOM = this.getPropertyShowDOM(renderer);
		if(showDOM) settingsDOM.appendChild(showDOM);
	}
	if(renderer.showFeature("hide")){
		var hideDOM = this.getPropertyHideDOM(renderer);
		if(hideDOM) settingsDOM.appendChild(hideDOM);
	}
	if(renderer.showFeature("viewer")){
		var hideDOM = this.getViewerSelectorDOM(renderer);
		if(hideDOM) settingsDOM.appendChild(hideDOM);
	}
	if(renderer.showFeature("add") && renderer.isClassChoice()){
		var addDOM = this.getAddValueDOM(renderer);
		if(addDOM) settingsDOM.appendChild(addDOM);
	}
}

HTMLPropertyHeaderViewer.prototype.getSettingsControlDOM = function(controlsDOM, renderer){
	var settings = document.createElement("div");
	var sControl = HTMLFrameHelper.getSettingsControl();
	var popup = document.createElement('div');
	popup.setAttribute('class', 'terminus-hide terminus-popup');
	popup.appendChild(document.createTextNode('blah blah'));
	sControl.appendChild(popup);
	sControl.addEventListener('click', function(){
		if(this.children[0].style.display == 'none') this.children[0].style.display = 'block';
		else this.children[0].style.display = 'block';

	});
    settings.appendChild(sControl);
	controlsDOM.appendChild(settings);
	// append action controls to pop up
	this.getActionControlDOM(popup, renderer);
}

HTMLPropertyHeaderViewer.prototype.getPropertyControlsDOM = function(renderer){
	var controlsDOM = document.createElement("span");
	controlsDOM.setAttribute("class", "terminus-property-controls");
	// get settings icon or button
	this.getSettingsControlDOM(controlsDOM, renderer);
	return controlsDOM;
}

HTMLPropertyHeaderViewer.prototype.getAddValueDOM = function(renderer){
	if(renderer.isClassChoice()){
		var cs = renderer.getAvailableClassChoices();
		if(cs && cs.length){
			var mpropDOM = document.createElement("span");
			mpropDOM.setAttribute("class", "terminus-property-add-class");
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
		mpropDOM.setAttribute("class", "terminus-property-view-value");
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
	dpropDOM.setAttribute("class", "terminus-property-update");
	var disabled = (renderer.isUpdated() ? false : "No Change");
	var saveback = function(){renderer.save()};
	dpropDOM.appendChild(HTMLFrameHelper.getActionControl("property", "save", "Save", saveback, disabled));
	return dpropDOM;
}

HTMLPropertyHeaderViewer.prototype.getViewerSelectorDOM = function(renderer){
	var viewers = renderer.getAvailableViewers();
	if(viewers && viewers.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-property-viewer");
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
