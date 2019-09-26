const FrameHelper = require('../FrameHelper');
const WOQLResult = require('./WOQLResultsViewer');

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

WOQLQuery.prototype.setPrefixes = function(prefixes){
	this.prefixes = prefixes;
}


WOQLQuery.prototype.shorten = function(url){
	for(var pref in this.prefixes){
		if(this.prefixes[pref] == url.substring(0, this.prefixes[pref].length)){
			return ( pref + ":" + url.substring(this.prefixes[pref].length));
		}
	}
	return url;
}

WOQLQuery.prototype.execute = function(woql){
	var wrapped = this.wrap(woql);
	var self = this;
	return this.client.select(false, wrapped)
	.then(function(response){
		var res = new WOQLResult.WOQLResult(response, self, self.options);
		return res;
	});
}

WOQLQuery.prototype.wrap = function(woql){
	var wjson = {
		"@context" : this.prefixes,
		"from": [ 
			this.client.connectionConfig.dbURL(),
			woql
		]
	};
	return wjson;
	//return JSON.stringify(wjson);
}

WOQLQuery.prototype.getConcreteDocumentClassPattern = function(varc){
	var varc = varc || "v:Class";
	var pat = {
		and: [
			this.getSubclassQueryPattern(varc, "tcs:Document"), 
			{
				not: [this.getAbstractQueryPattern(varc)] 
			}
		]
	}
	return pat;
}

WOQLQuery.prototype.getAbstractQueryPattern = function(varname){
	var qp = {
		quad: [varname, "tcs:tag", "tcs:abstract", "db:schema"] 
	}
	return qp;
}

WOQLQuery.prototype.getSubclassQueryPattern = function(varname, clsname){
	var sqp = {sub: [varname, clsname]};
	return sqp;

	//var sqp = "(v('" + varname + "') << (" + clsname + "))";
	//return sqp;
}

WOQLQuery.prototype.queryWrappedWithLimit = function(query, limit, start){
	limit = limit ? limit : this.default_limit ;
	start = start ? start : 0;
	var wjson = {
		limit: [limit, {
			start: [start, query]
		}]
	};
	return wjson;
}


WOQLQuery.prototype.getAllDocumentQuery = function(constraint, limit, start){
	var query = {
		and: [
			{
				triple: ["v:Document", "rdf:type", "v:Type"]
			},
			this.getSubclassQueryPattern("v:Type", "tcs:Document") 
		]
	}
	if(constraint){
		query.and.push(constraint);
	}
	return this.queryWrappedWithLimit(query, limit, start);
	/*
	var woql = "limit( " + limit + ",\n\t start(" + start + ","
	var vdoc = "\n\t\tt(v('Document'), rdf/type, v('Type'))";
	woql += "\n\t\tselect([v('Document'), v('Type')],(" + vdoc;
	woql += ", \n\t\t(v('Type') << (dcog/'Document'))";
	if(constraint) woql += ", \n" + constraint;
	woql += "))))";
	return woql;*/
}

