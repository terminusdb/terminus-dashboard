const HTMLHelper = require("../HTMLHelper");

function SimpleFrameViewer(){}

SimpleFrameViewer.prototype.getScope = function(frame){
	if(frame.isProperty()) return "property";
	if(frame.isObject()) return "object";
	if(frame.isData()) return "data";
}

SimpleFrameViewer.prototype.setDatatypeViewers = function(datatypes){
	this.datatypes = datatypes;
}


SimpleFrameViewer.prototype.getDatatypeViewer = function(frame, mode){
	var dv = frame.display_options.dataviewer;
	if(!dv){
		if(frame.isChoice()) var t = "oneOf";
		else if(frame.isDocument()) var t = "document";
		else t = frame.getType();
		if(mode && mode == "edit"){
			var r = this.datatypes.getEditor(t);
		}
		else {
			var r = this.datatypes.getRenderer(t);
		}
		dv = r.name;
	}
	if(frame.display_options.args){
		var args = frame.display_options.args ;
	}
	else {
		if(r && r.args){
			 args = r.args;
		}
		else args = false;
	}
	var rend = this.datatypes.createRenderer(dv, args);
	rend.type = frame.getType();
	return rend;
}

SimpleFrameViewer.prototype.render = function(frame){
	if(!frame) frame = this.frame;
	if(!frame) return;

	var scope = this.getScope(frame);
	if(frame.display_options.header_features && frame.display_options.header_features.length){
		var hfeatures = this.getFeaturesDOM(frame.display_options.header_features, scope, frame, frame.display_options.mode);
	}
	else var hfeatures = false;
	if(frame.display_options.features && frame.display_options.features.length){
		var features = this.getFeaturesDOM(frame.display_options.features, scope, frame, frame.display_options.mode);
	}
	else var features = false;
	var orient = (scope == "object" || scope == "property") ? "page" : "line";
	var ndom = HTMLHelper.getFrameDOM(scope, frame, orient, hfeatures, features);
	if(!ndom) return false;
	if(this.framedom){
		this.framedom.replaceWith(ndom);
	}
	this.framedom = ndom;
	if(frame.display_options.style){
		this.framedom.setAttribute("style", frame.display_options.style);				
	}
	return this.framedom;
}	

SimpleFrameViewer.prototype.getFeaturesDOM = function(flist, scope, frame, mode){
	var features = document.createElement("span");
	features.setAttribute("class", "terminus-features terminus-" + scope + "-features features-" + featuresToCSS(flist));
	for(var i = 0; i<flist.length; i++){
		let render = false;
		let style = false;
		let args = false;
		let fid = flist[i];
		if(typeof fid == "object"){
			fid = Object.keys(flist[i])[0];
			if(flist[i][fid].hidden) continue;
			if(flist[i][fid].style) style = flist[i][fid].style;
			if(flist[i][fid].render) render = flist[i][fid].render;
			if(flist[i][fid].args){
				args = flist[i][fid].args;
			} 
		}
		else if(typeof fid != "string") continue;
		if(render){
			var dom = render(frame, fid, scope, mode, args);
			if(style) dom.setAttribute("style", style);
			if(dom)	features.appendChild(dom);
		}
		else if(fid == "value"){
			if(scope == "data"){
				var dv = this.getDatatypeViewer(frame, mode, args);
				if(dv) {
					var dom = dv.renderFrame(frame, this);
				}
				else {
					var dom = document.createTextNode(frame.get());			
				}
				if(dom){
					if(style) dom.setAttribute("style", style);			
					features.appendChild(dom);
				}
			}
			else {
				if(scope == 'object'){
					var vals = frame.renderProperties();
					for(var j = 0; j<vals.length; j++){
						if(style) vals[j].setAttribute("style", style);
						features.appendChild(vals[j]);
					}
				}
				else {
					var vals = frame.renderValues();		    
					var cont = document.createElement("span");
					if(style) cont.setAttribute("style", style);
					for(var j = 0; j<vals.length; j++){
						cont.appendChild(vals[j]);
					}
					features.appendChild(cont);
				}				
			}
		}
		else {
			if(fid == "id" && mode == "edit" && scope == "object" && frame.isNew()){
				var rend = this.datatypes.createRenderer("HTMLStringEditor", args);
				var dom = rend.renderFrame(frame, this);
			}
			else var dom = false;
			var dom = HTMLHelper.getFeatureDOM(frame, fid, scope, mode, args, dom);
			if(dom){
				if(style) dom.setAttribute("style", style);			
				features.appendChild(dom);
			}
		}
	}
	return features;
}					
	

function featuresToCSS(flist){
	var s = "";
	for(var i = 0; i<flist.length; i++){
		if(typeof flist[i] == "object"){
			s += Object.keys(flist[i])[0] + "-";
		}
		else {
			s += flist[i] + "-";
		}
	}
	return s.substring(0, s.length-1);
}



module.exports = SimpleFrameViewer;