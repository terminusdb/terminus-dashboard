function TerminusMappingViewer(ui, mode){
	this.ui = ui;
	this.mode = (mode ? mode : "data");
}

TerminusMappingViewer.prototype.getAsDOM = function(){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-mapping-page terminus-page");
	var tsel = document.createElement("select");
	var o1 = document.createElement("option");
	o1.value = "data";
	o1.appendChild(document.createTextNode("Data Map"))
	tsel.appendChild(o1);
	var o2 = document.createElement("option");
	o2.value = "model";
	o2.appendChild(document.createTextNode("Model Map"))
	tsel.appendChild(o2);
	var ff = this.getFormFieldDOM("Map Type");
	ff.appendChild(tsel);
	scd.appendChild(ff);
	var source = this.getFormField(scd, "Map Source");
	var target = this.getFormField(scd, "Map Target");
	var queries = this.getFormField(scd, "Queries");
	var options = this.getFormField(scd, "Options");
	
	var mdom = this.getFormFieldDOM("Existing Mapping");
	var mapping = document.createElement("input");
	mapping.setAttribute("type", "text");
	mapping.setAttribute("size", 80);
	mdom.appendChild(mapping);
	scd.appendChild(mdom);
	
	var submit = document.createElement("button");
	submit.setAttribute("class", "terminus-btn terminus-control-button");
	submit.appendChild(document.createTextNode("Execute Mapping"));
	var self = this;
	submit.addEventListener("click", function(){
		var jsonip = {
			map_source: JSON.parse(source.value),
		};
		if(tsel.value == "data"){
			jsonip["rdf:type"] = "dcogmodel:DataMap";
		}
		else {
			jsonip["rdf:type"] = "dcogmodel:ModelMap";			
		}
		if(target.value) jsonip.map_target = target.value;
		if(queries.value) jsonip.queries = queries.value;
		if(options.value) jsonip.options = options.value;
		if(mapping.value) jsonip.mapping = mapping.value;
		self.ui.client.update(false, jsonip);
	})
	scd.appendChild(submit);
	return scd;
}

TerminusMappingViewer.prototype.getFormFieldDOM = function(label){
	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-mapping-field");
	var lab = document.createElement("span");
	lab.setAttribute("class", "terminus-form-label terminus-mapping-label");
	lab.appendChild(document.createTextNode(label));
	sci.appendChild(lab);
	return sci;
}

TerminusMappingViewer.prototype.getFormField = function(holder, label){
	var ff = this.getFormFieldDOM(label);
	var source = document.createElement("textarea");
	source.setAttribute("class", "terminus-form-value terminus-textarea");
	ff.appendChild(source);
	holder.appendChild(ff);
	return source;
}

module.exports=TerminusMappingViewer
