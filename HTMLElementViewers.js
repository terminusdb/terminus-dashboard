let RenderingMap = {
	registeredViewers: {},
	registeredEditors: {},
	
	getValidViewerList: function(type, frametype){
		var valids = ['HTMLStringViewer'];
		if(frametype && typeof this.registeredViewers[frametype] != "undefined"){
			valids = valids.concat(this.registeredViewers[frametype]);
		}
		if(typeof this.registeredViewers[type] != "undefined"){
			valids = valids.concat(this.registeredViewers[type]);
		}
		return valids;
	},
	getValidEditorList: function(type, frametype){
		var valids = ['HTMLStringEditor'];
		if(frametype && typeof this.registeredEditors[frametype] != "undefined"){
			var nftypes = this.registeredEditors[frametype];
			if(nftypes){
				for(var i = 0; i<nftypes.length; i++){
					if(valids.indexOf(nftypes[i]) == -1) valids.push(nftypes[i]);
				}
			}
		}
		if(typeof this.registeredEditors[type] != "undefined"){
			valids = valids.concat(this.registeredEditors[type]);
		}
		return valids;
	},
	getViewer: function(type, options){
		var vi = this.renderers[type];
		options = (options ? options: {});
		try {
			var viewer = eval("new " + type + "(" + JSON.stringify(options) + ")");	
			return viewer;
		}
		catch(e){
			alert(e.toString());
		}
	},
	getAvailableViewers: function(type, frametype){
		var viewers = [];
		var nviewers = []
		var opts = this.getValidViewerList(type, frametype);
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
	getAvailableEditors: function(type, frametype){
		var viewers = [];
		var nviewers = []
		var opts = this.getValidEditorList(type, frametype);
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
	getViewerForFrame: function(type, frametype){
		var vals = this.getValidViewerList(type, frametype);
		return vals[vals.length-1];
	},
	getEditorForFrame: function(type, frametype){
		var vals = this.getValidEditorList(type, frametype);
		return vals[vals.length-1];
	},
	registerViewerForTypes: function(viewer, label, types){
		for(var i = 0; i < types.length; i++){
			if(typeof this.registeredViewers[types[i]] == "undefined"){
				this.registeredViewers[types[i]] = [];
			}
			if(this.registeredViewers[types[i]].indexOf(viewer) == -1){
				this.registeredViewers[types[i]].push(viewer);
				this.renderers[viewer] = {label: label};
			}
		}
	},
	registerEditorForTypes: function(viewer, label, types){
		for(var i = 0; i < types.length; i++){
			if(typeof this.registeredEditors[types[i]] == "undefined"){
				this.registeredEditors[types[i]] = [];
			}
			if(this.registeredEditors[types[i]].indexOf(viewer) == -1){
				this.registeredEditors[types[i]].push(viewer);
				this.renderers[viewer] = {label: label};
			}
			else {
				alert("already have " + viewer);
			}
		}
	},
	registerEditorForFrameType: function(viewer, label, frametype){
		this.renderers[viewer] = {label: label};
		if(typeof this.registeredEditors[frametype] == "undefined") this.registeredEditors[frametype] = [];
		if(this.registeredEditors[frametype].indexOf(viewer) == -1){
			this.registeredEditors[frametype].push(viewer);
		}
	},
	registerViewerForFrameType: function(viewer, label, frametype){
		this.renderers[viewer] = {label: label};
		if(typeof this.registeredViewers[frametype] == "undefined") this.registeredViewers[frametype] = [];
		if(this.registeredViewers[frametype].indexOf(viewer) == -1){
			this.registeredViewers[frametype].push(viewer);
		}
	},
	renderers: {
		HTMLStringViewer: { label: "String Viewer"},
		HTMLStringEditor: { label: "String Editor"}
	}
}

function HTMLStringViewer(options){
	this.size = ((options && options.size) ? options.size : false);
	this.css = ((options && options.css) ? "literal-value " + options.css : "literal-value");
}

HTMLStringViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('data-value', value);
	value = document.createTextNode(value);
	input.appendChild(value);
	return input;
}

function HTMLStringEditor(options){
	this.css = ((options && options.css) ? "literal-value " + options.css : "literal-value");
	this.options = options; 
}

HTMLStringEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var big = ((this.options && typeof this.options.big != "undefined") ? this.options.big : this.isBigType(ty, value));
	if(big){
		var input = document.createElement("textarea");
		this.css += " literal-big-value";		
	}
	else {
		var size = ((this.options && typeof this.options.size != "undefined") ? this.options.size : this.getTypeSize(ty, value));
		var input = document.createElement("input");
		input.setAttribute('type', "text");
		input.setAttribute('size', size);
	}
	input.setAttribute('class', this.css);
	input.value = value;
	var self = this;
	input.addEventListener("input", function(){
		renderer.set(this.value);
	});
	return input;
}

