/* global jQuery, jsPDF */

(function($) {
	
	$.fn.table2pdf = function(filename, headerSelector) {
        var doc = new jsPDF('p', 'pt');
        
        //doc.fromHTML($(headerSelector).html(), 15, 15, {
        //    'width': 170,
        //})
        
        // this.get(0) converts from jQuery to DOM
        var res = doc.autoTableHtmlToJson(this.get(0));
        doc.autoTable(res.columns, res.data);
        

        
        if(!filename) filename = "document";
        doc.save(filename + ".pdf");

		return this;
	}
	
}(jQuery));
