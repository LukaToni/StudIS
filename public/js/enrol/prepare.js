function onEmsoChange(){
    let emso = $('#staticEMSO').val();
    var checksum = (emso[0]*7 + emso[1]*6 + emso[2]*5 + emso[3]*4 + emso[4]*3 + emso[5]*2 + emso[6]*7 + emso[7]*6 + emso[8]*5 + emso[9]*4 + emso[10]*3 + emso[11]*2)%11;
    if(emso[12] == (11 - checksum) && emso.length == 13)
        $('#emso-info').css('display','none');
    else
    $('#emso-info').css('display','');
    //debugger;
}

function onDataChange(){
    ulica = $('#staticStreet').val();
    ime = $('#staticName').val();
    priimek = $('#staticSurname').val();
    emso = $('#staticEMSO').val();
    telefon = $('#staticPhone').val();
    ulicaPosta = $('#staticStreetPost').val();

    if(ulica && ime && priimek && emso && telefon){
        $('#submitButton').prop("disabled", false);
    }
    else{
        $('#submitButton').prop("disabled", true);
    }
}

$('#staticEMSO').on('change',onEmsoChange);

$('#staticStreet').on('change',onDataChange);
$('#staticName').on('change',onDataChange);
$('#staticSurname').on('change',onDataChange);
$('#staticEMSO').on('change',onDataChange);
$('#staticPhone').on('change',onDataChange);

var ulica = $('#staticStreet').val();
var ime = $('#staticName').val();
var priimek = $('#staticSurname').val();
var emso = $('#staticEMSO').val();
var telefon = $('#staticPhone').val();
var ulicaPosta = $('#staticStreetPost').val();

    //$('#submitButton').prop("disabled", false);
/*
var indeks = document.getElementById('country');
var drzava = $('#staticCountry').val();
if(drzava != 'Slovenija')
    $('#staticCountry').css('display','none');
else
    $('#staticCountry').css('display','');
*/
// && ime && priimek && emso && telefon
var a;
if(ulica && ime && priimek && emso && telefon){
    a=1;
    $('#submitButton').prop("disabled", false);
}
else{
    a=2;
    $('#submitButton').prop("disabled", true);
}