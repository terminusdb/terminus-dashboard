function WOQLQuery(client, options){
	this.client = client;
	this.options = options;
	this.default_limit = 1000;
	this.prefixes = {};
	if(client.connectionConfig.platformEndpoint()){
		var sid = client.connectionConfig.server.substring(0, client.connectionConfig.server.lastIndexOf("platform"));
		this.sid = sid;
		var colid = client.connectionConfig.server.substring(0, client.connectionConfig.server.lastIndexOf("platform")) + client.connectionConfig.dbid;
		this.prefixes['s'] = colid + "/ontology/main#";
		this.prefixes['g'] = sid;
		this.prefixes['db'] = colid + "/";
		this.prefixes['doc'] = colid + "/candidate/";
		this.prefixes['dg'] = colid + "/graph/main/";
	}
	else {
		this.sid = client.connectionConfig.serverURL();
		this.prefixes['s'] = client.connectionConfig.schemaURL() + "#";
		this.prefixes['dg'] = client.connectionConfig.dbURL() + "/schema";
		this.prefixes['doc'] = client.connectionConfig.docURL();
		this.prefixes['db'] = client.connectionConfig.dbURL() + "/";
		this.prefixes['g'] = client.connectionConfig.serverURL();
	}
	for(var pref in FrameHelper.standard_urls){
		this.prefixes[pref] = FrameHelper.standard_urls[pref];
	}
}

WOQLQuery.prototype.shorten = function(url){
	for(var pref in this.prefixes){
		if(this.prefixes[pref] == url.substring(0, this.prefixes[pref].length)){
			return ( pref + "/" + url.substring(this.prefixes[pref].length));
		}
	}
	return url;
}

WOQLQuery.prototype.execute = function(woql){
	var wrapped = this.wrap(woql);
	var self = this;
	return this.client.select(false, wrapped)
	.then(function(response){
		var res = new WOQLResult(response, self, self.options);
		return res;
	});
}

WOQLQuery.prototype.wrap = function(woql){
	var wstr = "prefixes([ ";
	var i = 0;
	for(var pref in this.prefixes){
		if(i++ > 0) wstr += ","
		wstr += pref + "='" + this.prefixes[pref] + "'";
	}
	wstr += "], from(g/'" + this.client.connectionConfig.dbid + "'," + woql + "))";
	return wstr;
}

WOQLQuery.prototype.getAbstractQueryPattern = function(varname){
	var aqp = "t(v('" + varname + "'), dcog/tag, dcog/abstract, schema)";
	return aqp;
}

WOQLQuery.prototype.getSubclassQueryPattern = function(varname, clsname){
	var sqp = "(v('" + varname + "') << (" + clsname + "))";
	return sqp;
}

