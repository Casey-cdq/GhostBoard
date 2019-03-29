const {shell} = require('electron'); 

function open_url(url){
	console.log("open "+url)
	shell.openExternal(url);
}

function request_post(url,params,suc,fail){
	the_ajax = $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        dataType: "json",
        success: suc,
        error: fail
    });

	// the_ajax.abort()

	// return the_ajax
}

exports.open_url = open_url;
exports.post = request_post;
exports.base_url = "http://localhost:8080";