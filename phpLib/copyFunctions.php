<?php

/*!
 * copyFunctions.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 copyFunctions.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

include_once 'evolucion.php';
include_once 'condicionesNetwork.php';

function copyNetworkElement($tabla,$id,$modValues,$tablaOrigen='')
{
global $condicionSystem;
global $pdo;
if ($tablaOrigen=='')
	{
	$tablaOrigen=$tabla;
	}
 $query = "SELECT * FROM ".sanitizeSqlName($tablaOrigen)."  WHERE Id=:id";
 $rs = $pdo->prepare($query);
 $rs->bindValue(':id',$id,PDO::PARAM_INT);
 $rs->execute(); 
 if ($rs)
	{
	 $result = $rs->fetchAll(PDO::FETCH_ASSOC);
	 $rs->closeCursor();
	 unset($result[0]['Id']); //Remove ID from array
	 $qrystr = " INSERT INTO ".sanitizeSqlName($tabla) ;
	 $qrystr .= " ( " .implode(", ",array_keys($result[0])).") ";
	 $qrystr .= " VALUES ('".implode("', '",array_values($result[0])). "')";
	 $result = $pdo->query($qrystr);
	$newId=$pdo->lastInsertId();
	$filasCambiadas=update($tabla, $newId, $modValues);
	if ($tabla!='EqPorts' && $tabla!='PanelPorts')
		{guardarEvolucion('Installation', $tabla, $newId);}
	switch ($tabla)
		{
		case 'EqChassis':
			unset($modValues['Name']);
			unset($modValues['SystemName']);
			$nuevaTablaOrigen='Cards';
			if ($tablaOrigen=='EqChassisRepository')
				{
				$nuevaTablaOrigen='CardsRepository';
				}
			$query="select Id from `".$nuevaTablaOrigen."` where Equipment=:eq and".$condicionSystem;
			$rs = $pdo->prepare($query);
			$rs->bindValue(':eq',$id,PDO::PARAM_INT);
			$rs->execute();
			$cards=$rs->fetchAll(PDO::FETCH_NUM);
			$rs->closeCursor();
			$modValues['Equipment']=$newId;
			$modValues['SerialNumber']='';
			$modValues['AssetTag']='';
			$modValues['SerialStatus']='0';
			$modValues['Status']='IN SERVICE';
			foreach($cards as $card)
				{
				copyNetworkElement('Cards',$card[0],$modValues,$nuevaTablaOrigen);
				}
			break;
		case 'Cards':
			$nuevaTablaOrigen='EqPorts';
			if ($tablaOrigen=='CardsRepository')
				{
				$nuevaTablaOrigen='EqPortsRepository';
				}
			$query="select Id from `".$nuevaTablaOrigen."` where Card=:card and".$condicionSystem;
			$rs = $pdo->prepare($query);
			$rs->bindValue(':card',$id,PDO::PARAM_INT);
			$rs->execute();
			$ports=$rs->fetchAll(PDO::FETCH_NUM);
			$rs->closeCursor();
			$modValues['Card']=$newId;
			$modValues['DestType']='';
			$modValues['DestConnection']='0';
			$modValues['CircuitDest']='0';
			$modValues['CircuitStatus']='';
			$modValues['StatusDest']='';
			$modValues['LabelDest']='Unchecked';
			$modValues['MuxWork']='0';
			$modValues['MuxWorkChannel']='';
			$modValues['MuxProtect']='0';
			$modValues['MuxProtectChannel']='';
			$modValues['CableTypeDest']='';
			$modValues['Comments']='';
			foreach($ports as $port)
				{
				copyNetworkElement('EqPorts',$port[0],$modValues,$nuevaTablaOrigen);
				}
			break;
		case 'Panels':
			unset($modValues['Name']);
			unset($modValues['SystemName']);
			$nuevaTablaOrigen='PanelPorts';
			$query="select Id from `".$nuevaTablaOrigen."` where Panel=:panel and".$condicionSystem;
			$rs = $pdo->prepare($query);
			$rs->bindValue(':panel',$id,PDO::PARAM_INT);
			$rs->execute();
			$ports=$rs->fetchAll(PDO::FETCH_NUM);
			$rs->closeCursor();
			$modValues['Panel']=$newId;
			$modValues['RearType']='';
			$modValues['RearConnection']='0';
			$modValues['FrontType']='';
			$modValues['FrontConnection']='0';
			$modValues['CircuitRear']='0';
			$modValues['CircuitFront']='0';
			$modValues['StatusRear']='';
			$modValues['StatusFront']='';
			$modValues['LabelFront']='Unchecked';
			$modValues['LabelRear']='Unchecked';
			$modValues['RiserFront']='0';
			$modValues['RiserFrontStatus']='';
			$modValues['RiserRear']='0';
			$modValues['RiserRearStatus']='';
			$modValues['CableTypeFront']='';
			$modValues['CableTypeRear']='';
			$modValues['Comments']='';
			foreach($ports as $port)
				{
				copyNetworkElement('PanelPorts',$port[0],$modValues,$nuevaTablaOrigen);
				}
			break;
		}
	}
else
	{
	$newId=0;
	}
return $newId;

}


?>