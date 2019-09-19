function WOQLGraphViewer(browser, config) {
	/*************** Setting up the variables  ************/
	var self = this;
	var visible_nodes = [];
	
	this.browser = browser;
	this.config = config;
	
	//Set the width and height variables to be the height and width of the browser
	this.width = (config && config.width ? config.width: false);
	this.height = (config && config.height ? config.height: false);
	
	// Instantiate svg and color element 
	this.svg;
	
	this.visid = randomString(8);
	// Need a radius variable for the bounding box, can set with default for time being
	// simulation vars
	this.radius = 14;
	this.linkDistance = 70;
	this.charge = -60; // repulsive
	this.collisionRadius = 20;
	this.stroke = 6;
	this.arrow = {width: 36, height: 16};
	
	// Dates
	//this.minDate = 0 // Jan 1st, 1970
	//this.maxDate = 1525261230 // nowish
	this.currentDate = Date.now() / 1000; // nowish
	
	this.log_nodes = false;
	// Append an svg object to the body with dims from above ^^

	/********* Setup/Instantiate Graph _elements+Simulation **********/
	// Need to explicitly know font family name for unicde glyphs
	this.fafontfam = 'Font Awesome\ 5 Free'; 
	// Individual links, nodes and text graphical elements
	this.link_elements;
	this.node_elements;
	// Var for selecting and deselecting elem when clicked twice
	this.selected_id;
	// switch for on / off selecting and deselecting of nodes
	this.selected_grows = true;
	// DOM object that this this is directly drawn into
	this.container = false;
	
	// Map of ids to loaded nodes for ease
	this.loadedNodes = {};
	this.focusNodes = [];
	// Currently displayed nodes and links
	this.nodes;
	this.links;
	
	//configuration options for different types of behaviour
	this.show_force = true;
	this.fix_nodes = false;
	this.explode_out = false;
}

/*
 * Dimensions / forces / etc all settable with a scale factor - for zooming
 */
WOQLGraphViewer.prototype.getMultiplier = function(node) {
	var mult = this.browser.getNodeRelativeSize(node);
	if(node.id == this.selected_id && this.selection_grows){
		mult = mult * 2;
	}
	return mult;
}

WOQLGraphViewer.prototype.getRadius = function(node) {
	var r = (this.scale_factor ? Math.min(this.scale_factor * this.radius, this.radius) : this.radius);
	r = r * this.getMultiplier(node);
	return r;
}

WOQLGraphViewer.prototype.getCollisionRadius = function(node) {
	var v = (this.scale_factor ? Math.min(this.scale_factor * this.collisionRadius, this.collisionRadius) : this.collisionRadius);
	return v * this.getMultiplier(node);
}

WOQLGraphViewer.prototype.getCharge = function(node) {
	if(this.charge < 0){
		var v = (this.scale_factor ? Math.max(this.scale_factor * this.charge, this.charge) : this.charge);
	}
	else {
		var v = (this.scale_factor ? Math.min(this.scale_factor * this.charge, this.charge) : this.charge);
	}
	return v * this.getMultiplier(node);
}

WOQLGraphViewer.prototype.getLinkDistance = function(l) {
	var x = (this.scale_factor ? Math.min(this.scale_factor * this.linkDistance, this.linkDistance) : this.linkDistance);
	if(!l.type) x = 0.1;
	return x;
}

WOQLGraphViewer.prototype.getNodeIconSize = function(node) {
	return (this.getMultiplier(node) + "em");
}	

WOQLGraphViewer.prototype.getNodeColour = function(node) {
	var col = this.browser.getElementColour(node);
	if(this.isFringe(node)){
		return "rgba("+col.join(",")+",0.25)";
	}
	else {
		return "rgb("+col.join(",")+")";
	}
}

WOQLGraphViewer.prototype.getNodeIcon = function(node) {
	return this.browser.getElementIcon(node);
}

