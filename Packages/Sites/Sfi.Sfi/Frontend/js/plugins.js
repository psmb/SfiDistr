// TODO this whole file is really broke: needs to be split into separate
// files and then concatened and minified by Grunt.


// Move Header inside StickInParent on main page
(function () {
	var header = document.getElementsByClassName("Header")[0];
	var stick = document.querySelector("#page-sfi .js-stickInParent");
	if (header && stick) {
		stick.insertBefore(header, stick.childNodes[0]);
	}
}());

$.fn.switchstylesheet = function(options) {
		//default vals
		defaults = {
				seperator : 'alt'
		};

		var options = $.extend(defaults, options);

		//read the style
		var c = cookie.readCookie(options.seperator);
		if (c) switchss(c);

		//goes thru the links to find out the ones having the selector
		$(this).click(function(e) {
				// e.preventDefault();
				var title = $(this).attr('data-css');
				switchss(title);
		});

		if (window.location.hash === '#eye') {
			switchss('accessible-stylesheet');
		}

		function switchss(title) {
				//goes thru all the styles having seperator - alt
				$('link[rel*=style][title*='+options.seperator+']').each(function(i) {
					this.disabled = true;
					if ($(this).attr('title') == title) {
							this.disabled = false;
					}
				});
				$('a[data-css*='+options.seperator+']').css('display', 'block');
				$('a[data-css='+title+']').hide();
				//create a cookie to store the style
				cookie.createCookie(options.seperator, title, 365);
		}
};

//cookie functions
var cookie;
(function($) {
		cookie = {
				createCookie: function(name,value,days) {
						if (days)
						{
								var date = new Date();
								date.setTime(date.getTime()+(days*24*60*60*1000));
								var expires = "; expires="+date.toGMTString();
						}
						else var expires = "";
						document.cookie = name+"="+value+expires+"; path=/";
				},

				readCookie: function(name) {
						var nameEQ = name + "=";
						var ca = document.cookie.split(';');
						for(var i=0;i < ca.length;i++)
						{
								var c = ca[i];
								while (c.charAt(0)==' ') c = c.substring(1,c.length);
								if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
						}
						return null;
				}
		};
})(jQuery);

$(document).ready(function(){
		$(".js-switchStylesheet").switchstylesheet( { seperator:"stylesheet"} );
});




//TODO: move to plugin
(function($) {
	$.fn.responsiveTabs = function() {

		this.each(function() {
			var _this = $(this)

			_this.find('.Sections-Anchor').click(function(e){
				var parent = $(this).parents('.js-sections').eq(0);
				e.preventDefault();
				var panelId = $(this).attr('href');

				// TODO: this is a very bad code, as it couples normal CSS classes with JS!
				if ($(this).hasClass('isActive') && !parent.children('.Sections-Tabs').is(":visible")) {
					$(this).removeClass('isActive');
					$(panelId).removeClass('isActive');
				} else {
					parent.children('.Sections-Tabs').find('.Sections-Anchor').removeClass('isActive');
					parent.children('.Sections-Anchor').removeClass('isActive');
					$(this).addClass('isActive');

					parent.children('.Sections-Panel').removeClass('isActive');
					$(panelId).addClass('isActive');
				}
			});

			// Activate first tab
			document.getElementById(document.location.hash.substring(1));
			// _this.find('.Sections-Anchor').eq(0).click();
		});

		return this;
	};
}( jQuery ));


$(document).on('page:fetch',	 function() { NProgress.start(); });
$(document).on('page:change',	function() { NProgress.done(); });
$(document).on('page:restore', function() { NProgress.remove(); });


var headingAnchors = function() {
		$(".js-anchor").each(function() {
				var anchor = $('<a class="HeadingAnchor-Link"><i class="icon-link"></i></a>').attr('href', '#' + $(this).attr('id'));
				$(this).find("h1,h2,h3,h4,h5,h6").append(anchor);
		});
}

