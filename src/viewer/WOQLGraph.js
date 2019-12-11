const TerminusClient = require('@terminusdb/terminus-client');

function WOQLGraph(client, options){
	this.client = client;
	this.options(options);
	this.nodes = [];
	this.node_ids = [];
	this.edges = [];
	return this;
}

WOQLGraph.prototype.setResult = function(result){
	this.result = result;
	this.calculateVariableTypes(result);
}

WOQLGraph.prototype.setRenderer = function(rend){
	this.renderer = rend;
	return this;
}

WOQLGraph.prototype.render = function(){
	if(this.renderer) return this.renderer.render(this);
}

WOQLGraph.prototype.options = function(config){
	this.config = config || TerminusClient.WOQL.graph();	
	return this;
}

WOQLGraph.prototype.getEdges = function(){
	if(this.edges) return this.edges;
	this.edges = [];
	var bindings = this.result.getBindings();
	for(var i = 0; i<bindings.length; i++){
		if(this.rowIncludesEdge(bindings[i])){
			this.edges = this.edges.concat(this.makeEdgesFromRow(bindings[i]))
		}
	}
	return this.edges;
}

WOQLGraph.prototype.getNodes = function(){
	if(this.nodes) return this.nodes;
	this.nodes = [];
	//get column names first...
	var bindings = this.result.getBindings();
	var nodes = [];
	for(var i = 0; i<bindings.length; i++){
		for(var k in bindings[i]){
			if(this.source_variables.indexOf(k) != -1 && nodes.indexOf(bindings[i][k]) == -1){
				nodes.push(bindings[i][k]);
				this.nodes.push(this.makeNodeFromSource(bindings[i][k], k, bindings[i]));
			}
			if(this.target_variables.indexOf(k) != -1 && nodes.indexOf(bindings[i][k]) == -1){
				nodes.push(bindings[i][k]);
				this.nodes.push(this.makeNodeFromTarget(bindings[i][k], k, bindings[i]));
			}
		}
	}
	return this.nodes;
}

WOQLGraph.prototype.makeNodeFromSource = function(sid, k, row) {
	var node = {type: "node", id: sid};
	return this.adornNode(node, row);
}

WOQLGraph.prototype.makeNodeFromTarget = WOQLGraph.prototype.makeNodeFromSource ;

WOQLGraph.prototype.adornNode = function(node){
	return node;
}

WOQLGraph.prototype.adornEdge = function(edge){
	return edge;
}

WOQLGraph.prototype.makeEdgeFromRow = function(eid, k, row){
	var target = false;
	var source = false;
	for(var i = 0; i<this.target_variables.length; i++){
		if(row[this.target_variables[i]]){
			target = row[this.target_variables[i]];
			continue;
		}
	}
	if(target){
		for(var i = 0; i<this.source_variables.length; i++){
			if(row[this.source_variables[i]]){
				source = row[this.source_variables[i]];
				continue;
			}
		}		
	}
	if(source && target){
		var edge = { type: "link", id: eid, target: target, source: source };
		return this.adornEdge(edge, row);
	}
}

WOQLGraph.prototype.calculateVariableTypes = function(){
	var bindings = this.result.getBindings();
	if(bindings && bindings.length){
		for(var i = 0; i<bindings.length; i++){
			this.extractFromBinding(bindings[i]);
		}
	}
}

WOQLGraph.prototype.extractFromBinding = function(row){
	//
	if(this.includeRow(row)){
		//get all the nodes (ids - non literals) //
		//see which nodes are excluded ...
		var nodes = [];
		var lits = [];
		for(var k in row){
			if(typeof row[k] == "string"){
				if(row[k] && row[k] != "unknown" && this.includeNode(k, row)) nodes.push(k);
			}
			else if(typeof row[k]["@value"] == "string" && this.includeLiteralNode(k, row)){
				lits.push(k);
			}
		}
		if(nodes.length == 0) return;
		//first of all we need to make the literal nodes targets of 
		for(var i = 0; i<lits.length; i++){
			//make an edge and put the lit in as a node...
			var nid = TerminusClient.FrameHelper.genBNID().substring(2);
			let source = this.getLiteralOwner(nodes, lits[i], row);
			if(source) {
				this.addAdornedNode(nid, lits[i], row);
				this.addAdornedEdge(row[source], nid, source, lits[i], row);
			}
		}
		this.createEdgesFromIDs(nodes, row);
		for(var i = 0; i<nodes.length; i++){
			var ndid = row[nodes[i]];
			this.addAdornedNode(ndid, nodes[i], row);
		}
	}
}

