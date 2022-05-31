/*!
 * risers.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 risers.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */


function iniciarRisers()
{
$('offnetRiserButton').addEvent('click',function(e){newOffnetOffnetRiser(e.target);});
$$('.tablaDiv[tabla="Risers"]').each(function(tabla)
	{
	tablaId=tabla.get('id');
	inicializarTablaDiv(tablaId);
	agruparTabla(tablaId,'CableType');
	showIfFew(tablaId,30);
	calcularTotalesGrupo(tablaId,'Amount');
	calcularTotalesGrupo(tablaId,'Available');
	ocultarColumna(tablaId,'Available');
	tabla.getElements('.lineaDatos').each(function(linea)
		{
		var available=getValorLinea(linea,'Available');
		new Element('span',{'class':'riserFree','text':'('+available+')'}).inject(linea.getElement('.datos[campo="Amount"]').getElement('.valor'),'after');
		});
	tabla.getElements('.lineaGrupo').each(function(linea)
		{
		linea.getElement('.datos[campo="Amount"]').addClass('oculto');
		var totales=linea.getElement('.datos[campo="Amount"]').get('html');
		new Element('span',{'style':'padding-left:30px;','html':totales}).inject(linea.getElement('.celda[campo="CableType"]').getElement('.valor'),'after');
		});
	var tablaOrigen=tabla.get('tablaOrigen');
	var idOrigen=tabla.get('idOrigen');
	tabla.getElements('.datos[campo="From"]').each(function(el)
		{
		if (el.getElement('.valor').get('text').indexOf('#'+tablaOrigen+'='+idOrigen+'#')==-1)
			{
			var cambio=el.getNext('.datos[campo="To"]').getElement('.valor').get('text');
			var actual=el.getElement('.valor').get('text');
			el.getElement('.valor').set('text',cambio);
			el.getNext('.datos[campo="To"]').getElement('.valor').set('text',actual);
			el.getParent('.lineaDatos').addClass('orderSwap');
			}
		changePathforDescriptor(el,el.getElement('.valor').get('text'));
		/*el.removeClass('textoGrande');
		el.addClass('textoMedio');*/
		});
	tabla.getElements('.datos[campo="To"]').each(function(el)
		{
		changePathforDescriptor(el,el.getElement('.valor').get('text'));
		/*el.removeClass('textoGrande');
		el.addClass('textoMedio');*/
		});
	
	tabla.getElements('.lineaGrupo').each(function(el)
		{
		var botonChart=new Element('div',{'class':'conTip boton botonChart','style':'position:absolute;right:2px; top:2px;','title':'show evolution'}).inject(el);
		botonChart.addEvent('click',function(e){mostrarEvolucionRisers(e.target);});
		});
	
	tabla.getElements('.lineaTabla').each(function(item)
		{
		item.addEvent('mouseenter',function(event)
			{
			var el=event.target;
			if (!el.hasClass('lineaDatos'))
				{el=el.getParent('.lineaDatos');}
			if (el.getElement('.datos[campo="From"]').getElement('.descriptorRacks'))
				{
				var id=el.getElement('.datos[campo="From"]').getElement('.descriptorRacks').get('idTabla');
				$$('.rack[idRack="'+id+'"]').addClass('rackResaltado');
				}
			if (el.getElement('.datos[campo="To"]').getElement('.descriptorRacks'))
				{
				var id=el.getElement('.datos[campo="To"]').getElement('.descriptorRacks').get('idTabla');
				$$('.rack[idRack="'+id+'"]').addClass('rackResaltado');
				}
			if (el.getElement('.datos[campo="From"]').getElement('.descriptorPanels'))
				{
				var id=el.getElement('.datos[campo="From"]').getElement('.descriptorPanels').get('idTabla');
				$$('.panelChassis[tableId="'+id+'"]').addClass('chassisRemarcado');
				}
			if (el.getElement('.datos[campo="To"]').getElement('.descriptorPanels'))
				{
				var id=el.getElement('.datos[campo="To"]').getElement('.descriptorPanels').get('idTabla');
				$$('.panelChassis[tableId="'+id+'"]').addClass('chassisRemarcado');
				}
			});

		item.addEvent('mouseleave',function(event)
			{
			var el=event.target;
			if (!el.hasClass('lineaDatos'))
				{el=el.getParent('.lineaDatos');}
			if (el.getElement('.datos[campo="From"]').getElement('.descriptorRacks'))
				{
				var id=el.getElement('.datos[campo="From"]').getElement('.descriptorRacks').get('idTabla');
				$$('.rack[idRack="'+id+'"]').removeClass('rackResaltado');
				}
			if (el.getElement('.datos[campo="To"]').getElement('.descriptorRacks'))
				{
				var id=el.getElement('.datos[campo="To"]').getElement('.descriptorRacks').get('idTabla');
				$$('.rack[idRack="'+id+'"]').removeClass('rackResaltado');
				}
			if (el.getElement('.datos[campo="From"]').getElement('.descriptorPanels'))
				{
				var id=el.getElement('.datos[campo="From"]').getElement('.descriptorPanels').get('idTabla');
				$$('.panelChassis[tableId="'+id+'"]').removeClass('chassisRemarcado');
				}
			if (el.getElement('.datos[campo="To"]').getElement('.descriptorPanels'))
				{
				var id=el.getElement('.datos[campo="To"]').getElement('.descriptorPanels').get('idTabla');
				$$('.panelChassis[tableId="'+id+'"]').removeClass('chassisRemarcado');
				}
			});
		new Element('div',{'style':'position:absolute;right:1px;width:16px;height:16px;top:3px;','title':'go to riser/cable info','html':'<a href="riser.php?id='+item.get('linea')+'"><img src="styles/images/link.png" /></a>'}).inject(item.getElement('.celda[campo="Amount"]'));
		item.getElement('.datos[campo="To"]').addEvent('networkDescriptorLoaded',function(el){networkDescriptorRiserLoaded(el)});
		item.getElement('.datos[campo="From"]').addEvent('networkDescriptorLoaded',function(el){networkDescriptorRiserLoaded(el)});
		});
	
	});
}

