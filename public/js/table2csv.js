/* global jQuery */

(function($) {
	
	var options = {
		/* action='downoad' options */
		filename: 'table',
		
		/* action='output' options */
		appendTo: 'body',
		
		/* general options */
		separator: ',',
		newline: '\n',
		quoteFields: true,
		excludeColumns: '',
		excludeRows: ''
	};
	
	function quote(text) {
		return '"' + text.replace('"', '""') + '"';
	}
	
	// taken from http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
	function download(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);
		
		element.style.display = 'none';
		document.body.appendChild(element);
		
		element.click();
		
		document.body.removeChild(element);
	}
	
	function convert(table) {
		var output = "";
			
		var rows = table.find('tr').not(options.excludeRows);
		
		var numCols = rows.first().find("td,th").filter(":visible").not(options.excludeColumns).length;
		
		rows.each(function() {
			$(this).find("td,th").filter(":visible").not(options.excludeColumns)
			.each(function(i, col) {
				col = $(col);
				
				output += options.quoteFields ? quote(col.text()) : col.text();
				if(i != numCols-1) {
					output += options.separator;
				} else {
					output += options.newline;
				}
			});
		});
		
		return output;
	}
	
	$.fn.table2csv = function(filename) {
		if(!filename) filename = options.filename;
		var table = this; // TODO use $.each

		var csv = convert(table);
		download(filename + ".csv", csv);

		return this;
	}
	
}(jQuery));