var onReadyPlugins = function() {
		headingAnchors();

		var searchBoxInput = jQuery(".js-SearchBox-Field");
		var defaultValue = searchBoxInput.val();
		searchBoxInput.focus(function() {
				if($(this).val() == defaultValue) {
						$(this).val("");
				}
		}).blur(function(){
				if($(this).val().length == 0) {
						$(this).val(defaultValue);
				}
		});

		audiojs.events.ready(function() {
				path = '/_Resources/Static/Packages/Sfi.Sfi/Built/';
				var as = audiojs.createAll({
						imageLocation: path + 'player-graphics.gif',
						swfLocation: path + 'audiojs.swf',
						css: ''
				});
		});

		// Open external urls in new window
		$('a').each(function() {
			 var a = new RegExp('/' + window.location.host + '/');
			 // Starts with http and does not contain current domain
			 if(!a.test(this.href) && this.href.indexOf('http') === 0) {
					 $(this).click(function(event) {
							 event.preventDefault();
							 event.stopPropagation();
							 window.open(this.href, '_blank');
					 });
			 }
		});

		// MainMenu toggle
		$('.js-MainMenu-Toggle').click(function(e){
				e.preventDefault();
				e.stopPropagation();
				$('.js-MainMenu').toggleClass('isActive');
		});
		$('body').click(function(e){
				$('.js-MainMenu').removeClass('isActive');
		});
		$('.js-MainMenu-Wrap').click(function(e){
				e.stopPropagation();
		});

		$('.js-MobileNav-Toggle').click(function(e){
				e.preventDefault();
				e.stopPropagation();
				$('.js-MobileNav').toggleClass('isActive');
		});
		$('body').click(function(e){
				$('.js-MobileNav').removeClass('isActive');
		});


	$('.js-sections').responsiveTabs();

		// TODO: optimize carousel init code
		$('.js-carousel-1x').slick({
				dots: true,
				slide: '*',
				infinite: true,
				speed: 300,
				slidesToShow: 1,
				slidesToScroll: 1,
				prevArrow: '<button type="button" class="slick-prev icon-left-open">Назад</button>',
				nextArrow: '<button type="button" class="slick-next icon-right-open">Вперед</button>'
		});

		$('.js-carousel-2x').slick({
				dots: true,
				slide: '*',
				infinite: true,
				speed: 300,
				slidesToShow: 2,
				slidesToScroll: 2,
				prevArrow: '<button type="button" class="slick-prev icon-left-open">Назад</button>',
				nextArrow: '<button type="button" class="slick-next icon-right-open">Вперед</button>',
				responsive: [
						{
								breakpoint: 1024,
								settings: {
										slidesToShow: 2,
										slidesToScroll: 2
								}
						},
						{
								breakpoint: 560,
								settings: {
										slidesToShow: 1,
										slidesToScroll: 1
								}
						}
				]
		});

		$('.js-carousel-3x').slick({
				dots: true,
				slide: '*',
				infinite: true,
				speed: 300,
				slidesToShow: 3,
				slidesToScroll: 3,
				prevArrow: '<button type="button" class="slick-prev icon-left-open">Назад</button>',
				nextArrow: '<button type="button" class="slick-next icon-right-open">Вперед</button>',
				responsive: [
						{
								breakpoint: 1024,
								settings: {
										slidesToShow: 2,
										slidesToScroll: 2
								}
						},
						{
								breakpoint: 560,
								settings: {
										slidesToShow: 1,
										slidesToScroll: 1
								}
						}
				]
		});

		$('.js-carousel-4x').slick({
				dots: false,
				slide: '*',
				infinite: false,
				speed: 300,
				slidesToShow: 4,
				slidesToScroll: 4,
				prevArrow: '<button type="button" class="slick-prev icon-left-open">Назад</button>',
				nextArrow: '<button type="button" class="slick-next icon-right-open">Вперед</button>',
				responsive: [
						{
								breakpoint: 1024,
								settings: {
										slidesToShow: 2,
										slidesToScroll: 2
								}
						},
						{
								breakpoint: 560,
								settings: {
										slidesToShow: 1,
										slidesToScroll: 1
								}
						}
				]
		});

		//$(".js-stickInParent").stick_in_parent();
}

