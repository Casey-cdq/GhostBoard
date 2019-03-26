const {shell} = require('electron'); 

function open_url(url){
	console.log("open "+url)
	shell.openExternal(url);
}

exports.open_url = open_url;