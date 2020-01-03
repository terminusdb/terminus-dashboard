const TerminusClient = require('@terminusdb/terminus-client');
const HTMLHelper = require('../html/HTMLHelper');
const UTILS= require('../Utils')

/*** client side processing ***/
function CspDatatables(ui){
    this.ui = ui;
}

CspDatatables.prototype.convertToDatatable = function(tab){
    var dt = this;
    var table = jQuery(tab).DataTable({
         searching : false,
         pageLength: 25,
         lengthMenu: [10, 25, 50, 75, 100],
         paging    : true,
         select    : true,
         initComplete: function(settings) {
                        var ict =settings.oInstance.api();
                        ict.$('td').each(function(){
                            this.setAttribute('title', $(this).html())
                        })},
         columnDefs:[{targets:'_all',className:"truncate"}],
         createdRow: function(row) {
                            var td = $(row).find(".truncate");
                            td.attr("title", td.html());}
    }); //jQuery(tab)

    // on click of row connect to db, on click of 5th column delete db
    jQuery(tab, 'tbody').on('click', 'td', function(){
        if(table.cell(this).index().column == 5){
            var dbInfo = table.row(jQuery(this).parents('tr')).data();
            var dbId = UTILS.extractValueFromCell(dbInfo[0]);
            dt.ui.deleteDatabase(dbId);
            return;
        }
        else dt.ui.showDBMainPage();
     }); // on click

    tab.setAttribute('class'      , 'stripe dataTable terminus-db-size');
    tab.setAttribute('cellpadding', '1');
    tab.setAttribute('cellspacing', '0');
    tab.setAttribute('border'     , '0');
    return tab;
}

CspDatatables.prototype.draw = function(dtResult){
    return(this.convertToDatatable(dtResult));
}

/*** server side processing ***/
function Datatables(wResViewer, qPage){
   this.wrViewer = wResViewer;
   this.wQuery = wResViewer.wQuery;
   this.ui = wResViewer.ui;
   this.qPage = qPage;
   this.currDTSettings = wResViewer.settings;
}

/*
    query: new woqlquery with current pagination changes
    pageInfo: current drawCallBack page change info
    resultDOM: result dom on veiwer page
*/
Datatables.prototype.executeQuery = function(qObj, pageInfo, resultDOM){
    var self = this;
    // return this.wQuery.execute(query)
    return qObj.execute(this.ui.client)
    .then(function(result){
      var dtResult = {};
      var wqRes = new TerminusClient.WOQLResult(result, qObj);
      dtResult = self.wrViewer.formatResultsForDatatableDisplay(result.bindings, pageInfo)
      return dtResult.data;
    })
    .catch(function(err){
      console.error(err);
      self.ui.showError(err);
    });
}

/* get query string based on datatable pagination and current query */
/*Datatables.prototype.getQueryOnPagination = function(wq, settings){
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
        	var sqp = wq.getConcreteDocumentClassPattern("Class");
            return wq.getClassMetaDataQuery(sqp);
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
        case 'Show_All_Document_classes':
            return wq.getClassesQuery(settings.pageLength, settings.start);
        break;
        default:
            console.log('Invalid woql option passed');
        break;

    }
}   */
/*
    pageInfo: current drawCallBack page change info
*/
Datatables.prototype.generateNewQueryOnPageChange = function(pageInfo){
    if(this.qPage) UTILS.deleteStylizedEditor(this.ui, pageInfo.qTextDom);
    var qObj = UTILS.getCurrentWoqlQueryObject(null, pageInfo);
    //var query = this.getQueryOnPagination(this.wQuery, pageInfo)
    if(this.qPage) {
        if(pageInfo.queryMode.value == 'woql')
            pageInfo.qTextDom.value = JSON.stringify(qObj.prettyPrint(), undefined, 2);
        else pageInfo.qTextDom.value = JSON.stringify(qObj, undefined, 2);
        UTILS.stylizeEditor(this.ui, pageInfo.qTextDom, 'query', 'javascript');
    }
    //return query;
    return qObj;
}

