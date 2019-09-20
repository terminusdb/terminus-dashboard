const FrameHelper = require('../FrameHelper');
const PropertyViewer = require('./PropertyViewer');
const ObjectViewer= require("./ObjectViewer")
const HTMLStringViewer = require('./viewers/String');
const HTMLStringEditor = require('./viewers/StringEditor');
const HTMLBooleanViewer = require('./viewers/Boolean');
const HTMLBooleanEditor = require('./viewers/BooleanEditor');

let RenderingMap = {
	registeredDataViewers: {},
	registeredDataEditors: {},	
	registeredPropertyViewers: {},
	registeredPropertyEditors: {},
	registeredObjectViewers: {},
	registeredObjectEditors: {},
	getValidDataViewerList: function(type, frametype){
		var valids = ['HTMLStringViewer'];
		if(frametype && typeof this.registeredDataViewers[frametype] != "undefined"){
			valids = valids.concat(this.registeredDataViewers[frametype]);
		}
		if(typeof this.registeredDataViewers[type] != "undefined"){
			valids = valids.concat(this.registeredDataViewers[type]);
		}
		return valids;
	},
	getValidDataEditorList: function(type, frametype){
		var valids = ['HTMLStringEditor'];
		if(frametype && typeof this.registeredDataEditors[frametype] != "undefined"){
			var nftypes = this.registeredDataEditors[frametype];
			if(nftypes){
				for(var i = 0; i<nftypes.length; i++){
					if(valids.indexOf(nftypes[i]) == -1) valids.push(nftypes[i]);
				}
			}
		}
		if(typeof this.registeredDataEditors[type] != "undefined"){
			valids = valids.concat(this.registeredDataEditors[type]);
		}
		return valids;
	},
	getValidPropertyViewerList: function(property, proptype, proprange, propdom){
		var valids = ['HTMLPropertyViewer'];
		if(property && typeof this.registeredPropertyViewers[property] != "undefined"){
			valids = valids.concat(this.registeredPropertyViewers[property]);
		}
		if(proprange && typeof this.registeredPropertyViewers[proprange] != "undefined"){
			valids = valids.concat(this.registeredPropertyViewers[proprange]);
		}
		if(propdom && typeof this.registeredPropertyViewers[propdom] != "undefined"){
			valids = valids.concat(this.registeredPropertyViewers[propdom]);
		}
		if(proptype && typeof this.registeredPropertyViewers[proptype] != "undefined"){
			valids = valids.concat(this.registeredPropertyViewers[proptype]);
		}
		return valids;
	},
	getValidPropertyEditorList: function(property, proptype, proprange, propdom){
		var valids = ['HTMLPropertyViewer'];
		if(property && typeof this.registeredPropertyEditors[property] != "undefined"){
			valids = valids.concat(this.registeredPropertyEditors[property]);
		}
		if(proprange && typeof this.registeredPropertyEditors[proprange] != "undefined"){
			valids = valids.concat(this.registeredPropertyEditors[proprange]);
		}
		if(propdom && typeof this.registeredPropertyEditors[propdom] != "undefined"){
			valids = valids.concat(this.registeredPropertyEditors[propdom]);
		}
		if(proptype && typeof this.registeredPropertyEditors[proptype] != "undefined"){
			valids = valids.concat(this.registeredPropertyEditors[proptype]);
		}
		return valids;
	},
	getViewer: function(type, options){
		var vi = this.renderers[type];
		options = (options ? options: {});
		try {
			var viewer = eval("new " + type + "." + type + "(" + JSON.stringify(options) + ")");	
			return viewer;
		}
		catch(e){
			alert("failed on create " + e.toString());
		}
	},
	getAvailablePropertyViewers: function(type, renderer) {
		var viewers = [];
		var nviewers = []
		var opts = this.getValidPropertyViewerList(type);
		for(var i = 0; i<opts.length; i++){
			if(nviewers.indexOf(opts[i]) == -1) {
				nviewers.push(opts[i]);
			}
		}
		for(var i = 0; i<nviewers.length; i++){
			if(this.renderers[nviewers[i]]){
				var sets = this.renderers[nviewers[i]];
				viewers.push({value: nviewers[i], label: sets.label});
			}
		}
		return viewers;
	},
	getAvailablePropertyEditors: function(type, renderer) {
		var viewers = [];
		var nviewers = []
		var opts = this.getValidPropertyEditorList();
		for(var i = 0; i<opts.length; i++){
			if(nviewers.indexOf(opts[i]) == -1) {
				nviewers.push(opts[i]);
			}
		}
		for(var i = 0; i<nviewers.length; i++){
			if(this.renderers[nviewers[i]]){
				var sets = this.renderers[nviewers[i]];
				viewers.push({value: nviewers[i], label: sets.label});
			}
		}
		return viewers;
		
	},
	getAvailableDataViewers: function(type, frametype){
		var viewers = [];
		var nviewers = []
		var opts = this.getValidDataViewerList(type, frametype);
		for(var i = 0; i<opts.length; i++){
			if(nviewers.indexOf(opts[i]) == -1) {
				nviewers.push(opts[i]);
			}
		}
		for(var i = 0; i<nviewers.length; i++){
			if(this.renderers[nviewers[i]]){
				var sets = this.renderers[nviewers[i]];
				viewers.push({value: nviewers[i], label: sets.label});
			}
		}
		return viewers;
	},
	getAvailableDataEditors: function(type, frametype){
		var viewers = [];
		var nviewers = []
		var opts = this.getValidDataEditorList(type, frametype);
		for(var i = 0; i<opts.length; i++){
			if(nviewers.indexOf(opts[i]) == -1) {
				nviewers.push(opts[i]);
			}
		}
		for(var i = 0; i<nviewers.length; i++){
			if(this.renderers[nviewers[i]]){
				var sets = this.renderers[nviewers[i]];
				viewers.push({value: nviewers[i], label: sets.label});
			}
		}
		return viewers;
	},
	getViewerForDataFrame: function(type, frametype){
		var vals = this.getValidDataViewerList(type, frametype);
		return vals[vals.length-1];
	},
	getEditorForDataFrame: function(type, frametype){
		var vals = this.getValidDataEditorList(type, frametype);
		return vals[vals.length-1];
	},
	registerViewerForTypes: function(viewer, label, types){
		for(var i = 0; i < types.length; i++){
			if(typeof this.registeredDataViewers[types[i]] == "undefined"){
				this.registeredDataViewers[types[i]] = [];
			}
			if(this.registeredDataViewers[types[i]].indexOf(viewer) == -1){
				this.registeredDataViewers[types[i]].push(viewer);
				this.renderers[viewer] = {label: label};
			}
		}
	},
	registerEditorForTypes: function(viewer, label, types){
		for(var i = 0; i < types.length; i++){
			if(typeof this.registeredDataEditors[types[i]] == "undefined"){
				this.registeredDataEditors[types[i]] = [];
			}
			if(this.registeredDataEditors[types[i]].indexOf(viewer) == -1){
				this.registeredDataEditors[types[i]].push(viewer);
				this.renderers[viewer] = {label: label};
			}			
		}
	},
	registerEditorForFrameType: function(viewer, label, frametype){
		this.renderers[viewer] = {label: label};
		if(typeof this.registeredDataEditors[frametype] == "undefined") this.registeredDataEditors[frametype] = [];
		if(this.registeredDataEditors[frametype].indexOf(viewer) == -1){
			this.registeredDataEditors[frametype].push(viewer);
		}
	},
	registerViewerForFrameType: function(viewer, label, frametype){
		this.renderers[viewer] = {label: label};
		if(typeof this.registeredDataViewers[frametype] == "undefined") this.registeredDataViewers[frametype] = [];
		if(this.registeredDataViewers[frametype].indexOf(viewer) == -1){
			this.registeredDataViewers[frametype].push(viewer);
		}
	},
	registerViewerForProperties: function(viewer, label, properties){
		for(var i = 0; i < properties.length; i++){
			if(typeof this.registeredPropertyViewers[properties[i]] == "undefined"){
				this.registeredPropertyViewers[properties[i]] = [];
			}
			if(this.registeredPropertyViewers[properties[i]].indexOf(viewer) == -1){
				this.registeredPropertyViewers[properties[i]].push(viewer);
				this.renderers[viewer] = {label: label};
			}
		}
	},
	registerEditorForProperties: function(viewer, label, properties){
		for(var i = 0; i < properties.length; i++){
			if(typeof this.registeredPropertyEditors[properties[i]] == "undefined"){
				this.registeredPropertyEditors[properties[i]] = [];
			}
			if(this.registeredPropertyEditors[properties[i]].indexOf(viewer) == -1){
				this.registeredPropertyEditors[properties].push(viewer);
				this.renderers[viewer] = {label: label};
			}
		}
	},
	renderers: {
		HTMLStringViewer: { label: "String Viewer"},
		HTMLStringEditor: { label: "String Editor"},
		HTMLPropertyViewer: { label: "HTML Property Viewer"}
	},
	patternMatchesRenderer: function(pattern, renderer){
		if(typeof pattern == "object" && pattern.length){ //multiple patterns are ANDed
			for(var i = 0 ; i<pattern.length; i++){
				var fp = new FramePattern(pattern[i]);
				if(!fp.checkRenderer(renderer)) return false;
			}
			return true;
		}
		else {
			var fp = new FramePattern(pattern);
			return fp.checkRenderer(renderer);
		}
	}
}