function networkDescriptorRiserLoaded(cell)
{
var portNames=new Element('div',{'class':'filaDescriptorRed'}).inject(cell.getElement('.descriptorRed').getElement('.clear'),'before');
if (!cell.hasClass('portsLoaded'))
	{
	cell.addClass('portsLoaded');
	var side=cell.get('campo');
	if (cell.getParent('.lineaDatos').hasClass('orderSwap'))
		{
		if (side=='From')
			{
			side='To';
			}
		else
			{
			side='From';
			}
		}
	portNames.load('ajax/getRiserPortSeries.php?side='+side+'&riser='+cell.getParent('.lineaDatos').get('linea'));
	}
}

function mostrarEvolucionRisers(el)
{
var linea=el.getParent('.lineaGrupo');
var tipo=linea.getElement('.celda[campo="CableType"]').getFirst('.valor').get('text');
var free=linea.getElement('.riserFree').get('text');
free=free.replace('(','');
free=free.replace(')','');
var tablaDiv=linea.getParent('.tablaDiv');
fin=false;
var risers=new Array();
while (!fin)
	{
	if (linea.getNext('.lineaDatos'))
		{
		var linea=linea.getNext('.lineaDatos');
		if (linea.hasClass('lineaTabla'))
			{
			risers[risers.length]=linea.get('linea');
			}
		else
			{
			fin=true;
			}
		}
	else
		{
		fin=true;
		}
	}
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
var cabecera=new Element('div',{'class':'cabeceraPopup','resources':free}).inject($('popUp'));
var titulo=tablaDiv.getPrevious('.riserRoom').clone();
new Element('div',{'style':'float:left;padding-left:200px;padding-right:20px;','text':tipo+' ('+free+' available) '}).inject(titulo,'top');
titulo.inject(cabecera);
var cuerpo=new Element('div',{'class':'cuerpoPopup'}).inject($('popUp'));
cuerpo.load('ajax/getRiserEvolution.php?risers='+JSON.encode(risers));
}

