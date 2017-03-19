/**
 * File one-page.js.
 *
 * Handles the url updating and history of a one-page website
 *
 */

var NAMESPACECAMELCASEOnePage = (function ($) {

	var firstLoad = true;
	var History = window.History;
	var homeUrl = NAMESPACECAMELCASEVars.homeUrl;
	var homeUrlRelative = NAMESPACECAMELCASEVars.homeUrlRelative;
	var homeId = '#post-3';
	var sectionClass = '.entry';
	var userIsScrolling = true;
	if (NAMESPACECAMELCASEVars.wpDebug) {
		History.options.debug = true;
	}
	var onLoadCallbacks = [];

	/*
	 * Load all the sections trough ajax
	 * Insert only the sections wich aren't present yet on the page
	 */
	function loadSections() {
		// Find the existing article on the page (loaded on first load without ajax)
		var nativeArticleId = $(sectionClass).not(homeId).attr('id');
		var nativeArticleParent = $('#' + nativeArticleId).parent();

		// Hide existing article (except on homepage) to make page loading appear smoother
		if (!NAMESPACECAMELCASEVars.isHome) {
			$('#' + nativeArticleId).css('visibility', 'hidden');
		}

		// Get all the content!
		$.ajax({
				url: NAMESPACECAMELCASEVars.ajaxUrl,
				method: 'POST',
				dataType: 'json',
				data: {
					action: 'NAMESPACE_get_all_pages',
					is_home: NAMESPACECAMELCASEVars.isHome
				}
			})
			// when done start insertion
			.done(function (loadedPages) {
				var insertLocation = 'beforeNativeArticle';

				// loop trough all ajax loaded pages
				$.each(loadedPages, function (loadedPageId, page) {
					//console.log('current in loop: ' + loadedPageId);
					page = $(page);

					// if the ajax loaded page is already present (natively loaded) do not append it
					if (loadedPageId === nativeArticleId || (NAMESPACECAMELCASEVars.isHome && loadedPageId === 'post-' + NAMESPACECAMELCASEVars.homeId)) {
						//console.log(loadedPageId + ' is a native article');
						$('#' + nativeArticleId).css('visibility', 'visible');
						insertLocation = 'afterNativeArticle';

						// otherwise include it before the natively loaded page or append it at the end of the container
					} else {
						if (insertLocation === 'beforeNativeArticle') {
							//console.log(loadedPageId + ' is before ' + nativeArticleId);
							page.insertBefore('#' + nativeArticleId);
						} else {
							//console.log('append ' + loadedPageId + ' at the end of #main');
							$(nativeArticleParent).append(page);
						}
					}

				});

				// copy the main navigation to all the sections
				$('#site-navigation').clone().prependTo('.entry:not(' + homeId + ')');

				// Content is loaded and present on the page!
				//console.log('one page loaded!');
				$.each(onLoadCallbacks, function (index, callbackFunction) {
					callbackFunction();
				});


				//if (History.enabled) {
				//	State = History.getState();
				var pageUrl = window.location.href;
				//console.log('first load');
				firstLoad = false;

				//console.log("start with: " + pageUrl);
				if (pageUrl !== homeUrl) {
					goToPage(pageUrl);
				}

				/*} else {
					return false;
				}*/

			})
			.fail(function (req, status, err) {
				console.log("error: ", status, err);
			});
	}

	/**
	 * Execute when the (history) state changes
	 * e.g. on link click, on user scrolling to a section
	 */
	History.Adapter.bind(window, 'statechange', function () {
		var State = History.getState();

		// Log the history object to the browser's console
		History.debug(State);

		// When state changes and page should scroll to the element
		// e.g. on (menu)link click
		if (State.data.scrollToSection === true) {
			goToPage(State.data.pageUrl);
		}
	});

	/**
	 * When clicked on a (menu)link, go to the targeted section
	 *
	 */
	$('body').on('click', 'a', function (e) {
		var pageUrl = $(this).attr('href');

		if (pageUrl.indexOf(homeUrl) != -1 && $('[target="_blank"]', this).length === 0 && typeof $(this).data('fancybox-href') === 'undefined' && pageUrl.indexOf(".jpg") == -1 && pageUrl.indexOf(".jpeg") == -1 && pageUrl.indexOf(".png") == -1 && pageUrl.indexOf(".gif") == -1 && pageUrl.indexOf(".bmp") == -1 && pageUrl.indexOf(".pdf") == -1 && pageUrl.indexOf(".doc") == -1 && pageUrl.indexOf(".docx") == -1 && pageUrl.indexOf(".xls") == -1 && pageUrl.indexOf(".xlsx") == -1) {
			e.preventDefault();
			var title = $(this).text();
			//console.log('pushState on link click');
			History.pushState({
				pageUrl: pageUrl,
				scrollToSection: true
			}, title, pageUrl);
		}


	});

	function activateCurrentMenuItems() {
		$('.mainNavigation--menu li').removeClass('is-active');
		$('.mainNavigation--menu').each(function (index) {
			$('li', this).eq(index).addClass('is-active');
		});
	}
	onLoad(activateCurrentMenuItems);

	/**
	 * Scroll to the section with the corresponding data-url attribute
	 *
	 */
	function goToPage(currentUrl) {
		var scrollTo;
		var isLinkToPopup = false;
		var popupContentId;
		//console.log('goToPage: ' + currentUrl);

		// find the entry which matches with currentUrl
		var currentEntry = $('.entry[data-url="' + currentUrl + '"]');
		var currentEntryTitle = $(currentEntry).data('title') + ' - ' + NAMESPACECAMELCASEVars.siteName;
		if (currentEntry.length) {
			if (currentUrl === homeUrl) {
				scrollTo = 0;
			} else {
				scrollTo = $(currentEntry).offset().top;
			}
		} else {
			var linkToCurrentUrl = $('a[href="' + currentUrl + '"]');
			if (linkToCurrentUrl.length && linkToCurrentUrl[0].hasAttribute('data-fancybox-href')) {
				scrollTo = linkToCurrentUrl.closest('.entry').offset().top;
				isLinkToPopup = true;
				popupContentId = $(linkToCurrentUrl.data('fancybox-href'));
			}
		}

		userIsScrolling = false;
		var speed = 300 + Math.abs($(window).scrollTop() - scrollTo);
		$('html, body').animate({
			scrollTop: scrollTo
		}, {
			duration: (speed > 2000 ? 2000 : speed)
		}).promise().done(function () {
			if (firstLoad) {
				//console.log('Onfirstload pushState to currentUrl: ' + currentUrl);
				History.pushState({
					pageUrl: currentUrl,
					scrollToSection: false
				}, $("title").text(), currentUrl);
				firstLoad = false;
				// Debug: Log the history object to the browser's console
				History.debug(History.getState());
			} else {
				//console.log('replaceState to currentUrl: ' + currentUrl);
				History.replaceState({
					pageUrl: currentUrl,
					scrollToSection: false
				}, currentEntryTitle, currentUrl);
			}
			// When automated scrolling is done, set it back to user scrolling
			userIsScrolling = true;

			// If the url was a popup, open the popup
			if (isLinkToPopup) {
				hhvp_script.openInlineModal(popupContentId);
			}
		});


	}

	/**
	 * Check if element has scrolled into view
	 */
	function isScrolledIntoView(elem) {
		var elementHitMargin = 150; // area above (e.g. 150) and below (-150) the element's top
		var windowScrollTop = $(window).scrollTop(); // how far have we scrolled thus far
		var elemOffset = elem.offset(); // element's position relative to the document
		var scrollDistanceToElement = elemOffset.top - windowScrollTop; // how much further must we scroll until we reach the element (element's top aligns with viewport top)

		//console.log(elem.attr('id') + ': ' + elemOffset.top + ' - ' + windowScrollTop + ' = ' + scrollDistanceToElement);
		if (scrollDistanceToElement < elementHitMargin && scrollDistanceToElement > -elementHitMargin) {
			//console.log(elem.attr('id'));
			return true;
		}
		return false;
	}

	/**
	 * When scrolling check if a section is in view and update the history/url
	 *
	 */
	$(window).scroll(function () {
		// Should only be executed on user scrolling
		if (userIsScrolling === true) {
			//console.log('user scolling (replaceState when section scrolls into view)');
			$(sectionClass).each(function (index, elem) {
				if (isScrolledIntoView($(elem))) {
					var pageUrl = $(this).data('url');
					var title = $(this).data('title') + ' - ' + NAMESPACECAMELCASEVars.siteName;
					History.replaceState({
						pageUrl: pageUrl,
						scrollToSection: false
					}, title, pageUrl);
				}
			});
		}
	});


	function onLoad(callback) {
		if (callback) {
			onLoadCallbacks.push(callback);
		}
	}

	function init() {
		loadSections();
	}

	return {
		init: init,
		onLoad: onLoad
	};


})(jQuery);

NAMESPACECAMELCASEOnePage.init();
