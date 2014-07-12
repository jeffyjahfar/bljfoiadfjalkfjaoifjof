/*** EDGE *****************************************************************/ 

function Edge(data) {
	
	this.active = false;
	this.data = {};
	if (isDefined(data)) {
		this.active = true;
		this.data = data;
	}
	
	this.reset();
	
}

Edge.prototype.reset = function() {

	this.line_opacity = getRandomArbitary(0.1, 0.5);
	
	this.a_x = App.points[this.data.a].current_x;
	this.a_y = App.points[this.data.a].current_y;	
	this.b_x = App.points[this.data.b].current_x;
	this.b_y = App.points[this.data.b].current_y;
	
}

Edge.prototype.update = function() {
	
	this.a_x = App.points[this.data.a].current_x;
	this.a_y = App.points[this.data.a].current_y;
	this.b_x = App.points[this.data.b].current_x;
	this.b_y = App.points[this.data.b].current_y;
	
}

Edge.prototype.draw = function() {
	
	if (this.data.depth == 'front') {
		context = App.data.context;
	} else {
		context = App.data.context_back;
	}
	
	context.beginPath();
	context.moveTo(this.a_x, this.a_y);
	context.lineTo(this.b_x, this.b_y);
	context.lineWidth = 1;
	context.strokeStyle = 'rgba(0, 0, 0, ' + this.line_opacity + ')';
	context.stroke();
	
}





