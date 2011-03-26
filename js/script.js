/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;
(function(context){	
	var settings = {}

	var lists = {},
		json = {},
		views = {},
		card = false;
	
	/*
		List Classes
	*/
	var List = function(settings) {
		var self = {};
		
		var data = settings.data,
			id = settings.id, //wrapper div
			ul = settings.ul, //jQuery element
			max = settings.max; //optional max items to display
		
		
		list_balancer = function(list, sections) {
			var depth = Math.ceil(list.length / sections);
				ret = [],
				start = 0;

			for (var i=0; i < sections; i++) {
				ret.push( list.slice(start, start+depth) );
				start = start + depth;
			}

			return ret;
		}
		
		object_to_array = function(object) {
			var a = [];
			$(object).each(function(i, item){
				a.push(item);
			});
			return a;
		}
		
		//public
		self.print_all = function() {
			try {
				self.clear_list();
				$(settings.data).each(function(i, item){
					ul.append(self.template(item, i));
				});
			} catch(e) {
				log(new Error(e));
			}
		}
		
		self.clear_list = function() {
			ul.html("");
		}
		
		self.limit = function(arr) {
			if (!arr) {
				arr = object_to_array(data);
			}
			return (settings.max) ? arr.slice(0, settings.max) : arr;
		}
		
		self.template = function(data) {
			return '<li>' + data + '</li>';
		}
		
		self.multi_column = function(num_cols) {
			var ret = "";
			
			var balanced = list_balancer( self.limit(object_to_array(data).sort()), num_cols);

			$(balanced).each(function(i, item){
				ret += "<ul>";
				$(item).each(function(i, item){
					ret += "<li>" + item + "</li>";
				});
				ret += "</ul>";
			});

			return ret;
		}
		
		return self; //List
	} //List
		
	var FilterableList = function(settings) {
		var self = List(settings);

		//private vars
		var feedback = $(settings.id).find('.feedback'),
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
				self.init_feedback();
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
			settings.term = term;
			settings.regex = regex;
			
			if (term.length > 0) {
				var filtered = self.get_filtered();
				self.set_feedback(filtered.length);
				self.print_list( self.limit(filtered) );	
			} else {
				self.initialize_list();
			}
		}
		
		//filter data crunching
		self.get_filtered = function() {
			var arr = [];
			$(settings.data).each(function(i){
				var node = settings.data[i][settings.filter_against] || settings.data[i];
				if( settings.regex.test(node) ) {
					arr.push(settings.data[i]);
				}
			});
			return arr;
		}
		
		

		return self; //List
	}

	var NamesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "last_name";

		//public methods
		self.print_list = function(filtered) {
			self.clear_list();

			$.each(filtered, function(i, item) {
				settings.ul.append( self.template(item, i) );
				get_image(item.headshot_url, 'id'+i, settings.term.length);
			});
		}
		
		self.template = function(data, id) {
			var temp = '<li class="name_item">';
				temp += '<div class="image loading" id="id'+ id +'"></div>';
				temp += '<div class="name">' + self.get_matched_string(data.full_name) + '</div>';
				temp += (data.practicing_specialty) ? '<div class="prac_spec">'+ data.practicing_specialty  +'</div></li>' : "";
			return temp;
		};

		return self;
	}
	
	var SpecialtiesList = function(settings) {
		var self = FilterableList(settings);

		//public methods
		self.template = function(data) {
			return '<li><a href="search.html#'+ data +'">' + self.get_matched_string(data) + '</a></li>';
		}

		return self;
	}
	
	var ServicesList = function(settings) {
		var self = FilterableList(settings);
		
		print_list = function(filtered) {
			self.clear_list();
			
			$.each(filtered, function(i, item){
				settings.ul.append( self.template(item) );
			});
		}
		
		self.filter = function(term, regex) {
			settings.term = term;
			settings.regex = regex;
			
			print_list(settings.data);
		}
		
		self.template = function(data) {
			return '<li><a href="'+ context.settings.base_url + data.path + '">' + self.get_matched_string(data.title) + '</a></li>';
		}
		
		return self;
	}
	
	/*
		Card Class
	*/
	var Card = function(settings) {
		var self = {};
		
		var name = settings.name,
			el = settings.el,
			close_el = settings.close_el,
			data = settings.data;
		
		//Private		
		populate_card = function() {
			//full name
			$(el).find('#name').text(data.full_name);

			el.find('#headshot').attr('src', data.headshot_url);
			el.find('#pops').attr('href', data.profile_url);

			$(data.faculty_appointments).each(function(i){
				$('#appointments').append('<p>' + this.title + '<br><em>' + this.institution + '</em></p>');
			});

			el.find('#phone').text(data.phone || "N/A");
			el.find('#fax').text(data.phone || "N/A");
			el.find('#address').text(data.address || "N/A");
			
			var expertise = List({
				'data' : data.expertise,
				'id' : '#expertise_holder',
				'max' : 40
			}).multi_column(4);
			el.find('#expertise div').html( expertise );	
		}
		
		//Public	
		self.show = function() {
			populate_card();
			 
			el.fadeIn();
			
			//close card listener
			close_el.click(function(){
				self.close_card();
			});
		}
		
		self.close_card = function() {
			el.fadeOut();
			$(context.settings.inputId).focus();
			$('#card').find('#appointments').html("");
		}
		
		return self;
	} // Card
	
	
	/*
		View Class (i.e. Tabs)
	*/
	var View = function(settings) {
		var self = {};
		
		var control = settings.control,
			panel = settings.panel,
			active = settings.panel;
			
			
		self.activate = function(callback) {
			log(panel);
			settings.panel.fadeIn();

			if ( $.isFunction(callback) ) {
				callback();
			}
			
			return self;
		}
		
		self.deactivate = function(callback) {
			panel.fadeOut();
			
			if ( $.isFunction(callback) ) {
				callback();
			}
			
			return self;
		}
		
		return self;
	}
	
	//private methods
	var object_to_array = function(object) {
		var a = [];
		$(object).each(function(i, item){
			a.push(item);
		});
		return a;
	}
	
	var get_json_node = function(term, source, attribute) {
		var regex = new RegExp('^'+term),
			ret = {};
		
		$(source).each(function(i){
			var test_value = source[i][attribute] || source[i];
			if( regex.test(test_value) ) {
				ret = source[i];
			}
		});
		return ret;
	}
	
	var get_image = function(url, el, count) {
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
	
	var initialize_data = function(callback) {
		$.getJSON(context.settings.services, function(data){
			lists.services = ServicesList({
				'data' : data.services,
				'id' : '#services',
				'ul' : $('#services').find('ul')
			});
			lists.services.print_all();
		});
		
		$.getJSON(context.settings.data, function(data){
			json.names = data.physicians;
			lists.names = NamesList({
				'data' : data.physicians,
				'id' : '#last-name',
				'ul' : $('#last-name').find('ul'),
				'max' : 6
			});
			lists.names.init_feedback();
			
			lists.specialties = SpecialtiesList({
				'data' : data.specialties,
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
	
	var parse_input = function(term) {
		regex = new RegExp('\\b' + term, "i");
		
		lists.names.filter(term,regex);
		lists.specialties.filter(term, regex);
		lists.services.filter(term, regex);
		
		card_manager(term);
	}
	
	var clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	var card_manager = function(term) {
		if (card) {
			card.close_card();
			card = false;
		} else {
			$('#last-name').find('.name_item').each(function(){
				$(this).click(function(){
					//establish new Card
					card = Card({
						'name' : $(this).find('#name').text(),
						'el' : $(context.settings.card),
						'close_el' : $(context.settings.card_close),
						'data' : get_json_node($(this).find('#name').text(), json.names, 'full_name')
					});
					card.show();
				});
			});
		}
	}
	
	var total_views = function(){
		var inc = 0;
		$('nav').find('ul').find('li').each(function(i){
			inc++;
		});
		return inc;
	}
	
	var map_view_controls = function() {
		var map = [];
		$('nav').find('ul').find('li').each(function(i, item){
			$(item).addClass('tab'+i);
		});
		
		$('.panel').each(function(i, item){
			$(item).addClass('view'+i);
			map['tab'+i] = 'view'+i;
		});
		
		return map;
	}
	
	var initialize_views = function() {
		views.everything = View({
			'control' : $('#control0'),
			'panel' : $('#view0'),
			'active' : true
		});
		
		views.names = View({
			'control' : $('#control1'),
			'panel' : $('#view2'),
			'active' : false
		});
		
		views.specialties = View({
			'control' : $('#control2'),
			'panel' : $('#view2'),
			'active' : false
		});
		
		views.services = View({
			'control' : $('#control3'),
			'panel' : $('#view3'),
			'active' : false
		});
	}
	
	context.init = function(options) {
		context.settings = {
			data : 'js/data.json',
			services : 'js/services.json',
			inputId : '#input',
			results : '#results',
			card : '#card',
			card_close : '#card-close',
			base_url : "http://cornellsurgery.org/patients/"
		};
		
		initialize_views();
		
		
		//initialize to empty text field
		clear_input(true);
		
		//establish data then show lists
		initialize_data(function(){
			views.everything.activate();
			//$(context.settings.results).fadeIn();
		});

		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			parse_input( $(this).val() );
		});
		
		//bind hover event for tab nav 
		$('nav').find('ul').find('li').each(function(i, item){
			$(this).click(function(){
				
			});
		});
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
	//PROFILE.show();
});