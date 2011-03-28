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
		view_manager = {},
		card = false;
		
		view_manager.lists = [];
	
	/*
		List Classes
	*/
	var List = function(settings) {
		var self = {};
		
		var data = settings.data,
			max = false;
		
		
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
		self.print_list = function(filtered) {
			self.clear_list();

			$.each(filtered, function(i, item) {
				settings.ul.append( self.template(item, i) );
			});
		}
		
		self.get_list_sinlge_column = function() {
			var ret = '<ul>';
			
			$.each(data, function(i, item){
				ret += self.template(item, i);
			});
			
			ret += '</ul>';
			
			return ret;
		}
		
		self.set_limit = function(val) {
			settings.max = val;
		}
		
		self.get_list_all = function() {
			var ret = '<ul>';
			$(settings.data).each(function(i, item){
				ret += self.template(item, i);
			});
			ret += '</ul>';
			return ret;
		}
		
		self.print_list = function(list) {
			$.each(list, function(i, item){
				settings.element.append(self.template(item));
			});
		}
		
		self.print_all = function() {
			try {
				self.clear_list();
				$(settings.data).each(function(i, item){
					settings.element.append(self.get_list_all());
				});
			} catch(e) {
				log(new Error(e));
			}
		}
		
		self.clear_list = function() {
			settings.element.find('ul').remove();
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
		
		self.get_multi_column = function(num_cols) {
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
		
		self.get_element = function() {
			return settings.element;
		}
		
		
		return self; //List
	} //List
		
	var FilterableList = function(settings) {
		var self = List(settings);

		//private vars
		var feedback = $(settings.element).find('.feedback'),
			regex,
			max,
			term;

		//public methods
		self.get_matched_string = function(item) {
			return item.replace(settings.regex, '<span class="match">'+ item.match(settings.regex) +'</span>');
		};
		
		self.initialize_list = function() {
			settings.ul.html("");
			self.set_feedback(0);
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
			settings.regex = regex;
			
			if (term.length > 0) {
				return self.get_filtered();
				//var filtered = self.get_filtered();
				//return filtered;
				//self.set_feedback(filtered.length);
				//self.print_list( self.limit(filtered) );	
			} else {
				//self.initialize_list();
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
			return self.limit(arr);
		}
		
		

		return self; //FilterableList
	}

	var NamesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "last_name";

		//public methods
		self.print_list = function(filtered) {
			self.clear_list();

			$.each(filtered, function(i, item) {
				settings.element.append( self.template(item, i) );
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
			
			//print_list(settings.data);
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
			}).get_multi_column(4);
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
	
	//Card Manager - how the app interfaces with a Card
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
						'data' : get_json_node($(this).find('.name').text(), json.names, 'full_name')
					});
					card.show();
				});
			});
		}
	}
	
	
	/*
		View Class (i.e. Tabs)
	*/
	var View = function(settings) {
		var self = {};
		
		var control = settings.control,
			panel = settings.panel,
			active = false;
			
		self.list = {};
			
			
		self.activate = function(callback) {
			active = true;
			control.addClass('active');
			panel.fadeIn();
			
			if ( $.isFunction(callback) ) {
				callback();
			}
			
			return self;
		}
		
		self.deactivate = function(callback) {
			active = false;
			control.removeClass('active');
			panel.fadeOut(function(){
				if ( $.isFunction(callback) ) {
					callback();
				}
			});
			
			return self;
		}
		
		self.prepare = function() {
			control.addClass('active');
		}
		
		self.spark_filter = function(term, regex) {
			$.each(list, function(i){
				list[i].filter(term, regex);
			});
		}
		
		self.register_list = function(name, l) {
			self.list[name] = l;
		}
		
		self.get_list = function() {
			return self.list;
		}
		
		self.is_active = function() {
			return active;
		}
		
		self.get_name = function() {
			return name;
		}
		
		self.get_control = function() {
			return control;
		}
		
		return self;
	}
	
	var EverythingView = function(settings) {
		var self = View(settings);
		
		var control = settings.control,
			panel = settings.panel,
			active = false;
		
		self.activate = function() {
			active = true;
			settings.control.addClass('active');
			
			$.each(self.list, function(){
				this.init_feedback();
			});
			
			self.list.services.print_all();
			
			settings.panel.fadeIn();
		}
		
		self.display_filtered = function(term, regex) {
			self.list.names.set_limit(6);
			var filtered_ln = self.list.names.filter(term, regex);
			log(filtered_ln.length);
			self.list.names.clear_list();
			self.list.names.print_list(filtered_ln);
			
			//self.list.names.print(filtered_ln);
			
			
			//self.list.specialties.filter(term, regex);
			//self.list.services.filter(term, regex);
		}
		
		
		return self;
	}
	
	
	//View Manager - how the app interfaces with View(s)
	view_manager.init = function(view) {
		view_manager.register_active(view);
		view.activate();
		
		
		$.each(views, function(i, item){
			item.get_control().click(function(){
				view_manager.switch_active(item);
			});
		});	
	}
	
	view_manager.switch_active = function(next) {
		next.prepare();
		view_manager.active.deactivate(function(){
			view_manager.register_active(next);
			next.activate();
		});
	}
	
	view_manager.register_active = function(el) {
		view_manager.active = el;
	}
	
	view_manager.get_active = function() {
		return view_manager.active;
	}
	
	
	/*
		App Private Methods
	*/
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
	
	var on_input_event = function(term) {
		regex = new RegExp('\\b' + term, "i");
		
		var view = view_manager.get_active();
		view.display_filtered(term, regex);
		
		card_manager(term);
	}
	
	var clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	
	
	var main = function() { 
		//initialize to empty text field
		clear_input(true);
		
		
		//Establish Views
		views.everything = EverythingView({
			'control' : $('#control0'),
			'panel' : $('#view0')
		});
		
		views.names = View({
			'control' : $('#control1'),
			'panel' : $('#view1')
		});
		
		views.specialties = View({
			'control' : $('#control2'),
			'panel' : $('#view2')
		});
		
		views.services = View({
			'control' : $('#control3'),
			'panel' : $('#view3')
		});
		
		
		
		// Get Last Names & Specialties Data
		// register lists with their views
		$.getJSON(context.settings.data, function(data){
			// Last Names
			json.names = data.physicians;
			lists.names = NamesList({
				'data' : data.physicians,
				'element' : $('.last-name')
			});
			views.names.register_list('names', lists.names);
			views.everything.register_list('names', lists.names);
			
			//Specialties
			json.specialties = data.specialties;
			lists.specialties = SpecialtiesList({
				'data' : data.specialties,
				'element' : $('.specialties')
			});
			views.specialties.register_list('specialties', lists.specialties);
			views.everything.register_list('specialties', lists.specialties);
			
			
			
			// Get Services Data 
			// Establish Services View
			// Establish Services List
			$.getJSON(context.settings.services, function(data){
				json.services = data.services;
				lists.services = ServicesList({
					'data' : data.services,
					'element' : $('.services')
				});
				views.services.register_list('services', lists.services);
				views.everything.register_list('services', lists.services);
				view_manager.init(views.everything);
			}); //get.services
			
        });	//get.data



		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			on_input_event( $(this).val() );
		});
		
	}
	
	
	/*
		Public
	*/
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
		
		main();
	}
	
})(SRCH);


$(document).ready(function() {
	SRCH.init();
	//PROFILE.show();
});