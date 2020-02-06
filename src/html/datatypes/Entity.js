const HTMLHelper = require('../HTMLHelper');

function HTMLEntityViewer(options){
	this.options(options);
}

HTMLEntityViewer.prototype.options = function(options){
	this.onclick = (options && options.onclick ? options.onclick: false);
}

HTMLEntityViewer.prototype.renderFrame = function(frame, dataviewer){
	//this.client = dataviewer.getClient();
	return this.render(frame.get());	
}

HTMLEntityViewer.prototype.renderValue = function(dataviewer){
	//this.client = dataviewer.getClient();
	return this.render(dataviewer.value());
}

HTMLEntityViewer.prototype.render = function(value){
	var holder = document.createElement("span");
	holder.setAttribute("class", "terminus-literal-value terminus-entity-reference-value");
	var self = this;
	if(this.holder){
		return this.holder;
	}
	if(value){
		var dom = this.showValue(value)
		holder.appendChild(dom);
	}
	return holder;
}

HTMLEntityViewer.prototype.showValue = function(value){
	if(this.onclick){
		var self = this;
		var a = document.createElement("a");
		a.style.color = "#0000aa";
		a.appendChild(document.createTextNode(value));
		a.addEventListener("click", function(event){
			self.onclick(value);
		});
		a.addEventListener("mouseover", function(event){
			a.style.cursor = "pointer";
		});
		return a; 	
	}
	else {
		return document.createTextNode(value);
	}
}


HTMLEntityViewer.prototype.getEntityViewHTML = function(value, frame, dataviewer){
	var span = document.createElement("span");
	var self = this;
	span.setAttribute("class", "terminus-internal-link");
	span.appendChild(dataviewer.internalLink(value));
	if(controller = renderer.getController()){
		controller.getInstanceMeta(value).then(function(response){
			var lab = self.getEntityLabel(value, response, dataviewer);
			if(lab){ 
				HTMLHelper.removeChildren(span);
				span.appendChild(lab);
			}	
		});
	}
	return span;
}

HTMLEntityViewer.prototype.getEntityLabel = function(url, response, dv){
	var nspan = document.createElement("span");
	if(response && (il = HTMLHelper.getVariableValueFromBinding("InstanceLabel", response))){
		nspan.appendChild(dv.internalLink(url, il));
		var rt = HTMLHelper.getVariableValueFromBinding("InstanceType", response);
		var tit = url + " Type: " + rt;
		var ic = HTMLHelper.getVariableValueFromBinding("InstanceComment", response);
		if(typeof ic == "object" && ic["@value"]){
			tit += " " + ic["@value"];
		}
		nspan.setAttribute("title", tit);
		return nspan;
	}
	return false;
}

module.exports={HTMLEntityViewer}