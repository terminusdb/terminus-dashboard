const TerminusPluginManager = require('../plugins/TerminusPlugin');
const TerminusClient = require('@terminusdb/terminus-client');
let HTMLFrameHelper = {};

HTMLFrameHelper.getActionControl = function(type, control, label, callback, disabled){
	var pman = new TerminusPluginManager();
	var dpropDOM = document.createElement("span");
	dpropDOM.setAttribute("class", "terminus-action-control terminus-save-btn " + type + "-" + control);
	var pman = new TerminusPluginManager();
    /*if(pman.pluginAvailable("font-awesome")){
		var icon = document.createElement('icon');
		var faic = this.getControlIcon(control);
		if(disabled){
			icon.setAttribute("class", "terminus-frame-control frame-control-action action-disabled fa fa" + faic + " " + type + "-" + control + "-disabled terminus-font-align");
			icon.setAttribute("title", disabled);
		}
		else {
			icon.setAttribute("class", "terminus-frame-control frame-control-action frame-control-action fa fa" + faic + " " + type + "-" + control + " terminus-font-align");
			icon.addEventListener("click", function(){
				callback(control);
			});
		}
		dpropDOM.appendChild(icon);
	}
	else{*/
		var button = document.createElement("button");
		button.appendChild(document.createTextNode(label));
		if(disabled){
			button.setAttribute("class", "terminus-frame-control terminus-frame-btn frame-control-action action-disabled " + type + "-" + control + "-disabled");
			button.setAttribute("title", disabled);
		}
		else {
			button.setAttribute("class", "terminus-frame-control terminus-frame-btn frame-control-action " + type + "-" + control);
			button.addEventListener("click", function(){
				if(this.innerHTML == 'Save'){
					var objId = document.getElementsByClassName('terminus-object-id-input');
					if(objId.length>0){
						if(!objId[0].value){
							objId[0].setAttribute('placeholder', 'Required field');
							objId[0].style.background = '#f8d7da';
						}
						else callback(control);
					}
					else callback(control);
				}
				else callback(control);
				//(control);
			});
		}
		dpropDOM.appendChild(button);
	//}
	return dpropDOM;
}

HTMLFrameHelper.getSettingsControl = function(view){
	var pman = new TerminusPluginManager();
	if(pman.pluginAvailable("font-awesome")){
		var icon = document.createElement('icon');
		if(view == 'property') icon.setAttribute('class', 'fa fa-cog terminus-pointer');
		else if(view == 'data') icon.setAttribute('class', 'fa fa-edit terminus-pointer');
		icon.setAttribute('style', 'margin: 10px;')
		return icon;
	}
	else{
		var button = document.createElement("button");
		button.setAttribute('class', 'terminus-btn');
		button.appendChild(document.createTextNode('Settings'));
		return button;
	}
}

HTMLFrameHelper.getControlIcon = function(control){
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

HTMLFrameHelper.getSelectionControl = function(type, options, selected, callback){
	var sel = document.createElement("select");
	sel.setAttribute("class", "terminus-frame-selector frame-control-selection " + type);
	for(var i = 0; i < options.length; i++){
		var opt = document.createElement("option");
		if(typeof options[i] == "object"){
			opt.value = options[i].value;
			var label = (options[i].label ?  document.createTextNode(options[i].label) : document.createTextNode(TerminusClient.FrameHelper.labelFromURL(options[i].value)));
			opt.appendChild(label);
		}
		else {
			opt.value = options[i];
			label = TerminusClient.FrameHelper.labelFromURL(opt.value);
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
		var sh = TerminusClient.FrameHelper.getShorthand(s);
	    if(!sh) sh = s;
		var bits = sh.split(":");
		if(bits.length > 1) sh = bits[1];
		var htmlid = sh;
		if(p){
			var prop = TerminusClient.FrameHelper.getShorthand(p);
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

HTMLFrameHelper.wrapShortenedText = function(wrap, text, max_cell_size, max_word_size){
	if(max_cell_size && (text.length > max_cell_size)){
		wrap.setAttribute("title", text);
		text = text.substring(0, max_cell_size) + "...";
	}
	if(max_word_size){
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

HTMLFrameHelper.getVariableValueFromBinding = function(varname, bind){
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


HTMLFrameHelper.getInfoboxDOM = function(type, label, value, help, input){
	/*var frow = this.getFrameRow();
	var fgroup = this.getFrameGroup(frow);*/
	var infoDOM = document.createElement("span");
	infoDOM.setAttribute("class", "terminus-frame-infobox-box " + "terminus-" +type );
	//fgroup.appendChild(infoDOM);
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
	lval.setAttribute("class", "terminus-frame-infobox-value " + "terminus-" +type + "-value terminus-property-label-align");
	if(input){
		input.value = value;
		lval.appendChild(input);
	}
	else if(value) {
		var sh = TerminusClient.FrameHelper.getShorthand(value);
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

module.exports=HTMLFrameHelper