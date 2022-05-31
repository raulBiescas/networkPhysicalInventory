<?php

/*!
 * configNetwork.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 configNetwork.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */
$roomTypes=array('general','parking','kitchen','meetingRoom','power','pumps','splicing','toilets','workoffice','warehouse');
$vertTypes=array('elevator','stairs');
		
$condicionEstados=" and System!='DEPRECATED' AND System!='REMOVED'";

$arrSite=array();
$arrGeo=array();
$arrFloor=array();
$arrRoom=array();
$arrRack=array();
$arrEqChassis=array();
$arrPanel=array();
$arrEq=array();
$arrCircuit=array();
$rotacion=false;
$parentRoom=array();
$proporcion=0;
$plantax=0;
$plantay=0;
$sizeWE=0;
$sizeNS=0;
$rotacionRoomfalse;
$plantaRoomx=0;
$plantaRoomy=0;

$google=1;

if (!array_key_exists('idArea',$_SESSION))
	{
	if (array_key_exists('idArea',$_COOKIE))
		{
		$_SESSION['idArea']=$_COOKIE['idArea'];
		}
	else
		{
		$_SESSION['idArea']=5;//world
		}
	}

function networkArrays($tabla,$id)
{
global $pdo;
global $arrSite;
global $arrGeo;
global $arrFloor;
global $arrRoom;
global $arrRack;
global $arrPanel;
global $arrEq;
global $arrCircuit;
global $rotacion;
global $proporcion;
global $plantax;
global $plantay;
global $sizeWE;
global $sizeNS;
global $rotacionRoom;
global $plantaRoomx;
global $plantaRoomy;
switch($tabla)
	{
	
	case 'Circuits':
		$query="select c.Id, r.Reference,c.Customer from Circuits c inner join `References` r on r.Tabla='Circuits' and r.IdTabla=c.Id where c.Id=".$id;
		$rs = $pdo->prepare($query);
		$rs->execute();
		$arrCircuit=$rs->fetch(PDO::FETCH_NUM);
		/*if ($rs=mysql_query($query))
			{
			//$arrCircuit=mysql_fetch_array($rs,MYSQL_NUM);
			}*/
		break;
	
	case 'EqChassis':
		$query="select Id, Name,Rack, RMU,System from EqChassis where Id=".$id;
		$rs = $pdo->prepare($query);
		$rs->execute();
		$arrEq=$rs->fetch(PDO::FETCH_NUM);
		networkArrays('Racks',$arrEq[2]);
		/*if ($rs=mysql_query($query))
			{
			//$arrEq=mysql_fetch_array($rs,MYSQL_NUM);
			networkArrays('Racks',$arrEq[2]);
			}*/
		break;
		
	case 'Panels':
		$query="select Id, Name, Rack,Connector,System, RMU,Ports from Panels where Id=".$id;
		$rs = $pdo->prepare($query);
		$rs->execute();
		$arrPanel=$rs->fetch(PDO::FETCH_NUM);
		networkArrays('Racks',$arrPanel[2]);
		/*if ($rs=mysql_query($query))
			{
			$arrPanel=mysql_fetch_array($rs,MYSQL_NUM);
			//networkArrays('Racks',$arrPanel[2]);
			}*/
		break;	
	case 'Racks':
		$query="select Id, Name, Room, System from Racks where Id=".$id;
		$rs = $pdo->prepare($query);
		$rs->execute();
		$arrRack=$rs->fetch(PDO::FETCH_NUM);
		networkArrays('Rooms',$arrRack[2]);
		/*if ($rs=mysql_query($query))
			{
			$arrRack=mysql_fetch_array($rs,MYSQL_NUM);
			networkArrays('Rooms',$arrRack[2]);
			}*/
		break;
	case 'Rooms':
		$query="select Id, Name, SystemName, XSize, YSize, TileSize,Floor,System,TilesCoding,XPos,YPos from Rooms where Id=".$id;
		/*if ($rs=mysql_query($query))
			{
			$arrRoom=mysql_fetch_array($rs,MYSQL_NUM);*/
			$rs = $pdo->prepare($query);
			$rs->execute();
			$arrRoom=$rs->fetch(PDO::FETCH_NUM);
			$x=$arrRoom[3]*1;
			$y=$arrRoom[4]*1;

			if ($x>=$y)
				{
				$rotacionRoom='false';
				$plantaRoomx=$x;
				$plantaRoomy=$y;
				}
			else
				{
				$rotacionRoom='true';
				$plantaRoomx=$y;
				$plantaRoomy=$x;
				}
			networkArrays('Floors',$arrRoom[6]);
			//}
		break;
	case 'Floors':
		$query="select Id,Name, SystemName, Site from Floors where Id=".$id;
		/*if ($rs=mysql_query($query))
			{
			$arrFloor=mysql_fetch_array($rs,MYSQL_NUM);*/
			$rs = $pdo->prepare($query);
			$rs->execute();
			$arrFloor=$rs->fetch(PDO::FETCH_NUM);
			networkArrays('Sites',$arrFloor[3]);
			//}
		break;
	case 'Sites':
	$query="select Id, Name, Country, City, Address, PostalCode, Geo from Sites where Id=".$id;
	/*if ($rs=mysql_query($query))
		{
		$arrSite=mysql_fetch_array($rs,MYSQL_NUM);*/
		$rs = $pdo->prepare($query);
		$rs->execute();
		$arrSite=$rs->fetch(PDO::FETCH_NUM);
		$query="select Info, Length, Ysize, NorthAngle from GeoElements where Id=".$arrSite[6];
		//$rs=mysql_query($query);
		$rs = $pdo->prepare($query);
		$rs->execute();
		//$arrGeo=mysql_fetch_array($rs,MYSQL_NUM);
		$arrGeo=$rs->fetch(PDO::FETCH_NUM);
		$sizeWE=$arrGeo[1]*1;
		$sizeNS=$arrGeo[2]*1;

		if ($sizeWE>0 && $sizeNS>0)
			{
			if ($sizeWE>=$sizeNS)
				{
				$rotacion='false';
				$proporcion=$sizeNS/$sizeWE;
				$plantax=$sizeWE;
				$plantay=$sizeNS;
				}
			else
				{
				$rotacion='true';
				$proporcion=$sizeWE/$sizeNS;
				$plantax=$sizeNS;
				$plantay=$sizeWE;
				}
			}
		//}
	break;
	case 'PowerSupplies':
		$query="select NetworkPath from `".$tabla."` where Id=".$id;
		//$rs=mysql_query($query);
		$rs = $pdo->prepare($query);
		$rs->execute();
		/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
		$ruta=$arr[0];
		$ruta=str_replace('##','#',$ruta);
		$ruta=substr($ruta,1,-1);
		$valores=explode('#',$ruta);
		$ultimo=$valores[count($valores)-1];
		$valores=explode('=',$ultimo);
		$tabla2=$valores[0];
		$id2=$valores[1];
		networkArrays($tabla2,$id2);
		break;
	
	default:
		$query="select IdContainer,Container from `".$tabla."` where Id=".$id;
		//$rs=mysql_query($query);
		$rs = $pdo->prepare($query);
		$rs->execute();
		/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
		if ($arr[1]=='Rack')
			{
			$tabla2='Racks';
			$id2=$arr[0];
			}
		else//box
			{
			$query="select NetworkPath from `Boxes` where Id=".$arr[0];
			//$rs=mysql_query($query);
			$rs = $pdo->prepare($query);
			$rs->execute();
			/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
			$ruta=$arr[0];
			$ruta=str_replace('##','#',$ruta);
			$ruta=substr($ruta,1,-1);
			$valores=explode('#',$ruta);
			$ultimo=$valores[count($valores)-1];
			$valores=explode('=',$ultimo);
			$tabla2=$valores[0];
			$id2=$valores[1];
			}
		networkArrays($tabla2,$id2);
		break;
	}
}



