/*
 * Draws the screen for viewing and updating the schema
 * and provides wrappers around the client's schema API
 */
const UTILS=require('./Utils')
const TerminusClient = require('@terminusdb/terminus-client');
const HTMLHelper = require('./html/HTMLHelper');
const TerminusViewer = require('./html/TerminusViewer');


function TerminusSchemaViewer(ui){
	this.ui = ui;
	this.tv = new TerminusViewer(ui.client);

	this.mode = "view";
	this.format = "turtle";
	this.confirm_before_update = false;
	this.woql = TerminusClient.WOQL;
	this.views = { 
		classes: {
			title: "Classes"
		}, 
		properties: {
			title: "Properties"
		}, 
		owl: {
			title: "OWL"	
		}
	}

	this.graphs = {
		schema: [],
		instance: [],
		inference: []
	}

	this.graph_filter = "schema"
	this.views_dom = document.createElement("div");
	this.holder = document.createElement("div");

	this.current_view = "classes";
	this.retrieveViews();
}

TerminusSchemaViewer.prototype.clearPanes = function(){
	if(this.views.classes.pane) delete (this.views.classes["pane"])
	if(this.views.properties.pane) delete (this.views.properties["pane"])
	if(this.views.owl.pane) delete (this.views.owl["pane"])
}


TerminusSchemaViewer.prototype.getGraphFilterSelector = function(){
	let opts = []
	if(this.graphs.schema.length == 1){
		opts.push({label: "Schema", value: "schema/" + this.graphs.schema[0]})
	}
	else if(this.graphs.schema.length > 1){
		opts.push({title: "All Schema Graphs", value: "schema/*"})
		for(var i = 0; i<this.graphs.schema.length; i++){
			opts.push({label: "Schema " + this.graphs.schema[i], value: "schema/" + this.graphs.schema[i]})
		}		
	}
	if(this.graphs.inference.length == 1){
		opts.push({label: "Inference", value: "inference/" + this.graphs.inference[0]})
	}
	else if(this.graphs.inference.length > 1){
		opts.push({label: "All Inference Graphs", value: "inference/*"})
		for(var i = 0; i<this.graphs.inference.length; i++){
			opts.push({label: "Inference " + this.graphs.inference[i], value: "inference/" + this.graphs.inference[i]})
		}		
	}
	let self = this
	let callback = function(val){
		self.graph_filter = val
		self.redraw()
	}
	return HTMLHelper.getSelectionControl("graph-filter", opts, this.graph_filter, callback)
}


TerminusSchemaViewer.prototype.getGraphNavigator = function(){
	let d = document.createElement("span")
	let self = this
	this.loadCurrentGraphs().then(() => {
		d.appendChild(this.getGraphFilterSelector())
		let but = document.createElement("button")
		but.appendChild(document.createTextNode("New Graph"))
		but.addEventListener('click', function(){
			self.showNewGraphForm()
		})
		d.appendChild(but)
	})
	return d
}

TerminusSchemaViewer.prototype.loadCurrentGraphs = function() {
	this.graphs = {schema: [], instance: [], inference: []}
	let WOQL = TerminusClient.WOQL;
	let using = `${this.ui.client.account()}/${this.ui.client.db()}/${this.ui.client.repo()}/_commits`
	let q = WOQL.using(using, WOQL.lib().getBranchGraphNames(this.ui.client.checkout()))
	return q.execute(this.ui.client)
	.then((results) => {
		let wr = new TerminusClient.WOQLResult(results, q)
		while(row = wr.next()){
			let sc = row['SchemaName']["@value"]
			if(sc && this.graphs.schema.indexOf(sc) == -1) this.graphs.schema.push(sc)
			let ic = row['InstanceName']["@value"]
			if(ic && this.graphs.instance.indexOf(ic) == -1) this.graphs.instance.push(ic)
			let fc = row['InferenceName']["@value"]
			if(fc && this.graphs.inference.indexOf(fc) == -1) this.graphs.inference.push(fc)
		}
	})
}


