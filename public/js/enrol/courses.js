var selected = [];
var available = [];
$('.course-item').each((index, item)=>{
    var kt = item.attributes['data-kt'].nodeValue;
    if(item.parentNode.id == "selected-courses")
        selected.push({id:item.id,kt});
    else
        available.push({id:item.id,kt});

})

$('.course-item').on('click', function(){
    var id = this.id;
    var isSelected = false;
    var item = selected.find(a=>a.id==id);
    var index = selected.indexOf(item);
    if(index > -1 ){
        isSelected = true;
        $('#available-courses').append(this);
        selected.splice(index,1)
        available.push(item);
        
    } else {
        item = available.find(a=>a.id==id);
        index = available.indexOf(id);
        $('#selected-courses').append(this);
        available.splice(index,1)
        selected.push(item);
        
    }

    var count = selected.reduce((a,b)=>a+parseInt(b.kt),0);
    $('#ktValue').text(count);
    $('#selected-input').val(selected.map(a=>a.id).join(','));
})