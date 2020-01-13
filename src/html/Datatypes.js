const HTMLStringViewer = require('./datatypes/String');
const HTMLStringEditor = require('./datatypes/StringEditor');
const HTMLBooleanViewer = require('./datatypes/Boolean');
const HTMLBooleanEditor = require('./datatypes/BooleanEditor');
const HTMLChoiceViewer = require('./datatypes/Choice');
const HTMLChoiceEditor = require('./datatypes/ChoiceEditor');
const HTMLCoordinateViewer = require('./datatypes/Coordinate');
const HTMLCoordinateEditor = require('./datatypes/CoordinateEditor');
const HTMLDateViewer = require('./datatypes/Date');
const HTMLDateEditor = require('./datatypes/DateEditor');
const HTMLEntityViewer = require('./datatypes/Entity');
const HTMLEntityEditor = require('./datatypes/EntityEditor');
const HTMLImageViewer = require('./datatypes/Image');
const HTMLImageEditor = require('./datatypes/ImageEditor');
const HTMLLinkViewer = require('./datatypes/Link');
const HTMLNumberViewer = require('./datatypes/Number');
const HTMLRangeViewer = require('./datatypes/Range');
const HTMLRangeEditor = require('./datatypes/RangeEditor');
const GoogleMapEditor = require('./datatypes/GoogleMapEditor');
const GoogleMapViewer = require('./datatypes/GoogleMapViewer');
const HTMLMarkupEditor = require('./datatypes/HTMLMarkupEditor');
const S2EntityEditor = require('./datatypes/S2EntityEditor');


function initialiseDataRenderers(RenderingMap, plugins, options){
	RenderingMap.registerViewerForTypes("HTMLBooleanViewer", {label: "Checkbox Viewer"}, ["xsd:boolean"]);
	RenderingMap.registerEditorForTypes("HTMLBooleanEditor", {label: "Checkbox Editor"}, ["xsd:boolean"]);
	RenderingMap.registerViewerForTypes("HTMLChoiceViewer", {label: "Choice Viewer"}, ["oneOf"]);
	RenderingMap.registerEditorForTypes("HTMLChoiceEditor", {label: "Choice Selector"}, ["oneOf"]);
	RenderingMap.registerViewerForTypes("HTMLCoordinateViewer", {label: "Coordinate Viewer"}, ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
	RenderingMap.registerEditorForTypes("HTMLCoordinateEditor", {label: "Coordinate Editor"}, ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
	RenderingMap.registerViewerForTypes("HTMLDateViewer", {label: "Date Viewer"}, ["xsd:time", "xsd:date", "xsd:dateTime", "xsd:gYear", 
		"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);
	RenderingMap.registerEditorForTypes("HTMLDateEditor", {label: "Date Editor"}, ["xsd:time", "xsd:date", "xsd:dateRange" ,"xsd:dateTime", "xsd:gYear", 
		"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);
	
	var hevopts = {label: "Document Viewer"};
	if (options && options["HTMLEntityViewer"]) hevopts.args = options["HTMLEntityViewer"];
	RenderingMap.registerViewerForTypes("HTMLEntityViewer", hevopts, ["document"]);
	RenderingMap.registerEditorForTypes("HTMLEntityEditor", {label: "Document Selector"}, ["document"]);
	RenderingMap.registerViewerForTypes("HTMLImageViewer", {label: "Image Viewer"}, ["xdd:url", "xsd:anyURI", "xsd:base64Binary"]);
	RenderingMap.registerEditorForTypes("HTMLImageEditor", {label: "Image Editor"}, ["xsd:base64Binary"]);
	RenderingMap.registerViewerForTypes("HTMLImageViewer", {label: "Image Viewer"}, ["xdd:url", "xsd:anyURI", "xsd:base64Binary"]);
	RenderingMap.registerEditorForTypes("HTMLImageEditor", {label: "Image Editor"}, ["xsd:base64Binary"]);
	RenderingMap.registerViewerForTypes("HTMLLinkViewer", {label: "Link Viewer"}, ["xdd:url", "xsd:anyURI"]);
	RenderingMap.registerViewerForTypes("HTMLNumberViewer", {label: "Number with commas"}, 
			["xsd:decimal", "xsd:double", "xsd:float", "xsd:short", "xsd:integer", "xsd:long", 
				"xsd:nonNegativeInteger", "xsd:positiveInteger", "xsd:negativeInteger", "xsd:nonPositiveInteger"]);
	RenderingMap.registerViewerForTypes("HTMLRangeViewer", {label: "Range Viewer"}, ["xdd:gYearRange", "xdd:dateRange", "xdd:integerRange", "xdd:decimalRange"]);
	RenderingMap.registerEditorForTypes("HTMLRangeEditor", {label: "Range Editor"}, ["xdd:gYearRange", "xdd:dateRange", "xdd:integerRange", "xdd:decimalRange"]);
	RenderingMap.universalEditor = "HTMLStringEditor";
	RenderingMap.universalViewer = "HTMLStringViewer";
	addPlugins(RenderingMap, plugins);
	RenderingMap.createRenderer = function(type, args){
		let r = createDataRenderer(type, args);
		return r;
	}
}

function createDataRenderer(type, options){
	try {
		var viewer = eval("new " + type + "." + type + "()");
		if(viewer.options) viewer.options(options);
	}
	catch(e){
		return false;
	}
	return viewer;
}

function addPlugins(RenderingMap, plugins){
	if(plugins && plugins.indexOf("gmaps") != -1){
		RenderingMap.registerEditorForTypes("GoogleMapEditor", {label: "Google Map Editor"}, ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
		RenderingMap.registerViewerForTypes("GoogleMapViewer", {label: "Google Map Editor"}, ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
	}
	if(plugins && plugins.indexOf("quill") != -1){
		RenderingMap.registerEditorForTypes("HTMLMarkupEditor", {label: "Quill WYSIWIG HTML Editor"}, ["xdd:html"]);
	}
	if(plugins && plugins.indexOf("select2") != -1){
		RenderingMap.registerEditorForFrameType("S2EntityEditor", {label: "S2 Autocomplete Selector"}, "document");
	}
}

module.exports = {createDataRenderer, initialiseDataRenderers};