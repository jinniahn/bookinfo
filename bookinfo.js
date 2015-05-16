/*

  bookinfo
  ========

  get information of book from google.

  functions
  =========

  - get_info( cond, callback ) 
  : callback(err, info)


  USAGE
  =====

  var bookinfo = require('bookinfo')
  bookinfo.get_info({"isbn": 9788998886011})



  ===

*/

var cheerio = require('cheerio');
var request = require('request');
var url = require('url')
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');


// get book info page url
//
// search book info page and get detail page url
//
// @param isbn[String] isbn string of book
// @param callback[function(err, link)] call after processing
var get_book_url = function(isbn, callback){
    var url = 'https://www.google.com/search?tbo=p&tbm=bks&q=isbn:'+isbn
    request(url, function(error, response, html){
		if (error) {
			if(callback){callback(error);}
			return;
		};
		var $ = cheerio.load(html);
		callback(null, $('div#search a').attr('href'))
    });
}

// get information of book
//
// @param link[String] deatil page url
// @param callback[function(err, info)] result
//
// info should be like below:
//
// { title: 'Getting StartED with Windows Live Movie MakerFriends of Ed SeriesGetting StartedSpringer eBook Collection',
//   author: 'James Floyd Kelly',
//   edition: 'illustrated',
//   publisher: 'Apress, 2010',
//   isbn: [ '1430229012', '9781430229018' ],
//   pages: '248',
//   subjects: 'Computers › Digital Media › Video & AnimationComputers / Computerized Home & EntertainmentComputers / Digital Media / Video & Animation' }
var get_info_from_google = function(link, callback) {

    // tweak link to get detail page without preview
    var u = url.parse(link, true)
    delete u.search    
    delete u.query["printsec"]
    u.query['hl'] = 'en'
    link = url.format(u)

    // get info
    request({uri: link, encoding: 'binary'}, function(err, resp, body) {

		// fix hangul(korean language) encoding problem
		var strContents = new Buffer(body, 'binary')
		var html = iconv.convert(strContents).toString('utf8');
		
		if (err) {
			if(callback) { callback(err); }
			return;
		}

		// load html to parse
		var $ = cheerio.load(html);

		// result of processing
		var info = {}

		// parsing
		$('#metadata_content_table tr').each(function(index, item){
			var title = $(this).find('td').eq(0).text().trim().toLowerCase()
			var value = $(this).find('td').eq(1).text().trim()
			// remap title
			if (title == 'translated by') { title = 'translator'; }
			if (title == 'length') { title = 'pages'; }

			// skip
			if (title == 'export citation') return;

			// convert data according to specific data
			if (title == 'translator' || title == 'contributors' || title == 'isbn') {
				value = value.split(',')
				value = value.map(function(item){
					return item.trim();
				});
			}
			if (title == 'pages') {
				value = value.replace('pages', '').trim()
			}


			
			if (title.length != 0) {
				info[title] = value;
			}
		});

		if(callback) { callback(null, info); }	

    })

};

// get info when given isbn string
var get_info_from_isbn = function( isbn, callback ) {
    get_book_url( isbn, function(err, url) {

		// check error 
		if (err) { callback(err); return; }

		get_info_from_google( url, function( err, info ) {
			callback(null, info);
		});
    });
};

// get info
//
// @query[Dictionary] query for searching
//
// this function is only supported with "isbn". so
// if you want get information of book, you have give
// isbn string
var get_info = function( query, callback ) {
    if( query['isbn'] ) {
		get_info_from_isbn(query['isbn'], callback);
    } else {
		if(callback) { callback("not supported"); }
    }
};

module.exports.get_info = get_info




