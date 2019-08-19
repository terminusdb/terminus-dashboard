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
		var entities = [value];
		var success = function(response){
			var span = dataviewer.internalLink(value)
			span.innerHTML = response;
			span.setAttribute("class", "terminus-document-reference-link");
			holder.appendChild(span);
			self.holder = holder;
		}
		renderer.getEntityReference(false, renderer.frame.range, entities)
		.then(success)
		.catch(function(error){
			var span = dataviewer.internalLink(value)
			span.setAttribute("class", "terminus-document-reference-link");
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
	input.setAttribute("class", "terminus-literal-value terminus-entity-reference-value");
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
