<?php


/*!
 * finder.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 finder.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

/*classes
block:finderBlock 
	options: allowLocal for local searchs
title line: finderTitle
search line: finderLine + labelFinder + finderInputBlock
button: finderButton
*/


//$params should have inputs array and parameter called finderValue 
function finderResults($params)
{
$maxSearchResults=100;
if (array_key_exists('finderValue',$params))
	{
	
	//$inputs['EquipmentFinder']=array('eqFinderOptions','cardFinderOptions','eqPortsFinderOptions');
	$inputs['EquipmentFinder']=array('eqFinderOptions','cardFinderOptions');
	$tables['EquipmentFinder']=array('EqChassis','Cards','EqPorts');
	$select['eqFinderOptions']="eq.Id";
	$select['cardFinderOptions']="c.Id";
	$table['eqFinderOptions']=" EqChassis eq";
	$prefix['eqFinderOptions']="eq";
	$prefix['cardFinderOptions']="c";
	$prefix['eqPortsFinderOptions']="eP";
	$fields['eqFinderOptions']=array('Vendor','Model','TID','Name'); 
	$fields['cardFinderOptions']=array('SerialNumber','AssetTag','PartNumber','Name','Slot');
	$table['cardFinderOptions']=' inner join `Cards` c on c.`Equipment`=eq.`Id`';
	$table['eqPortsFinderOptions']=' inner join `EqPorts` eP on eP.`Card`=c.`Id`';
	$whereConditions['eqFinderOptions']="and eq.System!='DEPRECATED' AND eq.System!='REMOVED'";
	$whereConditions['cardFinderOptions']="and c.System!='DEPRECATED' AND c.System!='REMOVED'";
	$localJoin['EquipmentFinder']=" inner join `Racks` rc on eq.Rack=rc.Id inner join `Rooms` rm on rc.Room=rm.Id inner join Floors f on rm.Floor=f.Id inner join Sites s on f.Site=s.Id";
	
	$inputs['SiteFinder']=array('siteFinderOptions');
	$tables['SiteFinder']=array('Sites');
	$select['siteFinderOptions']="s.Id";
	$table['siteFinderOptions']=" Sites s";
	$prefix['siteFinderOptions']="s";
	$fields['siteFinderOptions']=array('Name','SystemName','City','Address','PostalCode'); 
	$whereConditions['siteFinderOptions']="";
	
	$selectClause="select ";
	$fromClause=" from ";
	$whereClause=" where 1 ";
	
	$resultTables=array();
	$resultFields=array();
	$extraTypes=array();
	$resultTypes=array();

	if (array_key_exists($params['finderValue'],$inputs))
		{
		$maxLevel=0;
		$counter=1;
		foreach($inputs[$params['finderValue']] as $input)
			{
			if (array_key_exists($input,$params))
				{
				if (trim($params[$input])!='')
					{
					$maxLevel=$counter;
					}
				}
			$counter++;
			}
		$i=0;
		foreach($inputs[$params['finderValue']] as $input)
			{
			if ($i++<$maxLevel)
				{
				$resultTypes=array_merge($resultTypes,tipoCampos($tables[$params['finderValue']][$i-1]));
				$resultTables[]=$tables[$params['finderValue']][$i-1];
				if ($i>1)
					{
					if (array_key_exists($input,$prefix))
						{
						$selectClause.=' `'.$prefix[$input].'`.`Id` as `Id'.$tables[$params['finderValue']][$i-1].'`,';
						}
					$resultFields[]='Id'.$tables[$params['finderValue']][$i-1];
					$extraTypes['Id'.$tables[$params['finderValue']][$i-1]]='int';
					}
				if (array_key_exists($input,$select))
					{$selectClause.=$select[$input].',';}
				if (array_key_exists($input,$fields))
					{
					foreach ($fields[$input] as $field)
						{
						$resultFields[]=$field;
						if (array_key_exists($input,$prefix))
							{
							$selectClause.=' `'.$prefix[$input].'`.`'.$field.'` ,';
							}
						else
							{
							$selectClause.=' `'.$field.'` ,';
							}
						}
					}
				if (array_key_exists($input,$table))
					{$fromClause.=$table[$input];}
				if (array_key_exists($input,$params))
					{
					if (trim($params[$input])!='')
						{
						$searchValues=explode(' ',trim($params[$input]));
						foreach($searchValues as $searchString)
							{
							
							if (array_key_exists($input,$fields))
								{
								$whereClause.=$whereConditions[$input]." AND (";
								foreach ($fields[$input] as $field)
									{
									if (array_key_exists($input,$prefix))
										{
										$whereClause.="`".$prefix[$input]."`.`".$field."` like '%".$searchString."%' OR ";
										}
									else
										{
										$whereClause.="`".$field."` like '%".$searchString."%' OR ";
										}
									}
								$whereClause=substr($whereClause,0,-3).') ';
								}
							}
						}
					}
				}
			}
		if ($maxLevel>0)
			{
				//local
			if (array_key_exists('localOnly',$params) && array_key_exists('localCondition',$params))
				{
				$fromClause.=$localJoin[$params['finderValue']];
				$whereClause.=' AND '.$params['localCondition'];
				}
			$query=substr($selectClause,0,-1).$fromClause.$whereClause.' limit 0,'.$maxSearchResults;
			
			echo '<div class="resultsEstrucuture oculto">';
				echo '<div class="resultTables">'.implode(',',$resultTables).'</div>';
			
			echo '</div>';
			
			echo '<div class="searchResultsArea oculto" id="results'.$params['finderValue'].'">';
				tablaDivSoloLineas('searchResultsTable',$resultFields,array_merge($resultTypes, $extraTypes),$query,false,array());
			echo '</div>';
			echo '<div class="searchResultsPages"></div>';
			echo '<script>finderResultsLoaded("'.$params['finderValue'].'");</script>';
			
			}
		}
	}

	

}

