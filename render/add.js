const { remote } = require('electron')
var cm = require("../common")

Mousetrap.bind('esc', () => { 
	console.log('esc')
	
	remote.getCurrentWindow().close()
})

$("#testNoBtn").keypress(function (e) {
	console.log(e.which)
});

$("#testNoBtn").bsSuggest({
 		emptyTip: '未检索到匹配的数据',
        url: cm.base_url+"/sug?key=",
        effectiveFields: ["code", "name"],
        getDataMethod: "url",
        allowNoKeyword: false,
        ignorecase: true,
        showHeader: false,
        showBtn: false,     //不显示下拉按钮
        delayUntilKeyup: true, //获取数据的方式为 firstByUrl 时，延迟到有输入/获取到焦点时才请求数据
        idField: "key",
        keyField: "name",
        clearable: true,
        fnPreprocessKeyword: function(keyword) { //请求数据前，对输入关键字作进一步处理方法。注意，应返回字符串
            return keyword+"@a";
        },
}).on('onDataRequestSuccess', function (e, result) {
    // console.log('onDataRequestSuccess: ', result);
    log_vsize()
}).on('onSetSelectValue', function (e, keyword, sel_data) {
    console.log('onSetSelectValue: ', keyword, sel_data);
	const storage = require('electron-json-storage')
	storage.get('keys', function(error, data) {
			if (error) throw error

			if(JSON.stringify(data) == '{}'){
		    	data = []
		  	}

		  	for (i in data){
		  		if (data[i]==sel_data.key){
		  			console.log("same key..")
		  			remote.getCurrentWindow().close()
		  			return
		  		}
		  	}

			data.push(sel_data.key)

			storage.set('keys', data, function(error) {
		    	if (error) throw error;

		    	remote.getCurrentWindow().close()
		    	console.log("set keys ok ")
			});
	});
}).on('onUnsetSelectValue', function () {
    console.log("onUnsetSelectValue");
});

function log_vsize(){
	let w = $(window).width()
	let h = $(window).height()
	console.log(w)
	console.log(h)
}

function add_ready(){
	console.log("add ready.")
	log_vsize()
}

$(document).ready(add_ready)