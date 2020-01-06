/*
 * Maintains a list of renderers that are available for rendering 
 * datatype values - also covers choice values and id values
 */

function DatatypeRenderers(options){
	this.registeredDataViewers = {},
	this.registeredDataEditors = {},
	this.defaultViewers = {};
	this.defaultEditors = {};
	this.universalViewer = false;
	this.universalEditor = false;
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
	else {
		if(this.universalEditor) return this.universalEditor;
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
	else {
		if(this.universalViewer) return this.universalViewer;
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
		if(typeof v == "object"){
			r.name = Object.keys(v)[0];
			if(v[r.name].label){
				r.label = v[r.name].label;
			}
			if(v[r.name].args){
				r.args = v[r.name].args;
			}
		}
		else {
			r.name = v;
		}
		return r;
	}
	return false;
}

DatatypeRenderers.prototype.getEditor = function(type, value){
	var r = {};
	let v = this.getEditorForDataFrame(type);
	if(v){
		if(typeof v == "object"){
			r.name = Object.keys(v)[0];
			if(v[r.name].label){
				r.label = v[r.name].label;
			}
			if(v[r.name].args){
				r.args = v[r.name].args;
			}
		}
		else {
			r.name = v;
		}
		return r;
	}
	return false;
}


module.exports=DatatypeRenderers;


