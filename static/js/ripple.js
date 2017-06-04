(function() {
	function _ripple(element, inEvent, outEvent) {
		var ripple = createElement('span', {
			class: 'ripple-effect',
			parent: element
		});
		function removeRipple(e) {
			ripple.classList.add('out');
			ripple.classList.remove('in');
			element.removeEventListener(outEvent, removeRipple);
		}
		function addRipple(e) {
			var boundingRect = element.getBoundingClientRect();
			var width = boundingRect.width;
			var height = boundingRect.height;
			var left = boundingRect.left;
			var top = boundingRect.top;
			var size = Math.max(width, height);
			ripple.style.width = ripple.style.height = size + 'px';
			var offsetX = e.pageX - left - pageXOffset - width / 2;
			var offsetY = e.pageY - top - pageYOffset - height / 2;
			ripple.style.left = offsetX + 'px';
			ripple.style.top = offsetY + 'px';
			ripple.classList.remove('out');
			ripple.classList.add('in');
			element.addEventListener(outEvent, removeRipple);		
		}
		element.addEventListener(inEvent, addRipple);
		element.style.position = 'relative';
		element.style.overflow = 'hidden';
	}
	function Ripple(selectors, inEvent, outEvent) {
		if (!inEvent) {
			inEvent = 'mousedown';
		}
		if (!outEvent) {
			outEvent = 'mouseup';
		}
		selectors.forEach(function(selector) {
			var matches = [].slice.call(document.querySelectorAll(selector));
			matches.forEach(function(match) {
				_ripple(match, inEvent, outEvent);
			});
		});
	}
	window.Ripple = Ripple;
})();