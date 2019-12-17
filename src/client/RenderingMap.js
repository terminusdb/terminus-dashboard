const ObjectViewer= require("../html/document/ObjectViewer")
const HTMLStringViewer = require('../html/datatypes/String');
const HTMLStringEditor = require('../html/datatypes/StringEditor');
const HTMLBooleanViewer = require('../html/datatypes/Boolean');
const HTMLBooleanEditor = require('../html/datatypes/BooleanEditor');
const HTMLChoiceViewer = require('../html/datatypes/Choice');
const HTMLChoiceEditor = require('../html/datatypes/ChoiceEditor');
const HTMLCoordinateViewer = require('../html/datatypes/Coordinate');
const HTMLCoordinateEditor = require('../html/datatypes/CoordinateEditor');
const HTMLDateViewer = require('../html/datatypes/Date');
const HTMLDateEditor = require('../html/datatypes/DateEditor');
const HTMLEntityViewer = require('../html/datatypes/Entity');
const HTMLEntityEditor = require('../html/datatypes/EntityEditor');
const HTMLImageViewer = require('../html/datatypes/Image');
const HTMLImageEditor = require('../html/datatypes/ImageEditor');
const HTMLLinkViewer = require('../html/datatypes/Link');
const HTMLNumberViewer = require('../html/datatypes/Number');
const HTMLRangeViewer = require('../html/datatypes/Range');
const HTMLRangeEditor = require('../html/datatypes/RangeEditor');
//const SantizedHTMLViewer = require('../html/datatypes/SanitizedHTML');
const GoogleMapEditor = require('../html/datatypes/GoogleMapEditor');
const GoogleMapViewer = require('../html/datatypes/GoogleMapViewer');
const HTMLMarkupEditor = require('../html/datatypes/HTMLMarkupEditor');
const S2EntityEditor = require('../html/datatypes/S2EntityEditor');
const TerminusClient = require('@terminusdb/terminus-client');

let RenderingMap = {
	registeredDataViewers: {},
	registeredDataEditors: {},
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
	getViewer: function(type, options, datatype){
		var vi = this.renderers[type];
		options = (options ? options: {});
		try {
			var viewer = eval("new " + type + "." + type + "(" + JSON.stringify(options) + ")");
			if(datatype) viewer.type = datatype;
			return viewer;
		}
		catch(e){
			alert("failed on create " + e.toString());
		}
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
	renderers: {
		HTMLStringViewer: { label: "String Viewer"},
		HTMLStringEditor: { label: "String Editor"},
	}
}

RenderingMap.addPlugin = function(plugin){
	if(plugin == "gmaps"){
		this.registerEditorForTypes("GoogleMapEditor", "Google Map Editor", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
		this.registerViewerForTypes("GoogleMapViewer", "Google Map Editor", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
	}
	if(plugin == "quill"){
		this.registerEditorForTypes("HTMLMarkupEditor", "Quill WYSIWIG HTML Editor", ["xdd:html"]);
	}
	if(plugin == "select2"){
		RenderingMap.registerEditorForFrameType("S2EntityEditor", "S2 Autocomplete Selector", "document");
	}
	if(plugin == "jsoneditor"){
		RenderingMap.registerEditorForFrameType("S2EntityEditor", "S2 Autocomplete Selector", "document");
	}
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
	/*if(options.rules){
		for(var i = 0; i<options.rules.length; i++){
			var match = (!options.rules[i].pattern || this.patternMatchesRenderer(options.rules[i].pattern, renderer));
			if(match && options.rules[i].output){
				for(var k in options.rules[i].output){
					compiled_options[k] = options.rules[i].output[k];
				}
			}
		}
	} */
	return compiled_options;
}

RenderingMap.registerViewerForTypes("HTMLBooleanViewer", "Checkbox Viewer", ["xsd:boolean"]);
RenderingMap.registerEditorForTypes("HTMLBooleanEditor", "Checkbox Editor", ["xsd:boolean"]);
RenderingMap.registerViewerForFrameType("HTMLChoiceViewer", "Choice Viewer", "oneOf");
RenderingMap.registerEditorForFrameType("HTMLChoiceEditor", "Choice Selector", "oneOf");
RenderingMap.registerViewerForTypes("HTMLCoordinateViewer", "Coordinate Viewer", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
RenderingMap.registerEditorForTypes("HTMLCoordinateEditor", "Coordinate Editor", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
RenderingMap.registerViewerForTypes("HTMLDateViewer", "Date Viewer", ["xsd:time", "xsd:date", "xsd:dateTime", "xsd:gYear",
	"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);
RenderingMap.registerEditorForTypes("HTMLDateEditor", "Date Editor", ["xsd:time", "xsd:date", "xsd:dateRange" ,"xsd:dateTime", "xsd:gYear",
	"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);
RenderingMap.registerViewerForFrameType("HTMLEntityViewer", "Document Viewer", "document");
RenderingMap.registerEditorForFrameType("HTMLEntityEditor", "Document Selector", "document");
RenderingMap.registerViewerForTypes("HTMLImageViewer", "Image Viewer", ["xdd:url", "xsd:anyURI", "xsd:base64Binary"]);
RenderingMap.registerEditorForTypes("HTMLImageEditor", "Image Editor", ["xsd:base64Binary"]);
RenderingMap.registerViewerForTypes("HTMLImageViewer", "Image Viewer", ["xdd:url", "xsd:anyURI", "xsd:base64Binary"]);
RenderingMap.registerEditorForTypes("HTMLImageEditor", "Image Editor", ["xsd:base64Binary"]);
RenderingMap.registerViewerForTypes("HTMLLinkViewer", "Link Viewer", ["xdd:url", "xsd:anyURI"]);
RenderingMap.registerViewerForTypes("HTMLNumberViewer", "Number with commas",
		["xsd:decimal", "xsd:double", "xsd:float", "xsd:short", "xsd:integer", "xsd:long",
			"xsd:nonNegativeInteger", "xsd:positiveInteger", "xsd:negativeInteger", "xsd:nonPositiveInteger"]);
RenderingMap.registerViewerForTypes("HTMLRangeViewer", "Range Viewer", ["xdd:gYearRange", "xdd:dateRange", "xdd:integerRange", "xdd:decimalRange"]);
RenderingMap.registerEditorForTypes("HTMLRangeEditor", "Range Editor", ["xdd:gYearRange", "xdd:dateRange", "xdd:integerRange", "xdd:decimalRange"]);
//RenderingMap.registerViewerForTypes("SantizedHTMLViewer", "Sanitized HTML", ["xsd:string", "xdd:html"]);

module.exports=RenderingMap