function newOffnetOffnetRiser(el)
{
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
$('popUp').set('html',newOffnetRiserTemplate(thisTable,thisId));
$('continuarNewRiser').addEvent('click',function(e){continuarNewOffnetRiser()});
$('finalizarNewRiser').addEvent('click',function(e)
	{
	finalizarOffnetRiser();
	});
}

function finalizarOffnetRiser()
{
var ports=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
var cableType=getSelectValue($('valoresEditablesNewRiser'),'CableType');
$('mensajeNuevaTarjeta').removeClass('oculto');
var linea1=new Element('div',{'class':'mensaje','id':'lineaNuevoRiser'}).inject($('mensajeNuevaTarjeta'));
var fromType=$('containerNewRiser').get('table');
var fromId=$('containerNewRiser').get('tableId');
var evolucion="evolucion=1";
if ($('evolucionConexion').checked)
	{
	evolucion="evolucion=0";
	}
var inputsOK=true;
$('riserPortsToArea').getElements('input').each(function(el)
	{
	if (el.value=='')
		{
		inputsOK=false;
		}
	});
$('riserPortsFromArea').getElements('input').each(function(el)
	{
	if (el.value=='')
		{
		inputsOK=false;
		}
	});
if (inputsOK)
	{
	$('riserPortsToArea').set('cuenta',0);
	var i=1;
	$('riserPortsFromArea').getElements('.newRiserPort').each(function(puerto)
		{
		var nombrePuerto=encodeURIComponent(puerto.getElement('input').value);
		var mensaje=new Element('div',{'class':'mensaje oculto'}).inject(puerto);
		mensaje.load('ajax/newOffnetPort.php?side=from&cableType='+cableType+'&nombre='+nombrePuerto+'&orden='+i+'&tabla='+fromType+'&id='+fromId);
		i++;
		});
	
	}
else
	{
	alert('Please fill the names for all the new offnet ports')
	}

}

function newOffnetRiserTemplate(fromTable,fromId)
{
var html='<div id="containerNewRiser" table="'+fromTable+'" tableId="'+fromId+'" style="position:absolute;width:100%;height:100%;left:0px;top:0px;"><div id="mensajeNuevaTarjeta" class="oculto"></div>';
html+='<form id="valoresEditablesNewRiser" class="mainForm">';
html+='<div id="newRiserLeft">';
html+='<div class="bloqueNewCard" id="camposNewRiser"><div class="tituloTabla">New offnet to offnet riser from '+'??'+'</div>';
html+='<div class="lineaInputs"><label>Cable Type:</label><div class="grupoInputs"><select name="CableType">';
html+='<option selected="selected" value=""></option>';
cableTypes.each(function(item)
	{
	html+='<option value="'+item+'">'+item+'</option>';
	});
html+='</select></div><div class="clear"></div></div>';
html+='<div class="lineaInputs"><label>Ports:</label><div class="grupoInputs"><input type="text" class="pequenumber" name="Amount" value="0"/></div><div class="clear"></div></div>';
//html+='<span style="padding-left:10px;"> </span><input type="radio" name="Destination" value="OFFNET">To third party MMR or offnet<br/><br/>';
html+='<br/><div id="continuarNewRiser" class="boton botonCrear" style="margin-bottom:20px;">CONTINUE</div>';
html+='<div style="padding-left:5px;margin-top:10px;"><input type="checkbox" id="evolucionConexion">Not real work. Inventory correction.</div>';
html+='</div>';//bloqueNewCard
html+='</div></form>';//newRiserLeft
html+='<div id="newRiserPortsArea" class="bloqueNewCard oculto" ports="0" fromStarting="0" toStarting="0"><div class="tituloTabla"><span style="padding-right:10px;text-decoration:underline;">From</span>Ports<span style="padding-left:10px;text-decoration:underline;">To</span></div><div id="riserPortsFromArea" class="offnetPorts" style="width:40%;float:left;text-align:right;"></div><div id="riserPortsBetweenArea" style="width:20%;float:left;text-align:center;"></div><div id="riserPortsToArea" style="width:40%;float:left;"></div><div class="clear"></div></div>';
html+='<div id="newRiserNavigationArea" class="bloqueNewCard oculto"><div id="tituloDestRiser" class="tituloTabla">Select destination</div><div id="bloqueNavegacionRiser" class="containerListaNavegacion" tipo="riser">';
html+='</div><div id="lugarRiserOffset" class="mensaje oculto"></div><div id="finalizarNewRiser" class="boton botonCrear oculto" style="margin-top:5px;margin-bottom:20px;">CREATE RISER AND CONNECTIONS</div></div>';
html+='</div>';//containerNewRiser
return html;

}