HTMLStringEditor.prototype.isBigType = function(ty, value){
	if(value && value.length && value.length > 100) return true;
	var longs = ["xdd:coordinatePolyline", "xdd:coordinatePolygon", "xsd:base64Binary", "xdd:html", "xdd:json", "rdf:XMLLiteral"];
	if(longs.indexOf(ty) == -1) return false;
	return true;
}

HTMLStringEditor.prototype.getTypeSize = function(ty, value){
	if(value && value.length && value.length > 40) return 80;
	var bigs = ["xdd:url", "xdd:coordinate", "xsd:anyURI"];
	var smalls = ["xsd:gYearMonth", "xdd:gYearRange", "xsd:decimal", "xsd:float", "xsd:time", "xsd:date", 
		"xsd:dateTimeStamp","xsd:gYearMonth", "xsd:gMonthDay", "xsd:duration", "xsd:yearMonthDuration", "xsd:dayTimeDuration", 
		"xsd:nonNegativeInteger", "xsd:positiveInteger", "xsd:negativeInteger",	"xsd:nonPositiveInteger", "xsd:integer","xsd:unsignedInt"];
	var tinys = ["xsd:boolean", "xsd:gYear", "xsd:gMonth", "xsd:gDay", "xsd:byte", "xsd:short", "xsd:unsignedByte", "xsd:language"];
	if(bigs.indexOf(ty) != -1) return 80;
	if(smalls.indexOf(ty) != -1) return 16;
	if(tinys.indexOf(ty) != -1) return 8;
	return 32;
}

function SantizedHTMLViewer(options){
	this.css = ((options && options.css) ? "literal-value " + options.css : "literal-value");
}

SantizedHTMLViewer.prototype.getDOM = function(renderer, dataviewer){
	var val = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('data-value', val);
	input.innerHTML = val;
	return input;
}

function HTMLChoiceViewer(options){};

HTMLChoiceViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "literal-value choice-value");
	input.setAttribute('data-value', value);
	if(value){
		var els = renderer.frame.frame.elements;
		for(var i = 0; i<els.length; i++){
			if(els[i].class == value){
				if(els[i].label && els[i].label.data){
					input.appendChild(document.createTextNode(els[i].label.data));
				}
				else {
					input.appendChild(FrameHelper.labelFromURL(value));					
				}
				continue;
			}				
		}
	}
	return input;
}

function HTMLChoiceEditor(options){};

HTMLChoiceEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var optInput = document.createElement("select");
	optInput.setAttribute('class', "choice-picker");
	var foptions = renderer.frame.getChoiceOptions();
	foptions.unshift({ value: "", label: "Not Specified"});
	var callback = function(val){
		renderer.set(val);
	}
	var sel = HTMLFrameHelper.getSelectionControl("select-choice", foptions, value, callback);
	return sel;
}

RenderingMap.registerViewerForTypes("SantizedHTMLViewer", "Sanitized HTML", ["xsd:string", "xdd:html"]);
RenderingMap.registerViewerForFrameType("HTMLChoiceViewer", "Choice Viewer", "oneOf");
RenderingMap.registerEditorForFrameType("HTMLChoiceEditor", "Choice Selector", "oneOf");


function HTMLNumberViewer(options){
	this.commas = (options && options.commas ? options.commas : true);
}

HTMLNumberViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	if(value === 0) value = "0";
	var input = document.createElement("span");
	input.setAttribute('class', 'number-value literal-value');
	input.setAttribute('data-value', value);
	value = (this.commas ? FrameHelper.numberWithCommas(value) : value);
	input.appendChild(document.createTextNode(value));
	return input;
}

RenderingMap.registerViewerForTypes("HTMLNumberViewer", "Number with commas", 
		["xsd:decimal", "xsd:double", "xsd:float", "xsd:short", "xsd:integer", "xsd:long", 
			"xsd:nonNegativeInteger", "xsd:positiveInteger", "xsd:negativeInteger", "xsd:nonPositiveInteger"]);

