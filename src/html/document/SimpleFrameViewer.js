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
		var dv = frame.display_options.dataviewer;
		if(!dv){
			if(frame.isChoice()) var t = "oneOf";
			else if(frame.isDocument()) var t = "document";
			else t = frame.getType();
			var r = this.terminus.datatypes.getRenderer(t);
			dv = r.name;
		}
		if(frame.display_options.args){
			var args = frame.display_options.args ;
		}
		else {
			if(r && r.args) args = r.args;
			else args = false;
		}
		return this.terminus.datatypes.createRenderer(dv, args);
	}
}

SimpleFrameViewer.prototype.render = function(frame){
	var scope = this.getScope(frame);
	if(frame.display_options.header_features){
		var hfeatures = this.getFeaturesDOM(frame.display_options.header_features, frame.display_options.feature_renderers, scope, frame)
	}
	else var hfeatures = false;
	if(frame.display_options.features){
		var features = this.getFeaturesDOM(frame.display_options.features, frame.display_options.feature_renderers, scope, frame);
	}
	else var features = false;
	var ndom = HTMLFrameHelper.getFrameDOM(scope, frame, "page", hfeatures, features);
	if(!ndom) return false;
	if(this.framedom){
		this.framedom.replaceWith(ndom);
	}
	this.framedom = ndom;
	return this.framedom;
}	

SimpleFrameViewer.prototype.getFeaturesDOM = function(flist, renderers, scope, frame){
	//alert(flist);
	var features = document.createElement("span");
	features.setAttribute("class", featuresToCSS(flist));
	for(var i = 0; i<flist.length; i++){
		if(typeof flist[i] == "object"){
			features.appendChild(this.getFeaturesDOM(flist[i], renderers, scope, frame));
		}
		else {
			if(renderers && renderers[flist[i]]){
				var dom = renderers[flist[i]](frame, flist[i]);
				if(dom)	features.appendChild(dom);
			}				
			else {
				if(flist[i] == "value" && scope == "data"){
					var dv = this.getDatatypeViewer(frame);
					if(dv) {
						var dom = dv.renderFrame(frame, this);
					}
					else {
						var dom = document.createTextNode(frame.get());			
					}
					if(dom)	features.appendChild(dom);
				}
				else if(flist[i] == "value"){
					if(scope == 'object'){
						var vals = frame.renderProperties();
					}
					else {
						var vals = frame.renderValues();		    
					}
				    for(var i = 0; i<vals.length; i++){
						features.appendChild(vals[i]);
					}
				}
				else {
					//alert(flist[i]);
					var dom = HTMLFrameHelper.getFeatureDOM(flist[i], scope, frame);
					if(dom)	features.appendChild(dom);
					else alert("No dom");
				}
			}
		}
	}
	return features;
}

function featuresToCSS(flist){
	var s = "";
	for(var i = 0; i<flist.length; i++){
		if(typeof flist[i] == "object"){
			s += featuresToCSS(flist[i]) + "-";
		}
		else {
			s += flist[i] + "-";
		}
	}
	return s.substring(0, s.length-1);
}



module.exports = SimpleFrameViewer;