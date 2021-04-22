// TODO this whole file is really broke: needs to be split into separate
// files and then concatened and minified by Grunt.

// Move Header inside StickInParent on main page
(function () {
    var header = document.getElementsByClassName("Header")[0];
    var stick = document.querySelector("#page-sfi .js-stickInParent");
    if (header && stick) {
        stick.insertBefore(header, stick.childNodes[0]);
    }
})();

$.fn.switchstylesheet = function (options) {
    //default vals
    var defaults = {
        seperator: "alt"
    };

    var options = $.extend(defaults, options);

    //read the style
    var c = cookie.readCookie(options.seperator);
    if (c) switchss(c);

    //goes thru the links to find out the ones having the selector
    $(this).click(function (e) {
        // e.preventDefault();
        var title = $(this).attr("data-css");
        switchss(title);
    });

    if (window.location.hash === "#eye") {
        switchss("accessible-stylesheet");
    }

    function switchss(title) {
        //goes thru all the styles having seperator - alt
        $("link[rel*=style][title*=" + options.seperator + "]").each(function (
            i
        ) {
            this.disabled = true;
            if ($(this).attr("title") == title) {
                this.disabled = false;
            }
        });
        $("a[data-css*=" + options.seperator + "]").css("display", "block");
        $("a[data-css=" + title + "]").hide();
        //create a cookie to store the style
        cookie.createCookie(options.seperator, title, 365);
    }
};

//cookie functions
var cookie;
(function ($) {
    cookie = {
        createCookie: function (name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                var expires = "; expires=" + date.toGMTString();
            } else var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        },

        readCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(";");
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == " ") c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0)
                    return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    };
})(jQuery);

$(document).ready(function () {
    $(".js-switchStylesheet").switchstylesheet({seperator: "stylesheet"});
});

//TODO: move to plugin
(function ($) {
    $.fn.responsiveTabs = function () {
        this.each(function () {
            var _this = $(this);

            _this.find(".Sections-Anchor").click(function (e) {
                var parent = $(this)
                    .parents(".js-sections")
                    .eq(0);
                e.preventDefault();
                var panelId = $(this).attr("href");

                // TODO: this is a very bad code, as it couples normal CSS classes with JS!
                if (
                    $(this).hasClass("isActive") &&
                    !parent.children(".Sections-Tabs").is(":visible")
                ) {
                    $(this).removeClass("isActive");
                    $(panelId).removeClass("isActive");
                } else {
                    parent
                        .children(".Sections-Tabs")
                        .find(".Sections-Anchor")
                        .removeClass("isActive");
                    parent.children(".Sections-Anchor").removeClass("isActive");
                    $(this).addClass("isActive");

                    parent.children(".Sections-Panel").removeClass("isActive");
                    $(panelId).addClass("isActive");
                }
            });

            // Activate first tab
            _this
                .find(".Sections-Anchor")
                .eq(0)
                .click();
        });

        return this;
    };
})(jQuery);

$(document).on("page:fetch", function () {
    NProgress.start();
});
$(document).on("page:change", function () {
    NProgress.done();
});
$(document).on("page:restore", function () {
    NProgress.remove();
});

var headingAnchors = function () {
    $(".js-anchor").each(function () {
        var anchor = $(
            '<a class="HeadingAnchor-Link"><i class="icon-link"></i></a>'
        ).attr("href", "#" + $(this).attr("id"));
        $(this)
            .find("h1,h2,h3,h4,h5,h6")
            .append(anchor);
    });
};

