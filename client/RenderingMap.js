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
	this.css = ((options && options.css) ? "terminus-literal-value " + options.css : "terminus-literal-value");
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
	this.css = ((options && options.css) ? "terminus-literal-value " + options.css : "terminus-literal-value");
	this.options = options; 
}

HTMLStringEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var big = ((this.options && typeof this.options.big != "undefined") ? this.options.big : this.isBigType(ty, value));
	if(big){
		var input = document.createElement("textarea");
		this.css += " terminus-literal-big-value";		
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



