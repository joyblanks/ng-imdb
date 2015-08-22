<?php
	header('Content-type: application/json');
	header("Access-Control-Allow-Origin: *");
	if(isset($_GET['delay'])){
		sleep(3);
	}
	echo get_page($_GET['url']);
	function get_page($url){
		$proxy = 'http://proxy.tcs.com:8080';
		$proxyauth = 'india\XXX:YYY';
		//return $url;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,$url);
		curl_setopt($ch, CURLOPT_PROXY, $proxy);
		curl_setopt($ch, CURLOPT_PROXYUSERPWD, $proxyauth);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		$data = curl_exec($ch);
		curl_close($ch);
		return $data;
	}
?>