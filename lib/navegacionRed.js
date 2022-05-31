/*!
 * navegacionRed.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 navegacionRed.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

function inicializarNavegacion()
{
$$('.filaNavegacion').each(function(item)
	{
	if (item.getElement('.lineaDatos'))
		{
		var linea=item.getElement('.lineaDatos');
		linea.addClass('oculto');
		item.getElement('.nombreElementoNavegacion').set('html',nombreNetwork(item.get('tabla'),linea));
		}
	});
$$('.changeNavigationElement').each(function(item)
	{
	item.addEvent('click',function(e)
		{
		$$('.stayNavigationElement').addClass('oculto');
		$$('.changeNavigationElement').removeClass('oculto');
		cambiarNavegacion(e.target);
		});
	});
$$('.stayNavigationElement').each(function(item)
	{
	item.addEvent('click',function(e)
		{
		$$('.listaNavegacion').each(function(el){el.empty();});
		e.target.addClass('oculto');
		var bloque=e.target.getParent('.bloqueNavegacion');
		bloque.getElement('.changeNavigationElement').removeClass('oculto');
		});
	});
	
$$('.useNavigationElement').addEvent('click',function(e){var el=e.target;networkElementSelected(el.get('level'),el.get('idElement'),el.getParent('.containerListaNavegacion'));});

setSelectValuePerValue($("areaFilterSelect"),idArea+'');

$("areaFilterSelect").addEvent('change',function(e){cambiarNavegacion($("areaFilterSelect"));});

if ($('navigationContainerBlock'))
	{
	var lineaSites=$('navigationContainerBlock').getElement('.bloqueNavegacion[nivel="0"]').getElement('.filaNavegacion');
	if (lineaSites.get('idTabla')=='0')
		{cambiarNavegacion(lineaSites);}
	}


}

//requires callback function continueSiteSelection(selectedLines, messageArea, callbackParameter)
function selectSiteWindow(allowMultiple, callback)
{
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
$('popUp').set('html',selectSiteTemplate(allowMultiple, callback));
$('selectSiteFromList').addEvent('click',function(){
	$('navigationContainerBlock').load(networkRelativePath+'ajax/navigateNetwork.php?tabla=Sites');
	});

$('continueSiteSelection').addEvent('click',function(){
	if (typeof(continueSiteSelection)=='function')
		{
		continueSiteSelection($('selectedSitesList').getElements('.selectedLine'), $('mensajeNuevosSites'), $('containerSelectSites').get('callback'));
		}
	});	
$$('.navigationFinderBlock').each(function(item)
	{
	item.load(networkRelativePath+'ajax/finderMenu.php?search='+item.get('search')+'&relativePath='+encodeURIComponent(networkRelativePath));
	});
}

function selectSiteTemplate(allowMultiple, callback)
{
var classAllow='deny';
if (allowMultiple)
	{classAllow='allow';}
var html='<div id="containerSelectSites" multiple="'+classAllow+'" callback="'+callback+'" style="position:absolute;width:100%;height:100%;left:0px;top:0px;"><div id="mensajeNuevosSites" class="oculto"></div>';
html+='<div class="navigationLeftArea">';
	html+='<div class="tituloTabla">Selection options:</div>';
	html+='<div style="margin-top:10px;"><span id="selectSiteFromList" class="botonLink selectSiteOption" typeSelection="sitesList">1. Get site list to select.</span></div>';
	//html+='<div style="padding-left:5px;margin-top:10px;"><span class="botonLink selectSiteOption" typeSelection="areasList">Select using Areas.</span></div>';
	html+='<div style="padding-left:5px;margin-top:30px;" style="text-decoration:bold;"> 2. Search for a site:</div>';
	html+='<div style="padding-left:5px;margin-top:5px;" class="navigationFinderBlock" search="Sites"></div>';
html+='</div>';//navigationLeftArea
html+='<div class="navigationCentralArea">';
	html+='<div id="navigationContainerBlock" class="containerListaNavegacion" multiple="'+classAllow+'" tipo="site"></div>';
html+='</div>';//navigationCentralArea
	
html+='<div class="navigationRightArea">';
	html+='<div class="tituloTabla">Selected sites:</div>';
	html+='<div id="selectedSitesList"></div>';
	html+='<br/><div id="continueSiteSelection" class="boton botonCrear oculto" style="margin-bottom:20px;">CONTINUE</div>';
html+='</div>';//navigationRightArea
return html;
}


function networkElementSelected(nivel,idSeleccionado,container)
{
switch(container.get('tipo'))
	{
	case  'site': //or adds item to selected sitesList and shows continueSiteSelection button or calls function afterSiteSelectionNavigation
		if ($('selectedSitesList'))
			{
			var listContainer=$('selectedSitesList');
			if (container.get('multiple')=='deny')
				{
				listContainer.empty();
				}
			if (listContainer.getElements('.selectedLine[selectedId="'+idSeleccionado+'"]').length==0)
				{
				var bloqueNavegacion=container.getElement('.bloqueNavegacion[nivel="'+nivel+'"]');
				var nombre=bloqueNavegacion.getElement('.nombreElementoNavegacion').get('text');
				var selectLine=new Element('div',{'class':'selectedLine','selectedId':idSeleccionado, 'html':'<span class="nameInNavigationList">'+nombre+'</span><span class="botonLink unselectButton">unselect</span>'}).inject(listContainer);
				selectLine.getElement('.unselectButton').addEvent('click',function(e){e.target.getParent('.selectedLine').destroy();});
				$('continueSiteSelection').removeClass('oculto');
				}
			}
		else
			{
			if (typeof(afterSiteSelectionNavigation)=='function')
				{
				afterSiteSelectionNavigation(idSeleccionado);
				}
			}
			
	break;
	case  'riser':
		$('finalizarNewRiser').addClass('oculto');
		if (nivel=='4')
			{
			if (idSeleccionado==$('panelInfoForm').get('idForm'))
				{alert('Riser using the same panel at both sides not allowed');}
			else
				{
				$('infoDestPanel').load('ajax/getPanelInfo.php?id='+idSeleccionado);
				container.getElement('.bloqueNavegacion[nivel="4"]').getElement('.listaNavegacion').empty();
				}
			}
		break;
	case  'precabling':
		$('continuarNewPrecabling').addClass('oculto');
		if (nivel=='4')
			{
			$('infoDestPanel').load('ajax/getPanelInfo.php?id='+idSeleccionado);
			container.getElement('.bloqueNavegacion[nivel="4"]').getElement('.listaNavegacion').empty();
			}
		break;
	case  'riserOffnet':
		var bloqueNavegacion=container.getElement('.bloqueNavegacion[nivel="'+nivel+'"]');
		$('lugarRiserOffset').removeClass('oculto');
		$('finalizarNewRiser').removeClass('oculto');
		var tabla=bloqueNavegacion.getElement('.filaNavegacion').get('tabla');
		var id=bloqueNavegacion.getElement('.filaNavegacion').get('idTabla');
		var nombre=bloqueNavegacion.getElement('.nombreElementoNavegacion').get('html');
		$('lugarRiserOffset').empty();
		$('lugarRiserOffset').set('html','Create the ports on the element (type:'+tabla+') : ' +nombre);
		$('lugarRiserOffset').set('tabla',tabla);
		$('lugarRiserOffset').set('idTabla',id);
		break;
	case 'PanelPorts':
		limpiarPuertosConexiones();
		$('finalizarNewConnection').addClass('oculto');
		if (nivel=='4')
			{
			$('infoDestPanel').load('ajax/getPanelInfo.php?id='+idSeleccionado);
			container.getElement('.bloqueNavegacion[nivel="4"]').getElement('.listaNavegacion').empty();
			}
		break;
	case 'EqPorts':
		limpiarPuertosConexiones();
		$('finalizarNewConnection').addClass('oculto');
		if (nivel=='4')
			{
			$('containerDestEqConnection').load('ajax/equipmentForConnect.php?id='+idSeleccionado);
			container.getElement('.bloqueNavegacion[nivel="4"]').getElement('.listaNavegacion').empty();
			}
		break;
	case 'newOffnetPorts':
		var bloqueNavegacion=container.getElement('.bloqueNavegacion[nivel="'+nivel+'"]');
		$('lugarPortOffnet').removeClass('oculto');
		$('finalizarNewConnection').removeClass('oculto');
		var tabla=bloqueNavegacion.getElement('.filaNavegacion').get('tabla');
		var id=bloqueNavegacion.getElement('.filaNavegacion').get('idTabla');
		var nombre=bloqueNavegacion.getElement('.nombreElementoNavegacion').get('html');
		$('lugarPortOffnet').empty();
		$('lugarPortOffnet').set('html','Create the ports on the element (type:'+tabla+') : ' +nombre);
		$('lugarPortOffnet').set('tabla',tabla);
		$('lugarPortOffnet').set('idTabla',id);
		break;
	//for copying and moving cards
	case 'eqChassis':
		if ($('cardsWorkingArea')&& nivel=='4')
			{
			$('cardsWorkingArea').removeClass('oculto');
			var bloqueNavegacion=container.getElement('.bloqueNavegacion[nivel="'+nivel+'"]');
			var nombre=bloqueNavegacion.getElement('.nombreElementoNavegacion').get('text');
			$('eqDestination').set('idEquipment',idSeleccionado);
			$('eqDestination').set('text',nombre);
			}
		break;
	case 'OffnetPorts':
		$('containerExistingOffnet').removeClass('oculto');
		var blocks=container.getElements('.bloqueNavegacion');
		var table=blocks[(nivel*1)].getElement('.filaNavegacion').get('tabla');
		$('containerExistingOffnet').load('ajax/getFreeOffnet.php?id='+idSeleccionado+'&table='+table+'&connector='+getSelectValue($('valoresEditablesNewConnection'),'CableType'));
		/*only for last level
		var table=blocks[blocks.length-1].getElement('.filaNavegacion').get('tabla');
		var maxLevel=blocks.length-1;
		if (nivel==maxLevel)
			{
			$('infoDestPanel').load('ajax/getFreeOffnet.php?id='+idSeleccionado+'&table='+table);
			container.getElement('.bloqueNavegacion[nivel="'+maxLevel+'"]').getElement('.listaNavegacion').empty();
			}
			*/
		break;
	case 'move':
		var blocks=container.getElements('.bloqueNavegacion');
		if (nivel==(blocks.length-1))
			{
			var table=blocks[(nivel*1)].getElement('.filaNavegacion').get('tabla');
			var field='';
			switch (table)
				{
				case 'Racks':
					field='Rack';
				break;
				case 'Rooms':
					field='Room';
				break;
				}
			if (field!='')
				{
				$('moveElementForm').getElement('input[name="'+field+'"]').value=idSeleccionado;
				$('completeMove').removeClass('oculto');
				blocks[(nivel*1)].getElement('.listaNavegacion').empty();
				}
			}
		else
			{
			$('completeMove').addClass('oculto');
			}
		break;
	
	}

}