WOQLGraphViewer.prototype.getNodeIconUnicode= function(node) {
	return this.browser.getElementIconUnicode(node);
}

WOQLGraphViewer.prototype.getNodeIconColour = function(node) {
	var col = this.browser.getElementColour(node);
	col = col.map(function(el){ return el-45});
	if(this.isFringe(node)){
		return "rgba("+col.join(",")+",0.25)";
	}
	else {
		return "rgb("+col.join(",")+")";
	}
}

WOQLGraphViewer.prototype.getEdgeColour = function(edge) {
	var col = [];
	col = col.concat(this.browser.getElementColour(edge));
	col.push(0.6);
	return "rgba("+col.join(",")+")";
}

WOQLGraphViewer.prototype.getEdgeDirection = function(edge) {
	if(edge && this.browser.isBidirectional(edge)){
		return "M10,-5 L0,0 L10,5";
	}
	//return "M0,-5 L10,0 L0,5";
	return false;
}

WOQLGraphViewer.prototype.getLineWidth = function(link) {
	return this.browser.getLineWidth(link);
}

WOQLGraphViewer.prototype.getArrowWidth = function() {
	return (this.scale_factor ? Math.min(this.scale_factor * this.arrow.width, this.arrow.width) : this.arrow.width);
}

WOQLGraphViewer.prototype.getArrowHeight = function() {
	return (this.scale_factor ? Math.min(this.scale_factor * this.arrow.height, this.arrow.height) : this.arrow.height);
}

WOQLGraphViewer.prototype.getNodeText = function(node) {
	if(node.name == "unknown") return node.id; 
	return node.name;
}

WOQLGraphViewer.prototype.getLinkText = function(d) {
	return d.type;
}

/*
 * Called to initialise the DOM when it is first loaded (called after setData)
 */
WOQLGraphViewer.prototype.initDOM = function(vdom) {
	if(!this.width) this.width = this.setWidth();
	if(!this.height) this.height = this.setHeight();
	this.d3DOM = vdom;
	if(this.result){
		this.load(true);
	}
}

/*
 * Called to issue a new set of datapoints 
 */
WOQLGraphViewer.prototype.setData = function(dqr, show){
	this.setFocusNodeFromResult(dqr);
	if(this.result){
		this.clear();
	}
	this.result = dqr;
	if(this.svg){
		this.load(show);
	}
}

/*
 * Called to indicate that the current set of datapoints has been updated
 */
WOQLGraphViewer.prototype.updateData = function(dqr, show) {
	this.setFocusNodeFromResult(dqr);
	this.result = dqr;
	this.reload(show, "update", this.fix_nodes);
}

/*
 * Called to indicate that the filter setting has been changed on the current datapoints 
 */
WOQLGraphViewer.prototype.setFilter = function(dqr, show){
	this.simulation.stop();
	this.reload(show, "filter", true);
}


WOQLGraphViewer.prototype.setFocusNodeFromResult = function(dqr) {
	var fn = dqr.getFocusNode();
	if(fn){
		this.selected_id = fn;
		this.focusNodes.push(fn);
	}
}

WOQLGraphViewer.prototype.wake = function() {
	if(this.simulation)	this.updateSimulation("wake");
}

WOQLGraphViewer.prototype.hibernate = function() {
	this.simulation.stop();
}

WOQLGraphViewer.prototype.load = function(show) {
	this.initD3(this.d3DOM);
	this.loadNewData();
	this.updateGraph();
	if(show){
		this.updateSimulation("init");
	}
}

WOQLGraphViewer.prototype.loadNewData = function(){
	this.nodes = jQuery.extend(true, [], this.result.getNodesAndFringes());
	for(var i = 0 ; i<this.nodes.length; i++){
		this.loadedNodes[this.nodes[i].id] = this.nodes[i];
	}
	this.links = this.result.getLinks();
	this.browser.rebuildController();
}