RenderingMap.getViewerForProperty = function(target, renderer){
	return new PropertyViewer.HTMLPropertyViewer(renderer);
}

RenderingMap.getEditorForProperty = function(target, renderer){
	return new PropertyViewer.HTMLPropertyViewer(renderer);
}


RenderingMap.getViewerForObject = function(target, renderer){
	if(target == "json"){
		return new JSONObjectViewer(renderer);
	}
	return new ObjectViewer.HTMLObjectViewer(renderer);
}

RenderingMap.getEditorForObject = RenderingMap.getViewerForObject;

RenderingMap.getAvailableObjectViewers = function(renderer){
	var entries = ['html', 'json'];
	return entries;
}

RenderingMap.decorateRenderer = function(options, renderer){
	var compiled_options = this.compileOptions(options, renderer);
	if(compiled_options && compiled_options.mode){
		renderer.mode = compiled_options.mode;
	}
	else {
		if(renderer.parent && renderer.parent.mode) renderer.mode = renderer.parent.mode;
		else renderer.mode = "view";
	}
	if(compiled_options && compiled_options.view){
		renderer.view = compiled_options.view;
	}
	else {
		if(renderer.parent && renderer.parent.view) renderer.view = renderer.parent.view;
		else renderer.view = "full";
	}
	if(compiled_options && compiled_options.facets){
		renderer.facets = compiled_options.facets;
	}
	else {
		renderer.facets = renderer.getDefaultFacets();
	}
	if(compiled_options && compiled_options.facet && typeof renderer.facets[compiled_options.facet] == "object"){
		renderer.facet = compiled_options.facet;
	}	
	else {
		var deffacet = renderer.getDefaultFacet();
		if(typeof renderer.facets[deffacet] == "object"){
			renderer.facet = deffacet;
		}
		else {
			renderer.facet = key(renderer.facets);
		}
	}
	if(compiled_options && compiled_options.hide_disabled_buttons){
		renderer.hide_disabled_buttons = compiled_options.hide_disabled_buttons;
	}
	else if(renderer.parent) renderer.hide_disabled_buttons = parent.hide_disabled_buttons;
	else renderer.hide_disabled_buttons = true;
	
	if(compiled_options && typeof compiled_options.features == "object"){
		renderer.features = compiled_options.features;
	}
	else {
		renderer.features = renderer.facets[renderer.facet].features;
		//renderer.features = renderer.getDefaultFeatures(renderer.facet);
	}
	if(compiled_options && typeof compiled_options.controls == "object"){
		renderer.controls = compiled_options.controls;
	}
	else {
		renderer.controls = renderer.facets[renderer.facet].controls;
		//renderer.controls = renderer.getDefaultControls();
	}
	if(compiled_options && typeof compiled_options.viewerType != "undefined"){
		renderer.viewerType = compiled_options.viewerType;
		if(compiled_options.viewerOptions)
			renderer.viewerOptions = compiled_options.viewerOptions;
	}
	if(compiled_options && typeof compiled_options.header != "undefined"){}
	else {
		renderer.header_viewer = new ObjectViewer.HTMLObjectHeaderViewer();
	}
	if(compiled_options && typeof compiled_options.filter != "undefined"){}
	else {}
	if(compiled_options && typeof compiled_options.sort != "undefined"){}
	else {}
	return options;
}	

