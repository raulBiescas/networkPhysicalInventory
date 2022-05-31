<?php

/*!
 * condicionesNetwork.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 condicionesNetwork.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

$nivelesNetwork=array('Sites','Floors','Rooms','Racks','Chassis','Cards');
$namesNivelesNetwork=array('Site','Floor','Room','Rack','Chassis','Card');
$camposNetwork=array();
$camposNetwork['Sites']="select Id, Name,SystemName from Sites ";
$camposNetwork['Floors']="select Id, Name, SystemName, System from Floors ";
$camposNetwork['Rooms']="select Id, Name, SystemName, System from Rooms ";
$camposNetwork['Racks']="select Id, Name, SystemName, System from Racks ";
$camposNetwork['EqChassis']="select Id, Name,SystemName,RMU, TID, System from EqChassis ";
$camposNetwork['Panels']="select Id, Name,SystemName,RMU, Connector, Ports, System from Panels ";
$camposBaseNetwork=array();
$camposBaseNetwork['Sites']=array("Name","SystemName");
$camposBaseNetwork['Floors']=array("Name", "SystemName", "System");
$camposBaseNetwork['Rooms']=array("Name", "SystemName", "System");
$camposBaseNetwork['Racks']=array("Name", "SystemName", "System");
$camposBaseNetwork['EqChassis']=array("Name","SystemName","RMU", "TID", "System");
$camposBaseNetwork['Panels']=array("Name","SystemName","RMU", "Connector", "Ports", "System");

$consultasListaNetwork=array();
//$condicionSystem=" System!='NOTECH' and System!='REMOVED' and System!='DEPRECATED' ";	
$condicionSystem=" System!='REMOVED' and System!='DEPRECATED' ";	
$consultasListaNetwork['Sites']=array('Sites'=>$camposNetwork['Sites']."where ".$condicionSystem."  order by `Name`");
$consultasListaNetwork['Floors']=array('Floors'=>$camposNetwork['Floors']." where ".$condicionSystem." and Site=nivelAnterior order by `Level`");
$consultasListaNetwork['Rooms']=array('Rooms'=>$camposNetwork['Rooms']."where ".$condicionSystem." and Floor=nivelAnterior order by Name");
$consultasListaNetwork['Racks']=array('Racks'=>$camposNetwork['Racks']." where ".$condicionSystem." and Room=nivelAnterior order by Name");
$consultasListaNetwork['Chassis']=array('EqChassis'=>$camposNetwork['EqChassis']."where ".$condicionSystem." and Rack=nivelAnterior order by RMU desc",'Panels'=>$camposNetwork['Panels']."where ".$condicionSystem." and Rack=nivelAnterior order by RMU desc");

$rutasNetwork=array();
$rutasNetwork[]=array('Sites','Floors','Rooms','Racks','EqChassis','Cards','EqPorts');
$rutasNetwork[]=array('Sites','Floors','Rooms','Racks','Panels','PanelPorts');
$camposNombresNetwork=array();
$camposNombresNetwork['Sites']=array('Name','SystemName');
$camposNombresNetwork['Floors']=array('Name','SystemName');
$camposNombresNetwork['Rooms']=array('Name','SystemName');
$camposNombresNetwork['Racks']=array('Name','SystemName');
$camposNombresNetwork['EqChassis']=array('Name','SystemName');
$camposNombresNetwork['Panels']=array('Name','SystemName');
$camposNombresNetwork['PanelPorts']=array('Name','SystemName');
$camposNombresNetwork['Cards']=array('Slot','Name');
$camposNombresNetwork['EqPorts']=array('SystemName','Bandwidth');

$innersNetwork=array();
$innersNetwork['Floors']='Site';
$innersNetwork['Rooms']='Floor';
$innersNetwork['Racks']='Room';
$innersNetwork['EqChassis']='Rack';
$innersNetwork['Panels']='Rack';
$innersNetwork['PanelPorts']='Panel';
$innersNetwork['Cards']='Equipment';
$innersNetwork['EqPorts']='Card';

$linksNetwork=array();
$linksNetwork['Sites']='site.php';
$linksNetwork['Floors']='floor.php';
$linksNetwork['Rooms']='room.php';
$linksNetwork['Racks']='rack.php';
$linksNetwork['EqChassis']='equipment.php';
$linksNetwork['Panels']='panel.php';
$linksNetwork['PanelPorts']='';
$linksNetwork['Cards']='';
$linksNetwork['EqPorts']='';

?>