function Datatables(tab){
  this.table = tab;
}

Datatables.prototype.draw = function(){
    var tab = this.table;
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
