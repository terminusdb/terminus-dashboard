const TerminusClient = require('@terminusdb/terminus-client');
let HTMLHelper = {};

HTMLHelper.getSettingsControl = function(view){
	var icon = document.createElement('icon');
	if(view == 'property') icon.setAttribute('class', 'fa fa-cog terminus-pointer');
	else if(view == 'data') icon.setAttribute('class', 'fa fa-edit terminus-pointer');
	icon.setAttribute('style', 'margin: 10px;')
	return icon;
}

HTMLHelper.getControlIcon = function(control){
	var icon;
	switch(control){
		case 'delete':
			icon = '-alt-delete';
		break;
		case 'add':
			icon = '-plus';
		break;
		case 'reset':
			icon = '-undo';
		break;
		case 'save':
			icon = '-save';
		break;
		case 'hide':
			icon = '-eye-slash';
		break;
	}
	return icon;
}

HTMLHelper.getSelectionControl = function(type, options, selected, callback){
	var sel = document.createElement("select");
	sel.setAttribute("class", "terminus-frame-selector frame-control-selection " + type);
	for(var i = 0; i < options.length; i++){
		var opt = document.createElement("option");
		if(typeof options[i] == "object"){
			opt.value = options[i].value;
			var label = (options[i].label ?  document.createTextNode(options[i].label) : document.createTextNode(TerminusClient.UTILS.labelFromURL(options[i].value)));
			opt.appendChild(label);
		}
		else {
			opt.value = options[i];
			label = TerminusClient.UTILS.labelFromURL(opt.value);
			opt.appendChild(document.createTextNode(label));
		}
		if(selected == opt.value){
			opt.setAttribute("selected", "selected");
		}
		sel.appendChild(opt);
	}
	sel.addEventListener("change", function(){
		callback(this.value);
	});
	return sel;
}

HTMLHelper.getModeSelectorDOM = function(which, renderer){
	var viewsDOM = document.createElement("span");
	viewsDOM.setAttribute("class", "terminus-mode terminus-"+which+"-mode");
	if(renderer.mode == "view"){
		var callback = function(){ renderer.setMode("edit");}
		viewsDOM.appendChild(HTMLHelper.getActionControl("terminus-mode terminus-"+which+"-mode", "edit", " Edit ", callback));
	}
	else if(renderer.isNew()){
		return false;
	}
	else {
		var callback = function(){ renderer.cancel();}
		viewsDOM.appendChild(HTMLHelper.getActionControl(which, "cancel", "Cancel", callback));
	}
	return viewsDOM;
}

HTMLHelper.goToName = function(s, p, i){
	var url = window.location.href;
	if(url){
		var wbits = url.split("#");
		var loc = wbits[0];
		var sh = TerminusClient.UTILS.getShorthand(s);
	    if(!sh) sh = s;
		var bits = sh.split(":");
		if(bits.length > 1) sh = bits[1];
		var htmlid = sh;
		if(p){
			var prop = TerminusClient.UTILS.getShorthand(p);
			if(!prop ) prop = p;
			var bits = prop.split(":");
			if(bits.length > 1) prop = bits[1];
			htmlid += "_" + prop;
			if(i){
				htmlid += "_" + i;
			}
		}
		window.location = loc + "#" + htmlid;
	}
}

HTMLHelper.wrapShortenedText = function(wrap, text, max_cell_size, max_word_size){
	if(max_cell_size && (text.length > max_cell_size)){
		wrap.setAttribute("title", text);
		text = text.substring(0, max_cell_size) + "...";
	}
	if(text && text.length > max_word_size){
		const replacements = {}
		const words = text.split(" ");
		for(var i = 0; i < words.length; i++){
			var word = words[i];
			if(word.length > max_word_size){
				wrap.setAttribute("title", text);
				var newstr = word.substring(0, max_word_size) + "...";
				replacements[word] = newstr;
			}
		}
		for(var k in replacements){
			text = text.replace(k, replacements[k]);
		}
	}
	wrap.appendChild(document.createTextNode(text));
}