function continuarNewOffnetRiser()
{
//comprobar valores y bloquear form
var continuar=true;
var ports=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
if (ports==0)
	{
	continuar=false;
	alert('Please enter the number of ports');
	}
if (getSelectValue($('valoresEditablesNewRiser'),'CableType')=='')
	{
	continuar=false;
	alert('Please select the type of cable.');
	}
if (continuar)
	{
	$('newRiserPortsArea').removeClass('oculto');
	$('newRiserNavigationArea').removeClass('oculto');
	var i=0;
	while (i<ports)
		{
		var el=new Element('div',{'class':'newRiserPort','orden':i+1}).inject($('riserPortsFromArea'));
		new Element('input',{'class':'pequenumber'}).inject(el);
		new Element('div',{'class':'newSeparationPort','text':'<->'}).inject($('riserPortsBetweenArea'));
		var el=new Element('div',{'class':'newRiserPort','orden':i+1}).inject($('riserPortsToArea'));
		new Element('input',{'class':'pequenumber'}).inject(el);
		i++;
		}
	$('continuarNewRiser').addClass('oculto');
	$('camposNewRiser').setStyle('border-color','green');
	disableForm($('valoresEditablesNewRiser'));
	$('tituloDestRiser').set('text','Select destination for creating the offnet ports (site, floor, room or rack)');
	$('bloqueNavegacionRiser').load('ajax/navigateNetwork.php?tabla='+thisTable+'&id='+thisId);
	$('bloqueNavegacionRiser').set('tipo','riserOffnet');
	}
}

function initNewRiser()
{
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
var nombre=$('panelInfoForm').getElement('.datos[campo="Name"]').get('text')+'<br/>('+$('panelInfoForm').getElement('.datos[campo="SystemName"]').get('text')+')';
var connector=$('panelInfoForm').getElement('.datos[campo="Connector"]').get('text');

/*if ($('marcoPanelFront'))
	{
	if ($('marcoPanelFront').hasAttribute('connector'+side))
		{
		connector=$('marcoPanelFront').get('connector'+side).replace(/_/g, " ");
		}
	}
*/
$('popUp').set('html',newRiserTemplate(nombre,'',$('panelInfoForm').getElement('.datos[campo="Ports"]').get('text')));
$('continuarNewRiser').addEvent('click',function(e){continuarNewRiser()});
$('frontSelectionDestPanel').addEvent('click',function(e){
	$('frontSelectionDestPanel').addClass('botonLinkSeleccionado');
	$('rearSelectionDestPanel').removeClass('botonLinkSeleccionado');
	$('marcoFrontDestPanel').removeClass('oculto');
	$('marcoRearDestPanel').addClass('oculto');
	});
$('rearSelectionDestPanel').addEvent('click',function(e){
	$('frontSelectionDestPanel').removeClass('botonLinkSeleccionado');
	$('rearSelectionDestPanel').addClass('botonLinkSeleccionado');
	$('marcoFrontDestPanel').addClass('oculto');
	$('marcoRearDestPanel').removeClass('oculto');
	});
$('finalizarNewRiser').addEvent('click',function(e)
	{
	finalizarRiser();
	});
}

