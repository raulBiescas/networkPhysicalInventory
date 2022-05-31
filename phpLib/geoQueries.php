<?php

/*!
 * geoQueries.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 geoQueries.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

function consultaEquipments($tabla,$id,$inner='',$conditions='')
{
$condicionTabla='('.$tabla.".Id=".$id.')';
if (strpos($id,',')!==false)
	{
	$valores=explode(',',$id);
	$condicionTabla='(0)';
	foreach ($valores as $valor)
		{$condicionTabla=substr($condicionTabla,0,-1).' OR '.$tabla.'.Id='.$valor.' )';}
	}
$condicionEstados=" and EqChassis.System!='DEPRECATED' AND EqChassis.System!='REMOVED'";
$query="select distinct EqChassis.Id, EqChassis.Vendor , EqChassis.Name, EqChassis.Model, EqChassis.Category, EqChassis.TID,EqChassis.Rack,EqChassis.FrontDirection from  EqChassis inner join Racks on Racks.Id=EqChassis.Rack inner join Rooms on Rooms.Id=Racks.Room inner join Floors on Floors.Id=Rooms.Floor inner join Sites on Floors.Site=Sites.Id ".$inner." where ".$condicionTabla.$condicionEstados.$conditions." order by EqChassis.Category, EqChassis.Vendor, EqChassis.TID" ;
return $query;
}

function getInventoryLevel($site)
{
global $pdo;

$condicionEstados=" and r.System!='DEPRECATED' AND r.System!='REMOVED'";

$res=array(false,false,false);	
$query="select r.Id from `Racks` r inner join `Rooms` ro on r.`Room`=ro.Id inner join Floors f on ro.`Floor`=f.Id where f.`Site`=:site ".$condicionEstados;
$rs = $pdo->prepare($query);
$rs->bindValue(':site',$site);
$rs->execute();
if($rs->fetch(PDO::FETCH_NUM))
	{
	$res[0]=true;
	}

$condicionEstados=" and e.System!='DEPRECATED' AND e.System!='REMOVED'";
	
$query="select e.Id from `EqChassis` e inner join  `Racks` r on e.`Rack`=r.Id inner join `Rooms` ro on r.`Room`=ro.Id inner join Floors f on ro.`Floor`=f.Id where f.`Site`=:site ".$condicionEstados;
$rs = $pdo->prepare($query);
$rs->bindValue(':site',$site);
$rs->execute();
if($rs->fetch(PDO::FETCH_NUM))
	{
	$res[1]=true;
	}

$query="select c.Id from Cards c inner join `EqChassis` e on e.Id=c.Equipment inner join  `Racks` r on e.`Rack`=r.Id inner join `Rooms` ro on r.`Room`=ro.Id inner join Floors f on ro.`Floor`=f.Id where f.`Site`=:site ".$condicionEstados;
$rs = $pdo->prepare($query);
$rs->bindValue(':site',$site);
$rs->execute();
if($rs->fetch(PDO::FETCH_NUM))
	{
	$res[2]=true;
	}
	
return $res;
}

function consultaPanels($tabla,$id,$inner='',$conditions='')
{
$condicionEstados=" and Panels.System!='DEPRECATED' AND Panels.System!='REMOVED'";
$query="select Panels.Id,  Panels.Name, Panels.SystemName, Panels.Ports, Panels.Connector, Panels.FrontDirection from  Panels inner join Racks on Racks.Id=Panels.Rack inner join Rooms on Rooms.Id=Racks.Room inner join Floors on Floors.Id=Rooms.Floor inner join Sites on Floors.Site=Sites.Id ".$inner." where ".$tabla.".Id=".$id.$condicionEstados.$conditions." order by Panels.FrontDirection, Panels.Connector, Panels.RMU" ;
return $query;
}

function roomsSameBuilding($idRoom)
{
global $pdo;
$res=array();
$query="select f.Site from Floors f inner join Rooms r on r.Floor=f.Id where r.Id=".$idRoom;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
$query="select r.Id from Rooms r inner join Floors f on r.Floor=f.Id where f.Site=".$arr[0];
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*while ($arr=mysql_fetch_array($rs,MYSQL_NUM))*/while($arr=$rs->fetch(PDO::FETCH_NUM))
	{$res[]=$arr[0];}
