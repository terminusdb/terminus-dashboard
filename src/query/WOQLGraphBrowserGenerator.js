function WOQLGraphBrowserGenerator(tq, qman, ui){
	this.query = tq;
	this.wquery = qman.wquery;
	//this.filter = new WOQLQueryFilter(this);
	this.slider = new WOQLTimePicker();
}

WOQLGraphBrowserGenerator.prototype.getAsDOM = function(q){
	var qbox = document.createElement("div");
	qbox.setAttribute("class", "terminus-query-textbox-input");
	qbox.appendChild(document.createTextNode("afsdfa"));
	qbox.appendChild(this.slider.getSliderDOM());
	return qbox;
}


function DCOGBrowser(controller, model, config){
	this.myowner = controller;
	this.model = model;
	this.config = config;
	this.default_viewport = (config && config.view ? config.view : "graph");
	this.current_viewport = false;

	//internal state
	this.viewports = {};
	this.viewportDOMs = {};
	this.browserid = randomString(8);
	this.query_timeslice = false;
	this.current_result = false;
	this.focus_node = false;//(config && config.focus_node ? config.focus_node : "https://datachemist.net/ipg/candidate/osoba_ipg11704456");
	this.show_filter = false;
	//this.relationships = model.mgraphs['main'].elements.relationships;
	//this.entities = model.mgraphs['main'].elements.entities;
		
	//this.setUpIPGSpecials();
	
	this.entity_count = false;

	this.config.default_display = {
		icon: "fas fa-question",
		icon_unicode: "\uf128",
		color: [255,125,125],
		forward: "Unknown",
		backward: "Unknown",
		text: "Unknown"
	};
}


DCOGBrowser.prototype.init = function(){
	this.filter = new DCOGQueryFilter(this, this.config, this.model);
	this.slider = new DCOGTimePicker(this, this.config);
	//this.viewports['graph'] = new DCOGGVis(this, this.config);
	//this.viewports['table'] = new DCOGTable(this, this.config);
	//this.viewports['map'] = new DCOGMap(this, this.config);
	//this.viewports['api'] = new DCOGAPIView(this, this.config);
	//this.viewports['timeline'] = new DCOGTimeline(this, this.config);
};

DCOGBrowser.prototype.getViewportAsDOM = function(){
	var vpdom = document.createElement("div");
	vpdom.setAttribute("class", "dcog-viewport");
	for(var k in this.viewports){
		if(typeof this.viewportDOMs[k] == "undefined"){
			this.viewportDOMs[k] = this.viewports[k].getAsDOM();
		}
		vpdom.appendChild(this.viewportDOMs[k]);
	}
	return vpdom;
}

DCOGBrowser.prototype.newQuery = function(query, success, error){
	query = (query ? query : this.getQuery());
	var self = this;
	var busy = this.setBusy("Fetching Results from Data Chemist Server");
	var handle = function(data){
		self.clearBusy(busy);
		self.current_result = new DCOGQueryResult(data, query);
		if(self.current_result.containsData()){
			self.setViewportData(self.current_result);
			if(self.focus_node){
				var node = self.current_result.getNodeOrFringe(query.focus_node);
			}
			else if(query.from_node){
				var node = self.current_result.getNodeOrFringe(query.from_node);
			}
			else {
				self.entity_count = data.nodeCount;
				self.myowner.fillInfoBoxes();
			}
			if(node){
				self.nodeSelected(node);
			}
			self.rebuildController();			
		}
		else {
			self.tellUser("No results returned", "warning");
		}
		if(typeof success == "function") {
			success(self.current_result);
		}
	};
	var ehandle = function(a){
		var msg = {title: "Results Overload", body: "Your query was terminated because it would have returned too many records - please reduce the depth of your search or add extra constraints and try again"};
		self.tellUser(msg, "error");
		self.clearBusy(busy);
	}
	this.untell();
	this.model.client.query(query, handle, ehandle);
}