/*
 * Called when more data is added to the result but the query remains the same
 */
WOQLGraphViewer.prototype.reload = function(show, mode, no_animate) {
	for(var i = 0 ; i<this.nodes.length; i++){
		this.loadedNodes[this.nodes[i].id] = this.nodes[i];
	}	
	var nnodes = jQuery.extend(true, [], this.result.getNodesAndFringes());
	this.nodes = [];
	var snode = this.loadedNodes[this.selected_id];
	for(var i = 0 ; i<nnodes.length; i++){
		var nnode = nnodes[i];
		if(this.loadedNodes[nnode.id]){
			if(nnode.id == this.selected_id){
				this.loadedNodes[nnode.id].fx = this.loadedNodes[nnode.id].x;
				this.loadedNodes[nnode.id].fy = this.loadedNodes[nnode.id].y;
			}
			else if(!no_animate) {
				this.loadedNodes[nnode.id].fx = null;
				this.loadedNodes[nnode.id].fy = null;
			}
			else if(this.loadedNodes[nnode.id].x){
				this.loadedNodes[nnode.id].fx = this.loadedNodes[nnode.id].x;
				this.loadedNodes[nnode.id].fy = this.loadedNodes[nnode.id].y;
			}
		}
		else {
			if(this.explode_out && snode.x){
				nnode.x = snode.x;
				nnode.y = snode.y;
			}
			this.loadedNodes[nnode.id] = nnode;
		}
		this.nodes.push(this.loadedNodes[nnode.id]);
	}
	this.links = this.result.getLinks();
	this.updateGraph();
	if(show){
		//this.browser.rebuildController();
		this.updateSimulation(mode);
	}
}

WOQLGraphViewer.prototype.clear = function() {
	this.nodes = [];
	this.loadedNodes = {};
	this.links = [];
	this.updateGraph();
	jQuery(this.d3DOM).empty();	
	this.scale_factor = 1;
}

/*
 * Calculates the width of the container area available for the SVG
 */
WOQLGraphViewer.prototype.setWidth = function() {
	if(this.container && this.container.clientWidth){
		this.width = this.container.clientWidth;
	}
	else if(this.container.parentNode && this.container.parentNode.clientWidth){
		this.width = this.container.parentNode.clientWidth;
	}
	else {
		var w = jQuery(this.container).width();
		if(w == 0){
			w = jQuery(this.container.parentNode).width();
		}
		if(w == 0) {
			w = 800;
		}
		this.width = w;
	}
	return this.width;
}

WOQLGraphViewer.prototype.setHeight = function() {
	if(this.container && this.container.clientHeight){
		this.height = this.container.clientHeight;
	}
	else if(this.container.parentNode && this.container.parentNode.clientHeight){
		this.height = this.container.parentNode.clientHeight;
	}
	else {
		var w = jQuery(this.container).height();
		if(w == 0){
			w = jQuery(this.container.parentNode).height();
		}
		if(w == 0) {
			w = 400;
		}
		this.height = w;
	}
	return this.height;
}


