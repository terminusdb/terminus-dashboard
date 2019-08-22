function TerminusPluginManager(){
	this.preloaded = [];
	this.loaded = [];
	this.loading = [];
	this.precluded = [];
	this.plugins = {};
	this.plugins["font-awesome"] = {
		label: "Font Awesome",
		css: ["https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0-11/css/all.css"]
	};
	this.plugins["quill"] = {
		label: "Quill",
		js: ["https://cdn.quilljs.com/1.3.6/quill.min.js"],
		css: ["https://cdn.quilljs.com/1.3.6/quill.snow.css"],
		plugin: "quill.terminus.js",
	};
	this.plugins["codemirror"] = {
		label : "Code Mirror",
		js: ["https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/codemirror.js",
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/mode/xml/xml.js",
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/mode/css/css.js",
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/mode/turtle/turtle.js",
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/mode/javascript/javascript.js",
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/addon/hint/anyword-hint.js",
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/addon/hint/show-hint.js"],
		css: [
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/codemirror.css",
			"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/addon/hint/show-hint.css"
		]
	};
	this.plugins["jquery"] = {
		label: "jQuery",
		js: ["https://code.jquery.com/jquery-2.2.4.min.js"]
	};
	this.plugins["jqueryui"] = {
		label: "jQuery UI",
		css: ["https://code.jquery.com/ui/1.12.0/themes/smoothness/jquery-ui.css"],
		js: ["https://code.jquery.com/ui/1.12.0/jquery-ui.js"],
		requires: ['jquery']
	};
	this.plugins["datatables"] = {
		label: "Data Tables",
		js: ["https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"],
		css: ["https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css"],
		requires: ['jquery']
	};
	this.plugins["prettify"] = {
		label: "Prettify",
		js: ["https://cdnjs.cloudflare.com/ajax/libs/prettify/r298/prettify.js"],
		css: ["https://cdnjs.cloudflare.com/ajax/libs/prettify/r298/prettify.css"],
		requires: ['jquery']
	};
	this.plugins["gmaps"] = {
		label: "Google Maps",
		js: ["https://maps.googleapis.com/maps/api/js"],
		plugin: "gmaps.terminus.js",
		requires: ['jquery']
	};
	this.plugins["d3"] = {
		label: "d3",
		js: ["https://code.jquery.com/jquery-2.2.4.min.js"],
		requires: ['jquery']
	};
	this.plugins["select2"] = {
		label: "Select 2",
		js: ["https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.7/js/select2.min.js"],
		css: ["https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.7/css/select2.min.css"],
		plugin: "select2.terminus.js",
		requires: ['jquery']
	};
	this.plugins["jsoneditor"] = {
		label: "JSON Editor",
		js: ["plugins/libs/jsoneditor.min.js"],
		css: ["plugins/libs/jsoneditor.min.css"],
		plugin: "jsoneditor.terminus.js"
	};
	/*this.plugins["bootstrap"] = {
		label: "Bootstrap",
		js: ["https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"],
		css: ["https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.2.2/css/bootstrap.min.css",
			"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.2.2/css/bootstrap-responsive.min.css"]
	};
	this.plugins["flot"] = {
		label: "Flot",
		js: ["https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.min.js",
			"https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.resize.min.js"],
		requires: ["jquery"]
	};*/
}

TerminusPluginManager.prototype.setPluginOptions = function(opts){
	for(var p in opts){
		if(!this.plugins[p]) continue;
		for(var k in opts[p]){
			this.plugins[p][k] = opts[p][k];
		}
	}
}

TerminusPluginManager.prototype.init = function(opts, then){
	if(opts) this.setPluginOptions(opts);
	this.calculatePreloaded();
	var toload = this.calculateRequiredInitPlugins(opts);
	if(toload.length){
		this.loadPlugins(toload, then);
	}
	else if(then){
		then();
	}
}

TerminusPluginManager.prototype.calculateRequiredInitPlugins = function(opts){
	if(opts){
		var pins = [];
		for(var pid in opts){
			if(opts[pid] && pins.indexOf(pid) == -1){
				if(typeof opts[pid] != "object"
				|| typeof opts[pid].loaded == "undefined"
				|| opts[pid].loaded != false) pins.push[pid]
			}
		}
	}
	else {
		var pins = this.getDefaultPlugins();
	}
	var needed_pins = [];
	for(var i = 0; i<pins.length; i++){
		if(this.loaded.indexOf(pins[i]) == -1 && this.preloaded.indexOf(pins[i]) == -1 ){
			needed_pins.push(pins[i])
		}
	}
	return needed_pins;
}

TerminusPluginManager.prototype.getAvailablePlugins = function(){
	return this.plugins;
}

TerminusPluginManager.prototype.calculatePreloaded = function(){
	for(var pl in this.plugins){
		if(this.pluginAvailable(pl)){
			this.preloaded.push(pl);
		}
	}
}

TerminusPluginManager.prototype.pluginAvailable = function(plugin, version_check){
	if(typeof this.plugins[plugin] == "object"){
		var pluginmeta = this.plugins[plugin];
		if(pluginmeta.requires && pluginmeta.requires.length){
			for(var i =0 ; i < pluginmeta.requires.length; i++){
				if(!this.pluginAvailable(pluginmeta.requires[i], version_check)) {
					return false;
				}
			}
		}
		var required_version = (pluginmeta.version ? pluginmeta.version : false);
		switch(plugin){
			case "jquery": {
				if(typeof(jQuery) == "undefined") return false;
				if(version_check && required_version){}
				return true;
				break;
			}
			case "jqueryui": {
				if(typeof jQuery != "undefined" && jQuery.isFunction( jQuery.fn.slider )) return true;
				return false;
				break;
			}
			case "quill": {
				if(typeof Quill == "undefined") return false;
				return true;
				break;
			}
			case "jsoneditor": {
				if(typeof JSONEditor == "undefined") return false;
				return true;
				break;
			}
			case "codemirror": {
				if(typeof CodeMirror == "undefined") return false;
				return true;
			}
			case "font-awesome": {
				return this.fontAwesomeCheck();
			}
			case "datatables": {
				 if(typeof jQuery != "undefined" && jQuery.isFunction( jQuery.fn.dataTable)) return true;
				 return false;
			}
			case "select2": {
				 if(typeof jQuery != "undefined" && jQuery.isFunction( jQuery.fn.select2 )) return true;
				 return false;
			}
			case "gmaps": {
				if(typeof google == "undefined" || typeof google.maps == "undefined") return false;
				return true;
			}
			case "openlayers": {
				if(typeof ol == "undefined" || typeof ol.Map == "undefined") return false;
				return true;
			}
			case "d3": {
				if(typeof d3 == "undefined") return false;
				return true;
			}
		}
	}
	else {
		console.log(new Error(plugin + " is not a supported plugin ID"));
	}
	return false;
};

TerminusPluginManager.prototype.fontAwesomeCheck = function(){
	var span = document.createElement('span');
	span.className = 'fa';
	span.style.display = 'none';
	document.body.insertBefore(span, document.body.firstChild);
	function css(element, property) {
	  return window.getComputedStyle(element, null).getPropertyValue(property);
	}
	var loaded = false;
	if (css(span, 'font-family') == 'FontAwesome') {
		loaded = true;
	}
	document.body.removeChild(span);
	return loaded
}

TerminusPluginManager.prototype.getDefaultPlugins = function(){
	var defplugs = ["font-awesome"];
	return defplugs;
}

TerminusPluginManager.prototype.loadPlugins = function(plugins, then){
	var ticker = plugins.length;
	var cback = function(){
		if(ticker == 0) then();
		ticker--;
	};
	for(var i = 0; i < plugins.length; i++){
		this.loadPlugin(plugins[i], cback);
	}
}

TerminusPluginManager.prototype.loadPlugin = function(plugin, then){
	var pug = this.plugins[plugin];
	if(pug.css){
		for(var i=0; i<pug.css.length; i++){
			var cssid = plugin + "_css_" + i;
			FrameHelper.loadDynamicCSS(cssid, pug.css[i]);
		}
	}
	var scripts = (pug.js ? pug.js : []);
	if(plugin == "gmaps" && pug.key){
		scripts[0] += "?key=" + pug.key;
	}
	if(pug.plugin){
		scripts.push("plugins/" + pug.plugin);
	}
	if(plugin == "codemirror"){
		var cm = scripts[0];
		var sid = plugin + "_js_" + (scripts.length -1);
		scripts.splice(0, 1);
		var self = this;
		var cback = function(){
			self.loadPluginScripts(plugin, scripts, then);
		}
		FrameHelper.loadDynamicScript(sid, cm, cback);
	}
	else {
		this.loadPluginScripts(plugin, scripts, then);
	}
}

TerminusPluginManager.prototype.loadPluginScripts = function(plugin, scripts, then){
	var ticker = scripts.length - 1;
	var self = this;
	var cback = function(){
		if(ticker == 0) {
			if(self.loaded.indexOf(plugin) == -1){
				self.loaded.push(plugin);
			}
			if(self.loading.indexOf(plugin) != -1){
				self.loading.splice(self.loading.indexOf(plugin), 1);
			}
			then();
		}
		ticker--;
	};
	if(scripts.length == 0){
		this.loaded.push(plugin);
	}
	else {
		this.loading.push(plugin);
	}
	for(var i = 0; i<scripts.length; i++){
		var sid = plugin + "_js_" + i;
		FrameHelper.loadDynamicScript(sid, scripts[i], cback);
	}
}

TerminusPluginManager.prototype.loadPageCSS = function(css){
	cssfid = "terminus_client_css";
	var cssdom = document.getElementById(cssfid);
	if(cssdom){
		cssdom.parentNode.removeChild(cssdom);
	}
	if(css){
		cssurl = "css/" + css + ".css";
		FrameHelper.loadDynamicCSS(cssfid, cssurl);
	}
}

TerminusPluginManager.prototype.pluginLoadable = function(pid){
	return (this.precluded.indexOf(pid) !== -1 || this.pluginLoadedOrLoading(pid));
}

TerminusPluginManager.prototype.pluginLoadedOrLoading = function(pid){
	if(this.loaded.indexOf(pid) != -1) return true;
	if(this.preloaded.indexOf(pid) != -1) return true;
	if(this.loading.indexOf(pid) != -1) return true;
	return false;
}

TerminusPluginManager.prototype.disabled = function(pid, obj){
	if(this.precluded.indexOf(pid) != -1) return true;
	if(obj.requires){
		for(var i = 0; i<obj.requires.length; i++){
			if(!this.pluginLoadedOrLoading(obj.requires[i])) return true;
		}
	}
	return false;
}

TerminusPluginManager.prototype.getPluginDOM = function(plugid, obj, ui){
	var cl = document.createElement("span");
	cl.setAttribute("class", "terminus-plugin-control");
	var cbox = document.createElement("input");
	cbox.id = "terminus-plugin-control-" + plugid;
	cbox.type = "checkbox";
	if(this.preloaded.indexOf(plugid) != -1){
		cbox.checked = true;
		cbox.disabled = true;
	}
	else if(this.loaded.indexOf(plugid) != -1){
		cbox.checked = true;
	}
	else if(this.loading.indexOf(plugid) != -1){
		cbox.checked = true;
	}
	else if(this.disabled(plugid, obj)){
		cbox.disabled = true;
	}
	var clab = document.createElement("label");
	clab.setAttribute("class", "terminus-plugin-label terminus-plugin-label-full-css");
	clab.setAttribute("for", cbox.id);
	clab.appendChild(document.createTextNode(obj.label));
	cl.appendChild(clab);
	cl.appendChild(cbox);
	var self = this;
	cbox.addEventListener("change", function(){
		self.togglePlugin(plugid, ui);
	});
	return cl;
}

TerminusPluginManager.prototype.togglePlugin = function(plugid, ui){
	if(this.loaded.indexOf(plugid) == -1){
		var then = function(){
			alert("about to redraw()");
			ui.redraw();
		}
		this.loadPlugin(plugid, then);
	}
	else {
		this.unloadPlugin(plugid);
	}
	FrameHelper.removeChildren(ui.plugins);
	ui.drawPlugins();
}

TerminusPluginManager.prototype.unloadPlugin = function(plugid){
	if(!this.plugins[plugid] || this.loaded.indexOf(plugid) == -1) {
		console.log(new Error(plugid + " plugin unload request when it is not loaded"));
		return false;
	}
	var pug = this.plugins[plugid];
	var num = (pug.js) ? pug.js.length : 0;
	if(pug.plugin) num++;
	for(var i=0; i< num; i++){
		var cssfid = plugid + "_js_" + i;
		var cssdom = document.getElementById(cssfid);
		if(cssdom){
			cssdom.parentNode.removeChild(cssdom);
		}
	}
	num = (pug.css ? pug.css.length : 0);
	for(var i=0; i< num; i++){
		var cssfid = plugid + "_css_" + i;
		var cssdom = document.getElementById(cssfid);
		if(cssdom){
			cssdom.parentNode.removeChild(cssdom);
		}
	}
	this.loaded.splice(this.loaded.indexOf(plugid), 1);
}

TerminusPluginManager.prototype.getAsDOM = function(ui){
	var dm = document.createElement("span");
	dm.setAttribute("class", "terminus-plugin-manager");
	var clh = document.createElement("span");
	clh.setAttribute("class", "terminus-plugin-control-header");
	clh.appendChild(document.createTextNode("Plugins "));
	dm.appendChild(clh);
	for(var pid in this.plugins){
		dm.appendChild(this.getPluginDOM(pid, this.plugins[pid], ui));
	}
	return dm;
}
