const HTMLFrameHelper = require("../HTMLFrameHelper");

function SimpleFrameViewer(){
}

SimpleFrameViewer.prototype.getScope = function(frame){
	if(frame.isProperty()) return "property";
	if(frame.isObject()) return "object";
	if(frame.isData()) return "data";
}

SimpleFrameViewer.prototype.getDatatypeViewer = function(frame){
	if(this.terminus){
		var dv = frame.dataviewer;
		if(!dv){
			if(frame.isChoice()) var t = "oneOf";
			else if(frame.isDocument()) var t = "docxument";
			else t = frame.getType();
			let r = this.terminus.datatypes.getRenderer(t);
			dv = r.name;
			if(!frame.dataviewer_options){
				frame.dataviewer_options = r.args;
			}
		}
		return this.terminus.datatypes.createRenderer(dv, frame.dataviewer_options);
	}
}

SimpleFrameViewer.prototype.render = function(frame){
	var scope = this.getScope(frame);
	var ndom = HTMLFrameHelper.getFrameDOM(scope, frame, "page");
	if(!ndom) return false;
	if(this.framedom){
		this.framedom.replaceWith(ndom);
	}
	this.framedom = ndom;
	if(scope == "data"){
		var dv = this.getDatatypeViewer(frame);
		if(dv) {
			this.framedom.appendChild(dv.renderFrame(frame, this));
		}
		else {
			this.framedom.appendChild(document.createTextNode("XX: " + frame.get()));
			
		}
	}
	else {
		if(scope == 'object'){
			var vals = frame.renderProperties();
		}
		else {
			var vals = frame.renderValues();		    
		}
	    for(var i = 0; i<vals.length; i++){
			this.framedom.appendChild(vals[i]);
		}
	}
	return this.framedom;
}	

SimpleFrameViewer.prototype.generateFeatures = function(flist){}

SimpleFrameViewer.prototype.generateFeature = function(f, frame){
	if(frame.display_options.feature_renderers && frame.display_options.feature_renderers[f]){
		return frame.display_options.feature_renderers[f]("object", frame, f);
	}				
	if(frame.display_options.header_features){
		for(var f in frame.display_options.header_features){
		}
	}	
}


module.exports = SimpleFrameViewer;