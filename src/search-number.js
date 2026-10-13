function normalizePartNumber(v){
 return String(v).replace(/^0+/,'');
}
function samePart(a,b){
 return normalizePartNumber(a)===normalizePartNumber(b);
}
