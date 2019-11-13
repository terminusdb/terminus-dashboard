function WOQLGraph(client){
	this.client = client;
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
	this.options = config || {};
	return this;
}

WOQLGraph.prototype.getEdges = function(){
	if(this.edges) return this.edges;
	this.edges = [];
	var bindings = this.result.getBindings();
	for(var i = 0; i<bindings.length; i++){
		for(var k in bindings[i]){
			if(this.edge_variables.indexOf(k) != -1){
				this.edges.push(this.makeEdgeFromRow(bindings[i][k], k, bindings[i]));
			}
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
		var cols = Object.keys(bindings[0]);
		if(cols.length >= 3){
			if(this.options.source_variables){
				this.source_variables = this.options.source_variables;
			}
			else {
				if(cols.indexOf('v:Source') != -1){
					this.source_variables = ['v:Source'];
				}
				else {
					this.source_variables = [cols[0]];				
				}
			}
			if(this.options.target_variables){
				this.target_variables = this.options.target_variables;
			}
			else {
				if(cols.indexOf('v:Target') != -1){
					this.target_variables = ['v:Target'];
				}
				else {
					this.target_variables = [cols[1]];				
				}
			}
			if(this.options.edge_variables){
				this.edge_variables = this.options.edge_variables;
			}
			else {
				if(cols.indexOf('v:Edge') != -1){
					this.edge_variables = ['v:Edge'];
				}
				else {
					this.edge_variables = [cols[2]];				
				}
			}
		}
	}
}

module.exports = WOQLGraph;