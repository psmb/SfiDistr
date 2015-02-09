var backendOnlyStuff = function() {
    $(".neos-inline-editable").click(function(event) {
        event.stopPropagation();
        event.preventDefault();
    });
};


if (typeof document.addEventListener === 'function') {
	document.addEventListener('Neos.PageLoaded', function(event) {
		backendOnlyStuff();
	}, false);
}