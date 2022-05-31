<?php

/*!
 * getArea.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 getArea.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

include_once 'geoQueries.php';
if(session_id() == '') {
    session_start();
}
$defaultArea='';
if (array_key_exists('idArea',$_SESSION))
	{
	$idArea=$_SESSION['idArea'];
	$query="select Name from Areas where Id=". $idArea;
	//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
	//$arr=mysql_fetch_array($rs, MYSQL_NUM);
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$defaultArea=$arr[0];
	}
else
	{
	if (array_key_exists('idArea',$_COOKIE))
		{
		$idArea=$_COOKIE['idArea'];
		$query="select Name from Areas where Id=". $idArea;
		//$rs=mysql_query($query);
		$rs = $pdo->prepare($query);
		$rs->execute();
		//$arr=mysql_fetch_array($rs, MYSQL_NUM);
		$arr=$rs->fetch(PDO::FETCH_NUM);
		$defaultArea=$arr[0];
		$_SESSION['idArea']  = $idArea;
		}
	}
	
if ($defaultArea=='')
	{
	$defaultArea='World';
	$query="select Id from Areas where Name='". $idArea."'";
	//$rs=mysql_query($query);
	$rs = $pdo->prepare($query);
	$rs->execute();
	//$arr=mysql_fetch_array($rs, MYSQL_NUM);
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$idArea=$arr[0];
	}


$condicionBase="where Id='".$idArea."'";
$espacioTituloDcha='<a class="conTip" title="change Area" href="selectDefaultArea.php?default='.htmlentities($defaultArea,ENT_QUOTES, "UTF-8").'">'.$defaultArea.'</a>';

$query="select DefaultMap from Areas ". $condicionBase;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
//$arr=mysql_fetch_array($rs, MYSQL_NUM);
$arr=$rs->fetch(PDO::FETCH_NUM);
$idMap=$arr[0]*1;
if ($idMap==0)
	{
	$idMap=busquedaRecursivaMapaBase($idArea);
	}


?>