function HTMLRangeViewer(options){
	this.commas = (options && options.commas ? options.commas : true);
	this.css = ((options && options.css) ? "literal-value literal-value-range " + options.css : "literal-value literal-value-range");
	this.delimiter = (options && options.delimiter ? options.delimiter : false);
}

HTMLRangeViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var vals = FrameHelper.parseRangeValue(value, this.delimiter);
	var d = document.createElement("span");
	d.setAttribute("class", this.css);
	var rvals = document.createElement("span");
	rvals.setAttribute("class", "range-value-left");
	var svals = document.createElement("span");
	svals.setAttribute("class", "range-value-right");
	var x = (this.commas ? FrameHelper.numberWithCommas(vals[0]) : vals[0]);
	var tnode = document.createTextNode(x);
	rvals.appendChild(tnode);
	d.appendChild(rvals);	
	if(vals.length == 2){
		d.appendChild(getRangeSymbolDOM());
		var x2 = (this.commas ? FrameHelper.numberWithCommas(vals[1]) : vals[1]);
		var t2node = document.createTextNode(x2);
		svals.appendChild(t2node);
		d.appendChild(svals);	
	}
	return d;
}

function getRangeSymbolDOM(){
	var d = document.createElement("span");
	d.setAttribute("class", "range-indicator");
	d.setAttribute("title", "The value is uncertain, it lies somewhere in this range");
	d.appendChild(document.createTextNode(" ... "));
	return d;
}

function HTMLRangeEditor(options){
	this.commas = (options && options.commas ? options.commas : true);
	this.css = ((options && options.css) ? "literal-value-range " + options.css : "literal-value-range");
	this.delimiter = (options && options.delimiter ? options.delimiter : false);
}

HTMLRangeEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var vals = FrameHelper.parseRangeValue(value, this.delimiter);
	var d = document.createElement("span");
	d.setAttribute("class", this.css);
	var rvals = document.createElement("span");
	var svals = document.createElement("span");
	var data1 = (vals.length > 0 ? vals[0] : "");
	var data2 = (vals.length > 1 ? vals[1] : "");
	var firstip = document.createElement("input");
	firstip.setAttribute('type', "text");
	firstip.setAttribute('size', 16);
	if(data1){
		firstip.value = data1;
	}
	var secondip = document.createElement("input");
	secondip.setAttribute('type', "text");
	secondip.setAttribute('size', 16);
	if(data2){
		this.showing_range = true;
		secondip.value = data2;
	}
	rvals.appendChild(firstip);
	d.appendChild(rvals);	
	if(this.showing_range){
		svals.appendChild(getRangeSymbolDOM());
		svals.appendChild(secondip);
	}
	d.appendChild(svals);	
	var but = document.createElement("button");
	but.setAttribute("class", "change-range");
	var txt = this.showing_range ? "Change to Simple Value" : "Change to Uncertain Range";
	but.appendChild(document.createTextNode(txt));
	d.appendChild(but);	
	var self = this;
	but.addEventListener("click", function(){
		if(self.showing_range){
			self.showing_range = false;
			secondip.value = "";				
			FrameHelper.removeChildren(svals);
		}
		else {
			self.showing_range = true;
			secondip.value = "";				
			svals.appendChild(getRangeSymbolDOM());
			svals.appendChild(secondip);
		}
		var txt = self.showing_range ? "Change to Simple Value" : "Change to Uncertain Range";
		but.innerText = txt;
		changeHandler();
	});
	var changeHandler = function(){
		if(self.showing_range && secondip.value){
			if(firstip.value) renderer.set("[" + firstip.value + "," + secondip.value + "]");				
			else renderer.set(secondip.value);				
		}
		else {
			renderer.set(firstip.value);
		}
	}
	firstip.addEventListener("change", changeHandler);
	secondip.addEventListener("change", changeHandler);
	return d;
}

RenderingMap.registerViewerForTypes("HTMLRangeViewer", "Range Viewer", ["xdd:integerRange", "xdd:decimalRange"]);
RenderingMap.registerEditorForTypes("HTMLRangeEditor", "Range Editor", ["xdd:integerRange", "xdd:decimalRange"]);

function HTMLLinkViewer(options){
	this.css = ((options && options.css) ? "literal-value literal-link-value "+ options.css : "literal-value literal-link-value");
}

HTMLLinkViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('size', 80);
	input.setAttribute('data-value', value);
	if(value){
		var a = document.createElement("a");
		a.setAttribute('href', value);
		a.appendChild(document.createTextNode(value));
		input.appendChild(a);
	}
	return input;
}

RenderingMap.registerViewerForTypes("HTMLLinkViewer", "Link Viewer", ["xdd:url", "xsd:anyURI"]);

function HTMLBooleanViewer(options){
	this.css = ((options && options.css) ? "literal-value literal-boolean-value "+ options.css : "literal-value literal-boolean-value");
}

HTMLBooleanViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	if(value){
		var vallab = document.createTextNode(value);
		input.appendChild(vallab);
	}
	return input;
}

function HTMLBooleanEditor(options){
	this.css = ((options && options.css) ? "editor-value literal-value literal-boolean-value "+ options.css : "literal-value literal-boolean-value");
}

HTMLBooleanEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("input");
	input.setAttribute('type', "checkbox");
	if(value){
		input.setAttribute("checked", "checked");					
	}
	input.addEventListener("change", function(){
		if(value){
			renderer.set("");
		}
		else {
			renderer.set("true");
		}
	});
	return input;
}

RenderingMap.registerViewerForTypes("HTMLBooleanViewer", "Checkbox Viewer", ["xsd:boolean"]);
RenderingMap.registerEditorForTypes("HTMLBooleanEditor", "Checkbox Editor", ["xsd:boolean"]);

function HTMLDateHelper(){
	this.months = ["January", "Februrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
}

HTMLDateHelper.prototype.getMonthName = function(num){
	return this.months[num-1];
}

function HTMLDateViewer(options){
	this.max = (options && options.max ? options.max : false);
	this.min = (options && options.min ? options.min : false);
	this.allowbce = (options && options.allowbce ? options.allowbce : false);
	this.date_spacer = "/";
	this.time_spacer = ":";
	this.datetime_separator = ", ";
	this.helper = new HTMLDateHelper();
}

HTMLDateViewer.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "literal-value literal-date");
	input.setAttribute('data-value', value);
	if(value){
		var parsed = FrameHelper.parseDate(ty, value);
		var datepart = this.getDateComponentDOM(parsed);
		var timepart = this.getTimeComponentDOM(parsed);
		if(timepart) input.appendChild(timepart);
		if(timepart && datepart) input.appendChild(document.createTextNode(this.datetime_separator));
		if(datepart) input.appendChild(datepart);
	}
	return input;
}

HTMLDateViewer.prototype.getTimeComponentDOM = function(parsed, ty){
	var hdom = (parsed.hour ? document.createElement("span") : false);
	if(hdom){
		hdom.setAttribute("class", "time-hour");
		hdom.appendChild(document.createTextNode(parsed.hour));
	}
	var mdom = (typeof parsed.minute != "undefined" ? document.createElement("span") : false);
	if(mdom){
		mdom.setAttribute("class", "time-minute");
		var mlab = (parsed.minute < 10 ? "0" + parsed.minute : parsed.minute);
		mdom.appendChild(document.createTextNode(mlab));
	}
	var sdom = (typeof parsed.second != "undefined" ? document.createElement("span") : false);
	if(sdom){
		sdom.setAttribute("class", "time-second");
		var slab = (parsed.second < 10 ? "0" + parsed.second : parsed.second);
		sdom.appendChild(document.createTextNode(slab));
	}
	var tz = (parsed.timezone ? document.createElement("span") : false);
	if(tz){
		sdom.setAttribute("class", "time-timezone");
		sdom.appendChild(document.createTextNode(parsed.timezone));
	}
	if(hdom || mdom || sdom || tz){
		var dadom = document.createElement("span");
		dadom.setAttribute("class", "time-components time-"+ty);
		if(hdom) dadom.appendChild(hdom); 
		if(mdom) {
			if(hdom) dadom.appendChild(document.createTextNode(this.time_spacer));
			dadom.appendChild(mdom); 
		}
		if(sdom) {
			if(mdom || hdom) dadom.appendChild(document.createTextNode(this.time_spacer));
			dadom.appendChild(sdom); 
		}
		if(tz){
			dadom.appendChild(document.createTextNode(" (Timezone: ")); 
			dadom.appendChild(sdom); 
			dadom.appendChild(document.createTextNode(")")); 			
		}
		return dadom;
	}
	return false;
}