HTMLHelper.getVariableValueFromBinding = function(varname, bind){
	for(var key in bind){
		var skey = key.substring(key.lastIndexOf("/")+1);
		if(skey == varname){
			const obj = bind[key];
			if(typeof obj == "object" && obj['@value']) return obj['@value'];
			return obj;
		}
	}
	return false;
}



/*
 * HTML drawing function for document rendering 
 */

HTMLHelper.getFrameDOM = function(scope, frame, orientation, hfeatures, features){
	if(frame.display_options.hidden) return false;
	var framedom = HTMLHelper.getFrameHolderDOM(scope, frame, orientation);
	if(typeof frame.display_options.header == "function"){
		var hd = frame.display_options.header(hfeatures);
		framedom.appendChild(hd);
	}
	else {
		var hd = HTMLHelper.getFrameHeaderDOM(scope, frame, orientation, hfeatures);
		if(typeof frame.display_options.header_style != "undefined"){
			hd.setAttribute("style", frame.display_options.header_style);
		}
		framedom.appendChild(hd);
	}
	framedom.appendChild(HTMLHelper.getFrameBodyDOM(scope, frame, orientation, features));
	return framedom;
}

HTMLHelper.getFrameHolderDOM = function(scope, frame, orientation){
	var pcls = "terminus-" + scope + "-frame";
	if(orientation == "page"){
		var sp = document.createElement("div");
	}
	else {
		var sp = document.createElement("span");
	}
	var css = pcls + " " + pcls + "-" + orientation + 
		(scope == "object" && frame.parent ? "" : " terminus-root-frame") 
		+ " " + pcls + "-" + frame.display_options.mode;
	sp.setAttribute("class", css);
	if(scope == "object"){
		sp.setAttribute("data-class", frame.subjectClass());
		sp.setAttribute("data-id", frame.subject());		
		var hid = this.hash(frame.subject());
	}
	else if(scope == "property"){
		sp.setAttribute('data-property', frame.property());	
		var hid = this.hash(frame.subject()+frame.property());
	}
	else if(scope == "data"){
		sp.setAttribute('data-value', frame.get());
		var hid = this.hash(frame.subject() + frame.property() + frame.index);
	}
	var idm = document.createElement("a");
	idm.setAttribute("class", "terminus-" + scope + "-idmarker");
	idm.setAttribute("name", hid);				
	sp.appendChild(idm);
	return sp;
}

HTMLHelper.getFrameHeaderDOM = function(scope, frame, orientation, features){
	var css = "terminus-" + scope + "-header";
	if(orientation == "page"){
		var objDOM = document.createElement("div");
	}
	else {
		var objDOM = document.createElement("span");
	}
	objDOM.setAttribute("class", css + " " + css + "-" + orientation);
	if(features) objDOM.appendChild(features);
	return objDOM;
}

HTMLHelper.getFrameBodyDOM = function(scope, frame, orientation, features){
	var css = "terminus-" + scope + "-properties";
	if(orientation == "page"){
		var vholder = document.createElement("div");
	}
	else {
		var vholder = document.createElement("span");
	}
    vholder.setAttribute('class', css + " " + css + "-" + orientation);
    if(features) vholder.appendChild(features);
    return vholder;
}

