<?php

/*!
 * circuits.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 circuits.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

//buscar nbsp en mysql LIKE CONCAT(  '%', UNHEX(  'C2A0' ) ,  '%' ) 

function changeCircuitName($oldCircuit,$newCircuit)
{
global $pdo;
$newCircuit=circuitTrim($newCircuit);
$query="update Circuits set `Reference`=:newCircuit where `Reference`=:oldCircuit";
$rs = $pdo->prepare($query);
$rs->bindValue(':newCircuit',$newCircuit);
$rs->bindValue(':oldCircuit',$oldCircuit);
$rs->execute(); 
$query="update EqPorts set CircuitDest=:newCircuit where CircuitDest=:oldCircuit";
$rs = $pdo->prepare($query);
$rs->bindValue(':newCircuit',$newCircuit);
$rs->bindValue(':oldCircuit',$oldCircuit);
$rs->execute(); 
$query="update OffnetPorts set CircuitIn=:newCircuit where CircuitIn=:oldCircuit";
$rs = $pdo->prepare($query);
$rs->bindValue(':newCircuit',$newCircuit);
$rs->bindValue(':oldCircuit',$oldCircuit);
$rs->execute(); 
$query="update OffnetPorts set CircuitOut=:newCircuit where CircuitOut=:oldCircuit";
$rs = $pdo->prepare($query);
$rs->bindValue(':newCircuit',$newCircuit);
$rs->bindValue(':oldCircuit',$oldCircuit);
$rs->execute(); 
$query="update PanelPorts set CircuitFront=:newCircuit where CircuitFront=:oldCircuit";
$rs = $pdo->prepare($query);
$rs->bindValue(':newCircuit',$newCircuit);
$rs->bindValue(':oldCircuit',$oldCircuit);
$rs->execute(); 
$query="update PanelPorts set CircuitRear=:newCircuit where CircuitRear=:oldCircuit";
$rs = $pdo->prepare($query);
$rs->bindValue(':newCircuit',$newCircuit);
$rs->bindValue(':oldCircuit',$oldCircuit);
$rs->execute(); 
$query="update RiserResources set `Element`=:newCircuit where `Element`=:oldCircuit";
$rs = $pdo->prepare($query);
$rs->bindValue(':newCircuit',$newCircuit);
$rs->bindValue(':oldCircuit',$oldCircuit);
$rs->execute(); 
}

function circuitTrim($circuit)
{
$circuit=trim($circuit);
$circuit = trim($circuit,chr(0xC2).chr(0xA0));//remove nbsp
return $circuit;
}

function buscarTodosPuertos($circuito,$recurring=true)
{
global $pdo;
global $panelPorts;
global $eqPorts;
global $offnetPorts;
global $panelPortsIds;
global $eqPortsIds;
global $offnetPortsIds;
global $referencias;
$nuevos=array();
$circuito=circuitTrim($circuito);
$query="select * from EqPorts where CircuitDest=:circuito order by Card,SystemName";
$rs = $pdo->prepare($query);
$rs->bindValue(':circuito',$circuito);
$rs->execute(); 
$res=$rs->fetchAll(PDO::FETCH_NUM);
$rs->closeCursor();
foreach ($res as $arr)
	{
	if (!in_array($arr[0],$eqPortsIds,TRUE))
		{
		$eqPorts[]=$arr;
		$eqPortsIds[]=$arr[0];
		$newRef=circuitTrim($arr[11]);
		if (!in_array($newRef,$referencias,TRUE))
			{
			$nuevos[]=$newRef;
			$referencias[]=$newRef;
			}
		}
	}

$query="select * from PanelPorts where CircuitRear=:circuito1 OR CircuitFront=:circuito2 order by Panel,Port";
$rs = $pdo->prepare($query);
$rs->bindValue(':circuito1',$circuito);
$rs->bindValue(':circuito2',$circuito);
$rs->execute(); 
$res=$rs->fetchAll(PDO::FETCH_NUM);
$rs->closeCursor();
foreach ($res as $arr)
	{
	if (!in_array($arr[0],$panelPortsIds,TRUE))
		{
		$panelPorts[]=$arr;
		$panelPortsIds[]=$arr[0];
		$newRef=circuitTrim($arr[10]);
		if (!in_array($newRef,$referencias,TRUE))
			{
			$nuevos[]=$newRef;
			$referencias[]=$newRef;
			}
		$newRef=circuitTrim($arr[11]);
		if (!in_array($newRef,$referencias,TRUE))
			{
			$nuevos[]=$newRef;
			$referencias[]=$newRef;
			}
		}
	}

$query="select * from OffnetPorts where CircuitIn=:circuito1 OR CircuitOut=:circuito2 order by Id, Name";
$rs = $pdo->prepare($query);
$rs->bindValue(':circuito1',$circuito);
$rs->bindValue(':circuito2',$circuito);
$rs->execute(); 
$res=$rs->fetchAll(PDO::FETCH_NUM);
$rs->closeCursor();
foreach ($res as $arr)
	{
	if (!in_array($arr[0],$offnetPortsIds,TRUE))
		{
		$offnetPorts[]=$arr;
		$offnetPortsIds[]=$arr[0];
		$newRef=circuitTrim($arr[10]);
		if (!in_array($newRef,$referencias,TRUE))
			{
			$nuevos[]=$newRef;
			$referencias[]=$newRef;
			}
		$newRef=circuitTrim($arr[11]);
		if (!in_array($newRef,$referencias,TRUE))
			{
			$nuevos[]=$newRef;
			$referencias[]=$newRef;
			}
		}
	}
if ($recurring)
	{
	foreach($nuevos as $nuevo)
		{
		buscarTodosPuertos($nuevo);
		}
	}
}

function combinarCircuitos($newId,$oldId)
{
global $pdo;
	
$query="update Evolution set Related=REPLACE(Related,'#Circuits=".$oldId."#','#Circuits=".$newId."#') where Related like '%#Circuits=".$oldId."#%'";
$rs = $pdo->prepare($query);
$rs->execute();

$query="update `Chapters` set `IdTabla`=:newId where `Tabla`='Circuits' and `IdTabla`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->bindValue(':newId',$newId,PDO::PARAM_INT);
$rs->execute();
//reordenar Index del libro

$query="update `RiserResources` set `Element`=:newId where `Element`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->bindValue(':newId',$newId,PDO::PARAM_INT);
$rs->execute();

$query="update `EqPorts` set `CircuitDest`=:newId where`CircuitDest`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->bindValue(':newId',$newId,PDO::PARAM_INT);
$rs->execute();

$query="update `OffnetPorts` set `CircuitIn`=:newId where `CircuitIn`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->bindValue(':newId',$newId,PDO::PARAM_INT);
$rs->execute();

$query="update `OffnetPorts` set `CircuitOut`=:newId where `CircuitOut`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->bindValue(':newId',$newId,PDO::PARAM_INT);
$rs->execute();

$query="update `PanelPorts` set `CircuitRear`=:newId where `CircuitRear`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->bindValue(':newId',$newId,PDO::PARAM_INT);
$rs->execute();

$query="update `PanelPorts` set `CircuitFront`=:newId where`CircuitFront`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->bindValue(':newId',$newId,PDO::PARAM_INT);
$rs->execute();

$query="delete from `References` where  `Tabla`='Circuits' and `IdTabla`=:oldId";
$rs = $pdo->prepare($query);
$rs->bindValue(':oldId',$oldId,PDO::PARAM_INT);
$rs->execute();

borrar('Circuits',$oldId);
}

function generarCircuitPath()
{
global $pdo;
global $panelPorts;
global	$eqPorts;
global $offnetPorts;
global $panelPortsIds;
global $eqPortsIds;
global $offnetPortsIds;
$cadenaCircuito=array();
$referencias=array();
$nextPanelPort='Front';
$nextOffnetPort='Out';

if (count($eqPorts)>0)
	{
	$puertoActual=array_shift($eqPorts);
	$tablaActual='EqPorts';
	$entrada='MUX';
	$referencias=array($puertoActual[11],$puertoActual[11],0,0,0,$puertoActual[10]);
	}
else
	{
	if (count($panelPorts)>0)
		{
		$puertoActual=array_shift($panelPorts);
		$tablaActual='PanelPorts';
		$entrada='Rear';
		$referencias=array($puertoActual[10],$puertoActual[11],$puertoActual[19],$puertoActual[17],$puertoActual[6],$puertoActual[8]);
		if ($puertoActual[8]=='0')
			{
			$entrada='Front';
			$nextPanelPort='Rear';
			$referencias=array($puertoActual[11],$puertoActual[10],$puertoActual[17],$puertoActual[19],$puertoActual[8],$puertoActual[6]);
			}
		}
	else
		if (count($offnetPorts)>0)
			{
			$puertoActual=array_shift($offnetPorts);
			$tablaActual='OffnetPorts';
			$entrada='In';
			$referencias=array($puertoActual[10],$puertoActual[11],$puertoActual[15],$puertoActual[21],$puertoActual[6],$puertoActual[8]);
			if ($puertoActual[8]=='0')
				{
				$entrada='Out';
				$nextOffnetPort='In';
				$referencias=array($puertoActual[11],$puertoActual[10],$puertoActual[21],$puertoActual[15],$puertoActual[8],$puertoActual[6]);
				}
			
			}
	}
$cadenaCircuito[]=array($tablaActual,$puertoActual,$entrada,$referencias);



//hacia un lado
$fin=false;
while (!$fin)
	{
	switch ($tablaActual)
		{
		case 'EqPorts':
			$siguienteTipo=$puertoActual[9];
			$siguientePuerto=$puertoActual[10];
			break;
		case 'PanelPorts':
			if ($nextPanelPort=='Front')
				{
				$siguienteTipo=$puertoActual[7];
				$siguientePuerto=$puertoActual[8];
				}
			else
				{
				$siguienteTipo=$puertoActual[5];
				$siguientePuerto=$puertoActual[6];
				}
			break;
		case 'OffnetPorts':
			if ($nextOffnetPort=='Out')
				{
				$siguienteTipo=$puertoActual[7];
				$siguientePuerto=$puertoActual[8];
				}
			else
				{
				$siguienteTipo=$puertoActual[5];
				$siguientePuerto=$puertoActual[6];
				}
			break;
		}
	if ($siguientePuerto*1==0)
		{$fin=true;}
	else
		{
		$encontrado=false;
		$referencias=array();
		switch ($siguienteTipo)
			{
			case 'Eq':
				if (!in_array($siguientePuerto,$eqPortsIds,TRUE))
					{
					$eqPortsIds[]=$siguientePuerto;
					$query="select * from EqPorts where Id=:id";
					$rs = $pdo->prepare($query);
					$rs->bindValue(':id',$siguientePuerto,PDO::PARAM_INT);
					$rs->execute(); 
					$eqPorts[]=$rs->fetch(PDO::FETCH_NUM);
					$rs->closeCursor();
					}
				foreach($eqPorts as $index=>$puerto)
					{
					if ($puerto[0]==$siguientePuerto)
						{
						$encontrado=true;
						$entrada='PORT';
						$puertoActual=$puerto;
						$tablaActual='EqPorts';
						$referencias=array($puerto[11],$puerto[11],0,0,$puerto[10],0);
						unset($eqPorts[$index]);
						}
					}
				break;
			case 'Panel':
				if (!in_array($siguientePuerto,$panelPortsIds,TRUE))
					{
					$panelPortsIds[]=$siguientePuerto;
					$query="select * from PanelPorts where Id=:id";
					$rs = $pdo->prepare($query);
					$rs->bindValue(':id',$siguientePuerto,PDO::PARAM_INT);
					$rs->execute(); 
					$panelPorts[]=$rs->fetch(PDO::FETCH_NUM);
					$rs->closeCursor();
					}
				foreach($panelPorts as $index=>$puerto)
					{
					if ($puerto[0]==$siguientePuerto)
						{
						$encontrado=true;
						if ($puerto[6]==$puertoActual[0])
							{
							$entrada='Rear';
							$nextPanelPort='Front';
							$referencias=array($puerto[10],$puerto[11],$puerto[19],$puerto[17],$puerto[6],$puerto[8]);
							}
						else
							{
							$entrada='Front';
							$referencias=array($puerto[11],$puerto[10],$puerto[17],$puerto[19],$puerto[8],$puerto[6]);
							$nextPanelPort='Rear';
							}
						$puertoActual=$puerto;
						$tablaActual='PanelPorts';
						unset($panelPorts[$index]);
						}
					}
				break;
			case 'Offnet':
				if (!in_array($siguientePuerto,$offnetPortsIds,TRUE))
					{
					$offnetPortsIds[]=$siguientePuerto;
					$query="select * from OffnetPorts where Id=:id";
					$rs = $pdo->prepare($query);
					$rs->bindValue(':id',$siguientePuerto,PDO::PARAM_INT);
					$rs->execute(); 
					$offnetPorts[]=$rs->fetch(PDO::FETCH_NUM);
					$rs->closeCursor();
					}
				foreach($offnetPorts as $index=>$puerto)
					{
					if ($puerto[0]==$siguientePuerto)
						{
						$encontrado=true;
						if ($puerto[6]==$puertoActual[0])
							{
							$entrada='In';
							$nextOffnetPort='Out';
							$referencias=array($puerto[10],$puerto[11],$puerto[15],$puerto[21],$puerto[6],$puerto[8]);
							}
						else
							{
							$entrada='Out';
							$nextOffnetPort='In';
							$referencias=array($puerto[11],$puerto[10],$puerto[21],$puerto[15],$puerto[8],$puerto[6]);
							}
						$puertoActual=$puerto;
						$tablaActual='OffnetPorts';
						unset($offnetPorts[$index]);
						}
					}
				break;
			
			}
		
		if ($encontrado)
			{$cadenaCircuito[]=array($tablaActual,$puertoActual,$entrada,$referencias);}
		else
			{$fin=true;}
		}
	}

//hacia el otro lado si hubiera	
$nextPanelPort='Rear';
$nextOffnetPort='In';
$tablaActual=$cadenaCircuito[0][0];
if ($tablaActual!='EqPorts')
	{
	$puertoActual=$cadenaCircuito[0][1];
	$fin=false;
	while (!$fin)
		{
		switch ($tablaActual)
			{
			case 'EqPorts':
				$siguienteTipo=$puertoActual[9];
				$siguientePuerto=$puertoActual[10];
				break;
			case 'PanelPorts':
				if ($nextPanelPort=='Front')
					{
					$siguienteTipo=$puertoActual[7];
					$siguientePuerto=$puertoActual[8];
					}
				else
					{
					$siguienteTipo=$puertoActual[5];
					$siguientePuerto=$puertoActual[6];
					}
				break;
			case 'OffnetPorts':
				if ($nextOffnetPort=='Out')
					{
					$siguienteTipo=$puertoActual[7];
					$siguientePuerto=$puertoActual[8];
					}
				else
					{
					$siguienteTipo=$puertoActual[5];
					$siguientePuerto=$puertoActual[6];
					}
				break;
			}
		if ($siguientePuerto*1==0)
			{$fin=true;}
		else
			{
			$encontrado=false;
			$referencias=array();
			switch ($siguienteTipo)
				{
				case 'Eq':
					if (!in_array($siguientePuerto,$eqPortsIds,TRUE))
						{
						$eqPortsIds[]=$siguientePuerto;
						$query="select * from EqPorts where Id=:id";
						$rs = $pdo->prepare($query);
						$rs->bindValue(':id',$siguientePuerto,PDO::PARAM_INT);
						$rs->execute(); 
						$eqPorts[]=$rs->fetch(PDO::FETCH_NUM);
						$rs->closeCursor();
						}
					foreach($eqPorts as $index=>$puerto)
						{
						if ($puerto[0]==$siguientePuerto)
							{
							$encontrado=true;
							$entrada='MUX';
							$puertoActual=$puerto;
							$tablaActual='EqPorts';
							$referencias=array($puerto[11],$puerto[11],0,0,0,$puerto[10]);
							unset($eqPorts[$index]);
							}
						}
					break;
				case 'Panel':
					if (!in_array($siguientePuerto,$panelPortsIds,TRUE))
						{
						$panelPortsIds[]=$siguientePuerto;
						$query="select * from PanelPorts where Id=:id";
						$rs = $pdo->prepare($query);
						$rs->bindValue(':id',$siguientePuerto,PDO::PARAM_INT);
						$rs->execute(); 
						$panelPorts[]=$rs->fetch(PDO::FETCH_NUM);
						$rs->closeCursor();
						}
					foreach($panelPorts as $index=>$puerto)
						{
						if ($puerto[0]==$siguientePuerto)
							{
							$encontrado=true;
							if ($puerto[6]==$puertoActual[0])
								{
								$entrada='Rear';
								$nextPanelPort='Front';
								$referencias=array($puerto[10],$puerto[11],$puerto[19],$puerto[17],$puerto[6],$puerto[8]);
								}
							else
								{
								$entrada='Front';
								$nextPanelPort='Rear';
								$referencias=array($puerto[11],$puerto[10],$puerto[17],$puerto[19],$puerto[8],$puerto[6]);
								}
							$puertoActual=$puerto;
							$tablaActual='PanelPorts';
							unset($panelPorts[$index]);
							}
						}
					break;
				case 'Offnet':
					if (!in_array($siguientePuerto,$offnetPortsIds,TRUE))
						{
						$offnetPortsIds[]=$siguientePuerto;
						$query="select * from OffnetPorts where Id=:id";
						$rs = $pdo->prepare($query);
						$rs->bindValue(':id',$siguientePuerto,PDO::PARAM_INT);
						$rs->execute(); 
						$offnetPorts[]=$rs->fetch(PDO::FETCH_NUM);
						$rs->closeCursor();
						}
					foreach($offnetPorts as $index=>$puerto)
						{
						if ($puerto[0]==$siguientePuerto)
							{
							$encontrado=true;
							if ($puerto[6]==$puertoActual[0])
								{
								$entrada='In';
								$nextOffnetPort='Out';
								$referencias=array($puerto[10],$puerto[11],$puerto[15],$puerto[21],$puerto[6],$puerto[8]);
								}
							else
								{
								$entrada='Out';
								$nextOffnetPort='In';
								$referencias=array($puerto[11],$puerto[10],$puerto[21],$puerto[15],$puerto[8],$puerto[6]);
								}
							$puertoActual=$puerto;
							$tablaActual='OffnetPorts';
							unset($offnetPorts[$index]);
							}
						}
					break;
				
				}
			
			if ($encontrado)
				{array_unshift($cadenaCircuito,array($tablaActual,$puertoActual,$entrada,$referencias));}
			else
				{$fin=true;}
			}
		}
	
	}
return $cadenaCircuito;
}

function circuitReferenceProcess($circuit,$customer, $provider='', $type='',$refType='REFERENCE')
{
global $pdo;
$circuit=circuitTrim($circuit);
if ($circuit=='')
	{return '0';}
else
	{
	$query="select `IdTabla` from `References` where Tabla='Circuits' AND `Reference`=:circuit";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':circuit',$circuit);
	$rs->execute();
	if ($res=$rs->fetch(PDO::FETCH_NUM))
		{
		$idCircuito=$res[0];
		$rs->closeCursor();
		}
	else
		{
		$rs->closeCursor();
		$query="insert into Circuits (Customer,Provider, `Type`) values (:customer,:provider,:type)";
		$rs = $pdo->prepare($query);
		$rs->bindValue(':customer',$customer);
		$rs->bindValue(':provider',$provider);
		$rs->bindValue(':type',$type);
		$rs->execute(); 
		$idCircuito=$pdo->lastInsertId();
		$query="insert into `References` (`Reference`,IdTabla, `Tabla`,`Type`) values (:circuit,:idCircuito,'Circuits',:refType)";
		$rs = $pdo->prepare($query);
		$rs->bindValue(':circuit',$circuit);
		$rs->bindValue(':idCircuito',$idCircuito,PDO::PARAM_INT);
		$rs->bindValue(':refType',$refType);
		$rs->execute(); 
		}
	return $idCircuito;
	}
}


function checkRiserInitStatus($fromType,$fromId,$fromSide,$toType,$toId,$toSide)
{
global $pdo;
$status='AVAILABLE';
if ($fromType=='Panel')
	{
	$fromOtherSide='Rear';
	if ($fromSide=='Rear')
		{
		$fromOtherSide='Front';
		}
	}
if ($fromType=='Offnet')
	{
	$fromOtherSide='In';
	if ($fromSide=='In')
		{
		$fromOtherSide='Out';
		}
	}
if ($toType=='Panel')
	{
	$toOtherSide='Rear';
	if ($toSide=='Rear')
		{
		$toOtherSide='Front';
		}
	}
if ($toType=='Offnet')
	{
	$toOtherSide='In';
	if ($toSide=='In')
		{
		$toOtherSide='Out';
		}
	}
$query="select `".$fromOtherSide."Connection` from `".$fromType."Ports` where Id=:id";
$rs = $pdo->prepare($query);
$rs->bindValue(':id',$fromId,PDO::PARAM_INT);
$rs->execute(); 
$arr=$rs->fetch(PDO::FETCH_NUM);
$rs->closeCursor();
if ($arr[0]*1!=0)
	{
	$status='SERVICE';
	}
$query="select `".$toOtherSide."Connection` from `".$toType."Ports` where Id=:id";
$rs = $pdo->prepare($query);
$rs->bindValue(':id',$toId,PDO::PARAM_INT);
$rs->execute(); 
$arr=$rs->fetch(PDO::FETCH_NUM);
$rs->closeCursor();
if ($arr[0]*1!=0)
	{
	$status='SERVICE';
	}
return $status;	
}

function actualizarEstadoRiser($toType,$toSide,$toId,$circuit)
{
global $pdo;
//$circuit=circuitTrim($circuit);
if ($toType=='Panel' || $toType=='Offnet')
	{
	if ($toType=='Panel')
		{
		$toOtherSide='Rear';
		if ($toSide=='Rear')
			{
			$toOtherSide='Front';
			}
		}
	if ($toType=='Offnet')
		{
		$toOtherSide='In';
		if ($toSide=='In')
			{
			$toOtherSide='Out';
			}
		}
	$query="select Riser".$toOtherSide.", ".$toOtherSide."Type, ".$toOtherSide."Connection,Riser".$toOtherSide."Status from ".sanitizeSqlName($toType."Ports")." where Id=:toId";
	$rs = $pdo->prepare($query);
	$rs->bindValue(':toId',$toId,PDO::PARAM_INT);
	$rs->execute(); 
	if ($arr=$rs->fetch(PDO::FETCH_NUM))
		{
		$rs->closeCursor();
		if (($arr[0]*1)!=0)
			{
			$query="update ".sanitizeSqlName($toType."Ports")." set Riser".$toOtherSide."Status='SERVICE', Circuit".$toOtherSide."=:circuit where Id=:toId";
			$rs = $pdo->prepare($query);
			$rs->bindValue(':toId',$toId,PDO::PARAM_INT);
			$rs->bindValue(':circuit',$circuit);
			$rs->execute(); 
			
			if ($arr[3]=='AVAILABLE')
				{
				$query="update Risers set Available=Available-1 where Id=:id";
				$rs = $pdo->prepare($query);
				$rs->bindValue(':id',$arr[0],PDO::PARAM_INT);
				$rs->execute();
				$query="insert into RiserResources (Riser,Resources,`Type`,`Element`) values (:id,".'-1'.",'Connection',:circuit)";
				$rs = $pdo->prepare($query);
				$rs->bindValue(':id',$arr[0],PDO::PARAM_INT);
				$rs->bindValue(':circuit',$circuit);
				$rs->execute();
				}
			
			if ($arr[1]=='Panel')				
				{
				$followingRiserSides=array('Front','Rear');
				}
			else
				{
				$followingRiserSides=array('In','Out');
				}
			$query="select Riser".$followingRiserSides[0].",Riser".$followingRiserSides[1]." from ".$arr[1]."Ports where Id=:id";
			$rs = $pdo->prepare($query);
			$rs->bindValue(':id',$arr[2],PDO::PARAM_INT);
			$rs->execute();
			if ($arr2=$rs->fetch(PDO::FETCH_NUM))
				{
				$rs->closeCursor();
				if ($arr2[0]==$arr[0])
					{
					$followingRiserSide=$followingRiserSides[0];
					}
				else
					{
					$followingRiserSide=$followingRiserSides[1];
					}
				$query="update ".$arr[1]."Ports set Riser".$followingRiserSide."Status='SERVICE', Circuit".$followingRiserSide."=:circuit  where Id=:id";
				$rs = $pdo->prepare($query);
				$rs->bindValue(':id',$arr[2],PDO::PARAM_INT);
				$rs->bindValue(':circuit',$circuit);
				$rs->execute();	
				}
			else
				{
				$rs->closeCursor();
				}
			}
		}
	else
		{
		$rs->closeCursor();
		}

	}
}

function generateCircuitLayout($circuit)
{
global $pdo;
global $panelPorts;
global $eqPorts;
global $offnetPorts;
global $panelPortsIds;
global $eqPortsIds;
global $offnetPortsIds;
global $referencias;
buscarTodosPuertos($circuit);
$cadenasCircuitos=array();
while ((count($eqPorts)>0) || (count($panelPorts)>0) || (count($offnetPorts)>0))
	{
	$cadenasCircuitos[]=generarCircuitPath();
	}
			
echo '<div class="lineaTieDown tituloTieDown"><div class="bloqueTieDown nivelCircuitoSites">Site</div><div class="bloqueTieDown nivelCircuitoFloors">Floor</div><div class="bloqueTieDown nivelCircuitoRooms">Room</div><div class="bloqueTieDown nivelCircuitoRacks">Rack</div><div class="bloqueTieDown nivelCircuitoPanels">Chassis</div><div class="bloqueTieDown nivelCircuitoPorts">Port</div></div>';
foreach ($cadenasCircuitos as $cadenaCircuito)
	{
	echo '<div class="bloqueRutas"><div class="espacioTieDown"></div>';
	foreach ($cadenaCircuito as $valor)
		{
		echo '<div class="lineaTieDown">'.elementDescriptor($valor[0],$valor[1][0]).'<div class="ladoEntrada oculto">'.$valor[2].'</div>';
		echo' <div class="circuitIn oculto">'.$valor[3][0].'</div><div class="circuitOut oculto">'.$valor[3][1].'</div>';
		echo '<div class="riserIn oculto">'.$valor[3][2].'</div><div class="riserOut oculto">'.$valor[3][3].'</div>';
		echo '<div class="conectIn oculto">'.$valor[3][4].'</div><div class="conectOut oculto">'.$valor[3][5].'</div></div>';
		echo '<div class="espacioTieDown"></div>';
		}
	echo '</div>';
	}
$whereRef='';
$whereCirc='';
foreach($referencias as $ref)
	{
	if ($ref!='' && $ref!='0')
		{
		$whereRef.= "IdTabla=".$ref .' OR ';
		$whereCirc.= "Id=".$ref .' OR ';
		}
	}
echo '<div class="oculto tablaDiv" id="allRefsTable">';
$query="select Id, IdTabla,`Type`,`Reference` from `References` where Tabla='Circuits' and (".substr($whereRef,0,-3).") order by IdTabla, `Type`";
tablaDivSoloLineas('References',array('IdTabla','Type','Reference'),tipoCampos('References'),$query,false, array());
echo '</div>';

echo '<div class="oculto tablaDiv" id="allCircuitsTable">';
$query="select Id, Customer,Provider,Bandwidth, Bandwidth_UNIT, `Type` from `Circuits` where  (".substr($whereCirc,0,-3).") order by Id";
tablaDivSoloLineas('Circuits',array('Customer','Provider','Bandwidth','Bandwidth_UNIT','Type'),tipoCampos('Circuits'),$query,false,array());
echo '</div>';
}

//returns array with circuit Ids for all circuits occupating ports in table@id (f.instance: Sites@7)
function circuitList($table,$id)
{
global $pdo;
$circuits=array();
if ($table!='Cards' && $table!='EqChassis')
	{
	$queryCondition="inner join Panels pa on pa.Id=p.Panel inner join Racks r on pa.Rack=r.Id inner join Rooms ro on ro.Id=r.Room inner join Floors f on f.Id=ro.Floor inner join Sites s on f.Site=s.Id ";
	$whereCondition=" where ";
	switch ($table)
		{
		case 'Sites':
			$whereCondition.="s.Id=:id";
			break;
		case 'Floors':
			$whereCondition.="f.Id=:id";
			break;
		case 'Rooms':
			$whereCondition.="ro.Id=:id";
			break;
		case 'Racks':
			$whereCondition.="r.Id=:id";
			break;
		case 'Panels':
			$whereCondition.="pa.Id=:id";
			break;
		case 'Risers':
			$whereCondition.="(p.RiserRear=:id or p.RiserFront=:id  )";
			break;
		}
	$query="select distinct p.CircuitRear from PanelPorts p ".$queryCondition.$whereCondition;

	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id);
	$rs->execute(); 
	$res=$rs->fetchAll(PDO::FETCH_NUM);
	foreach($res as $arr)
		{
		$circuits[]=$arr[0];
		}
	$query="select distinct p.CircuitFront from PanelPorts p ".$queryCondition.$whereCondition;
	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id);
	$rs->execute(); 
	$res=$rs->fetchAll(PDO::FETCH_NUM);
	foreach($res as $arr)
		{
		$circuits[]=$arr[0];
		}
	}

if ($table!='Panels' && $table!='Risers')
	{
	$queryCondition="inner join Cards c on c.Id=p.Card inner join EqChassis e on e.Id=c.Equipment inner join Racks r on e.Rack=r.Id inner join Rooms ro on ro.Id=r.Room inner join Floors f on f.Id=ro.Floor inner join Sites s on f.Site=s.Id ";
	$whereCondition=" where ";
	switch ($table)
		{
		case 'Sites':
			$whereCondition.="s.Id=:id";
			break;
		case 'Floors':
			$whereCondition.="f.Id=:id";
			break;
		case 'Rooms':
			$whereCondition.="ro.Id=:id";
			break;
		case 'Racks':
			$whereCondition.="r.Id=:id";
			break;
		case 'EqChassis':
			$whereCondition.="e.Id=:id";
			break;
		case 'Cards':
			$whereCondition.="c.Id=:id";
			break;
		}
	$query="select distinct p.CircuitDest from EqPorts p ".$queryCondition.$whereCondition;
	$rs = $pdo->prepare($query);
	$rs->bindValue(':id',$id);
	$rs->execute(); 
	$res=$rs->fetchAll(PDO::FETCH_NUM);
	foreach($res as $arr)
		{
		$circuits[]=$arr[0];
		}
	}

if ($table=='Risers')
	{
	$whereCondition.="(RiserIn=:id OR RiserOut=:id )";
	}
else
	{
	$whereCondition=" where NetworkRoute like '%#".$table.'='.$id."#%' ";
	}
$query="select distinct CircuitIn from OffnetPorts ".$whereCondition;
$rs = $pdo->prepare($query);
$rs->bindValue(':id',$id);
$rs->execute(); 
$res=$rs->fetchAll(PDO::FETCH_NUM);
foreach($res as $arr)
	{
	$circuits[]=$arr[0];
	}	
$query="select distinct CircuitOut from OffnetPorts ".$whereCondition;
$rs = $pdo->prepare($query);
$rs->bindValue(':id',$id);
$rs->execute(); 
$res=$rs->fetchAll(PDO::FETCH_NUM);
foreach($res as $arr)
	{
	$circuits[]=$arr[0];
	}

return array_unique($circuits);

}

function checkCircuitIntegrity($idCircuit)
{
global $pdo;
global $panelPorts;
global $eqPorts;
global $offnetPorts;
global $panelPortsIds;
global $eqPortsIds;
global $offnetPortsIds;
global $referencias;
buscarTodosPuertos($idCircuit,false);
foreach($eqPorts as $index=>$puerto)
	{
	if ($puerto[10]*1==0)
		{unset($eqPorts[$index]);}
	}
$eqPortsChecks=array();
$panelPortsChecks=array();
$offnetPortsChecks=array();
$assocErrors=0;
$assocWarns=0;

foreach($eqPorts as $index=>$puerto)
	{
	//try to get info (speed and type for the circuit)
	
	
	$eqPortsChecks[$index]=checkPortAssociation($puerto[9],$puerto[10],'Eq',$puerto[0]);
	if($eqPortsChecks[$index]=='INCOMPLETE'){$assocWarns++;}
	if($eqPortsChecks[$index]=='WRONG'){$assocErrors++;}
	}

foreach($panelPorts as $index=>$puerto)
	{
	if ($puerto[6]*1==0 ||$puerto[10]*1==0)
		{
		$panelPortsChecks[$index][0]='INCOMPLETE';
		$assocWarns++;
		if ($puerto[10]*1==0 && $puerto[6]*1!=0)
			{
			if ((checkPortAssociation($puerto[5],$puerto[6],'Panel',$puerto[0]))=='WRONG')
				{restoreConnection($puerto[5],$puerto[6],'Panel',$puerto[0],$idCircuit,'Rear','clean');}
			}
		}
	else
		{
		if ($puerto[10]*1!=$idCircuit*1)
			{$panelPortsChecks[$index][0]='OK';}
		else
			{
			$panelPortsChecks[$index][0]=checkPortAssociation($puerto[5],$puerto[6],'Panel',$puerto[0]);
			if($panelPortsChecks[$index][0]=='WRONG'){$assocErrors++;}
			}
		}
	if ($puerto[8]*1==0 ||$puerto[11]*1==0)
		{
		$panelPortsChecks[$index][1]='INCOMPLETE';
		$assocWarns++;
		if ($puerto[11]*1==0 && $puerto[8]*1!=0)
			{
			if (checkPortAssociation($puerto[7],$puerto[8],'Panel',$puerto[0])=='WRONG')
				{restoreConnection($puerto[7],$puerto[8],'Panel',$puerto[0],$idCircuit,'Front','clean');}
			}
		}
	else
		{
		if ($puerto[11]*1!=$idCircuit*1)
			{$panelPortsChecks[$index][1]='OK';}
		else
			{
			$panelPortsChecks[$index][1]=checkPortAssociation($puerto[7],$puerto[8],'Panel',$puerto[0]);
			if($panelPortsChecks[$index][1]=='WRONG'){$assocErrors++;}
			}
		}
	}
foreach($offnetPorts as $index=>$puerto)
	{
	if ($puerto[6]*1==0 || $puerto[10]*1==0 || $puerto[10]*1!=$idCircuit*1)
		{
		$offnetPortsChecks[$index][0]='OK';
		}
	else
		{$offnetPortsChecks[$index][0]=checkPortAssociation($puerto[5],$puerto[6],'Offnet',$puerto[0]);
		if($offnetPortsChecks[$index][0]=='WRONG'){$assocErrors++;}}
	if ($puerto[8]*1==0 || $puerto[11]*1==0 || $puerto[11]*1!=$idCircuit*1)
		{
		$offnetPortsChecks[$index][1]='OK';
		}
	else
		{$offnetPortsChecks[$index][1]=checkPortAssociation($puerto[7],$puerto[8],'Offnet',$puerto[0]);
		if($offnetPortsChecks[$index][1]=='WRONG'){$assocErrors++;}}
	}
	
if ($assocErrors>0)
	{
	$result=array('WRONG','Connections from '.$assocErrors.' ports are broken');
	}
else
	{
	if ($assocWarns>0)
		{
		$result=array('WARN','Incomplete connections from '.$assocWarns.' ports');
		}
	else
		{
		$result=array('OK',array());
		}
	}

return $result;
}

function checkPortAssociation($dest,$destPort,$from,$fromPort)
{
global $panelPorts;
global $eqPorts;
global $offnetPorts;
$res='WRONG';
switch($dest)
	{
	case 'Eq':
		foreach($eqPorts as $index=>$puerto)
			{
			if ($puerto[0]==$destPort && $puerto[9]==$from && $puerto[10]==$fromPort)
				{
				$res='OK';
				}
			}
		break;
	case 'Panel':
		foreach($panelPorts as $index=>$puerto)
			{
			if ($puerto[0]==$destPort && (($puerto[5]==$from && $puerto[6]==$fromPort)||($puerto[7]==$from && $puerto[8]==$fromPort)))
				{
				$res='OK';
				}
			}
		break;
	case 'Offnet':
		foreach($offnetPorts as $index=>$puerto)
			{
			if ($puerto[0]==$destPort && (($puerto[5]==$from && $puerto[6]==$fromPort)||($puerto[7]==$from && $puerto[8]==$fromPort)))
				{
				$res='OK';
				}
			}
		break;
	}
return $res;
}
//action could be restore or clean
function repairCircuit($idCircuit,$action)
{
global $panelPorts;
global $eqPorts;
global $offnetPorts;
global $panelPortsIds;
global $eqPortsIds;
global $offnetPortsIds;
global $referencias;
buscarTodosPuertos($idCircuit,false);
foreach($eqPorts as $index=>$puerto)
	{
	if ($puerto[10]*1==0)
		{unset($eqPorts[$index]);}
	}

foreach($eqPorts as $index=>$puerto)
	{
	if(checkPortAssociation($puerto[9],$puerto[10],'Eq',$puerto[0])=='WRONG')
		{restoreConnection($puerto[9],$puerto[10],'Eq',$puerto[0],$idCircuit,'Dest',$action);}
	}

foreach($panelPorts as $index=>$puerto)
	{
	if ($puerto[6]*1!=0 && $puerto[10]*1!=0)
		{
		if (checkPortAssociation($puerto[5],$puerto[6],'Panel',$puerto[0])=='WRONG')
			{restoreConnection($puerto[5],$puerto[6],'Panel',$puerto[0],$idCircuit,'Rear',$action);}
		}
	if ($puerto[8]*1!=0 && $puerto[11]*1!=0)
		{
		if (checkPortAssociation($puerto[7],$puerto[8],'Panel',$puerto[0])=='WRONG')
			{restoreConnection($puerto[7],$puerto[8],'Panel',$puerto[0],$idCircuit,'Front',$action);}
		}
	}
foreach($offnetPorts as $index=>$puerto)
	{
	if ($puerto[6]*1!=0 && $puerto[10]*1!=0)
		{
		if (checkPortAssociation($puerto[5],$puerto[6],'Offnet',$puerto[0])=='WRONG')
			{restoreConnection($puerto[5],$puerto[6],'Offnet',$puerto[0],$idCircuit,'In',$action);}
		}
	if ($puerto[8]*1!=0 && $puerto[11]*1!=0)
		{
		if (checkPortAssociation($puerto[7],$puerto[8],'Offnet',$puerto[0])=='WRONG')
			{restoreConnection($puerto[7],$puerto[8],'Offnet',$puerto[0],$idCircuit,'Out',$action);}
		}
	}
	
return 'OK';	
}

function restoreConnection($toType, $toPort,$fromType, $fromPort,  $idCircuit,$fromSide,$action)
{	
global $pdo;
if ($action=='clean')
	{
	$query="update ".$fromType."Ports set ".$fromSide."Connection=0, Circuit".$fromSide."=0,".$fromSide."Type='', Status".$fromSide."='FREE' where Id=".$fromPort;
	$rs = $pdo->prepare($query);
	$rs->execute(); 	
	}
else
	{
	switch($fromType)
		{
		case 'Eq':
			if ($toType=='Panel')
				{
				$fromSide='Rear';
				}
			if ($toType=='Offnet')
				{
				$fromSide='In';
				}
			break;
		case 'Offnet':
			if ($toType=='Panel')
				{
				$fromSide='Rear';
				}
			break;
		case 'Panel':
			if ($toType=='Offnet')
				{
				$fromSide='In';
				}
			break;
		}
	if ($toType=='Eq')
		{$fromSide='Dest';}
	$query="update ".$toType."Ports set ".$fromSide."Connection=".$fromPort.",".$fromSide."Type='".$fromType."', Circuit".$fromSide."=".$idCircuit.", Status".$fromSide."='Connected' where Id=".$toPort;
	$rs = $pdo->prepare($query);
	$rs->execute(); 	
	}
	
	
}

function disconnectPorts($fromId,$fromSide,$tablaFrom,$maintain=false)
{
global  $pdo;
$fromType=str_replace('Ports','',$tablaFrom);
$query="select ".$fromSide."Connection, ".$fromSide."Type, Circuit".$fromSide." from ".$tablaFrom." where Id=".$fromId;
//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
$res=array(false);
$maintainCircuits=0;
if ($maintain)
	{
	$maintainCircuits=1;
	}
/*if ($arr=mysql_fetch_array($rs))*/if ($arr=$rs->fetch(PDO::FETCH_BOTH))
	{
	$idCircuito=$arr[2];
	$toType=$arr[1];
	$toId=$arr[0];
	$connectionFound=false;
	switch ($toType)
		{
		case 'Panel':
			$query="select RearConnection, RearType, FrontConnection, FrontType from PanelPorts where Id=".$toId;
			//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
			/*if ($arr=mysql_fetch_array($rs))*/if ($arr=$rs->fetch(PDO::FETCH_BOTH))
				{
				if (($arr[0]*1)==($fromId*1) && ($arr[1]==$fromType))
					{
					$toSide='Rear';
					$connectionFound=true;
					}
				if (($arr[2]*1)==($fromId*1) && ($arr[3]==$fromType))
					{
					$toSide='Front';
					$connectionFound=true;
					}
				}
			break;
		case 'Eq':
			$query="select DestConnection, DestType from EqPorts where Id=".$toId;
			//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
			/*if ($arr=mysql_fetch_array($rs))*/if ($arr=$rs->fetch(PDO::FETCH_BOTH))
				{
				if (($arr[0]*1)==($fromId*1) && ($arr[1]==$fromType))
					{
					$toSide='Dest';
					$connectionFound=true;
					}
				}
			break;
		case 'Offnet':
			$query="select InConnection, InType, OutConnection, OutType from OffnetPorts where Id=".$toId;
			//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
			/*if ($arr=mysql_fetch_array($rs))*/if ($arr=$rs->fetch(PDO::FETCH_BOTH))
				{
				if (($arr[0]*1)==($fromId*1) && ($arr[1]==$fromType))
					{
					$toSide='In';
					$connectionFound=true;
					}
				if (($arr[2]*1)==($fromId*1) && ($arr[3]==$fromType))
					{
					$toSide='Out';
					$connectionFound=true;
					}
				}
			break;
		}

	$riserUpdate='';
	if ($fromType!='Eq')
		{
		$riserUpdate=' , Riser'.$fromSide.'=0, Riser'.$fromSide."Status=''";
		}
	$labelUpdate='';
	if ($fromType!='Offnet')
		{
		$labelUpdate=', Label'.$fromSide."='Unchecked'";
		}
	$newCircuit='0';
	if ($maintain)
		{
		$newCircuit=$idCircuito;
		}
	$query="update ".$fromType."Ports set Circuit".$fromSide."='".$newCircuit."', CableType".$fromSide."='', ".$fromSide."Type='',".$fromSide."Connection=0,Status".$fromSide."='FREE' ".$riserUpdate.$labelUpdate." where Id=".$fromId;
	//mysql_query($query);	
	$rs3 = $pdo->prepare($query);
	$rs3->execute();
	guardarEvolucion('Disconnect', $fromType."Ports", $fromId,'#Circuits='.$idCircuito.'#');
	
	if ($connectionFound)
		{
		$riserUpdate='';
		if ($toType!='Eq')
			{
			$riserUpdate=' , Riser'.$toSide.'=0, Riser'.$toSide."Status=''";
			}
		$labelUpdate='';
		if ($toType!='Offnet')
			{
			$labelUpdate=', Label'.$toSide."='Unchecked'";
			}
		$query="update ".$toType."Ports set Circuit".$toSide."='0', CableType".$toSide."='', ".$toSide."Type='',".$toSide."Connection=0,Status".$toSide."='FREE' ".$riserUpdate.$labelUpdate." where Id=".$toId;
		//mysql_query($query);
		$rs3 = $pdo->prepare($query);
		$rs3->execute();		
		guardarEvolucion('Disconnect', $toType."Ports", $toId,'#Circuits='.$idCircuito.'#');
		
		$risersLiberados='';
		$risersLiberados.=actualizarEstadoRiserDesconexion($toType,$toSide,$toId,$idCircuito).',';
		if (!$maintain)
			{$risersLiberados.=actualizarEstadoRiserDesconexion($fromType,$fromSide,$fromId,$idCircuito).',';}
		$risersLiberados=substr($risersLiberados,0,-1);
		
		$res[0]=true;
		$res[1]=array($fromId,$fromType,$fromSide,$toId,$toType,$toSide,$risersLiberados,$maintainCircuits);
		}
	else
		{
		$res[0]=true;
		$res[1]=array($fromId,$fromType,$fromSide,0,'','','',$maintainCircuits);
		}
	}