RenderingMap.compileOptions = function(options, renderer){
	var compiled_options = {};
	var rules = [];
	for(var key in options){
		if(key != "rules"){
			compiled_options[key] = options[key];
		}
	}
	if(options.rules){
		for(var i = 0; i<options.rules.length; i++){
			var match = (!options.rules[i].pattern || this.patternMatchesRenderer(options.rules[i].pattern, renderer));
			if(match && options.rules[i].output){
				for(var k in options.rules[i].output){
					compiled_options[k] = options.rules[i].output[k];
				}
			}
		}
	}
	return compiled_options;
}

FramePattern = function(pattern){
	this.renderer = (pattern.renderer ? pattern.renderer : false);
	this.label = (pattern.value ? pattern.value : false);
	this.frame_type = (pattern.frame_type ? pattern.frame_type : false);
	this.subject = (pattern.subject ? pattern.subject : false);
	this.subjectClass = (pattern.subjectClass ? pattern.subjectClass : false);
	this.range = (pattern.range ? pattern.range : false);
	this.property = (pattern.property ? pattern.property : false);
	this.value = (pattern.value ? pattern.value : false);
	this.parent = (pattern.parent ? new FramePattern(pattern.parent) : false);
	this.children = [];
	if(pattern.children){
		for(var i = 0 ; i < pattern.children.length ; i++){
			this.children.push(new FramePattern(pattern.children[i]));
		}
	}
	this.depth = (typeof pattern.depth != "undefined" ? pattern.depth : false);
	this.index = (pattern.index ? pattern.index : false);
	this.status = (pattern.status ? pattern.status : false);
}

