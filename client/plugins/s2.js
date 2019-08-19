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
