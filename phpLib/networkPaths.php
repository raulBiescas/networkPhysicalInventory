<?php

/*!
 * networkPaths.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 networkPaths.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

function elementSingleDescriptor($table,$id)
{
//improve for efficiency
$elTotal=elementDescriptor($table,$id);
$elements=explode('<div',$elTotal);
return '<div'.$elements[count($elements)-2];

}


function elementDescriptor($tabla,$id)
{
global $rutasNetwork;
global $camposNombresNetwork;
global $innersNetwork;
global $linksNetwork;
global $linkBase;
global $pdo;
$tablaOrigen=$tabla;
$idOrigen=$id;
$addElement=false;
$resultado='';
if ($tabla=='OffnetPorts')
	{
	$query="select NetworkRoute, Name,Owner from OffnetPorts where Id=".$id;
	$rs = $pdo->prepare($query);
	$rs->execute();
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	
	$addElement=true;
	
	$elementToAdd= '<div class="filaDescriptorRed descriptor'.$tabla.'" tabla="'.$tabla.'" idTabla="'.$id.'">';
	$elementToAdd.= '<span class="descriptorRedPrimario">'.htmlentities($arr[1],ENT_QUOTES, "UTF-8").'</span>';
	$elementToAdd.= '<span class="descriptorRedSecundario">('.htmlentities($arr[2],ENT_QUOTES, "UTF-8").')</span>';
	$elementToAdd.= '</div>';
	$ruta=$arr[0];
	$ruta=str_replace('##','#',$ruta);
	$ruta=substr($ruta,1,-1);
	$valores=explode('#',$ruta);
	$ultimo=$valores[count($valores)-1];
	$valores=explode('=',$ultimo);
	$tabla=$valores[0];
	$id=$valores[1];
	
	}
	
if ($tabla=='PowerPorts')
	{
	$query="select `Tabla`, `IdTabla`, `Name`,`Order` from PowerPorts where Id=".$id;
	$rs = $pdo->prepare($query);
	$rs->execute();
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	
	$addElement=true;
	
	$elementToAdd= '<div class="filaDescriptorRed descriptor'.$tabla.'" tabla="'.$tabla.'" idTabla="'.$id.'">';
	$elementToAdd.= '<span class="descriptorRedPrimario">'.htmlentities($arr[2],ENT_QUOTES, "UTF-8").'</span>';
	$elementToAdd.= '<span class="descriptorRedSecundario">('.htmlentities($arr[3],ENT_QUOTES, "UTF-8").')</span>';
	$elementToAdd.= '</div>';
	$tabla=$arr[0];
	$id=$arr[1];
	
	}

if ($tabla=='PDFs')
	{
	$addElement=true;
	$elementToAdd=elementDescriptorBase($tabla,$id);
	$query="select IdContainer,Container from `".$tabla."` where Id=".$id;
	$rs = $pdo->prepare($query);
	$rs->execute();
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	if ($arr[1]=='Rack')
		{
		$tabla='Racks';
		$id=$arr[0];
		}
	else//box
		{
		$query="select NetworkPath from `Boxes` where Id=".$arr[0];
		$rs = $pdo->prepare($query);
		$rs->execute();
		$arr=$rs->fetch(PDO::FETCH_NUM);
		$rs->closeCursor();
		$ruta=$arr[0];
		$ruta=str_replace('##','#',$ruta);
		$ruta=substr($ruta,1,-1);
		$valores=explode('#',$ruta);
		$ultimo=$valores[count($valores)-1];
		$valores=explode('=',$ultimo);
		$tabla=$valores[0];
		$id=$valores[1];
		}
	}
	
$numRuta=-1;
$posRuta=-1;

$i=0;
foreach ($rutasNetwork as $ruta)
	{
	if ($numRuta==-1)
		{
		if (array_search($tabla,$ruta)!==FALSE)
			{
			$posRuta=array_search($tabla,$ruta);
			$numRuta=$i;
			}
		}
	$i++;
	}	
if ($numRuta!=-1)
	{
	$rutaValida=$rutasNetwork[$numRuta];	
	$i=0;
	$campos="select ";
	$inner=" from ";
	while ($i<($posRuta+1))
		{
		$tablaActual=$rutaValida[$i];
		$campos.=' '.$tablaActual.'.Id, '.$tablaActual.'.`'.$camposNombresNetwork[$tablaActual][0].'`, '.$tablaActual.'.`'.$camposNombresNetwork[$tablaActual][1].'`,';
		if ($i==0)
			{
			$inner.=$tablaActual.' ';
			}
		else
			{
			$inner.=' inner join '.$tablaActual.' on '.$tablaActual.'.`'.$innersNetwork[$tablaActual].'`='.$rutaValida[$i-1].'.Id ';
			}
		$i++;
		}

	$query=substr($campos,0,-1).$inner.'where '.$tabla.'.Id='.$id;
	$rs = $pdo->prepare($query);
	$rs->execute();
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	if ($arr)
		{
		$resultado.= '<div class="descriptorRed" tabla="'.$tablaOrigen.'" idTabla="'.$idOrigen.'">';
		$i=0;
		while ($i<($posRuta+1))
			{
			$tablaActual=$rutaValida[$i];
			$extra='';
			$defaultLabel='';
			if ($tablaActual=='Panels' || $tablaActual=='EqChassis')
				{
				$queryU="select RMU from ".$tablaActual." where Id=".$arr[3*$i];
				$rsU = $pdo->prepare($queryU);
				$rsU->execute();
				$arrU=$rsU->fetch(PDO::FETCH_NUM);
				$rsU->closeCursor();
				$extra=' RMU="'.$arrU[0].'" ';
				$queryLabel="select `Reference` from `".$tablaActual."References` where Tabla='".$tablaActual."' and IdTabla=".$arr[3*$i]." and Type='LABEL'";
				$rsU = $pdo->prepare($queryLabel);
				$rsU->execute();
				$arrU=$rsU->fetch(PDO::FETCH_NUM);
				$rsU->closeCursor();
				if ($arrU)
					{
					$defaultLabel=' defaultLabel="'.$arrU[0].'" ';
					}
				}

			$resultado.= '<div class="filaDescriptorRed descriptor'.$tablaActual.'" tabla="'.$tablaActual.'" idTabla="'.$arr[3*$i].'" '.$extra.$defaultLabel.'>';
			if ($linksNetwork[$tablaActual]!='')
				{$resultado.= '<a href="'.$linkBase.$linksNetwork[$tablaActual].'?id='.$arr[3*$i].'">';}
			$resultado.= '<span class="descriptorRedPrimario">'.htmlentities($arr[(3*$i)+1],ENT_QUOTES, "UTF-8").'</span>';
			$resultado.= '<span class="descriptorRedSecundario">('.htmlentities($arr[(3*$i)+2],ENT_QUOTES, "UTF-8").')</span>';
			if ($linksNetwork[$tablaActual]!='')
				{$resultado.= '</a>';}
			$resultado.= '</div>';
			$i++;
			}
		if ($addElement)
			{
			$resultado.= $elementToAdd;
			}
		$resultado.= '<div class="clear"></div></div>';
		}
	}
return $resultado;
}

function elementDescriptorBase($tabla,$id)
{
global $pdo;
switch ($tabla)
	{
	case 'PDFs':
		$query="select Id, Name,SystemName from PDFs where Id=".$id;
		break;
	}
$rs = $pdo->prepare($query);
$rs->execute();
$arr=$rs->fetch(PDO::FETCH_NUM);
$rs->closeCursor();
	
$elementToAdd= '<div class="filaDescriptorRed descriptor'.$tabla.'" tabla="'.$tabla.'" idTabla="'.$id.'">';
$elementToAdd.= '<span class="descriptorRedPrimario">'.htmlentities($arr[1],ENT_QUOTES, "UTF-8").'</span>';
$elementToAdd.= '<span class="descriptorRedSecundario">('.htmlentities($arr[2],ENT_QUOTES, "UTF-8").')</span>';
$elementToAdd.= '</div>';
return $elementToAdd;
}

function getPathArray($path)
{
$path=substr($path,1,-1);
$path=str_replace('##','#',$path);
$valores=explode('#',$path);
$result=array();
foreach($valores as $valor)
	{
	$val=explode('=',$valor);
	$result[]=$val[1];
	}
return $result;
}


function getNetworkFullPath($tabla,$id)
{
global $pdo;
//if ( mysql_num_rows(mysql_query("SHOW COLUMNS FROM `".$tabla."` LIKE 'Site' ")) == 1 )
$query="SHOW COLUMNS FROM `".$tabla."` LIKE 'Site' ";
$rs = $pdo->prepare($query);
$rs->execute();
$sentence='';
if ($rs->rowCount()==1)
	{
	$consultaInicial="select 'Sites',s.Id,'".$tabla."',t.Id from Sites s inner join `".$tabla."` t on t.Site=s.Id where t.Id=".$id;
	}
else
	{
	//if ( mysql_num_rows(mysql_query("SHOW COLUMNS FROM `".$tabla."` LIKE 'Floor' ")) == 1 )
	$query="SHOW COLUMNS FROM `".$tabla."` LIKE 'Floor' ";
	$rs = $pdo->prepare($query);
	$rs->execute();
	if ($rs->rowCount()==1)
		{
		$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'".$tabla."',t.Id from Sites s inner join Floors f on s.Id=f.Site inner join `".$tabla."` t on t.Floor=f.Id where t.Id=".$id;
		}
	else
		{
		switch($tabla)
			{
			case 'Sites':
				$consultaInicial="select 'Sites',Id from Sites where Id=".$id;
				break;
			case 'Floors':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id from Sites s inner join Floors f on s.Id=f.Site where f.Id=".$id;
				break;
			case 'Rooms':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'Rooms',r.Id from Sites s inner join Floors f on s.Id=f.Site inner join Rooms r on r.Floor=f.Id where r.Id=".$id;
				break;
			case 'Racks':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'Rooms',r.Id,'Racks',a.Id from Sites s inner join Floors f on s.Id=f.Site inner join Rooms r on r.Floor=f.Id inner join Racks a on a.Room=r.Id where a.Id=".$id;
				break;
			case 'Panels':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'Rooms',r.Id,'Racks',a.Id,'Panels',p.Id from Sites s inner join Floors f on s.Id=f.Site inner join Rooms r on r.Floor=f.Id inner join Racks a on a.Room=r.Id inner join Panels p on p.Rack=a.Id where p.Id=".$id;
				break;
			case 'PanelPorts':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'Rooms',r.Id,'Racks',a.Id,'Panels',p.Id,'PanelPorts',pp.Id from Sites s inner join Floors f on s.Id=f.Site inner join Rooms r on r.Floor=f.Id inner join Racks a on a.Room=r.Id inner join Panels p on p.Rack=a.Id inner join PanelPorts pp on pp.Panel=p.Id where pp.Id=".$id;
				break;
			case 'EqChassis':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'Rooms',r.Id,'Racks',a.Id,'EqChassis',e.Id from Sites s inner join Floors f on s.Id=f.Site inner join Rooms r on r.Floor=f.Id inner join Racks a on a.Room=r.Id inner join EqChassis e on e.Rack=a.Id where e.Id=".$id;
				break;
			case 'Cards':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'Rooms',r.Id,'Racks',a.Id,'EqChassis',e.Id,'Cards',c.Id from Sites s inner join Floors f on s.Id=f.Site inner join Rooms r on r.Floor=f.Id inner join Racks a on a.Room=r.Id inner join EqChassis e on e.Rack=a.Id inner join Cards c on c.Equipment=e.Id where c.Id=".$id;
				break;
			case 'EqPorts':
				$consultaInicial="select 'Sites',s.Id,'Floors',f.Id,'Rooms',r.Id,'Racks',a.Id,'EqChassis',e.Id,'Cards',c.Id,'EqPorts',ep.Id from Sites s inner join Floors f on s.Id=f.Site inner join Rooms r on r.Floor=f.Id inner join Racks a on a.Room=r.Id inner join EqChassis e on e.Rack=a.Id inner join Cards c on c.Equipment=e.Id inner join EqPorts ep on ep.Card=c.Id where ep.Id=".$id;
				break;
			default:
				/*$query="select IdContainer,Container from `".$tabla."` where Id=".$id;
				$rs = $pdo->prepare($query);
				$rs->execute();
				$arr=$rs->fetch(PDO::FETCH_NUM);
				if ($arr[1]=='Rack')
					{
					$tabla2='Racks';
					$id2=$arr[0];
					}
				else//box
					{*/
					
					$query="select Box from `".$tabla."` where Id=".$id;
					$rs = $pdo->prepare($query);
					$rs->execute();
					$arr=$rs->fetch(PDO::FETCH_NUM);
					
					
					$query="select NetworkPath from `Boxes` where Id=".$arr[0];
					//$rs=mysql_query($query);
					$rs = $pdo->prepare($query);
					$rs->execute();
					/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/
					$arr=$rs->fetch(PDO::FETCH_NUM);
					$ruta=$arr[0];
					/*$ruta=str_replace('##','#',$ruta);
					$ruta=substr($ruta,1,-1);
					$valores=explode('#',$ruta);
					$ultimo=$valores[count($valores)-1];
					$valores=explode('=',$ultimo);
					$tabla2=$valores[0];
					$id2=$valores[1];
					//}
				$sentence=getNetworkFullPath($tabla2,$id2).'#'.$tabla.'='.$id.'#';*/
				$sentence=$ruta.'#'.$tabla.'='.$id.'#';
			}
		}
	}