FramePattern.prototype.checkRenderer = function(renderer){
	var rtype = this.getRendererType(renderer);
	if(!rtype) return false;
	if(this.renderer && this.renderer != rtype) return false;
	if(this.illegalRuleType(rtype)) return false;
	if(this.frame_type && !this.checkFrameType(rtype, renderer)) return false;
	if(this.label && !this.checkLabel(rtype, renderer)) return false;
	if(this.subject && !this.checkSubject(rtype, renderer)) return false;
	if(this.subjectClass && !this.checkSubjectClass(rtype, renderer)) return false;
	if(this.property && !this.checkProperty(rtype, renderer)) return false;
	if(this.depth !== false && !this.checkDepth(rtype, renderer)) return false;
	if(this.range && !this.checkRange(rtype, renderer)) return false;
	if(this.value && !this.checkValue(rtype, renderer)) return false;
	if(this.parent && !this.checkParent(rtype, renderer)) return false;
	if(this.children && this.children.length && !this.checkChildren(rtype, renderer)) return false;
	if(this.index && !this.checkIndex(rtype, renderer)) return false;
	if(this.status && !this.checkStatus(rtype, renderer)) return false;
	return true;
} 

FramePattern.prototype.illegalRuleType = function(rtype){
	if(rtype == 'value' && (this.children.length || this.label)) return true;
	if(rtype == 'object' && this.range ) return true;
	return false;
}

/* subject is an id or an array of ids, 
/* match is positive if the renderer's subject appears in the array or is the id
 */
FramePattern.prototype.checkSubject = function(subject, renderer){
	if(typeof this.subject != "object" || !this.subject.length) this.subject = [this.subject];
	var rsubj = renderer.subject();
	for(var i = 0 ; i<this.subject.length; i++){
		if(this.IDsMatch(subject[i], rsubj)){
			return true;
		}
	}
	return false;
}

//at least one child must match all child rules
FramePattern.prototype.checkChildren = function(rtype, renderer){
	for(var i = 0 ; i<this.children.length; i++){
		var found = false;
		if(rtype == "object"){
			for(var prop in renderer.properties){
				if(this.children[i].checkRenderer(renderer.properties[prop])) {
					found = true;
					continue;
				}
			}
		}
		else if(rtype == "property"){
			for(var j = 0; j <= renderer.values.length; j++){
				if(this.children[j].checkRenderer(renderer.values[j])) {
					found = true;
					continue;
				}
			}
		}
		if(!found) return false;
	}
	return true;
}

FramePattern.prototype.checkStatus = function(rtype, renderer){
	if(typeof this.status != "object" || this.status.length == 0) this.status = [this.status];
	for(var i = 0; i<this.status.length; i++){
		if(this.status[i] == "updated" && !renderer.isUpdated()) return false;
		if(this.status[i] == "new" && !renderer.isNew()) return false;
		if(this.status[i] == "unchanged" && renderer.isUpdated()) return false;
	}
	return true;
}