function finalizarRiser()
{
var destination=getRadioValue($('valoresEditablesNewRiser'),'Destination');
var ports=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
var cableType=getSelectValue($('valoresEditablesNewRiser'),'CableType');
$('mensajeNuevaTarjeta').removeClass('oculto');
var linea1=new Element('div',{'class':'mensaje','id':'lineaNuevoRiser'}).inject($('mensajeNuevaTarjeta'));
var fromType='Panels';
var fromId=$('panelInfoForm').get('idForm');
var evolucion="evolucion=1";
if ($('evolucionConexion').checked)
	{
	evolucion="evolucion=0";
	}
if (destination=='ONNET')
	{
	var toType='Panels';
	var toId=$('bloqueNavegacionRiser').getElement('.bloqueNavegacion[nivel="4"]').getElement('.filaNavegacion').get('idTabla');
	linea1.load('ajax/guardarNuevoRiser.php?'+evolucion+'&cableType='+encodeURIComponent(cableType)+'&ports='+ports+'&fromType='+fromType+'&fromId='+fromId+'&toType='+toType+'&toId='+toId);
	}
else
	{
	var inputsOK=true;
	$('riserPortsToArea').getElements('input').each(function(el)
		{
		if (el.value=='')
			{
			inputsOK=false;
			}
		});
	if (inputsOK)
		{
		$('riserPortsToArea').set('cuenta',0);
		var i=1;
		$('riserPortsToArea').getElements('.newRiserPort').each(function(puerto)
			{
			puerto.set('orden',i);
			var nombrePuerto=encodeURIComponent(puerto.getElement('input').value);
			var mensaje=new Element('div',{'class':'mensaje oculto'}).inject(puerto);
			mensaje.load('ajax/newOffnetPort.php?cableType='+cableType+'&nombre='+nombrePuerto+'&orden='+i+'&tabla='+$('lugarRiserOffset').get('tabla')+'&id='+$('lugarRiserOffset').get('idTabla'));
			i++;
			});
		
		}
	else
		{
		alert('Please fill the names for all the new offnet ports')
		}
	}
}

function crearConexionesRiser()
{
var fromParentTable=$('containerNewRiser').get('table');
var fromParentId=$('containerNewRiser').get('tableId');
var sideFrom='Out';
var toSide='Out';
var toType='Offnet';
var fromType='Offnet';
var cableType=getSelectValue($('valoresEditablesNewRiser'),'CableType');
if (fromParentTable=='Panels')
	{
	fromType='Panel'
	toSide=$('finalizarNewRiser').get('sideTo');
	var destination=getRadioValue($('valoresEditablesNewRiser'),'Destination');
	sideFrom=getRadioValue($('valoresEditablesNewRiser'),'View');
	toType='Panel';
	if (destination=='OFFNET')
		{
		toSide='In';
		toType='Offnet';
		}
	}
var riser=$('lineaNuevoRiser').getElement('.newId').get('text');
var ports=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
var linea2=new Element('div',{'class':'mensaje','id':'lineaConexionesRiser','ports':ports,'connected':'0'}).inject($('mensajeNuevaTarjeta'));
var i=0;
var puertosFrom=$('riserPortsFromArea').getElements('.newRiserPort');
var puertosTo=$('riserPortsToArea').getElements('.newRiserPort');

while (i<ports)
	{
	var espTemp=new Element('div',{'class':'oculto'}).inject(linea2);
	espTemp.load('ajax/conexionNuevoRiser.php?cableType='+encodeURIComponent(cableType)+'&riser='+riser+'&fromSide='+sideFrom+'&fromType='+fromType+'&fromId='+puertosFrom[i].get('idPort')+'&toSide='+toSide+'&toType='+toType+'&toId='+puertosTo[i].get('idPort'));
	i++;
	}
}

