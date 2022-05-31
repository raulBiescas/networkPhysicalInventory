<?php

/*!
 * panels.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 panels.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

//number of ports for the front, frontrearrate for interface change: 0.5 or 2

function crearPuertosPanel($idPanel,$model,$connector,$system,$puertos)
{
global $pdo;
$i=1;
$p = xml_parser_create();
xml_parse_into_struct($p, $model, $vals, $index);
xml_parser_free($p);
$puertosModelo=false;
if (array_key_exists('PORTS',$index))
	{
	$puertosModelo=true;
	$nombrePuertos=explode(',',$vals[$index['PORTS'][0]]['value']);
	}
$rate=1;
if (array_key_exists('FRONTREARRATE',$index))
	{
	$rate=$vals[$index['FRONTREARRATE'][0]]['value']*1;
	if ($rate>1)
		{
		$puertos*=$rate;
		}
	else
		{
		$rate=1;
		}
	}
while ($i<=$puertos)
	{
	if ($puertosModelo)
		{
		$portName=$nombrePuertos[floor(($i-1)/$rate)];
		}
	else
		{
		$portName=$i;
		if ($rate>1)
			{
			$portName=floor(($i-1)/$rate)+1;
			}
		}
	$query="insert into PanelPorts (Panel,Port,Name,SystemName,Connector,System) values (:idPanel,:i,:portName,:i2,:connector,:system)";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':idPanel',$idPanel,PDO::PARAM_INT);
	$rs->bindValue(':i',$i,PDO::PARAM_INT);
	$rs->bindValue(':i2',$i,PDO::PARAM_INT);
	$rs->bindValue(':portName',$portName);
	$rs->bindValue(':connector',$connector);
	$rs->bindValue(':system',$system);
	$rs->execute();
	$i++;
	}
}

function updatePanelPorts($idPanel,$model,$puertos)
{
global $pdo;
$i=1;
$p = xml_parser_create();
xml_parse_into_struct($p, $model, $vals, $index);
xml_parser_free($p);
$puertosModelo=false;
if (array_key_exists('PORTS',$index))
	{
	$puertosModelo=true;
	$nombrePuertos=explode(',',$vals[$index['PORTS'][0]]['value']);
	}
$rate=1;
if (array_key_exists('FRONTREARRATE',$index))
	{
	$rate=$vals[$index['FRONTREARRATE'][0]]['value']*1;
	if ($rate>1)
		{
		$puertos*=$rate;
		}
	else
		{
		$rate=1;
		}
	}
while ($i<=$puertos)
	{
	if ($puertosModelo)
		{
		$portName=$nombrePuertos[floor(($i-1)/$rate)];	
		}
	else
		{
		$portName=$i;
		if ($rate>1)
			{
			$portName=floor(($i-1)/$rate)+1;
			}
		}
	$query="update PanelPorts set Name=:portName where Panel=:idPanel and Port=:i";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':idPanel',$idPanel,PDO::PARAM_INT);
	$rs->bindValue(':i',$i,PDO::PARAM_INT);
	$rs->bindValue(':portName',$portName);
	$rs->execute();
	$i++;
	}
}
		
?>