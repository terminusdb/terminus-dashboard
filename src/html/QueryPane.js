function ResultViewer(rule){
	this.rules = [];
	if(rule) this.rules.push(rule);
}

ResultViewer.prototype.render = function(){
	var span = document.createElement("span");
	if(this.ruleviewer){
		let r = this.ruleviewer.render();
		if(r) span.appendChild(r);
	}
	return span;
}

ResultViewer.prototype.setRuleViewer = function(rv){
	this.ruleviewer = rv;
}

function QueryPane(client, query, results){
	this.client = client;
	this.query = query;
	this.result = results;
	this.query_viewers = [];
	this.result_viewers = {};
	//this.libraries = [];
	this.rules = [];
}

QueryPane.prototype.options = function(options){
	this.options = options;
	return this;
}

QueryPane.prototype.addQueryViewer = function(qv){
	this.query_viewers.push(qv);
	if(this.query) qv.setQuery(this.query);
	return this;
}

QueryPane.prototype.addResultViewer = function(label, rule, ruleviewer){
	let rv = new ResultViewer(rule);
	if(ruleviewer) rv.setRuleViewer(ruleviewer);
	this.result_viewers[label] = rv;
	return this;
}



QueryPane.prototype.addLibrary = function(lib){
	this.libraries.push(lib);
	return this;
}

QueryPane.prototype.render = function(lib){
	var qps = document.createElement("span");
	for(var i = 0; i<this.query_viewers.length; i++){
		var qv = this.query_viewers[i];
		if(qv){
			let v = qv.render();
			if(v) qps.appendChild(v);
		}
	}

	for(var k in this.result_viewers){
		var rv = this.result_viewers[k];
		if(rv){
			var x = rv.render();
			if(x) qps.appendChild(x);
		}
	}
	return qps;
}

module.exports = QueryPane;