var onReadyPlugins = function () {
    headingAnchors();

    var searchBoxInput = jQuery(".js-SearchBox-Field");
    var defaultValue = searchBoxInput.val();
    searchBoxInput
        .focus(function () {
            if ($(this).val() == defaultValue) {
                $(this).val("");
            }
        })
        .blur(function () {
            if ($(this).val().length == 0) {
                $(this).val(defaultValue);
            }
        });

    audiojs.events.ready(function () {
        path = "/_Resources/Static/Packages/Sfi.Sfi/Built/";
        var as = audiojs.createAll({
            imageLocation: path + "player-graphics.gif",
            swfLocation: path + "audiojs.swf",
            css: ""
        });
    });

    // Open external urls in new window
    $("a").each(function () {
        var a = new RegExp("/" + window.location.host + "/");
        // Starts with http and does not contain current domain
        if (!a.test(this.href) && this.href.indexOf("http") === 0) {
            $(this).click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                window.open(this.href, "_blank");
            });
        }
    });

    // MainMenu toggle
    $(".js-MainMenu-Toggle").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(".js-MainMenu").toggleClass("isActive");
    });
    $("body").click(function (e) {
        $(".js-MainMenu").removeClass("isActive");
    });
    $(".js-MainMenu-Wrap").click(function (e) {
        e.stopPropagation();
    });

    $(".js-MobileNav-Toggle").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(".js-MobileNav").toggleClass("isActive");
    });
    $("body").click(function (e) {
        $(".js-MobileNav").removeClass("isActive");
    });

    $(".js-sections").responsiveTabs();

    // TODO: optimize carousel init code
    $(".js-carousel-1x").slick({
        dots: true,
        slide: "*",
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow:
            '<button type="button" class="slick-prev icon-left-open">Назад</button>',
        nextArrow:
            '<button type="button" class="slick-next icon-right-open">Вперед</button>'
    });

    $(".js-carousel-2x").slick({
        dots: true,
        slide: "*",
        infinite: true,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 2,
        prevArrow:
            '<button type="button" class="slick-prev icon-left-open">Назад</button>',
        nextArrow:
            '<button type="button" class="slick-next icon-right-open">Вперед</button>',
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

    $(".js-carousel-3x").slick({
        dots: true,
        slide: "*",
        infinite: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 3,
        prevArrow:
            '<button type="button" class="slick-prev icon-left-open">Назад</button>',
        nextArrow:
            '<button type="button" class="slick-next icon-right-open">Вперед</button>',
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

    $(".js-carousel-4x").slick({
        dots: false,
        slide: "*",
        infinite: false,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        prevArrow:
            '<button type="button" class="slick-prev icon-left-open">Назад</button>',
        nextArrow:
            '<button type="button" class="slick-next icon-right-open">Вперед</button>',
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
};

$(document).ready(function () {
    onReadyPlugins();
});

if (typeof document.addEventListener === "function") {
    document.addEventListener(
        "Neos.PageLoaded",
        function (event) {
            onReadyPlugins();
        },
        false
    );
}

document.querySelectorAll(".js-ReadMore").forEach(function (node) {
    var readMore = document.createElement("div");
    readMore.classList.add("ReadMore-overlay");
    var button = document.createElement("span");
    button.innerText = "Читать далее";
    button.className = "ReadMore-button";
    readMore.appendChild(button);
    readMore.addEventListener("click", function (event) {
        node.classList.add("ReadMore--isExpanded");
    });
    node.appendChild(readMore);
});

// Init the stickInParent plugin
(function () {
    document.querySelectorAll(".js-stickInParent").forEach(function (node) {
        stickInParent(node);
    });
})();
(function () {
    document
        .querySelectorAll(".js-stickInParent--large")
        .forEach(function (node) {
            stickInParent(node, {minWidth: 1024});
        });
})();
(function () {
    document
        .querySelectorAll(".js-stickInParent--small")
        .forEach(function (node) {
            stickInParent(node, {minWidth: 1});
        });
})();

function stickInParent(element, options) {
    if (!element) {
        return null;
    }
    options = options || {};
    var minWidth = options.minWidth || 600;
    var minHeight = options.minHeight || 640;
    var parentClass = options.parentClass || "js-stickInParent-parent";

    var parent = findParent(element, parentClass);

    element.style.width = element.offsetWidth;
    var initStyles = element.style.cssText;
    var originalStyles = "width:" + element.offsetWidth + "px;" + initStyles;
    parent.style.position = "relative";
    var fixer = document.createElement("div");
    element.parentElement.insertBefore(fixer, element.nextSibling);
    update(window.scrollY);
    debouncedScroll(update);

    window.addEventListener("resize", function (e) {
        element.style.width = "auto";
        originalStyles = "width:" + element.offsetWidth + "px;" + initStyles;
    });

    function update(scrollPosition) {
        if (window.innerWidth > minWidth && window.innerHeight > minHeight) {
            if (
                scrollPosition > parent.offsetTop &&
                scrollPosition + window.innerHeight <
                parent.offsetTop +
                parent.offsetHeight +
                window.innerHeight -
                element.offsetHeight
            ) {
                setFixed();
            } else if (
                scrollPosition + window.innerHeight >
                parent.offsetTop +
                parent.offsetHeight +
                window.innerHeight -
                element.offsetHeight
            ) {
                setAbsolute();
            } else {
                setStatic();
            }
        }
    }
    function setFixed() {
        element.style = "position: fixed; top: 0;" + originalStyles;
        element.classList.add("isFixed");
        fixer.style = "display: block; height: " + element.offsetHeight + "px";
    }
    function setAbsolute() {
        element.classList.remove("isFixed");
        element.style =
            "position: absolute; top: auto; bottom: 0;" + originalStyles;
        fixer.style = "display: block; height: " + element.offsetHeight + "px";
    }
    function setStatic() {
        element.classList.remove("isFixed");
        element.style = "position: static;" + originalStyles;
        fixer.style = "display: none;";
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

    window.addEventListener("scroll", function (e) {
        lastKnownScrollPosition = window.scrollY;
        if (!isTicking) {
            window.requestAnimationFrame(function () {
                callback(lastKnownScrollPosition);
                isTicking = false;
            });
        }
        isTicking = true;
    });
}

function md5(inputString) {
    var hc = "0123456789abcdef";
    function rh(n) {var j, s = ""; for (j = 0; j <= 3; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0F) + hc.charAt((n >> (j * 8)) & 0x0F); return s;}
    function ad(x, y) {var l = (x & 0xFFFF) + (y & 0xFFFF); var m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF);}
    function rl(n, c) {return (n << c) | (n >>> (32 - c));}
    function cm(q, a, b, x, s, t) {return ad(rl(ad(ad(a, q), ad(x, t)), s), b);}
    function ff(a, b, c, d, x, s, t) {return cm((b & c) | ((~b) & d), a, b, x, s, t);}
    function gg(a, b, c, d, x, s, t) {return cm((b & d) | (c & (~d)), a, b, x, s, t);}
    function hh(a, b, c, d, x, s, t) {return cm(b ^ c ^ d, a, b, x, s, t);}
    function ii(a, b, c, d, x, s, t) {return cm(c ^ (b | (~d)), a, b, x, s, t);}
    function sb(x) {
        var i; var nblk = ((x.length + 8) >> 6) + 1; var blks = new Array(nblk * 16); for (i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (i = 0; i < x.length; i++) blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8); blks[nblk * 16 - 2] = x.length * 8; return blks;
    }
    var i, x = sb(inputString), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, olda, oldb, oldc, oldd;
    for (i = 0; i < x.length; i += 16) {
        olda = a; oldb = b; oldc = c; oldd = d;
        a = ff(a, b, c, d, x[i + 0], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = ff(b, c, d, a, x[i + 3], 22, -1044525330); a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983); a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = ff(b, c, d, a, x[i + 15], 22, 1236535329); a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i + 0], 20, -373897302); a = gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = gg(b, c, d, a, x[i + 8], 20, 1163531501); a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734); a = hh(a, b, c, d, x[i + 5], 4, -378558);
        d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = hh(b, c, d, a, x[i + 10], 23, -1094730640); a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189); a = hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = ii(a, b, c, d, x[i + 0], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = ii(b, c, d, a, x[i + 5], 21, -57434055); a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799); a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = ii(b, c, d, a, x[i + 9], 21, -343485551); a = ad(a, olda); b = ad(b, oldb); c = ad(c, oldc); d = ad(d, oldd);
    }
    return rh(a) + rh(b) + rh(c) + rh(d);
}

function utoa(str) {
    return window.btoa(encodeURIComponent(str));
}
if(!document.querySelector(".neos-backend")) {
    document.querySelectorAll("a[data-signature]").forEach(function (node) {
        var json = node.getAttribute('data-signature');
        var signature = JSON.parse(json)
        var title = 'Дата и время подписания: ' + signature.signDate + '\nФИО подписавшего документ: ' + signature.signee + '\nДолжность: ' + signature.signeePosition + '\nУникальный программный ключ: ' + md5(signature.signee)
        signature.url = node.getAttribute('href')
        node.setAttribute('title', title)
        node.setAttribute('href', 'https://docs.sfi.ru/?data=' + utoa(JSON.stringify(signature)))
    });
}

document.querySelectorAll(".js-Expand").forEach(function (node) {
    node.querySelector(".js-Expand-title").addEventListener('click', function () {
        node.classList.toggle('isExpanded')
    })
})
