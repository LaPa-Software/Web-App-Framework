;(function() {
    var io=function (data,onFinish,target,plainData,dataType) {
        target = target || LaPa.CONF.server.requestUrl;
        if(!target){if (onFinish)onFinish(false);return;}
        if(data) data = '?query=' + JSON.stringify(data);else data='';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', target + data, true);
        if(dataType){
            xhr.responseType=dataType;
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4){
                var response = false;
                if(xhr.status == 200||xhr.status == 0) {
                    if (!plainData) {
                        try {
                            response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            response = false;
                        }
                    }
                    if(dataType)response=xhr.response;
                }else{
                    response = false;
                }
                if (onFinish)onFinish(response);
            }else{
            }
        };
        xhr.send();
    };
    function testIo(data,onFinish,target,plainData,dataType) {
        fetch(target+ '?rnd=' + new Date().getTime())
            .then(function(response) {
                if (response.status !== 200) {
                    return false;
                }
                return response.text();
            })
            .then(function(text) {
                if(onFinish)onFinish(text);
            });
    }
    LaPa.HOOK.reg('initLib',false,function () {
        window.LaPa.io=io;
        window.LaPa.testIo=testIo;
    });
})();