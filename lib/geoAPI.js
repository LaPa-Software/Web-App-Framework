;(function () {
    var getLocation = function (forceLoad, func) {
        if (!navigator.geolocation) return false;
        if (!forceLoad && CONF.location) {
            if (func) func(CONF.location);
            return CONF.location;
        } else {
            CONF.waitLoc = setTimeout(function () {
                if (CONF.location) return true;
                delete CONF.waitLoc;
                if (func) func(false);
            }, 5000);
            navigator.geolocation.getCurrentPosition(function (position) {
                CONF.location = {'lat': position.coords.latitude, 'long': position.coords.longitude};
                if (func && CONF.waitLoc) func(CONF.location);
            }, function () {
                if (func && CONF.waitLoc) func(false);
            });
            return false;
        }
    };
    LaPa.HOOK.reg('initLib', false, function () {
        LaPa.getLocation = getLocation;
    }, 'geoApi.js');
})();