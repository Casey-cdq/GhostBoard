console.log("add.js load.")

Mousetrap.bind('esc', () => { 
	console.log('esc')
	const { remote } = require('electron')
	remote.getCurrentWindow().close()
})