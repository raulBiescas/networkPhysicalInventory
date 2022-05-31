/*!
 * netForms.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 netFOrms.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

window.addEvent('domready', function() {

$$('.newTechForm').each(function(item)
	{
	item.getElements('input[type="radio"]').addEvent('click',function(e){redOrBlue(e.target);});
	});

$$('.newTech').addEvent('click',function(e){showNewTechs(e.target);});	

$$('.cerrarNewTech').addEvent('click',function(e){cerrarNewTech(e.target);});

$$('.botonNewTech').addEvent('click',function(e){uploadNewTech(e.target);});	

});

function cerrarNewTech(el)
{
el.getParent('.areaNewTech').addClass('oculto');
var area=el.getParent('.areaNewTech');
var formulario=area.getElement('form');
formulario.getElement('.systemNameInput').getElement('input').value="";
formulario.getElement('.systemNameInput').addClass('oculto');
setRadioValue(formulario,'System','BLUE');
}

function uploadNewTech(el)
{
var area=el.getParent('.areaNewTech');
var formulario=area.getElement('form');
var seguir=true;
if (!area.getElement('.systemNameInput').hasClass('oculto'))
	{
	if (area.getElement('input[name="SystemName"]').value=='')
		{
		alert('Please enter a system name');
		seguir=false;
		}
	}
if (seguir)
	{
	var tablaDiv=area.get('tablaDiv');
	var id=area.get('parentId');
	var tabla=area.get('tabla');
	var formObjects=formulario.toQueryString().parseQueryString();
	newElementTablaDiv(tablaDiv,tabla,id,JSON.encode(formObjects));
	}

}

function showNewTechs(el)
{
var cont=el.getParent('.independentBlock');
cont.getElement('.areaNewTech').removeClass('oculto');
}

function redOrBlue(el)
{
var name=el.get('name');
var form=el.getParent('.newTechForm');
var systemName=form.getElement('.systemNameInput');
if (getRadioValue(form,name)=='NO')
	{
	systemName.removeClass('oculto');
	}
else
	{
	systemName.addClass('oculto');
	systemName.getElement('input').value="";
	}
}