/*
    dt: Datatable reference
    len : current number of records to display
*/
Datatables.prototype.getCallbackSettings = function(dt, dtAPIChangeSettings){
    var pageInfo = {};
    pageInfo.pageLength  = dtAPIChangeSettings._iDisplayLength;
    pageInfo.start       = dtAPIChangeSettings._iDisplayStart;
    pageInfo.draw        = dtAPIChangeSettings.iDraw;
    pageInfo.qTextDom    = dt.qTextDom;
    pageInfo.queryMode   = dt.queryMode;
    if(this.qPage) pageInfo.query = dt.query;
    else pageInfo.query = 'Show_All_Document_classes';
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
    HTMLHelper.removeChildren(this.dtdom);
    this.dtdom = document.createElement('div');
    this.dtdom.appendChild(tab);
    resultDOM.appendChild(this.dtdom);
    // saving query text box dom to change limit value on change of datatable page length
    this.qTextDom = settings.qTextDom;
    this.query = settings.query;
    this.chosenValue = settings.chosenValue;
    this.queryMode = settings.queryMode;
}

// update datatables settings so it can be reused in WOQLTextboxGenerator to re write query in woql/ jsonld
Datatables.prototype.updateCurrDTSettings = function(pageInfo){
    this.currDTSettings.pageLength = pageInfo.pageLength;
    this.currDTSettings.start      = pageInfo.start;
}

Datatables.prototype.getNewDataOnChange = function(drawnTab, aSettings, resultDOM){
    var pageInfo = this.getCallbackSettings(this, aSettings);
    this.updateCurrDTSettings(pageInfo);
   // var query = this.generateNewQueryOnPageChange(pageInfo);
    var qObj = this.generateNewQueryOnPageChange(pageInfo);
    return this.executeQuery(qObj, pageInfo, resultDOM);
    //return this.executeQuery(query, pageInfo, resultDOM);
    //return  dtResult.result.data;
}

Datatables.prototype.getDataFromServer = function(dtResult, resultDOM){
    var dt = this;
    var tab = dtResult.tab;
    this.setUp(tab, this.wrViewer.settings, resultDOM);
    // initialize datatables
    var table = jQuery(tab).DataTable({
         searching   : false,
         pageLength  : dt.wrViewer.settings.pageLength,
         serverSide  : true,
         processing  : true,
         lengthMenu  : [25, 50, 75, 100],
         dom         : 'RBlftip',
         columns     : dtResult.result.columns,
         paging      : true,
         select      : true,
         autoWidth   : true,
         ajax        : function (data, callback, settings) {
                            if(Object.entries(dtResult.result.data).length > 0){
                                // first draw is loaded
                                var res = dtResult.result.data;
                                dtResult.result.data = {};
                                callback(res);
                            }
                            else{
                                dt.getNewDataOnChange(this, settings, resultDOM)
                                    .then(function(result){
                                     callback(result);
                                })
                            }
                       },
         buttons     : [{ extend: 'copy', text: 'Copy to clipboard' },
                        { extend: 'excel', text: 'Export to Excel' }],
         columnDefs  : [{ targets:'_all',
                          className:"truncate"}],
         createdRow  : function(row){
                            var td = $(row).find(".truncate");
                            td.attr("title", td.html());},
         scrollX     : true
    }); //jQuery(tab)

    // on click of doc
    jQuery(tab, 'tbody').on('click', 'td', function(){
        if(table.cell(this).data){
            if(this.innerText.substring(0, 4) == "doc:"){
                if(dt.wrViewer.result.ui) {
        			dt.wrViewer.result.ui.showDocument(this.innerText);
        			dt.wrViewer.result.ui.redraw();
        			dt.wrViewer.selectDocumentNavBar(dt.ui);
        		}
            }
        }
     }); // on click

    //styling
    tab.setAttribute('class'      , 'stripe dataTable');
    tab.setAttribute('style'      , 'margin: 0!important');
    tab.setAttribute('cellpadding', '1');
    tab.setAttribute('cellspacing', '1');
    tab.setAttribute('border'     , '0');

    return tab;
}

/*
serverside: true or false
*/
Datatables.prototype.draw = function(dtResult, resultDOM){
    return(this.getDataFromServer(dtResult, resultDOM));
}

module.exports={Datatables, CspDatatables}
