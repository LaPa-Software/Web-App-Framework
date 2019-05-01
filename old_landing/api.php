<?php
ini_set('mbstring.internal_encoding', 'UTF-8');
header("Access-Control-Allow-Origin:*");
header('HTTP/1.1 200 OK');
header('Content-type: application/json');

if (isset($_GET['initHost'])) {
    $domain = htmlspecialchars(stripcslashes(trim($_GET['initHost'])));
    if (stristr($domain, 'http://')) $domain = substr($domain, 7);
    if (stristr($domain, 'https://')) $domain = substr($domain, 8);
    if (stristr($domain, 'www.')) $domain = substr($domain, 4);
    $domain = explode('/', $domain);
    if (isset($domain[0])) {
        $domain = $domain[0];
    } else {
        exit('{"status":true}');
    }
    if (!is_file('domains/' . $domain . '.png')) {
        $delay = isset($_GET['time']) ? ($_GET['time'] < 5 ? 5 : ($_GET['time'] > 20 ? 20 : $_GET['time'])) : 5;
        $url = "http://api.screenshotlayer.com/api/capture?access_key=8a8196ba62c42ecbd857b52cb07e7421&url=http://$domain&viewport=1280x768&width=300&delay=$delay";
        $img = 'domains/' . $domain . '.png';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($ch);
        curl_close($ch);
        file_put_contents($img, $result);
    }
    echo '{"status":true}';
}

if (isset($_GET['listHosts'])) {
    if (!is_dir('domains/')) exit(json_encode([]));
    $domains = dir('domains/');
    $list = Array();
    while (false !== ($domain = $domains->read())) {
        if (is_file('domains/' . $domain)) $list[] = substr($domain, 0, strrpos($domain, '.png'));
    }
    echo json_encode($list);
}