function afterConexionNuevoRiser(fromId,toId)
{
if ($('containerNewRiser').get('table')=='Panels')
	{
	var sideFrom=getRadioValue($('valoresEditablesNewRiser'),'View');
	var riser=$('lineaNuevoRiser').getElement('.newId').get('text');
	var destination=getRadioValue($('valoresEditablesNewRiser'),'Destination');
	var type='Offnet';
	if (destination=='ONNET')
		{
		type='Panel';
		}
	var linea=$('tablaPuertos').getElement('.lineaDatos[linea="'+fromId+'"]');
	linea.getElement('.datos[campo="'+sideFrom+'Type"]').getElement('.valor').set('text',type);
	linea.getElement('.datos[campo="'+sideFrom+'Connection"]').getElement('.valor').set('text',toId);
	linea.getElement('.datos[campo="Status'+sideFrom+'"]').getElement('.valor').set('text','CONNECTED');
	linea.getElement('.datos[campo="Riser'+sideFrom+'"]').getElement('.valor').set('text',riser);
	linea.getElement('.datos[campo="Riser'+sideFrom+'Status"]').getElement('.valor').set('text','AVAILABLE');

	inicializarEstadosPuertos(linea,sideFrom);
	}

var connected=($('lineaConexionesRiser').get('connected')*1) + 1;
$('lineaConexionesRiser').set('text', connected + ' connections completed');
$('lineaConexionesRiser').set('connected',connected);
if (connected==($('lineaConexionesRiser').get('ports')*1))
	{
	setTimeout(function(){$$(".popUpElement").addClass("oculto");},2000);
	if ($('containerNewRiser').get('table')!='Panels')
		{
		tabReload('risers');
		}
	}
}

function continuarNewRiser()
{
//comprobar valores y bloquear form
var continuar=true;
var ports=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
var panelPorts=$('panelInfoForm').getElement('.datos[campo="Ports"]').get('text')*1;
var starting=$('valoresEditablesNewRiser').getElement('input[name="StartingPort"]').value*1;
var side=getRadioValue($('valoresEditablesNewRiser'),'View');
var destination=getRadioValue($('valoresEditablesNewRiser'),'Destination');
$('newRiserPortsArea').set('ports',ports);
$('newRiserPortsArea').set('ports',ports);
var continuar=true;
if (ports>panelPorts || (starting+ports-1)>panelPorts)
	{
	continuar=false;
	alert('Number of ports can not be more than the panel ports.');
	}
if (side!='Front' && side!='Rear')
	{
	continuar=false;
	alert('Please select the front or rear of the panel for starting the riser.');
	}
if (destination!='ONNET' && destination!='OFFNET')
	{
	continuar=false;
	alert('Please select the type of destination.');
	}
if (getSelectValue($('valoresEditablesNewRiser'),'CableType')=='')
	{
	continuar=false;
	alert('Please select the type of cable.');
	}
if (continuar)
	{
	var puertosLibres=0;
	var puertosOrigen=$('marcoPanel'+side).getElements('.puertoPanel');
	var i=starting-1;
	while (i<puertosOrigen.length)
		{
		if (puertosOrigen[i].get('estado')=='' || puertosOrigen[i].get('estado')=='FREE')
			{
			puertosLibres++;
			}
		i++;
		}
	if (puertosLibres>=ports)
		{
		$('newRiserPortsArea').removeClass('oculto');
		$('newRiserNavigationArea').removeClass('oculto');
		var infoPuertos=$('tablaPuertos').getElements('.lineaDatos');
		var currentLine=infoPuertos[starting-1];
		var i=0;
		while (i<ports)
			{
			var nombrePuerto=currentLine.get('nombrePuerto');
			new Element('div',{'class':'newRiserPort','text':nombrePuerto,'idPort':currentLine.get('linea')}).inject($('riserPortsFromArea'));
			new Element('div',{'class':'newSeparationPort','text':'<->'}).inject($('riserPortsBetweenArea'));
			currentLine=currentLine.getNext('.lineaDatos');
			i++;
			}
		$('continuarNewRiser').addClass('oculto');
		$('camposNewRiser').setStyle('border-color','green');
		disableForm($('valoresEditablesNewRiser'));
		if (destination=='ONNET')
			{
			$('bloqueNavegacionRiser').load('ajax/navigateNetwork.php?tabla=Panels&id='+$('panelInfoForm').get('idForm'));
			}
		else
			{
			var i=0;
			while (i<ports)
				{
				var el=new Element('div',{'class':'newRiserPort'}).inject($('riserPortsToArea'));
				new Element('input',{'class':'pequenumber'}).inject(el);
				i++;
				}
			$('tituloDestRiser').set('text','Select destination for creating the offnet ports (site, floor, room or rack)');
			$('bloqueNavegacionRiser').load('ajax/navigateNetwork.php?tabla=Racks&id='+idRack);
			$('bloqueNavegacionRiser').set('tipo','riserOffnet');
			}
		
		}
	else
		{alert('No enough ports for the riser at the '+side+' of the panel');}
	}
}

