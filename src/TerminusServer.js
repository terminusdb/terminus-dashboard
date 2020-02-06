/* User interface elements that relate to server context
 *
 * TerminusServerController is a control widget that invokes server actions
 * TerminusServerViewer is a window that displays server actions and server screens
 *
 */
 const Datatables = require('./plugins/datatables.terminus');
 const UTILS =require('./Utils');
 const HTMLHelper = require('./html/HTMLHelper');
 
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
        var nav = document.createElement('div');
        nav.setAttribute('class', 'span3');
        var ul = document.createElement('ul');
        ul.setAttribute('class', 'terminus-ul');
        nav.appendChild(ul);
        rsc.appendChild(nav);
        // connected to server
        // change server
        if(this.ui.showControl("change-server")){
            var a = document.createElement('a');
            a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
            var self = this;
            a.addEventListener("click", function(){
				UTILS.activateSelectedNav(this, self);
				self.ui.clearMessages();
                self.ui.showLoadURLPage();
            })
            var icon = document.createElement('i');
            icon.setAttribute('class', 'terminus-menu-icon fa fa-link');
            a.appendChild(icon);
            var txt = document.createTextNode('Change Server');
            a.appendChild(txt);
            ul.appendChild(a);
        }
        // view databases
        if(this.ui.showControl("db")){
            var a = document.createElement('a');
            a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
            var self = this;
            a.addEventListener("click", function(){
                UTILS.activateSelectedNav(this, self);
                if(self.ui.db()){
                    self.ui.clearDB();
					self.ui.redrawControls();
                }
				self.ui.clearMessages();
                self.ui.showServerMainPage();
            })
            var icon = document.createElement('i');
            icon.setAttribute('class', 'terminus-menu-icon fa fa-home');
            a.appendChild(icon);
            var txt = document.createTextNode('Home');
            a.appendChild(txt);
            ul.appendChild(a);
        }
		if(this.ui.showControl("create_database")){
            var a = document.createElement('a');
            a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
            var self = this;
            a.addEventListener("click", function(){
               UTILS.activateSelectedNav(this, self);
                if(self.ui.db()){
                    self.ui.clearDB();
					self.ui.redrawControls();
				}
				self.ui.clearMessages();
                self.ui.showCreateDBPage();
            })
            var icon = document.createElement('i');
            icon.setAttribute('class', 'terminus-menu-icon fa fa-plus');
            a.appendChild(icon);
            var txt = document.createTextNode('Create Database');
            a.appendChild(txt);
            ul.appendChild(a);
        }
        if(this.ui.showControl("collaborate")){
            var a = document.createElement('a');
            a.setAttribute('class', 'terminus-a terminus-list-group-a terminus-list-group-a-action terminus-nav-width terminus-pointer');
            var self = this;
            a.addEventListener("click", function(){
               UTILS.activateSelectedNav(this, self);
                if(self.ui.db()){
                    self.ui.clearDB();
					self.ui.redrawControls();
                }
				self.ui.clearMessages();
                self.ui.showCollaboratePage();
            })
            var icon = document.createElement('i');
            icon.setAttribute('class', 'terminus-menu-icon fa fa-share-alt');
            a.appendChild(icon);
            var txt = document.createTextNode('Collaborate');
            a.appendChild(txt);
            ul.appendChild(a);
		}
	}
	return rsc;
}

TerminusServerController.prototype.getServerLabelDOM = function(){
	var srec = this.ui.client.connection.getServerRecord();
	var lab = (srec && srec['rdfs:label'] && srec['rdfs:label']["@value"] ? srec['rdfs:label']["@value"] : this.ui.server());
	var desc = (srec && srec['rdfs:comment'] && srec['rdfs:comment']["@value"] ? srec['rdfs:comment']["@value"] : "");
	desc += " Server URL: "+ this.ui.server();
	var val = document.createElement("span");
	val.setAttribute("class", "terminus-server-value");
	val.setAttribute("title", desc);
	val.appendChild(document.createTextNode(lab));
    val =  document.createElement('div');
	return val;
}

function TerminusServerViewer(ui){
	this.ui = ui;
	this.server = this.ui.server();
	this.max_cell_size = 500;
	this.max_word_size = 40;
	this.css_base = "https://terminusdb.github.io/terminus-dashboard/dist/";

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
			csbut.setAttribute("class", "terminus-control-button terminus-change-server-button terminus-btn")
			csbut.appendChild(document.createTextNode("Disconnect"));
			csbut.addEventListener("click", function(){
				if(self.ui.db()){
					self.ui.clearDB();
				}
				self.ui.showLoadURLPage();
			})
			// 11092019 scd.appendChild(csbut);
		}
		if(this.ui.showView("create_database")){
			var crbut = document.createElement("button");
			crbut.setAttribute("class", "terminus-control-button terminus-create-db-button terminus-btn")
			crbut.appendChild(document.createTextNode("Create New Database"));
			crbut.addEventListener("click", function(){
				if(self.ui.db()){
					self.ui.clearDB();
				}
				self.ui.clearMessages();
				self.ui.showCreateDBPage();
			})
		}
		if(this.ui.showView("db")){
			scd.appendChild(this.getDBListDOM());
		}
		pd.appendChild(scd);
	}
	else {
		self.ui.showLoadURLPage();
	}
	return pd;
}

