function WOQLQuery(client, options){
	this.client = client;
	this.options = options;
	this.prefixes = {};
	if(client.platformEndpoint()){
		var sid = client.server.substring(0, client.server.lastIndexOf("platform"));
		this.sid = sid;
		var colid = client.server.substring(0, client.server.lastIndexOf("platform")) + client.dbid;
		this.prefixes['s'] = colid + "/ontology/main#";
		this.prefixes['g'] = sid;
		this.prefixes['db'] = colid + "/";
		this.prefixes['doc'] = colid + "/candidate/";
		this.prefixes['dg'] = colid + "/graph/main/";
	}
	else {
		this.prefixes['s'] = client.schemaURL() + "#";
		this.prefixes['dg'] = client.dbURL() + "/schema";
		this.prefixes['doc'] = client.docURL();
		this.prefixes['db'] = client.dbURL() + "/";
		this.prefixes['g'] = client.serverURL();
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
	})
	.catch(function(error){
		console.error(error);
	});
}

WOQLQuery.prototype.wrap = function(woql){
	var wstr = "prefixes([ ";
	var i = 0;
	for(var pref in this.prefixes){
		if(i++ > 0) wstr += ","
		wstr += pref + "='" + this.prefixes[pref] + "'";
	}
	wstr += "], from(g/'" + this.client.dbid + "'," + woql + "))";
	return wstr;
}

WOQLQuery.prototype.getAbstractQueryPattern = function(varname){
	var aqp = "t(v('" + varname + "'), dcog/tag, dcog/abstract, dg/schema)";
	return aqp;
}

WOQLQuery.prototype.getSubclassQueryPattern = function(varname, clsname){
	var sqp = "(v('" + varname + "') << (" + clsname + "))";
	return sqp;
}

WOQLQuery.prototype.getAllDocumentQuery = function(constraint, limit, start){
	limit = limit ? limit : 100;
	start = start ? start : 0;
	var woql = "limit( " + limit + ", start(" + start + ","
	var vdoc = "t(v('Document'), rdf/type, v('Type'))";
	woql += "select([v('Document'), v('Type')],(" + vdoc;
	if(constraint) woql += ", " + constraint;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getEverythingQuery = function(constraint, limit, start){
	limit = limit ? limit : 100;
	start = start ? start : 0;
	var woql = "limit( " + limit + ", start(" + start + ","
	var vdoc = "t(v('Subject'), v('Predicate'), v('Object'))";
	woql += "select([v('Subject'), v('PredgetClassMetaDataQueryicate'), v('Object')],(" + vdoc;
	if(constraint) woql += ", " + constraint;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getPropertyListQuery = function(constraint){
	var vEl = "t(v('Property'), rdfs/range, v('Range'), dg/schema)";
	var opts = [];
	opts.push("t(v('Property'), rdf/type, v('Type'), dg/schema)");
	opts.push("t(v('Property'), rdfs/label, v('Label'), dg/schema)");
	opts.push("t(v('Property'), rdfs/comment, v('Comment'), dg/schema)");
	opts.push("t(v('Property'), rdfs/domain, v('Domain'), dg/schema)");
	var woql = "select([v('Property'), v('Label'), v('Comment'), v('Domain'), v('Type'), v('Range')],(" + vEl;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}


WOQLQuery.prototype.getElementMetaDataQuery = function(constraint, limit, start){
	var vEl = "t(v('Element'), rdf/type, v('Type'), dg/schema)";
	var opts = [];
	opts.push("t(v('Element'), rdfs/label, v('Label'), dg/schema)");
	opts.push("t(v('Element'), rdfs/comment, v('Comment'), dg/schema)");
	opts.push("t(v('Element'), dcog/tag, v('Abstract'), dg/schema)");
	opts.push("t(v('Element'), rdfs/domain, v('Domain'), dg/schema)");
	opts.push("t(v('Element'), rdfs/range, v('Range'), dg/schema)");
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
	var vClass = "t(v('Class'), rdf/type, owl/'Class', dg/schema)";
	var opts = [];
	opts.push("t(v('Class'), rdfs/label, v('Label'), dg/schema)");
	opts.push("t(v('Class'), rdfs/comment, v('Comment'), dg/schema)");
	opts.push("t(v('Class'), dcog/tag, v('Abstract'), dg/schema)");
	var woql = "select([v('Class'), v('Label'), v('Comment'), v('Abstract')],(" + vClass;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}

WOQLQuery.prototype.getClassMetaDataQuery = function(constraint, limit, start){
	var vClass = "t(v('Class'), rdf/type, owl/'Class', dg/schema)";
	var opts = [];
	opts.push("t(v('Class'), rdfs/label, v('Label'), dg/schema)");
	opts.push("t(v('Class'), rdfs/comment, v('Comment'), dg/schema)");
	opts.push("t(v('Class'), dcog/tag, v('Abstract'), dg/schema)");
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
	var gLink = "g/'" + chosen.substring(this.sid.length, chosen.length) + "'";
	var vEl = "t(v('Document'), rdf/type, " + gLink + ")";
	var opts = "t(v('Document'),  v('Property'), v('Value'))";
	var woql = "limit( " + limit + ", start(" + start + ",";
	woql += "select([v('Document'), v('Property'), v('Value')],(" + vEl + ",";
	woql += opts;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getDataOfChosenPropertyQuery = function(chosen, limit, start){
	var gLink = "g/'" + chosen.substring(this.sid.length, chosen.length) + "'";
	var vdoc = "t(v('Document'), " + gLink + ", v('Value')),";
	var ldoc = "opt(t(v('Document'), rdfs/label, v('Label')))";
	var woql = "limit( " + limit + ", start(" + start + ",";
	woql += "select([v('Document'), v('Label'), v('Value')],(" + vdoc + ldoc;
	woql += "))))";
	return woql;
}

WOQLQuery.prototype.getDocumentQuery = function(id, limit, start){
	var docid = "'" + id + "'";
	var vEl = "t(doc/" + docid + ", v('Property'), v('Property Value'))";
	var opts = [];
	opts.push("t(v('Property'), rdfs/label, v('Property Label'), dg/schema)");
	opts.push("t(v('Property'), rdf/type, v('Property Type'), dg/schema)");
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
	opts.push("t(v('Class'), rdfs/label, v('Type'),dg/schema)");
	var woql = "select([v('Label'),v('Comment'),v('ID'),v('Type'),v('Class')],(" + vEl;
	woql += ", (v('Class') << (dcog/'Document'))";
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}
