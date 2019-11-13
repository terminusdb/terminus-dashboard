const WOQLResult = require('./WOQLResultsViewer');
const TerminusClient = require('@terminusdb/terminus-client');
function WOQLQuery(client, options, ui){
	this.client = client;
	this.options = options;
	this.ui = ui;
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
	for(var pref in TerminusClient.FrameHelper.standard_urls){
		this.prefixes[pref] = TerminusClient.FrameHelper.standard_urls[pref];
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
		var res = new WOQLResult.WOQLResult(response, self, self.options, self.ui);
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

//getAllDocuments
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
}

//getEverything
WOQLQuery.prototype.getEverythingQuery = function(constraint, limit, start){
	var wjson = {triple: ["v:Subject", "v:Predicate", "v:Object"]};
	if(constraint){
		wjson = {and: [wjson, constraint]};
	}
	return this.queryWrappedWithLimit(wjson, limit, start);
}

// propertyMetadata
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
}

// elementMetadata() in new woql query
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

// classMetadata in new woql client
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

// classMetadata
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

WOQLQuery.prototype.getClassesQuery = function(limit, start){
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
	return this.queryWrappedWithLimit(wjson, limit, start);
}

module.exports=WOQLQuery