WOQLGraphViewer.prototype.initD3 = function(jqid) {
	var self = this;

	/********************* Seed the data **************************/
	this.svg = d3.select(jqid).append("svg")
		.attr("width", this.width)
		.attr("height", this.height);

	var distanceFun = function(link){
		return self.getLinkDistance(link); 
	}
	
	// create the force object 
	this.simulation  = d3.forceSimulation()
		//link distance varies with link type
	    .force("link", d3.forceLink().distance(distanceFun).id(function(link) { return link.id; }))
	    //charge is the same for all nodes
	    .force('charge', d3.forceManyBody().strength(function(node){ return self.getCharge(node)}))
	    //collision radius changes with node type
	    .force('collision', d3.forceCollide().radius(function(node) {
	    	return (self.getCollisionRadius(node));
	    }))
		.force("center", d3.forceCenter(this.width / 2, this.height / 2));
	
	// node drag 
	this.drag_drop = d3.drag()
		.on('start', function(node) {
			node.fx = node.x
			node.fy = node.y
		})
		.on('drag', function(node) {
			self.simulation.restart()
			node.fx = d3.event.x;
			node.fy = d3.event.y;
		})
		.on('end', function(node) {
			node.fx = null;
			node.fx = null;
			self.simulation.stop()
		});
	
	this.svg.append("rect")
	   .attr("width", this.width)
	   .attr("height", this.height)
	   .style("fill", "none")
	   .style("pointer-events", "all")
	   .call(d3.zoom().on("zoom", function(){self.zoomed()}));
	
	// Append graphic element to svg which are groups for graph elements
	this.link_group = this.svg.append("g").classed("links", true);
	this.node_group = this.svg.append("g").classed("nodes", true);
}

WOQLGraphViewer.prototype.zoomed = function() {
	this.current_transform = d3.event.transform;
	if(this.node_elements)
		this.node_elements.attr("transform", d3.event.transform);
    if(this.link_elements)
    	this.link_elements.attr("transform", d3.event.transform);    
}

/***
 * updates the svg with the current nodes and links
 */
WOQLGraphViewer.prototype.updateGraph = function(nodes, links) {
	var self = this;
	   
	var follow_node_wrapper = function(graph_node){
		self.nodeSelected(graph_node);
	}
	var zoomed = function(){
		self.zoomed();
	} 
	
	nodes = (typeof nodes != "undefined" ? nodes : this.nodes);
	links = (typeof links != "undefined" ? links : this.links);
		
	// update NODELEMENTs ************************************		  
	this.node_elements  = this.node_group.selectAll("g")
		.data(nodes);

	this.node_elements.exit().remove();
	
	   /*Create and place the "blocks" containing the circle and the text */  
    var node_enter = this.node_elements.enter()
        .append("g");

	// enter and create new ones
	node_enter.append("circle")
		.style('opacity', 0.99)
		.attr('r', function(node){return self.getRadius(node)})
		.attr("cx",  function(node){ return node.x})
		.attr("cy",  function(node){ return node.y})
		.attr("type", function(node) {return self.isFringe(node) ? "fringe" : "node"})
		.call(self.drag_drop)
		.on("mouseover", function(d){ d3.select(this).style("cursor", "pointer"); })
		.on("mouseout", function(d){ d3.select(this).style("cursor", "default"); })
		.on('click', follow_node_wrapper);
	
    node_enter.append("text")
		.attr("x",  function(node){ return node.x})
		.attr("y",  function(node){ return node.y})
		.text(function(node) { return self.getNodeIconUnicode(node)})
		.call(self.drag_drop)
		.on("mouseover", function(d){ d3.select(this).style("cursor", "pointer"); })
		.on("mouseout", function(d){ d3.select(this).style("cursor", "default"); })
		.on('click', follow_node_wrapper);

	// merge new and old nodes	
	this.node_elements = node_enter.merge(this.node_elements);
	
	this.styleNodeElements();

	// update LINKS ********************************************
	this.link_elements  = this.link_group.selectAll("line")
		.data(links);

	// remove old links
	this.link_elements.exit().remove();
	// enter and create new ones
	var link_enter = this.link_elements
		.enter().append("line");

	// merge new and old links 
	this.link_elements = link_enter.merge(this.link_elements)
	
	this.styleLinkElements();
	
	//execute the current state of the pan-zoom transform
	if(this.current_transform){
		if(this.node_elements)
			this.node_elements.attr("transform", this.current_transform);
	    if(this.link_elements)
	    	this.link_elements.attr("transform", this.current_transform);
	}
}

