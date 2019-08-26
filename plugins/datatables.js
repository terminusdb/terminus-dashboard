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
         dom       : 'lrtip'
     }); //jQuery(tab)

     //styling
     //tab.setAttribute('class'    , 'datatable-1 table table-bordered table-striped	display');
     tab.setAttribute('class'      , 'display stripe');
     tab.setAttribute('cellpadding', '0');
     tab.setAttribute('cellspacing', '0');
     tab.setAttribute('border'     , '0');
     tab.setAttribute('style'      , 'width:100%;cursor:pointer;font-size:larger;');
		 return tab;
}
