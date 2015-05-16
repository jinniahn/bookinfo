var bookinfo = require('./bookinfo')
// use below if you using npm module
// var bookinfo = require('bookinfo')

bookinfo.get_info({isbn: '1430229012'}, function(err, info){
    if(err) {
	console.log('error : ' + err);
	return;
    }
    console.log(info);
});