function cambiarNavegacion(el)
{
var bloque=el.getParent('.bloqueNavegacion');
var idAnterior=0;
if (bloque.getElement('.filtroFilaNavegacion'))
	{
	idAnterior=bloque.getElement('.filtroFilaNavegacion').getElement('select').options[bloque.getElement('.filtroFilaNavegacion').getElement('select').selectedIndex].value;
	}
if (bloque.get('nivel')!='0')
	{
	idAnterior=bloque.getPrevious('.bloqueNavegacion').getElement('.filaNavegacion').get('idTabla');
	}
$$('.listaNavegacion').each(function(el){el.empty();});
bloque.getElement('.listaNavegacion').load(networkRelativePath+'ajax/listaNavegacion.php?nivel='+bloque.get('nivel')+'&tabla='+bloque.getElement('.filaNavegacion').get('tabla')+'&idAnterior='+idAnterior+'&filter='+bloque.get('filter'))	
bloque.getElement('.stayNavigationElement').removeClass('oculto');
bloque.getElement('.changeNavigationElement').addClass('oculto');
$$('.useNavigationElement').addClass('oculto');
}

function initListaNavegacion()
{
tablaToLista($('tablaListaNavegacion'));	
var tabla=$('tablaListaNavegacion').getParent('.bloqueNavegacion').getElement('.filaNavegacion').get('tabla');
$('tablaListaNavegacion').getElements('.lineaDatos').each(function(linea)
	{
	linea.getElements('.celda').addClass('oculto');
	var nombre=new Element('span',{'class':'celdaNavegacionTabla'}).inject(linea);
	nombre.set('html',nombreNetwork(tabla,linea));
	nombre.addEvent('click',function(e){itemNavegacionSeleccionado(e.target);});
	});
}