TerminusSchemaViewer.prototype.getClassesPane = function() {
	let WOQL = TerminusClient.WOQL;
	let query = WOQL.limit(100)
		.start(0)
		.and(
			WOQL.quad("v:Class", "rdf:type", "owl:Class", this.graph_filter),
			WOQL.opt().quad("v:Class", "rdfs:label", "v:Label", this.graph_filter),
			WOQL.opt().quad("v:Class", "rdfs:subClassOf", "v:Parent", this.graph_filter),
			WOQL.opt().quad("v:Child", "rdfs:subClassOf", "v:Class", this.graph_filter),
			WOQL.opt().quad("v:Class", "rdfs:comment", "v:Comment", this.graph_filter),
			WOQL.opt().quad("v:Class", "tcs:tag", "v:Abstract", this.graph_filter)
	);	
	
	var table = TerminusClient.View.table();
	table.column_order("Class", "Label", "Comment", "Parent", "Child", "Abstract")
	table.column('Comment').header('Description');
	table.column('Class').header('Class ID');
	table.column('Label').header('Name');
	table.column('Child').header('Subclasses');
	table.column('Parent').header('Parent Classes');
	table.column('Range').header('Type');

	var graph = TerminusClient.View.graph();
	graph.edges(["v:Class", "v:Parent"], ["v:Child", "v:Class"], ["v:Class", "v:Abstract"]);
	
	
	graph.height(800);
	graph.width(1200);
	graph.edge("v:Class", "v:Parent").text("Parent Class").distance(120);
	graph.edge("v:Child", "v:Class").text("Parent Class").distance(120);
	graph.edge("v:Class", "v:Abstract").text("Abstract Class").weight(2).color([0,0,0]);
	graph.node("Parent").size(20).color([180, 220, 250]).icon({label: true, size: 0.7, color: [90, 90, 140]});
	graph.node("Class").text("v:Label").size(32).collisionRadius(80).icon({label: true, size: 0.7, color: [24, 34, 89]});

	var rpc = { viewers: [graph] }
    var qp = this.tv.getQueryPane(query, [table], false, [rpc]);
	return qp;
}

TerminusSchemaViewer.prototype.getPropertiesPane = function() {
	let query = this.woql
	   .limit(100)
	   .start(0, this.woql.lib().propertyMetadata(this.graph_filter))
	

    var table = TerminusClient.View.table();
	table.column_order("Property", "Label", "Range", "Domain", "Comment")
	table.column('Comment').header('Description');
	table.column('Property').header('Property ID');
	table.column('Label').header('Name');
	table.column('Domain').header('Domain');
	table.column('Range').header('Type');

	var graph = TerminusClient.View.graph();
	graph.height(800);
	graph.width(1200);
	graph.edges(["Domain", "Property"], ["Property", "Range"]);
	graph.edge("Domain", "Property").text("Domain Class").color([20, 200, 20]).distance(120);
	graph.edge("Property", "Range").text("Property Type").distance(100);
	graph.node("Type").hidden(true);
	graph.node("Range").text("v:Range").size(20).collisionRadius(100).color([220, 250, 180]).icon({label: true, size: 0.8, color: [50, 60, 40]});
	graph.node("Range").v("Type").in("owl:datatypeProperty").hidden(true);
	graph.node("Property").text("v:Label").size(24).collisionRadius(100).color([180, 220, 250]).icon({label: true, size: 0.8, color: [50, 60, 40]});
	graph.node("Domain").color([220, 250, 180]).size(20).collisionRadius(100).icon({label: true, size: 0.7, color: [24, 34, 89]});
	var rpc = { viewers: [graph] }
	var qp = this.tv.getQueryPane(query, [table], false, [rpc]);
	//var qp = this.tv.getQueryPane(query, [graph, table]);
	return qp;
}

TerminusSchemaViewer.prototype.refreshPanes = function(){
	if(this.views.classes.pane) this.views.classes.pane.load();
	if(this.views.properties.pane) this.views.properties.pane.load();
}

TerminusSchemaViewer.prototype.retrieveViews = function(){
	if(!this.views.classes.pane){
		let pane = this.getClassesPane();
		this.views.classes.pane = pane;
		let dom = pane.getAsDOM();
		if(this.current_view != "classes") dom.style.display = "none";
		this.views_dom.appendChild(dom);
		pane.load();
		this.views.classes.dom = dom;
	}
	if(!this.views.properties.pane){
		let pane = this.getPropertiesPane();
		this.views.properties.pane = pane;
		let dom = pane.getAsDOM();
		if(this.current_view != "properties") dom.style.display = "none";
		this.views_dom.appendChild(dom);
		this.views.properties.dom = dom;
		pane.load();
	}
	if(!this.views.owl.dom){
		this.views.owl.dom = this.getOWLView();
		this.views_dom.appendChild(this.views.owl.dom);
		if(this.current_view != "owl") this.views.owl.dom.style.display = "none";		
	}
}

