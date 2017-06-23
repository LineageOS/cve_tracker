(function() {
	function ThemeSwitcher(o) {
		var te = this;

		te.load = function(name) {
			o.target.href = o.themes[name];
		};

		te.set = function(name) {
			te.load(name);
			localStorage.setItem('theme', name);
		};

		te.get = function() {
			return localStorage.getItem('theme');
		};

		var setTheme = te.get();
		if (!setTheme) {
			setTheme = o.default;
		}
		te.set(setTheme);
	}
	window.ThemeSwitcher = ThemeSwitcher;
})();