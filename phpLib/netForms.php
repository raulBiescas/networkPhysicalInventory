<?php

/*!
 * netForms.php
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 netForms.php Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

function formNewTech($tabla,$tablaDiv, $id,$type="")
{
	echo '<div class="areaNewTech oculto" tablaDiv="'.$tablaDiv.'" tabla="'.$tabla.'" parentId="'.$id.'">';
	echo '<div class="botonCerrar cerrarNewTech conTip" title="close"></div>';
	echo '<form id="newTech'.$tabla.$id.'" action="ajax/newTech.php" method="post" class="mainForm newTechForm">';
	echo'
		<input type="radio" name="System" checked="checked" value="BLUE">Blue</br>
		<input type="radio" name="System" value="NO">Red (PRO)</br>
		</br>
		';
	
	echo '<div class="lineaInputs systemNameInput oculto"><label for="SystemName">System Name</label><div class="grupoInputs">';
	echo '<input type="text" name="SystemName"></input>';
	echo '</div><div class="clear"></div></div>';
	
	echo '<input type="text" class="oculto" name="Type" value="'.$type.'"></input>';
	echo '<div class="botonSubmit botonNewTech">CREATE</div>';
	echo '</form>';
	echo '</div>';
}
?>