/*!
 * networkElements.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 networkElements.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */


function continueElementCreation(elType, parentTable,parentId,locationType,copyFirst) //type is for new element table (CriticalInfra...), location type could be rack or box
{
//works on networkElementCreationRight
var subtype='';
$('newNetworkElementbasicInfo').getElement('.botonCrear').destroy();
switch(elType)
	{
	case 'CriticalInfra':
		subtype=$('newNetworkElementbasicInfo').getElement('select[name="Type"]').value;
		$('newNetworkElementbasicInfo').getElement('select[name="Type"]').readOnly=true;
		$('newNetworkElementbasicInfo').getElement('input[name="Name"]').readOnly=true;
		break;
	}
if (copyFirst)
	{
	$('networkElementCreationRight').load('ajax/selectElementToCopy.php?type='+elType+'&parentTable='+parentTable+'&parentId='+parentId+'&subtype='+subtype);
	}
else
	{
	$('networkElementCreationRight').load('ajax/selectLocationToCreate.php?locationType='+locationType+'&type='+elType+'&parentTable='+parentTable+'&parentId='+parentId);
	}

}

function checkNetworkCreationForm()
{
//on form newNetworkElementbasicInfo
var formul='newNetworkElementbasicInfo';
switch ($(formul).get('elType'))
	{
	case 'CriticalInfra':
		if (getSelectValue($(formul),'Type')!='' && $(formul).getElement('input[name="Name"]').value.trim()!='' )
		{
			return true;
		}
	else
		{
			alert('Please select an asset type and assign a name.');
			return false;
		}
		break;
	}
}

function continueElementCreationStep2(e)
{
//what if copying?	
$("popUp").load('ajax/newElementCreated.php?'+serializarFormulario('newNetworkElementbasicInfo')+serializarFormulario('newElementLocationForm'));

}