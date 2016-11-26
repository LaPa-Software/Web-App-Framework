;(function () {
    'use strict';
    if (window.LaPa)return;
    function init() {
        var PAWS = decodeURI('%F0%9F%90%BE');
        var SERVICE_HOST = 'http://'+PAWS+'.oqoa.ru';
        var LaPa = window.LaPa = {};
        LaPa[PAWS] = {
            'major': 3, 'minor': 1, 'build': 2, 'stable': true, 'stage': 'alpha', toString: function () {
                return 'LaPa Web App FrameWork ' + this.major + '.' + this.minor + '.' + this.stage + '.' + this.build;
            }
        };
        var CONF = LaPa.CONF = LaPa.CONF || {};
        var LIB = LaPa.LIB = {};
        var HOOK = {};
        var EXT = {};
        var activeHooks = {};
        LaPa.historyAPI = {
            'state': function (data) {
                LaPa.noHistory=true;
                if (data.page) LaPa.page(data.page);
            },
            'push': function (id, title, url) {
                url = url ? url : (LaPa.CONF.staticUrl ? null : id);
                history.pushState({'page': id}, title, url);
            },
            'replace': function (id, title, url) {
                history.replaceState({'page': id}, title, url ? url : id)
            }
        };
        LaPa.HOOK = {
            'reg': function (trigger, page, func, id) {
                id = id || (LaPa.tmpLibId || Object.keys(HOOK).length);
                page = page || false;
                HOOK[id] = {'trigger': trigger, 'page': page, 'func': func};
                if (activeHooks[trigger]) LaPa.HOOK.call(trigger, false, false, id);
            },
            'call': function (trigger, page, termless, id, param) {
                if (termless) activeHooks[trigger] = true;
                if (id) {
                    HOOK[id].func(param || null);
                    return;
                }
                var keyHook = Object.keys(HOOK);
                for (var i in keyHook) {
                    if (page) {
                        if (HOOK[keyHook[i]].page == false || (page != HOOK[keyHook[i]].page))continue;
                    }
                    if (HOOK[keyHook[i]].trigger == trigger) {
                        HOOK[keyHook[i]].func(param || null);
                    }
                }
            },
            'release': function (trigger) {
                delete activeHooks[trigger];
            },
            'list': function () {
                return Object.keys(HOOK);
            }
        };
        LaPa.EXT = {
            'reg': function (id) {
                if (EXT[id])return false;
                EXT[id] = {'paired': []};
                return true;
            },
            'pair': function (id, worker) {
                if (!EXT[id])return false;
                EXT[id].paired.push(worker);
                return true;
            },
            'get': function (id, data, callback) {
                if (!EXT[id])return data;
                for (var i in EXT[id].paired) {
                    EXT[id].paired[i](data,callback); //TODO: MultiExtension support
                }
                return data;
            },
            'list':function () {
                return EXT;
            },
            'check':function (id) {
                if(!EXT[id])return false;
                return EXT[id].paired.length!=0;
            }
        };
        LaPa.execLib = function (id) {
            LaPa.tmpLibId = id;
            eval(LaPa.LIB[id]);
            delete LaPa.tmpLibId;
            LaPa.HOOK.call('initLib', false, false, id);
        };
        LaPa.require = function (path, onComplete, fromRepo) {
            if (LaPa.CONF.useRepo) fromRepo = true;
            if (LaPa.LIB[path]) {
                if (onComplete) onComplete();
                return true;
            }
            var xhr = new XMLHttpRequest();
            xhr.open('GET', (fromRepo ? SERVICE_HOST + ('/lib/' + path.split('/').reverse()[0]) : path) + '?rnd=' + new Date().getTime(), true);
            xhr.responseType = 'text';
            xhr.onload = function () {
                if (this.status == 200) {
                    LaPa.LIB[path] = this.response;
                    LaPa.execLib(path);
                    if (onComplete) onComplete();
                } else {
                    // TODO: Extensions repository
                    if (!fromRepo) LaPa.require(path, onComplete, true);
                }
            };
            xhr.send();
        };
        LaPa.importLib = function (id) {
            if (LaPa.LIB[id])return false;
            return LaPa.LIB[id] = true;
        };
        LaPa.message = function (text) {
            alert(text); // TODO: Extend by user-defined Message containers
        };
        LaPa.initHost = function () {
            if (localStorage.getItem('LaPaHostInit'))return true;
            if (location.hostname == 'localhost')return false;
            var xhr = new XMLHttpRequest();
            var url = SERVICE_HOST+'/api.php?initHost=' + location.hostname + '&rnd=' + new Date().getTime();
            xhr.open('GET', url, true);
            xhr.responseType = 'text';
            xhr.onload = function () {
                if (this.status == 200) {
                    localStorage.setItem('LaPaHostInit', true);
                } else {
                    localStorage.setItem('LaPaHostInit', false);
                }
            };
            xhr.send();
        };
        LaPa.init = init;
        window.addEventListener('popstate', function (e) {
            LaPa.historyAPI.state(e.state);
        }, false);
    }

    function postInit() {
        LaPa.HOOK.call('initLib', false, true);
        LaPa.HOOK.call('readyPage', false, true);
        LaPa.initHost();
    }

    init();
    addEventListener('load', postInit);
})();