return $res;
}

function actualizarEstadoRiserDesconexion($toType,$toSide,$toId,$circuit)
{
global $pdo;
if ($toType=='Panel' || $toType=='Offnet')
	{
	if ($toType=='Panel')
		{
		$toOtherSide='Rear';
		if ($toSide=='Rear')
			{
			$toOtherSide='Front';
			}
		}
	if ($toType=='Offnet')
		{
		$toOtherSide='In';
		if ($toSide=='In')
			{
			$toOtherSide='Out';
			}
		}
	$query="select Riser".$toOtherSide.", ".$toOtherSide."Type, ".$toOtherSide."Connection,Riser".$toOtherSide."Status from ".$toType."Ports where Id=".$toId;
	//$rs=mysql_query($query);
$rs = $pdo->prepare($query);
$rs->execute();
	if ($arr=$rs->fetch(PDO::FETCH_NUM))
	//if ($arr=mysql_fetch_array($rs,MYSQL_NUM))
		{
		if (($arr[0]*1)!=0)
			{
			if ($arr[1]=='Panel')				
				{
				$followingRiserSides=array('Front','Rear');
				}
			else
				{
				$followingRiserSides=array('In','Out');
				}
			$query="select Riser".$followingRiserSides[0].",Riser".$followingRiserSides[1]." from ".$arr[1]."Ports where Id=".$arr[2];
			/*$rs2=mysql_query($query);
			if ($arr2=mysql_fetch_array($rs2,MYSQL_NUM))*/
			$rs2 = $pdo->prepare($query);
			$rs2->execute();
			if ($arr2=$rs2->fetch(PDO::FETCH_NUM))
				{
				if ($arr2[0]==$arr[0])
					{
					$followingRiserSide=$followingRiserSides[0];
					$followingRiserOtherSide=$followingRiserSides[1];
					}
				else
					{
					$followingRiserSide=$followingRiserSides[1];
					$followingRiserOtherSide=$followingRiserSides[0];
					}
				
				$query="select Status".$followingRiserOtherSide." from ".$arr[1]."Ports where Id=".$arr[2];
				/*$rs3=mysql_query($query);
				$arr3=mysql_fetch_array($rs3,MYSQL_NUM);*/
				$rs3 = $pdo->prepare($query);
				$rs3->execute();
				$arr3=$rs3->fetch(PDO::FETCH_NUM);
				if ($arr3[0]=='FREE' || $arr3[0]=='')
					{	
					$query="update ".$toType."Ports set Riser".$toOtherSide."Status='AVAILABLE', Circuit".$toOtherSide."='0' where Id=".$toId;
					//mysql_query($query);
					$rs4 = $pdo->prepare($query);
					$rs4->execute();
					if ($arr[3]=='SERVICE')
						{
						$query="update Risers set Available=Available+1 where Id=".$arr[0];
						//mysql_query($query);
						$rs4 = $pdo->prepare($query);
						$rs4->execute();
						$query="insert into RiserResources (Riser,Resources,`Type`,`Element`) values (".$arr[0].",".'1'.",'Disconnection','".$circuit."')";
						//mysql_query($query);
						$rs4 = $pdo->prepare($query);
						$rs4->execute();
						}	
					
					$query="update ".$arr[1]."Ports set Riser".$followingRiserSide."Status='AVAILABLE', Circuit".$followingRiserSide."='0'  where Id=".$arr[2];
					//mysql_query($query);
					$rs4 = $pdo->prepare($query);
					$rs4->execute();
					return $arr[0];
					}
				else
					{
					return 0;
					}
				}
			else
				{
				return 0;
				}
			}
		else
			{
			return 0;
			}
		}
	else
		{
		return 0;
		}

	}
else
	{
	return 0;
	}
}