WOQLQuery.prototype.getAllDocumentQuery = function(constraint, limit, start){
	limit = limit ? limit : this.default_limit ;
	start = start ? start : 0;
	var woql = "limit( " + limit + ", start(" + start + ","
	var vdoc = "t(v('Document'), rdf/type, v('Type'))";
	woql += "select([v('Document'), v('Type')],(" + vdoc;
	woql += ", (v('Type') << (dcog/'Document'))";
	if(constraint) woql += ", " + constraint;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getEverythingQuery = function(constraint, limit, start){
	limit = limit ? limit : this.default_limit ;
	start = start ? start : 0;
	var woql = "limit( " + limit + ", start(" + start + ","
	var vdoc = "t(v('Subject'), v('Predicate'), v('Object'))";
	woql += "select([v('Subject'), v('Predicate'), v('Object')],(" + vdoc;
	if(constraint) woql += ", " + constraint;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getPropertyListQuery = function(constraint){
	var vEl = "t(v('Property'), rdfs/range, v('Range'), schema)";
	var opts = [];
	opts.push("t(v('Property'), rdf/type, v('Type'), schema)");
	opts.push("t(v('Property'), rdfs/label, v('Label'), schema)");
	opts.push("t(v('Property'), rdfs/comment, v('Comment'), schema)");
	opts.push("t(v('Property'), rdfs/domain, v('Domain'), schema)");
	var woql = "select([v('Property'), v('Label'), v('Comment'), v('Domain'), v('Type'), v('Range')],(" + vEl;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}


WOQLQuery.prototype.getElementMetaDataQuery = function(constraint, limit, start){
	limit = (limit ? limit : this.default_limit);
	start = (start ? start : 0);
	var vEl = "t(v('Element'), rdf/type, v('Type'), schema)";
	var opts = [];
	opts.push("t(v('Element'), rdfs/label, v('Label'), schema)");
	opts.push("t(v('Element'), rdfs/comment, v('Comment'), schema)");
	opts.push("t(v('Element'), dcog/tag, v('Abstract'), schema)");
	opts.push("t(v('Element'), rdfs/domain, v('Domain'), schema)");
	opts.push("t(v('Element'), rdfs/range, v('Range'), schema)");
	var woql ="limit( " + limit + ", start(" + start + ",";
	woql += "select([v('Element'), v('Type'), v('Label'), v('Comment'), v('Domain'), v('Range'), v('Abstract')],(" + vEl;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getClassListMetaDataQuery = function(constraint){
	var vClass = "t(v('Class'), rdf/type, owl/'Class', schema)";
	var opts = [];
	opts.push("t(v('Class'), rdfs/label, v('Label'), schema)");
	opts.push("t(v('Class'), rdfs/comment, v('Comment'), schema)");
	opts.push("t(v('Class'), dcog/tag, v('Abstract'), schema)");
	var woql = "select([v('Class'), v('Label'), v('Comment'), v('Abstract')],(" + vClass;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}

WOQLQuery.prototype.getClassMetaDataQuery = function(constraint, limit, start){
	limit = (limit ? limit : this.default_limit);
	start = (start ? start : 0);
	var vClass = "t(v('Class'), rdf/type, owl/'Class', schema)";
	var opts = [];
	opts.push("t(v('Class'), rdfs/label, v('Label'), schema)");
	opts.push("t(v('Class'), rdfs/comment, v('Comment'), schema)");
	opts.push("t(v('Class'), dcog/tag, v('Abstract'), schema)");
	var woql ="limit( " + limit + ", start(" + start + ",";
	woql += "select([v('Class'), v('Label'), v('Comment'), v('Abstract')],(" + vClass;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getDataOfChosenClassQuery = function(chosen, limit, start){
	limit = (limit ? limit : this.default_limit);
	start = (start ? start : 0);
	var gLink = "'"+chosen+"'";//"g/'" + chosen.substring(this.sid.length, chosen.length) + "'";
	var vEl = "t(v('Document'), rdf/type, " + gLink + ")";
	var opts = "t(v('Document'),  v('Property'), v('Value'))";
	var woql = "limit( " + limit + ", start(" + start + ",";
	woql += "select([v('Document'), v('Property'), v('Value')],(" + vEl + ",";
	woql += opts;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getDataOfChosenPropertyQuery = function(chosen, limit, start){
	limit = (limit ? limit : this.default_limit);
	start = (start ? start : 0);
	var gLink = "'"+chosen+"'";//"g/'" + chosen.substring(this.sid.length, chosen.length) + "'";
	var vdoc = "t(v('Document'), " + gLink + ", v('Value')),";
	var ldoc = "opt(t(v('Document'), rdfs/label, v('Label')))";
	var woql = "limit( " + limit + ", start(" + start + ",";
	woql += "select([v('Document'), v('Label'), v('Value')],(" + vdoc + ldoc;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getInstanceMeta = function(url){
	var docid = "'" + url + "'";
	var vEl = "t(" + docid + ", rdfs/label, v('InstanceLabel'))";
	vEl += ", t(" + docid + ", rdf/type, v('InstanceType'))" 
	var opts = [];
	opts.push("t(doc/" + docid + ", rdfs/comment, v('InstanceComment'))");
	opts.push("t(v('InstanceType'), rdfs/label, v('ClassLabel'), schema)");
	var woql = "select([v('InstanceLabel'), v('InstanceType'), v('InstanceComment'), v('ClassLabel')],(" + vEl;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;	
}


WOQLQuery.prototype.getDocumentQuery = function(id, limit, start){
	limit = (limit ? limit : this.default_limit);
	start = (start ? start : 0);
	var docid = "'" + id + "'";
	var vEl = "t(doc/" + docid + ", v('Property'), v('Property Value'))";
	var opts = [];
	opts.push("t(v('Property'), rdfs/label, v('Property Label'), schema)");
	opts.push("t(v('Property'), rdf/type, v('Property Type'), schema)");
	var woql = "limit( " + limit + ", start(" + start + ",";
	woql += "select([v('Property Label'), v('Property'), v('Property Value'), v('Property Type')],(" + vEl;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getClassesQuery = function(){
	var vEl = "t(v('ID'), rdf/type, v('Class'))";
	var opts = [];
	opts.push("t(v('ID'), rdfs/label, v('Label'))");
	opts.push("t(v('ID'), rdfs/comment, v('Comment'))");
	opts.push("t(v('Class'), rdfs/label, v('Type'),schema)");
	var woql = "select([v('Label'),v('Comment'),v('ID'),v('Type'),v('Class')],(" + vEl;
	woql += ", (v('Class') << (dcog/'Document'))";
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}
