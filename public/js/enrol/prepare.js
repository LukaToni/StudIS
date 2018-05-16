function onEmsoChange(){
    let emso = $('#staticEMSO').val();
    var checksum = (emso[0]*7 + emso[1]*6 + emso[2]*5 + emso[3]*4 + emso[4]*3 + emso[5]*2 + emso[6]*7 + emso[7]*6 + emso[8]*5 + emso[9]*4 + emso[10]*3 + emso[11]*2)%11;
    if(emso[12] == (11 - checksum) && emso.length == 13)
        $('#emso-info').css('display','none');
    else
    $('#emso-info').css('display','');
    //debugger;
}

$('#staticEMSO').on('change',onEmsoChange);