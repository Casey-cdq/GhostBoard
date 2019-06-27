var cm = require("../common")
var remote = require('electron').remote

String.prototype.strip = function() {
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

// function ol_sug(key,mkt,func){
// 	if(!remote.app.isPackaged){
//     	__ol_sug(key,mkt,func)
//   	}else{
//   	} 
// }
function __ol_get_keys(uuid,keys,suc,fail){
	url = "http://hq.sinajs.cn/list="
	for(i in keys){
		k = keys[i]
		tks = k.split("@")
		if(tks[1]=="hk"){
			url += "rt_hk"+tks[0]+","
		}else if(tks[1]=="a"){
			if(tks[0].indexOf("sh")==0){
				url += "sh000001,"
			}else if(tks[0].indexOf("sz")==0){
				url += "sz399001,"
			}else if(tks[0].indexOf("cyb")==0){
				url += "sz399006,"
			}else if(tks[0].indexOf("6")==0){
				url += "sh"+tks[0]+","
			}else{
				url += "sz"+tks[0]+","
			}
		}
	}
	console.log(url)

	let req_data = {}
	req_data.uuid = uuid
	req_data.v = remote.app.getVersion()
}

exports.get_keys = __ol_get_keys;