return $res;
}

function tablaSubmapas($nombre,$id)
{
$query="select s.Id,s.XPos, s.YPos, s.XSize, s.YSize, m.Info, m.Name,s.Map from Submaps s inner join Maps m on s.Map=m.Id where s.BaseMap=".$id;
$tipos1=tipoCampos('Submaps');
$tipos2=tipoCampos('Maps');
$tipos=array_merge($tipos1,$tipos2);
echo '<div class="tablaDiv" tabla="Submaps" id="tabla'.$nombre.'">';
tablaDivSoloLineas($nombre,array( 'XPos','YPos','XSize', 'YSize','Info','Name'),$tipos,$query,false,array());
echo '</div>';
}

function tablaSites($idArea,$nombre,$editMode=false,$offnet=false, $filter='')
{
echo '<div class="tablaDiv" tabla="Sites" id="tabla'.$nombre.'">';
$tipos1=tipoCampos('Sites');
$tipos2=tipoCampos('Maps');
$tipos=array_merge($tipos1,$tipos2);
$tipos['AreaName']='varchar(64)';
$tipos['Clase']='varchar(64)';
busquedaRecursivaSites($idArea,$tipos,$nombre,$editMode,$offnet,$filter);
echo '</div>';
}

function tablaCoverage($idArea,$nombre,$editMode=false)
{
global $pdo;
echo '<div class="tablaDiv" tabla="Sites" id="tabla'.$nombre.'">';
$query="select Id,Team,Area from TaskManagement.Teams where Area!=0";
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*while ($arr=mysql_fetch_array($rs,MYSQL_NUM))*/while($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	echo '<div class="oculto fieldOpsTeam" idTabla="'.$arr[0].'" teamName="'.$arr[1].'"></div>';
	$idNuevaArea=$arr[2];
	$tipos1=tipoCampos('Sites');
	$tipos2=tipoCampos('Maps');
	$tipos=array_merge($tipos1,$tipos2);
	$tipos['AreaName']='varchar(64)';
	$tipos['Clase']='varchar(64)';
	busquedaRecursivaSites($idNuevaArea,$tipos,$nombre,$editMode);
	}

echo '</div>';
}

function getTeamCovering($idGeo)
{
global $pdo;
$query="select Id, AddByDefault from Areas where Elements like '%$".$idGeo."$%'";
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
//if ($arr=mysql_fetch_array($rs,MYSQL_NUM))
if ($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	$idArea=$arr[0];
	$fin=false;
	$team='0';
	while (!$fin)
		{
		$query="select Id from TaskManagement.Teams where Area=".$idArea;
		//$rsArea=mysql_query($query);
		$rsArea = $pdo->prepare($query);
		$rsArea->execute();
		//if ($arrArea=mysql_fetch_array($rsArea,MYSQL_NUM))
		if ($arrArea=$rsArea->fetch(PDO::FETCH_NUM))
			{
			$fin=true;
			$team=$arrArea[0];
			}
		else
			{
			$newAreas=explode(';',$arr[1]);
			if (count($newAreas)>0)
				{
				$idArea=str_replace('$','',$newAreas[0]);
				$query="select Id, AddByDefault from Areas where Id='".$idArea."'";
				//$rs=mysql_query($query);
				$rs = $pdo->prepare($query);
				$rs->execute();
				//if (!$arr=mysql_fetch_array($rs,MYSQL_NUM))
				if (!$arr=$rs->fetch(PDO::FETCH_NUM))
					{
					$fin=true;
					}
				}
			else
				{
				$fin=true;
				}
			}
		}
	return $team;
	}
else
	{return '0';}
}

function tablaSpareLocations($idSite,$nombre)
{
global $pdo;
$tipos1=tipoCampos('Sites');
$tipos2=tipoCampos('GeoElements');
$tipos=array_merge($tipos1,$tipos2);
$tipos['Container']='varchar(64)';
$tipos['SiteName']='varchar(64)';
$query="select Geo from Sites where Id=".$idSite;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
$geo=$arr[0];
$query="select Id from Areas where Elements like concat('%$','".$geo."','$%')";
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
$idArea=$arr[0];
$query="select s.Id, l.Name as Container, concat(s.Name,' (',s.SystemName,')') as SiteName,g.Info from Sites s inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%') inner join LogContainers l on l.Site=s.Id where a.Id=".$idArea ." and l.Type='Spares' order by s.Name";
tablaDivSoloLineas($nombre,array( 'Container','Name','Info'),$tipos,$query,false,array());
}


