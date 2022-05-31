<?php

/*!
 * posProcesar.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 posProcesar.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

function geoAdded($geo)
//for checking areas to be updated following the country of geo added
{
global $pdo;
$query="select Country from GeoElements where Id=".$geo;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
$country=$arr[0];
$query="select Id from Areas where AddByDefault like '%$".$country."$%'";
$rs = $pdo->prepare($query);
$rs->execute();
$res=$rs->fetchAll(PDO::FETCH_NUM);
if (count($res)==0)
	{
	$query="insert into Areas (Name,AddByDefault) values (:country,:add)";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':country',$country);
	$rs->bindValue(':add','$'.$country.'$;');
	$rs->execute();
	}

$query="select Id from Areas where AddByDefault like '%$".$country."$%'";
$rs = $pdo->prepare($query);
$rs->execute();
$res=$rs->fetchAll(PDO::FETCH_NUM);
foreach ($res as $arr);
	{
	$idArea=$arr[0];
	$queryArea="select Elements from Areas where Id=".$idArea;
	/*$rsArea=mysql_query($queryArea);
	$arrArea=mysql_fetch_array($rsArea,MYSQL_NUM);*/
	$rsArea = $pdo->prepare($queryArea);
	$rsArea->execute();
	$arrArea=$rsArea->fetch(PDO::FETCH_NUM);
	if (strpos($arrArea[0],'$'.$geo.'$')===false)
		{
		$queryArea="update Areas set Elements='".$arrArea[0].'$'.$geo.'$;'."' where Id=".$idArea;
		//mysql_query($queryArea);
		$rsArea = $pdo->prepare($queryArea);
		$rsArea->execute();
		//elementAddedArea($geo,$idArea);
		}
	}
}

//no le veo sentido
function elementAddedArea($geo,$area)
//for checking recursively areas to be updated from the area where the element has been added
{
global $pdo;
$query="select Id from Areas where AddByDefault like '%$".$area."$%'";
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*while ($arr=mysql_fetch_array($rs,MYSQL_NUM))*/while($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	$idArea=$arr[0];
	$queryArea="select Elements from Areas where Id=".$idArea;
	/*$rsArea=mysql_query($queryArea);
	$arrArea=mysql_fetch_array($rsArea,MYSQL_NUM);*/
	$rsArea = $pdo->prepare($queryArea);
	$rsArea->execute();
	$arrArea=$rsArea->fetch(PDO::FETCH_NUM);
	if (strpos($arrArea[0],'$'.$geo.'$')===false)
		{
		$queryArea="update Areas set Elements='".$arrArea[0].'$'.$geo.'$;'."' where Id=".$idArea;
		//mysql_query($queryArea);
		$rsArea = $pdo->prepare($queryArea);
		$rsArea->execute();
		elementAddedArea($geo,$idArea);
		}
	}

}


?>