DCOGBrowser.prototype.moreResults = function(nfocus, success){
	var busy = this.setBusy("Fetching Results from Data Chemist Server");
	var ehandle = function(a){
		var msg = {title: "Results Overload", body: "Your query was terminated because it would have returned too many records - please reduce the depth of your search or add extra constraints and try again"};
		self.tellUser(msg, "error");
		self.clearBusy(busy);
	}
	this.focus_node = nfocus;
	var self = this;
	var handle = function(data){
		self.clearBusy(busy);
		self.current_result.addMoreResults(data, self.getQuery());
		self.updateViewportData(self.current_result);
		self.rebuildController();
		if(typeof success == "function"){
			success(self.current_result);
		}
	};
	this.untell();
	this.model.client.query(this.getQuery(), handle, ehandle);
}

DCOGBrowser.prototype.setBusy = function(msg){
	var busy = showBusyOverlay(this.myowner.insert_patterns.browser, msg);
	this.busy = busy;
	return busy;
}

DCOGBrowser.prototype.getQuery = function(dqr){
	var qstruct = {};
	if(this.focus_node){
		qstruct.focus_node = this.focus_node;
	}
	else if(this.from_node && this.to_node){
		qstruct.source_node = this.from_node;
		qstruct.target_node = this.to_node;
	}
	if(this.filter && this.filter.current_relationships){
		qstruct.relationships = this.filter.current_relationships;
	}
	if(this.filter && this.filter.current_depth){
		qstruct.max_path_length = this.filter.current_depth;
	}
	if(this.filter && this.filter.current_threshold && this.filter.current_threshold > 0 && qstruct.relationships.indexOf("share") != -1){
		qstruct.filters = {shareholding_threshold: this.filter.current_threshold};
	}
	if(this.slider && this.slider.server_side && this.slider.timeslice){
		this.query_timeslice = this.slider.timeslice;
	}
	else {
		this.query_timeslice = false;
	}
	if(this.query_timeslice){
		qstruct.date = this.query_timeslice;
	}
	return qstruct;
}

DCOGBrowser.prototype.setView = function(which){
	if(which != this.current_viewport){
		this.current_viewport = which;
		for(var k in this.viewports){
			if(k != this.current_viewport) {
				if(typeof this.viewports[k]["hibernate"] == "function"){
					//this.viewports[k].hiberate();
				}
				jQuery(this.viewportDOMs[k]).hide();
			}
			else {
				if(typeof this.viewports[k]["wake"] == "function"){
					this.viewports[k].wake();
				}
				jQuery(this.viewportDOMs[k]).show();
			}
			this.rebuildController();
		}
	}
}


/**
 * @summary Initialises the viewports by firing off a starter query and loading it into the contained viewports
 */
DCOGBrowser.prototype.initData = function(which){
	this.current_viewport = (which ? which : this.default_viewport);
	var self = this;
	var setInitNodes = function(dqr){
		if(self.focus_node){
			var node = dqr.getNodeOrFringe(self.focus_node);
			if(node && node.groupID){
				self.nodeSelected(node);
			}
		}
		else {
			
		}
		for(var k in self.viewports){
			if(typeof self.viewports[k].initDOM == "function"){
				self.viewports[k].initDOM(self.viewportDOMs[k]);
			}
			if(k != self.current_viewport) jQuery(self.viewportDOMs[k]).hide();
			else if(typeof self.viewportDOMs[k].wake == "function") self.viewportDOMs[k].wake()
		}
	}
	var qstr = this.getQuery();
	if(qstr){
		this.newQuery(qstr, setInitNodes);
	}
	else {
		alert("No query string - must set filter and focus node before initialisation");
	}
}

DCOGBrowser.prototype.setViewportData = function(dqr){
	for(var k in this.viewports){
		this.viewports[k].setData(dqr, k == this.current_viewport);
	}
}

DCOGBrowser.prototype.updateViewportData = function(dqr){
	for(var k in this.viewports){
		this.viewports[k].updateData(dqr, k == this.current_viewport);
	}
}
DCOGBrowser.prototype.setViewportFilter = function(dqr){
	for(var k in this.viewports){
		if(typeof this.viewports[k].setFilter == "function"){
			this.viewports[k].setFilter(dqr, k == this.current_viewport);
		}
		else {
			alert(k + " does not implement set filter browser function");
		}
	}
}

DCOGBrowser.prototype.nodeSelected = function(node){
	if(this.focus_node != node.id){
		this.focus_node = node.id;
	}
	var sections = this.getNodeInfoSections(node);
	this.myowner.nodeSelected(node, sections);
}

