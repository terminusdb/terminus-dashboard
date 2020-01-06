const TerminusCodeSnippet = require('./query/TerminusCodeSnippet');
const Datatypes = require("./Datatypes");
const DatatypeRenderers = require("./DatatypeRenderers");

const SimpleTable = require("./table/SimpleTable");
const SimpleGraph = require("./graph/SimpleGraph");
const SimpleStream = require("./stream/SimpleStream");
const SimpleChooser = require("./chooser/SimpleChooser");
const HTMLHelper = require('./HTMLHelper');

/**
 * Result Pane is defined by a WOQL configuration object
 * Visually it consists of a single rule editor (showing the current state of the configuration object) which may be collapsed behind a configuration link
 * and a single result view which shows the result of the rule when applied to the current results.
 *
 */
function ResultPane(client, querypane, config){
    this.client = client;
    this.qp = querypane;
    this.config = config;
	this.container = document.createElement('span');
    this.container.setAttribute('class', 'terminus-result-pane');
}

ResultPane.prototype.options = function(opts){
	this.showConfig = (opts && typeof opts.showConfig != "undefined" ? opts.showConfig : false);
    this.editConfig = (opts && typeof opts.editConfig != "undefined" ? opts.editConfig : false);
    this.changeViewType = (opts && typeof opts.changeViewType != "undefined" ? opts.changeViewType : true);
    this.intro = (opts && typeof opts.intro != "undefined" ? opts.intro : false);
    this.renderers =  (opts && opts.renderers ? opts.renderers : {
		table: new SimpleTable(),
		graph: new SimpleGraph(),
		stream: new SimpleStream(),
		chooser: new SimpleChooser()
    });
    if(this.config){
        this.viewers = [this.config];
    }
    this.viewers =  (opts && typeof opts.viewers != "undefined" ? this.viewers.concat(opts.viewers) : this.viewers);
    this.currentViewer = 0;
    return this;
}

ResultPane.prototype.getRenderer = function(){
    if(this.config && this.config.renderer()){
        return this.config.renderer();
    }
    else {
        if(this.config.type && this.renderers[this.config.type]){
            return this.renderers[this.config.type];
        }
    }
    return false;
}

ResultPane.prototype.getAsDOM = function(){
    if(this.intro){
        var di = (typeof this.intro == "string" ? document.createTextNode(this.intro) : this.intro);
		this.container.appendChild(di);
	}
    var configspan = document.createElement("span");
    configspan.setAttribute("class", "pane-config-icons");
    this.container.appendChild(configspan);
	this.resultDOM = document.createElement('span');
	this.resultDOM.setAttribute('class', 'terminus-result-view');
	if(this.result){
		this.resultDOM.appendChild(this.getResultDOM());
	}
	this.container.appendChild(this.resultDOM);
	if(this.showConfig){
        this.showingQuery = (this.showConfig != "icon");
		var mode = (this.editConfig ? "edit" : "view");
		this.input = this.createInput(mode);
		var ipdom = this.input.getAsDOM();
        var ispan = document.createElement("span");
        ispan.addEventListener('mouseover', function(){
            this.style.cursor = "pointer";
		});
		ispan.setAttribute("class", "result-pane-config");
		var ic = document.createElement("i");
		ispan.appendChild(ic);
		configspan.appendChild(ispan);
		var self = this;
		function showQueryConfig(){
			configspan.title="Click to Hide View Configuration";
			ic.setAttribute("class", "fas fa fa-times-circle");
            if(configspan.nextSibling){
                self.container.insertBefore(ipdom, configspan.nextSibling);
                if(self.input.snippet.value)
					self.input.stylizeSnippet();
            }
            else{
                self.container.appendChild(ipdom);
                if(self.input.snippet.value)
					self.input.stylizeSnippet();
            }
		}
		function hideQueryConfig(){
			configspan.title="Click to View Configuration";
            ic.setAttribute("class", "terminus-result-icons terminus-result-view-icon " + self.getViewConfigIconClass());
			self.container.removeChild(ipdom);
		}
		ispan.addEventListener("click", () => {
			if(this.showingQuery) hideQueryConfig();
			else showQueryConfig();
			this.showingQuery = !this.showingQuery;
        });
        showQueryConfig();
		if(this.showConfig == "icon") hideQueryConfig();
    }
    if(this.changeViewType){
        cvicons = this.getViewTypeIconDOM(ipdom);
        if(cvicons) configspan.prepend(cvicons);
    }
	return this.container;
}

