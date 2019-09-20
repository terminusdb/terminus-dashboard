const FrameHelper = require('../FrameHelper');
const RenderingMap = require('../RenderingMap');

function HTMLEntityViewer(options){}
HTMLEntityViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var value = FrameHelper.unshorten(value);
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
				FrameHelper.removeChildren(span);
				span.appendChild(lab);
			}	
		});
	}
	return span;
}

HTMLEntityViewer.prototype.getEntityLabel = function(url, response, dv){
	var nspan = document.createElement("span");
	if(response && typeof response.InstanceLabel == "object" && response.InstanceLabel["@value"]){
		nspan.appendChild(dv.internalLink(url, response.InstanceLabel["@value"]));
		var tit = url + " Type: " + response.InstanceType;
		if(typeof response.InstanceComment == "object" && response.InstanceComment["@value"]){
			tit += " " + response.InstanceComment["@value"];
		}
		nspan.setAttribute("title", tit);
		return nspan;
	}
	return false;
}

function HTMLEntityEditor(options){}
HTMLEntityEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("input");
	input.setAttribute("class", "terminus-literal-value terminus-entity-reference-value");
	input.setAttribute("type", "text");
	input.setAttribute('size', 80);
	input.value = value;
	var self = this;
	input.addEventListener("change", function(){
		var url = this.value;
		if(url.indexOf("/") == -1 && url.indexOf(":") == -1){
			url = "doc:" + url;
		}
		renderer.set(url);
	});
	return input;
}

RenderingMap.registerViewerForFrameType("HTMLEntityViewer", "Document Viewer", "document");
RenderingMap.registerEditorForFrameType("HTMLEntityEditor", "Document Selector", "document");
