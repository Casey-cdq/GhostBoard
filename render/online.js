var cm = require("../common")
var remote = require('electron').remote
const log = require('electron-log')

function string_strip(str){
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
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

function parse_sina_sug(text,m){
	let sugs = []
	let tk = text.split("=")[1]
	tk = string_strip(tk.split('";')[0])
	if (tk=="\""){
		return sugs
	}
	let lines = tk.split(";")
	for(i in lines){
		let l = lines[i]
		tk = l.split(",")
		console.log(tk)

		mkt = tk[1]
		code = string_strip(tk[2])
		mcode = string_strip(tk[3])
		name = string_strip(tk[4])

		if(m=="a" && mkt =="11"){
			let sug = {}
			sug['code'] = code
            sug['name'] = name
            sug['key'] = mcode+"@a"
            sugs.push(sug)
		}else if(m=="hk" && mkt =="31"){
            let sug = {}
			sug['code'] = code
            sug['name'] = name
            sug['key'] = mcode+"@hk"
            sugs.push(sug)
        }else{
        	log.warn("sug warning:"+l)
        }
	}

	return sugs
}

function __ol_sub(key,params,suc,fail){
	let tk = key.split("@")
	let k = tk[0]
	let m = tk[1]

	let now = new Date().getTime()
	url = "https://suggest3.sinajs.cn/suggest/type=&key="+k+"&name=suggestdata_"+now

	let req = cm.get(url,{},
			 function (message) {
		        console.log("OK:"+JSON.stringify(message))
		        let ret = parse_sina_sug(message,m)
		        console.log(ret)
		        suc({value:ret})
		    },
		    function (message,einfo) {
		        console.log("NOTOK:"+JSON.stringify(message))
		        fail(message,einfo)
		    }
	)

	return req
}

exports.get_keys = __ol_get_keys;
exports.sug = __ol_sub;