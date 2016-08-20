;(function () {
    'use strict';
    if(window.LaPa)return;
    function init() {
        var LaPa = window.LaPa = {};
        LaPa['🐾']={'major':3,'minor':0,'build':12,'stable':false,'stage':'dev',toString: function() {
            return 'LaPa Web App FrameWork ' + this.major+'.'+this.minor+'.'+this.stage+'.'+this.build;
        }};
        var CONF = LaPa.CONF = LaPa.CONF || {};
        var LIB = LaPa.LIB = {};
        var HOOK = {};
        var activeHooks = {};
        LaPa.historyAPI = {
            'state': function (data) {
                if (data.state.page)LaPa.page(data.state.page);
            },
            'push': function (id, title, url) {
                history.pushState({'page': id}, title, url ? url : id);
            },
            'replace': function (id, title, url) {
                history.replaceState({'page': id},title, url ? url : id)
            }
        };
        LaPa.HOOK = {
            'reg': function (trigger, page, func, id) {
                id = id || (LaPa.tmpLibId || Object.keys(HOOK).length);
                page = page || false;
                HOOK[id] = {'trigger': trigger, 'page': page, 'func': func};
                if (activeHooks[trigger])LaPa.HOOK.call(trigger, false, false, id);
            },
            'call': function (trigger, page, termless, id, param) {
                if (termless)activeHooks[trigger] = true;
                if (id) {
                    HOOK[id].func(param || null);
                    return;
                }
                var keyHook = Object.keys(HOOK);
                for (var i in keyHook) {
                    if (page) {
                        if (HOOK[keyHook[i]].page == false || (page != HOOK[keyHook[i]].page))continue;
                    }
                    if (HOOK[keyHook[i]].trigger==trigger) {
                        HOOK[keyHook[i]].func(param || null);
                    }
                }
            },
            'release':function (trigger) {
                delete activeHooks[trigger];
                alert('Released '+trigger)
            },
            'list': function () {
                return Object.keys(HOOK);
            }
        };
        LaPa.execLib = function (id) {
            LaPa.tmpLibId=id;
            eval(LaPa.LIB[id]);
            delete LaPa.tmpLibId;
            LaPa.HOOK.call('initLib',false,false,id);
        };
        LaPa.require = function (path, onComplete,fromRepo) {
            if (LaPa.LIB[path]) {
                if (onComplete)onComplete();
                return true;
            }
            var xhr = new XMLHttpRequest();
            if(fromRepo)path='http://🐾.oqoa.ru'+path;
            xhr.open('GET', path + '?rnd=' + new Date().getTime(), true);
            xhr.responseType = 'text';
            xhr.onload = function () {
                if (this.status == 200) {
                    LaPa.LIB[path] = this.response;
                    LaPa.execLib(path);
                    if (onComplete)onComplete();
                }else{
                    // TODO: Extensions repository
                    if(!fromRepo)LaPa.require(path,onComplete,true);
                }
            };
            xhr.send();
        };
        LaPa.init=init;
        window.addEventListener('popstate', function(e){
            alert('History navigated to: '+e.state.page);
            LaPa.historyAPI.state(e.state);
        },false);
    }
    function postInit() {
        LaPa.HOOK.call('initLib',false,true);
        LaPa.HOOK.call('readyPage',false,true);
    }
    init();
    addEventListener('load', postInit);
})();