FramePattern.prototype.checkDepth = function(rtype, renderer){
	return this.numberMatch(this.depth, renderer.depth());
}

FramePattern.prototype.checkParent = function(rtype, renderer){
	return this.parent.checkRenderer(renderer.parent);
}

FramePattern.prototype.checkIndex = function(rtype, renderer){
	if(rtype == 'value'){
		return this.index == renderer.index;
	}
	return false;
}

FramePattern.prototype.checkProperty  = function(rtype, renderer){
	if(typeof this.property != "object" || !this.property.length) this.property = [this.property];
	for(var i = 0 ; i<this.property.length; i++){
		if(this.propertyIDsMatch(renderer.property(), this.property[i])){
			return true;
		}
	}
	return false;
}

//returns true if any of the values are found
FramePattern.prototype.checkValue = function(rtype, renderer){
	if(typeof this.value != "object" || !this.value.length) this.value = [this.value];
	for(var i = 0 ; i<this.value.length; i++){
		if(rtype == "value"){
			if(this.valuesMatch(renderer.value(), this.value[i])){
				return true;
			}
		}
		else if(rtype == "property"){
			for(var j = 0; j<= renderer.values.length;  j++){
				if(this.getRendererType(renderer.values[i]) == 'value' &&
						this.valuesMatch(renderer.values[i].value(), this.value[i])){
					return true;
				}
			}
		}
		else if(rtype == "object"){
			for(var prop in renderer.properties){
				if(this.checkValue(this.getRendererType(renderer.properties[prop]), renderer.properties[prop])){
					return true;
				}
			}
		}
	}
	return false;
}

FramePattern.prototype.checkRange  = function(rtype, renderer){
	if(typeof this.range != "object" || !this.range.length) this.range = [this.range];
	for(var i = 0 ; i<this.range.length; i++){
		if(this.rangeIDsMatch(renderer.range(), this.range[i])){ 
			return true;
		}
	}
	return false;
}

FramePattern.prototype.checkSubjectClass = function(rtype, renderer){
	if(typeof this.subjectClass != "object" || !this.subjectClass.length) this.subjectClass = [this.subjectClass];
	var rcls = renderer.subjectClass();
	for(var i = 0 ; i<this.subjectClass.length; i++){
		if(this.classIDsMatch(this.subjectClass[i], rcls)){
			return true;
		}
	}
	return false;
}

FramePattern.prototype.checkFrameType = function (rtype, renderer){
	if(rtype == "object") return this.frame_type == "object";
	if(rtype == "value") {
		if(renderer.frame){
			return this.frame_type == renderer.frame.ftype();
		}
		else {
			alert(JSON.stringify(renderer));
			alert("No frame");
		}
	}
	if(rtype == "property") return false;
}

FramePattern.prototype.checkLabel = function(rtype, renderer){
	if(typeof renderder.getLabel != "function"){
		console.log(new Error("Rule passed to check label with broken renderer object - no getLabel"));
		return false;
	}
	return this.stringMatch(this.label, renderer.getLabel());
}

FramePattern.prototype.IDsMatch = function(ida, idb){
	return FrameHelper.compareIDs(ida, idb);
}

FramePattern.prototype.classIDsMatch = function(ida, idb){
	return this.IDsMatch(ida, idb);
}
FramePattern.prototype.propertyIDsMatch = function(ida, idb){
	var match = this.IDsMatch(ida, idb);
	return match;
}
FramePattern.prototype.rangeIDsMatch = function(ida, idb){
	return this.IDsMatch(ida, idb);
}
FramePattern.prototype.valuesMatch = function(vala, valb){
	return vala == valb;
}
FramePattern.prototype.numberMatch = function(vala, valb){
	if(typeof vala == "string"){
		try {
			return eval(valb + vala);
		}
		catch(e){
			return false;
		}
	}
	return vala === valb;
}

FramePattern.prototype.stringMatch = function(vala, valb){
	var pat = new RegExp(vala);
	return pat.test(valb);
}

FramePattern.prototype.getRendererType = function(renderer){
	if(renderer.constructor.name == "ValueRenderer") return "value";
	if(renderer.constructor.name == "PropertyRenderer") return "property";
	if(renderer.constructor.name == "ObjectRenderer") return "object";
	console.log(new Error("frame configuration passed non-renderer type: " + renderer.constructor.name));
	return false;
}

module.exports=RenderingMap