//required div envolving the navigation has class containerListaNavegacion

function itemNavegacionSeleccionado(el)
{
if (!el.hasClass('celdaNavegacionTabla'))
	{
	el=el.getParent('.celdaNavegacionTabla');
	}
var bloque=el.getParent('.bloqueNavegacion');
var nivel=bloque.get('nivel');
var idSeleccionado=el.getParent('.lineaDatos').get('linea');
var container=el.getParent('.containerListaNavegacion');
bloque.getElement('.changeNavigationElement').removeClass('oculto');
bloque.getElement('.stayNavigationElement').addClass('oculto');
bloque.getElement('.filaNavegacion').set('idTabla',idSeleccionado);
bloque.getElement('.nombreElementoNavegacion').set('html',el.get('html'));
if (bloque.getNext('.bloqueNavegacion'))
	{cambiarNavegacion(bloque.getNext('.bloqueNavegacion').getElement('.nombreElementoNavegacion'));};
while (bloque.getNext('.bloqueNavegacion'))
	{
	bloque=bloque.getNext('.bloqueNavegacion');
	bloque.getElement('.nombreElementoNavegacion').set('html','');
	bloque.getElement('.changeNavigationElement').addClass('oculto');
	bloque.getElement('.stayNavigationElement').addClass('oculto');
	}
networkElementSelected(nivel,idSeleccionado,container);
}


