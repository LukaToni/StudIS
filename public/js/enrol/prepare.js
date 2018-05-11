function getEmsoRegex(date){
    return [date.split('.')].map(a=>{a[2]=a[2].substring(1); return a;})[0].join('') +'[0-9]{6}'
}