function finderAllMenus($localCondition='')
{
echo '<div class="localFinderLine"><form class="globalSeachParameters"><span class="oculto"><input type="text" name="localCondition" value="'.$localCondition.'"></span><span>only local searchs</span><input type="checkbox" name="localOnly"/></form></div>';
finderMenu('Sites');
finderMenu('Circuits');
finderMenu('Equipments');

}

function finderMenu($type,$extraClass='',$relativePath='')
{
$idMenu="finderMenu".$type.time();
switch ($type)
	{
	case 'Circuits':
		echo '<div id="'.$idMenu.'" relativePath="'.$relativePath.'" class="finderBlock '.$extraClass.'" type="Circuits" allowLocal="no">';
			echo '<div class="finderTitle">Circuits (local not allowed)</div>';
			echo '<form id="circuitSearchForm">';
				echo '<div class="finderLine mainFinderLine" target="circuit.php?id="><div class="labelFinder">Circuit/Customer</div>';
				$campos=tipoCampos('References');
				echo '<div class="finderInputBlock" style="width:100px;">';
				generarControl('','0','Type',$campos['Type']);
				echo '</div><div class="finderInputBlock" style="width:180px;"><input class="jsonInput" type="text" name="circuitSearch"></div><div class="clear"></div></div>';
			echo '</form>';
		echo '</div>';	
		return $idMenu;
		break;
	case 'Equipments':
		echo '<div id="'.$idMenu.'" relativePath="'.$relativePath.'" class="finderBlock '.$extraClass.'" type="Equipments" allowLocal="yes">';
			echo '<div class="finderTitle"><span>Equipments</span><span class="finderButton" title="search"></span><span class="botonLink clearSearch">clear</span></div>';
			echo '<form id="equipmentSearchForm">';
				echo '<div class="finderLine mainFinderLine">';
					echo '<div class="labelFinder">Eq:</div>';
					echo '<div class="finderInputBlock" style="width:150px;"><input type="text" name="eqFinderOptions" style="width:150px;"/></div>';
					echo '<div class="clear"></div>';
				echo '</div>';
				echo '<div class="finderLine mainFinderLine">';
					echo '<div class="labelFinder">Card:</div>';
					echo '<div class="finderInputBlock" style="width:150px;"><input type="text" name="cardFinderOptions" style="width:150px;"/></div>';
					echo '<div class="clear"></div>';
				echo '</div>';
				/*echo '<div class="finderLine mainFinderLine">';
					echo '<div class="labelFinder">Ports:</div>';
					echo '<div class="finderInputBlock" style="width:150px;"><input type="text" name="eqPortsFinderOptions" style="width:150px;"/></div>';
					echo '<div class="clear"></div>';
				echo '</div>';*/
				echo '<div class="oculto"><input type="text" value="EquipmentFinder" name="finderValue"></div>';
			echo '</form>';
				echo '<div class="resultsFinderBlock"></div>';
		echo '</div>';	
		return $idMenu;
		break;
	case 'Sites':
		echo '<div id="'.$idMenu.'" relativePath="'.$relativePath.'" class="finderBlock '.$extraClass.'" type="Sites" allowLocal="no">';
			echo '<div class="finderTitle"><span>Sites</span><span class="finderButton" title="search"></span><span class="botonLink clearSearch">clear</span></div>';
			echo '<form id="siteSearchForm">';
				echo '<div class="finderLine mainFinderLine">';
					echo '<div class="labelFinder">Site:</div>';
					echo '<div class="finderInputBlock" style="width:150px;"><input type="text" name="siteFinderOptions" style="width:150px;"/></div>';
					echo '<div class="clear"></div>';
				echo '</div>';

				echo '<div class="oculto"><input type="text" value="SiteFinder" name="finderValue"></div>';
			echo '</form>';
				echo '<div class="resultsFinderBlock"></div>';
		echo '</div>';	
		return $idMenu;
		break;
	}
}

?>