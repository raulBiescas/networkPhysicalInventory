<?php

/*!
 * evolucion.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 evolucion.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

include_once '../phpLib/condicionesNetwork.php';
include_once '../phpLib/networkPaths.php';
include_once '../phpLib/database.php';


//si no se quiere guardar, $_GET['evolucion']=0
function guardarEvolucion($tipo, $tabla, $id,$extra='')
{
global $pdo;
$evolucion=true;
if (array_key_exists('evolucion',$_GET))
	{
	if ($_GET['evolucion']=='0')
		{
		$evolucion=false;
		}
	}
if ($evolucion)
	{
	$weight=1;
	switch ($tabla)
		{
		case "OffnetPorts":
			$query="select NetworkRoute, CableTypeIn, CableTypeOut from OffnetPorts where Id=:id";
			$rs = $pdo->prepare($query);
			$rs->bindValue(':id',$id,PDO::PARAM_INT);
			$rs->execute();
			$arr=$rs->fetch(PDO::FETCH_NUM);
			$descriptor=$arr[0];
			$weight=0.25;
			if (strpos($arr[1],'UTP')!==FALSE || strpos($arr[2],'UTP')!==FALSE )
				{
				$weight=0.5;
				}
			break;
		case "PanelPorts":
			$query="select `Connector` from `PanelPorts` where Id=:id";
			$rs = $pdo->prepare($query);
			$rs->bindValue(':id',$id,PDO::PARAM_INT);
			$rs->execute();
			$arr=$rs->fetch(PDO::FETCH_NUM);
			$weight=0.25;
			if (strpos($arr[0],'UTP')!==FALSE)
				{
				$weight=0.5;
				}
			$descriptor=getNetworkFullPath($tabla,$id);
			break;
		case "EqPorts":
			$query="select `CableTypeDest` from EqPorts where Id=:id";
			$rs = $pdo->prepare($query);
			$rs->bindValue(':id',$id,PDO::PARAM_INT);
			$rs->execute();
			$arr=$rs->fetch(PDO::FETCH_NUM);
			$weight=0.25;
			if (strpos($arr[0],'UTP')!==FALSE)
				{
				$weight=0.5;
				}
			$descriptor=getNetworkFullPath($tabla,$id);
			break;
		case "Risers":
			$query="select `From`,`To` from Risers where Id=".$id;
			//$rs=mysql_query($query);
			$rs = $pdo->prepare($query);
			$rs->execute();
			/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
			$descriptor=$arr[0];
			$weight=0.5;
			$path=getPathArray($descriptor);
			$site=$path[0];
			$query="insert into Evolution (Evolution,Tabla,IdTabla,Related,Site,Weight) values (:tipo,:tabla,:id,:descriptor,:site,:weight)";
			$rs = $pdo->prepare($query);
			$rs->bindValue(':tipo',$tipo);
			$rs->bindValue(':tabla',$tabla);
			$rs->bindValue(':descriptor',$descriptor);
			$rs->bindValue(':site',$site);
			$rs->bindValue(':weight',$weight);
			$rs->bindValue(':id',$id,PDO::PARAM_INT);
			$rs->execute();
			$descriptor=$arr[1];
			break;
		default:
			$descriptor=getNetworkFullPath($tabla,$id);
			break;
		}
	$path=getPathArray($descriptor);
	$site=$path[0];
	$descriptor.=$extra;
	$query="insert into Evolution (Evolution,Tabla,IdTabla,Related,Site,Weight) values (:tipo,:tabla,:id,:descriptor,:site,:weight)";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':tipo',$tipo);
	$rs->bindValue(':tabla',$tabla);
	$rs->bindValue(':descriptor',$descriptor);
	$rs->bindValue(':site',$site);
	$rs->bindValue(':weight',$weight);
	$rs->bindValue(':id',$id,PDO::PARAM_INT);
	$rs->execute();
	}

	
}




?>