function tituloNetwork()
{
global $linkBase;
return '<div class="bloqueTituloNetwork elementInside"><a href="'.$linkBase.'index.php">Network</a></div>';
}

function tituloSite()
{
global $arrSite;
$titulo='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$titulo.='<div class="botonSiteCoverage boton conTip" title="site coverage" tabla="Sites" idTabla="'.$arrSite[0].'"></div>';
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrSite,'site.php').'</div>';
$titulo.='<div class="botonDetallesZoom boton conTip" title="show site in map" tabla="Sites" idTabla="'.$arrSite[0].'" resaltar="0"></div>';
return $titulo;
}
function tituloFloor()
{
global $arrFloor;
global $arrRoom;
$roomMarcar=0;
if (count($arrRoom)>0)
	{
	$roomMarcar=$arrRoom[0];
	}
$titulo='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrFloor,'floor.php').'</div>';
$titulo.='<div class="botonDetallesZoom boton conTip" title="show floor" tabla="Floors" idTabla="'.$arrFloor[0].'" resaltar="'.$roomMarcar.'"></div>';
return $titulo;
}

function tituloRoom()
{
global $pdo;
global $arrRoom;
global $arrRack;
global $arrParentRoom;
$rackMarcar=0;
if (count($arrRack)>0)
	{
	$rackMarcar=$arrRack[0];
	}
$titulo='';
$frabs=explode('.',$arrRoom[2]);
if (count($frabs)==4)
	{
	if ($frabs[3]!='')
		{
		$query="select Id,Name,SystemName from Rooms where SystemName='".$frabs[0].'.'.$frabs[1].'.'.$frabs[2]."'";
		//$rs=mysql_query($query);
		$rs = $pdo->prepare($query);
		$rs->execute();
		//if ($arrParentRoom=mysql_fetch_array($rs,MYSQL_NUM))
		if ($arrParentRoom=$rs->fetch(PDO::FETCH_NUM))
			{
			$titulo.='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
			$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrParentRoom,'room.php').'</div>';
			$titulo.='<div class="botonDetallesZoom boton conTip" title="show room" tabla="Rooms" idTabla="'.$arrParentRoom[0].'" resaltar="'.$rackMarcar.'"></div>';
			}
		}
	}
	
