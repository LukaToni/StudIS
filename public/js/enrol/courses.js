var selected = [];
var available = [];
var professional = false;
$('.course-item').each((index, item)=>{
    var kt = item.attributes['data-kt'].nodeValue;
    var type = item.attributes['data-type'].nodeValue;
    if(item.parentNode.id == "selected-courses")
        selected.push({id:item.id,kt,type});
    else
        available.push({id:item.id,kt,type});


    //module
    //item.style.backgroundColor='red';
    if(item.attributes['data-module']){
        switch (parseInt(item.attributes['data-module'].nodeValue)) {
            case 1:
            item.style.backgroundColor='#CC527A';
                break;
            case 2:
            item.style.backgroundColor='#cc2a36';
                break;
            case 3:
            item.style.backgroundColor='#45ADA8';
                break;
            case 4:
            item.style.backgroundColor='#9DE0AD';
                break;
            case 5:
            item.style.backgroundColor='#F26B38';
                break;
            case 6:
            item.style.backgroundColor='#00b159';
                break;
            case 7:
            item.style.backgroundColor='#d0e1f9';
                break;
            case 8:
            item.style.backgroundColor='#65737e';
                break;
            default:
                break;
        }
    }

})

var count = selected.reduce((a,b)=>a+parseInt(b.kt),0);
    $('#ktValue').text(count);
    $('#selected-input').val(selected.map(a=>a.id).join(','));
if(count==60)
    $('#submitButton').prop("disabled", false);

$('.course-item').on('click', function(){
    var id = this.id;
    var isSelected = false;
    var item = selected.find(a=>a.id==id);
    var index = selected.indexOf(item);
    if(index > -1 ){
        if(item.type != 0){
            isSelected = true;
            $('#available-courses').append(this);
            selected.splice(index,1)
            available.push(item);
        }
        
    } else {
        item = available.find(a=>a.id==id);
        index = available.indexOf(item);
        $('#selected-courses').append(this);
        available.splice(index,1)
        selected.push(item);
    }
    if(selected.find(a=>a.type==1))
        professional = true;
    else
        professional = false;
    var count = selected.reduce((a,b)=>a+parseInt(b.kt),0);
    $('#ktValue').text(count);
    $('#selected-input').val(selected.map(a=>a.id).join(','));
    if(count==60 && professional == true)
        $('#submitButton').prop("disabled", false);
    else
    $('#submitButton').prop("disabled", true);
})