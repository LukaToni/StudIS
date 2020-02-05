$('#searchButton').on('click', function(){
    var value = $('#searchField')[0].value;
    
    $.get('/personal/query?search='+value, function( data ) {
        console.log(data);
        $('#searchTable').html('');
        data.forEach(s=>{
            var html = '<tr class="table-item"><td>{{name}}</td><td>{{surname}}</td><td>{{number}}</td></tr>'
          
            let item = $(html.replace('{{name}}',s.name).replace('{{surname}}',s.surname).replace(/{{number}}/g,s.registration_number));
            item.on('click', function(){
                window.location.href = '/personal/'+s.registration_number;
            })
            $('#searchTable').append(item);
        })
        

        $('#searchPanel').css('display','');
    });
})
$('#closeSearchButton').on('click',function(){
    $('#searchPanel').css('display','none');
})

$('#searchField').keypress(function(e) {
    if(e.which == 13) {
        var value = $('#searchField')[0].value;
    
        $.get('/personal/query?search='+value, function( data ) {
            console.log(data);
            $('#searchTable').html('');
            data.forEach(s=>{
                var html = '<tr class="table-item"><td>{{name}}</td><td>{{surname}}</td><td>{{number}}</td></tr>'
              
                let item = $(html.replace('{{name}}',s.name).replace('{{surname}}',s.surname).replace(/{{number}}/g,s.registration_number));
                item.on('click', function(){
                    window.location.href = '/personal/'+s.registration_number;
                })
                $('#searchTable').append(item);
            })
            
    
            $('#searchPanel').css('display','');
        }); 
    }
});