if (isset($consultaInicial)) 
	{
	//$rs=mysql_query($consultaInicial);
	$rs = $pdo->prepare($consultaInicial);
	$rs->execute();
	if($arr=$rs->fetch(PDO::FETCH_NUM))
	//if ($arr=mysql_fetch_array($rs,MYSQL_NUM))
		{
		$sentence='';
		$i=0;
		while ($i<count($arr))
			{
			$sentence.='#'.$arr[$i++].'=';
			$sentence.=$arr[$i++].'#';
			}
		}
	}
return $sentence;
}

function getRuta($tabla,$id)
{
global $pdo;
$arr=array();
switch ($tabla)
	{
	case 'Sites':
	$query="select s.Country, s.Name  from `Sites` s where s.Id=:id";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id,PDO::PARAM_INT);
	$rs->execute(); 
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	break;
	case 'Floors':
	$query="select s.Country, s.Name, f.Name  from `Sites` s inner join Floors f on f.Site=s.Id where f.Id=:id";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id,PDO::PARAM_INT);
	$rs->execute(); 
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	break;
	case 'Rooms':
	$query="select s.Country, s.Name, f.Name,r.Name  from `Sites` s inner join Floors f on f.Site=s.Id inner join Rooms r on r.Floor=f.Id where r.Id=:id";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id,PDO::PARAM_INT);
	$rs->execute(); 
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	break;
	case 'Racks':
	$query="select s.Country, s.Name, f.Name,r.Name,k.Name  from `Sites` s inner join Floors f on f.Site=s.Id inner join Rooms r on r.Floor=f.Id inner join Racks k on k.Room=r.Id where k.Id=:id";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id,PDO::PARAM_INT);
	$rs->execute(); 
	$arr=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	break;
	case 'CriticalInfra':
	$query="select a.PMCategory, c.Name, b.Tabla, b.IdTabla from CriticalInfra c inner join NetworkTools.PMAssetsType a on a.Id=c.`Type` inner join Boxes b on b.Id=c.Box where c.Id=:id";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id,PDO::PARAM_INT);
	$rs->execute(); 
	$arr2=$rs->fetch(PDO::FETCH_NUM);
	$rs->closeCursor();
	$newId=array_pop($arr2);
	$newTable=array_pop($arr2);
	$arr1=getRuta($newTable,$newId);
	array_shift($arr1);
	$arr=array_merge($arr1,$arr2);
	break;
	case 'Circuits':
		array_unshift($arr,'Circuits');
	break;
	}

array_unshift($arr,'network');
return $arr;
}

?>