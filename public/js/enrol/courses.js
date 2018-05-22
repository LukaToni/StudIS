var selected = [];
var available = [];
var professional = false;
var average = 0;

if($('.average').length != 0)
    average = 1;
$('.course-item').each((index, item)=>{
    var kt = item.attributes['data-kt'].nodeValue;
    var type = item.attributes['data-type'].nodeValue;
    var moduleId;
    if(item.attributes['data-module'])
        moduleId = parseInt(item.attributes['data-module'].nodeValue);
    if(item.parentNode.id == "selected-courses")
        selected.push({id:item.id,kt,type,moduleId});
    else
        available.push({id:item.id,kt,type,moduleId});


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
    if(average){
        var id = this.id;
        var isSelected = false;
        var item = selected.find(a=>a.id==id);
        var index = selected.indexOf(item);
        if(index > -1 ){
            if(item.type != 0){
                /*
                isSelected = true;
                $('#available-courses').append(this);
                selected.splice(index,1)
                available.push(item);
                */
                moveItemToAvailable(id);
            }
            
        } else {
            /*
            item = available.find(a=>a.id==id);
            index = available.indexOf(item);
            $('#selected-courses').append(this);
            available.splice(index,1)
            selected.push(item);
            */
            var item = available.find(a=>a.id==id);
            count = selected.reduce((a,b)=>a+parseInt(b.kt),0);
            if(count + parseInt(item.kt) <= 60)
                moveItemToSelected(id);
        }
        if(selected.find(a=>a.type==1))
            professional = true;
        else
            professional = false;
        count = selected.reduce((a,b)=>a+parseInt(b.kt),0);
        $('#ktValue').text(count);
        $('#selected-input').val(selected.map(a=>a.id).join(','));
        if(count==60 && professional == true)
            $('#submitButton').prop("disabled", false);
        else
        $('#submitButton').prop("disabled", true);
    }
    else{
        var id = this.id;
        var isSelected = false;
        var item = selected.find(a=>a.id==id);
        var index = selected.indexOf(item);
        if(index > -1){
            if(item.moduleId == undefined){
                if(item.type != 0){
                   moveItemToAvailable(id);
                }
            }else {
                var mItem = selected.filter(a=>a.moduleId == item.moduleId);
                mItem.forEach(a=>{
                    moveItemToAvailable(a.id);
                })
            }
        }
        else{
            item = available.find(a=>a.id==id);
            if(item.moduleId == undefined){
                if(item.type != 0){
                    moveItemToSelected(id);
                }
            }else {
                var mItem = available.filter(a=>a.moduleId == item.moduleId);
                var item = available.find(a=>a.id==id);
                count = selected.reduce((a,b)=>a+parseInt(b.kt),0);
                if(count + 18 <= 60){
                    mItem.forEach(a=>{
                        moveItemToSelected(a.id);
                    })
                }
                else{
                    moveItemToSelected(id);
                }
            }
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
    }
})

function moveItemToAvailable(id){
    var item = selected.find(a=>a.id==id);
    var index = selected.indexOf(item);
    $('#available-courses').append($('#'+id)[0]);
    selected.splice(index,1)
    available.push(item);
}

function moveItemToSelected(id){
    var item = available.find(a=>a.id==id);
    var index = available.indexOf(item);
    $('#selected-courses').append($('#'+id)[0]);
    available.splice(index,1)
    selected.push(item);
}