DCOGBrowser.prototype.getNodeInfoSections = function(node){
	return [];
}

DCOGBrowser.prototype.followNode = function(node, success){
	this.moreResults(node.id, success);
}

DCOGBrowser.prototype.setFocusNode = function(id){
	var self = this;
	this.focus_node = id;
	this.newQuery(this.getQuery());
}

DCOGBrowser.prototype.setPathSearch = function(node_from, node_to){
	this.focus_node = false;
	this.from_node = node_from;
	this.to_node = node_to;
	this.newQuery(this.getQuery());
}

DCOGBrowser.prototype.changeTimeSlice = function(val, valto, force){
	if(this.current_result){
		if(!this.current_result.isTemporalSuperset(this.query_timeslice, val, valto)){
			this.current_result.setQueryTimeslice(val, valto);
			this.query_timeslice = this.current_result.getTimeslice()
			this.newQuery(this.getQuery());
		}
		else {
			this.current_result.setFilterTimeslice(val, valto);
			this.setViewportFilter(this.current_result);
		}
	}
}

DCOGBrowser.prototype.getControllerAsDOM = function(){
	var cdom = document.createElement("div");
	cdom.setAttribute("class", "dcog-browser-controller-wrapper");
	cdom.appendChild(this.getControllerViewButtonsAsDOM());
	cdom.appendChild(this.slider.getSliderDOM());
	this.toolboxDOM = this.getUserToolboxDOM();
	cdom.appendChild(this.toolboxDOM);
	this.rebuildController();
	cdom.appendChild(this.filterDOM);
	cdom.appendChild(this.legendDOM);
	return cdom;
}

DCOGBrowser.prototype.getControllerFilterAsDOM = function(){
	if(this.filterDOM) {
		jQuery(this.filterDOM).empty();
	}
	else {
		var cdom = document.createElement("div");
		cdom.setAttribute("class", "dcog-browser-controller-filter");
		this.filterDOM = cdom;
	}
	var fdom = this.filter.getRelationshipFilterAsDOM();
	var ndom = this.filter.getQueryParameterDOM();
	var ipfield = this.slider.getSliderTypeDOM();
	ndom.appendChild(ipfield);
	var self = this;
	var gobut = document.createElement("button");
	gobut.setAttribute("class", "dcog-filter-submit dcog-dashboard-button");
	gobut.appendChild(document.createTextNode("Go"));
	gobut.addEventListener("click", function(){
		self.newQuery();
	});
	
	this.filterDOM.appendChild(fdom);
	this.filterDOM.appendChild(ndom);
	ndom.appendChild(gobut);
	
	if(!this.show_filter){
		jQuery(this.filterDOM).hide();
	}
	return this.filterDOM;
}

DCOGBrowser.prototype.toggleFilterVisibility = function(){
	if(this.show_filter){
		jQuery(this.filterDOM).hide();
	}
	else {
		jQuery(this.filterDOM).show();
	}
	this.show_filter = !this.show_filter;
}


DCOGBrowser.prototype.rebuildController = function(){
	this.getControllerFilterAsDOM();
	this.legendDOM = this.getLegendAsDOM();
}

DCOGBrowser.prototype.untell = function(){
	jQuery(this.userMessageDOM).empty(); 
}


DCOGBrowser.prototype.tellUser = function(msg, type){
	if(typeof msg == "undefined") {
		jQuery(this.userMessageDOM).empty(); 
	}
	else {
		type = (type ? type : "info");
		var msgdom = document.createElement("span");
		msgdom.setAttribute("class", "dcog-browser-message dcog-message-" + type);
		if(typeof msg == "object"){
			msg = "<b>" + msg.title + "</b> " + msg.body;
		}
		msgdom.innerHTML = msg;
		jQuery(this.userMessageDOM).html(msgdom);
	}
}

DCOGBrowser.prototype.clearBusy = function(busy){
	busy = (busy ? busy : this.busy);
	if(busy){	
		jQuery(busy).remove();
	}
}

