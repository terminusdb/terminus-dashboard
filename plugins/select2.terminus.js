WOQLClient.prototype.baseURL = function(){ 
	if(this.platformEndpoint()) {
		return this.server.substring(0, this.server.lastIndexOf("/platform/"));
	}
	return this.server; 
}

WOQLClient.prototype.getEntityReference = function(dburl, eclass, entities, opts){
	if(dburl) this.parseDBURL(dburl, "set");
	var woqurl = this.baseURL() + "rest/" + this.dbid + "/candidate/entities";
	var upd = {};
	upd.class = eclass;
	if(entities && entities.length) upd.entities = entities;
	return this.dispatch(woqurl, "JSON", upd, opts);
}

function S2EntityEditor(options){}

S2EntityEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var cls = renderer.frame.range;
	var cback = renderer.set;
	var surl = renderer.getAPIURL("query", "search");
	var dburl = renderer.DBURL();
	var client = renderer.getClient();
	return getS2EntityChooser(value, dburl, client, cls, surl, cback);
}

function getS2EntityChooser(value, dburl, client, cls, searchurl, callback){
	var holder = document.createElement("span");
	holder.setAttribute("class", "entity-reference-value");
	//holder.appendChild(temp);
	var waittag = document.createElement("i");
	waittag.setAttribute("title", "Retrieving Entity Listing");
	waittag.setAttribute("class", "fas fa-circle-notch fa-spin");
	holder.appendChild(waittag);
	var entities = (value ? [value] : false);
	var success = function(response){
		FrameHelper.removeChildren(holder);
		holder.innerHTML = response;
		var sel1 = jQuery(holder).find("select.dcog-entity-class-input");
		if(sel1[0]){
			var prl = document.createElement("span");
			prl.setAttribute("class", "class-filter-label");
			prl.appendChild(document.createTextNode("Filter by Type"));
			holder.prepend(prl);
			var val = jQuery(sel1).val();
			var lookup = function(params){
				var val = jQuery(sel1).val();
				params.class = (val ? val : cls);
				return JSON.stringify(params);
			}
		}
		else {
			var lookup = function (params) {
				params.class = cls;
				return JSON.stringify(params);
		    }
		}
		var s2config = {
			ajax: {
			    url: searchurl,
			    dataType: 'json',
			    data: lookup,
			    type: "POST",
				contentType: "application/json; charset=utf-8",
			    delay: 250,
			    cache: true
			},
			width: 280
		};
		var sel = jQuery("select.dcog-search-term", holder);
		jQuery(sel).select2(s2config).change(function(){
			callback(this.value);
		});
		if(sel1[0]){
			jQuery(sel1).change(function(){
				var txt = jQuery(sel1).find('option:selected').text();
				s2config.placeholder  = "Select " + txt;
				jQuery(sel).select2(s2config);
			});
		}
	}
	client.getEntityReference(dburl, cls, entities, {options: {mode: 'edit'}}).then(success);
	return holder;
}

RenderingMap.registerEditorForFrameType("S2EntityEditor", "S2 Autocomplete Selector", "entity");

