/**
 * User interface elements that relate to server context 
 * 
 * TerminusServerController is a control widget that invokes server actions
 * TerminusServerViewer is a window that displays server actions and server screens
 * 
 */
 function TerminusServerController(ui){
	 this.ui = ui;
 }

TerminusServerController.prototype.getAsDOM = function(){
	var rsc = document.createElement("div");
	rsc.setAttribute("class", "terminus-server-controller");
	var self = this;
	if(this.ui && this.ui.server()){
		var scd = document.createElement("div");
		scd.setAttribute("class", "terminus-server-connection");
		var lab = document.createElement("span");
		lab.setAttribute("class", "terminus-server-label");
		lab.appendChild(document.createTextNode("Server "));
		scd.appendChild(lab);
		scd.appendChild(this.getServerLabelDOM());
		rsc.appendChild(scd);
		if(this.ui.showControl("change-server")){
			var csbut = document.createElement("button");
			csbut.setAttribute("class", "terminus-control-button terminus-change-server-button")
			csbut.appendChild(document.createTextNode("Change Server"));
			csbut.addEventListener("click", function(){
				self.ui.showLoadURLPage();
			})
			rsc.appendChild(csbut);
		}
		if(this.ui.showControl("db")){
			var nscd = document.createElement("button");
			nscd.setAttribute("class", "terminus-control-button terminus-server-connection");
			nscd.appendChild(document.createTextNode("View Databases"));
			nscd.addEventListener("click", function(){
				if(self.ui.db()){
					self.ui.clearDB();
				}
				self.ui.showServerMainPage();
			})
			rsc.appendChild(nscd);
		}
		if(this.ui.showControl("create_database")){
			var crbut = document.createElement("button");
			crbut.setAttribute("class", "terminus-control-button terminus-create-db-button")
			crbut.appendChild(document.createTextNode("Create New Database"));
			crbut.addEventListener("click", function(){
				if(self.ui.db()){
					self.ui.clearDB();
				}
				self.ui.showCreateDBPage();
			})
			rsc.appendChild(crbut);
		}
	}
	return rsc;
}

TerminusServerController.prototype.getServerLabelDOM = function(){
	var srec = this.ui.client.getServerRecord();
	var lab = (srec && srec['rdfs:label'] && srec['rdfs:label']["@value"] ? srec['rdfs:label']["@value"] : this.ui.server());
	var desc = (srec && srec['rdfs:comment'] && srec['rdfs:comment']["@value"] ? srec['rdfs:comment']["@value"] : "");
	desc += " Server URL: "+ this.ui.server();
	var val = document.createElement("span");
	val.setAttribute("class", "terminus-server-value");
	val.setAttribute("title", desc);
	val.appendChild(document.createTextNode(lab));
	return val;
}

function TerminusServerViewer(ui){
	this.ui = ui;
	this.server = this.ui.server();
}

TerminusServerViewer.prototype.getAsDOM = function(selected){
	var self = this;
	var pd = document.createElement("span");
	pd.setAttribute("class", "terminus-server-home-page");
	if(this.ui.server()){
		var scd = document.createElement("span");
		scd.setAttribute("class", "terminus-server-home");
		if(this.ui.showView("server")){
			scd.appendChild(this.getServerDetailsDOM());
		}
		if(this.ui.showView("change-server")){
			var csbut = document.createElement("button");
			csbut.setAttribute("class", "terminus-control-button terminus-change-server-button")
			csbut.appendChild(document.createTextNode("Disconnect"));
			csbut.addEventListener("click", function(){
				self.ui.clearDB();
				self.ui.clearServer();
				self.ui.showLoadURLPage();
			})
			scd.appendChild(csbut);
		}
		if(this.ui.showView("create_database")){
			var crbut = document.createElement("button");
			crbut.setAttribute("class", "terminus-control-button terminus-create-db-button")
			crbut.appendChild(document.createTextNode("Create New Database"));
			crbut.addEventListener("click", function(){
				if(self.ui.db()){
					self.ui.clearDB();
				}
				self.ui.clearMessages();
				self.ui.showCreateDBPage();
			})
			scd.appendChild(crbut);
		}
		if(this.ui.showView("db")){
			scd.appendChild(this.getDBListDOM());
		}
		pd.appendChild(scd);
	}
	else {
		pd.appendChild(this.getLoadURLPage());
	}
	return pd;
}

TerminusServerViewer.prototype.getServerDetailsDOM = function(){
	var scd = document.createElement("span");
	scd.setAttribute("class", "terminus-server-details");
	var scl = document.createElement("span");
	scl.setAttribute("class", "terminus-label terminus-server-details-label");
	scl.appendChild(document.createTextNode("Server"))
	var scs = document.createElement("span");
	scs.setAttribute("class", "terminus-value terminus-server-details-value");
	scs.appendChild(document.createTextNode(this.ui.server()))
	scd.appendChild(scl);
	scd.appendChild(scs);
	return scd;
}