WOQLGraph.prototype.addAdornedEdge = function(source, target, ks, kt, row){
	var edge = { type: "link", target: target, source: source, text: kt};
	const matched_rules = this.config.getMatchingRules(row, [ks, kt], "edge");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].size){
			if(typeof matched_rules[i].size == "string" && matched_rules[i].size.substring(0, 2) == "v:"){
				var w = row[matched_rules[i].size];
				if(w && w['@value']) edge.size = w['@value'];
			}
			else {
				edge.size = matched_rules[i].size;
			}			
		}
		if(matched_rules[i].color){
			edge.color = matched_rules[i].color;			
		}
		if(matched_rules[i].distance){
			if(typeof matched_rules[i].distance == "string" && matched_rules[i].distance.substring(0, 2) == "v:"){
				var w = row[matched_rules[i].distance];
				if(w && w['@value']) edge.distance = w['@value'];
			}
			else {
				edge.distance = matched_rules[i].distance;
			}
		}
		if(matched_rules[i].arrow){
			edge.arrow = matched_rules[i].arrow;
		}
		if(typeof matched_rules[i].symmetric != "undefined"){
			edge.symmetric = matched_rules[i].symmetric;
		}
		if(matched_rules[i].weight){
			if(typeof matched_rules[i].weight == "string" && matched_rules[i].weight.substring(0, 2) == "v:"){
				var w = row[matched_rules[i].weight];
				if(w && w['@value']) edge.weight = w['@value'];
			}
			else {
				edge.weight = matched_rules[i].weight;
			}
		}
	}
	this.edges.push(edge);	
}

WOQLGraph.prototype.addAdornedNode = function(nid, k, row){
	var node = { type: "node", id: nid, nodetype: k };
	const matched_rules = this.config.getMatchingRules(row, k, "node");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].size){
			if(typeof matched_rules[i].size == "string" && matched_rules[i].size.substring(0, 2) == "v:"){
				var rad = row[matched_rules[i].size];
				if(rad && rad['@value']) node.radius = rad['@value'];
			}
			else {
				node.radius = matched_rules[i].size;
			}
		}
		if(matched_rules[i].color){
			node.color = matched_rules[i].color;
		}
		if(matched_rules[i].charge){
			if(typeof matched_rules[i].charge == "string" && matched_rules[i].charge.substring(0, 2) == "v:"){
				var rad = row[matched_rules[i].charge];
				if(rad && rad['@value']) node.charge = rad['@value'];
			}
			else {
				node.charge = matched_rules[i].charge;
			}
		}
		if(matched_rules[i].collisionRadius ){
			if(typeof matched_rules[i].collisionRadius == "string" && matched_rules[i].collisionRadius.substring(0, 2) == "v:"){
				var rad = row[matched_rules[i].collisionRadius];
				if(rad && rad['@value']) node.collisionRadius = rad['@value'];
			}
			else {
				node.collisionRadius= matched_rules[i].collisionRadius;
			}
		}
		if(matched_rules[i].icon ){
			node.icon = matched_rules[i].icon;
		}
		if(matched_rules[i].text){
			node.text = matched_rules[i].text;
		}
		if(matched_rules[i].border){
			node.border = matched_rules[i].border;
		}
	}
	if(!node.text){
		if(typeof row[k] == "string") node.text = row[k];
		else if(row[k]['@value']) node.text = row[k]['@value'];
	}
	this.nodes.push(node);
}

WOQLGraph.prototype.getLiteralOwner = function(nodes, v, row){
	var cs = this.config.source();
	if(cs && row[cs]){
		return cs;
	}
	var edges = this.config.edges();
	if(edges){
		for(var i = 0; i < edges.length; i++){
			if(edges[i][1] == v){
				return edges[i][0];
			}
		}
		return false;
	}
	return nodes[0];
}

WOQLGraph.prototype.createEdgesFromIDs = function(nodes, row){
	if(nodes.length < 2) return;
	var cs = this.config.source();
	let es = this.config.edges();
	if(!cs && es && es.length){
		for(var i = 0; i< es.length; i++){
			if(nodes.indexOf(es[i][0]) != -1 && nodes.indexOf(es[i][1]) != -1 ){
				this.addAdornedEdge(row[es[i][0]], row[es[i][1]], es[i][0], es[i][1], row);
			}
		}
		return;
	}
	var s = (cs && nodes.indexOf(cs) != -1) ? cs : nodes[0];
	for(var i = 0; i<nodes.length; i++){
		if(nodes[i] == s) continue;
		this.addAdornedEdge(row[s], row[nodes[i]], s, nodes[i], row);
	}
}

WOQLGraph.prototype.includeNode = function(v, row){
	const matched_rules = this.config.getMatchingRules(row, v, "node", "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].hidden) return false;
	}
	return true;
}

WOQLGraph.prototype.includeLiteralNode = function(v, row){
	let l = this.config.literals();
	if(typeof l != "undefined" && !l) return false;
	const matched_rules = this.config.getMatchingRules(row, v, "node", "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].hidden) return false;
	}
	return true;
}


WOQLGraph.prototype.includeRow = function(row){
	const matched_rules = this.config.getMatchingRules(row, false, "row", "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].hidden) return false;
	}
	return true;
}



module.exports = WOQLGraph;