function subidaRecursivaAreas($areaId)
{
global $pdo;
$areas=array();

//changes for v1.0
/*$query="select AddByDefault from `Network`.`Areas` where `Id`=:areaId";
$rs = $pdo->prepare($query);
$rs->bindValue(':areaId',$areaId);
$rs->execute();
if($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	$areaArr=explode(';',str_replace('$','',$arr[0]));
	foreach ($areaArr as $area)
		{
		if ($area*1>0)//better ensure it has only digits
			{
			$areas[]=$area;
			$areas=array_merge($areas,subidaRecursivaAreas($area));
			}
		}
	}
return $areas;*/

$query="select `Parent` from `Network`.`AreasHierarchy` where `Child`=:areaId";
$rs = $pdo->prepare($query);
$rs->bindValue(':areaId',$areaId);
$rs->execute();
while($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	$area=$arr[0];
	$areas[]=$area;
	$areas=array_merge($areas,subidaRecursivaAreas($area));
	}
return $areas;

}

function getAreasFromSite($site)
{

global $pdo;
$areas=array();

//change for v1.0
/*$query="select g.Id from `Network`.Sites s inner join `Network`.GeoElements g on s.Geo=g.Id where s.Id=:site";
$rs = $pdo->prepare($query);
$rs->bindValue(':site',$site);
$rs->execute();
if($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	$query="select Id from `Network`.`Areas` where `Elements` like '".'%$'.$arr[0].'$%'."'";
	$rs = $pdo->prepare($query);
	$rs->execute();
	while($arr=$rs->fetch(PDO::FETCH_NUM))
		{
		$areas[]=$arr[0];
		$areas=array_merge($areas,subidaRecursivaAreas($arr[0]));
		}
	return $areas;
	}*/

$query="select Area from `Network`.`SiteAreas` where `Site`=:site";
$rs = $pdo->prepare($query);
$rs->bindValue(':site',$site);
$rs->execute();
while($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	$areas[]=$arr[0];
	$areas=array_merge($areas,subidaRecursivaAreas($arr[0]));
	}
return $areas;
	
	
}

function busquedaRecursivaSites($idArea,$tipos,$nombre,$editMode=false,$offnet=false,$filter)
{
global $pdo;
if ($offnet)
	{$query="select s.Id,s.Geo,a.Name as `AreaName`, s.Name,s.SystemName,g.Info, GROUP_CONCAT(t.Tag) as Clase  from Sites s inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%') left join Tags t on t.Tabla='Sites' and s.Id=t.IdTabla where s.System='OFFNET' and a.Id=".$idArea ." group by s.Id order by a.Name, s.Name";}
else
	{$query="select s.Id,s.Geo,a.Name as `AreaName`, s.Name,s.SystemName,g.Info, GROUP_CONCAT(t.Tag) as Clase  from Sites s inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%') left join Tags t on t.Tabla='Sites' and s.Id=t.IdTabla where s.System!='OFFNET' and a.Id=".$idArea ." group by s.Id order by a.Name, s.Name";}
if ($filter!='')
	{
	switch ($filter)
		{
		case 'logistic':
			$query="select distinct s.Id,s.Geo,a.Name as `AreaName`, s.Name,s.SystemName,g.Info, GROUP_CONCAT(t.Tag) as Clase  from `Network`.`Sites` s inner join `Network`.`NetworkPaths` p on p.`Site`=s.Id inner join `Network`.`LogContainers` c on c.`NetworkPath`=p.Id inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%') left join Tags t on t.Tabla='Sites' and s.Id=t.IdTabla where  a.Id=".$idArea ." group by s.Id order by a.Name, s.Name";
			break;
		}
	}
tablaDivSoloLineas($nombre,array( 'Geo','AreaName','Name','SystemName','Info'),$tipos,$query,$editMode,array());
$query="select a1.Id from Areas a1 inner join Areas a2 on a1.AddByDefault like concat('%$',a2.Id,'$%') where a2.Id=".$idArea;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*while ($arr=mysql_fetch_array($rs,MYSQL_NUM))*/while($arr=$rs->fetch(PDO::FETCH_NUM))
	 {
	  busquedaRecursivaSites($arr[0],$tipos,$nombre,$editMode,$offnet,$filter);
	 }
}