TerminusSchemaViewer.prototype.redraw = function(){
	HTMLHelper.removeChildren(this.holder)
	this.clearPanes()
	this.getAsDOM()
	//this.refreshPanes()
}


/*
 * Retrieves schema from API and writes the response into the page
 */
TerminusSchemaViewer.prototype.getAsDOM = function(){
	this.holder.appendChild(this.getGraphNavigator())

	this.controldom = document.createElement("div");
	this.controldom.setAttribute("class", "terminus-schema-controls");
	this.controldom.appendChild(this.getTabsDOM());
	this.view = document.createElement("div");
	this.view.setAttribute("class", "terminus-schema-view");
	this.view.appendChild(this.views_dom);
	this.pagedom = document.createElement("div");
	this.pagedom.setAttribute("class", "terminus-schema-viewer");
	this.holder.appendChild(this.controldom);
	this.pagedom.appendChild(this.view);
	this.holder.appendChild(this.pagedom);
	return this.holder;
}

TerminusSchemaViewer.prototype.getOWLView = function(){
	var owldom = document.createElement("div");
	this.loadSchema();
	return owldom;
}

TerminusSchemaViewer.prototype.updateOWLContents = function(){
	var owldom = this.views.owl.dom;
	HTMLHelper.removeChildren(owldom);
	if(this.mode == 'view'){
		owldom.appendChild(this.getSchemaEditButton());
		owldom.appendChild(this.getSchemaViewDOM());
	}
	else if(this.mode == "edit"){
		owldom.appendChild(this.getSchemaSaveButtons());
		owldom.appendChild(this.getSchemaEditDOM());
		owldom.appendChild(this.getSchemaSaveButtons());
	}
}


TerminusSchemaViewer.prototype.getTabsDOM = function(){
	var ul = document.createElement('ul');
	ul.setAttribute('class', 'terminus-ul-horizontal');
	for(var k in this.views){
		var a = this.getTabDOM(k, this.views[k].title);
		ul.appendChild(a);
		if(k == this.current_view) 	UTILS.setSelectedSubMenu(a);
	}
	return ul;
}

TerminusSchemaViewer.prototype.getTabDOM = function(view, title){
	var a = document.createElement('a');
    a.setAttribute('class', 'terminus-a terminus-hz-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
    var self = this;
    a.addEventListener("click", function(){
        self.switchView(this, view);
    })
	a.appendChild(document.createTextNode(title));
    return a;
}

TerminusSchemaViewer.prototype.switchView = function(a, view){
	UTILS.setSelectedSubMenu(a);
	if(view != this.current_view){
		this.current_view = view;
		this.toggleTabs();
	}
}

TerminusSchemaViewer.prototype.toggleTabs = function(){
	for(var k in this.views){
		if(this.views[k].dom && k == this.current_view) this.views[k].dom.style.display = "block";
		else if(this.views[k].dom) this.views[k].dom.style.display = "none";
	}
}

TerminusSchemaViewer.prototype.loadSchema = function(msg, msgtype){
	var self = this;
	this.ui.showBusy("Fetching Database Schema");
	return this.ui.client.getSchema("main")
	.then(function(response){
		self.ui.clearBusy();
		self.schema = response;
		self.updateOWLContents() 
	})
	.catch(function(error){
		self.ui.clearBusy();
		self.ui.showError(error);
	});
}

TerminusSchemaViewer.prototype.getSchemaSaveButtons = function(){
	var ssb = document.createElement("span");
	ssb.setAttribute("class", "terminus-schema-save-buttons");
	ssb.appendChild(this.getCancelButton());
	ssb.appendChild(this.getSaveButton());
	return ssb;
}

TerminusSchemaViewer.prototype.getCancelButton = function(is_import){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		self.mode = "view";
		self.updateOWLContents();
	}
	return this.getSchemaButton("Cancel", "cancel_update", func);
}

