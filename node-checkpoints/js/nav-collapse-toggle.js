YUI().use('aui-base', function(Y) {
	var navCollapse = Y.one('.collapse.nav-collapse');

	Y.one('.btn-navbar.collapsed').on(
		'click',
		function(event) {
			navCollapse.toggleClass('expanded');
		}
	);
});