function sitesListFromArea($area,$offnet=false,$complete=false)
{
global $pdo;
$list=array();
$campos='s.Id';
if ($complete)
	{
	$campos='s.`Id` , s.`Name` ';
	}
if ($offnet)
	{$query="select ".$campos."  from Sites s inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%')  where s.System='OFFNET' and a.Id=:area group by s.Id order by a.Name, s.Name";}
else
	{$query="select ".$campos."  from Sites s inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%')  where s.System!='OFFNET' and a.Id=:area group by s.Id order by a.Name, s.Name";}

$rs = $pdo->prepare($query);
$rs->bindValue(':area',$area,PDO::PARAM_INT);
$rs->execute();
$arr=$rs->fetchAll(PDO::FETCH_NUM);	
foreach($arr as $site)
	{
	if ($complete)
		{$list[]=array($site[0],$site[1]);}
	else
		{$list[]=$site[0];}
	}
$query="select a1.Id from Areas a1 inner join Areas a2 on a1.AddByDefault like concat('%$',a2.Id,'$%') where a2.Id=:area";
$rs = $pdo->prepare($query);
$rs->bindValue(':area',$area,PDO::PARAM_INT);
$rs->execute();
$arr=$rs->fetchAll(PDO::FETCH_NUM);	
foreach($arr as $idArea)
	{
	$list=array_merge($list,sitesListFromArea($idArea[0],$offnet,$complete));
	}
return $list;
}

function tablaSitesCompleta($idArea,$nombre,$editMode=false,$offnet=false)
{
echo '<div class="tablaDiv" tabla="Sites" id="tabla'.$nombre.'">';
$tipos1=tipoCampos('Sites');
$tipos2=tipoCampos('Maps');
$tipos=array_merge($tipos1,$tipos2);
$tipos['AreaName']='varchar(64)';
$tipos['Type']='varchar(64)';
$tipos['Deployed']='varchar(64)';
$tipos['Spare']='varchar(64)';
$tipos['GPS']='varchar(64)';
//$campos=array( 'AreaName','Country','City','PostalCode','Name','SystemName','Type','GPS','Address','Deployed','Spare');
$campos=array( 'AreaName','Country','City','PostalCode','Name','SystemName','GPS','Address');
echo '<div class="lineaTitulo lineaTabla">';
sTabla_titulo($editMode,$campos,$tipos);
echo '<div class="clear"></div></div>';
busquedaRecursivaSitesCompleta($idArea,$tipos,$nombre,$editMode,$offnet);
echo '</div>';
}

function busquedaRecursivaSitesCompleta($idArea,$tipos,$nombre,$editMode=false,$offnet=false)
{
global $pdo;
if ($offnet)
	{}
else
	{
	//$query="select s.Id,a.Name as `AreaName`,s.Country,s.`City`,s.`PostalCode`, s.Name,s.SystemName,GROUP_CONCAT(t.Tag) as Type,g.Info as GPS, CONCAT(s.Address,', ',s.PostalCode,', ',s.City,', ',s.Country) as Address, GROUP_CONCAT(lDep.Name) as Deployed, GROUP_CONCAT(lSp.Name) as Spare   from Sites s inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%') left join Tags t on t.Tabla='Sites' and s.Id=t.IdTabla left join LogContainers lDep on lDep.Site=s.Id and lDep.Type='Deployed' left join LogContainers lSp on lSp.Site=s.Id and lSp.Type='Spares'  where s.System!='OFFNET' and a.Id=".$idArea ." group by s.Id order by a.Name,s.Country,s.City, s.Name";
	$query="select s.Id,a.Name as `AreaName`,s.Country,s.`City`,s.`PostalCode`, s.Name,s.SystemName,g.Info as GPS, CONCAT(s.Address,', ',s.PostalCode,', ',s.City,', ',s.Country) as Address  from Sites s inner join GeoElements g on s.Geo=g.Id inner join Areas a on a.Elements like concat('%$',g.Id,'$%')  where s.System!='OFFNET' and a.Id=".$idArea ." order by a.Name,s.Country,s.City, s.Name";
	}
//tablaDivSoloLineas($nombre,array( 'AreaName','Country','City','PostalCode','Name','SystemName','Type','GPS','Address','Deployed','Spare'),$tipos,$query,$editMode,array());
tablaDivSoloLineas($nombre,array( 'AreaName','Country','City','PostalCode','Name','SystemName','GPS','Address'),$tipos,$query,$editMode,array());
$query="select a1.Id from Areas a1 inner join Areas a2 on a1.AddByDefault like concat('%$',a2.Id,'$%') where a2.Id=".$idArea;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*while ($arr=mysql_fetch_array($rs,MYSQL_NUM))*/while($arr=$rs->fetch(PDO::FETCH_NUM))
	 {
	  busquedaRecursivaSitesCompleta($arr[0],$tipos,$nombre,$editMode,$offnet);
	 }
}