function nombreNetwork(tabla,linea)
{
switch (tabla)
	{
	case 'Sites':
		var name=getValorLinea(linea,'Name');
		var systemName=getValorLinea(linea,'SystemName');
		if (name.indexOf(systemName)==-1)
			{
			return name +' ('+systemName+')';
			}
		else
			{
			return name;
			}
		break;
	default:
		return getValorLinea(linea,'Name');
	}
}


function eventMoveElement()
{
$('completeMove').addEvent('click',function(e)
	{
	var req=new Form.Request($('moveElementForm'),$('completeMoveMessage') , {
		resetForm:false,
		onSuccess: function(target,texto,textoXML) { 
			if (target.get('text').indexOf("Error") == -1)
				{
				target.set('text','Movement completed. Reloading...');
				target.setStyle('display','block');
				target.addClass('mensajeOK');
				target.removeClass('mensajeError');
				setTimeout(function(){location.reload();},3000);				
				}
			else
				{
				target.set('text','Error or no changes');
				target.setStyle('display','block');
				target.removeClass('mensajeOK');
				target.addClass('mensajeError');
				setTimeout(function(){$$('.popUpElement').addClass('oculto');},3000);
				}
		}  
	  }).send();
	});
}

function eventCopyElement()
{
$('completeMove').addEvent('click',function(e)
	{
	var req=new Form.Request($('moveElementForm'),$('completeMoveMessage') , {
		resetForm:false,
		onSuccess: function(target,texto,textoXML) { 
			if (target.get('text').indexOf("Error") == -1)
				{
				target.setStyle('display','block');
				target.addClass('mensajeOK');
				target.removeClass('mensajeError');
				setTimeout(function(){var loc=location.pathname;var str=loc.split('/');window.location=str[str.length-1]+'?id='+$('completeMoveMessage').getElement('.newId').get('text')},3000);				
				}
			else
				{
				target.setStyle('display','block');
				target.removeClass('mensajeOK');
				target.addClass('mensajeError');
				setTimeout(function(){$$('.popUpElement').addClass('oculto');},3000);
				}
		}  
	  }).send();
	});
}