WOQLGraphViewer.prototype.updateSimulation = function(mode) {
	var self = this;
	//move all of the graphical elements corresponding to the nodes with each tick
	var ticker = function(){
		self.node_elements.selectAll("circle")
			.attr("cx",  function(node){ return node.x})
			.attr("cy",  function(node){ return node.y});
		self.node_elements.selectAll("text")
			.attr("x",  function(node){ return node.x})
			.attr("y",  function(node){ return node.y});
		self.link_elements
			.attr('x1', function(link){ return link.source.x})
			.attr('y1', function(link){ return link.source.y})
			.attr('x2', function(link){ return link.target.x})
			.attr('y2', function(link){ return link.target.y});
	}
	if(this.show_force){
		this.simulation.nodes(this.nodes).on('tick', ticker).force('link').links(this.links);
	}
	else {
		this.simulation.nodes(this.nodes).on('end', ticker).force('link').links(this.links);		
	}
	if(this.nodes.length){
		if(mode == "wake" || mode == "init"){
			this.simulation.restart();
		}
		else if(mode == "filter"){
			this.simulation.restart();					
		}
		else {
			this.simulation.alpha(1).restart();
		}
	}
}

WOQLGraphViewer.prototype.styleNodeElements = function() {
	var self = this;
	if(this.node_elements){
		this.node_elements.each(function(node){
			var g = d3.select(this);
			var sel = g.select("circle");
			sel.select("title").remove();
			sel.style("fill", self.getNodeColour(node));
			sel.attr('r', self.getRadius(node));	
			sel.classed("highlighted", function(node) { return self.focusNodes.indexOf(node.id) != -1});	
			sel.append("title")
				.classed("terminus-gnode-title", true)
				.text(self.getNodeText(node));
			var txt = g.select("text");
			txt.select("title").remove();
			txt.attr('text-anchor', 'middle')
				.attr("title", self.getNodeText(node))
				.attr('dominant-baseline', 'central')
				.style('font-family', "'" + self.fafontfam + "'")
				.style('font-weight', 900)
				.style('font-size', self.getNodeIconSize(node))
				.style("fill", self.getNodeIconColour(node))
				.text(self.getNodeIconUnicode(node))
				.append("title")
					.classed("terminus-gnode-title", true)
					.text(self.getNodeText(node));
		});
	}	
}

WOQLGraphViewer.prototype.styleLinkElements = function() {
	var self = this;
	if(this.link_elements){
		this.link_elements.each(function(link){
			var sel = d3.select(this);
			sel.select("title").remove();
			sel.attr("stroke-width", self.getLineWidth(link));
			sel.attr("marker-end", self.getEdgeArrow(link));
			sel.style("stroke", self.getEdgeColour(link));
			sel.append("title")
				.classed("terminus-glink-title", true)
				.text(self.getLinkText(link));
		});
	}
}

WOQLGraphViewer.prototype.getEdgeArrow = function(edge) {
	if(edge){
		var dir = this.getEdgeDirection(edge);
		if(dir){
			var col = this.getEdgeColour(edge);
			var reference;
			this.svg.append("svg:defs").selectAll("marker")
				.data([reference])
				.enter().append("svg:marker")
				.attr("id", String)
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 22)  // This sets how far back it sits, kinda
				.attr("refY", 0)
				.attr("markerWidth", this.getArrowWidth())
				.attr("markerHeight", this.getArrowHeight())
				.attr("orient", "auto")
				.attr("markerUnits", "userSpaceOnUse")
				.append("svg:path")
					.attr("d", dir)
					.style("fill", col);
				return "url(#" + reference + ")";
		}
	}
	return "";
}


WOQLGraphViewer.prototype.nodeSelected = function(selected_node) {
	var self = this;
	if(this.selected_id == selected_node.id && this.selection_grows){
		this.selection_grows = false;
		this.styleNodeElements();
	}
	else {
		this.selection_grows = true;
		this.selected_id = selected_node.id;
		this.styleNodeElements();
		this.browser.nodeSelected(selected_node);
		if(this.isFringe(selected_node)){
			this.browser.followNode(selected_node);
		}
	}
}