DCOGBrowser.prototype.getUserToolboxDOM = function(){
	var cdom = document.createElement("div");
	cdom.setAttribute("class", "dcog-browser-toolbox");
	var msgdom = document.createElement("span");
	msgdom.setAttribute("class", "dcog-browser-message-container");
	this.userMessageDOM = msgdom;
	cdom.appendChild(msgdom);
	var tdom = document.createElement("span");
	tdom.setAttribute("class", "dcog-browser-tools");
	//var dld = document.createElement("i");
	//dld.setAttribute("class", "fas fa-download dcog-browser-tool-icon");
	var self = this;
	/*dld.addEventListener("click", function(){
		if(typeof told == "undefined" || !told){
			self.tellUser("this is the user dialogue box - it will tell the user how to download the data");
			told = true;
		}
		else {
			told = false;
			self.tellUser();
		}
	});*/
	//tdom.appendChild(dld);
	var dlc = document.createElement("i");
	dlc.setAttribute("class", "fas fa-cog dcog-browser-tool-icon");
	dlc.addEventListener("click", function(){
		self.toggleFilterVisibility();
	});
	tdom.appendChild(dlc);
	cdom.appendChild(tdom);
	return cdom;
}

DCOGBrowser.prototype.getControllerViewButtonsAsDOM = function(){
	var self = this;
	var bdoms = [];
	var cdom = document.createElement("div");
	cdom.setAttribute("class", "dcog-browser-view-buttons");
	for(var k in this.viewports){
		var bdom = document.createElement("button");
		bdom.appendChild(document.createTextNode(k));
		var i = document.createElement("i");
		if(k == "graph"){
			i.setAttribute("class", "dcog-viewer-icon fas fa-code-branch")
		}
		else if(k == "map"){
			i.setAttribute("class", "dcog-viewer-icon fas fa-globe")			
		}
		else if(k == "table"){
			i.setAttribute("class", "dcog-viewer-icon fas fa-list")			
		}
		else if(k == "api"){
			i.setAttribute("class", "dcog-viewer-icon fas fa-robot")			
		}
		bdom.appendChild(i);
		bdom.setAttribute("id", this.browserid + k);
		if(k == this.current_viewport){
			bdom.setAttribute("class", "selected");
		}
		else {
			bdom.setAttribute("class", "not-selected");
		}
		bdom.addEventListener("click", function(){
			for(var i=0; i<bdoms.length; i++){
				bdoms[i].setAttribute("class", "not-selected");
			}
			this.setAttribute("class", "selected");
			self.setView(this.id.substring(self.browserid.length));
		});
		bdoms.push(bdom);
		cdom.appendChild(bdom);
	}
	return cdom;	
}

DCOGBrowser.prototype.getLegendAsDOM = function(){
	if(this.legendDOM) {
		jQuery(this.legendDOM).empty();
	}
	else {
		this.legendDOM = document.createElement("div");
		this.legendDOM.setAttribute("class", "dcog-viewport-legend");
	}
	if(typeof this.viewports[this.current_viewport].legend == "function"){
		var dom = this.viewports[this.current_viewport].legend();
		if(dom){
			this.legendDOM.appendChild(dom);
			jQuery(this.legendDOM).show();
		}
		else {
			jQuery(this.legendDOM).hide();
		}
	}
	return this.legendDOM;
}

/*
 * Display settings for shared look and field between different views - eventually to be kicked back to model 
 */

DCOGBrowser.prototype.getNodeRelativeSize = function(node){
	var nconf = this.getNodeDisplaySettings(node);
	if(nconf.size) return nconf.size;
	return 1;
}

DCOGBrowser.prototype.getLineWidth = function(node){
	var nconf = this.getNodeDisplaySettings(node);
	if(nconf.size) return nconf.size;
	return 4;
}

DCOGBrowser.prototype.getModelElementDisplaySettings = function(elt){
	if(typeof this.config.modeldisplay[elt] != "undefined"){
		return jQuery.extend(true, {}, this.config.modeldisplay[elt]);
	}
	alert(elt);
	return jQuery.extend(true, {}, this.config.default_display);
}

DCOGBrowser.prototype.isBidirectional = function(edge){
	if(edge.typeID){
		var conf = this.config.modeldisplay[edge.typeID];
		if(!conf){
			//jpr(edge);
		}
		else if(conf.forward && conf.backward){
			var s = this.current_result.getNodeOrFringe(edge.source);
			var t = this.current_result.getNodeOrFringe(edge.target);
			if((t && s && t.groupID && s.groupID) && (s.groupID.indexOf("Person") == -1 && t.groupID.indexOf("Person") == -1) )
				return true;		
		}
	}
	return false;
}