WOQLQuery.prototype.getEverythingQuery = function(constraint, limit, start){
	var wjson = {triple: ["v:Subject", "v:Predicate", "v:Object"]};
	if(constraint){
		wjson = {and: [wjson, constraint]};
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
	/*var woql = "limit( " + limit + ", \n\tstart(" + start + ","
	var vdoc = "\n\t\tt(v('Subject'), v('Predicate'), v('Object'))";
	woql += "\n\t\tselect([v('Subject'), v('Predicate'), v('Object')],(" + vdoc;
	if(constraint) woql += ", " + constraint;
	woql += "))))";
	return woql;*/
}

WOQLQuery.prototype.getPropertyListQuery = function(constraint, limit, start){
	var wjson = {
		and: [{quad: ["v:Property", "rdfs:range", "v:Range", "db:schema"]},
			{ 
				opt: [{quad: ["v:Property", "rdf:type", "v:Type", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Property", "rdfs:label", "v:Label", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Property", "rdfs:comment", "v:Comment", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Property", "rdfs:domain", "v:Domain", "db:schema"]}]
			},
		]
	}
	if(constraint){
		wjson = {and: [wjson, constraint]};
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
	
	
	/*
	var vEl = "\n\tt(v('Property'), rdfs/range, v('Range'), schema)";
	var opts = [];
	opts.push("t(v('Property'), rdf/type, v('Type'), schema)");
	opts.push("t(v('Property'), rdfs/label, v('Label'), schema)");
	opts.push("t(v('Property'), rdfs/comment, v('Comment'), schema)");
	opts.push("t(v('Property'), rdfs/domain, v('Domain'), schema)");
	var woql = "select([v('Property'), v('Label'), v('Comment'), v('Domain'), v('Type'), v('Range')],(" + vEl;
	if(constraint) woql += ", " + constraint;
	for(var i = 0; i<opts.length; i++){
		woql += ", \n\topt(" + opts[i] + ")";
	}
	woql += "))";*/
	return woql;
}


WOQLQuery.prototype.getElementMetaDataQuery = function(constraint, limit, start){
	var wjson = {
		and: [{quad: ["v:Element", "rdf:type", "v:Type", "db:schema"]},
			{ 
				opt: [{quad: ["v:Element", "rdfs:label", "v:Label", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Element", "rdfs:comment", "v:Comment", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Element", "tcs:tag", "v:Abstract", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Element", "rdfs:domain", "v:Domain", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Element", "rdfs:range", "v:Range", "db:schema"]}]
			},
		]
	}
	if(constraint){
		wjson = {and: [wjson, constraint]};
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
}

WOQLQuery.prototype.getClassListMetaDataQuery = function(constraint, limit, start){
	var wjson = {
		and: [{quad: ["v:Element", "rdf:type", "owl:Class", "db:schema"]},
			{ 
				opt: [{quad: ["v:Element", "rdfs:label", "v:Label", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Element", "rdfs:comment", "v:Comment", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Element", "tcs:tag", "v:Abstract", "db:schema"]}]
			}
		]
	}
	if(constraint){
		wjson = {and: [wjson, constraint]};
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
}

WOQLQuery.prototype.getClassMetaDataQuery = WOQLQuery.prototype.getClassListMetaDataQuery;

WOQLQuery.prototype.getDataOfChosenClassQuery = function(chosen, limit, start){
	var wjson = {
		and: [{triple: ["v:Document", "rdf:type", chosen]},
			{ 
				opt: [{triple: ["v:Document", "v:Property", "v:Value"]}]
			}
		]
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
}

WOQLQuery.prototype.getDataOfChosenPropertyQuery = function(chosen, limit, start){
	var wjson = {
		and: [{triple: ["v:Document", chosen, "v:Value"]},
			{ 
				opt: [{triple: ["v:Document", "rdfs:label", "v:Label"]}]
			}
		]
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
}

WOQLQuery.prototype.getInstanceMeta = function(url, limit, start){
	var wjson = {
		and: [
			{triple: [url, "rdfs:label", "v:InstanceLabel"]},
			{triple: [url, "rdf:type", "v:InstanceType"]},
			{ 
				opt: [{triple: [url, "rdfs:comment", "v:InstanceComment"]}]
			},
			{ 
				opt: [{quad: ["v:InstanceType", "rdfs:label", "v:ClassLabel", "db:schema"]}]
			}
		]
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
}


WOQLQuery.prototype.getDocumentQuery = function(id, limit, start){
	var wjson = {
		and: [
			{triple: [id, "v:Property", "v:Property_Value"]},
			{ 
				opt: [{quad: ["v:Property", "rdfs:label", "v:Property_Label", "db:schema"]}]
			},
			{ 
				opt: [{quad: ["v:Property", "rdf:type", "v:Property_Type", "db:schema"]}]
			}
		]
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
}

WOQLQuery.prototype.getClassesQuery = function(){
	var wjson = {
		and: [
			{triple: ["v:ID", "rdf:type", "v:Class"]},
			{ 
				opt: [{triple: ["v:ID", "rdfs:label", "v:Label"]}]
			},
			{ 
				opt: [{triple: ["v:ID", "rdfs:comment", "v:Comment"]}]
			},
			{ 
				opt: [{quad: ["v:Class", "rdfs:label", "v:Type", "db:schema"]}]
			},
			{
				sub: ['v:Class', 'tcs:Document']
			}
		]
	}
	return wjson;
}

module.exports=WOQLQuery