TerminusServerViewer.prototype.getServerDetailsDOM = function(){
	var scd = document.createElement("div");
	scd.setAttribute("class", "terminus-server-details terminus-welcome-box terminus-no-res-alert");
	var icon = document.createElement("img");
	icon.setAttribute("class", "terminus-server-main-logo")
	var url = this.css_base + "css/img/TerminusDB_Logo_Original.png" 
	icon.setAttribute("src", url);
	scd.appendChild(icon);
	var scl = document.createElement("p");
	scl.setAttribute("class", "terminus-server-running")
	scl.appendChild(document.createTextNode("Terminus Server running at "))
	scl.appendChild(document.createTextNode(this.ui.server()))
	scd.appendChild(scl);
	return scd;
}

TerminusServerViewer.prototype.wrapTableLinkCell = function(tdElement,dbid, text){
	var self = this;
	var wrap = document.createElement("p");
//	wrap.setAttribute("href", "#");
	wrap.setAttribute("class", "terminus-table-content");
	HTMLHelper.wrapShortenedText(wrap, text, this.max_cell_size, this.max_word_size);
	tdElement.addEventListener("click", function(){
		self.ui.connectToDB(dbid);
		self.ui.showDBMainPage();
	});
	return wrap;
}

TerminusServerViewer.prototype.getDBListDOM = function(){
	//var self = this;
	var sec = document.createElement("div");
	sec.setAttribute("class", "terminus-db-list");
	//sec.appendChild(UTILS.getHeaderDom('Databases'));
	var scd = document.createElement("table");
	scd.setAttribute("class", "terminus-db-list terminus-db-size terminus-hover-table terminus-margin-top");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var th1 = document.createElement("th");
	th1.appendChild(document.createTextNode("Database ID"));
	th1.setAttribute("class", "terminus-db-id terminus-table-header-full-css");
	th1.style.width = "20%";
	var th2 = document.createElement("th");
	th2.appendChild(document.createTextNode("Title"));
	th2.setAttribute("class", "terminus-db-title terminus-table-header-full-css");
	th2.style.width = "30%";
	var th3 = document.createElement("th");
	th3.appendChild(document.createTextNode("Description"));
	th3.setAttribute("class", "terminus-db-description terminus-table-header-full-css");
	th3.style.width = "50%";
	var th4 = document.createElement("th");
	th4.setAttribute("class", "terminus-db-size terminus-table-header-full-css");
	th4.appendChild(document.createTextNode("Size"));
	var th5 = document.createElement("th");
	th5.setAttribute("class", "terminus-db-created terminus-table-header-full-css");
	th5.appendChild(document.createTextNode("Created"));
	var th6 = document.createElement("th");
	th6.appendChild(document.createTextNode("Delete"));
	th6.setAttribute("class", "terminus-db-delete terminus-table-header-full-css");
	thr.appendChild(th1);
	thr.appendChild(th2);
	thr.appendChild(th3);
	//thr.appendChild(th4);
	//thr.appendChild(th5);
	//thr.appendChild(th6);
	thead.appendChild(thr);
	scd.appendChild(thead);
	var tbody = document.createElement("tbody");
	var dbrecs = this.ui.client.connection.getServerDBRecords();
	for(let fullid in dbrecs){
		let dbrec = dbrecs[fullid];
		const dbid = fullid.split(":")[1];
		let tr = document.createElement("tr");
		var td1 = document.createElement("td");
		td1.appendChild(this.wrapTableLinkCell(td1,dbid, dbid));
		td1.setAttribute("class", "terminus-db-id terminus-db-pointer");
		var td2 = document.createElement("td");
		td2.setAttribute("class", "terminus-db-title terminus-db-pointer");
		var txt = (dbrec && dbrec['rdfs:label'] && dbrec['rdfs:label']['@value'] ? dbrec['rdfs:label']['@value'] : "");
		td2.appendChild(this.wrapTableLinkCell(td2,dbid, txt));
		var td3 = document.createElement("td");
		td3.setAttribute("class", "terminus-db-description terminus-db-pointer");
		var txt = (dbrec && dbrec['rdfs:comment'] && dbrec['rdfs:comment']['@value'] ? dbrec['rdfs:comment']['@value'] : "");
		td3.appendChild(this.wrapTableLinkCell(td3,dbid, txt));
		var td4 = document.createElement("td");
		td4.setAttribute("class", "terminus-db-size terminus-db-pointer");
		var txt = (dbrec && dbrec['terminus:size'] && dbrec['terminus:size']['@value'] ? dbrec['terminus:size']['@value'] : "");
		td4.appendChild(this.wrapTableLinkCell(td4,dbid, txt));
		var td5 = document.createElement("td");
		td5.setAttribute("class", "terminus-db-created terminus-db-pointer");
		var txt = (dbrec && dbrec['terminus:last_updated'] && dbrec['terminus:last_updated']['@value'] ? dbrec['terminus:last_updated']['@value'] : "");
		td5.appendChild(this.wrapTableLinkCell(td5,dbid, txt));
		var td6 = document.createElement("td");
		td6.setAttribute("class", "db-delete");
		var delbut = this.ui.getDeleteDBButton(dbid);
		if(delbut) td6.appendChild(delbut);

		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		//tr.appendChild(td4);
		//tr.appendChild(td5);
		//tr.appendChild(td6);
		tbody.appendChild(tr);
	}
	scd.appendChild(tbody);
	sec.appendChild(scd);

	if(this.ui.pluginAvailable("datatables")){
        var dt = new Datatables.CspDatatables(this.ui);
		var tab = dt.draw(scd);
	}
	return sec;
}


module.exports = {TerminusServerViewer,TerminusServerController}