$titulo.='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrRoom,'room.php').'</div>';
$titulo.='<div class="botonDetallesZoom boton conTip" title="show room" tabla="Rooms" idTabla="'.$arrRoom[0].'" resaltar="'.$rackMarcar.'"></div>';
return $titulo;
}

function tituloRack()
{
global $arrRack;
global $arrEq;
global $arrPanel;
$uMarcar=0;
if (count($arrEq)>0)
	{
	$uMarcar=$arrEq[3];
	}
if (count($arrPanel)>0)
	{
	$uMarcar=$arrPanel[5];
	}

$titulo='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrRack,'rack.php').'</div>';
$titulo.='<div class="botonDetallesZoom boton conTip" title="show rack" tabla="Racks" idTabla="'.$arrRack[0].'" resaltar="'.$uMarcar.'"></div>';
return $titulo;
}

function tituloPanel()
{
global $arrPanel;
$titulo='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrPanel,'panel.php').'</div>';
return $titulo;
}

function tituloEq()
{
global $arrEq;
$titulo='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrEq,'equipment.php').'</div>';
return $titulo;
}

function tituloGenerico($tabla,$id,$campo,$pagina)
{
global $pdo;
$query="select Id,`".$campo."` from `".$tabla."` where Id=".$id;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
$titulo='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arr,$pagina).'</div>';
return $titulo;
}

function tituloCircuit()
{
global $arrCircuit;
$titulo='<div class="bloqueTituloNetwork networkTitleSeparation">&gt;&gt;</div>';
$arrCircuitMod=array($arrCircuit[0],$arrCircuit[1].' ('.$arrCircuit[2].')');
$titulo.='<div class="bloqueTituloNetwork elementInside">'.linkFromArray($arrCircuitMod,'circuit.php').'</div>';
return $titulo;
}

function variablesJavascript()
{
global $arrSite;
global $arrGeo;
global $arrFloor;
global $arrRoom;
global $arrRack;
global $arrPanel;
global $arrEq;
echo '<script>var thisTable="";var thisId=0;var idArea="'.$_SESSION['idArea'].'";';
if (count($arrSite)>0)
	{
	echo 'var siteName="'.$arrSite[1].'";var siteBase='.$arrSite[0].';var geoBase="'.$arrGeo[0].'";thisTable="Sites";thisId=siteBase;';
	}
if (count($arrFloor)>0)
	{
	echo 'var thisSite="'.$arrFloor[3].'";var floorBase='.$arrFloor[0].';thisTable="Floors";thisId=floorBase;';
	}
if (count($arrRoom)>0)
	{
	if (strpos($arrRoom[8],"'")===false)
		{echo "var tilesCoding='".$arrRoom[8]."';var roomBase=".$arrRoom[0].";thisTable='Rooms';";}
	else
		{echo 'var tilesCoding="'.$arrRoom[8].'";var roomBase='.$arrRoom[0].';thisTable="Rooms";';}
	echo 'thisId=roomBase;var thisRoomX='.$arrRoom[9].';var thisRoomY='.$arrRoom[10].';var thisRoomXsize='.$arrRoom[3].';var thisRoomYsize='.$arrRoom[4].';';
	}
if (count($arrRack)>0)
	{
	echo 'var idRack='.$arrRack[0].';var thisRack='.$arrRack[0].';var rackBase='.$arrRack[0].';thisTable="Racks";thisId=rackBase;';
	}
if (count($arrPanel)>0)
	{
	echo "var panelBase=".$arrPanel[0].";thisTable='Panels';thisId=panelBase;";
	}
if (count($arrEq)>0)
	{
	echo "var eqBase=".$arrEq[0].";thisTable='EqChassis';thisId=eqBase;";
	}

	
echo '</script>';
}

function threeRingsLogin($action)
{
global $pdo;
global $relativePath;
global $networkLibrary;
global $libraryPath;
global $id;
global $titulo;
$css=array("../network.css");
$scripts=array();

include '../phpLib/head.php';
echo '
<div id="content">
<div id="mainArea" style="padding:30px;">

<div id="formArea">

<form METHOD="POST" class="mainForm" ACTION="'.$action.'">

<fieldset> 
<legend>Login</legend>
<br/> 
<div class="lineaInputs">
<label for="email">Email</label>
<div class="grupoInputs"><input type="text" name="email" id="email" /></div>
<div class="clear"></div>
</div>
<br/>
<div class="lineaInputs">
<label for="defaultCountry">Default Area:</label>
<div class="grupoInputs">';

echo '<select name="defaultArea">';

$query="select distinct(Name) from Network.Areas order by Name";
$rs = $pdo->prepare($query);
$rs->execute();
$areas=$rs->fetchAll(PDO::FETCH_NUM);
foreach($areas as $arr)
{
	$nombres[]=$arr[0];
}

echo selectFromArray($nombres,$default);

echo '</select></div>';

echo '<div class="clear"></div>
</div>
<br/>
<input type="submit" id="botonAcceso" value="GO" class="submit"></button>

</fieldset> 

</form> 

</div>

</div>
</div>';


}


?>