$(document).ready(function () {
	onReadyPlugins();
});


if (typeof document.addEventListener === 'function') {
	document.addEventListener('Neos.PageLoaded', function(event) {
		onReadyPlugins();
	}, false);
}




document.querySelectorAll('.js-ReadMore').forEach(function (node) {
	var readMore = document.createElement('div');
	readMore.classList.add('ReadMore-overlay');
	var button = document.createElement('span');
	button.innerText = 'Читать далее';
	button.className = 'ReadMore-button';
	readMore.appendChild(button);
	readMore.addEventListener('click', function (event) {
		node.classList.add('ReadMore--isExpanded');
	});
	node.appendChild(readMore);
});










// Init the stickInParent plugin
(function () {
	document.querySelectorAll('.js-stickInParent').forEach(function (node) {
		stickInParent(node);
	});
}());
(function () {
	document.querySelectorAll('.js-stickInParent--large').forEach(function (node) {
		stickInParent(node, {minWidth: 1024});
	});
}());
(function () {
	document.querySelectorAll('.js-stickInParent--small').forEach(function (node) {
		stickInParent(node, {minWidth: 1});
	});
}());

function stickInParent (element, options) {
	if (!element) {
		return null;
	}
	options = options || {};
	var minWidth = options.minWidth || 600;
	var minHeight = options.minHeight || 640;
	var parentClass = options.parentClass || 'js-stickInParent-parent';

	var parent = findParent(element, parentClass);

	element.style.width = element.offsetWidth;
	var initStyles = element.style.cssText;
	var originalStyles = 'width:' + element.offsetWidth + 'px;' + initStyles;
	parent.style.position = 'relative';
	var fixer = document.createElement('div');
	element.parentElement.insertBefore(fixer, element.nextSibling);
	update(window.scrollY);
	debouncedScroll(update);

	window.addEventListener('resize', function(e) {
		element.style.width = 'auto';
		originalStyles = 'width:' + element.offsetWidth + 'px;' + initStyles;
	});

	function update (scrollPosition) {
		if (window.innerWidth > minWidth && window.innerHeight > minHeight) {
			if (scrollPosition > parent.offsetTop && scrollPosition + window.innerHeight < parent.offsetTop + parent.offsetHeight + window.innerHeight - element.offsetHeight) {
				setFixed();
			} else if (scrollPosition + window.innerHeight > parent.offsetTop + parent.offsetHeight + window.innerHeight - element.offsetHeight) {
				setAbsolute();
			} else {
				setStatic();
			}
		}
	}
	function setFixed() {
		element.style = 'position: fixed; top: 0;' + originalStyles;
		element.classList.add('isFixed');
		fixer.style = 'display: block; height: ' + element.offsetHeight + 'px';
	}
	function setAbsolute() {
		element.classList.remove('isFixed');
		element.style = 'position: absolute; top: auto; bottom: 0;' + originalStyles;
		fixer.style = 'display: block; height: ' + element.offsetHeight + 'px';
	}
	function setStatic() {
		element.classList.remove('isFixed');
		element.style = 'position: static;' + originalStyles;
		fixer.style = 'display: none;';
	}
	function findParent(el, parentClass) {
		var firstParent = el.parentElement;
		while (el.parentElement) {
			el = el.parentElement;
			if (el.classList.contains(parentClass)) {
				return el;
			}
		}
		return firstParent;
	}
}

function debouncedScroll(callback) {
	var lastKnownScrollPosition = 0;
	var isTicking = false;

	window.addEventListener('scroll', function(e) {
		lastKnownScrollPosition = window.scrollY;
		if (!isTicking) {
			window.requestAnimationFrame(function() {
				callback(lastKnownScrollPosition);
				isTicking = false;
			});
		}
		isTicking = true;
	});
}
