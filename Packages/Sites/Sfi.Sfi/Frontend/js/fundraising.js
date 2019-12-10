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
            var offset = parseInt(root.querySelector('.ajaxAmount').dataset.offset);
            var finalAmount = offset + amount;
            root.querySelector('.ajaxAmount').textContent = formatAmount(finalAmount);
            root.querySelector('.progressBar').style.width = String(100 * (finalAmount / 7000000)) + '%';
        });
    }

    // Make request if at least one bar is present
    if (document.querySelector('.progressBar')) {
        var request = new XMLHttpRequest();
        var form = document.getElementById('donate');
        request.open('GET', 'https://payments.sfi.ru/getAmountDonate', true);

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
    }
})();