function tablaMapas($idArea,$nombre,$editMode=false)
{
echo '<div class="tablaDiv" tabla="Maps" id="tabla'.$nombre.'">';
$tipos=tipoCampos('Maps');
$tipos['AreaName']='varchar(64)';
busquedaRecursivaMapas($idArea,$tipos,$nombre,$editMode);
echo '</div>';
}

function busquedaRecursivaMapas($idArea,$tipos,$nombre,$editMode=false)
{
global $pdo;
$query="select m.Id,a.Name as `AreaName`, m.Name, m.Info from Maps m inner join Areas a on m.Area=a.Id where a.Id=".$idArea." order by m.Name";
tablaDivSoloLineas($nombre,array( 'AreaName','Name','Info'),$tipos,$query,$editMode,array());
$query="select a1.Id from Areas a1 inner join Areas a2 on a1.AddByDefault like concat('%$',a2.Id,'$%') where a2.Id=".$idArea;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*while ($arr=mysql_fetch_array($rs,MYSQL_NUM))*/while($arr=$rs->fetch(PDO::FETCH_NUM))
	 {
	  busquedaRecursivaMapas($arr[0],$tipos,$nombre,$editMode);
	 }
}

function busquedaRecursivaMapaBase($idArea)
{
global $pdo;
$query="select AddByDefault from Areas where Id=".$idArea;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*$arr=mysql_fetch_array($rs,MYSQL_NUM);*/$arr=$rs->fetch(PDO::FETCH_NUM);
$defaults=explode(';',$arr[0]);

foreach($defaults as $s)
	{
	$s=substr($s,1,-1);
	if ( is_numeric($s))
		{
		$nuevoId=$s*1;
		}
	}
$query="select DefaultMap from Areas where Id=".$nuevoId;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
//$arr=mysql_fetch_array($rs, MYSQL_NUM);
$arr=$rs->fetch(PDO::FETCH_NUM);
$idMap=$arr[0]*1;
if ($idMap==0)
	 {
	  return busquedaRecursivaMapaBase($nuevoId);
	 }
else
	{return $idMap;}
}

function tablaAreas($idArea,$nombre)
{
echo '<div class="tablaDiv" tabla="Areas" id="tabla'.$nombre.'">';
$tipos=tipoCampos('Areas');
busquedaRecursivaAreas($idArea,$tipos,$nombre);
echo '</div>';
}

function tablaTodasAreas($nombre)
{
echo '<div class="tablaDiv" tabla="Areas" id="tabla'.$nombre.'">';
$tipos=tipoCampos('Areas');
$query="select Id, Name from Areas order by Name";
tablaDivSoloLineas($nombre,array( 'Name'),$tipos,$query,false,array());
echo '</div>';
}


function busquedaRecursivaAreas($idArea,$tipos,$nombre)
{
global $pdo;
$query="select Id, Name from Areas where Id=".$idArea;
tablaDivSoloLineas($nombre,array( 'Name'),$tipos,$query,false,array());
$query="select a1.Id from Areas a1 inner join Areas a2 on a1.AddByDefault like concat('%$',a2.Id,'$%') where a2.Id=".$idArea;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
/*while ($arr=mysql_fetch_array($rs,MYSQL_NUM))*/while($arr=$rs->fetch(PDO::FETCH_NUM))
	 {
	  busquedaRecursivaAreas($arr[0],$tipos,$nombre);
	 }
}


?>