function changeCircuitReference($table,$tableId,$side,$idCircuit)
{
global $pdo;
$fromType=str_replace('Ports','',$table);
$fromSide=str_replace('Circuit','',$side);

//update circuit on the port
$query="update ".sanitizeSqlName($table)." set ".sanitizeSqlName("Circuit".$fromSide)."=:circuit where Id=:id";
$rs = $pdo->prepare($query);
$rs->bindValue(':id',$tableId,PDO::PARAM_INT);
$rs->bindValue(':circuit',$idCircuit);
$rs->execute(); 

//get possible connection
$query="select ".sanitizeSqlName($fromSide."Connection").", ".sanitizeSqlName($fromSide."Type")." from ".sanitizeSqlName($table)." where Id=:id";
$rs = $pdo->prepare($query);
$rs->bindValue(':id',$tableId,PDO::PARAM_INT);
$rs->execute(); 
if ($arr=$rs->fetch(PDO::FETCH_NUM))
	{
	$rs->closeCursor();
	$toSide='';
	if ($arr[0]!='0')
		{
		if ($arr[1]=='Eq')
			{
			$toSide='Dest';
			}
		else
			{
			//get side for destination port
			if ($arr[1]=='Panel')
				{
				$sides=array('Front','Rear');
				}
			else
				{
				$sides=array('In','Out');
				}
			$query="select ".$sides[0]."Type , ".$sides[0]."Connection, ".$sides[1]."Type , ".$sides[1]."Connection, Riser".$sides[0].", Riser".$sides[1].",Riser".$sides[0]."Status, Riser".$sides[1]."Status from ".$arr[1]."Ports where Id=:id";
			$rs = $pdo->prepare($query);
			$rs->bindValue(':id',$arr[0],PDO::PARAM_INT);
			$rs->execute();
			if ($arr2=$rs->fetch(PDO::FETCH_NUM))
				{
				$rs->closeCursor();
				if ($arr2[0]==$fromType && $arr2[1]==$tableId)
					{
					$toSide=$sides[0];
					$riser=$arr2[4];
					$riserStatus=$arr2[6];
					}
				else
					{
					$toSide=$sides[1];
					$riser=$arr2[5];
					$riserStatus=$arr2[7];
					}
				
				//update riser status if it's a riser connection
				if ($riser!='0' && $riserStatus=='AVAILABLE')
					{
					$query="update ".sanitizeSqlName($table)." set ".sanitizeSqlName("Riser".$fromSide."Status")."='SERVICE' where Id=:id";
					$rs = $pdo->prepare($query);
					$rs->bindValue(':id',$tableId,PDO::PARAM_INT);
					$rs->execute(); 
					
					$query="update ".$arr[1]."Ports set ".sanitizeSqlName("Riser".$toSide."Status")."='SERVICE' where Id=:id";
					$rs = $pdo->prepare($query);
					$rs->bindValue(':id',$arr[0],PDO::PARAM_INT);
					$rs->execute(); 
					
					$query="update Risers set Available=Available-1 where Id=:id";
					$rs = $pdo->prepare($query);
					$rs->bindValue(':id',$riser,PDO::PARAM_INT);
					$rs->execute();
					
					$query="insert into RiserResources (Riser,Resources,`Type`,`Element`) values (:id,".'-1'.",'Connection',:circuit)";
					$rs = $pdo->prepare($query);
					$rs->bindValue(':id',$riser,PDO::PARAM_INT);
					$rs->bindValue(':circuit',$idCircuit);
					$rs->execute();
					
					}
				
				//update riser status in both directions
				actualizarEstadoRiser($arr[1],$toSide,$arr[0],$idCircuit);
				actualizarEstadoRiser($fromType,$fromSide,$tableId,$idCircuit);
				}
			else
				{
				$rs->closeCursor();
				}
			}
		
		//update destination port circuit
		$query="update ".sanitizeSqlName($arr[1].'Ports')." set Circuit".$toSide."=:circuit where Id=:toId";
		$rs = $pdo->prepare($query);
		$rs->bindValue(':toId',$arr[0],PDO::PARAM_INT);
		$rs->bindValue(':circuit',$idCircuit);
		$rs->execute();
		}
	}
}

?>