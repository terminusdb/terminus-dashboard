const DatatypeRenderers = require("./DatatypeRenderers");
const TerminusClient = require('@terminusdb/terminus-client');

function TerminusFrame(client){
	this.client = client;
	this.load_schema = false;
}

TerminusFrame.prototype.options = function(opts){
	this.config = opts || TerminusClient.WOQL.document();
	return this;
}

TerminusFrame.prototype.setDatatypes = function(func){
	this.datatypes = new DatatypeRenderers();
	if(this.config.datatypes) this.datatypes.options(this.config.datatypes);
	if(func) func(this.datatypes);
	return this;
}

TerminusFrame.prototype.loadDocument = function(url, cls){
	if(!url) return false;
	var self = this;
	if(url.substring(0,4) == "doc:"){
		url = url.substring(4);
	}
	return this.client.getDocument(url, {"terminus:encoding": "terminus:frame"})
	.then(function(response){
		self.loadDataFrames(response);
		if(self.config.load_schema() ){
			cls = (cls ? cls : self.document.cls);
			self.loadDocumentSchema(cls).then(() => response);
		}
		return response;
	});
}

TerminusFrame.prototype.loadDocumentSchema = function(cls){
	var self = this;
	var ncls = TerminusClient.UTILS.unshorten(cls);
	return this.client.getClassFrame(false, ncls)
	.then(function(response){
		return self.loadSchemaFrames(response, cls);
	});
}

TerminusFrame.prototype.loadDataFrames = function(dataframes, cls, classframes){
	if(!cls){
		if(this.document) cls = this.document.cls;
		else {
			if(dataframes && dataframes.length && dataframes[0] && dataframes[0].domain){
				cls = dataframes[0].domain;
			}
		}
	}
	if(cls){
		if(!this.document){
			this.document = new TerminusClient.ObjectFrame(cls, dataframes, classframes);
		}
		else {
			this.document.loadDataFrames(dataframes);
		}
	}
	else {
		console.log("Missing Class" + " " + "Failed to add dataframes due to missing class");
	}
}

TerminusFrame.prototype.loadSchemaFrames = function(classframes, cls){
	if(!cls){
		if(classframes && classframes.length && classframes[0] && classframes[0].domain){
			cls = classframes[0].domain;
		}
	}
	if(cls){
		if(!this.document){
			this.document = new TerminusClient.ObjectFrame(cls);
		}
		if(classframes){
			this.document.loadClassFrames(classframes);
			if(!this.document.subjid){
				this.document.newDoc = true;
				this.document.fillFromSchema("_:");
			}
		}
	}
	else {
		console.log("Missing Class", "Failed to add class frames due to missing both class and classframes");
	}
}

TerminusFrame.prototype.render = function(){
	if(!this.renderer && this.document){
		if(this.config.renderer()){
			this.renderer = this.config.renderer();
		}
		else {
			this.applyRulesToDocument(this.document, this.config);
			this.renderer = this.document;
		}
	}
	if(this.renderer && this.renderer.render){
		return this.renderer.render(this.document);
	}
	else if(typeof this.renderer == "function"){
		var x = this.renderer(this.document);
		return x;
	}
	else {
		console.log("didna make it - no render function for document");
	}
}

/*
 * adds render and compare functions to object frames
 */
TerminusFrame.prototype.applyRulesToDocument = function(doc, config){
	var self = this;
	function onmatch(frame, rule){
		if(typeof rule.render() != "undefined"){
			frame.render = rule.render();
		}
		else {
			if(rule.renderer()){
				var renderer = self.loadRenderer(rule.renderer(), frame, rule.args);		
			}
			if(renderer && renderer.render){
				frame.render = function(frame){
					return renderer.render(frame);
				}
			}
		}
		if(rule.compare()){
			frame.compare = rule.compare();
		}
		config.setFrameDisplayOptions(frame, rule);
	}
	if(doc.render){
		function clearDisplay(frame, rule){
			delete(frame['render']);
			delete(frame['display_options']);
			frame.compare = TerminusClient.ObjectFrame.prototype.compare;
		}
		var nconfig = TerminusClient.WOQL.document();
		nconfig.all();
		doc.filter(nconfig.rules, clearDisplay);
	}
	doc.filter(config.rules, onmatch);
}

TerminusFrame.prototype.loadRenderer = function(rendname, frame, args){
	if(this.owner){
		return this.owner.loadRenderer(rendname, frame, args, this);
	}
	return false;
}

module.exports = TerminusFrame ;
