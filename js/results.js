/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon Results Page
	Date: 3-30-11
*/

var SRCH_RSLT = typeof(SRCH_RSLT) === "undefined" ? {} : SRCH_RSLT;
(function(context){	
	var json = {},
		term = "No Search Term",
		regex,
		template = {};
	
	var location = window.location.href,
		is_query 	= location.indexOf('?'),
		content_div = '#article_content',
		service_line = '#service_line';

	/**
	* Load url hashes into vars array for later use
	* @private
	*/
	function get_url_var(){
		var hash = location.slice(is_query + 1);
		return decodeURIComponent( hash );
	}
	
	function set_term_display(term) {
		$(context.settings.term_display).text(term);
	}
	
	function filter_json() {
		var arr = [];
		$(json).each(function(i, item){
			var node = item.expertise;
			$(node).each(function(x, exp){
				if ( regex.test(exp) ) {
					arr.push( item );
				}
			})
			
		});
		return arr;
	}
	
	function list_balancer(data, num_cols) {
		var depth = Math.ceil(data.length / num_cols);
			ret = [],
			start = 0;

		for (var i=0; i < num_cols; i++) {
			ret.push( data.slice(start, start+depth) );
			start = start + depth;
		}

		return ret;
	}
	
	function get_multi_col(data, num_cols) {
		var balanced = list_balancer( data, num_cols );

		var html = "";
		$(balanced).each(function(i, item){
			html += '<ul>';
			$(item).each(function(i, item){
				html += '<li>' + item + '</li>';
			});	
			html += '</ul>';
		});

		return html;
	}
	
	function templatize(data) {
		var html = "";
		
		//wrapper
		html += '<div class="result">';
		
		//photo
		html += '<section class="photo">';
		html += '<img src="'+ data.headshot_url +'" class="headshot">';
		html += '<a href="'+ data.profile_url +'" class="pops" target="_blank">View Full Profile</a>';
		html += '</section>';
		
		//info section
		html += '<section class="info">';
		
		//name header
		html += '<header class="name">';
		html += data.full_name;
		html += '</header>';
		
		//appointments
		html += '<section class="appointments">';
		$.each(data.faculty_appointments, function(i, item) {
			html += '<p>' + item.title + '<br><em>' + item.institution + '</em></p>';
		});
		html += '</section>';
			
		//contact
		html += '<section class="contact">';
		html += '<table>';
		html += '<tr class="main phone">';
		html += '<td class="title">Phone:</td>';
		html += '<td class="value">'+ data.phone || "N/A" +'</td>';
		html += '</tr>';
		html += '<tr class="fax">';
		html += '<td class="title">Fax:</td>';
		html += '<td class="value" >'+ data.fax || "N/A" +'</td>';
		html += '</tr>';
		html += '<tr class="address">';
		html += '<td class="title">Address:</td>';
		html += '<td class="value">'+ data.address || "N/A" +'</td>';
		html += '</tr>';
		html += '</table>';
		
		//expertise button
		html += '<section class="expertise_button">';
		html += '<a href="#">View All Specialties</a>';
		html += '</section>';
		
		//close contact section
		html += '</section>';
		
		//close info section
		html += '</section><!-- .info -->';
				
		//expertise panel
		html += '<section class="expertise">';
		html += '<header>Clinical Expertise</header';
		html += '<div class="expertise_holder">';
		html += get_multi_col( data.expertise, 3 );
		html += '</div>';
		html += '</section>';
		
		//close wrapper 
		html += '</div>';	
		
		return html;		
	}
	
	function print_results(matched) {
		//write results
		$.each(matched, function(i, item){
			var result = templatize(item);
			$('#search_results').append(result);
		});
		
		//expertise 'see more' click handler
		$('.result').each(function(){
			$(this).find('.expertise_button').find('a')
			.toggle(function(e){
				$(this).text('Hide All Specialties');
				$(this).parent().parent().parent().next('.expertise').slideDown(800);
				e.preventDefault();	
			}, function(e){
				$(this).text('View All Specialties');
				$(this).parent().parent().parent().next('.expertise').slideUp(800);
				e.preventDefault();
			});
			
			$(this).fadeIn();
			
		});
		
		
	}
	
	function json_has_loaded() {
		var matched = filter_json();
		if (matched.length > 0) {
			print_results(matched);
		} else {
			$('#no_results').find('span').text(term).fadeIn();
			$('#no_results').fadeIn();
		}
	}
	
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			base_url : "http://localhost/fas/",
			term_display : $('#search_term')
		};
		
		term = get_url_var();
		set_term_display(term);
		
		regex = new RegExp( '^'+ get_url_var() );
		
		
		$.getJSON(context.settings.data, function(data){
			json = data.physicians;
			json_has_loaded();
        });
	}
	
})(SRCH_RSLT);



$(document).ready(function() {
	SRCH_RSLT.init();
	//PROFILE.show();
});