HTMLHelper.hash = function(s) {
	var hash = 0, i, chr;
	if (s.length === 0) return hash;
	for (i = 0; i < s.length; i++) {
	    chr   = s.charCodeAt(i);
	    hash  = ((hash << 5) - hash) + chr;
	    hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

HTMLHelper.getFeatureDOM = function(frame, feature, scope, mode, args, rend){

	if(feature == "id"){	
		if(scope == "object") var val = frame.subject();
		else if(scope == "property") var val = frame.property();
		if(val == "_:") var val = "New Document";
		return HTMLHelper.getInfoboxDOM("object-id", "ID", val, "The ID that identifies this document", mode, args, rend);
	}
	else if(feature == "summary"){
		var sum = frame.getSummary();
		return HTMLHelper.getInfoboxDOM(scope + "-summary", false, sum.long, sum.status, mode, args);
	}
	else if(feature == "label"){
		var lab = frame.getLabel();
		if(lab){
			return HTMLHelper.getInfoboxDOM(scope + "-type", false, lab, false, mode, args);
		}
		return false;
	}
	else if(feature == "status"){
		var sum = frame.getSummary();
		return HTMLHelper.getInfoboxDOM(scope + "-status-"+sum.status, false, sum.status, sum.status, mode, args);
	}
	else if(feature == "comment"){
		var lab = frame.getComment();
		return HTMLHelper.getInfoboxDOM("property-comment", false, lab, false, mode, args);
	}
	else if(feature == "type"){
		if(scope == "property" && mode == "edit" && frame.parent && frame.parent.isClassChoice() && frame.isNew()){
			return this.getClassChoiceTypeSelector(frame, mode, args);
		}
		if(scope == "object") var lab = frame.subjectClass();
		else if(scope == "property") var lab = frame.range();
		else if(scope == "data") var lab = frame.getType();
		if(lab){
			return HTMLHelper.getInfoboxDOM(scope + "-type", "Type", lab, false, mode, args);
		}
		return false;
	}
	else if(feature == "delete"){
		var callback = function(){frame.delete()};
		var disabled = false;
		if(!frame.cardControlAllows("delete", scope)){
			if(!frame.display_options.show_disabled_buttons){
				return false;
			}
			disabled = "Cardinality rules prevent deleting this element";
		}
		return HTMLHelper.getActionControl(scope, "delete", "Delete", callback, disabled, mode, args);
	}
	else if(feature == "clone"){
		var callback = function(){frame.clone()};
		var disabled = false;
		if(!frame.cardControlAllows("clone", scope)){
			if(!frame.display_options.show_disabled_buttons){
				return false;
			}
			disabled = "Cardinality rules prevent cloning this element";
		}
		return HTMLHelper.getActionControl(scope, "clone", "Clone", callback, disabled, mode, args);
	}
	else if(feature == "reset"){
		var callback = function(){frame.reset()};
		var disabled = false;
		if(!frame.isUpdated()){
			if(!frame.display_options.show_disabled_buttons){
				return false;
			}
			disabled = "No changes have been made to this element";
		}
		return HTMLHelper.getActionControl(scope, "reset", "Reset", callback, disabled, mode, args);
	}
	else if(feature == "mode"){
		var callback = function(){frame.mode("edit")};
		return HTMLHelper.getActionControl(scope, "mode", "Edit", callback, mode, args);
	}
	else if(feature == "hide"){
		var callback = function(){frame.show()};
		return HTMLHelper.getActionControl(scope, "hide", "Hide", callback, mode, args);
	}
	else if(feature == "update"){
		var callback = function(){frame.save()};
		if(!frame.isUpdated() && !frame.display_options.show_disabled_buttons, mode, args){
			return false;
		}
		var disabled = frame.isUpdated() ? false : "No changes have been made to this element";
		return HTMLHelper.getActionControl(scope, "save", "Save", callback, disabled, mode, args);
	}
	else if(feature == "viewer"){
		return false;//this.getViewerSelectorDOM(scope, frame, mode, args);
	}
	else if(feature == "view"){
		return this.getViewEntryDOM(scope, frame, mode, args);
	}
	else if(feature == "cardinality"){
		return this.getCardinalityDOM(scope, frame, mode, args);
	}
	else if(feature == "add"){
		return this.getAddDOM(scope, frame, mode, args);
	}
}

HTMLHelper.getViewerSelectorDOM = function(scope, frame, mode, args){
	//var viewers = frame.datatypes.getAvailableViewers();
	//var r = frame.datatypes.getRenderer(t);

	if(viewers && viewers.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-" + scope + "-viewer");
		var callback = function(viewer){
			if(viewer){
				frame.setViewer(viewer);
			}
		}
		var selected = frame.currentViewer();
		var sel = HTMLHelper.getSelectionControl(scope + '-viewer', viewers, selected, callback, mode, args);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}


/* needs html viewer context for goto */
HTMLHelper.getViewEntryDOM = function(scope, frame, mode, args){
	if(scope == "object"){
		var viewables = frame.getFilledPropertyList();
	}
	else if(scope == "property"){
		
	}
	var self = this;
	if(viewables && viewables.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-"+scope + "-view-entry");
		viewables.unshift({ value: "", label: "View " + scope});
		var callback = function(add){
			if(add){
				frame.goToEntry(add);
			}
		}
		var sel = HTMLHelper.getSelectionControl(scope + "-view-entry", viewables, "", callback, mode, args);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
	
}

HTMLHelper.getCardinalityDOM = function(scope, frame, mode, args){
	var restriction = frame.getRestriction();
	if(restriction.min && restriction.max){
		if(restriction.min == restriction.max){
			var lab = restriction.min;
			var help = "Cardinality: " + restriction.min;
		}
		else {
			var lab = restriction.min + "-" + restriction.max;
			var help = "Minimum Cardinality: " + restriction.min;
			help += ", Maximum Cardinality: " + restriction.max;
		}
	}
	else if(restriction.min){
		var lab = ">"+(restriction.min-1);
		var help = "Minimum Cardinality: " + restriction.min;
	}
	else if(restriction.max){
		var lab = "<"+(restriction.max+1);
		var help = "Maximum Cardinality: " + restriction.max;
	}
	else {
		return false;
	}
	return HTMLHelper.getInfoboxDOM("property-cardinality", "Cardinality", lab, help, mode, args);
}

HTMLHelper.getClassChoiceTypeSelector = function(frame, mode, args){
	var cs = frame.parent.getAvailableClassChoices();
	if(cs && cs.length){
		var mpropDOM = document.createElement("span");
		mpropDOM.setAttribute("class", "terminus-property-change-class");
		var mlabDOM = document.createElement("span");
		mlabDOM.setAttribute("class", "terminus-property-change-label");
		mlabDOM.appendChild(document.createTextNode("Type"));
		mpropDOM.appendChild(mlabDOM);
		var callback = function(cls){
			if(cls){
				frame.changeClass(cls);
			}
		}
		var sel = HTMLHelper.getSelectionControl("change-class", cs, frame.subjectClass(), callback, mode, args);
		mpropDOM.appendChild(sel);
		return mpropDOM;
	}
	return false;
}

HTMLHelper.getAddDOM = function(scope, frame, mode, args){
	if(scope == "property"){
		if(frame.isClassChoice()){
			var cs = frame.getAvailableClassChoices();
			if(cs && cs.length){
				var mpropDOM = document.createElement("span");
				mpropDOM.setAttribute("class", "terminus-property-add-class");
				cs.unshift({ value: "", label: "Add Type"});
				var callback = function(cls){
					if(cls){
						frame.addClass(cls);
					}
				}
				var sel = HTMLHelper.getSelectionControl("add-property", cs, "", callback, mode, args);
				mpropDOM.appendChild(sel);
				return mpropDOM;
			}
		}
		if(frame.cardControlAllows("add") || frame.display_options.show_disabled_buttons){
			var callback = function(){frame.add("edit")};
			var disabled = (frame.cardControlAllows("add") ? false : "Cardinality Rules Forbid Add");
			return HTMLHelper.getActionControl(scope + "-add-entry", "add", "Add", callback, disabled, mode, args);
		}
	}
	else {
		var addables = frame.getMissingPropertyList();
		if(addables && addables.length){
			var mpropDOM = document.createElement("span");
			mpropDOM.setAttribute("class", "terminus-" + scope + "-add-entry");
			addables.unshift({ value: "", label: "Add new " + scope});
			var callback = function(add){
				if(add){
					if(scope == "object") frame.addNewProperty(add);
					else if(scope == "property") frame.addNewValue(add);
				}
			}
			if(frame.cardControlAllows("add") || frame.display_options.show_disabled_buttons){
				var disabled = (frame.cardControlAllows("add") ? false : "Cardinality rules forbid adding element");
				var sel = HTMLHelper.getSelectionControl(scope + "-add-entry", addables, "", callback, disabled, mode, args);
				mpropDOM.appendChild(sel);
				return mpropDOM;
			}
		}
	}
	return false;
}

HTMLHelper.getInfoboxDOM = function(type, label, value, help, mode, args, input){
	/*var frow = this.getFrameRow();
	var fgroup = this.getFrameGroup(frow);*/
	var infoDOM = document.createElement("span");
	infoDOM.setAttribute("class", "terminus-frame-infobox-box " + "terminus-" +type );
	//fgroup.appendChild(infoDOM);
	if(help){
		infoDOM.setAttribute("title", help);
	}
	if(args && typeof args.label != "undefined") label = args.label;
	if(label !== false){
		label = (args && args.label ? args.label : label);
		var linfo = document.createElement("span");
		linfo.setAttribute("class", "terminus-frame-infobox-label " + "terminus-" +type + "-label");
		linfo.appendChild(document.createTextNode(label));
		if(args && args.headerStyle){
			linfo.setAttribute("style", args.headerStyle);			
		}
		infoDOM.appendChild(linfo);
	}
	var lval = document.createElement("span");
	lval.setAttribute("class", "terminus-frame-infobox-value " + "terminus-" +type + "-value");
	if(input){
		input.value = value;
		lval.appendChild(input);
	}
	else if(args && args.removePrefixes && value && value.split(":").length == 2) {
		var bits = value.split(":");
		sh = bits[1];
		lval.setAttribute("title", value);
		lval.appendChild(document.createTextNode(sh));
	}
	else {
		lval.appendChild(document.createTextNode(value));
	}
	if(args && args.bodyStyle){
		lval.setAttribute("style", args.bodyStyle);
	}
	infoDOM.appendChild(lval);
	if(args && args.style){
		infoDOM.setAttribute("style", args.style)
	}
	return infoDOM;
}


HTMLHelper.getActionControl = function(type, control, label, callback, disabled, mode, args){
	//var pman = new TerminusPluginManager();
	var dpropDOM = document.createElement("span");
	//dpropDOM.setAttribute("class", "terminus-action-control terminus-save-btn " + type + "-" + control);
	label = (args && typeof args.label != "undefined" ? args.label : label);
	icon = (args && args.icon ? args.icon : false);
	if(icon){
		var i = document.createElement("i");
		i.setAttribute("class", "fa " + icon);
		icon = i;
	}
	var tag = (args && args.tag ? args.tag : "button");
	var button = document.createElement(tag);
	if(icon){
		button.appendChild(icon);
	}
	if(label) button.appendChild(document.createTextNode(" " + label + " "));
	if(args && args.title){
		button.setAttribute("title", args.title);
	}
	if(disabled){
		//button.setAttribute("class", "terminus-frame-control terminus-frame-btn frame-control-action action-disabled " + type + "-" + control + "-disabled");
		button.setAttribute("title", disabled);
	}
	else {
		//button.setAttribute("class", "terminus-frame-control terminus-frame-btn frame-control-action " + type + "-" + control);
		
	}
	dpropDOM.appendChild(button);
	return dpropDOM;
}

HTMLHelper.removeChildren = function (node) {
	if (node) {
		while (node.hasChildNodes()) {
			node.removeChild(node.childNodes[0]);
		}
	}
};

HTMLHelper.loadDynamicScript = function (scriptid, src, callback) {
	const existingScript = document.getElementById(scriptid);
	if (!existingScript) {
		const script = document.createElement('script');
		script.src = src; // URL for the third-party library being loaded.
		document.body.appendChild(script);
		script.onload = function () {
			script.id = scriptid; // do it here so it doesn't trigger the callback below on multiple calls
			if (callback) callback(scriptid);
		};
	}
	if (existingScript && callback) {
		callback(scriptid);
	}
};

HTMLHelper.loadDynamicCSS = function (cssid, src, callback) {
	const existingScript = document.getElementById(cssid);
	if (!existingScript) {
		const link = document.createElement('link');
		link.href = src; // URL for the third-party library being loaded.
		link.id = cssid; // e.g., googleMaps or stripe
		link.rel = 'stylesheet';
		document.body.appendChild(link);
		link.onload = function () {
			if (callback) callback(cssid);
		};
	}
	if (existingScript && callback) callback(cssid);
};


HTMLHelper.removeElement = function (node) {
	if (node) {
			node.parentNode.removeChild(node);
	}
}

module.exports=HTMLHelper