TerminusSchemaViewer.prototype.getSaveButton = function(){
	var self = this;
	var func = function(){
		self.ui.clearMessages();
		var text = self.schema_edit_dom.value;
		if(typeof(self.schema) == "object"){
			text = JSON.parse(text);
		}
		var opts = {};
		opts['terminus:encoding'] =  'terminus:' + self.format;
		if(!(TerminusClient.UTILS.empty(self.schema_edit_dom_name)))
			opts['schemaId'] = self.ui.client.connectionConfig.dbURL() + '/' + self.schema_edit_dom_name.value;
		else opts['schemaId'] = self.ui.client.connectionConfig.dbURL() + '/' + 'schema';
		return self.updateSchema(text, opts);
	}
	return this.getSchemaButton("Save", "update_schema", func);
}

TerminusSchemaViewer.prototype.getSchemaEditButton = function(){
	var ssb = document.createElement("span");
	ssb.setAttribute("class", "terminus-schema-save-buttons");
	var self = this;
	var func = function(){
		self.mode = "edit";
		self.updateOWLContents();
	}
	var but = this.getSchemaButton("Edit", "update_schema", func);
	ssb.appendChild(but);
	return ssb;
}

/*
 * Updates schema, then fetches updated version and updates the page with it
 */
TerminusSchemaViewer.prototype.updateSchema  = function(text, opts) {
	this.ui.showBusy("Updating Database Schema");
	var self = this;
	return this.ui.client.updateSchema(false, text, opts)
	.then(function(response){
		if(response['terminus:status'] && response['terminus:status'] == "terminus:success"){
			self.ui.showBusy("Retrieving updated schema");
			self.mode = "view";
			self.loadSchema("Successfully Updated Schema");
			self.refreshPanes();
			self.updateOWLContents();
		}
		else if(response['terminus:status'] && response['terminus:status'] == "terminus:failure"){
			self.ui.clearBusy();
			self.ui.showViolations(response['terminus:witnesses'], "schema");
		}
		else {
			throw new Error("Update Schema returned no terminus:status code");
		}
	})
	.catch(function(error){
		self.ui.clearBusy();
		if(error.data && error.data['terminus:witnesses']){
			self.ui.showViolations(error.data['terminus:witnesses'], "schema");
		}
		else {
			self.ui.showError(error);
		}
	});
}

TerminusSchemaViewer.prototype.getSchemaEditDOM = function(){
	var np = document.createElement("div");
	np.setAttribute("class", "terminus-schema-page terminus-schema-edit-page");
	if(this.ui.showControl("add_new_library")) var sid = this.getSchemaNameInputDOM(np);
	var ipval = document.createElement("textarea");
	ipval.setAttribute("class", "terminus-schema-edit terminus-schema-textarea");
	ipval.setAttribute("width", "100%");
	ipval.setAttribute("style", "min-width: 400px; min-height: 400px;");
	if(typeof(this.schema) == "string"){
		ipval.innerHTML = this.schema;
	}
	else if(typeof (this.schema) == "object") {
		ipval.innerHTML = JSON.stringify(this.schema, 0, 4);
	}
	if(this.ui.showControl("add_new_library")) this.schema_edit_dom_name = sid;
	this.schema_edit_dom = ipval;
	np.appendChild(ipval);
	UTILS.stylizeEditor(this.ui, ipval, 'schema', 'turtle');
	return np;
}

TerminusSchemaViewer.prototype.getSchemaViewDOM = function(){
	var self = this;
	var np = document.createElement("div");
	np.setAttribute("class", "terminus-schema-page terminus-schema-view-page");
	var ipval = document.createElement("pre");
	ipval.setAttribute("class", "terminus-schema-view terminus-scheme-pre");
	if(typeof(this.schema) == "string"){
		var txt = this.schema.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
		ipval.innerHTML = txt;
	}
	else if(typeof (this.schema) == "object") {
		ipval.innerHTML = JSON.stringify(this.schema, 0, 4);
	}
	var cm = UTILS.stylizeCodeDisplay(this.ui, ipval, np, 'turtle');
	if(!cm) np.appendChild(ipval);
	return np;
}

