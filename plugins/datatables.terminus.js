function Datatables(){}

Datatables.prototype.convertToDatatable = function(tab){
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

/*
    dcb: datatable drawCallBack reference
    ui: terminus ui reference
    dt: datatable reference
    query: new woqlquery with current pagination changes
    pageInfo: current drawCallBack page change info
    resultDOM: result dom on veiwer page
*/
Datatables.prototype.executeQuery = function(dcb, ui, dt, query, pageInfo, resultDOM){
    var self = this;
    dcb.wquery.execute(query)
      .then(function(result){
          if(true || !self.result){
              self.result = new WOQLResultsViewer(ui, result, null, pageInfo);
          }
          var rtab = self.result.getTable(result.bindings);
          if(rtab){
              self.getDataFromServer(rtab, pageInfo, ui, resultDOM);
          }
      })
      .catch(function(err){
          console.error(err);
          self.ui.showError(err);
      });
}

/* get query string based on datatable pagination and current query */
Datatables.prototype.getQueryOnPagination = function(wq, settings){
    switch(settings.query){
        case 'Show_All_Documents':
            return wq.getAllDocumentQuery(null, settings.pageLength, settings.start);
        break;
        case 'Show_All_Data':
            return wq.getEverythingQuery(null, settings.pageLength, settings.start);
        break;
        case 'Show_All_Schema_Elements':
            return wq.getElementMetaDataQuery(null, settings.pageLength, settings.start);
        break;
        case 'Show_Document_Classes':
            return wq.getClassMetaDataQuery(wq.getSubclassQueryPattern("Class", "dcog/'Document'")
    										  + ", not(" + wq.getAbstractQueryPattern("Class") + ")",
                                                 settings.pageLength, settings.start);
        break;
        case 'Show_All_Properties':
            return wq.getPropertyListQuery(null, settings.pageLength, settings.start);
        break;
        case 'Show_All_Classes':
            return wq.getClassMetaDataQuery(null, settings.pageLength, settings.start);
        break;
        case 'Show_Data_Class':
            return  wq.getDataOfChosenClassQuery(settings.chosenValue, settings.pageLength, settings.start);
        break;
        case 'Show_Property_Class':
            return wq.getDataOfChosenPropertyQuery(settings.chosenValue, settings.pageLength, settings.start);
        break;
        case 'Show_Document_Info_by_Id':
            return wq.getDocumentQuery(settings.chosenValue, settings.pageLength, settings.start);
        break;
        default:
            console.log('invalid woql option passed');
        break;

    }
}

/*
    dcb: datatable drawCallBack reference
    ui: terminus ui reference
    dt: datatable reference
    pageInfo: current drawCallBack page change info
*/
Datatables.prototype.generateNewQueryOnPageChange = function(dcb, ui, dt, pageInfo){
    dcb.wquery = new WOQLQuery(ui.client, null);
    deleteStylizedEditor(ui, pageInfo.qTextDom);
    var query = dt.getQueryOnPagination(dcb.wquery, pageInfo)
    pageInfo.qTextDom.value = query;
    stylizeEditor(ui, pageInfo.qTextDom);
    return query;
}

/*
    dt: Datatable reference
    len : current number of records to display
*/
Datatables.prototype.getCallbackSettings = function(dt, len){
    var pageInfo = {};
    pageInfo.pageLength = len;
    pageInfo.start      = 0;
    pageInfo.qTextDom   = dt.qTextDom;
    pageInfo.query      = dt.query;
    pageInfo.chosenValue = dt.chosenValue;
    return pageInfo;
}

/*
    tab: datatable table dom
    settings : settings from woql txt generator
    resultDOM: result dom of viewer
*/
Datatables.prototype.setUp = function(tab, settings, resultDOM){
    // delete previous datatable
    FrameHelper.removeChildren(this.dtdom);
    this.dtdom = document.createElement('div');
    this.dtdom.appendChild(tab);
    resultDOM.appendChild(this.dtdom);
    // saving query text box dom to change limit value on change of datatable page length
    this.qTextDom = settings.qTextDom;
    this.query = settings.query;
    this.chosenValue = settings.chosenValue;
}

Datatables.prototype.getDataFromServer = function(tab, settings, ui, resultDOM){
    var dt = this;
    this.setUp(tab, settings, resultDOM);
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
                                  var pageInfo = dt.getCallbackSettings(dt, len);
                                  var query = dt.generateNewQueryOnPageChange(this, ui, dt, pageInfo);
                                  return dt.executeQuery(this, ui, dt, query, pageInfo, resultDOM);
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
    else return(this.convertToDatatable(tab));
}
