 <?php

/*!
 * drawingISP.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 drawingISP.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

function dibujarCuadricula($filas,$columnas)
{
$i=0;

while ($i<$filas)
	{
	echo '<div class="fila">';
	$j=0;
	while ($j<$columnas)
		{
		echo '<div class="baldosa" fila="'.$i.'" columna="'.$j.'">';
		if($j==$columnas-1){
			echo '<div class="vertice verticenormal" fila="'.$i.'" columna="'.$j.'"></div>';
			echo '<div class="vertice verticeultcol" fila="'.$i.'" columna="'.($j+1).'"></div>';
			}
		else
			echo '<div class="vertice verticenormal" fila="'.$i.'" columna="'.$j.'"></div>';
			
		if($i==$filas-1)			
			echo '<div class="vertice verticeultfil" fila="'.($i+1).'" columna ="'.$j.'"></div>';
		
		if($j==$columnas-1 && $i==$filas-1)			
			echo '<div class="vertice verticeult" fila="'.($i+1).'" columna ="'.($j+1).'"></div>';
			
		echo '</div>';
		$j++;
		}
	echo '</div>';//fila
	echo '<div class="clear"></div>';
	$i++;
	}

}

function dibujarPlanta()
{
echo '<div class="extHorizontal" posicion="arriba"></div>';
echo '<div class="extVertical" posicion="izquierda"></div>';
echo '<div class="extVertical" posicion="derecha"></div>';
echo '<div class="extHorizontal" posicion="abajo"></div>';
echo '<div class="areaPlanta"></div>';
echo '<div class="areaNorte"></div>';
}

//pictures and racks are relatively placed to the container room/suite
function adjustRoomElements($room,$x,$y)
{
global $pdo;
$query="update Racks set XPos=XPos+:x , YPos=YPos+:y where Room=:id";
$rs = $pdo->prepare($query);
$rs->bindValue(':x',$x);
$rs->bindValue(':y',$y);
$rs->bindValue(':id',$room,PDO::PARAM_INT);
$rs->execute(); 
$query="update Pictures set XPos=XPos+:x , YPos=YPos+:y where Tabla='Rooms' and IdTabla=:id";
$rs = $pdo->prepare($query);
$rs->bindValue(':x',$x);
$rs->bindValue(':y',$y);
$rs->bindValue(':id',$room,PDO::PARAM_INT);
$rs->execute(); 

}


?>