function Datatables(){}

Datatables.prototype.convertTableDomToDatatable = function(tab){
    var table = jQuery(tab).DataTable({
         searching : false,
         pageLength: 10,
         lengthMenu: [10, 25, 50, 75, 100],
         paging    : true,
         select    : true,
         columnDefs:[{targets:'_all',className:"truncate"}],
         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td.attr("title", td.html());},
         dom       : 'lrtip'
    }); //jQuery(tab)

    //styling
    tab.setAttribute('class'      , 'stripe dataTable');
    tab.setAttribute('cellpadding', '1');
    tab.setAttribute('cellspacing', '1');
    tab.setAttribute('border'     , '0');
    return tab;
}

Datatables.prototype.getQueryOnPagination = function(wq, settings){
    switch(settings.query){
        case 'Show_All_Documents':
            return wq.getAllDocumentQuery(null, settings.pageLength, settings.start);
        break;
        case 'Show_All_Data':
            return wq.getEverythingQuery(null, settings.pageLength, settings.start);
        break;
    }
}

Datatables.prototype.getDataFromServer = function(tab, settings, ui, resultDOM){
    var dt = this;
    // delete previous datatable
    FrameHelper.removeChildren(this.dtdom);
    this.dtdom = document.createElement('div');
    this.dtdom.appendChild(tab);
    resultDOM.appendChild(this.dtdom);
    // saving query text box dom to change limit value on change of datatable page length
    this.qTextDom = settings.qTextDom;
    this.query = settings.query;
    // initialize datatables
    var table = jQuery(tab).DataTable({
         searching   : false,
         pageLength  : settings.pageLength,
         lengthMenu  : [5, 10, 25, 50, 75, 100],
         paging      : true,
         select      : true,
         columnDefs  :[{targets:'_all',className:"truncate"}],
         createdRow  : function(row){
                            var td = $(row).find(".truncate");
                            td.attr("title", td.html());},
         dom         : 'lrtip',
         drawCallback: function(settings) {
                             // on change of page length
                             $(this).on( 'length.dt', function (e, settings, len){
                                  settings.pageLength = len;
                                  settings.start = 0;
                                  settings.qTextDom = dt.qTextDom;
                                  settings.query = dt.query;
                                  this.wquery = new WOQLQuery(ui.client, null);
                                  deleteStylizedEditor(ui, settings.qTextDom);
                                  var query = dt.getQueryOnPagination(this.wquery, settings)
                                  settings.qTextDom.value = query;
                                  stylizeEditor(ui, settings.qTextDom);
                                  var self = this;
                                  this.wquery.execute(query)
                                  	.then(function(result){
                                  		if(true || !self.result){
                                  			self.result = new WOQLResultsViewer(ui, result, null, settings);
                                  		}
                                  		var rtab = self.result.getTable(result.bindings);
                                  		if(rtab){
                                            dt.getDataFromServer(rtab, settings, ui, resultDOM);
                                  		}
                                  	})
                                  	.catch(function(err){
                                  		console.error(err);
                                  		self.ui.showError(err);
                                  	});
                             });

        }
    }); //jQuery(tab)

    //styling
    tab.setAttribute('class'      , 'stripe dataTable');
    tab.setAttribute('cellpadding', '1');
    tab.setAttribute('cellspacing', '1');
    tab.setAttribute('border'     , '0');

    return tab;
}

/*
serverside: true or false
*/
Datatables.prototype.draw = function(serverside, tab, settings, ui, resultDOM){
    if(serverside)
        return(this.getDataFromServer(tab, settings, ui, resultDOM));
    else return(this.convertTableDomToDatatable(tab));
}
