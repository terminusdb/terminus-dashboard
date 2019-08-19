	if(typeof getS2EntityChooser == "function"){
		var callback = showDoc;
		var mcls = FrameHelper.unshorten("dcog:Document");
		var searchurl = this.ui.server() + "/rest/" + this.ui.db() + "/query/search";
		var dburl = this.ui.server() + "/" + this.ui.db();
		var sdom = getS2EntityChooser(false, dburl, this.ui.client, mcls, searchurl, callback);
		jQuery(dcip).hide();
		jQuery(nbut).hide();
		var nlab = document.createElement("a");
		nlab.setAttribute("href", "#");
		nlab.setAttribute("class", "document-which-chooser");
		nlab.appendChild(document.createTextNode("Choose by ID"));
		var show = "label";
		jQuery(nlab).click(function(){
			if(show == "label"){
				show = "id";
				jQuery(dcip).show();
				jQuery(nbut).show();
				jQuery(sdom).hide();
				jQuery(nlab).text("Choose by Label");
			}
			else {
				show = "label";
				jQuery(dcip).hide();
				jQuery(nbut).hide();
				jQuery(sdom).show();
				jQuery(nlab).text("Choose by ID");
			}
		})
		scd.appendChild(sdom);
		scd.prepend(nlab);
	}

	function S2EntityEditor(options){}
	S2EntityEditor.prototype.getDOM = function(renderer, dataviewer){
		var value = renderer.value();
		var cls = renderer.frame.range;
		var cback = renderer.set;
		var surl = renderer.getAPIURL("query", "search");
		var dburl = renderer.DBURL();
		return getS2EntityChooser(value, dburl, renderer, cls, surl, cback);
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