ResultPane.prototype.getViewConfigIconClass = function(){
    if(this.changeViewType && this.viewers.length > 1){
        return "fas fa fa-vial";
    }
    if(this.viewers[this.currentViewer].icon){
        return this.viewers[this.currentViewer].icon;
    }
    var def = this.getDefaultViewerIcon(this.viewers[this.currentViewer]);
    return def.icon;
}


ResultPane.prototype.getViewTypeIconDOM = function(sp, ipdom){
    var bsp = document.createElement('span');
    bsp.setAttribute('class', 'terminus-result-icons');
    if(this.viewers.length > 1){
        for(var i = 0; i<this.viewers.length; i++){
            var isp = this.getIconForViewer(this.viewers[i], i, bsp);
            bsp.appendChild(isp);
        }
    }
    return bsp;
}

ResultPane.prototype.changeViewerType = function(viewer, index){
    this.currentViewer = index;
    this.config = viewer;
    if(this.input){
        this.input.setQuery(viewer);
        this.input.submit(this.input.qObj);
    }
    else {
        this.updateView(viewer);
    }    
}


ResultPane.prototype.getDefaultViewerIcon = function(viewer){
    var view_types = {
        table: {label: "Table", icon: "fa fa-table"},
		graph: {label: "Graph", icon: "fas fa-code-branch"},
		chooser: {label: "Drop-down List", icon: "fas fa-caret-down"},
		stream: {label: "Result Stream", icon: "fa fa-list"}
    }
    return view_types[viewer.type];
}


ResultPane.prototype.getIconForViewer = function(viewer, index, container){
    var isp = document.createElement('span');
    var icon = document.createElement("i");
    var def = this.getDefaultViewerIcon(viewer);
    icon.title = (viewer.label) ? viewer.label : def.label;
    var ic = (viewer.icon ? viewer.icon : def.icon);
    icon.setAttribute("class", ic);
    icon.classList.add('terminus-result-view-icon');
    //icon.classList.add('circle-icon');
    isp.appendChild(icon);
    if(this.currentViewer == index){
        isp.setAttribute("class", "result-icon-selected selected terminus-result-selected");
        icon.classList.add('terminus-view-selected');
    }
    else {
        isp.setAttribute("class", "result-icon-selectable selectable");
        isp.addEventListener('mouseover', function(){
            this.style.cursor = "pointer";
		});
    }
    isp.addEventListener("click", () => {
        this.changeViewerType(viewer, index);
        HTMLHelper.removeChildren(container);
        for(var i = 0; i<this.viewers.length; i++){
            var isp = this.getIconForViewer(this.viewers[i], i, container);
            container.appendChild(isp);
        }
    });
    return isp;
}

ResultPane.prototype.createInput = function(mode){
    let input = new TerminusCodeSnippet("rule", mode);
    if(this.config){
    	input.setQuery(this.config);
	}
	var self = this;
	input.submit = function(config){
		self.updateView(config);
	};
	return input;
}

ResultPane.prototype.setResult = function(wres){
	this.result = wres;
}

ResultPane.prototype.updateResult = function(wres){
	this.result = wres;
	HTMLHelper.removeChildren(this.resultDOM);
	this.resultDOM.appendChild(this.getResultDOM());
}

ResultPane.prototype.updateView = function(config){
	this.config = config;
	HTMLHelper.removeChildren(this.resultDOM);
	if(this.result){
		this.resultDOM.appendChild(this.getResultDOM());
	}
}

ResultPane.prototype.getResultDOM = function(){
	let span = document.createElement("span");
	span.setAttribute("class", "terminus-query-results");
    let viewer = this.config.create(this.client);
    viewer.datatypes = new DatatypeRenderers();
    Datatypes.initialiseDataRenderers(viewer.datatypes);
    var self = this;
    viewer.notify = function(r){
        self.qp.updateResult(r);
    }
	this.result.first();
    viewer.setResult(this.result);
    
    var html_renderer = this.getRenderer();

	span.appendChild(html_renderer.render(viewer));
	return span;
}

module.exports = ResultPane;
