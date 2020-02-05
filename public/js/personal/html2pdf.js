
let buttonText;

function setButtonLoading(button) {
    buttonText = button.attr('value');
    button.text('Procesiram ....')
    button.attr("disabled", "disabled");
}

function setButtonDone(button) {
    if(!buttonText) {
        console.error("buttonText is missing. Probably because setButtonDone was caled before setButtonLoading. Resorting to default");
        buttonText = "to PDF"
    }
    button.text(buttonText)
    button.removeAttr("disabled");
}

/**
 * Ta funkcija je enostavna za uporabo.
 * POd prvi parameter "filename" napišete imeDatokete ki se bo prenesla
 * UneXpEcTed ItEM In BAGgINg aREa!
 * elementSelector: je jQuery selector za html vsebino ki se bo generirala. Tabeli lahko naprimer dodaš en id in jo potem podaš kot "#mojaTabela"
 * buttonSelector: je jQuery selector od gumba, ki ga bo ta funkcija avtomatično onemogočila dokler se vsebina ne prenese. 
 * 
 * UnEXpEctED iTeM IN BAGgING aREA!
 * uneXPecTeD ITem in baGGinG Area!!
 * PlEase waiT FOR ASsIsTAnCe
 **/
function html2pdf(filename, elementSelector, buttonSelector) {
    console.log("can I convert to PDF??");
    let button = $(buttonSelector);
    
    if(!filename) filename = "izpis.pdf"    
    if(!elementSelector) elementSelector = "body";
    let rawHtml = $(elementSelector).html();
    rawHtml = encodeURI(rawHtml)
    
    let url = "https://api.pdflayer.com/api/convert"
    url += "?access_key=efb813d9bb6729037b5a8f2dc81af2d5"
    url += "&test=1";
    
    
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.responseType = 'blob';

    request.onload = function() {
      setButtonDone(button);
      
      // Only handle status code 200
      if(request.status === 200) {
        // The actual download
        var blob = new Blob([request.response], { type: 'application/pdf' });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      }
      
      console.error("An error occured", request);
    };

    let data = "document_html=" + rawHtml;
    request.send(data);
    setButtonLoading(button);
}


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