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
         dom       : 'lrtip',
         columns   : [{data: 'id',          title: 'Id'},
                      {data: 'name',        title: 'Title'},
                      {data: 'description', title: 'Description'},
                      {data: 'size',        title: 'Size'},
                      {data: 'created',     title: 'Created'},
                      {data: 'delete',      title: 'Delete'}]
     }); //jQuery(tab)

     //styling
     //tab.setAttribute('class'       , 'datatable-1 table table-bordered table-striped	display');
     tab.setAttribute('cellpadding' , '0');
     tab.setAttribute('cellspacing' , '0');
     tab.setAttribute('border'      , '0');
     tab.setAttribute('style'       , 'width:100%;cursor:pointer;font-size:larger;');
		 return tab;
}