HTMLDateViewer.prototype.getDateComponentDOM = function(parsed, ty){
	var ydom = (parsed.year ? document.createElement("span") : false);
	if(ydom){
		ydom.setAttribute("class", "date-year");
		ydom.appendChild(document.createTextNode(parsed.year));
	}
	var mdom = (parsed.month ? document.createElement("span") : false);
	if(mdom){
		mdom.setAttribute("class", "date-month");
		mdom.appendChild(document.createTextNode(this.helper.getMonthName(parsed.month)));		
	}
	var ddom = (parsed.day ? document.createElement("span") : false );
	if(ddom){
		ddom.setAttribute("class", "date-day");
		ddom.appendChild(document.createTextNode(parsed.day));		
	}
	if(ydom || mdom || ddom){
		var dadom = document.createElement("span");
		if(ddom) dadom.appendChild(ddom); 
		if(mdom) {
			if(ddom) dadom.appendChild(document.createTextNode(this.date_spacer));
			dadom.appendChild(mdom); 
		}
		if(ydom) {
			if(mdom || ddom) dadom.appendChild(document.createTextNode(this.date_spacer));
			dadom.appendChild(ydom); 
		}
		return dadom;
	}
	return false;
}

function HTMLDateEditor(options){
	this.max = (options && options.max ? options.max : false);
	this.min = (options && options.min ? options.min : false);
	this.allowbce = (options && options.allowbce ? options.allowbce : false);
	this.date_spacer = "/";
	this.time_spacer = ":";
	this.datetime_separator = ", ";
	this.helper = new HTMLDateHelper();
}

HTMLDateEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "literal-value literal-date");
	input.setAttribute('data-value', value);
	if(value){
		this.parsed = FrameHelper.parseDate(ty, value);
	}
	else this.parsed = {};
	var datepart = this.getDateComponentDOM(this.parsed, ty, renderer);
	var timepart = this.getTimeComponentDOM(this.parsed, ty, renderer);
	if(timepart) input.appendChild(timepart);
	if(timepart && datepart) input.appendChild(document.createTextNode(this.datetime_separator));
	if(datepart) input.appendChild(datepart);
	return input;
}

HTMLDateEditor.prototype.set = function(part, val, renderer, ty){
	this.parsed[part] = val;
	var xsd = FrameHelper.xsdFromParsed(this.parsed, ty);
	if(xsd){
		renderer.set(xsd);
	}
}


HTMLDateEditor.prototype.getTimeComponentDOM = function(parsed, ty, renderer){
	
}

HTMLDateEditor.prototype.getDateComponentDOM = function(parsed, ty, renderer){
	var self = this;
	if(["xsd:date", "xsd:dateTime", "xsd:gYear", "xsd:gYearMonth", "xsd:dateTimeStamp"].indexOf(ty) != -1){
		var ydom = document.createElement("input");
		ydom.setAttribute("class", "year-input year-"+ty);
		ydom.setAttribute("size", 6);
		ydom.setAttribute("placeholder", "YYYY");
		ydom.value = (parsed.year ? parsed.year : "");
		ydom.addEventListener("input", function(){
			self.set("year", this.value, renderer, ty);
		})
	}
	if(["xsd:date", "xsd:dateTime", "xsd:gYearMonth", "xsd:dateTimeStamp", "xsd:gMonth", "xsd:gMonthDay"].indexOf(ty) != -1){
		var mdom = document.createElement("select");
		mdom.setAttribute("class", "month-input month-"+ty);
		for(var i = 0; i<this.helper.months.length; i++){
			var opdom = document.createElement("option");
			opdom.value = i+1;
			opdom.appendChild(document.createTextNode(this.helper.months[i]));
			if(parsed.month && parsed.month == i+1){
				opdom.selected = true;
			}
			mdom.appendChild(opdom);
		}
		mdom.addEventListener("change", function(){
			self.set("month", this.value, renderer, ty);
		})
	}	
	if(["xsd:date", "xsd:dateTime", "xsd:dateTimeStamp", "xsd:gMonth", "xsd:gDay", "xsd:gMonthDay"].indexOf(ty) != -1){
		var ddom = document.createElement("input");
		ddom.setAttribute("class", "day-input day-"+ty);
		ddom.setAttribute("size", 2);
		ddom.setAttribute("placeholder", "DD");
		ddom.value = (parsed.day ? parsed.day : "");	
		ddom.addEventListener("input", function(){
			self.set("day", this.value, renderer, ty);
		})
	}	
	if(ydom || mdom || ddom){
		var dadom = document.createElement("span");
		if(ddom) dadom.appendChild(ddom); 
		if(mdom) {
			if(ddom) dadom.appendChild(document.createTextNode(this.date_spacer));
			dadom.appendChild(mdom); 
		}
		if(ydom) {
			if(mdom || ddom) dadom.appendChild(document.createTextNode(this.date_spacer));
			dadom.appendChild(ydom); 
		}
		return dadom;
	}
	return false;
}

