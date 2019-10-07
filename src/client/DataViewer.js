/**
 * Draws the property as header and body components
 */
const HTMLFrameHelper = require('./HTMLFrameHelper');
const HTMLStringViewer = require('./viewers/String');

function HTMLDataViewer(renderer){
	this.renderer = renderer;
	this.headerViewer = renderer.getValueHeaderViewer();
}

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
		if(this.renderer.facet == 'page'){ //expert mode
			if(this.header && this.expModeMenu) {
				this.expModeMenu.appendChild(this.header);
				//this.valDOM.appendChild(this.expModeMenu);
			}
		}
		else if(this.header) this.valDOM.appendChild(this.header);
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
	sp.setAttribute("class", "terminus-property-value property-value-" + this.renderer.currentFacet() + " property-value-" + this.renderer.mode);
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
    vholder.setAttribute('class', ' terminus-property-body property-value-body property-value-body-'+this.renderer.currentFacet() + ' terminus-property-body-align');
	//vholder.setAttribute('style', 'display: flex;');
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
	if(false && this.renderer.currentFacet() == "page"){
		var sControl = HTMLFrameHelper.getSettingsControl('data');
		var menu = document.createElement('div');
		menu.setAttribute('class', 'terminus-hide terminus-popup');
		menu.appendChild(document.createTextNode('Edit property value'));
		menu.appendChild(document.createElement('BR'));
		sControl.appendChild(menu);
		sControl.addEventListener('click', function(e){
			var target = e.target || e.srcElement,
			text = target.textContent || target.innerText;
			if((target.nodeName == 'ICON') || (target.nodeName == 'BUTTON')){
				if(this.children[0].style.display == 'none') this.children[0].style.display = 'block';
				else this.children[0].style.display = 'none';
			}
		});
		this.expModeMenu = menu;
		vholder.appendChild(sControl);
	}
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
	idm.setAttribute("class", "terminus-value-idmarker");
	var subj = TerminusClient.FrameHelper.getShorthand(renderer.subject());
	if(!subj ) subj = renderer.subject();
	var bits = subj .split(":");
	if(bits.length > 1) subj = bits[1];
	var prop = TerminusClient.FrameHelper.getShorthand(renderer.property());
	if(!prop ) prop = renderer.property();
	var bits = prop.split(":");
	if(bits.length > 1) prop = bits[1];
	idm.setAttribute("name", subj + "_" + prop + "_" + renderer.index);
	return idm;
}

HTMLDataViewer.prototype.getSummaryDOM = function(){
	var sum = this.renderer.getSummary();
	return HTMLTerminusClient.FrameHelper.getInfoboxDOM("value-summary", false, sum.long, sum.long);
}

HTMLDataViewer.prototype.fireInternalLink = function(link){
	var self = this;
	var fire = function(e){
		e.preventDefault();
		self.renderer.load(link);		
	}
	return fire;
}

HTMLDataViewer.prototype.internalLink = function(link, label){
	var onclick = this.fireInternalLink(link);
	var a = document.createElement("a");
	a.onClick = onclick;
	a.href=link;
	a.addEventListener("click", onclick);
	if(label){
		a.appendChild(document.createTextNode(label));
	}
	else {
		var sh = TerminusClient.FrameHelper.getShorthand(link);
		if(sh){
			a.setAttribute("title", link);
			a.appendChild(document.createTextNode(sh));
		}
		else {
			a.appendChild(document.createTextNode(link));
		}
	}
	return a;
}

HTMLDataViewer.prototype.clear = function(){
	TerminusClient.FrameHelper.removeChildren(this.valDOM);
}


function HTMLDataHeaderViewer(){}

HTMLDataHeaderViewer.prototype.getAsDOM = function(renderer){
	if(renderer.currentFacet() == "page"){
		var objDOM = document.createElement("div");
	}
	else {
		var objDOM = document.createElement("span");
	}
	objDOM.setAttribute("class", "terminus-value-header terminus-value-header-" + renderer.currentFacet());
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
		mpropDOM.setAttribute("class", "terminus-value-facet");
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
	controlsDOM.setAttribute("class", "terminus-value-controls");
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
	dpropDOM.setAttribute("class", "terminus-value-update");
	var saveback = function(){renderer.save()};
	var disabled = (renderer.isUpdated() ? false : "Nothing to save - no change");
	dpropDOM.appendChild(HTMLFrameHelper.getActionControl("value", "save", "Save", saveback, disabled));
	return dpropDOM;
}

HTMLDataHeaderViewer.prototype.getViewerSelectorDOM = function(renderer){
	var viewers = renderer.getAvailableViewers();
	if(viewers && viewers.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-value-viewer");
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

module.exports={HTMLDataViewer,HTMLDataHeaderViewer,JSONObjectViewer}
