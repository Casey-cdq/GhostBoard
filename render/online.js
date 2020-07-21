var cm = require("../common")
var remote = require('electron').remote
const log = require('electron-log')
const axios = require('axios')

function string_strip(str){
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
}

// function ol_sug(key,mkt,func){
// 	if(!remote.app.isPackaged){
//     	__ol_sug(key,mkt,func)
//   	}else{
//   	} 
// }
function get_keys_suc(suc,message){

}
//sug warning:btcbitstamp,71,btcbitstamp,btcbitstamp,比特币兑美元(Bitstamp报价),,比特币兑美元(Bitstamp报价),99
//sug warning:USDCNY,71,usdcny,usdcny,在岸人民币,,在岸人民币,99
function __ol_get_keys(params,suc,fail){
	let keys = params.keys
	url = "http://hq.sinajs.cn/list="
	for(i in keys){
		k = keys[i]
		tks = k.split("@")
		code = tks[0]
		mkt = tks[1]
		if(mkt=="hk"){
			url += "rt_hk"+code+","
		}else if(mkt=="a"){
			url += code+"_i,"
			url += code+","
		}else if(mkt=="fc"){
			pre = code.substr(0,3)
			if (pre==="btc"){
				url += "btc_"+code+","
			}else{
				url += "fx_s"+code+","
			}
		}else if(mkt=="nf"){
			url += "nf_"+code.toUpperCase()+","
		}else if(mkt=="of"){
			url += code+","
		}
	}
	console.log(url)

	let req = {}

	req.out = cm.get(url,{},
			 function (message) {
		        // console.log("OK:"+JSON.stringify(message))

		        let req_data = {}
				req_data.uuid = params.uuid
				req_data.v = params.v
				req_data.t = message
				req_data.sort = params.sort
				req_data.plat = process.platform

				// console.log("post data:"+req_data)

				let inreq = cm.post(
					cm.base_url,
					req_data,
					function (ret){
						suc(ret)
					},
					function (message) {
				        fail(message,"err")
				    }
				)
				req.inreq = inreq

		    },
		    function (message,einfo) {
		        console.log("get NOTOK:"+JSON.stringify(message))
		        fail(message,einfo)
		    }
	)

	req.aa = function(){
		this.out.cancel("canceled")
		if(typeof(this.inreq)!="undefined"){
			this.inreq.cancel("canceled")
		}
		console.log("cancel all---------------------")
	}

	return req
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
		// console.log(tk)
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
        }else if(m=="fc" && mkt =="71"){
            let sug = {}
			sug['code'] = code
            sug['name'] = name
            sug['key'] = mcode+"@fc"
            sugs.push(sug)
        }else if(m=="nf" && mkt =="87"){
            let sug = {}
			sug['code'] = code
            sug['name'] = name
            sug['key'] = mcode+"@nf"
            sugs.push(sug)
		}else if(m=="of" && mkt =="21"){
            let sug = {}
			sug['code'] = code
            sug['name'] = name
            sug['key'] = mcode+"@of"
            sugs.push(sug)
		}else{
        	console.log("sug warning:"+l)
        }
	}

	return sugs
}

function __ol_sug(key,params,suc,fail){
	let tk = key.split("@")
	let k = tk[0]
	let m = tk[1]

	let now = new Date().getTime()
	url = "https://suggest3.sinajs.cn/suggest/type=&key="+k+"&name=suggestdata_"+now

	console.log("====")
	console.log(url)
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
exports.sug = __ol_sug;