RenderingMap.registerViewerForTypes("HTMLDateViewer", "Date Viewer", ["xsd:date", "xsd:dateTime", "xsd:gYear", 
	"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);
RenderingMap.registerEditorForTypes("HTMLDateEditor", "Date Editor", ["xsd:date", "xsd:dateRange" ,"xsd:dateTime", "xsd:gYear", 
	"xsd:gYearRange", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth", "xsd:gMonthDay", "xsd:dateTimeStamp"]);

function HTMLCoordinateViewer(options){
	this.inputs = [];
}

HTMLCoordinateViewer.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "literal-value literal-coordinate");
	input.setAttribute('data-value', value);
	try {
		var parsed = (value ? JSON.parse(value) : false);
	}
	catch(e){
		renderer.badData(ty + " failed to parse as json", e.toString());
		var parsed = false;
		value = false;
	}
	if(value){
		if(ty == "xdd:coordinate"){
			parsed = [parsed];
		}
		for(var i = 0; i < parsed.length; i++){
			var lldom = document.createElement("span");
			lldom.setAttribute("class", "latlong");
			lldom.appendChild(document.createTextNode("Latitude: "));
			lldom.appendChild(document.createTextNode(parsed[i][0] + " °" + " "));
			lldom.appendChild(document.createTextNode("Longitude: "));
			lldom.appendChild(document.createTextNode(parsed[i][1] + " °" ));
			input.appendChild(lldom);
		}
	}
	return input;
}


function HTMLCoordinateEditor(options){
	this.inputs = [];
}

HTMLCoordinateEditor.prototype.getInputDOMs = function(lat, long, change){
	var latdom = document.createElement("input");
	latdom.setAttribute("type", "text");
	latdom.value = lat;
	var longdom = document.createElement("input");
	longdom.setAttribute("type", "text");
	longdom.value = long;
	latdom.addEventListener("change", change);
	longdom.addEventListener("change", change);
	return [latdom, longdom];
}

HTMLCoordinateEditor.prototype.getLatLongDOM = function(lat, long, ty, index, parent){
	var lldom = document.createElement("span");
	lldom.setAttribute("class", "lat-long");
	var firstcol = document.createElement("span");
	firstcol.setAttribute("class", "lat-long-col");
	lldom.appendChild(firstcol);
	if(index > 2 || (ty == "xdd:coordinatePolyline" && index > 1)){
		var delbut = document.createElement("button");
		delbut.setAttribute("class", "delete-coordinate");
		delbut.appendChild(document.createTextNode("Remove"));
		delbut.addEventListener("click", function(){
			long.value = "";
			lat.value = "";
			parent.removeChild(lldom);
		});
		firstcol.appendChild(delbut);
	}
	lldom.appendChild(document.createTextNode("Latitude: "));
	lldom.appendChild(lat);
	lldom.appendChild(document.createTextNode(" °" + " "));
	lldom.appendChild(document.createTextNode("  Longitude: "));
	lldom.appendChild(long);
	lldom.appendChild(document.createTextNode(" ° " ));
	return lldom;
}


HTMLCoordinateEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "literal-value literal-coordinate");
	input.setAttribute('data-value', value);
	try {
		var parsed = (value ? JSON.parse(value) : false);
	}
	catch(e){
		renderer.badData(ty + " failed to parse as json", e.toString());
		var parsed = false;
		value = false;
	}
	var self = this;
	var updateValueFromForm = function(){
		var vals = [];
		for(var i = 0; i<self.inputs.length; i++){
			if(self.inputs[i][0].value && self.inputs[i][1].value){
				var val = "[" + self.inputs[i][0].value + "," + self.inputs[i][1].value + "]";
				vals.push(val);
			}
		}
		if(vals.length == 0){
			renderer.set("");
		}
		else if(ty == "xdd:coordinate"){
			renderer.set(vals[0]);
		}
		else {
			var op = "[";
			for(var i = 0; i<vals.length; i++){
				op += vals[i];
				if(i+1 < vals.length) op += ",";
			}
			op += "]";
			renderer.set(op);
		}
	};
	if(!parsed){
		if(ty == "xdd:coordinate") parsed = ["",""];
		else {
			parsed = [["",""],["",""]];
			if(ty == "xdd:coordinatePolygon") parsed.push(["",""]);
		}
	}
	if(ty == "xdd:coordinate"){
		parsed = [parsed];
	}
	for(var i = 0; i < parsed.length; i++){
		this.inputs.push(this.getInputDOMs(parsed[i][0], parsed[i][1], updateValueFromForm))
	}
	var lldoms = document.createElement("span");
	for(var i = 0; i < this.inputs.length; i++){
		var lldom = this.getLatLongDOM(this.inputs[i][0], this.inputs[i][1], ty, i, lldoms);
		lldoms.appendChild(lldom);
	}
	input.appendChild(lldoms);
	var self = this;
	if(ty != "xdd:coordinate"){
		var butspan = document.createElement("span");
		butspan.setAttribute("class", "add-coordinate")
		var addbut = document.createElement("button");
		addbut.setAttribute("class", "add-coordinate");
		addbut.appendChild(document.createTextNode("Add"));
		addbut.addEventListener("click", function(){
			var ipdoms = self.getInputDOMs("", "", updateValueFromForm);
			var lldom = self.getLatLongDOM(ipdoms[0], ipdoms[1], ty, self.inputs.length, lldoms);
			lldoms.appendChild(lldom);
			self.inputs.push(ipdoms);
		});
		butspan.appendChild(addbut);
		input.appendChild(butspan);			
	}
	return input;
}

