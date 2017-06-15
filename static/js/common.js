(function() {
	Ripple(['#navbar .logo', '#navbar .items > *', 'button']);

	var footer = document.querySelector('#footer');
	var footerIsFixed = false;
	function toggleFixedFooter() {
		footer.classList.toggle('fixed');
		footerIsFixed = !footerIsFixed;
	}
	function checkFixedFooter() {
		if(footerIsFixed) {
			toggleFixedFooter();
			checkFixedFooter();
		} else {
			var footerBoundingRect = footer.getBoundingClientRect();
			if(footerBoundingRect.bottom < window.innerHeight) {
				toggleFixedFooter();
			}
		}
	}
	window.addEventListener('resize', checkFixedFooter);
	checkFixedFooter();
})();
