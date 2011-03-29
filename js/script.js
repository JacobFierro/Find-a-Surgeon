/* 
	Author: Jacob Fierro
	Purpose: Find a Surgeon App
	Date: 2-23-11
*/

var SRCH = typeof(SRCH) === "undefined" ? {} : SRCH;
(function(context){	
	var settings = {};

	//new and needed
	var lists = {},
		list_loaded = 0,
		json = {},
		tabs = {},
		tab_manager = {},
		card = false;
	
	
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
		
		return self; //List
	} //List
		
	var FilterableList = function(settings) {
		var self = List(settings);

		//private vars
		var feedback = $(settings.id).find('.feedback'),
			regex = settings.regex,
			max = settings.max,
			term = settings.term;
		
		//Instance Variables
		self.filtered = [];
		
		//public methods
		//used by template
		self.get_matched_string = function(item) {
			return item.replace(settings.regex, '<span class="match">'+ item.match(settings.regex) +'</span>');
		};
		
		
		
		//these need to go, being called by tab_manager.initial_setup
		self.initialize_list = function() {
			settings.ul.html("");
			self.set_feedback(0);
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
		
		self.init_feedback = function() {
			$(feedback).html("Enter a term to begin search.");
		}
		
		
		
		
		
		
		
		
		
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
					arr.push( self.template(item) );
				}
			});
			return arr;
		}
		
		// returns array
		self.get_filtered_list = function() {
			return self.filtered;
		}

		return self; //List
	}

	var NamesList = function(settings) {
		var self = FilterableList(settings);
		
		settings.filter_against = "last_name";
		
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
		
		settings.filter_against = "title";
		
		//sets self.filtered
		self.filter = function(term, regex) { //saves the filtered list to the instance variable
			settings.term = term;
			settings.regex = regex;
			
			var arr = [];
			$(settings.data).each(function(i, item){
				arr.push( self.template(item) );
			});
			self.filtered = arr;
		}
		
		self.template = function(data) {
			return '<li><a href="'+ context.settings.base_url + data.path + '">' + self.get_matched_string(data.title) + '</a></li>';
		}
		
		return self;
	}
	
	
	
	/*
		List Printer 
	*/
	var ListPrinter = function(settings) {
		var self = {};
		
		var items = settings.items,
			panel = settings.panel,
			target = settings.target,
			ul = panel.find(settings.target).find('ul'),
			feedback = panel.find(settings.target).find('.feedback'),
			max = null,
			term = settings.term;
		
		self.clear_list = function() {
			ul.html("");
		}
		
		self.print_list = function() {
			self.clear_list();
			self.set_feedback();
			var limited = self.limit(items);
			$.each(limited, function(i, item){
				ul.append(item);
			});
		}
		
		self.print_names_list = function() {
			var list = lists.names;
			
			self.clear_list();
			self.set_feedback();
			var limited = self.limit(items);
			$.each(limited, function(i, item){
				ul.append( list.template(item, i) );
				self.print_image(item.headshot_url, 'id'+i, settings.term.length);
			});
			card_manager(term);
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
		
		self.set_feedback = function() {
			var msg = "";
				match_count = items.length || 0;
			
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
		
		self.init_feedback = function() {
			feedback.html("Enter a term to begin search.");
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
		
		return self;
	}
	
	var EverythingTab = function(settings) {
		self = Tab(settings);
		
		self.do_list = function(term, regex) {
			$.each(settings.list, function(i, item){
				item.filter(term, regex);
			});
			
			services_printer = ListPrinter({
				'items' : settings.list[0].get_filtered_list(),
				'panel' : settings.panel,
				'target' : settings.list[0].get_element(),
				'max' : 14,
				'term' : term
			});
			services_printer.print_list();
			
			names_printer = ListPrinter({
				'items' : settings.list[1].get_filtered_list(),
				'panel' : settings.panel,
				'target' : settings.list[1].get_element(),
				'max' : 6,
				'term' : term
			});
			names_printer.print_names_list();
			
			specialty_printer = ListPrinter({
				'items' : settings.list[2].get_filtered_list(),
				'panel' : settings.panel,
				'target' : settings.list[2].get_element(),
				'max' : 12,
				'term' : term
			});
			specialty_printer.print_list();
		}
		
		return self;
	}
	
	var NamesTab = function(settings) {
		self = Tab(settings);
		
		self.do_filter = function(term, regex) {
			//lists.names.filter(term,regex);
		}
		
		return self;
	}
	
	var SpecialtiesTab = function(settings) {
		self = Tab(settings);
		
		self.do_filter = function(term, regex) {
			lists.specialties.filter(term,regex);
		}
		
		return self;
	}

	var ServicesTab = function(settings) {
		self = Tab(settings);
		
		self.do_filter = function(term, regex) {
			lists.services.filter(term,regex);
		}
		
		return self;
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
	}
	
	tab_manager.register_active = function(view) {
		tab_manager.active = view;
	}
	
	tab_manager.get_active = function() {
		return tab_manager.active;
	}
	
	//fires setup when all 3 lists have loaded, solves non-sequential firing problem
	tab_manager.list_has_loaded = function() {
		list_loaded++;
		if (list_loaded === 3) {
			this.initial_setup();
		}
	}
	
	tab_manager.initial_setup = function() {
		tab_manager.activate_listener();
		
		
		//TODO remove this, needs to use ListPrinter instead
		lists.services.print_all();
		lists.names.init_feedback();
		lists.specialties.init_feedback();
		
		tabs.everything.activate();
		tab_manager.register_active(tabs.everything);
	}
	
	tab_manager.on_input_event = function(term) {
		
		//TODO leading spaces ignored, non-letter chars ignored
		regex = new RegExp('\\b' + term, "i");
		
		tab_manager.active.do_list(term, regex);
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

	var clear_input = function(focus) {
		$(context.settings.inputId).val("");
		if (focus !== "undefined" && focus) {
			$(context.settings.inputId).focus();
		}
	}
	
	var focus_input = function() {
		$(context.settings.inputId).focus();
	}
	
	var card_manager = function(term) {
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
		
		
		
		$.getJSON(context.settings.services, function(data){
			lists.services = ServicesList({
				'data' : data.services,
				'id' : '.services',
				'ul' : $('.services').find('ul')
			});
			tabs.everything.register_list(lists.services);
			tabs.services.register_list(lists.services);
			tab_manager.list_has_loaded();
		});
		
		$.getJSON(context.settings.data, function(data){
			json.names = data.physicians;
			lists.names = NamesList({
				'data' : data.physicians,
				'id' : '.last-name',
				'ul' : $('.last-name').find('ul')
			});
			tabs.everything.register_list(lists.names);
			tabs.names.register_list(lists.names);
			tab_manager.list_has_loaded();
			
			lists.specialties = SpecialtiesList({
				'data' : data.specialties,
				'id' : '.specialties',
				'ul' : $('.specialties').find('ul')
			});
			tabs.everything.register_list(lists.specialties);
			tabs.specialties.register_list(lists.specialties);
			tab_manager.list_has_loaded();
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