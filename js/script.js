/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;
(function(context){	
	var settings = {};

	//new and needed
	var num_json_loaded = 0,
		json = {},
		tabs = {},
		tab_manager = {},
		card = false,
		regex = null;
	
	
	var List = function(settings) {
		var self = {};
		
		var data = settings.data,
			id = settings.id; //wrapper div
		
		self.get_element = function() {
			return settings.id;
		}
		
		self.get_all = function() {
			var ret = [];
			$.each(data, function(i, item) {
				ret.push(item);
			});
			return ret;
		}
		
		self.get_length = function() {
			return settings.data.length;
		}
		
		return self; //List
	} //List
		
	var FilterableList = function(settings) {
		var self = List(settings);

		//private vars
		var feedback = $(settings.id).find('.feedback');
		
		//Instance Variables
		self.filtered = [];
		
		//sets self.filtered
		self.filter = function(term, regex) { //saves the filtered list to the instance variable
			settings.term = term;
			settings.regex = regex;
			
			if (term.length > 0) {
				self.filtered = self.filter_tester(regex);
			} else {
				self.filtered = [];
			}
		}
		
		// tests node against regex, returns array
		self.filter_tester = function(regex) {
			var arr = [];
			$(settings.data).each(function(i, item){
				var node = item[settings.filter_against] || item;
				if ( regex.test(node) ) {
					arr.push( item );
				}
			});
			return arr;
		}
		
		// returns array
		self.get_filtered = function() {
			return self.filtered;
		}

		self.get_length = function() {
			return self.filtered.length;
		}

		return self; //List
	}

	var NamesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "last_name";
		
		return self;
	}
	
	var SpecialtiesList = function(settings) {
		var self = FilterableList(settings);

		//Nothing here, but leaving it for future use

		return self;
	}
	
	var ServicesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "title";
		
		//required because services do not filter out
		self.filter = function(term, regex) { 
			settings.term = term;
			settings.regex = regex;
			
			var arr = [];
			$(settings.data).each(function(i, item){
				arr.push( item );
			});
			self.filtered = arr;
		}
		
		return self;
	}
	
	
	
	/*
		List Printer 
	*/
	var ListPrinter = function(settings) {
		var self = {};
		
		var panel = settings.panel,
			target = settings.target,
			ul = panel.find(settings.target).find('ul'),
			feedback = panel.find(settings.target).find('.feedback'),
			max = null,
		
		//multi-col, TODO needs better implementation
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
		
		self.print_list_multi_column = function( list, num_cols ) {
			var limited = self.limit( list );
			var balanced = list_balancer( limited, num_cols );
			
			var html = "";
			$(balanced).each(function(i, item){
				html += '<ul>';
				$(item).each(function(i, item){
					html += self.template(item);
				});	
				html += '</ul>';
			});
			
			$(target).html(html);
		}
		
		
		//Public
		self.clear_list = function() {
			ul.html("");
		}
		
		self.print_list = function( list ) {
			self.clear_list();
			var limited = self.limit( list );
			$.each(limited, function(i, item){
				ul.append( self.template(item) );
			});
		}
		
		self.print_names_list = function( list ) {
			self.clear_list();
			var limited = self.limit(list);
			$.each(limited, function(i, item){
				ul.append( self.template(item, i) );
				self.print_image(item.headshot_url, 'id'+i, i);
			});
			//card_manager( get_term() );
		}
		
		self.print_services_list = function() {
			self.clear_list();
			$.each(items, function(i, item){
				ul.append(item);
			});
		}
		
		self.print_image = function(url, el, count) {
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
		
		self.set_limit = function(num) {
			settings.max = num;
		}
		
		self.limit = function(all) {
			return (settings.max) ? all.slice(0, settings.max) : all;
		}	
		
		self.set_feedback = function(term, match_count) {
			var msg = "";
			
			if (term.length === 0 && match_count === 0) {
				self.init_feedback();
				return;
			} else if (term.length > 0 && match_count === 0) {
				msg = "No matches found";
			} else {
				var count = (match_count < settings.max) ? match_count : settings.max;
				var seeall = (match_count < settings.max) ? "" : " (see all)";
				msg = "Viewing " + count + " of " + match_count + seeall;
			}
			$(feedback).html(msg);
		}
		
		self.init_feedback = function() {
			feedback.html("Enter a term to begin search.");
		}
		
		//used by template, TODO needs access to regex
		self.get_matched_string = function(item) {
			var regex = get_regex();
			return item.replace(regex, '<span class="match">'+ item.match(regex) +'</span>');
		};
		
		self.template = function(data) {
			return '<li>' + data + '</li>';
		}
			
		return self;
	}
	
	var NamesPrinter = function(settings) {
		var self = ListPrinter(settings);
		
		self.template = function(data, id) {
			var temp = '<li class="name_item">';
				temp += '<div class="image loading" id="id'+ id +'"></div>';
				temp += '<div class="name">' + self.get_matched_string(data.full_name) + '</div>';
				temp += (data.practicing_specialty) ? '<div class="prac_spec">'+ data.practicing_specialty  +'</div></li>' : "";
			return temp;
		};
		
		return self;
	}
	
	var SpecialtiesPrinter = function(settings) {
		var self = ListPrinter(settings);
		
		self.template = function(data) {
			return '<li><a href="search.html#'+ data +'">' + self.get_matched_string(data) + '</a></li>';
		}
		
		return self;
	}
	
	var ServicesPrinter = function(settings) {
		var self = ListPrinter(settings);
		
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
			data = settings.data,
			expertise;
		
		
		//Private		
		populate_card = function() {
			//full name
			$(el).find('#name').text(data.full_name);

			el.find('#headshot').attr('src', data.headshot_url);
			el.find('#pops').attr('href', data.profile_url);
			
			$('#appointments').html("");
			$(data.faculty_appointments).each(function(i){
				$('#appointments').append('<p>' + this.title + '<br><em>' + this.institution + '</em></p>');
			});

			el.find('#phone').text(data.phone || "N/A");
			el.find('#fax').text(data.phone || "N/A");
			el.find('#address').text(data.address || "N/A");
			
			expertise = List({
				'data' : data.expertise,
				'id' : '#expertise_holder',
				'max' : 40
			});
			
			var printer = ListPrinter({
				'panel' : settings.el.parent(),
				'target' : expertise.get_element()
			});
			
			printer.set_limit(40);
			printer.print_list_multi_column( expertise.get_all(), 4 );
			
			//el.find('#expertise div').html( expertise );	
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
		Tabs Class
	*/
	var Tab = function(settings) {
		
		var self = {};
		
		var control = settings.control,
			panel = settings.panel;
			
			settings.list = [];
			
		self.activate = function() {
			control.addClass('active');
			panel.fadeIn();
		}
		
		self.deactivate = function(callback) {
			control.removeClass('active');
			
			//callback executes after current panel fades out
			panel.fadeOut(function(){
				if ( $.isFunction(callback) ) {
					callback();
				}
			});
		}
		
		self.prepare = function() {
			control.addClass('active');
		}
		
		self.register_list = function(li) {
			//adds List to (obj) list dictionary
			settings.list.push(li);
		}
		
		self.get_control = function() {
			return settings.control;
		}
		
		self.get_panel = function() {
			return settings.panel;
		}
		
		self.get_list = function() {
			return settings.list;
		}
		
		self.do_filter = function(term, regex) {
			lists.names.filter(term,regex);
			lists.specialties.filter(term, regex);
			lists.services.filter(term, regex);
		}
		
		self.list_handler = function() {
			
		}
		
		self.initial_setup = function() {
			log('why');
		}
		
		
		return self;
	
	}
		
	var EverythingTab = function(settings) {
		self = Tab(settings);
		
		var names_list, specialties_list, services_list,
			name_printer, specialties_printer, services_printer,
			term = get_term(),
			regex = get_regex();
		
		var initial_state = function() {
			names_printer.init_feedback();
			specialties_printer.init_feedback();
			services_printer.print_list( services_list.get_all() );
		}
		
		self.list_handler = function(term, regex) {
			// Tell List to process term, does not return
			names_list.filter(term, regex);
			specialties_list.filter(term, regex);
			services_list.filter(term, regex);
			
			//Set limits
			names_printer.set_limit(6);
			specialties_printer.set_limit(12);
			services_printer.set_limit(14);
			
			//Set Feedback
			names_printer.set_feedback( term, names_list.get_length() );
			specialties_printer.set_feedback( term, specialties_list.get_length() );
			
			//Print Shit Out
			names_printer.print_names_list( names_list.get_filtered() );
			specialties_printer.print_list( specialties_list.get_filtered() );
			services_printer.print_list( services_list.get_filtered() );
			
			//Init Card Manager
			card_manager( get_term() );
		}

		self.activate = function() {
			//Names: List and Printer
			names_list = NamesList({
				'data' : json.names,
				'id' : '.last-name',
				'ul' : $('.last-name').find('ul')
			});
			
			names_printer = NamesPrinter({
				'panel' : settings.panel,
				'target' : names_list.get_element()
			});
			
			
			//Specialties: List and Printer
			specialties_list = SpecialtiesList({
				'data' : json.specialties,
				'id' : '.specialties',
				'ul' : $('.specialties').find('ul')
			});
			
			specialties_printer = SpecialtiesPrinter({
				'panel' : settings.panel,
				'target' : specialties_list.get_element()
			});
			
			
			//Services: List and Printer
			services_list = ServicesList({
				'data' : json.services,
				'id' : '.services',
				'ul' : $('.services').find('ul')
			});	
			
			services_printer = ServicesPrinter({
				'panel' : settings.panel,
				'target' : services_list.get_element()
			});
			
			if (term.length > 0) {
				self.list_handler(term, regex);
			} else {
				initial_state();
			}

			settings.control.addClass('active');
			settings.panel.fadeIn();
			
		}
		
		
		return self;
	}
	
	var NamesTab = function(settings) {
		self = Tab(settings);
		
		var list, printer,
			term = get_term(),
			regex = get_regex();
		
		var initial_state = function() {
			printer.init_feedback();
		}
		
		self.list_handler = function(term, regex) {
			// Tell List to process term, does not return
			list.filter(term, regex);
								
			//Set limits
			// TODO paginatoin for these types of views
			
			//Set Feedback
			printer.set_feedback( term, list.get_length() );
			
			//Print 
			printer.print_list_multi_column( list.get_filtered() );
			
			//Init Card Manager
			card_manager( get_term() );
		}

		self.activate = function() {
			//Names: List and Printer
			list = NamesList({
				'data' : json.names,
				'id' : '.last-name',
				'ul' : $('.last-name').find('ul')
			});
			
			printer = NamesPrinter({
				'panel' : settings.panel,
				'target' : list.get_element()
			});
			
			if (term.length > 0) {
				self.list_handler(term, regex);
			} else {
				initial_state();
			}

			settings.control.addClass('active');
			settings.panel.fadeIn();
			
		}
		
		
		return self;
	}
	
	var SpecialtiesTab = function(settings) {
		self = Tab(settings);
		
		var list, printer,
			term = get_term(),
			regex = get_regex();
		
		var initial_state = function() {
			printer.init_feedback();
		}
		
		self.list_handler = function(term, regex) {
			// Tell List to process term, does not return
			list.filter(term, regex);
								
			//Set limits
			// TODO paginatoin for these types of views
			
			//Set Feedback
			printer.set_feedback( term, list.get_length() );
			
			//Print 
			printer.print_list_multi_column( list.get_filtered() );
		}

		self.activate = function() {
			//Specialties: List and Printer
			list = SpecialtiesList({
				'data' : json.specialties,
				'id' : '.specialties',
				'ul' : $('.specialties').find('ul')
			});
			
			printer = SpecialtiesPrinter({
				'panel' : settings.panel,
				'target' : list.get_element()
			});
			
			if (term.length > 0) {
				self.list_handler(term, regex);
			} else {
				initial_state();
			}

			settings.control.addClass('active');
			settings.panel.fadeIn();
			
		}
		
		
		return self;
	}
	

	
	var ServicesTab = function(settings) {
		self = Tab(settings);
		
		var list, printer,
			term = get_term(),
			regex = get_regex();
		
		var initial_state = function() {
			printer.init_feedback();
		}
		
		self.list_handler = function(term, regex) {
			// Tell List to process term, does not return
			list.filter(term, regex);
								
			//Set limits
			// TODO paginatoin for these types of views
			
			//Set Feedback, at this time Services has no feedback, feel free to change
			//printer.set_feedback( term, list.get_length() );
			
			//Print 
			printer.print_list_multi_column( list.get_filtered() );
		}

		self.activate = function() {
			//Services: List and Printer
			list = ServicesList({
				'data' : json.services,
				'id' : '.services',
				'ul' : $('.services').find('ul')
			});	
			
			printer = ServicesPrinter({
				'panel' : settings.panel,
				'target' : list.get_element()
			});
			
			if (get_term().length > 0) {
				self.list_handler(term, regex);
			} else {
				initial_state();
			}

			settings.control.addClass('active');
			settings.panel.fadeIn();
			
		}
		
		
		return self;
	}
	
	
	tab_manager.initialize_views = function() {
		tab_manager.activate_listener();
		
		//Everything View is the initial state
		tab_manager.register_active(tabs.everything);
		tabs.everything.activate();
	}
	
	//View Manager - how the app interfaces with View(s)
	tab_manager.activate_listener = function() {
		$.each(tabs, function(i, item){
			item.get_control().click(function(){
				tab_manager.activate_tab(item);
			});
		});	
	}
	
	//call this method whenever you want to show a new view
	tab_manager.activate_tab = function(tab) {
		if (this.get_active() !== tab) {
			tab.prepare();
			this.switch_handler(tab);
			this.register_active(tab);
			
			//natural place for List interface commands
		} else {
			log('view is already active');
			return;
		}
	}
	
	// do not call this method directly, call activate_view
	tab_manager.switch_handler = function(next) {
		if (this.get_active()) {
			tab_manager.active.deactivate(function(){
				next.activate();
			});
		} else {
			next.activate();
		}
		focus_input();
		card_manager( get_term() );
	}
	
	tab_manager.register_active = function(view) {
		tab_manager.active = view;
	}
	
	tab_manager.get_active = function() {
		return tab_manager.active;
	}
		
	tab_manager.on_input_event = function(term) {
		tab_manager.active.list_handler(get_term(), get_regex());
	}
	
	//fires setup when all 3 lists have loaded, solves non-sequential firing problem
	tab_manager.json_has_loaded = function() {
		num_json_loaded++;
		if (num_json_loaded === 3) {
			this.initialize_views();
		}
	}
	
	card_manager = function(term) {
		if (card) {
			card.close_card();
			card = false;
		} else {
			$('.last-name').find('.name_item').each(function(){
				$(this).click(function(){
					//establish new Card
					card = Card({
						'name' : $(this).find('.name').text(),
						'el' : $(context.settings.card),
						'close_el' : $(context.settings.card_close),
						'data' : get_json_node($(this).find('.name').text(), json.names, 'full_name')
					});
					card.show();
				});
			});
		}
	}
	
	
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
	
	//private methods
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

	var get_term = function() {
		return $(context.settings.inputId).val();
	}

	var set_regex = function(term) {
		regex = new RegExp('\\b' + term, "i");
	}
	
	var get_regex = function() {
		if (typeof regex === 'Object') {
			return regex;
		} else {
			regex = new RegExp('\\b' + get_term(), "i");
			return regex;
		}
	}

	var clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	var focus_input = function() {
		$(context.settings.inputId).focus();
	}
	
	
	
	var main = function() {
		//initialize to empty text field
		clear_input(true);
		
		
		//Establish Tabs
		tabs.everything = EverythingTab({
			'control' : $('#control0'),
			'panel' : $('#view0')
		});
		
		tabs.names = NamesTab({
			'control' : $('#control1'),
			'panel' : $('#view1')
		});
		
		tabs.specialties = SpecialtiesTab({
			'control' : $('#control2'),
			'panel' : $('#view2')
		});
		
		tabs.services = ServicesTab({
			'control' : $('#control3'),
			'panel' : $('#view3')
		});
		
		
		//Establish Data
		$.getJSON(context.settings.services, function(data){
			json.services = data.services;
			tab_manager.json_has_loaded();
		});
		
		$.getJSON(context.settings.data, function(data){
			json.names = data.physicians;
			tab_manager.json_has_loaded();
			
			json.specialties = data.specialties;
			tab_manager.json_has_loaded();
        });

		
		//bind the keyup event, publish value
		$(context.settings.inputId).keyup(function(){
			tab_manager.on_input_event( $(this).val() );
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
		
		
		main();
		
		
	}
	
})(SRCH);



$(document).ready(function() {
	SRCH.init();
	//PROFILE.show();
});