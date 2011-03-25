/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

if (typeof Object.beget !== 'function') {
	Object.beget = function(o) {
		var F = function(){};
		F.prototype = o;
		return new F();
	}
}
/*
Object.method('superior', function (name) {
    var that = this,
        method = that[name];
    return function (  ) {
        return method.apply(that, arguments);
    };
});
*/
var UTILS = typeof(UTILS) === "undefined" ? {} : UTILS;
(function(context, undefined){
	var name = "";
	/**
	** Takes an object and translates it to an array
	** @params (obj) single level list object
	** @example UTILS.list_to_array( {"pizza", "burgers"} ); // ["pizza", "burgers"]
	**/
	context.list_to_array = function(object) {
		var a = [];
		$(object).each(function(i, item){
			a.push(item);
		});
		return a;
	}
	
	/**
	** Clears li's, does NOT remove ul node
	** @params (jQuery) ul dom node
	** @example UTILS.clear_list( $('#specialties').find('ul') );
	**/
	context.clear_list = function(list) {
		list.html("");
	}
	
	context.get_name = function() {
		return this.name;
	}
	
	context.set_name = function(x) {
		this.name = x;
	}
	
	
})(UTILS);





var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;
(function(context){	
	var names, //holds last names json
		specialties, //holds specialties json
		services, //holds, yes, servies json
		term = "", //the term currently in the input field
		regex, //the regex object for the term
		settings = {}, 
		view_manager = {},
		data_manager = {},
		list = {},
		card = {};
		
	
	view_manager.template = {};

	//new and needed
	var lists = {};
	
	
	
	var List = function(settings) {
		var self = {};

		//private vars
		var list = settings.list,
			id = settings.id,
			ul = settings.ul,
			feedback = $(id).find('.feedback'),
			regex = settings.regex,
			max = settings.max,
			term = settings.term;

		//public methods
		self.get_matched_string = function(item) {
			return item.replace(settings.regex, '<span class="match">'+ item.match(settings.regex) +'</span>');
		};
		
		self.initialize_list = function() {
			settings.ul.html("");
			self.set_feedback(0);
		}
		
		self.clear_list = function() {
			settings.ul.html("");
		}

		self.print_all = function() {
			self.clear_list();
			$(settings.list).each(function(i, item){
				$(settings.id).find('ul').append(self.template(item, i));
			});
		}
		
		self.print_list = function(filtered) {
			self.clear_list();

			$.each(filtered, function(i, item) {
				settings.ul.append( self.template(item, i) );
			});
		}
		
		self.init_feedback = function() {
			$(feedback).html("Enter a term to begin search.");
		}
		
		self.set_feedback = function(match_count) {
			var msg = "";
				matched = match_count || 0;
			
			if (settings.term.length === 0 && match_count === 0) {
				init_feedback();
				return;
			} else if (settings.term.length > 0 && match_count === 0) {
				msg = "No matches found";
			} else {
				var count = (match_count < settings.max) ? match_count : settings.max;
				var seeall = (match_count < settings.max) ? "" : " (see all)";
				msg = "Viewing " + count + " of " + match_count + seeall;
			}
			$(feedback).html(msg);
		}
		
		self.filter = function(term, regex) {
			if (term.length > 0) {
				settings.term = term;
				settings.regex = regex;

				var filtered = self.get_filtered();
				self.set_feedback(filtered.length);
				self.print_list( limit(filtered) );	
			} else {
				self.initialize_list();
			}
		}
		
		//filter data crunching
		self.get_filtered = function() {
			var arr = [];
			$(list).each(function(i){
				var node = list[i][settings.filter_against] || list[i];
				if( settings.regex.test(node) ) {
					arr.push(list[i]);
				}
			});
			return arr;
		}
		
		limit = function(arr) {
			return (settings.max) ? arr.slice(0, settings.max) : arr;
		}

		return self; //List
	}

	var NamesList = function(settings) {
		var self = List(settings);
		
		settings.filter_against = "last_name";

		//public methods
		self.print_list = function(filtered) {
			self.clear_list();
			
			$.each(filtered, function(i, item) {
				settings.ul.append( self.template(item, i) );
				get_image(item.headshot_url, 'id'+i, term.length);
			});
		}
		
		self.template = function(data, id) {
			return '<li class="name_item"><div class="loading" id="id'+ id +'"></div><span class="name">' + self.get_matched_string(data.full_name) + '</span></li>';
		};

		return self;
	}
	
	var SpecialtiesList = function(settings) {
		var self = List(settings);

		//public methods
		self.template = function(data) {
			return '<li><a href="search.html#'+ data +'">' + self.get_matched_string(data) + '</a></li>';
		}

		return self;
	}
	
	var ServicesList = function(settings) {
		var self = List(settings);
		
		print_list = function(filtered) {
			self.clear_list();
			
			$.each(filtered, function(i, item){
				settings.ul.append( self.template(item) );
			});
		}
		
		self.filter = function(term, regex) {
			settings.term = term;
			settings.regex = regex;
			
			print_list(settings.list);
		}
		
		self.template = function(data) {
			return '<li><a href="'+ context.settings.base_url + data.path + '">' + self.get_matched_string(data.title) + '</a></li>';
		}
		
		return self;
	}
	
	
	
	/*
		LIST VIEW
	*/
	
	/**
	** (int) max - max number to show
	** (string) div - the div to target e.g. #last-name, #specialties, #services
	*/
	list = function(obj){
		var max		= obj.max,
			ul		= $(obj.div).find('ul'),
			count	= 0;
			
		view_manager.clear_list(ul); //clear and redraw for each call
		
		if (term.length > 0) {
			switch (obj.div) {
				case "#last-name" :
					var filtered = list.get_filtered(names, "last_name"); //returned array
					var inc = 0;
					view_manager.feedback(ul, max, filtered.length);
					$(filtered).each(function(i){
						if (inc < max) {
							ul.append( 
								view_manager.template.last_names({
									"full_name" : data_manager.get_matched_string(filtered[i].full_name),
									"id" : 'id' + i
								})
							);
							data_manager.get_image(filtered[i].headshot_url, 'id'+i, term.length);
						}
						inc++;
					});
					break;
					
				case "#specialties" :
					var filtered = list.get_filtered(specialties); //returned array
					var inc = 0;
					view_manager.feedback(ul, max, filtered.length);
					$(filtered).each(function(i){
						if (inc < max) {
							ul.append( 
								view_manager.template.specialties({
									"path" : "/index.html",
									"title" : data_manager.get_matched_string(filtered[i])
								})
							);
						}
						inc++;
					});
					break;
					
				case "#services" :
					$(services).each(function(i){
						var item = services[i].title;
						if (regex.test(item)) {
							item = data_manager.get_matched_string(item);
						}
						ul.append(view_manager.template.services({
							"path" : services[i].path,
							"title" : item
						}));
					});
					break;
				default :
					log('you have not provided list_name to view_manager.filterable_list');
					error('there has been an initialization error');
			}
		} else {
			if (obj.div !== "#services") {
				view_manager.clear_list(ul);
				view_manager.feedback(ul, max, 0);
			} else {
				list.init_services();
			}
		}
	};
	

	//not using this at the moment, getting count from get_filtered arr.count
	list.get_count = function(list, attribute_name) {
		var count = 0;
		$(list).each(function(i){
			var test_value = list[i][attribute_name] || list[i];;
			if( regex.test(test_value) ) {
				count++;
			}
		});
		return count;
	}
	
	
	
	list.get_smaller_lists = function(list, num_cols, max_per_col) {
		var ret = "";
		
		var balanced = this.list_balancer(UTILS.list_to_array(list).sort(), 4);
		
		$(balanced).each(function(i, item){
			ret += "<ul>";
			$(item).each(function(i, item){
				ret += "<li>" + item + "</li>";
			});
			ret += "</ul>";
		});
		
		return ret;
	}
	
	// (array) list, (int) number of sections you want
	// returns an array of arrays
	list.list_balancer = function(list, sections) {
		var depth = Math.ceil(list.length / sections);
			ret = [],
			start = 0;
			
		for (var i=0; i < sections; i++) {
			ret.push( list.slice(start, start+depth) );
			start = start + depth;
		}
			
		return ret;
	}
	
	card.on_click = function(name) {
		name_regex = new RegExp('^'+name);
		
		var data = data_manager.get_json_node_data(names, "full_name", name_regex);
		card.populate_data(data[0], function(){
			$('#card').fadeIn();
			
			$('#card').find('#card-close').click(function(){
				$('#card').fadeOut(function(){
					card.on_close();
					data = {};
					$(context.settings.inputId).focus();
				});
			});
		});
	}
	
	card.populate_data = function(data, callback) {
		var card = $('#card');
		//full name
		card.find('#name').text(data.full_name);
		
		card.find('#headshot').attr('src', data.headshot_url);
		card.find('#pops').attr('href', data.profile_url);
		
		$(data.faculty_appointments).each(function(i){
			$('#appointments').append('<p>' + this.title + '<br><em>' + this.institution + '</em></p>');
		});
		
		card.find('#phone').text(data.phone || "N/A");
		card.find('#fax').text(data.phone || "N/A");
		card.find('#address').text(data.address || "N/A");
		
		card.find('#expertise div').html(list.get_smaller_lists( data.expertise, 4, 10) );
		
		if($.isFunction(callback)){
			callback.apply();
		}
		
		return;
	}
	
	card.on_close = function(){
		$('#card').find('#appointments').html("");
	}
	
	
	
	
	data_manager.get_matched_string = function(item) {
		return item.replace(regex, '<span class="match">'+ item.match(regex) +'</span>');
	}
	
	/**
	** @params (string) full path to image, (string) the id of the loading div, (int) the count of the current term
	*/
	
	
	data_manager.object_to_array = function(object) {
		var a = [];
		$(object).each(function(i, item){
			a.push(item);
		});
		return a;
	}
	
	data_manager.get_json_node_data = function(source, attribute, regexp) {
		var arr = [];
		$(source).each(function(i){
			var test_value = source[i][attribute] || source[i];
			if( regexp.test(test_value) ) {
				arr.push(source[i]);
			}
		});
		return arr;
	}
	
	//private methods
	get_image = function(url, el, count) {
		var el = '#'+el;

		//count lets me know whether the image needs to be loaded or not, only load on the first letter
		if (count > 1) {
			$(el).append('<img src="'+ url +'">');
		} else {
			var img = new Image();
			$(img)
				.load(function(){
					$(el).removeClass('loading').append(this);
				})
				.error(function(){
					url = "https://images.med.cornell.edu/headshots/default.jpg";
				})
				.attr('src', url);
		}
	}
	
	initialize_data = function(callback) {
		$.getJSON(context.settings.services, function(data){
			lists.services = ServicesList({
				'list' : data.services,
				'id' : '#services',
				'ul' : $('#services').find('ul')
			});
			lists.services.print_all();
		});
		
		$.getJSON(context.settings.data, function(data){
			lists.names = NamesList({
				'list' : data.physicians,
				'id' : '#last-name',
				'ul' : $('#last-name').find('ul'),
				'max' : 6
			});
			lists.names.init_feedback();
			
			lists.specialties = SpecialtiesList({
				'list' : data.specialties,
				'id' : '#specialties',
				'ul' : $('#specialties').find('ul'),
				'max' : 12
			});
			lists.specialties.init_feedback();
        });

		if($.isFunction(callback)){
			callback();
		}
	}
	
	parse_input = function(term) {
		regex = new RegExp('\\b' + term, "i");

		lists.names.filter(term,regex);
		lists.specialties.filter(term, regex);
		lists.services.filter(term, regex);
	}
	
	clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			services : 'js/services.json',
			inputId : '#input',
			results : '#results',
			base_url : "http://cornellsurgery.org/patients/"
		};
		
		//initialize to empty text field
		clear_input(true);
		
		//establish data then show lists
		initialize_data(function(){
			$(context.settings.results).fadeIn();
		});

		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			parse_input( $(this).val() );
			
			$('#last-name').find('.name_item').each(function(){
				$(this).click(function(){
					card.on_click( $(this).text() );
				});
			});
		});
		
		
		
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
});