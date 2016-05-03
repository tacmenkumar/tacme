var search_input = $('.search input[type=text]');
var search_input_size = 152;
var search_large_size = 180;
var padding = 7;
var shrinked = "";
$(document).ready(function() {
	search_input.click(function() {
		shrink();
	}).focus(function() {
		shrink();
	});
	search_input.blur(function() {
		if (shrinked == " YES ") normal();
	});
	$('.button a').hover(function() {
		if (shrinked == " YES ") normal();
	});
	$("#chatbox").addClass("hover")
	$("#chatbox").draggable({
		containment: 'parent',
		cursor: "move",
		cursorAt: {
			top: 200,
			left: 150
		},
		drag: function(event, ui) {
			console.log(event);
			console.log(ui);
		}
	});
	$("#send_button").click(sendRequest);

	$("#date_of_birth_textbox").datepicker({
		inline: true,		 
		changeMonth: true,
		changeYear: true,
		minDate: new Date(1900, 1 - 1, 1),
		maxDate: new Date()
	});
});

function shrink() {
	if (search_input_size < search_large_size) {
		$('.button a').each(function() {
			$(this).animate({
				'padding-left': padding + 'px',
				'padding-right': padding + 'px'
			}, 'fast');
		});
		search_input.animate({
			'width': search_large_size + 'px'
		}, 'fast');
		shrinked = " YES ";
	}
	return false;
}

function normal() {
	search_input.animate({
		'width': search_input_size + 'px'
	}, 'fast');
	$('.button a').animate({
		'padding-left': '10px',
		'padding-right': '10px'
	}, 'fast');
	shrinked = "";
	search_input.blur();
	return false;
}