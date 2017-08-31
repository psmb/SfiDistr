var backendOnlyStuff = function() {
};

if (typeof document.addEventListener === 'function') {
	document.addEventListener('Neos.PageLoaded', function(event) {
		backendOnlyStuff();
	}, false);
}

$(document).ready(function () {
	backendOnlyStuff();
});