DCOGBrowser.prototype.getRelationshipClass = function(nick){
	return nick;
	//if(this.config.cmap[nick]) return this.config.cmap[nick];
	//return false;
}

DCOGBrowser.prototype.getGraphElementDisplaySettings = function(node){
	if(node){
		var nds = this.getNodeDisplaySettings(node);
		if(!nds){
			nds = this.getLinkDisplaySettings(node);
		}
		return nds;
	}
	return false;
}

DCOGBrowser.prototype.getNodeDisplaySettings = function(node){
	if(typeof node.groupID != "undefined"){
		return this.getModelElementDisplaySettings(node.groupID);
	}
	return false;
}

DCOGBrowser.prototype.getLinkDisplaySettings = function(link){
	if(typeof link.typeID != "undefined"){
		return this.getModelElementDisplaySettings(link.typeID);
	}
	return false;
}

DCOGBrowser.prototype.getElementIcon = function(elt){
	var settings = this.getGraphElementDisplaySettings(elt);
	if(!settings) settings = this.config.default_display;
	return settings.icon;
}

DCOGBrowser.prototype.getClassIcon = function(cls){
	var settings = this.getModelElementDisplaySettings(cls);
	if(!settings) settings = this.config.default_display;
	return settings.icon;
}

DCOGBrowser.prototype.getElementIconUnicode = function(elt){
	var settings = this.getGraphElementDisplaySettings(elt);
	if(!settings) settings = this.config.default_display;
	return settings.icon_unicode;
}

DCOGBrowser.prototype.getElementColour = function(elt){
	var settings = this.getGraphElementDisplaySettings(elt);
	if(!settings) settings = this.config.default_display;
	return jQuery.extend(true, [], settings.color);
}


DCOGBrowser.prototype.setUpIPGSpecials = function(){
	this.config.modeldisplay = {};
	var reldisptypes = [
		{
			icon: "fas fa-caret-right",
			icon_unicode: "\uf0d6",
			size: 6,
			color: [125,125,255],
		},
		{
			icon: "fab fa-creative-commons-by",
			icon_unicode: "\uf4e7",
			size: 5,
			color: [255,125,125],
		},
		{
			icon: "fas fa-handshake",
			color: [125,255,125],
			size: 7,
			icon_unicode: "\uf2b5",
		},
		{
			icon: "fas fa-creative-commons-nc-eu",
			icon_unicode: "\uf4e9",
			size: 4,
			color: [50,50,50],
		},
		{
			icon: "fas fa-sitemap",
			icon_unicode: "\uf0e8",
			size: 8,
			color: [125,255,255],
		}
	];
	var entdisptypes = [ 
		 {
		    	icon: "fas fa-users",
				size: 1,
				icon_unicode: "\uf0c0",
				color: [255,125,125],
			},
		{
			icon: "fas fa-industry",
			size: 1.5,
			icon_unicode: "\uf275",
			color: [100,125,255],
	    },
		{
			icon: "fas fa-user",
			size: 0.9,
			icon_unicode: "\uf007",
			color: [125,255,125],
		},
	   {
			icon: "fas fa-building",
			icon_unicode: "\uf1ad",
			size: 1.4,
			color: [125,125,225],
		},
		{
			icon: "fas fa-briefcase",
			icon_unicode: "\uf0b1",
			color: [125,125,200],
			size: 1.2,
		},
		{
			icon: "fas fa-user-astronaut",
			icon_unicode: "\uf4fb",
			size: 0.9,
			color: [125,220,125],
		}
	];
	
	var i = 0;
	for(var rid in this.relationships){
		if(i >= reldisptypes.length) i = 0;
		var disptype = reldisptypes[i];
		disptype['forward'] = this.relationships[rid].label;
		this.config.modeldisplay[rid] = disptype;
		i++;
	}
	i = 0;
	for(var eid in this.entities){
		if(i >= reldisptypes.length) i = 0;
		var disptype = entdisptypes[i];
		disptype['text'] = this.entities[eid].label;
		this.config.modeldisplay[eid] = disptype;
		i++;
	}
}

