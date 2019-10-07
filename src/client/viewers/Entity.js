const HTMLFrameHelper = require('../HTMLFrameHelper');


function HTMLEntityViewer(options){}
HTMLEntityViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var value = TerminusClient.FrameHelper.unshorten(value);
	var holder = document.createElement("span");
	holder.setAttribute("class", "terminus-literal-value terminus-entity-reference-value");
	var self = this;
	if(this.holder){
		return this.holder;
	}
	if(value){
		var dom = this.getEntityViewHTML(value, renderer, dataviewer);		
		holder.appendChild(dom);
	}
	return holder;
}

HTMLEntityViewer.prototype.getEntityViewHTML = function(value, renderer, dataviewer){
	var span = document.createElement("span");
	var self = this;
	span.setAttribute("class", "terminus-internal-link");
	span.appendChild(dataviewer.internalLink(value));
	if(controller = renderer.getController()){
		controller.getInstanceMeta(value).then(function(response){
			var lab = self.getEntityLabel(value, response, dataviewer);
			if(lab){ 
				TerminusClient.FrameHelper.removeChildren(span);
				span.appendChild(lab);
			}	
		});
	}
	return span;
}

HTMLEntityViewer.prototype.getEntityLabel = function(url, response, dv){
	var nspan = document.createElement("span");
	if(response && (il = HTMLFrameHelper.getVariableValueFromBinding("InstanceLabel", response))){
		nspan.appendChild(dv.internalLink(url, il));
		var rt = HTMLFrameHelper.getVariableValueFromBinding("InstanceType", response);
		var tit = url + " Type: " + rt;
		var ic = HTMLFrameHelper.getVariableValueFromBinding("InstanceComment", response);
		if(typeof ic == "object" && ic["@value"]){
			tit += " " + ic["@value"];
		}
		nspan.setAttribute("title", tit);
		return nspan;
	}
	return false;
}

module.exports={HTMLEntityViewer}