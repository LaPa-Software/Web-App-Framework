;(function () {
    var genMap = function (searchQuery) {
        document.getElementById('map').innerHTML = '';

        function init() {
            var myMap = new ymaps.Map('map', {
                center: [56.81, 60.57],
                zoom: 13,
                controls: []
            });
            var searchControl = new ymaps.control.SearchControl({
                options: {
                    provider: 'yandex#search'
                }
            });
            myMap.controls.add(searchControl);
            searchControl.search(searchQuery);
        }

        ymaps.ready(init);
    };
    APP.HOOK.reg('initLib', false, function () {
        window.APP.genMap = genMap;
    }, 'yandexMaps.js');
})();