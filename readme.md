bookinfo
=======

This module is for getting information of book from
book identifier( like ISBN ).

Usage
======

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



TODO
====

- search from other information ( title, publisher, author )
- supporting logic condition ( or, and, not etc )