RenderingMap.registerViewerForTypes("HTMLCoordinateViewer", "Coordinate Viewer", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
RenderingMap.registerEditorForTypes("HTMLCoordinateEditor", "Coordinate Editor", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);


function HTMLImageViewer(options){
}
HTMLImageViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var input = document.createElement("span");
	input.setAttribute('class', "literal-value literal-image-value");
	input.setAttribute('data-value', value);
	if(value){
		var img = document.createElement("a");
		img.setAttribute('src', value);
		input.appendChild(img);
	}
	return input;
}

function HTMLImageEditor(options){}
HTMLImageEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	if(ty == "xsd:base64Binary"){
		var input = document.createElement("textarea");
		input.setAttribute('class', "literal-value literal-b64image-value");
		input.value = value;
		input.addEventListener("change", function(){
			renderer.set(this.value);
		});
		return input;
	}
	return false;
}

RenderingMap.registerViewerForTypes("HTMLImageViewer", "Image Viewer", ["xdd:url", "xsd:anyURI", "xsd:base64Binary"]);
RenderingMap.registerEditorForTypes("HTMLImageEditor", "Image Editor", ["xsd:base64Binary"]);

function HTMLEntityViewer(options){}
HTMLEntityViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var value = FrameHelper.unshorten(value);
	var holder = document.createElement("span");
	holder.setAttribute("class", "literal-value entity-reference-value");
	var self = this;
	if(this.holder){
		return this.holder;
	}
	if(value){
		var entities = [value];
		var success = function(response){
			var span = dataviewer.internalLink(value)
			span.innerHTML = response;
			span.setAttribute("class", "document-reference-link");
			holder.appendChild(span);
			self.holder = holder;
		}
		renderer.getEntityReference(false, renderer.frame.range, entities)
		.then(success)
		.catch(function(error){
			var span = dataviewer.internalLink(value)
			span.setAttribute("class", "document-reference-link");
			holder.appendChild(span);
			self.holder = holder;
		});
	}
	return holder;
}

function HTMLEntityEditor(options){}
HTMLEntityEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("input");
	input.setAttribute("class", "literal-value entity-reference-value");
	input.setAttribute("type", "text");
	input.value = value;
	var self = this;
	input.addEventListener("change", function(){
		var url = this.value;
		if(url.indexOf("/") == -1){
			url = "document:" + url;
		}
		renderer.set(url);
	});
	return input;
}

RenderingMap.registerViewerForFrameType("HTMLEntityViewer", "Entity Viewer", "entity");
RenderingMap.registerEditorForFrameType("HTMLEntityEditor", "Entity Selector", "entity");


