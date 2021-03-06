const {shell} = require('electron')
const storage = require('electron-json-storage')
const axios = require('axios')
const CancelToken = axios.CancelToken;
const {machineId, machineIdSync} = require('node-machine-id')

function open_url(url){
	console.log("open "+url)
	shell.openExternal(url);
}

function open_file(url){
    console.log("open "+url)
    shell.openItem(url);
}

function alert_with_close(message){
    let alert = $("#infoalert")
    alert.empty()
    alert.append($('<p class="py-0 d-inline">'+message+"</p>"))
    alert.append($('<a class="d-inline" href="#" onclick="$(\'#infoalert\').addClass(\'d-none\');$(\'#infoalert\').empty();ret_window_height();">  关闭</a>'))
    alert.removeClass("d-none")
}

function set_config(key,value){
    get_current_config(function(conf){
        conf[key] = value
        save_config(conf,function(){})
    })
}

function get_current_config(func){
    storage.get("config",function(error,data){
        if (error) throw error;

        if(JSON.stringify(data)=="{}"){
            //default config
            data.fontsize = "14"   
        }
        if(typeof(data.col)=="undefined"){
            data.col = []
        }
        if(typeof(data.keys)=="undefined"){
            data.keys = ["sh000001@a"]
        }
        if(typeof(data.opa)=="undefined"){
            data.opa = 1.0
        }
        if(typeof(data.opa_chart)=="undefined"){
            data.opa_chart = 1.0
        }
        if(typeof(data.uuid)=="undefined"){
            data.uuid = machineIdSync(true)
        }
        if(typeof(data.mkt)=="undefined"){
            data.mkt = "A股"
        }
        if(typeof(data.sort)=="undefined"){
            data.sort = ""
        }
        if(typeof(data.model)=="undefined"){
            data.model = "nm"
        }
        if(typeof(data.alias)=="undefined"){
            data.alias = {}
        }
        if(typeof(data.color)=="undefined"){
            data.color = "cw"
        }
        console.log("config:")
        console.log(data)
        func(data)
    })
}

function save_config(data,func){
    storage.set('config', data, function(error) {
        if (error) throw error;

        func()
    });
}

function request_post(url,params,suc,fail){
    console.log("post to:"+url)
    console.log("params:",params)

    // let data = {}
    // var ciphertext = window.btoa(encodeURI(JSON.stringify(params)));
    // data.en = ciphertext;

	// the_ajax = $.ajax({
    //     type: "POST",
    //     url: url,
    //     contentType: "application/json; charset=utf-8",
    //     data: JSON.stringify(params),
    //     dataType: "json",
    //     timeout:5000,
    //     success: suc,
    //     error: fail
    // });
    var source = CancelToken.source();
    axios.post(url,params,{
        cancelToken: source.token,
        timeout: 60000,
    }).then(function(res){
        suc(res.data)
    })
    .catch(function(message){
        console.log("post NOTOK:"+JSON.stringify(message))
        fail(message,"err")
    });

	return source
}

function request_get(url,params,suc,fail){

    var source = CancelToken.source();
    axios.get(url,{
        params:params,
        cancelToken: source.token,
        headers:{"contentType":'application/x-www-form-urlencoded; charset=utf-8'},
        responseType:'text',
    }).then(function(res){
        suc(res.data)
    })
    .catch(function(message){
        console.log("get NOTOK:"+JSON.stringify(message))
        fail(message,"err")
    });

	return source
}

function setup_opacity_control(key,win){
    ADJ_CONST = 0.05

    Mousetrap.bind('ctrl+[', () => {
    // Do stuff when Y and either Command/Control is pressed.
        opacity = win.getOpacity()
        if (opacity - ADJ_CONST < 0.05){
            win.setOpacity(0.05)
        }else{
            win.setOpacity(opacity - ADJ_CONST)
        }
      cm.set_config(key,win.getOpacity())
    })

    Mousetrap.bind('ctrl+]', () => {
    // Do stuff when Y and either Command/Control is pressed.
        opacity = win.getOpacity()
        if (opacity + ADJ_CONST > 1){
            win.setOpacity(1)
        }else{
            win.setOpacity(opacity + ADJ_CONST)
        }
      cm.set_config(key,win.getOpacity())
    })
}

function happend_time(key,func){
    storage.get("happend_time",function(error,data){
        if (error) throw error;

        let t = data[key]
        if(t===undefined){
            t = 0
        }
        func(t)

        data[key] = t+1
        storage.set('happend_time', data, function(error) {
            if (error) throw error;
        });
    })
}

exports.setup_opacity_control = setup_opacity_control
exports.open_url = open_url;
exports.open_file = open_file;
exports.post = request_post;
exports.get = request_get;
exports.get_current_config = get_current_config;
exports.save_config = save_config;
exports.set_config = set_config;
exports.happend_time = happend_time;
exports.alert_with_close = alert_with_close;
// exports.base_url = "http://localhost:8080";
// exports.freq = 3000;
exports.base_url = "http://api.guyu.biz:8080";
exports.freq = 15000;
