/*** POINT *****************************************************************/ 

function Point(data) {
	
	this.data = {};
	if (isDefined(data)) {
		this.data = data;
	}
	
	this.reset();
	
}

Point.prototype.reset = function() {

	this.getStartingCoordinates();
	
	this.coloured = true;
	
	this.list_easing = 0.1;
	this.easing = 0.02;
	this.easing_within_radius = 0.05;
	
	this.list_depth = 1;
	this.depth_original = getRandomArbitary(0.7, 1);
	this.depth = this.depth_original;
	this.depth_max = this.depth_original + 0.3;
	
	this.movement_radius = 100;
	this.click_radius = 30;
	
	this.radius = 6;
	this.label_from_point = 20;
	this.label_width = 200;
	this.label_height = 24;
	this.label_padding = 40;	
	this.label_text_size = 16;
	
	this.show_label = true;
	this.show_interaction_radius = false;
	
	this.debug_show_interaction_radius = false; // Enable to show when
	this.debug_show_origin = false; // Enable to show original position of point
	
}

Point.prototype.getStartingCoordinates = function(x, y) {

	if (typeof x === undefined && typeof y === undefined) {	
		this.network_x = getRandomInteger(App.data.canvas_padding[3], $(window).width() - App.data.canvas_padding[1]);
		this.network_y = getRandomInteger(App.data.canvas_padding[0], App.data.canvas_height - App.data.canvas_padding[2]);
	} else {
		this.network_x = x;
		this.network_y = y;
	}
	
	this.current_x = this.network_x;
	this.current_y = this.network_y;
	
	this.target_x = this.network_x;
	this.target_y = this.network_y;
	
}

Point.prototype.update = function() {

	// console.log(App.data.mouse_x + ' ' + App.data.mouse_y);

	center_distance_from_mouse = getLengthBetweenPoints(App.data.mouse_x, App.data.mouse_y, this.target_x, this.target_y);
	current_distance_from_mouse = getLengthBetweenPoints(App.data.mouse_x, App.data.mouse_y, this.current_x, this.current_y);
	
	this.current_x += this.updatePosition(center_distance_from_mouse, App.data.mouse_x, this.target_x, this.current_x);	
	this.current_y += this.updatePosition(center_distance_from_mouse, App.data.mouse_y, this.target_y, this.current_y);
	
	if (current_distance_from_mouse < this.click_radius && this.data.active) {
		// $(App.data.canvas).css({'cursor': 'pointer'});
	}
	
	if (current_distance_from_mouse < this.movement_radius) {		
		target = this.depth_max;
	} else {
		target = this.depth_original;
	}
	
	this.depth += (target - this.depth) * 0.1;
	
	// Debugging
	if (center_distance_from_mouse < this.movement_radius) {
		this.show_interaction_radius = true;
	} else {
		this.show_interaction_radius = false;
	}
	
}

Point.prototype.updatePosition = function(distance_from_mouse, mouse, center, current) {
	
	var target = center;
	var easing = this.easing;
	
	var difference = Math.abs(mouse - center);
	
	if (distance_from_mouse < this.movement_radius) {
		
		target = mouse;
		easing = this.easing_within_radius;
	
	} else if (difference < this.movement_radius) {
		
		target = center;		
		
	} else {
		
		var variation = 1 - (this.movement_radius / difference);		
		var velocity = variation * this.movement_radius;		
		if (mouse < center) {
			velocity *= -1
		}		
		target = center + velocity;
		
	}
	
	return ((target - current) * easing);
	
}

Point.prototype.draw = function() {
	
	if (!this.data.active) {
		return;
	}
	
	radius = this.radius * this.depth;
	label_from_point = this.label_from_point * this.depth;
	label_width = this.label_width * this.depth;
	label_height = this.label_height * this.depth;
	label_padding = this.label_padding * this.depth;
	label_text_size = this.label_text_size * this.depth;	
	label_text_from_point = label_from_point + (label_padding * 0.5);

	context = App.data.context;
	
	// Create point
	context.beginPath();
	context.arc(
		this.current_x, 
		this.current_y, 
		radius, 
		0, 
		2 * Math.PI, 
		false
	);
	if (this.coloured) {
		context.fillStyle = App.data.categories[this.data.category].color;
	} else {
		context.fillStyle = 'rgba(145, 145, 145, 1)';
	}
	context.fill();
	
}