TerminusSchemaViewer.prototype.getSchemaButton = function(label, action, func){
	var opt = document.createElement("button");
	opt.appendChild(document.createTextNode(label));
	opt.setAttribute("class", "terminus-btn terminus-control-button terminus-schema-" + action);
	opt.addEventListener("click", func);
	return opt;
}

TerminusSchemaViewer.prototype.showNewGraphForm = function(){
	let bground = document.createElement("div")
	bground.style = "position: fixed; z-index: 99999999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgb(0,0,0); background-color: rgba(0,0,0,0.7);" 
	let cbox = document.createElement("div")
	cbox.style = "background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888;width: 60%;"

	var mfd = document.createElement('div');
	mfd.setAttribute('class', 'terminus-form-border ');
	cbox.appendChild(mfd)

	var sci = document.createElement("div");
	sci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var slab = document.createElement("span");
	slab.setAttribute("class", "terminus-id-label terminus-form-label terminus-control-label");
	slab.appendChild(document.createTextNode("ID"));
	sci.appendChild(slab);
	var idip = document.createElement("input");
	idip.setAttribute("type", "text");
	idip.setAttribute("class", "terminus-form-value terminus-input-text");
	idip.setAttribute("placeholder", "No spaces or special characters allowed in IDs");
	sci.appendChild(idip);

	mfd.appendChild(sci)

	var tci = document.createElement("div");
	tci.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	
	var tlab = document.createElement("span");
	tlab.setAttribute("class", "terminus-type-label terminus-form-label terminus-control-label");
	tlab.appendChild(document.createTextNode("Type"));
	tci.appendChild(tlab);
	var selh = document.createElement("span");
	selh.style = "display: inline-block; clear: right"
	var sel = document.createElement("select");
	selh.appendChild(sel)
	let sopt = document.createElement("option")
	sopt.value = "schema"
	sopt.appendChild(document.createTextNode("Schema"))
	sel.appendChild(sopt)
	let iopt = document.createElement("option")
	iopt.value = "inference"
	iopt.appendChild(document.createTextNode("Inference"))
	sel.appendChild(iopt)
	let fpt = document.createElement("option")
	fpt.value = "instance"
	fpt.appendChild(document.createTextNode("Instance"))
	sel.appendChild(fpt)
	tci.appendChild(selh);

	mfd.appendChild(tci)

	var com = document.createElement("div");
	com.setAttribute("class", "terminus-form-field terminus-form-field-spacing terminus-form-horizontal terminus-control-group");
	var clab = document.createElement("span");
	clab.setAttribute("class", "terminus-title-label terminus-form-label terminus-control-label");
	clab.appendChild(document.createTextNode("Commit Message"));
	com.appendChild(clab);
	var descip = document.createElement("textarea");
	descip.setAttribute("class", "terminus-textarea terminus-db-description terminus-textarea ");
	descip.setAttribute("placeholder", "A short text describing the database and its purpose");
	com.appendChild(descip);
	
	mfd.appendChild(com)

	let buttons = document.createElement("div")
	buttons.setAttribute("class", "terminus-control-buttons");
	let cancel = document.createElement("button")
	cancel.setAttribute("class", "terminus-control-button terminus-cancel-db-button terminus-btn terminus-btn-float-right");
	cancel.appendChild(document.createTextNode("Cancel"))
	let self = this
	cancel.addEventListener('click', function(){
		self.holder.removeChild(bground)	
	})
	let confirm = document.createElement("button")
	confirm.setAttribute("class", "terminus-control-button terminus-confirm-button terminus-btn terminus-btn-float-right");
	confirm.appendChild(document.createTextNode("Create Graph"))
	confirm.addEventListener('click', function(){
		let id = idip.value
		let type = sel.value
		let commit_msg = descip.value
		if(id && type && commit_msg){
			self.createGraph(id, type, commit_msg)
			self.holder.removeChild(bground)
		}	
	})
	buttons.appendChild(cancel)
	buttons.appendChild(confirm)
	mfd.appendChild(buttons)
	bground.appendChild(cbox)
	self.holder.appendChild(bground)	
}

TerminusSchemaViewer.prototype.createGraph = function(id, type, msg){
	this.ui.client.createGraph(type, id, msg)
	.then(() => {
		if(type != "instance") this.graph_filter = type + "/" + id
		this.redraw()
	})
}


module.exports=TerminusSchemaViewer