TerminusServerViewer.prototype.wrapTableLinkCell = function(dbid, text){
	var self = this;
	var wrap = document.createElement("a");
	wrap.setAttribute("href", "#");
	wrap.appendChild(document.createTextNode(text));
	wrap.addEventListener("click", function(){
		self.ui.connectToDB(dbid);
		self.ui.showDBMainPage();
	});
	return wrap;
}

TerminusServerViewer.prototype.getDBListDOM = function(){
	var self = this;
	var sec = document.createElement("div");
	sec.setAttribute("class", "terminus-db-list-section");
	var lihed = document.createElement("h2");
	lihed.setAttribute("class", "terminus-db-list-title");
	lihed.appendChild(document.createTextNode("Available Databases"));
	sec.appendChild(lihed);
	var scd = document.createElement("table");
	scd.setAttribute("class", "terminus-db-list");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var th1 = document.createElement("th");
	th1.appendChild(document.createTextNode("ID"));
	th1.setAttribute("class", "terminus-db-id");
	var th2 = document.createElement("th");
	th2.appendChild(document.createTextNode("Title"));
	th2.setAttribute("class", "terminus-db-title");
	var th3 = document.createElement("th");
	th3.appendChild(document.createTextNode("Description"));
	th3.setAttribute("class", "terminus-db-description");
	var th4 = document.createElement("th");
	th4.setAttribute("class", "terminus-db-size");
	th4.appendChild(document.createTextNode("Size"));
	var th5 = document.createElement("th");
	th5.setAttribute("class", "terminus-db-created");
	th5.appendChild(document.createTextNode("Created"));
	var th6 = document.createElement("th");
	th6.appendChild(document.createTextNode("Delete"));
	th6.setAttribute("class", "terminus-db-delete");
	thr.appendChild(th1);
	thr.appendChild(th2);
	thr.appendChild(th3);
	thr.appendChild(th4);
	thr.appendChild(th5);
	thr.appendChild(th6);
	thead.appendChild(thr);
	scd.appendChild(thead);
	var tbody = document.createElement("tbody");
	var dbrecs = this.ui.client.getServerDBRecords();
	for(var fullid in dbrecs){
		var dbrec = dbrecs[fullid];
		var dbid = fullid.split(":")[1];
		var tr = document.createElement("tr");
		var td1 = document.createElement("td");
		td1.appendChild(this.wrapTableLinkCell(dbid, dbid));
		td1.setAttribute("class", "terminus-db-id");
		var td2 = document.createElement("td");
		td2.setAttribute("class", "terminus-db-title");
		var txt = (dbrec && dbrec['rdfs:label'] && dbrec['rdfs:label']['@value'] ? dbrec['rdfs:label']['@value'] : "");
		td2.appendChild(this.wrapTableLinkCell(dbid, txt));
		var td3 = document.createElement("td");
		td3.setAttribute("class", "terminus-db-description");
		var txt = (dbrec && dbrec['rdfs:comment'] && dbrec['rdfs:comment']['@value'] ? dbrec['rdfs:comment']['@value'] : "");
		td3.appendChild(this.wrapTableLinkCell(dbid, txt));
		var td4 = document.createElement("td");
		td4.setAttribute("class", "terminus-db-size");
		var txt = (dbrec && dbrec['terminus:size'] && dbrec['terminus:size']['@value'] ? dbrec['terminus:size']['@value'] : "");
		td4.appendChild(this.wrapTableLinkCell(dbid, txt));
		var td5 = document.createElement("td");
		td5.setAttribute("class", "terminus-db-created");
		var txt = (dbrec && dbrec['terminus:last_updated'] && dbrec['terminus:last_updated']['@value'] ? dbrec['terminus:last_updated']['@value'] : "");
		td5.appendChild(this.wrapTableLinkCell(dbid, txt));
		var td6 = document.createElement("td");
		td6.setAttribute("class", "db-delete");
		if(this.deleteDBPermitted(dbid)){
			var delbut = document.createElement("button");
			delbut.appendChild(document.createTextNode("Delete"));
			delbut.setAttribute("class", "terminus-control-button terminus-delete-db-button");
			//function to fix db in a closure
			var delDB = function(db){ return function(){self.ui.deleteDatabase(db);}};
			delbut.addEventListener("click", delDB(dbid));
			td6.appendChild(delbut);
		}
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);
		tr.appendChild(td5);
		tr.appendChild(td6);
		tbody.appendChild(tr);
	}
	scd.appendChild(tbody);
	sec.appendChild(scd);
	return sec;
}

TerminusServerViewer.prototype.deleteDBPermitted = function(dbid){
	if(this.ui.client.capabilitiesPermit("delete_database", dbid)) return true;
	return false;
}

