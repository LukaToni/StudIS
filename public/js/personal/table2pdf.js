/* global jsPDF */

function exportPdf(table, filename) {

}


/* global jQuery */

(function($) {
	
	$.fn.table2pdf = function(filename) {
        var doc = new jsPDF('p', 'pt');
        // this.get(0) converts from jQuery to DOM
        var res = doc.autoTableHtmlToJson(this.get(0));
        doc.autoTable(res.columns, res.data);
        
        if(!filename) filename = "document";
        doc.save(filename + ".pdf");

		return this;
	}
	
}(jQuery));