WOQLGraphViewer.prototype.getScaleTransform = function(x, y, scale_factor){
	return "scale("+ scale_factor + ") translate(" + x + "," + y + ")";
} 

WOQLGraphViewer.prototype.scale = function(min_ratio) {
    // the new dimensions of the molecule
    new_mol_width = this.width * min_ratio;
    new_mol_height = this.height * min_ratio;
    
    
    var y_trans = (this.height - new_mol_height) ; 
    
    var x_trans = (this.width - new_mol_width); 
    // do the actual moving
    var self = this;
    if(this.node_elements)
    	this.node_elements.transition()
        .duration(750).attr("transform", function(node){ return self.getScaleTransform(x_trans, y_trans, min_ratio)});
    if(this.link_elements)
        this.link_elements.transition()
        .duration(750).attr("transform", function(node){ return self.getScaleTransform(x_trans, y_trans, min_ratio)});
	this.scale_factor = min_ratio;
	this.svg.selectAll("marker").attr("markerWidth", this.getArrowWidth())
			.attr("markerHeight", this.getArrowHeight());
}


WOQLGraphViewer.prototype.scaleToFit = function() {
    // Center the view on the molecule(s) and scale it so that everything
    // fits in the window
    //no molecules, nothing to do
    if (this.nodes.length === 0)
        return;

    // Get the bounding box
    min_x = d3.min(this.nodes.map(function(d) {return d.x;}));
    min_y = d3.min(this.nodes.map(function(d) {return d.y;}));
    max_x = d3.max(this.nodes.map(function(d) {return d.x;}));
    max_y = d3.max(this.nodes.map(function(d) {return d.y;}));


    // The width and the height of the graph
    mol_width = max_x - min_x;
    mol_height = max_y - min_y;
    
    mol_width = mol_width * 1.05;
    mol_height = mol_height * 1.05;
    // how much larger the drawing area is than the width and the height
    width_ratio = this.width / mol_width;
    height_ratio = this.height / mol_height;

    // we need to fit it in both directions, so we scale according to
    // the direction in which we need to scale the most
    min_ratio = Math.min(width_ratio, height_ratio);
    if(min_ratio < 1){
    	this.scale(min_ratio);
    }    
};

// recentre graph
WOQLGraphViewer.prototype.recentre = function(graph_node) {
	this.translated = true;
	// get the x and y you need to transform the nodes by 
	this.dcx = (this.width/2-graph_node.x);
	this.dcy = (this.height/2-graph_node.y);
	//zoom.translate([dcx,dcy]); If we do zooming we'll need to do something here
	this.node_elements.attr("transform", "translate("+ this.dcx + "," + this.dcy  + ")");
	this.link_elements.attr("transform", "translate("+ this.dcx + "," + this.dcy  + ")");
	this.text_elements.attr("transform", "translate("+ this.dcx + "," + this.dcy  + ")");
}

WOQLGraphViewer.prototype.isNeighbourLink = function(node, link) { return link.target.id === node.id || link.source.id === node.id;  }

WOQLGraphViewer.prototype.isFringe = function(node){
	if(this.result && this.result.added && this.result.added.upgraded){
		if(this.result.added.upgraded.indexOf(node.id) != -1){
			node.type = "node";
			return false;
		}
	}
	return node.type && node.type == "fringe";
}

/*
 * Generate the div that contains the visualisation panel
 */
WOQLGraphViewer.prototype.getAsDOM = function() {
	var vdom = document.createElement("div");
	vdom.setAttribute("class", "terminus-gviz-panel");
	vdom.setAttribute("id", this.visid);
	vdom.setAttribute("width", "100%");
	//vdom.setAttribute("style", "border: 1px solid red");
	this.container = vdom;
	return vdom;
}

