(function () {
    function formatAmount(amount) {
        var a = String(amount);
        var res = "";
        for (var i = a.length; i > 0; i--) {
            var revI = a.length - i;

            if (revI % 3 === 0 && revI !== 0) {
                res = " " + res;
            }
            res = a[i - 1] + res;
        }
        return res;
    }

    function updatePlaceholders(referer, amount) {
        Array.prototype.forEach.call(document.querySelectorAll('.project-' + referer), function (root) {
            root.querySelector('.ajaxAmount').textContent = formatAmount(amount);
            root.querySelector('.progressBar').style.width = String(100 * (amount / 7000000)) + '%';
        });
    }


    var request = new XMLHttpRequest();
    var form = document.getElementById('donate');
    request.open('GET', 'http://payments.sfi.ru:8585/getAmountDonate', true);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            var responseData = JSON.parse(this.response);
            Object.keys(responseData.byReferer).forEach(function (referer) {
                updatePlaceholders(referer, Number(responseData.byReferer[referer]));
            });
        } else {
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
    };

    request.send();

})();