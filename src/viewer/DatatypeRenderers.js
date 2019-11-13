/*
 * Maintains a list of renderers that are available for rendering 
 * datatype values - also covers choice values and id values
 */

function DatatypeRenderers(options){
	this.registeredDataViewers = {},
	this.registeredDataEditors = {},
	this.defaultViewers = {};
	this.defaultEditors = {};
	if(options) this.options(options);
	//links to other documents, choices, id field, id fields of contained objects, ids of structural elements: properties, etc
	this.specials = ['document', 'oneOf', 'id', 'contained', 'structural'];
}

DatatypeRenderers.prototype.options = function (options){
	this.universalViewer = (options && options.universalViewer ? options.universalViewer : false);
	this.universalEditor = (options && options.universalEditor ? options.universalEditor : false);
	this.editor = (options && options.editor ? options.editor : false);
}

DatatypeRenderers.prototype.getValidDataViewerList = function(datatype){
	let valids = [];
	if(datatype && typeof this.registeredDataViewers[datatype] != "undefined"){
		valids = valids.concat(this.registeredDataViewers[datatype]);
	}
	if(this.universalViewer && valids.indexOf(this.universalViewer) == -1){
		valids.push(this.universalViewer);
	}
	return valids;
};

DatatypeRenderers.prototype.getValidDataEditorList = function(datatype){
	let valids = [];
	if(datatype && typeof this.registeredDataEditors[datatype] != "undefined"){
		var nftypes = this.registeredDataEditors[datatype];
		if(nftypes){
			for(var i = 0; i<nftypes.length; i++){
				if(valids.indexOf(nftypes[i]) == -1) valids.push(nftypes[i]);
			}
		}
	}
	if(typeof this.registeredDataEditors[datatype] != "undefined"){
		valids = valids.concat(this.registeredDataEditors[datatype]);
	}
	if(this.universalEditor && valids.indexOf(this.universalEditor) == -1){
		valids.push(this.universalEditor);
	}
	return valids;
}

DatatypeRenderers.prototype.getEditorForDataFrame = function(datatype){
	var vals = this.getValidDataEditorList(datatype);
	if(this.defaultEditors[datatype] && vals[this.defaultEditors[datatype]]){
		return vals[this.defaultEditors[datatype]];
	}
	//last added is default if no explicit default is set
	if(vals){
		return vals[Object.keys(vals)[0]];
	}
}

DatatypeRenderers.prototype.getViewerForDataFrame = function(datatype){
	var vals = this.getValidDataViewerList(datatype);
	if(this.defaultViewers[datatype] && vals[this.defaultViewers[datatype]]){
		return vals[this.defaultViewers[datatype]];
	}
	if(vals){
		return vals[Object.keys(vals)[0]];
	}
}

DatatypeRenderers.prototype.registerViewerForTypes = function(viewer, record, types){
	for(var i = 0; i < types.length; i++){
		if(typeof this.registeredDataViewers[types[i]] == "undefined"){
			this.registeredDataViewers[types[i]] = {};
		}
		if(!this.registeredDataViewers[types[i]][viewer]){
			this.registeredDataViewers[types[i]][viewer] = record;
		}
	}
}

DatatypeRenderers.prototype.registerEditorForTypes = function(viewer, record, types){
	for(var i = 0; i < types.length; i++){
		if(typeof this.registeredDataEditors[types[i]] == "undefined"){
			this.registeredDataEditors[types[i]] = {};
		}
		if(!this.registeredDataEditors[types[i]][viewer]){
			this.registeredDataEditors[types[i]][viewer] = record;
		}			
	}
}

DatatypeRenderers.prototype.getRenderer = function(type, value){
	var r = {};
	let v = this.getViewerForDataFrame(type);
	if(v){
		r.name = Object.keys(v)[0];
		if(v[r.name].label){
			r.label = v[r.name].label;
		}
		if(v[r.name].args){
			r.args = v[r.name].args;
		}
		return r;
	}
	return false;
}


function DataValueRenderer(){
	return this;
}

DataValueRenderer.prototype.type = function(ntype){
	if(ntype) {
		this.datatype = ntype; 
		return this;
	}
	return this.datatype;
}

DataValueRenderer.prototype.row = function(key, binding, rownum){
	if(key && binding){
		this.datarow = [key, binding, rownum];
		return this;
	}
	return this.datarow;
}

DataValueRenderer.prototype.binding = function(key){
	if(key && this.datarow && this.datarow[1] && this.datarow[1][key]){
		if(typeof this.datarow[1][key] == "object"){
			return this.datarow[1][key]["@value"];
		}
		if(this.datarow[1][key] != "unknown") return this.datarow[1][key];
	}
}


DataValueRenderer.prototype.frame = function(frame){
	if(frame){
		this.dataframe = frame;
		return this;
	}
	return this.dataframe;
}

DataValueRenderer.prototype.value = function(nvalue){
	if(nvalue) {
		this.datavalue = nvalue; 
		return this;
	}
	return this.datavalue;
}

DataValueRenderer.prototype.annotateValue = function(value, annotations){
	var dom = document.createElement("span");
	dom.appendChild(document.createTextNode(value));
	var tit = "";
	for(var i in annotations){
		if(annotations[i]){
			tit += i + ": " + annotations[i] + "\n";
		}
	}
	dom.setAttribute("title", tit);
	return dom;
}

DataValueRenderer.prototype.id = function(value){
	this.datavalue = value;
	var idtype = false;
	if(value.indexOf(":") == -1){
		idtype = "link";
	}
	else {
		if(value.split(":")[0] == "doc"){
			if(value.split(":")[0].indexOf("/") == -1){
				idtype = "document";
			}
			else {
				idtype = "contained";
			}
		}
		else {
			idtype = "structural";
		}
	}
	this.idtype = idtype;
	return this;
}

DataValueRenderer.prototype.setRenderer = function(renderer){
	this.renderer = renderer;
	return this;
}

DataValueRenderer.prototype.get = function(options){
	if(this.renderer.renderValue){
		return this.renderer.renderValue(this);
	}
	else if(typeof this.renderer == "function"){
		return this.renderer(this);
	}
}

module.exports=DatatypeRenderers;