WOQLGraphViewer.prototype.getLoadedNodeClasses = function() {
	cls = [];
	if(this.nodes){
		for(var i = 0; i<this.nodes.length; i++){
			if(this.nodes[i].groupID && cls.indexOf(this.nodes[i].groupID) == -1){
				cls.push(this.nodes[i].groupID);
			}
		}
	}
	return cls;
}

WOQLGraphViewer.prototype.getLoadedLinkClasses = function() {
	cls = [];
	if(this.links){
		for(var i = 0; i<this.links.length; i++){
			if(this.links[i].typeID && cls.indexOf(this.links[i].typeID) == -1){
				cls.push(this.links[i].typeID);
			}
		}
	}
	return cls;
}


WOQLGraphViewer.prototype.legend = function() {
	var hp = document.createElement("div");
	hp.setAttribute("class", "terminus-legend-holder");
	var cls = this.getLoadedNodeClasses();	
	var lcls = this.getLoadedLinkClasses();	
	if(cls && cls.length || (lcls && lcls.length)){
		var sp = document.createElement("div");
		sp.appendChild(document.createTextNode("Legend"));
		sp.setAttribute("class", "terminus-legend-title");
		var bd = document.createElement("div");
		bd.setAttribute("class", "terminus-legend-entries");
		for(var i = 0; i < cls.length; i++){
			bd.appendChild(this.getLegendNodeEntry(cls[i]));
		}
		for(var i = 0; i < lcls.length; i++){
			bd.appendChild(this.getLegendLinkEntry(lcls[i]));
		}
		hp.appendChild(sp);
		hp.appendChild(bd);
	}
	return hp;
}

WOQLGraphViewer.prototype.getLegendLinkEntry = function(cls) {
	var conf = this.browser.getModelElementDisplaySettings(cls);
	var sp = document.createElement("span");
	sp.setAttribute("class", "terminus-legend-link-entry");
	var i = document.createElement("i");
	i.setAttribute("class", conf.icon);
	var col = conf.color;
	if(!col) col = [125,125,125];
	var icol = col.map(function(el){ return el-125});
	sp.setAttribute("style", "background-color: "+"rgba("+col.join(",")+",0.5); color: "+"rgb("+icol.join(",")+")");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-legend-entry-label");
	lab.appendChild(document.createTextNode(conf.forward));
	var i2 = document.createElement("i");
	i2.setAttribute("class", "fas terminus-legend-link fa-arrow-right");
	sp.appendChild(lab);
	sp.appendChild(i);
	if(conf.backward){
		var lab2 = document.createElement("span");
		lab2.setAttribute("class", "terminus-legend-entry-label");
		lab2.appendChild(document.createTextNode(conf.backward));			
		sp.appendChild(lab2);
	}
	
	//sp.appendChild(i2);
	return sp;
}


WOQLGraphViewer.prototype.getLegendNodeEntry = function(cls) {
	var conf = this.browser.getModelElementDisplaySettings(cls);
	var xp = document.createElement("span");
	xp.setAttribute("class", "terminus-legend-entry");
	var sp = document.createElement("span");
	sp.setAttribute("class", "fa-stack");
	var i = document.createElement("i");
	i.setAttribute("class", "fas fa-circle fa-stack-2x");
	var col = conf.color;
	var icol = col.map(function(el){ return el-90});
	i.setAttribute("style", "color: "+"rgb("+col.join(",")+")");
	sp.appendChild(i);
	var i2 = document.createElement("i");
	//i2.setAttribute("style", "font-family: '" + this.fafontfam + "'; font-weight: 900");
	i2.setAttribute("style", "color: "+"rgb("+icol.join(",")+")");
	i2.setAttribute("class", conf.icon + " fa-stack-1x");
	sp.appendChild(i2);
	xp.appendChild(sp);
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-legend-entry-label");
	lab.appendChild(document.createTextNode(conf.text));
	xp.appendChild(lab);
	return xp;
}
