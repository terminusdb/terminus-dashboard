function WOQLQuery(client, options){
	this.client = client;
	this.options = options;
	this.prefixes = {};
	if(client.platformEndpoint()){
		var colid = client.server.substring(0, client.server.lastIndexOf("platform")) + client.dbid;
		this.prefixes['s'] = colid + "/ontology/main#";
		this.prefixes['g'] = client.serverURL();
		this.prefixes['db'] = colid + "/";
		this.prefixes['doc'] = colid + "/candidate/";
		this.prefixes['dg'] = colid + "/graph/main/";
	}
	else {
		this.prefixes['s'] = client.schemaURL() + "#";
		this.prefixes['dg'] = client.dbURL() + "/schema";
		this.prefixes['doc'] = client.docURL() + "/";
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

WOQLQuery.prototype.getDocumentQuery = function(constraint, limit, start){
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
	woql += "select([v('Subject'), v('Predicate'), v('Object')],(" + vdoc;
	if(constraint) woql += ", " + constraint;
	woql += "))))";
	return woql;
}


WOQLQuery.prototype.getElementMetaDataQuery = function(constraint){
	var vEl = "t(v('Element'), rdf/type, v('Type'), dg/schema)";
	var opts = [];
	opts.push("t(v('Element'), rdfs/label, v('Label'), dg/schema)");
	opts.push("t(v('Element'), rdfs/comment, v('Comment'), dg/schema)");
	opts.push("t(v('Element'), dcog/tag, v('Abstract'), dg/schema)");
	opts.push("t(v('Element'), rdfs/domain, v('Domain'), dg/schema)");
	opts.push("t(v('Element'), rdfs/range, v('Range'), dg/schema)");
	var woql = "select([v('Element'), v('Type'), v('Label'), v('Comment'), v('Domain'), v('Range'), v('Abstract')],(" + vEl;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}


WOQLQuery.prototype.getClassMetaDataQuery = function(constraint){
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

WOQLQuery.prototype.getEntityClassQuery = function(){
	var vEl = "t(v('Object'), rdf/type, v('Class')";
	var opts = [];
	opts.push("(v('Class') << (dcog/'Entity')), v('Type') = \"Entity\")");
	opts.push("t(v('Class'), rdfs/label, v('Class_Label'),g/" + this.client.dbid + "/graph/main/schema)");
	opts.push("t(v('Object'), rdfs/label, v('Label'))");
	var woql = "select([v('Object'),v('Class'),v('Class_Label'),v('Label'),v('Type')],(" + vEl;
	for(var i = 0; i<opts.length; i++){
		woql += ", opt(" + opts[i] + ")";
	}
	woql += "))";
	return woql;
}