function iniciarRiserEvolucion()
{
var i=0;
var usedYear=0;
var used6=0;
var newYear=0;
var new6=0;

var used=$('evolutionChartContainer').getElement('.dataRow[name="Used"]').get('text').split(';');
var newRisers=$('evolutionChartContainer').getElement('.dataRow[name="New"]').get('text').split(';');

while (i<12)
	{
	usedYear+=used[i]*1;
	newYear+=newRisers[i]*1;
	if(i>5)
		{
		used6+=used[i]*1;
		new6+=newRisers[i]*1;
		}
	i++;
	}

var resources=$('popUp').getElement('.cabeceraPopup').get('resources')*1;
	
var bloque6=$('popUp').getElement('.bloqueBasico[months="6"]');
var usedPerMonth=used6/6;
var newPerMonth=new6/6;
var exhausted='-';
if (usedPerMonth>0)
	{exhausted=parseInt((resources*4)/usedPerMonth);}
new Element('div',{'class':'lineaStats','html':'<span class="titleStats">Total used:</span><span class="valueStats">'+used6+'</span><span class="valueStats">//</span><span class="valueStats" style="color:orange;">'+usedPerMonth.decimal(1)+'</span><span style="color:orange;">per month</span>'}).inject(bloque6);	
new Element('div',{'class':'lineaStats','html':'<span class="titleStats">Total new:</span><span class="valueStats">'+new6+'</span><span class="valueStats">//</span><span class="valueStats" style="color:orange;">'+newPerMonth.decimal(1)+'</span><span style="color:orange;">per month</span>'}).inject(bloque6);
new Element('div',{'class':'lineaStats','html':'<span class="titleStats">To be exhausted in:</span><span class="valueStats" style="border:1px solid blue;"><span class="valueStats">'+exhausted+'</span>weeks</span>'}).inject(bloque6);
var bloque12=$('popUp').getElement('.bloqueBasico[months="12"]');
var usedPerMonth=usedYear/12;
var newPerMonth=newYear/12;
var exhausted='-';
if (usedPerMonth>0)
	{exhausted=parseInt((resources*4)/usedPerMonth);}
new Element('div',{'class':'lineaStats','html':'<span class="titleStats">Total used:</span><span class="valueStats">'+usedYear+'</span><span class="valueStats">//</span><span class="valueStats" style="color:orange;">'+usedPerMonth.decimal(1)+'</span><span style="color:orange;">per month</span>'}).inject(bloque12);	
new Element('div',{'class':'lineaStats','html':'<span class="titleStats">Total new:</span><span class="valueStats">'+newYear+'</span><span class="valueStats">//</span><span class="valueStats" style="color:orange;">'+newPerMonth.decimal(1)+'</span><span style="color:orange;">per month</span>'}).inject(bloque12);	
new Element('div',{'class':'lineaStats','html':'<span class="titleStats">To be exhausted in:</span><span class="valueStats" style="border:1px solid blue;"><span class="valueStats">'+exhausted+'</span>weeks</span>'}).inject(bloque12);
processBarChart('evolutionChartContainer',new Array('Month','Capacity'));
}


function changePathforDescriptor(container,path)
{
path=path.substring(1,path.length-1);
var valores=path.split('#');
var ultimo=valores[valores.length-1].split('=');
container.load('ajax/getElementDescription.php?tabla='+ultimo[0]+'&id='+ultimo[1]);
}