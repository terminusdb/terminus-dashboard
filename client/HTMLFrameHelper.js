
let HTMLFrameHelper = {};

HTMLFrameHelper.getActionControl = function(type, control, label, callback, disabled){
	var dpropDOM = document.createElement("span");
	dpropDOM.setAttribute("class", "terminus-action-control " + type + "-" + control);
	var button = document.createElement("button");
	button.appendChild(document.createTextNode(label));
	if(disabled){
		button.setAttribute("class", "terminus-frame-control frame-control-action action-disabled " + type + "-" + control + "-disabled");
		button.setAttribute("title", disabled);
	}
	else {
		button.setAttribute("class", "terminus-frame-control frame-control-action " + type + "-" + control);
		button.addEventListener("click", function(){
			callback(control);
		});
	}
	dpropDOM.appendChild(button);
	return dpropDOM;
}


HTMLFrameHelper.getSelectionControl = function(type, options, selected, callback){
	var sel = document.createElement("select");
	sel.setAttribute("class", "terminus-frame-selector frame-control-selection " + type);
	for(var i = 0; i < options.length; i++){
		var opt = document.createElement("option");
		if(typeof options[i] == "object"){
			opt.value = options[i].value;
			var label = (options[i].label ?  document.createTextNode(options[i].label) : document.createTextNode(FrameHelper.labelFromURL(options[i].value)));
			opt.appendChild(label);
		}
		else {
			opt.value = options[i];
			label = FrameHelper.labelFromURL(opt.value);
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

HTMLFrameHelper.getModeSelectorDOM = function(which, renderer){
	var viewsDOM = document.createElement("span");
	viewsDOM.setAttribute("class", "terminus-mode terminus-"+which+"-mode");
	if(renderer.mode == "view"){
		var callback = function(){ renderer.setMode("edit");}
		viewsDOM.appendChild(HTMLFrameHelper.getActionControl("terminus-mode terminus-"+which+"-mode", "edit", " Edit ", callback));
	}
	else if(renderer.isNew()){
		return false;
	}
	else {
		var callback = function(){ renderer.cancel();}
		viewsDOM.appendChild(HTMLFrameHelper.getActionControl(which, "cancel", "Cancel", callback));
	}
	return viewsDOM;
}

HTMLFrameHelper.goToName = function(s, p, i){
	var url = window.location.href;
	if(url){
		var wbits = url.split("#");
		var loc = wbits[0];
		var sh = FrameHelper.getShorthand(s);
	    if(!sh) sh = s;
		var bits = sh.split(":");
		if(bits.length > 1) sh = bits[1];
		var htmlid = sh;
		if(p){
			var prop = FrameHelper.getShorthand(p);
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

HTMLFrameHelper.getInfoboxDOM = function(type, label, value, help, input){
	var infoDOM = document.createElement("span");
	infoDOM.setAttribute("class", "terminus-frame-infobox-box " + "terminus-" +type);
	if(help){
		infoDOM.setAttribute("title", help);
	}
	if(label){
		var linfo = document.createElement("span");
		linfo.setAttribute("class", "terminus-frame-infobox-label " + "terminus-" +type + "-label");
		linfo.appendChild(document.createTextNode(label));
		infoDOM.appendChild(linfo);
	}
	var lspacer = document.createElement("span");
	lspacer.setAttribute("class", "terminus-frame-infobox-spacer " + "terminus-" +type + "-spacer");
	lspacer.appendChild(document.createTextNode(" "));
	infoDOM.appendChild(lspacer);
	var lval = document.createElement("span");
	lval.setAttribute("class", "terminus-frame-infobox-value " + "terminus-" +type + "-value");
	if(input){
		input.value = value;
		lval.appendChild(input);
	}
	else if(value) {
		var sh = FrameHelper.getShorthand(value);
        if(sh){
    	   	var bits = sh.split(":");
            sh = bits[1];
   			lval.setAttribute("title", value);
			lval.appendChild(document.createTextNode(sh));
		}
		else {
			lval.appendChild(document.createTextNode(value));
		}
	}
	infoDOM.appendChild(lval);
	return infoDOM;
}
