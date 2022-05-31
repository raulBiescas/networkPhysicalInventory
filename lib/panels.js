/*!
 * panels.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 panels.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */


/*
Panels model definition: xml 
<panelmodel>
	<rows>2</rows>  //always same number of ports per row 
	<start>top-right</start> //if different from top-left 
	<moving>nextVert, backVert, firstVertnextHor,halfHor, n times backHor - n times next...</moving> //comma separated. if different from filling from first row and on (nextHor)
	<ports>1A,1B....</ports> //comma separated. if differrent from 1,2,3... understand sequences???
	<names>top</names> //if different from bottom
	<espacesrows></espacesrows>//comma separated
	<espacescols></espacescols>//comma separated
	<frontrearrate></frontrearrate>0.5 or 2 for interface change (UTP to coax, for instance)
	<portsrear></portsrear>//different names for the rear ports
	<connectorrear></connectorrear>//different connector for the rear port
	<rearduplication></rearduplication>//hor, vert (for interface change duplicating the rear) vert is default
</panelmodel>
*/

var cableTypes=new Array('COAX FLEX3','COAX FLEX5','FIBER MM','FIBER SM','UTP CAT5','UTP CAT6','UTP TWINAX');
var estadosPuertos=new Array('portCONNECTED','portFAULTY','portFREE','portOSP');

function checkMediaConnector(type,item)
{
var res=false;
if (type=='COPPER')
	{
	if (item.indexOf('UTP')==0 || item.indexOf('COAX')==0)
		{
		res=true;
		}
	}
return res;
}

function newRiserTemplate(panel,connector,ports)
{
var html='<div id="containerNewRiser" table="Panels" tableId="'+$('panelInfo').get('idPanel')+'" style="position:absolute;width:100%;height:100%;left:0px;top:0px;"><div id="mensajeNuevaTarjeta" class="oculto"></div>';
html+='<form id="valoresEditablesNewRiser" class="mainForm">';
html+='<div id="newRiserLeft">';
html+='<div class="bloqueNewCard" id="camposNewRiser"><div class="tituloTabla">New riser from panel '+panel+'</div>';
html+='<span style="padding-left:10px;"> </span><input type="radio" name="View" value="Front">Front<br/><span style="padding-left:10px;"> </span><input type="radio" name="View" value="Rear">Rear<br/><br/>';
html+='<div class="lineaInputs"><label>Cable Type:</label><div class="grupoInputs"><select name="CableType">';
var types=connector.split(' ');
var type=types[0];
html+='<option selected="selected" value=""></option>';
cableTypes.each(function(item)
	{
	if (item.indexOf(type)!=-1)
		{
		html+='<option value="'+item+'">'+item+'</option>';
		}
	});
html+='</select></div><div class="clear"></div></div>';
html+='<div class="lineaInputs"><label>Ports:</label><div class="grupoInputs"><input type="text" class="pequenumber" name="Amount" value="'+ports+'"/></div><div class="clear"></div></div>';
html+='<div class="lineaInputs"><label>Starting at:</label><div class="grupoInputs"><input type="text" class="pequenumber" name="StartingPort" value="1"/></div><div class="clear"></div></div><br/>';
html+='<span style="padding-left:10px;"> </span><input type="radio" name="Destination" value="ONNET">To another ONNET panel<br/><span style="padding-left:10px;"> </span><input type="radio" name="Destination" value="OFFNET">To third party MMR or offnet<br/><br/>';
html+='<br/><div id="continuarNewRiser" class="boton botonCrear" style="margin-bottom:20px;">CONTINUE</div>';
html+='<div style="padding-left:5px;margin-top:10px;"><input type="checkbox" id="evolucionConexion">Not real work. Inventory correction.</div>';
html+='</div>';//bloqueNewCard
html+='</div></form>';//newRiserLeft
html+='<div id="newRiserPortsArea" class="bloqueNewCard oculto" ports="0" fromStarting="0" toStarting="0"><div class="tituloTabla"><span style="padding-right:10px;text-decoration:underline;">From</span>Ports<span style="padding-left:10px;text-decoration:underline;">To</span></div><div id="riserPortsFromArea" style="width:40%;float:left;text-align:right;"></div><div id="riserPortsBetweenArea" style="width:20%;float:left;text-align:center;"></div><div id="riserPortsToArea" style="width:40%;float:left;"></div><div class="clear"></div></div>';
html+='<div id="newRiserNavigationArea" class="bloqueNewCard oculto"><div id="tituloDestRiser" class="tituloTabla">Select destination</div><div id="bloqueNavegacionRiser" class="containerListaNavegacion" tipo="riser">';
html+='</div><div id="containerDestRiser" class="oculto"><div style="width:100%;margin-top:10px;border-top:1px solid white;padding-top:3px;"><div style="width:20%;float:left;margin-left:1%;"><span id="frontSelectionDestPanel" class="botonLink botonLinkSeleccionado">Front</span></div><div style="width:59%;float:left;"><div class="tituloTabla">Select starting port for the riser</div></div><div style="width:19%;float:left;text-align:right;"><span id="rearSelectionDestPanel" class="botonLink">Rear</span></div><div class="clear"></div></div>'
html+='<div style="width:100%;margin-top:10px;position:relative;" id="marcoDestPanel"><div class="marcoDestino marcoFront" id="marcoFrontDestPanel" style="position:absolute;width:94%;left:3%;height:98%;top:1%;border:1px solid white;"></div><div class="marcoDestino marcoRear oculto" id="marcoRearDestPanel" style="position:absolute;width:94%;left:3%;height:98%;top:1%;border:1px solid white;"></div></div><div class="oculto" id="infoDestPanel"></div></div><div id="lugarRiserOffset" class="mensaje oculto"></div><div id="finalizarNewRiser" class="boton botonCrear oculto" style="margin-top:5px;margin-bottom:20px;">CREATE RISER AND CONNECTIONS</div></div>';
html+='</div>';//containerNewRiser
return html;

}

function newConnectionTemplate(tabla,idTabla,idPuertos,connector,nombrePuertos,side,circuit)
{
var html='<div id="containerNewConnection" style="position:absolute;width:100%;height:100%;left:0px;top:0px;"><div id="mensajeNuevaTarjeta" class="oculto"></div>';
html+='<form id="valoresEditablesNewConnection" class="mainForm">';
html+='<div id="newConnectionLeft" tabla="'+tabla+'" idTabla="'+idTabla+'">';
	var nombreTitulo='';
	nombrePuertos.each(function(puerto)
		{
		nombreTitulo+=puerto+'-';
		});
	nombreTitulo=nombreTitulo.substring(0,nombreTitulo.length-1);
	html+='<div class="bloqueNewCard" id="camposNewConnection"><div class="tituloTabla">New connection from ports '+nombreTitulo+'</div>';
	html+='<div class="lineaInputs oculto"><input type="text" name="Circuit" value="'+circuit+'"/></div>';	
		var hideNew='';
		if (circuit!='0')
			{
			html+='<div id="maintainCircuitSpace">';
				html+='<div>Circuit: '+referencesRepository[circuitsRepository.indexOf(circuit*1)]+'<span class="spanCustomer">'+customersRepository[circuitsRepository.indexOf(circuit*1)]+'</span></div>';
				html+='<div stlye="margin-bottom:10px;"><span id="changeCircuitConnection" value="change" class="botonLink">change</span></div>';
			html+='</div>';
			hideNew='oculto';
			}
		html+='<div id="newCircuitSpace" style="border:1px solid #ccc;margin:5px;padding:2px;" class="'+hideNew+'">';
			html+=newCircuitHtml();
		html+='</div>';
		html+='<div class="lineaInputs"><label style="width:70px!important;">Cable Type:</label><div class="grupoInputs"><select name="CableType">';
		var types=connector.split(' ');
		var type=types[0];
		html+='<option selected="selected" value=""></option>';
		cableTypes.each(function(item)
			{
			if (item.indexOf(type)!=-1 || checkMediaConnector(type,item))
				{
				html+='<option value="'+item+'">'+item+'</option>';
				}
			});
		html+='</select></div><div class="clear"></div></div><br/>';
		html+='<div>To:</div><span style="padding-left:10px;"> </span><input type="radio" name="destination" value="PanelPorts">Onnet panel port<br/><span style="padding-left:10px;"> </span><input type="radio" name="destination" value="EqPorts">Equipment port<br/><span style="padding-left:10px;"> </span><input type="radio" name="destination" value="OffnetPorts">Existing offnet port<br/><span style="padding-left:10px;"> </span><input type="radio" name="destination" value="newOffnetPorts">New offnet port<br/><br/>';
		html+='<div style="padding-left:5px;margin-top:10px;"><input type="checkbox" id="evolucionConexion">Not real work. Inventory correction.</div>';

		html+='<br/><div id="continuarNewConnection" class="boton botonCrear" style="margin-bottom:20px;">CONTINUE</div>';
	html+='</div>';
html+='</div></form>';//newConnectionLeft
html+='<div id="newConnectionNavigationArea" class="bloqueNewCard oculto">';
	html+='<div id="tituloDestConnection" class="tituloTabla">Select destination</div>';
	html+='<div id="bloqueNavegacionConnection" class="containerListaNavegacion" tipo="PanelPorts"></div>';
	html+='<div id="containerDestPanelConnection" class="oculto">';
		html+='<div style="width:100%;margin-top:10px;border-top:1px solid white;padding-top:3px;">';
			html+='<div style="width:20%;float:left;margin-left:1%;"><span id="frontSelectionDestPanel" class="botonLink botonLinkSeleccionado">Front</span></div><div style="width:59%;float:left;"><div class="tituloTabla">Select port/s to connect</div></div><div style="width:19%;float:left;text-align:right;"><span id="rearSelectionDestPanel" class="botonLink">Rear</span></div><div class="clear"></div>';
		html+='</div>';
		html+='<div style="width:100%;margin-top:10px;position:relative;" id="marcoDestPanel"><div class="marcoDestino marcoFront" id="marcoFrontDestPanel" style="position:absolute;width:94%;left:3%;height:98%;top:1%;border:1px solid white;"></div><div class="marcoDestino marcoRear oculto" id="marcoRearDestPanel" style="position:absolute;width:94%;left:3%;height:98%;top:1%;border:1px solid white;"></div></div>';
		html+='<div class="oculto" id="infoDestPanel"></div></div>';
	html+='<div id="lugarPortOffnet" class="mensaje oculto"></div>';
	var fromType='Eq';
	if (tabla=='Panels')
		{
		fromType='Panel';
		}		
	else
		{
		if (tabla=="OffnetPorts")
			{
			fromType='Offnet';
			}
		}
	html+='<div id="containerDestEqConnection" class="contenedorEquipo oculto"></div>';
	html+='<div id="containerExistingOffnet" class="oculto" style="width:100%";></div>';
html+='</div>';//newConnectionNavigationArea
	
html+='<div id="newConnectionCircuitArea" ports="'+idPuertos.length+'" class="bloqueNewCard oculto">';
	html+='<div class="tituloTabla"><span style="padding-right:10px;text-decoration:underline;">From</span>Ports<span style="padding-left:10px;text-decoration:underline;">To</span></div>';
	html+='<div id="riserPortsFromArea" style="width:40%;float:left;text-align:right;">';
	var i=0;
	while (i<idPuertos.length)
		{
		html+='<div class="newRiserPort" idPort="'+idPuertos[i]+'">'+nombrePuertos[i]+'</div>';
		i++;
		}
	html+='</div>';
	html+='<div id="riserPortsBetweenArea" style="width:20%;float:left;text-align:center;">';
	i=0;
	while (i<idPuertos.length)
		{
		html+='<div class="newSeparationPort" >&lt;-&gt;</div>';
		i++;
		}
	html+='</div><div id="riserPortsToArea" style="width:40%;float:left;"></div><div class="clear"></div>';
	if (idPuertos.length>1)
		{
		html+='<div style="margin-top:10px;"><span id="toPortsClear" class="botonLink" style="padding-left:20px;padding-right:20px;">clear</span><span id="toPortsSwap" class="botonLink" style="padding-left:20px;padding-right:20px;">swap</span></div>';
		}
	html+='<div id="finalizarNewConnection" fromType="'+fromType+'" sideFrom="'+side+'" class="boton botonCrear oculto" style="margin-top:5px;margin-bottom:10px;">CONNECT</div>';
html+='</div>';//newConnectionCircuitArea
return html;
}

function newCircuitHtml()
{
var html='<div class="lineaInputs"><label style="width:70px!important;">Circuit:</label><div class="grupoInputs"><select name="ReferenceType">'+selectHtml(circuitReferenceTypes, 'REFERENCE')+'</select><input type="text" name="Reference" value=""/></div><div class="clear"></div></div>';
html+='<div class="lineaInputs"><label style="width:70px!important;">Customer:</label><div class="grupoInputs"><input type="text" name="Customer" value=""/></div><div class="clear"></div></div>';
html+='<div class="lineaInputs"><label style="width:70px!important;">Provider:</label><div class="grupoInputs"><input type="text" name="Provider" value=""/></div><div class="clear"></div></div>';
html+='<div class="lineaInputs"><label style="width:70px!important;">Type:</label><div class="grupoInputs"><select name="Type">'+selectHtml(circuitTypes, 'PRIVATE LINE')+'</select></div><div class="clear"></div></div>';
return html;
}

function disconnectPort(e)
{
var el=e.target;
var posCursor=e.page;
$('cuadroInfo').empty();
$('cuadroInfo').removeClass('oculto');
$('cuadroInfo').setStyle('width','200px');
$('cuadroInfo').setStyle('height','200px');
$('cuadroInfo').setStyle('left',(posCursor.x-20)+'px');
$('cuadroInfo').setStyle('top',(posCursor.y-140)+'px');
var cerrar=new Element('div',{'class':'conTip','style':'position:absolute;top:2px;right:2px;cursor:pointer;width:15px;height:15px','text':'X','title':'close'}).inject($('cuadroInfo')); 
cerrar.addEvent('click',function(){$('cuadroInfo').addClass('oculto');$('cuadroInfo').empty();});

var side='';
var tabla='';
var idPuertos=new Array();
var nombrePuertos=new Array();
if (el.getParent('.tablaDiv'))
	{//ports view
	tabla=el.getParent('.tablaDiv').get('tabla');
	var linea=el.getParent('.lineaDatos');
	side=el.get('side');
	idPuertos=new Array(linea.get('linea'));
	nombrePuertos=new Array(getValorLinea(linea,'Name'));
	var tablaPadre=linea.getParent('.tablaDiv');
	if (tablaPadre.getElement('.botonAgruparPuertos'))
		{
		var claseGrupo='';
		if (tablaPadre.getElement('.botonAgruparPuertos').hasClass('desagruparPuertos'))
			{
			if (linea.hasClass('lineaAgrupada2'))
				{
				if (linea.getNext('.lineaDatos'))
					{
					var siguiente=linea.getNext('.lineaDatos');
					if (siguiente.hasClass('oculto'))
						{
						idPuertos[1]=siguiente.get('linea');
						nombrePuertos[1]=getValorLinea(siguiente,'Name');
						}
					}
				}
			}
		}
	}
else
	{//circuit view
	var parent=el.getParent('.filaDescriptorRed');
	tabla=parent.get('tabla');
	idPuertos=new Array(parent.get('idTabla'));
	side=parent.getElement('.salidaPuerto').get('text');
	if (side=='PORT')
		{
		side='Dest';
		}
	if (parent.hasClass('grouped2'))
		{
		idPuertos[1]=parent.get('otherPort');
		}
	nombrePuertos=parent.getElement('.descriptorRedPrimario').get('text').split('/');
	}		

var cadenaPuertos='';
nombrePuertos.each(function(puerto)
	{
	cadenaPuertos+=puerto+'-';
	});
cadenaPuertos=cadenaPuertos.substring(0,cadenaPuertos.length-1);
var puertos='';
idPuertos.each(function(puerto)
	{
	puertos+=puerto+',';
	});
puertos=puertos.substring(0,puertos.length-1);
	
new Element('div',{'style':'padding:5px;margin-bottom:10px;','text':'Please confirm you want to disconnect the '+side+' side of ports '+cadenaPuertos}).inject($('cuadroInfo'));
var lineaEvolucion=new Element('div',{'style':'padding:5px;margin-bottom:10px;'}).inject($('cuadroInfo'));
lineaEvolucion.set('html','<input type="checkbox" id="evolucionDesconexion">Not real work. Inventory correction.');
var lineaMaintain=new Element('div',{'style':'padding:5px;margin-bottom:10px;'}).inject($('cuadroInfo'));
lineaMaintain.set('html','<input type="checkbox" id="maintainCircuit">Maintain circuit in this port');

var botonDesconectar=new Element('div',{'class':'boton botonCrear','tabla':tabla,'text':'DISCONNECT','side':side,'ports':puertos}).inject($('cuadroInfo'));
botonDesconectar.addEvent('click',function(e){continuarDesconexion(e.target);});
}

function lineIsGrouped(line,side)
{
var res=false;

if (line.hasClass('lineaAgrupada2'))
	{
	if (line.getNext('.lineaDatos'))
		{
		if (line.getNext('.lineaDatos').hasClass('lineaTabla') && line.getNext('.lineaDatos').hasClass('oculto'))
			{
			if (typeof(side)!='undefined')
				{
				if (side=='Front' || side=='Rear')
					{
					var tabla=line.getParent('.tablaDiv');
					//continue for panels 2vs1
					
					res=true;
					}
				else
					{res=true;}
				}
			else
				{res=true;}
			}
		}
	}
return res;
}

function continuarDesconexion(el)
{
var evolucion="evolucion=1";
if ($('evolucionDesconexion').checked)
	{
	evolucion="evolucion=0";
	}
var maintain="maintainCircuit=0";
if ($('maintainCircuit').checked)
	{
	maintain="maintainCircuit=1";
	}
var puertos=el.get('ports').split(',');
var side=el.get('side');
var tabla=el.get('tabla');
$('cuadroInfo').empty();
var cerrar=new Element('div',{'class':'conTip','style':'position:absolute;top:2px;right:2px;cursor:pointer;width:15px;height:15px','text':'X','title':'close'}).inject($('cuadroInfo')); 
cerrar.addEvent('click',function(){$('cuadroInfo').addClass('oculto');$('cuadroInfo').empty();});
var lineaDesconexiones=new Element('div',{'id':'lineaDesconexiones','style':'margin-top:5px;'}).inject($('cuadroInfo'));
lineaDesconexiones.set('ports',puertos.length);
lineaDesconexiones.set('disconnected','0');
var lineaRisers=new Element('div',{'id':'lineaRisersLiberados','style':'margin-top:5px;','text':'Resources liberated on risers: 0'}).inject($('cuadroInfo'));
lineaRisers.set('disconnected','0');
puertos.each(function(puerto)
	{
	var lineaRes=new Element('div',{'id':'resDesc'+puerto}).inject($('cuadroInfo'));
	lineaRes.load('ajax/desconectarPuertos.php?'+evolucion+'&'+maintain+'&puerto='+puerto+'&side='+side+'&tabla='+tabla);
	});
}

function connectPort(el)
{
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
var tabla='';
var side='';
var idPuertos=new Array();
var nombrePuertos=new Array();
var circuit='0';
var connector='';
var table='';
var id='0';
if (el.getParent('.tablaDiv'))
	{//ports view
	tabla=el.getParent('.tablaDiv').get('tabla');
	var linea=el.getParent('.lineaDatos');
	side=el.get('side');
	idPuertos=new Array(linea.get('linea'));
	nombrePuertos=new Array(getValorLinea(linea,'Name'));
	var tablaPadre=linea.getParent('.tablaDiv');
	if (tablaPadre.getElement('.botonAgruparPuertos'))
		{
		var claseGrupo='';
		if (tablaPadre.getElement('.botonAgruparPuertos').hasClass('desagruparPuertos'))
			{
			if (lineIsGrouped(linea,side))
				{
				var siguiente=linea.getNext('.lineaDatos');
				idPuertos[1]=siguiente.get('linea');
				nombrePuertos[1]=getValorLinea(siguiente,'Name');
				}
			}
		}
	switch (side)
		{
		case 'Front':
		case 'Rear':
			circuit=linea.getElement('.datos[campo="Circuit'+side+'"]').get('circuit');
			if (circuit=='0')
				{
				var otherSide='Front';
				if (side=='Front')
					{otherSide='Rear';}
				circuit=linea.getElement('.datos[campo="Circuit'+otherSide+'"]').get('circuit');
				}
			connector=$('panelInfoForm').getElement('.datos[campo="Connector"]').get('text');
			//special connectors
			if ($('marcoPanelFront').hasAttribute('connector'+side))
				{
				connector=$('marcoPanelFront').get('connector'+side).replace(/_/g, " ");
				}
			table='Panels';
			id=$('panelInfoForm').get('idForm');
		break;
		case 'In':
		case 'Out':
			circuit=linea.getElement('.datos[campo="Circuit'+side+'"]').get('circuit');
			if (circuit=='0')
				{
				var otherSide='In';
				if (side=='In')
					{otherSide='Out';}
				circuit=linea.getElement('.datos[campo="Circuit'+otherSide+'"]').get('circuit');
				}
			connector=getValorLinea(linea,'Connector');
			table='OffnetPorts';
			id=linea.get('linea');
		break;
		case 'Dest':
			connector=getValorLinea(linea,'Media')+' '+getValorLinea(linea,'Connector');
			circuit=linea.getElement('.datos[campo="Circuit'+side+'"]').get('circuit');
			table='EqChassis';
			id=$('eqInfoForm').get('idForm');
		break;
		}
	}
else
	{//circuit view
	var parent=el.getParent('.filaDescriptorRed');
	tabla=parent.get('tabla');
	var blockParent=el.getParent('.portBlock');
	var portSide='In';
	var otherSide='Out';
	if (blockParent.hasClass('salidaPuerto'))
		{portSide='Out';otherSide='In';}
	idPuertos=new Array(parent.get('idTabla'));
	side=blockParent.get('text');
	if (side=='PORT')
		{
		side='Dest';
		}
	if (parent.hasClass('grouped2'))
		{
		idPuertos[1]=parent.get('otherPort');
		}
	nombrePuertos=parent.getElement('.descriptorRedPrimario').get('text').split('/');
	var descParent=el.getParent('.descriptorRed');
	circuit=descParent.getNext('.circuit'+portSide).get('text');
	if (circuit=='0')
		{circuit=descParent.getNext('.circuit'+otherSide).get('text');}
	switch (side)
		{
		case 'Front':
		case 'Rear':
			//connector=
			table='Panels';
			id=descParent.getElement('.descriptorPanels').get('idTabla');
		break;
		case 'In':
		case 'Out':
			//connector=
			table='OffnetPorts';
			id=idPuertos[0];
		break;
		case 'Dest':
			//connector=getValorLinea(linea,'Media')+' '+getValorLinea(linea,'Connector');
			table='EqChassis';
			id=descParent.getElement('.descriptorEqChassis').get('idTabla');
		break;
		}
	if (descParent.getElement('.descriptorSites'))
		{siteBase=descParent.getElement('.descriptorSites').get('idTabla');thisTable='Sites';}
	if (descParent.getElement('.descriptorFloors'))
		{floorBase=descParent.getElement('.descriptorFloors').get('idTabla');thisTable='Floors';}
	if (descParent.getElement('.descriptorRooms'))
		{roomBase=descParent.getElement('.descriptorRooms').get('idTabla');thisTable='Rooms';}
	if (descParent.getElement('.descriptorRacks'))
		{rackBase=descParent.getElement('.descriptorRacks').get('idTabla');thisTable='Racks';}
	if (descParent.getElement('.descriptorPanels'))
		{panelBase=descParent.getElement('.descriptorPanels').get('idTabla');thisTable='Panels';}
	}
$('popUp').set('html',newConnectionTemplate(table,id,idPuertos,connector,nombrePuertos,side,circuit));
$('continuarNewConnection').addEvent('click',function(e){continuarNewConnection()});
if ($('changeCircuitConnection')){$('changeCircuitConnection').addEvent('click',function(e){$('newCircuitSpace').removeClass('oculto');$('maintainCircuitSpace').addClass('oculto');$('camposNewConnection').getElement('input[name="Circuit"]').value='0';});}
autoSelectsNewCircuit('valoresEditablesNewConnection','containerNewConnection');
}

function autoSelectsNewCircuit(form,container)
{
$(form).set('containerAutoSelects',container);
$(form).getElement('input[name="Reference"]').addEvent('focus',function(e){
	var f=e.target.getParent('form');
	addAutoSelect(f.getElement('input[name="Reference"]'),$(f.get('containerAutoSelects')));
	e.target.getParent('form').getElement('input[name="Reference"]').addEvent('afterAutoselect', function(linea){
		var f=this.getParent('form');
		f.getElement('input[name="Circuit"]').value=linea.get('linea');
		populateFormFromLine(f,linea,true);
		});
	});
$(form).getElement('input[name="Customer"]').addEvent('focus',function(e){
	var f=e.target.getParent('form');
	addAutoSelect(f.getElement('input[name="Customer"]'),$(f.get('containerAutoSelects')));
	});
$(form).getElement('input[name="Provider"]').addEvent('focus',function(e){
	var f=e.target.getParent('form');
	addAutoSelect(f.getElement('input[name="Provider"]'),$(f.get('containerAutoSelects')));
	});
}

function afterDesconexion(valores)
{
var arrVal=JSON.decode(valores);
//$_GET['fromId'],$_GET['fromType'],$_GET['fromSide'],$_GET['toId'],$_GET['toType'],$_GET['toSide'],risersLiberados
var fromId=arrVal[0];
var fromType=arrVal[1];
var sideFrom=arrVal[2];
var toId=arrVal[3];
var type=arrVal[4];
var sideTo=arrVal[5];
var risers=arrVal[6].split(',');
var nuevosLiberados=0;
var maintainCircuit=arrVal[7]*1;
risers.each(function(riser)
	{
	if ((riser*1)!=0)
		{nuevosLiberados++;}
	});
var risersLiberados=($('lineaRisersLiberados').get('disconnected')*1) + nuevosLiberados;
$('lineaRisersLiberados').set('text', 'Resources liberated on risers: '+risersLiberados);
$('lineaRisersLiberados').set('disconnected',risersLiberados);

var tablaPuertos='';
var portsTableExist=true;
if ($('circuitLeft'))
	{
	portsTableExist=false;
	}
$$('.tablaPuertos').each(function(item)
	{
	if (item.getElement('.lineaDatos[linea="'+fromId+'"]'))
		{
		tablaPuertos=item.get('id');
		}
	});
if (portsTableExist)
	{
	var linea=$(tablaPuertos).getElement('.lineaDatos[linea="'+fromId+'"]');
	linea.getElement('.datos[campo="'+sideFrom+'Type"]').getElement('.valor').set('text','');
	linea.getElement('.datos[campo="'+sideFrom+'Connection"]').getElement('.valor').set('text','0');
	linea.getElement('.datos[campo="Status'+sideFrom+'"]').getElement('.valor').set('text','FREE');
	if (maintainCircuit==0)
		{linea.getElement('.datos[campo="Circuit'+sideFrom+'"]').getElement('.valor').set('text','0');}
	else
		{
		linea.getElement('.datos[campo="Circuit'+sideFrom+'"]').getElement('.valor').set('text',linea.getElement('.datos[campo="Circuit'+sideFrom+'"]').get('circuit'));
		}
	if (linea.getElement('.datos[campo="Label'+sideFrom+'"]'))
		{
		linea.getElement('.datos[campo="Label'+sideFrom+'"]').getElement('.valor').set('text','Unchecked');
		}
	otherSide='';
	if (fromType=='Panel')
		{
		otherSide='Front';
		if (sideFrom=='Front')
			{
			otherSide='Rear';
			}
		}
	if (fromType=='Offnet')
		{
		otherSide='In';
		if (sideFrom=='In')
			{
			otherSide='Out';
			}
		}

	if ((fromType=='Panel')||(fromType=='Offnet'))
		{
		if (maintainCircuit==0 && getValorLinea(linea,'Riser'+otherSide)!='0'&& getValorLinea(linea,'Riser'+otherSide+'Status')=='SERVICE')
			{
			if (risers.indexOf(getValorLinea(linea,'Riser'+otherSide))>-1)
				{
				linea.getElement('.datos[campo="Riser'+otherSide+'Status"]').getElement('.valor').set('text','AVAILABLE');
				linea.getElement('.datos[campo="Circuit'+otherSide+'"]').getElement('.valor').set('text','0');
				inicializarEstadosPuertos(linea,otherSide);
				}
			}
		}
		
	inicializarEstadosPuertos(linea,sideFrom);

	if ((fromType=='Panel' && type=='Panel'))
		{
		if ($('tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]'))
			{
			var linea=$('tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]');
			linea.getElement('.datos[campo="'+sideTo+'Type"]').getElement('.valor').set('text','');
			linea.getElement('.datos[campo="'+sideTo+'Connection"]').getElement('.valor').set('text','0');
			linea.getElement('.datos[campo="Status'+sideTo+'"]').getElement('.valor').set('text','FREE');
			linea.getElement('.datos[campo="Circuit'+sideTo+'"]').getElement('.valor').set('text','0');
			if (linea.getElement('.datos[campo="Label'+sideTo+'"]'))
				{
				linea.getElement('.datos[campo="Label'+sideTo+'"]').getElement('.valor').set('text','Unchecked');
				}
			inicializarEstadosPuertos(linea,sideTo);
			var otherSide='Front';
			if (sideTo=='Front')
				{
				otherSide='Rear';
				}
			if (getValorLinea(linea,'Riser'+otherSide)!='0'&& getValorLinea(linea,'Riser'+otherSide+'Status')=='SERVICE')
				{
				if (risers.indexOf(getValorLinea(linea,'Riser'+otherSide))>-1)
					{
					linea.getElement('.datos[campo="Riser'+otherSide+'Status"]').getElement('.valor').set('text','AVAILABLE');
					linea.getElement('.datos[campo="Circuit'+otherSide+'"]').getElement('.valor').set('text','0');
					inicializarEstadosPuertos(linea,otherSide);
					}
				}
			}
		}
		
	//caso Offnet-Offnet

	if ((fromType=='Eq') && (type=='Eq'))
		{
		if ($('eqLeft').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]'))
			{
			var linea=$('eqLeft').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]');
			linea.getElement('.datos[campo="'+sideTo+'Type"]').getElement('.valor').set('text','');
			linea.getElement('.datos[campo="'+sideTo+'Connection"]').getElement('.valor').set('text','0');
			linea.getElement('.datos[campo="Status'+sideTo+'"]').getElement('.valor').set('text','FREE');
			linea.getElement('.datos[campo="Circuit'+sideTo+'"]').getElement('.valor').set('text','0');
			if (linea.getElement('.datos[campo="Label'+sideTo+'"]'))
				{
				linea.getElement('.datos[campo="Label'+sideTo+'"]').getElement('.valor').set('text','Unchecked');
				}
			inicializarEstadosPuertos(linea,sideTo);
			}
		}	
	}
var disconnected=($('lineaDesconexiones').get('disconnected')*1) + 1;
$('lineaDesconexiones').set('text', disconnected + ' ports disconnected.');
$('lineaDesconexiones').set('disconnected',disconnected);
if (disconnected==($('lineaDesconexiones').get('ports')*1))
	{
	setTimeout(function(){$('cuadroInfo').addClass("oculto");},2000);
	if (typeof(disconnectionCompleted) == 'function')
		{
		setTimeout(function(){disconnectionCompleted();},1000);
		}
	}

}	


function afterConexion(valores)
{
var arrVal=JSON.decode(valores);
//$_GET['fromId'],$_GET['fromType'],$_GET['fromSide'],$_GET['toId'],$_GET['toType'],$_GET['toSide'],$_GET['cableType'],$_GET['circuit'],$_GET['customer']);
var fromId=arrVal[0];
var fromType=arrVal[1];
var sideFrom=arrVal[2];
var toId=arrVal[3];
var type=arrVal[4];
var sideTo=arrVal[5];
var circuit=arrVal[7];
var tablaPuertos='';
var portsTableExist=true;
if ($('circuitLeft'))
	{
	portsTableExist=false;
	}
$$('.tablaPuertos').each(function(item)
	{
	if (item.getElement('.lineaDatos[linea="'+fromId+'"]'))
		{
		tablaPuertos=item.get('id');
		}
	});
if (portsTableExist)
	{
	var linea=$(tablaPuertos).getElement('.lineaDatos[linea="'+fromId+'"]');
	linea.getElement('.datos[campo="'+sideFrom+'Type"]').getElement('.valor').set('text',type);
	linea.getElement('.datos[campo="'+sideFrom+'Connection"]').getElement('.valor').set('text',toId);
	linea.getElement('.datos[campo="Status'+sideFrom+'"]').getElement('.valor').set('text','CONNECTED');
	linea.getElement('.datos[campo="Circuit'+sideFrom+'"]').getElement('.valor').set('text',circuit);

	otherSide='';
	if (fromType=='Panel')
		{
		otherSide='Front';
		if (sideFrom=='Front')
			{
			otherSide='Rear';
			}
		}
	if (fromType=='Offnet')
		{
		otherSide='In';
		if (sideFrom=='In')
			{
			otherSide='Out';
			}
		}

	if ((fromType=='Panel')||(fromType=='Offnet'))
		{
		if (getValorLinea(linea,'Riser'+otherSide)!='0'&& getValorLinea(linea,'Riser'+otherSide+'Status')=='AVAILABLE')
			{
			linea.getElement('.datos[campo="Riser'+otherSide+'Status"]').getElement('.valor').set('text','SERVICE');
			linea.getElement('.datos[campo="Circuit'+otherSide+'"]').getElement('.valor').set('text',circuit);
			inicializarEstadosPuertos(linea,otherSide);
			}
		}
		
	inicializarEstadosPuertos(linea,sideFrom);

	if ((fromType=='Panel' && type=='Panel')||(fromType=='Offnet' && type=='Offnet'))
		{
		if ($(tablaPuertos).getElement('.lineaDatos[linea="'+toId+'"]'))
			{
			var linea=$(tablaPuertos).getElement('.lineaDatos[linea="'+toId+'"]');
			linea.getElement('.datos[campo="'+sideTo+'Type"]').getElement('.valor').set('text',type);
			linea.getElement('.datos[campo="'+sideTo+'Connection"]').getElement('.valor').set('text',fromId);
			linea.getElement('.datos[campo="Status'+sideTo+'"]').getElement('.valor').set('text','CONNECTED');
			linea.getElement('.datos[campo="Circuit'+sideTo+'"]').getElement('.valor').set('text',circuit);
			inicializarEstadosPuertos(linea,sideTo);
			var otherSide='Front';
			if (fromType=='Panel')
				{
				if (sideTo=='Front')
					{
					otherSide='Rear';
					}
				 }
			else
				{
				otherSide='In';
				if (sideTo=='In')
					{
					otherSide='Out';
					}
				}
			if (getValorLinea(linea,'Riser'+otherSide)!='0'&& getValorLinea(linea,'Riser'+otherSide+'Status')=='AVAILABLE')
				{
				linea.getElement('.datos[campo="Riser'+otherSide+'Status"]').getElement('.valor').set('text','SERVICE');
				linea.getElement('.datos[campo="Circuit'+otherSide+'"]').getElement('.valor').set('text',circuit);
				inicializarEstadosPuertos(linea,otherSide);
				}
			}
		}

	if ((fromType=='Eq') && (type=='Eq'))
		{
		if ($('eqLeft').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]'))
			{
			var linea=$('eqLeft').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]');
			linea.getElement('.datos[campo="'+sideTo+'Type"]').getElement('.valor').set('text',type);
			linea.getElement('.datos[campo="'+sideTo+'Connection"]').getElement('.valor').set('text',fromId);
			linea.getElement('.datos[campo="Status'+sideTo+'"]').getElement('.valor').set('text','CONNECTED');
			linea.getElement('.datos[campo="Circuit'+sideTo+'"]').getElement('.valor').set('text',circuit);
			inicializarEstadosPuertos(linea,sideTo);
			}
		}	
	}

var connected=($('lineaConexiones').get('connected')*1) + 1;
$('lineaConexiones').set('text', connected + ' connections completed');
$('lineaConexiones').set('connected',connected);
if (connected==($('lineaConexiones').get('ports')*1))
	{
	setTimeout(function(){$$(".popUpElement").addClass("oculto");},2000);
	if (typeof(connectionCompleted) == 'function')
		{
		setTimeout(function(){connectionCompleted();},1000);
		}
	}

}	


function continuarNewConnection()
{
//comprobar valores y bloquear form
var continuar=true;
var circuit='';
var customer='';
if ($('maintainCircuitSpace'))
	{
	circuit=$('maintainCircuitSpace').getElement('.circuitRef').get('text');
	customer=$('maintainCircuitSpace').getElement('.spanCustomer').get('text');
	}
else
	{
	circuit=$('valoresEditablesNewConnection').getElement('input[name="Reference"]').value;
	customer=$('valoresEditablesNewConnection').getElement('input[name="Customer"]').value;
	}

var destination=getRadioValue($('valoresEditablesNewConnection'),'destination');
var continuar=true;
if (circuit=='' || circuit==' ')
	{
	continuar=confirm('Are you sure you want to continue with a blank circuit (precabling)?');
	}
if (destination!='EqPorts' && destination!='OffnetPorts' && destination!='PanelPorts' && destination!='newOffnetPorts')
	{
	continuar=false;
	alert('Please select the type of destination.');
	}
if (getSelectValue($('valoresEditablesNewConnection'),'CableType')=='')
	{
	continuar=false;
	alert('Please select the type of cable.');
	}
if (continuar)
	{
	$('continuarNewConnection').addClass('oculto');
	$('camposNewConnection').setStyle('border-color','green');
	$('newConnectionNavigationArea').removeClass('oculto');
	$('newConnectionCircuitArea').removeClass('oculto');
	disableForm($('valoresEditablesNewConnection'));
	if ($('toPortsClear'))
		{
		$('toPortsClear').addEvent('click',function(e)
			{
			$('riserPortsToArea').empty();
			$('finalizarNewConnection').addClass('oculto');
			$('newConnectionNavigationArea').getElements('.puertoSeleccionado').each(function(puerto)
				{
				puerto.removeClass('puertoSeleccionado');
				});
			});
		}
	if ($('toPortsSwap'))
		{
		$('toPortsSwap').addEvent('click',function(e)
			{
			if ($('riserPortsToArea').getElements('.newRiserPort').length==2)
				{
				var ports=$('riserPortsToArea').getElements('.newRiserPort');
				ports[0].inject(ports[1],'after');
				}
			else
				{
				alert("swap only allowed when two ports are selected");
				}
			});
		}
	if (destination=='PanelPorts')
		{
		$('bloqueNavegacionConnection').load('ajax/navigateNetwork.php?tipoDestino=Panels&tabla='+$('newConnectionLeft').get('tabla')+'&id='+$('newConnectionLeft').get('idTabla'));
		$('frontSelectionDestPanel').addEvent('click',function(e){
			$('frontSelectionDestPanel').addClass('botonLinkSeleccionado');
			$('rearSelectionDestPanel').removeClass('botonLinkSeleccionado');
			$('marcoFrontDestPanel').removeClass('oculto');
			$('marcoRearDestPanel').addClass('oculto');
			limpiarPuertosConexiones();
			});
		$('rearSelectionDestPanel').addEvent('click',function(e){
			$('frontSelectionDestPanel').removeClass('botonLinkSeleccionado');
			$('rearSelectionDestPanel').addClass('botonLinkSeleccionado');
			$('marcoFrontDestPanel').addClass('oculto');
			$('marcoRearDestPanel').removeClass('oculto');
			limpiarPuertosConexiones();
			});
		if ($('newConnectionLeft').get('tabla')=='Panels')
			{$('infoDestPanel').load('ajax/getPanelInfo.php?id='+panelBase);}
		$('finalizarNewConnection').addEvent('click',function(e)
			{
			finalizarNewConnection();
			});
		}
	else
		{
		if (destination=='EqPorts')
			{
			$('bloqueNavegacionConnection').load('ajax/navigateNetwork.php?tipoDestino=EqChassis&tabla='+$('newConnectionLeft').get('tabla')+'&id='+$('newConnectionLeft').get('idTabla'));
			$('bloqueNavegacionConnection').set('tipo','EqPorts');
			$('finalizarNewConnection').addEvent('click',function(e)
				{
				finalizarNewConnection();
				});
			}
		else//offnet
			{
			if (destination=='newOffnetPorts')
				{
				var i=0;
				var ports=$('riserPortsFromArea').getElements('.newRiserPort').length;
				while (i<ports)
					{
					var el=new Element('div',{'class':'newRiserPort'}).inject($('riserPortsToArea'));
					new Element('input',{'class':'pequenumber'}).inject(el);
					i++;
					}
				var ownerOffnet=new Element('div').inject($('newConnectionCircuitArea'));
				ownerOffnet.set('html','<span style="padding-left:10px;padding-right:10px;">Ports owner</span><input id="offnetPortsOwner" type="text" value="'+customer+'">');
				$('tituloDestConnection').set('text','Select destination for creating the offnet ports (site, floor, room or rack)');
				var found=false;
				if (typeof(rackBase)!='undefined')
					{
					if (rackBase!=0)
						{
						$('bloqueNavegacionConnection').load('ajax/navigateNetwork.php?tabla=Racks&id='+rackBase);
						found=true;
						}
					}
				if (!found)
					{
					if (typeof(roomBase)!='undefined')
						{
						if (roomBase!=0)
							{
							$('bloqueNavegacionConnection').load('ajax/navigateNetwork.php?tabla=Rooms&id='+roomBase);
							found=true;
							}
						}
					}
						
				if (!found)
					{
					if (typeof(floorBase)!='undefined')
						{
						if (floorBase!=0)
							{
							$('bloqueNavegacionConnection').load('ajax/navigateNetwork.php?tabla=Floors&id='+floorBase);
							found=true;
							}
						}
					}
				if (!found)
					{
					$('bloqueNavegacionConnection').load('ajax/navigateNetwork.php?tabla=Sites&id='+siteBase);
					}
				$('bloqueNavegacionConnection').set('tipo','newOffnetPorts');
				$('finalizarNewConnection').addEvent('click',function(e)
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
							var cableType=getSelectValue($('valoresEditablesNewConnection'),'CableType');
							mensaje.load('ajax/newOffnetPort.php?cableType='+cableType+'&nombre='+nombrePuerto+'&owner='+encodeURIComponent($(offnetPortsOwner).value)+'&orden='+i+'&tabla='+$('lugarPortOffnet').get('tabla')+'&id='+$('lugarPortOffnet').get('idTabla'));
							i++;
							});
						
						}
					else
						{
						alert('Please fill the names for all the new offnet ports')
						}
					});
				
				
				}
			else
				{
				$('tituloDestConnection').set('text','Select the offnet ports');
				var idBase;
				switch (thisTable)
					{
					case 'Rooms':
						idBase=roomBase;
						break;
					case 'Racks':
						idBase=rackBase;
						break;
					case 'Panels':
						idBase=panelBase;
						break;
					}
				$('bloqueNavegacionConnection').load('ajax/navigateNetwork.php?tabla='+thisTable+'&id='+idBase);
				$('bloqueNavegacionConnection').set('tipo','OffnetPorts');
				$('finalizarNewConnection').addEvent('click',function(e)
					{
					finalizarNewConnection();
					});
				}
			}
		}
		
	}
}

function afterNewOffnetPort(nuevoPuerto,orden,side)
{
if (side=='to')
	{
	var puerto=$('riserPortsToArea').getElement('.newRiserPort[orden="'+orden+'"]');
	puerto.set('idPort',nuevoPuerto);
	var cuenta=$('riserPortsToArea').get('cuenta')*1;
	cuenta++;
	$('riserPortsToArea').set('cuenta',cuenta);
	if ($('valoresEditablesNewRiser'))
		{//riser
		var cableType=getSelectValue($('valoresEditablesNewRiser'),'CableType');
		var ports=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
		if (cuenta==ports)
			{
			var fromType=$('containerNewRiser').get('table');
			var fromId=$('containerNewRiser').get('tableId');
			var toType=$('lugarRiserOffset').get('tabla');
			var toId=$('lugarRiserOffset').get('idTabla');
			$('lineaNuevoRiser').load('ajax/guardarNuevoRiser.php?cableType='+encodeURIComponent(cableType)+'&ports='+ports+'&fromType='+fromType+'&fromId='+fromId+'&toType='+toType+'&toId='+toId);
			}
		}
	else
		{
		var ports=$('riserPortsFromArea').getElements('.newRiserPort').length;
		if (cuenta==ports)
			{
			finalizarNewConnection();
			}
		}
	}
else
	{
	var cableType=getSelectValue($('valoresEditablesNewRiser'),'CableType');
	var puerto=$('riserPortsFromArea').getElement('.newRiserPort[orden="'+orden+'"]');
	puerto.set('idPort',nuevoPuerto);
	var puerto=$('riserPortsToArea').getElement('.newRiserPort[orden="'+orden+'"]');
	var nombrePuerto=encodeURIComponent(puerto.getElement('input').value);
	var mensaje=new Element('div',{'class':'mensaje oculto'}).inject(puerto);
	mensaje.load('ajax/newOffnetPort.php?cableType='+cableType+'&nombre='+nombrePuerto+'&orden='+orden+'&tabla='+$('lugarRiserOffset').get('tabla')+'&id='+$('lugarRiserOffset').get('idTabla'));
	}
}

function crearConexiones()
{
var destination='';
var maintainCircuits='';
var sideFrom='';
var endButton='finalizarNewConnection';
if ($('finalizarNewRiser'))
	{
	destination='PanelPorts';
	endButton='finalizarNewRiser';
	if ($('maintainCircuitNames'))
		{
		if ($('maintainCircuitNames').checked)
			{
			maintainCircuits='&maintainCircuits=1';
			}
		}
	}
else
	{
	destination=getRadioValue($('valoresEditablesNewConnection'),'destination');
	}
var sideFrom=$(endButton).get('sideFrom');
var ports=$('riserPortsFromArea').getElements('.newRiserPort').length;
var linea2=new Element('div',{'class':'mensaje','id':'lineaConexiones','ports':ports,'connected':'0'}).inject($('mensajeNuevaTarjeta'));
var circuit=$('valoresEditablesNewConnection').getElement('input[name="Circuit"]').value;

var customer='';
var provider='';
var type='';
var reference='';
var refType='';
if ($('valoresEditablesNewConnection').getElement('input[name="Customer"]'))
	{customer=$('valoresEditablesNewConnection').getElement('input[name="Customer"]').value;}

if ($('valoresEditablesNewConnection').getElement('input[name="Provider"]'))
	{
	provider=$('valoresEditablesNewConnection').getElement('input[name="Provider"]').value;
	reference=$('valoresEditablesNewConnection').getElement('input[name="Reference"]').value;
	type=getSelectValue($('valoresEditablesNewConnection'),'Type');
	refType=getSelectValue($('valoresEditablesNewConnection'),'ReferenceType');
	}


var i=0;
var toSide=$(endButton).get('sideTo');
var puertosFrom=$('riserPortsFromArea').getElements('.newRiserPort');
var puertosTo=$('riserPortsToArea').getElements('.newRiserPort');
var fromType=$(endButton).get('fromType');
var toType='Panel';
var evolucion="evolucion=1";
if ($('evolucionConexion').checked)
	{
	evolucion="evolucion=0";
	}
var cableType=getSelectValue($('valoresEditablesNewConnection'),'CableType');
if (destination=='OffnetPorts' || destination=='newOffnetPorts')
	{
	toType='Offnet';
	toSide='Out';
	}
else
	{
	if (destination=='EqPorts')
		{
		toType='Eq';
		toSide='Dest';
		}
	}
while (i<ports)
	{
	var espTemp=new Element('div',{'class':'oculto'}).inject(linea2);
	var circuitToSend=circuit;
	var customerToSend=customer;
	if ((circuit=='0' || circuit=='') && customer=='' && fromType=='Eq' && sideFrom=='Dest')//maintain circuit names on precablings
		{
		if ($('cardContainer'))
			{
			if ($('cardContainer').getElement('.tablaPuertos'))
				{
				var portLine=$('cardContainer').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+puertosFrom[i].get('idPort')+'"]');
				circuitToSend=portLine.getElement('.datos[campo="CircuitDest"]').get('circuit');
				customerToSend='';
				}
			}
		}
	espTemp.load('ajax/conexionNueva.php?'+evolucion+maintainCircuits+'&Reference='+encodeURIComponent(reference)+'&Provider='+encodeURIComponent(provider)+'&RefType='+encodeURIComponent(refType)+'&Type='+encodeURIComponent(type)+'&customer='+encodeURIComponent(customerToSend)+'&circuit='+encodeURIComponent(circuitToSend)+'&cableType='+encodeURIComponent(cableType)+'&fromSide='+sideFrom+'&fromType='+fromType+'&fromId='+puertosFrom[i].get('idPort')+'&toSide='+toSide+'&toType='+toType+'&toId='+puertosTo[i].get('idPort'));
	i++;
	}
}

function finalizarNewConnection()
{
$('mensajeNuevaTarjeta').removeClass('oculto');
crearConexiones();
}

function equipmentCargado(id)
{
$('containerDestEqConnection').removeClass('oculto');
tablaToLista($('cardsForConnect'+id));
$('cardsForConnect'+id).getElements('.celda').each(function(celda)
	{
	celda.addClass('textoPeque');
	});
$('cardsForConnect'+id).getElements('.lineaDatos').each(function(linea)
	{
	linea.addClass('botonLink');
	linea.addEvent('click',function(e)
		{
		var lineaSel=e.target;
		if (!e.target.hasClass('lineaDatos'))
			{
			lineaSel=e.target.getParent('.lineaDatos');
			}
		$('containerDestEqConnection').getElement('.cardContainer').load('ajax/cardForConnect.php?id='+lineaSel.get('linea'));
		});
	});
}

function cardCargada(id)
{
if ($('eqPortsForConnect'+id).getElements('.lineaDatos').length==0)
	{new Element('div',{'text':'No free ports found'}).inject($('eqPortsForConnect'+id),'before');}
else
	{
	tablaToLista($('eqPortsForConnect'+id));
	$('eqPortsForConnect'+id).getElements('.celda').each(function(celda)
		{
		celda.addClass('textoPeque');
		});
	$('eqPortsForConnect'+id).getElements('.lineaDatos').each(function(linea)
		{
		linea.addClass('botonLink');
		linea.addEvent('click',function(e)
			{
			var lineaSel=e.target;
			if (!e.target.hasClass('lineaDatos'))
				{
				lineaSel=e.target.getParent('.lineaDatos');
				}
			conexionEqPortSeleccionado(lineaSel);
			});
		});
	}
}

function panelCargado(id)
{
if ($('containerDestRiser'))
	{
	$('containerDestRiser').removeClass('oculto');
	}
if ($('containerDestPanelConnection'))
	{
	$('containerDestPanelConnection').removeClass('oculto');
	}
var infoPanel=$('infoPanel'+id);
var us=infoPanel.getElement('.datos[campo="Us"]').get('text')*1;
var puertos=infoPanel.getElement('.datos[campo="Ports"]').get('text')*1;
var modelo=infoPanel.getElement('.datos[campo="Model"]').get('html');
$$('.marcoDestino').each(function(item){item.empty();});
var tam=$('marcoDestPanel').getSize();
var altura=Math.round((tam.x*us)/15);
$('marcoDestPanel').setStyle('height',altura+'px');
dibujarModeloPanel('marcoFrontDestPanel',modelo,puertos);
getRearPanel('marcoFrontDestPanel','marcoRearDestPanel',modelo);
estadoPuertosPanel('infoPanelPorts'+id,'marcoFrontDestPanel','marcoRearDestPanel');
if ($('containerDestRiser'))
	{
	activarPuertosLibresRiser();
	}
if ($('containerDestPanelConnection'))
	{
	activarPuertosLibresConnection();
	}
}

function activarPuertosLibresConnection()
{
$('marcoFrontDestPanel').getElements('.puertoPanel').each(function(puerto)
	{
	if (puerto.get('estado')=='' || puerto.get('estado')=='FREE')
		{
		puerto.setStyle('cursor','pointer');	
		puerto.addEvent('click',function(e){conexionDestinoSeleccionado(e.target);});
		}
	});
$('marcoRearDestPanel').getElements('.puertoPanel').each(function(puerto)
	{
	if (puerto.get('estado')=='' || puerto.get('estado')=='FREE')
		{
		puerto.setStyle('cursor','pointer');	
		puerto.addEvent('click',function(e){conexionDestinoSeleccionado(e.target);});
		}
	});

//permito tambien conexiones a puertos con estado connected pero realmente no conectados
var tablaDiv=$('containerDestPanelConnection').getElement('.tablaDiv[tabla="PanelPorts"]');
tablaDiv.getElements('.lineaDatos').each(function(linea)
	{
	if (getValorLinea(linea,'StatusFront')=='CONNECTED' && getValorLinea(linea,'FrontConnection')=='0')
		{
		var puerto=$('marcoFrontDestPanel').getElement('.puertoPanel[idPort="'+linea.get('linea')+'"]');
		puerto.setStyle('cursor','pointer');	
		puerto.setStyle('background-color','orange');	
		puerto.addEvent('click',function(e){conexionDestinoSeleccionado(e.target);});
		}
	if (getValorLinea(linea,'StatusRear')=='CONNECTED' && getValorLinea(linea,'RearConnection')=='0')
		{
		var puerto=$('marcoRearDestPanel').getElement('.puertoPanel[idPort="'+linea.get('linea')+'"]');
		puerto.setStyle('cursor','pointer');	
		puerto.setStyle('background-color','orange');	
		puerto.addEvent('click',function(e){conexionDestinoSeleccionado(e.target);});
		}
	});

//puertos actuales marcados como seleccionados y no se permite su selección

}

function initExistingOffnetPorts()
{
if ($('FreeOffnetPortsOwned').getElements('.lineaDatos').length==0)
	{new Element('div',{'text':'No free ports found'}).inject($('FreeOffnetPortsOwned'),'before');}
else
	{
	tablaToLista($('FreeOffnetPortsOwned'));
	ocultarColumna('FreeOffnetPortsOwned','StatusIn');
	ocultarColumna('FreeOffnetPortsOwned','StatusOut');
	$('FreeOffnetPortsOwned').getElements('.lineaDatos').each(function(line)
		{
		initExistingOffnetLine(line);
		
		});
	}
if ($('FreeOffnetPortsOthers').getElements('.lineaDatos').length==0)
	{new Element('div',{'text':'No free ports found'}).inject($('FreeOffnetPortsOthers'),'before');}
else
	{
	tablaToLista($('FreeOffnetPortsOthers'));
	ocultarColumna('FreeOffnetPortsOthers','StatusIn');
	ocultarColumna('FreeOffnetPortsOthers','StatusOut');
	$('FreeOffnetPortsOthers').getElements('.lineaDatos').each(function(line)
		{
		initExistingOffnetLine(line);
		});
	agruparTabla('FreeOffnetPortsOthers','Owner');
	}

}

function initExistingOffnetLine(line)
{
line.addClass('botonLink');
line.addEvent('click',function(e)
	{
	var lineSel=e.target;
	if (!e.target.hasClass('lineaDatos'))
		{
		lineSel=e.target.getParent('.lineaDatos');
		}
	OffnetPortSelectedConnection(lineSel);
	});
var statusOut=getValorLinea(line,'StatusOut');
if (statusOut=='FREE' || statusOut=='')
	{
	line.set('side','Out');
	}
else
	{
	line.set('side','In');
	}
}

function limpiarPuertosConexiones()
{
$$('.puertoSeleccionado').each(function(item)
	{
	item.removeClass('puertoSeleccionado');
	});
$('riserPortsToArea').empty();
}

function OffnetPortSelectedConnection(line)
{
var ports=$('newConnectionCircuitArea').get('ports')*1;
var selectedPorts=$('riserPortsToArea').getElements('.newRiserPort').length;
if (selectedPorts<ports)
	{
	new Element('div',{'class':'newRiserPort','text':getValorLinea(line,'Name'),'idPort':line.get('linea')}).inject($('riserPortsToArea'));
	}
else
	{
	alert ('Please clear the panel or select a new one before selecting new ports');
	}
if ((selectedPorts+1)==ports)
	{
	$('finalizarNewConnection').removeClass('oculto');
	$('finalizarNewConnection').set('sideTo',line.get('side'));
	}
}

function conexionEqPortSeleccionado(lineaPuerto)
{
var ports=$('newConnectionCircuitArea').get('ports')*1;
var selectedPorts=$('riserPortsToArea').getElements('.newRiserPort').length;
if (selectedPorts<ports)
	{
	new Element('div',{'class':'newRiserPort','text':getValorLinea(lineaPuerto,'Name'),'idPort':lineaPuerto.get('linea')}).inject($('riserPortsToArea'));
	}
else
	{
	alert ('Please clear the panel or select a new one before selecting new ports');
	}
if ((selectedPorts+1)==ports)
	{
	$('finalizarNewConnection').removeClass('oculto');
	$('finalizarNewConnection').set('sideTo','DEST');
	}
}

function conexionDestinoSeleccionado(el)
{
var ports=$('newConnectionCircuitArea').get('ports')*1;
var selectedPorts=$('riserPortsToArea').getElements('.newRiserPort').length;
if (selectedPorts<ports)
	{
	new Element('div',{'class':'newRiserPort','text':el.get('portName'),'idPort':el.get('idPort')}).inject($('riserPortsToArea'));
	el.addClass('puertoSeleccionado');
	}
else
	{
	alert ('Please clear the panel or select a new one before selecting new ports');
	}

if ((selectedPorts+1)==ports)
	{
	$('finalizarNewConnection').removeClass('oculto');
	var sideTo='';
	if ($('frontSelectionDestPanel').hasClass('botonLinkSeleccionado'))
			{
			sideTo='Front';
			}
		else
			{
			sideTo='Rear';
			}
	$('finalizarNewConnection').set('sideTo',sideTo);
	}

}

function activarPuertosLibresRiser()
{
//var puertosNecesarios=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
var puertosNecesarios=$('riserPortsFromArea').getElements('.newRiserPort').length;
var puertosLibresFront=0;
$('marcoFrontDestPanel').getElements('.puertoPanel').each(function(puerto)
	{
	if (puerto.get('estado')=='' || puerto.get('estado')=='FREE')
		{
		puertosLibresFront++;
		puerto.addClass('puertoLibre');
		}
	});
var frontOK=true;
if (puertosLibresFront>=puertosNecesarios)
	{
	var puertosPosibles=puertosLibresFront-puertosNecesarios+1;
	var puertosLibres=$('marcoFrontDestPanel').getElements('.puertoLibre');
	var i=0;
	while (i<puertosPosibles)
		{
		puertosLibres[i].setStyle('cursor','pointer');	
		puertosLibres[i].addEvent('click',function(e){riserDestinoSeleccionado(e.target);});
		i++;
		}
	}
else
	{frontOK=false;}
	
var puertosLibresRear=0;
$('marcoRearDestPanel').getElements('.puertoPanel').each(function(puerto)
	{
	if (puerto.get('estado')=='' || puerto.get('estado')=='FREE')
		{
		puertosLibresRear++;
		puerto.addClass('puertoLibre');
		}
	});
var rearOK=true;
if (puertosLibresRear>=puertosNecesarios)
	{
	var puertosPosibles=puertosLibresRear-puertosNecesarios+1;
	var puertosLibres=$('marcoRearDestPanel').getElements('.puertoLibre');
	var i=0;
	while (i<puertosPosibles)
		{
		puertosLibres[i].setStyle('cursor','pointer');	
		puertosLibres[i].addEvent('click',function(e){riserDestinoSeleccionado(e.target);});
		i++;
		}
	}
else
	{rearOK=false;}

if (!frontOK && !rearOK)
	{
	alert('Not enough ports at both sides of this panel for connecting the riser or precabling');
	$('containerDestRiser').addClass('oculto');
	}
else
	{
	if (!frontOK)
		{
		$('frontSelectionDestPanel').removeClass('botonLinkSeleccionado');
		$('rearSelectionDestPanel').addClass('botonLinkSeleccionado');
		$('marcoFrontDestPanel').addClass('oculto');
		$('marcoRearDestPanel').removeClass('oculto');
		}
	}
	
}

function riserDestinoSeleccionado(el)
{
var i=0;
//var ports=$('valoresEditablesNewRiser').getElement('input[name="Amount"]').value*1;
var ports=$('riserPortsFromArea').getElements('.newRiserPort').length;
while (i<ports)
	{
	new Element('div',{'class':'newRiserPort','text':el.get('portName'),'idPort':el.get('idPort')}).inject($('riserPortsToArea'));
	el=el.getNext('.puertoPanel');
	i++;
	}
$('finalizarNewRiser').removeClass('oculto');
var sideTo='';
if ($('frontSelectionDestPanel').hasClass('botonLinkSeleccionado'))
		{
		sideTo='Front';
		}
	else
		{
		sideTo='Rear';
		}
$('finalizarNewRiser').set('sideTo',sideTo);
}

function disconnectRiserPort(el,prompt)
{
var continuing=false;
if (typeof(prompt)!='undefined')
	{
	if (prompt)
		{continuing=true;}
	else
		{
		continuing=confirm("are you sure you want to disconnect that port from the riser?");
		}
	}
else
	{
	continuing=confirm("are you sure you want to disconnect that port from the riser?");
	}
if (continuing)
	{
	var tableContainer=el.getParent('.tablaDiv');
	var table=tableContainer.get('tabla');
	var tableId=tableContainer.get('id');
	var side=el.get('side');
	var id=el.getParent('.lineaDatos').get('linea');
	new Request({url: 'ajax/disconnectRiserPort.php',
	onSuccess:function(responseText)
		{
		if (responseText!='error')
			{
			var valores=JSON.decode(responseText);
			var linea=$(valores[2]).getElement('.lineaDatos[linea="'+valores[0]+'"]');
			var status=getValorLinea(linea,'Riser'+valores[3]+'Status');
			
			linea.empty();
			linea.set('html','<span style="color:red;">disconnection successfull<span>');
			linea.addClass('disconnectionInProgress');
			linea.set('timeStamp',new Date().getTime());
			window.setTimeout(function(){
				destroyFirst('disconnectionInProgress');
				},2000);
			if ($('riserInfoForm'))
				{
				$('riserInfoForm').getElement('.datos[campo="Amount"]').set('text',($('riserInfoForm').getElement('.datos[campo="Amount"]').get('text')*1)-1);
				if (status=='' || status=='AVAILABLE')
					{
					$('riserInfoForm').getElement('.datos[campo="Available"]').set('text',($('riserInfoForm').getElement('.datos[campo="Available"]').get('text')*1)-1);
					}
				}
			}
		else
			{
			alert('error when disconnecting the port');
			}
		}
	}).send('id='+id+'&table='+table+'&tableId='+tableId+'&side='+side);
	
	}
}

function estadoPuertosPanel(tabla,contenedorFront,contenedorRear)
{
$(tabla).getElements('.lineaDatos').each(function(linea)
	{
	var celda=linea.getElement('.datos[campo="StatusFront"]');
	var estado=celda.getElement('.valor').get('text');
	var puerto=$(contenedorFront).getElement('.puertoPanel[port="'+linea.getElement('.datos[campo="Port"]').getElement('.valor').get('text')+'"]')
	puerto.set('side','Front');
	puerto.set('idPort',linea.get('linea'));
	puerto.set('estado',estado);
	if (estado!='')
		{
		limpiarEstadosPuertos(puerto);
		puerto.addClass('port'+estado);
		}
	var celda=linea.getElement('.datos[campo="StatusRear"]');
	var estado=celda.getElement('.valor').get('text');
	var puerto=$(contenedorRear).getElement('.puertoPanel[port="'+linea.getElement('.datos[campo="Port"]').getElement('.valor').get('text')+'"]')
	puerto.set('side','Rear');
	puerto.set('idPort',linea.get('linea'));
	puerto.set('estado',estado);
	if (estado!='')
		{
		limpiarEstadosPuertos(puerto);
		puerto.addClass('port'+estado);
		}
	});
}

function marcarPuerto(el)
{
if (!el.hasClass('lineaDatos'))
	{el=el.getParent('.lineaDatos');}
var tabla=el.getParent('.tablaDiv');
var puerto=getValorLinea(el,'Port');
if (tabla.get('marcoFront')!='')
	{
	$(tabla.get('marcoFront')).getElements('div[port="'+puerto+'"]').each(function(item)
		{
		item.addClass('puertoMarcado');
		});
	}
if (tabla.get('marcoRear')!='')
	{
	$(tabla.get('marcoRear')).getElements('div[port="'+puerto+'"]').each(function(item)
		{
		item.addClass('puertoMarcado');
		});
	}
if (el.get('portGroup'))
	{
	if (el.get('portGroup')!='none')
		{
		var otroPuerto=getValorLinea(el.getNext('.lineaDatos'),'Port');
		if (tabla.get('marcoFront')!='')
			{
			$(tabla.get('marcoFront')).getElements('div[port="'+otroPuerto+'"]').each(function(item)
				{
				item.addClass('puertoMarcado');
				});
			}
		if (tabla.get('marcoRear')!='')
			{
			$(tabla.get('marcoRear')).getElements('div[port="'+otroPuerto+'"]').each(function(item)
				{
				item.addClass('puertoMarcado');
				});
			}
		}
	}
el.addClass('lineaPuertoRemarcada');
}

function desmarcarPuerto(el)
{
if (!el.hasClass('lineaDatos'))
	{el=el.getParent('.lineaDatos');}
var tabla=el.getParent('.tablaDiv');
var puerto=getValorLinea(el,'Port');
if (tabla.get('marcoFront')!='')
	{
	$(tabla.get('marcoFront')).getElements('div[port="'+puerto+'"]').each(function(item)
		{
		item.removeClass('puertoMarcado');
		});
	}
if (tabla.get('marcoRear')!='')
	{
	$(tabla.get('marcoRear')).getElements('div[port="'+puerto+'"]').each(function(item)
		{
		item.removeClass('puertoMarcado');
		});
	}
if (el.get('portGroup'))
	{
	if (el.get('portGroup')!='none')
		{
		var otroPuerto=getValorLinea(el.getNext('.lineaDatos'),'Port');
		if (tabla.get('marcoFront')!='')
			{
			$(tabla.get('marcoFront')).getElements('div[port="'+otroPuerto+'"]').each(function(item)
				{
				item.removeClass('puertoMarcado');
				});
			}
		if (tabla.get('marcoRear')!='')
			{
			$(tabla.get('marcoRear')).getElements('div[port="'+otroPuerto+'"]').each(function(item)
				{
				item.removeClass('puertoMarcado');
				});
			}
		}
	}
el.removeClass('lineaPuertoRemarcada');
}

function agruparDosPuertos(tabla)
{
var i=1;
var parImpar=1;
if ($(tabla).getElement('.titulo[campo="Name"]').getElement('.botonAgruparPuertos')===null)
	{
	var boton=new Element('div',{'class':'botonAgruparPuertos desagruparPuertos conTip','title':'ungroup ports','text':2}).inject($(tabla).getElement('.titulo[campo="Name"]'));
	boton.addEvent('click',function(e){cambiarAgupacionPuertos(e.target)});
	}
$(tabla).getElements('.lineaDatos').each(function(linea)
	{
	if (!linea.hasClass('lineaGrupo'))
		{
		if (i%2==parImpar)
			{
			/*var agrupar=true;
			if (linea.getElement('.celda[campo="Connector"]'))
				{
				if (getValorLinea(linea,'Connector').indexOf('UTP')==0)	
					{
					parImpar=(parImpar+1) %2;
					agrupar=false;
					}
				}
			
			if (agrupar)
				{*/
				if (linea.getNext('.lineaDatos'))
					{
					var siguienteLinea=linea.getNext('.lineaDatos');
					if (!siguienteLinea.hasClass('lineaGrupo'))
						{
						if (comparacionPuertos(linea,siguienteLinea))
							{
							siguienteLinea.addClass('oculto');
							new Element('span',{'class':'portGroup','text':' / '+diferenciaNombres(getValorLinea(siguienteLinea,'Name'),getValorLinea(linea,'Name'))}).inject(linea.getElement('.datos[campo="Name"]').getElement('.valor'),'after');
							linea.set('portGroup',getValorLinea(siguienteLinea,'Port'));
							linea.addClass('lineaAgrupada2');
							}
						}
					}
				//}
			}
		i++;
		}
	});
}

function diferenciaNombres(nombre,comparar)
{
if (nombre.indexOf('RX')>0 && comparar.indexOf('TX')>0)
	{return 'RX';}
else
	{
	if (nombre.indexOf('TX')>0 && comparar.indexOf('RX')>0)
		{return 'TX';}
	else
		{
		if (nombre.indexOf('IN')>0 && comparar.indexOf('OUT')>0)
			{return 'IN';}
		else
			{
			if (nombre.indexOf('OUT')>0 && comparar.indexOf('IN')>0)
				{return 'OUT';}
			else
				{
				var procesado=false;
				if (nombre==comparar)
					{
					return '=';
					procesado=true;
					}
				var separacion='';
				if (nombre.indexOf('-')>0 && comparar.indexOf('-')>0)
					{
					separacion='-';
					}
				if (nombre.indexOf('/')>0 && comparar.indexOf('/')>0)
					{
					separacion='/';
					}
				if (separacion!='')
					{
					var separados=nombre.split(separacion);
					var compararSep=comparar.split(separacion);
					if (separados.length==compararSep.length)
						{
						procesado=true;
						return separados[separados.length-1];
						}
					}

				if (!procesado)
					{
					if (nombre.length>3)
						{
						var i=1;
						while((nombre.substring(0,i)==comparar.substring(0,i)) && i<nombre.length)
							{
							i++;
							}
						return nombre.substring(i-1);
						}
					else
						{
						return nombre;
						}
					}
				}
			}
		}
	}

}

function permitirAgruparDosPuertos(tabla)
{
var boton=new Element('div',{'class':'botonAgruparPuertos agruparPuertos conTip','title':'group ports','text':2}).inject($(tabla).getElement('.titulo[campo="Name"]'));
boton.addEvent('click',function(e){cambiarAgupacionPuertos(e.target)});
}

function cambiarAgupacionPuertos(el)
{
if (el.hasClass('desagruparPuertos'))
	{
	el.set('title','group ports each 2');
	el.removeClass('desagruparPuertos');
	el.addClass('agruparPuertos');
	desagruparPuertos(el.getParent('.tablaDiv').get('id'));
	$$('.valorGrupo2').addClass('oculto');
	}
else
	{
	el.set('title','ungroup ports');
	el.addClass('desagruparPuertos');
	el.removeClass('agruparPuertos');
	agruparDosPuertos(el.getParent('.tablaDiv').get('id'));
	$$('.valorGrupo2').removeClass('oculto');
	}
}

function comparacionPuertos(linea1,linea2)
{
var res=true;
var campos=new Array();
if (linea1.getElement('.celda[campo="RearType"]'))
	{
	campos=new Array('RearType','FrontType','CircuitRear','CircuitFront','StatusRear','StatusFront');
	}
else
	{
	if (linea1.getElement('.celda[campo="DestType"]'))
		{
		campos=new Array('DestType','CircuitDest','StatusDest');
		}
	else//offnet
		{
		campos=new Array('InType','OutType','CircuitIn','CircuitOut','StatusIn','StatusOut');
		}
	}
campos.each(function(item)
	{
	if (getValorLinea(linea1,item)!=getValorLinea(linea2,item))
		{res=false;}
	});
return res;
}

function desagruparPuertos(tabla)
{
var i=1;
$(tabla).getElements('.lineaDatos').each(function(linea)
	{
	if (i%2==0)
		{
		linea.removeClass('oculto');
		if (linea.getPrevious('.lineaDatos'))
			{
			var anteriorLinea=linea.getPrevious('.lineaDatos');
			if (anteriorLinea.getElement('.datos[campo="Name"]').getElement('.portGroup'))
				{anteriorLinea.getElement('.datos[campo="Name"]').getElement('.portGroup').destroy();}
			anteriorLinea.set('portGroup','none');
			}
		}
	i++;
	});
}

function getRearPanel(front,rear,model)
{
$(front).getElements('div').each(function(item)
	{
	item.clone().inject($(rear));
	});
var from='right';
var	to='left';
if ($(front).get('startHor')=='left')
	{
	from='left';
	to='right';
	}

$(rear).getElements('div').each(function(item)
	{
	item.setStyle(to,item.getStyle(from));
	item.setStyle(from,'auto');
	});
if ($(front).get('rearRate')!='1')
	{
	var rearDuplication=$(front).get('rearDuplication');
	if ($(front).get('rearRate')=='2')
		{
		duplicateRearPorts(rear,rearDuplication);
		}
	}
}

function duplicateRearPorts(container,rearDuplication)
{
$(container).getElements('.puertoPanel').each(function(item)
	{
	var duplPort=item.clone().inject($(container));
	adjustDuplicated(item,duplPort,rearDuplication);
	duplPort.set('port',(item.get('port')*1)+1);
	//duplPort.set('portName',
	});
}

function adjustDuplicated(port1,port2,direction)
{

var size1=port1.getSize();
var xType1='left';
var xPos1=0;
if (port1.getStyle('left')!='auto')
	{
	xPos1=parseInt(port1.getStyle('left'));
	}
else
	{
	xPos1=parseInt(port1.getStyle('right'));
	xType1='right';
	}
var yType1='top';
var yPos1=0;
if (port1.getStyle('top')!='auto')
	{
	yPos1=parseInt(port1.getStyle('top'));
	}
else
	{
	yPos1=parseInt(port1.getStyle('bottom'));
	yType1='bottom';
	}
if (direction=='hor')
	{
	var separation=Math.floor(size1.x/3);
	var width1=Math.floor((size1.x-separation)/2);
	var width2=size1.x-separation-width1;
	var xPos2=xPos1+width1+separation;
	port1.setStyle('width',width1+'px');
	port2.setStyle('width',width2+'px');
	port2.setStyle(xType1,xPos2+'px');
	}
else
	{
	var separation=Math.floor(size1.y/3);
	var height1=Math.floor((size1.y-separation)/2);
	var height2=size1.y-separation-height1;
	var yPos2=yPos1+height1+separation;
	port1.setStyle('height',height1+'px');
	port2.setStyle('height',height2+'px');
	port2.setStyle(yType1,yPos2+'px');
	}
}

function dibujarModeloPanel(contenedor,modelo,puertos)
{
if (typeof(contenedor)=='string')
	{
	contenedor=$(contenedor);
	}
var x2js = new X2JS();
var objModel={};
if (typeof(modelo)=='string')
	{objModel=x2js.xml_str2json(modelo);}
else
	{objModel=Object.clone(modelo);}
var filasPuertos=1;
var totalAddRows=0;
var espacesRows=new Array();
var totalAddCols=0;
var espacesCols=new Array();
var startVert='top';
var startHor='left';
var moving=new Array('nextHor');
var portNames=new Array();
var systemNames=new Array();
var ind=0;
	while (ind<puertos)
		{
		portNames[ind]=ind+1;
		systemNames[ind]=ind+1;
		ind++;
		}
if (objModel.hasOwnProperty('panelmodel'))
	{
	if (objModel.panelmodel.hasOwnProperty('rows'))
		{filasPuertos=objModel.panelmodel.rows*1;}
	if (objModel.panelmodel.hasOwnProperty('espacesrows'))
		{
		espacesRows=objModel.panelmodel.espacesrows.split(',');
		var ind=0;
		while (ind<espacesRows.length)
			{
			totalAddRows+=espacesRows[ind++]*1;
			}
		}
	if (objModel.panelmodel.hasOwnProperty('espacescols'))
		{
		espacesCols=objModel.panelmodel.espacescols.split(',');
		var ind=0;
		while (ind<espacesCols.length)
			{
			totalAddCols+=espacesCols[ind++]*1;
			}
		}
	if (objModel.panelmodel.hasOwnProperty('start'))
		{
		if (objModel.panelmodel.start.indexOf('bottom')!=-1)
			{
			startVert='bottom';
			}
		if (objModel.panelmodel.start.indexOf('right')!=-1)
			{
			startHor='right';
			}
		}
	if (objModel.panelmodel.hasOwnProperty('moving'))
		{
		moving=objModel.panelmodel.moving.split(',');
		}
	if (objModel.panelmodel.hasOwnProperty('ports'))
		{
		portNames=objModel.panelmodel.ports.split(',');
		puertos=portNames.length;
		}
	if (objModel.panelmodel.hasOwnProperty('systemnames'))
		{
		while (systemNames.length>0)
			{systemNames.pop();}
		systemNames=objModel.panelmodel.systemnames.split(',');
		}
	else
		{
		while (systemNames.length>0)
			{systemNames.pop();}
		systemNames=portNames.slice();
		}
	}

var columnasPuertos=Math.ceil(puertos/filasPuertos);
var tam=contenedor.getSize();

var anchoPuertos=Math.floor((tam.x)/((2*columnasPuertos)+1+totalAddCols));//ports width = separation
var sobraX=(tam.x)%((2*columnasPuertos)+1+totalAddCols);
var sepExtraX=sobraX/columnasPuertos;

var altoPuertos=Math.floor((tam.y)/((2*filasPuertos)+1+totalAddRows));
var sobraY=(tam.y)%((2*filasPuertos)+1+totalAddRows);
var sepExtraY=sobraY/filasPuertos;

var offsetNombreY=(-1*altoPuertos)-1;
var offsetNombreX=0;
if (objModel.hasOwnProperty('panelmodel'))
	{
	if (objModel.panelmodel.hasOwnProperty('names'))
		{
		offsetNombreY=0;
		var names=objModel.panelmodel.names;
		if (names.indexOf('top')!=-1)
			{
			offsetNombreY=altoPuertos+1
			if (startVert=='top')
				{offsetNombreY=(offsetNombreY*(-1))+2;}
			}
		if (names.indexOf('bottom')!=-1)
			{
			offsetNombreY=altoPuertos+1
			if (startVert=='bottom')
				{offsetNombreY=(offsetNombreY*(-1))+2;}
			}
		if (names.indexOf('left')!=-1)
			{
			offsetNombreX=anchoPuertos+1;
			if (startHor=='left')
				{offsetNombreX=(offsetNombreX*(-1))+2;}
			}
		if (names.indexOf('right')!=-1)
			{
			offsetNombreX=anchoPuertos+1;
			if (startHor=='right')
				{offsetNombreX=(offsetNombreX*(-1))+2;}
			}
		}
	}


var offsetsX=new Array();//size: columnasPuertos
var offsetsY=new Array();//size: filasPuertos

var i=1;
offsetsX[0]=anchoPuertos;

if (totalAddCols==0)
	{
	offsetsX[0]=anchoPuertos;
	}	
else
	{
	offsetsX[0]=anchoPuertos*((espacesCols[0]*1)+1);
	}

var acumSobra=0;
while (i<columnasPuertos)
	{
	acumSobra+=sepExtraX;
	var adicional=0;
	if (acumSobra>1)
		{
		adicional=1;
		acumSobra=acumSobra-1;
		}
	if (totalAddCols==0)
		{
		offsetsX[i]=offsetsX[i-1]+(2*anchoPuertos)+adicional;
		}
	else
		{
		offsetsX[i]=offsetsX[i-1]+((2+(espacesCols[i]*1))*anchoPuertos)+adicional;
		}
	i++;
	}

var i=1;
if (totalAddRows==0)
	{
	offsetsY[0]=altoPuertos;
	}	
else
	{
	offsetsY[0]=altoPuertos*((espacesRows[0]*1)+1);
	}
	
var acumSobra=0;
while (i<filasPuertos)
	{
	acumSobra+=sepExtraY;
	var adicional=0;
	if (acumSobra>1)
		{
		adicional=1;
		acumSobra=acumSobra-1;
		}
	if (totalAddRows==0)
		{
		offsetsY[i]=offsetsY[i-1]+(2*altoPuertos)+adicional;
		}
	else
		{
		offsetsY[i]=offsetsY[i-1]+((2+(espacesRows[i]*1))*altoPuertos)+adicional;
		}
	i++;
	}	

var rearRate=1;
var rearDuplication='vert';
if (objModel.hasOwnProperty('panelmodel'))
	{
	if (objModel.panelmodel.hasOwnProperty('frontrearrate'))
		{
		rearRate=objModel.panelmodel.frontrearrate*1;
		}
	if (objModel.panelmodel.hasOwnProperty('connectorrear'))
		{
		contenedor.set('connectorRear',objModel.panelmodel.connectorrear);
		}
	if (objModel.panelmodel.hasOwnProperty('connectorfront'))
		{
		contenedor.set('connectorFront',objModel.panelmodel.connectorfront);
		}

	if (objModel.panelmodel.hasOwnProperty('rearduplication'))
		{
		rearDuplication=objModel.panelmodel.rearduplication;
		}
	}
	
contenedor.set('startVert',startVert);
contenedor.set('startHor',startHor);
contenedor.set('rearRate',rearRate);
contenedor.set('rearDuplication',rearDuplication);

//pos puertos names	
var filaActual=0;
var columnaActual=0;
var medioAncho=0;
var i=0;//numPuerto	
while (i<puertos)
	{
	var multiplier=1;
	if ((rearRate)>1)
		{
		multiplier=rearRate;
		}
	var puerto=new Element('div',{'class':'puertoPanel conTip','port':((i*multiplier)+1),'portName':systemNames[i],'title':portNames[i]}).inject(contenedor);
	var nombrePuerto=new Element('div',{'class':'nombrePuertoPanel','port':((i*multiplier)+1),'text':portNames[i]}).inject(contenedor);
	puerto.setStyle(startVert,offsetsY[filaActual]+'px');
	puerto.setStyle(startHor,(offsetsX[columnaActual]+medioAncho)+'px');
	puerto.setStyle('width',(anchoPuertos-2)+'px');
	puerto.setStyle('height',(altoPuertos-2)+'px');
	puerto.setStyle('cursor','pointer');
	addPortEvents(puerto);
	if (portNames[i]=='NOPORT')
		{
		puerto.setStyle('border-width','0px');
		puerto.set('title','');
		nombrePuerto.set('text','');
		}
	nombrePuerto.setStyle(startVert,offsetsY[filaActual]+offsetNombreY+'px');
	nombrePuerto.setStyle(startHor,(offsetsX[columnaActual]+medioAncho+offsetNombreX)+'px');
	nombrePuerto.setStyle('width',(anchoPuertos)+'px');
	nombrePuerto.setStyle('height',(altoPuertos)+'px');
	var movimiento=moving[i%moving.length];
	medioAncho=0;
	var timesHor=1;
	var timesVer=1;
	if (movimiento.indexOf('times')>-1)
		{
		var grupos=movimiento.split('-');
		grupos.each(function(item)
			{
			if (item.indexOf('times')>-1)
				{
				var g=item.split('times');
				if (g[1].indexOf('Hor')>-1)
					{
					timesHor=g[0]*1;
					}
				if (g[1].indexOf('Ver')>-1)
					{
					timesVer=g[0]*1;
					}
				}
			});
		}
	if (movimiento.indexOf('nextHor')!=-1)
		{
		columnaActual=columnaActual+timesHor;
		if (columnaActual==columnasPuertos)
			{
			columnaActual=0;
			filaActual++
			}
		}
	if (movimiento.indexOf('nextVert')!=-1)
		{
		filaActual=filaActual+timesVer;
		if (filaActual==filasPuertos)
			{
			filaActual=0;
			columnaActual++
			}
		}
	if (movimiento.indexOf('backHor')!=-1)
		{columnaActual=columnaActual-timesHor;}
	if (movimiento.indexOf('backVert')!=-1)
		{filaActual=filaActual-timesVer;}
	if (movimiento.indexOf('firstHor')!=-1)
		{columnaActual=0;}
	if (movimiento.indexOf('firstVert')!=-1)
		{filaActual=0;}
	if (movimiento.indexOf('halfHor')!=-1)
		{medioAncho=Math.round(anchoPuertos/2);}
	i++;
	}
}

function addPortEvents(puerto)
{
puerto.addEvent('click',function(e){scrollToPort(e.target);});
puerto.addEvent('mouseover',function(e){highlightPortInfo(e.target,true);});
puerto.addEvent('mouseout',function(e){highlightPortInfo(e.target,false);});
}

function highlightPortInfo(el,status)
{
if (el.hasAttribute('idPort'))
	{
	var id=el.get('idPort');
	$$('.tablaPuertos').each(function(tabla)
		{
		if (tabla.getElement('.lineaDatos[linea="'+id+'"]'))
			{
			var linea=tabla.getElement('.lineaDatos[linea="'+id+'"]');
			if (linea.hasClass('oculto'))
				{
				linea=linea.getPrevious('.lineaDatos');
				}
			if (status)
				{linea.addClass('lineaPuertoRemarcada');}
			else
				{linea.removeClass('lineaPuertoRemarcada');}
			}
		});
	}
}

function scrollToPort(el)
{
if (el.hasAttribute('idPort'))
	{
	var id=el.get('idPort');
	$$('.tablaPuertos').each(function(tabla)
		{
		if (tabla.getElement('.lineaDatos[linea="'+id+'"]'))
			{
			var linea=tabla.getElement('.lineaDatos[linea="'+id+'"]');
			if (linea.hasClass('oculto'))
				{
				linea=linea.getPrevious('.lineaDatos');
				}
			if (linea.getParent('.bloqueScroll'))
				{
				var myFx = new Fx.Scroll(linea.getParent('.bloqueScroll'));
				myFx.toElement(linea);
				}
			}
		});
	}

}

function iniciarNewPanel()
{

$('newValoresEditables').getElements('input[type="radio"]').addEvent('click',function(e){
	if (getRadioValue($('newValoresEditables'),'System')=='NO')
		{
		$('newValoresEditables').getElement('.systemNameInput').removeClass('oculto');
		}
	else
		{
		$('newValoresEditables').getElement('.systemNameInput').addClass('oculto');
		$('newValoresEditables').getElement('.systemNameInput').getElement('input').value="";
		}
	});

$('botonSaveNewPanel').addEvent('click',function(e)
	{
	var name=$('valoresEditablesNewPanel').getElement('input[name="Name"]').value;
	if (name.trim()!='')
		{
		$('mensajeNuevaTarjeta').removeClass('oculto');
		var formResult=new Element('div',{'id':'mensajeNuevoEq','class':'mensaje'}).inject($('mensajeNuevaTarjeta'));
		var req=new Form.Request($('valoresEditablesNewPanel'),formResult , {
					
				onSuccess: function(target,texto,textoXML) {
				
				setTimeout(function(){window.location="panel.php?id="+$('mensajeNuevoEq').getElement('.newId').get('text');},3000); 
						
				}
				
				}).send();
		}
	else
		{
		alert ('Please set a name for the panel');
		}
	
	});
	
$('retrieveModels').addEvent('click',function(e)
	{
	var portsValue=$('valoresEditablesNewPanel').getElement('input[name="Ports"]').value;
	if (portsValue=='' || portsValue=='0')
		{
		alert('Please set the number of ports');
		}
	else
		{
		var ports=portsValue*1;
		var usValue=$('valoresEditablesNewPanel').getElement('input[name="Us"]').value;
		if (usValue=='' || usValue=='0')
			{
			alert('Please set the number of Us');
			}
		else
			{
			var us=usValue*1;
			var select=$('valoresEditablesNewPanel').getElement('select[name="Connector"]');
			var connectorValue=select.options[select.selectedIndex].value;
			if (connectorValue=='')
				{
				alert('Please select one connector type');
				}
			else
				{
				var connector=encodeURIComponent(connectorValue);
				$('espacioModels').load('ajax/getPanelModels.php?Ports='+ports+'&Us='+us+'&Connector='+connector);
				}
			}
		}
	
	});

}

function montarModelos()
{
var ports=$('contModelsPanels').get('ports')*1;
var us=$('contModelsPanels').get('us')*1;
var maxWidth=400;
var ancho=$('contModelsPanels').getSize().x;
	if (ancho>maxWidth)
		{
		ancho=maxWidth;
		}
var tamU=ancho/15;
var alto=Math.round(tamU*us);
$('contModelsPanels').getElements('.opcionModelo').each(function(item)
	{
	var marco=item.getElement('.marcoModelo');
	var idMarco=marco.get('id');
	marco.setStyle('width',ancho+'px');
	marco.setStyle('height',alto+'px');
	dibujarModeloPanel(idMarco,item.getElement('.descripcionModelo').get('html'),ports);
	marco.addEvent('click',function(e)
		{
		var el=e.target;
		if (!el.hasClass('marcoModelo'))
			{el=el.getParent('.marcoModelo');}
		$$('.marcoModelo').removeClass('modeloSeleccionado');
		el.addClass('modeloSeleccionado');
		var model=el.getParent('.opcionModelo').getElement('.descripcionModelo').get('html');
		$('textAreaModel').set('text',model);
		});
	});
}

function iniciarOffnetPorts()
{
$('offnetPortsOwned').addClass('tablaPortsOffnet');
$('offnetPortsOthers').addClass('tablaPortsOffnet');
$$('.tablaPortsOffnet').each(function(tabla)
	{
	tablaToLista(tabla);
	tabla.getElements('.lineaDatos').addClass('lineaGrupo');
	tabla.getElements('.datos[campo="Connector"]').each(function(celda)
		{
		celda.setStyle('width','150px!important');
		var loadButton=new Element('div',{'class':'botonLink','style':'float:left;','text':'load all'}).inject(celda.getNext('.celda'),'after');
		loadButton.addEvent('click',function(e){loadOffnetPorts(e.target);});
		});
	});

}

function loadOffnetPorts(el)
{
var tablaId=el.getParent('.tablaDiv').get('id');
var linea=el.getParent('.lineaDatos');
el.destroy();
var connector=getValorLinea(linea,'Connector');
var nuevaTabla=new Element('div',{'id':tablaId+connector.replace(/ /g, ""),'class':'tablaDiv','tabla':'OffnetPorts','style':'width:90%;margin-left:10%;margin-top:5px;'}).inject(linea,'after');
loading(nuevaTabla);
nuevaTabla.load('ajax/getOffnetPorts.php?tabla=Rooms&id='+roomBase+'&connector='+encodeURIComponent(connector)+'&tablaDiv='+tablaId);
}

function addHideShowOffnet(line)
{
var hideButton=new Element('div',{'class':'botonLink','style':'float:left;padding-left:10px;','text':'hide'}).inject(line.getElement('.clear'),'before');
hideButton.addEvent('click',function(e){hideShowOffnet(e.target);});
}

function hideShowOffnet(el)
{
var line=el.getParent('.lineaDatos');
if (el.get('text')=='hide')
	{
	el.set('text','show');
	line.getNext('.tablaDiv').addClass('oculto');
	}
else
	{
	el.set('text','hide');
	line.getNext('.tablaDiv').removeClass('oculto');
	}
}

function iniciarTablaOffnetPorts(tablaDiv,connector)
{

var idTabla=tablaDiv+connector.replace(/ /g, "");
var line=$(idTabla).getPrevious('.lineaDatos');
addHideShowOffnet(line);
$(idTabla).addClass('tablaPuertos');
$(idTabla).set('tipoPuerto','Offnet');
ocultarColumna(idTabla,'Port');
ocultarColumna(idTabla,'Owner');
ocultarColumna(idTabla,'StatusIn');
ocultarColumna(idTabla,'InType');
ocultarColumna(idTabla,'StatusOut');
ocultarColumna(idTabla,'OutType');
ocultarColumna(idTabla,'Connector');
ocultarColumna(idTabla,'RiserIn');
ocultarColumna(idTabla,'RiserInStatus');
ocultarColumna(idTabla,'RiserOut');
ocultarColumna(idTabla,'RiserOutStatus');
ocultarColumna(idTabla,'Comments');
addClase(idTabla, 'Name', 'centrado');
$(idTabla).getElement('.titulo[campo="Name"]').set('text','Port');
$(idTabla).getElement('.titulo[campo="Name"]').setStyle('padding-left','20px');
$(idTabla).getElement('.titulo[campo="Name"]').setStyle('padding-right','20px');
if 	((connector.indexOf('FIBER')!=-1)||(connector.indexOf('COAX')!=-1))
	{
	agruparDosPuertos(idTabla);
	}
inicializarTablaDiv(idTabla);
var modoEdicion=!$('edicionGlobal').hasClass('oculto');	
if (modoEdicion)
	{
	$(idTabla).getElements('.datos[campo="Name"]').each(function(item)
		{
		new Element('div',{'class':'portButtons InButtons InIconsGroup showOnEdit'}).inject(item);
		new Element('div',{'class':'portButtons OutButtons OutIconsGroup showOnEdit'}).inject(item);
		new Element('div',{'class':'portInfoGroup InInfoGroup InIconsGroup'}).inject(item);
		new Element('div',{'class':'portInfoGroup OutInfoGroup OutIconsGroup'}).inject(item);
		var offnetEditPort=new Element('div',{'class':'offnetEditPort botonEditar showOnEdit','title':'edit port name and owner'}).inject(item);
		offnetEditPort.addEvent('click',function(e){editOffnetPort(e);});
		});
	}

$(idTabla).getElements('.lineaDatos').each(function(linea)
	{
	hideIsolatedOffnet(linea);
	inicializarEstadosPuertos(linea,'In');
	inicializarEstadosPuertos(linea,'Out');
	});
addClase(idTabla, 'Name', 'textoGrande');
addClase(idTabla, 'InConnection', 'textoGrande');
addClase(idTabla, 'OutConnection', 'textoGrande');
if ($(idTabla).getParent('.tablaDiv').get('id')=='offnetPortsOthers') 
	{
	agruparTabla(idTabla,'Owner');
	}
}

function editOffnetPort(e)
{
openInfoWindow(e,new Array(400,200),new Array(20,20));
addCloseInfoWindow();
var container=new Element('div',{'style':'padding-top:25px;padding:left:5px;'}).inject($('cuadroInfo'));
var el=e.target;
var linea=el.getParent('.lineaDatos');
var tabla=linea.getParent('.tablaDiv');
var grouped=lineIsGrouped(linea);
container.set('tabla','OffnetPorts');
var ports=linea.get('linea');
if (grouped)
	{
	ports+=','+linea.getNext('.lineaDatos').get('linea');
	}
container.set('linea',ports);
var fieldsUpdate='Name,Owner';
createSeparateForm(tabla.get('id'),'OffnetPorts',ports,fieldsUpdate,container);	
}

function hideIsolatedOffnet(linea)
{
if (getValorLinea(linea,'InConnection')*1==0 && getValorLinea(linea,'OutConnection')*1==0)
	{
	linea.addClass('offnetIsolated  offnetIsolatedHide');
	var tabla=linea.getParent('.tablaDiv');
	var line=tabla.getPrevious('.lineaDatos');
	if (!line.getElement('.isolatedButton'))
		{
		var hideButton=new Element('div',{'class':'botonLink isolatedButton','style':'float:left;padding-left:30px;color:#0000ff;','action':'show','text':'show old ports'}).inject(line.getElement('.clear'),'before');
		var countHidden=new Element('div',{'style':'float:left;padding-left:1px;color:#0000ff;','html':'(<span class="hiddenCount">0</span>)'}).inject(line.getElement('.clear'),'before');
		hideButton.addEvent('click',function(e){hideShowIsolatedOffnet(e.target);});
		}
	line.getElement('.hiddenCount').set('text',(line.getElement('.hiddenCount').get('text')*1)+1);
	var amountField=line.getElement('.datos[campo="Amount"]');
	amountField.set('text',(amountField.get('text')*1)-1);
	}

}

function hideShowIsolatedOffnet(el)
{
var table=el.getParent('.lineaDatos').getNext('.tablaDiv');
if (el.get('action')=='show')
	{
	table.getElements('.offnetIsolated').removeClass('offnetIsolatedHide');
	el.set('action','hide');
	el.set('text','hide old ports');
	}
else
	{
	table.getElements('.offnetIsolated').addClass('offnetIsolatedHide');
	el.set('action','show');
	el.set('text','show old ports');
	}

}


function changeStatusPort(e)
{
var boton=e.target;
var posCursor=e.page;
$('cuadroInfo').empty();
$('cuadroInfo').removeClass('oculto');
$('cuadroInfo').setStyle('width','160px');
$('cuadroInfo').setStyle('height','100px');
$('cuadroInfo').setStyle('left',(posCursor.x-20)+'px');
$('cuadroInfo').setStyle('top',(posCursor.y-100)+'px');
var statusList=new Array('CONNECTED','FAULTY','FREE');
var linea=boton.getParent('.lineaDatos');
var estado=getValorLinea(linea,'Status'+boton.get('side'));
statusList.each(function(item)
	{
	if (item!=estado)
		{
		var portGroup='none';
		if (linea.get('portGroup'))
			{
			portGroup=linea.get('portGroup');
			}
			
		var opcion=new Element('div',{'class':'listaOpciones opcion'+item,'tablaPuertos':e.target.getParent('.tablaPuertos').get('id'),'linea':linea.get('linea'),'portGroup':portGroup,'side':boton.get('side'),'text':item}).inject($('cuadroInfo')); 
		opcion.addEvent('click',function(e){guardarCambioEstado(e.target);});
		}
	});
var cerrar=new Element('div',{'class':'conTip','style':'position:absolute;top:2px;right:2px;cursor:pointer;width:15px;height:15px','text':'X','title':'close'}).inject($('cuadroInfo')); 
cerrar.addEvent('click',function(){$('cuadroInfo').addClass('oculto');$('cuadroInfo').empty();});
}

function allStatus(el,table,side)
{
$(table).getElements('.lineaDatos').each(function(line)
	{
	var connection=getValorLinea(line,side+'Connection').trim();
	var status=getValorLinea(line,'Status'+side).trim();
	var newStatus=el.get('statusValue');
	if ((connection=='' || connection=='0') && status!=newStatus)
		{requestCambioEstadoPuertos(line.get('linea'),newStatus,'Status'+side,table);}
	});
}

function guardarCambioEstado(el)
{
$('cuadroInfo').addClass('oculto');
requestCambioEstadoPuertos(el.get('linea'),el.get('text'),'Status'+el.get('side'),el.get('tablaPuertos'));	
if (el.get('portGroup')!='none')
	{
	var lineaPadre=$(el.get('tablaPuertos')).getElement('.lineaDatos[linea="'+el.get('linea')+'"]');
	var lineaSiguiente=lineaPadre.getNext('.lineaDatos');
	requestCambioEstadoPuertos(lineaSiguiente.get('linea'),el.get('text'),'Status'+el.get('side'),el.get('tablaPuertos'));	
	}
}

function requestCambioEstadoPuertos(id,valor,campo,tablaPuertos)
{
new Request({url: 'ajax/cambioEstadoPuerto.php',
	onSuccess:function(responseText)
		{
		if (responseText!='error')
			{
			var valores=JSON.decode(responseText);
			var linea=$(valores[3]).getElement('.lineaDatos[linea="'+valores[0]+'"]');
			linea.getElement('.datos[campo="'+valores[1]+'"]').getElement('.valor').set('text',valores[2]);
			inicializarEstadosPuertos(linea,valores[1].substring(6));
			}
		else
			{
			alert('error when updating status');
			}
		}
	}).send('id='+id+'&value='+valor+'&field='+campo+'&tablaPuertos='+tablaPuertos);
}



function comentarioPuerto(e)
{

var modoEdicion=$('edicionGlobal').get('modoEdicion');	
var boton=e.target;
var posCursor=e.page;
$('cuadroInfo').empty();
$('cuadroInfo').removeClass('oculto');
$('cuadroInfo').setStyle('width','200px');
$('cuadroInfo').setStyle('height','100px');
$('cuadroInfo').setStyle('left',(posCursor.x-20)+'px');
$('cuadroInfo').setStyle('top',(posCursor.y-100)+'px');
var linea=e.target.getParent('.lineaDatos');
var comments=getValorLinea(linea,'Comments');
if (modoEdicion=='0')
	{
	new Element('div',{'text':comments,'style':'width:180px;'}).inject($('cuadroInfo')); 
	var cerrar=new Element('div',{'class':'conTip','style':'position:absolute;top:2px;right:2px;cursor:pointer;width:15px;height:15px','text':'X','title':'close'}).inject($('cuadroInfo')); 
	cerrar.addEvent('click',function(){$('cuadroInfo').addClass('oculto');$('cuadroInfo').empty();});
	}
else
	{
	var linea=e.target.getParent('.lineaDatos');
	var idPuerto=linea.get('linea');
	var tipoPuerto=linea.getParent('.tablaPuertos').get('tipoPuerto');
	new Element('textarea',{'name':'Comments','text':comments,'idPuerto':idPuerto,'tipoPuerto':tipoPuerto,'style':'width:180px;height:90px;'}).inject($('cuadroInfo')); 
	var cerrar=new Element('div',{'class':'boton cancelButton conTip','style':'position:absolute;top:4px;right:2px;','title':'cancel'}).inject($('cuadroInfo')); 
	cerrar.addEvent('click',function(){$('cuadroInfo').addClass('oculto');$('cuadroInfo').empty();});
	var save=new Element('div',{'class':'boton saveButton conTip','style':'position:absolute;top:30px;right:2px;','title':'save'}).inject($('cuadroInfo')); 
	save.addEvent('click',function(e){guardarComentarioPuerto(e.target);});
	}
}

function changeCircuitPort(e)
{
openInfoWindow(e,new Array(350,200),new Array(-100,-120));
addCloseInfoWindow();	
var el=e.target;
var groupLine='0';
var side='';
var table='';
var id='';
var cleaning=false;
if (e.target.getParent('.lineaDatos'))
	{
	var line=e.target.getParent('.lineaDatos');
	if (lineIsGrouped(line))
		{
		groupLine=line.getNext('.lineaDatos').get('linea');
		}
	var cell=e.target.getParent('.celda');
	var circuit='';
	if (cell.hasAttribute('circuit'))
		{circuit=cell.get('circuit');}
	if (circuit!='' && circuit!='0')
		{
		cleaning=true;
		var cleanCircuit=new Element('div',{'class':'botonLink','text':'no circuit','style':'margin-top:10px;margin-left:10px;color:yellow;'}).inject($('cuadroInfoContent'));
		cleanCircuit.addEvent('click',function(e){circuitChangeSave();});
		var form=new Element('div',{'class':'oculto'}).inject($('cuadroInfoContent'));
		form.set('html','<form id="circuitChangeForm" groupLine="'+groupLine+'"><input style="width:99px" name="circuitId" value="0"><input class="oculto" name="side" value="'+cell.get('campo')+'"><input class="oculto" name="table" value="'+cell.getParent('.tablaDiv').get('tabla')+'"><input class="oculto" name="idTable" value="'+line.get('linea')+'"></form>');
		}
	else
		{
		var customer='';
		if (cell.getElement('.spanCustomer'))
			{customer=cell.getElement('.spanCustomer').get('text');}
		side=cell.get('campo');
		table=cell.getParent('.tablaDiv').get('tabla');
		id=line.get('linea');
		var otherSide='';
		switch (cell.get('campo'))
			{
			case 'CircuitFront': 
				otherSide='CircuitRear';
				break;
			case 'CircuitRear': 
				otherSide='CircuitFront';
				break;
			case 'CircuitIn': 
				otherSide='CircuitOut';
				break;
			case 'CircuitOut': 
				otherSide='CircuitIn';
				break;
			}
		if (otherSide!='')
			{
			var otherSideCell=line.getElement('.celda[campo="'+otherSide+'"]');
			if (otherSideCell.hasAttribute('circuit'))
				{circuit=otherSideCell.get('circuit');}
			if (otherSideCell.getElement('.spanCustomer'))
				{customer=otherSideCell.getElement('.spanCustomer').get('text');}
			}
		}
	}
else
	{
	//circuits view
	var parent=el.getParent('.filaDescriptorRed');
	table=parent.get('tabla');
	id=parent.get('idTabla');
	var blockParent=parent.getElement('.salidaPuerto');
	var portSide='In';
	var otherSide='Out';
	if (blockParent.hasClass('salidaPuerto'))
		{portSide='Out';otherSide='In';}
	idPuertos=new Array(parent.get('idTabla'));
	side=blockParent.get('text');
	if (side=='PORT')
		{
		side='Dest';
		}
	if (parent.hasClass('grouped2'))
		{
		idPuertos[1]=parent.get('otherPort');
		groupLine=parent.get('otherPort');
		}
	nombrePuertos=parent.getElement('.descriptorRedPrimario').get('text').split('/');
	var descParent=el.getParent('.descriptorRed');
	circuit=descParent.getNext('.circuit'+portSide).get('text');
	/*if (circuit=='0')
		{circuit=descParent.getNext('.circuit'+otherSide).get('text');}*/
	}
if (!cleaning)
	{
	var claseNew='';
	var html='';
	if ((circuit!='' && circuit!='0')||$('allCircuitsTable'))
		{
		claseNew='oculto';
		html+='<div id="useCircuitMenu" style="font-size:14px;color:yellow;">';
		html+='<div class="botonLink useSideCircuit" style="margin-top:30px;color:yellow!important;" circuit="0">No circuit</div>';
			if ($('allCircuitsTable'))
				{
				$('allCircuitsTable').getElements('.lineaDatos').each(function(line)
					{
					if (line.get('linea')!=circuit)
						{
						html+='<div class="botonLink useSideCircuit" style="margin-top:30px;color:yellow!important;" circuit="'+line.get('linea')+'">Use circuit:'+referencesRepository[circuitsRepository.indexOf(line.get('linea')*1)]+'</div>';
						}
					});
				}
			else
				{
				html+='<div class="botonLink useSideCircuit" style="margin-top:30px;color:yellow!important;" circuit="'+circuit+'">Use circuit:'+referencesRepository[circuitsRepository.indexOf(circuit*1)]+'</div>';
				}
			html+='<div id="useNewCircuit" class="botonLink" style="margin-top:30px;color:yellow!important;">New circuit</div>';
		html+='</div>';
		}
	html+='<div id="newCircuitMenu" style="margin-top:10px;margin-left:5px;width:150px;" class="'+claseNew+'"><form id="circuitChangeForm" class="mainForm" groupLine="'+groupLine+'"><input class="oculto" name="side" value="'+side+'"><input class="oculto" name="table" value="'+table+'"><input class="oculto" name="idTable" value="'+id+'"><input class="oculto" name="Circuit" value="0">';
		html+=newCircuitHtml();
	html+='</form></div>';
	$('cuadroInfoContent').set('html',html);
	var save=new Element('div',{'class':'boton saveButton conTip','style':'position:absolute;top:30px;right:2px;','title':'save'}).inject($('cuadroInfoContent')); 
	save.addEvent('click',function(e){circuitChangeSave();});
	if ((circuit!='' && circuit!='0')||$('allCircuitsTable'))
		{
		$$('.useSideCircuit').addEvent('click',function(e){var el=e.target;if(!el.hasClass('botonLink')){el=el.getParent('.botonLink');}var circuit=el.get('circuit');new Element('input',{'value':circuit,'name':'circuitId'}).inject($('circuitChangeForm'));circuitChangeSave();});
		$('useNewCircuit').addEvent('click',function(e){$('useCircuitMenu').addClass('oculto');$('newCircuitMenu').removeClass('oculto');});
		}
	autoSelectsNewCircuit('circuitChangeForm','body');
	
	}
}

function circuitChangeSave()
{
$('cuadroInfoContent').addClass('oculto');
var totalPorts='1';
var groupLine=$('circuitChangeForm').get('groupline');
if (groupLine!='0')
	{totalPorts='2';}
var resultArea=new Element('div',{'id':'circuitChangeResultArea', 'totalPorts':totalPorts,'processed':'0'}).inject($('cuadroInfo'));
resultArea.set('load',{method:'post',data:serializarFormulario('circuitChangeForm')});
resultArea.load('ajax/circuitChange.php');
if (totalPorts==2)
	{
	$('circuitChangeForm').getElement('input[name="idTable"]').set('value',$('circuitChangeForm').get('groupline'));
	var resultArea2=new Element('div').inject($('cuadroInfo'));
	resultArea2.set('load',{method:'post',data:serializarFormulario('circuitChangeForm')});
	resultArea2.load('ajax/circuitChange.php');
	}
}

function afterCircuitChange(values)
{
var arrVal=JSON.decode(values);
var fromId=arrVal[0];
var fromType=arrVal[1];
var sideFrom=arrVal[2];
var toId=arrVal[3];
var toType=arrVal[4];
var sideTo=arrVal[5];
var circuit=arrVal[6];
var tablaPuertos='';
var portsTableExist=true;
if ($('circuitLeft'))
	{
	portsTableExist=false;
	}
if (portsTableExist)
	{
	$$('.tablaPuertos').each(function(item)
		{
		if (item.getElement('.lineaDatos[linea="'+fromId+'"]'))
			{
			tablaPuertos=item.get('id');
			}
		});
	var linea=$(tablaPuertos).getElement('.lineaDatos[linea="'+fromId+'"]');
	//linea.getElement('.datos[campo="Status'+sideFrom+'"]').getElement('.valor').set('text','CONNECTED');
	linea.getElement('.datos[campo="Circuit'+sideFrom+'"]').getElement('.valor').set('text',circuit);

	otherSide='';
	if (fromType=='Panel')
		{
		otherSide='Front';
		if (sideFrom=='Front')
			{
			otherSide='Rear';
			}
		}
	if (fromType=='Offnet')
		{
		otherSide='In';
		if (sideFrom=='In')
			{
			otherSide='Out';
			}
		}

	if ((fromType=='Panel')||(fromType=='Offnet'))
		{
		if (getValorLinea(linea,'Riser'+otherSide)!='0')
			{
			linea.getElement('.datos[campo="Riser'+otherSide+'Status"]').getElement('.valor').set('text','SERVICE');
			linea.getElement('.datos[campo="Circuit'+otherSide+'"]').getElement('.valor').set('text',circuit);
			inicializarEstadosPuertos(linea,otherSide);
			}
		}
		
	inicializarEstadosPuertos(linea,sideFrom);

	if (fromType=='Panel' && toType=='Panel')
		{
		if ($('tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]'))
			{
			var linea=$('tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]');
			//linea.getElement('.datos[campo="Status'+sideTo+'"]').getElement('.valor').set('text','CONNECTED');
			linea.getElement('.datos[campo="Circuit'+sideTo+'"]').getElement('.valor').set('text',circuit);
			inicializarEstadosPuertos(linea,sideTo);
			var otherSide='Front';
			if (sideTo=='Front')
				{
				otherSide='Rear';
				}
			if (getValorLinea(linea,'Riser'+otherSide)!='0')
				{
				linea.getElement('.datos[campo="Riser'+otherSide+'Status"]').getElement('.valor').set('text','SERVICE');
				linea.getElement('.datos[campo="Circuit'+otherSide+'"]').getElement('.valor').set('text',circuit);
				inicializarEstadosPuertos(linea,otherSide);
				}
			}
		}

	if ((fromType=='Eq') && (toType=='Eq'))
		{
		if ($('eqLeft').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]'))
			{
			var linea=$('eqLeft').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+toId+'"]');
			//linea.getElement('.datos[campo="Status'+sideTo+'"]').getElement('.valor').set('text','CONNECTED');
			linea.getElement('.datos[campo="Circuit'+sideTo+'"]').getElement('.valor').set('text',circuit);
			inicializarEstadosPuertos(linea,sideTo);
			}
		}	
	}

var processed=($('circuitChangeResultArea').get('processed')*1) + 1;
$('circuitChangeResultArea').set('text', processed + ' updates processed');
$('circuitChangeResultArea').set('processed',processed);
if (processed==($('circuitChangeResultArea').get('totalPorts')*1))
	{
	setTimeout(function(){$('cuadroInfo').empty();$('cuadroInfo').addClass("oculto");},2000);
	if (typeof(circuitChangeCompleted) == 'function')
		{
		setTimeout(function(){circuitChangeCompleted();},1000);
		}
	}

}


function guardarComentarioPuerto(el)
{
var textArea=$('cuadroInfo').getElement('textarea[name="Comments"]');
var tipoPuerto=textArea.get('tipoPuerto');
var idPuerto=textArea.get('idPuerto');
var comments=textArea.value;
new Request({url: 'ajax/guardarComentarioPuerto.php',
	onSuccess:function(responseText)
		{
		if (responseText.indexOf('error')!=0)
			{
			var resultado=JSON.decode(responseText);
			if (resultado.length==3)
				{
				var tipoPuerto=resultado[0];
				var idPuerto=resultado[1];
				var comments=resultado[2];
				$$('.tablaPuertos[tipoPuerto="'+tipoPuerto+'"]').each(function(item)
					{
					if (item.getElement('.lineaDatos[linea="'+idPuerto+'"]'))
						{
						var linea=item.getElement('.lineaDatos[linea="'+idPuerto+'"]');
						linea.getElement('.datos[campo="Comments"]').getElement('.valor').set('text',comments);
						linea.getElements('.botonInformation').destroy();
						var botonComments='';
						if (comments!='')
							{
							botonComments=new Element('div',{'class':'boton botonInformation botonCommentPort conTip','title':comments}).inject(linea.getElement('.datos[campo="Name"]'));
							}
						else
							{
							botonComments=new Element('div',{'class':'boton botonInformation botonCommentPort showOnEdit conTip','title':'insert comment'}).inject(linea.getElement('.datos[campo="Name"]'));
							botonComments.setStyle('display','block');
							}
						botonComments.addEvent('click',function(e){comentarioPuerto(e);});
						}
					});
				}
			}
		else
			{
			alert(responseText);
			}
		}
	}).send('idPuerto='+idPuerto+'&tipoPuerto='+tipoPuerto+'&comments='+encodeURIComponent(comments));
	

$('cuadroInfo').addClass('oculto');
$('cuadroInfo').empty();
}

function inicializarEstadosPuertos(linea,side)
{
var estado=linea.getElement('.datos[campo="Status'+side+'"]').getElement('.valor').get('text');
var modoEdicion=!$('edicionGlobal').hasClass('oculto');	
var formatMode=true;
if (linea.getParent('.tablaDiv'))
	{
	if (linea.getParent('.tablaDiv').hasClass('noEdit'))
		{
		modoEdicion=false;
		}
	if (linea.getParent('.tablaDiv').hasClass('noFormat'))
		{
		formatMode=false;
		}
	}
var esRiser=false;
if (linea.getElement('.datos[campo="Riser'+side+'"]'))
	{
	if (getValorLinea(linea,'Riser'+side)!='0')
		{
		esRiser=true;
		}
	}
if (modoEdicion)
	{
	linea.getElement('.datos[campo="Name"]').getElement('.'+side+'Buttons').empty();
	if (side=='Dest')
		{linea.getElement('.datos[campo="Name"]').getElement('.'+side+'ButtonsLeft').empty();}
	}
if (formatMode)
	{
	linea.getElements('.datos[campo="Name"]').each(function(celda)
		{
		celda.addClass('nombrePuertos');
		celda.setStyle('padding-left','20px');
		celda.setStyle('padding-right','20px');
		});
	}
if (linea.getElement('.datos[campo="Comments"]'))
	{
	var comments=getValorLinea(linea,'Comments');
	var botonComments='';
	if (comments!='')
		{
		botonComments=new Element('div',{'class':'boton botonInformation botonCommentPort conTip','title':comments}).inject(linea.getElement('.datos[campo="Name"]'));
		botonComments.addEvent('click',function(e){comentarioPuerto(e);});
		}
	}

if (modoEdicion)
	{
	if (botonComments=='')
		{
		botonComments=new Element('div',{'class':'boton botonInformation botonCommentPort showOnEdit conTip','title':'insert comment'}).inject(linea.getElement('.datos[campo="Name"]'));
		botonComments.addEvent('click',function(e){comentarioPuerto(e);});
		}
	}
	
var celdaCir=linea.getElement('.datos[campo="Circuit'+side+'"]');
celdaCir.getElements('.spanCustomer').each(function(cust){cust.destroy();});
if (celdaCir.getElement('.valor').get('text')=='' || celdaCir.getElement('.valor').get('html')=='&nbsp;' || celdaCir.getElement('.valor').get('text')=='0')
	{
	celdaCir.getElement('.valor').set('html','&nbsp;');
	celdaCir.set('circuit','0');
	}
else
	{
	var circuit=celdaCir.getElement('.valor').get('text')*1;
	celdaCir.set('circuit',circuit);
	circuitReferenceBlock(circuit,celdaCir.getElement('.valor'));
	}
if (modoEdicion)
	{
	if (!celdaCir.getElement('.botonChangeCircuit'))
		{
		var circuitButton=new Element('div',{'class':'boton botonEditar changeCircuitButton showOnEdit conTip','title':'change circuit'}).inject(celdaCir);
		circuitButton.addEvent('click',function(e){changeCircuitPort(e);});
		}
	}
if (formatMode)
	{limpiarEstadosPuertos(celdaCir);}
var type=linea.getElement('.datos[campo="'+side+'Type"]').getElement('.valor').get('text');
var celdaCon=linea.getElement('.datos[campo="'+side+'Connection"]');
var claseBotones='botonesJuntosRight';
if (side=='Front' || side=='In')
	{
	claseBotones='botonesJuntosLeft';
	}
if (celdaCon.getElement('.valorDescriptor'))
	{
	celdaCon.getElement('.valorDescriptor').destroy();
	}
if (celdaCon.getElement('.valor').get('text')=='0'|| celdaCon.getElement('.valor').get('html')=='&nbsp;')
	{
	celdaCon.getElement('.valor').removeClass('oculto');
	celdaCon.getElement('.valor').set('html','&nbsp;');
	if (modoEdicion)
		{
		var boton=new Element('div',{'class':'boton botonStatus '+claseBotones+' conTip','side':side,'title':'change status'}).inject(linea.getElement('.datos[campo="Name"]').getElement('.'+side+'Buttons'));
		boton.addEvent('click',function(e){changeStatusPort(e);});
		var botonConectar=new Element('div',{'class':'boton botonConectar '+claseBotones+' conTip','side':side,'title':'connect'}).inject(linea.getElement('.datos[campo="Name"]').getElement('.'+side+'Buttons'));
		botonConectar.addEvent('click',function(e){connectPort(e.target);});
		if (side=='Dest')
			{
			var portTools=new Element('div',{'class':'boton botonTools botonesJuntosLeft conTip','side':side,'title':'special tools'}).inject(linea.getElement('.datos[campo="Name"]').getElement('.'+side+'ButtonsLeft'));
			portTools.addEvent('click',function(e){showPortTools(e);});
			}
		}
	}
else
	{
	var connection=celdaCon.getElement('.valor').get('text');
	celdaCon.set('connection',connection);
	celdaCon.getFirst('.valor').addClass('oculto');
	var espacioDescriptor=new Element('span',{'class':'valorDescriptor'}).inject(celdaCon.getFirst('.valor'),'after');
	espacioDescriptor.load('ajax/getElementDescription.php?id='+connection+'&tabla='+type+'Ports');
	if (modoEdicion && (!esRiser))
		{
		var boton=new Element('div',{'class':'boton botonDesconectar '+claseBotones+' conTip','side':side,'title':'disconnect'}).inject(linea.getElement('.datos[campo="Name"]').getElement('.'+side+'Buttons'));
		boton.addEvent('click',function(e){disconnectPort(e);});
		}
	}
if (linea.getElement('.'+side+'InfoGroup'))
	{
	linea.getElement('.'+side+'InfoGroup').empty();
	if (linea.getElement('.datos[campo="Label'+side+'"]'))
		{
		var labelValue=getValorLinea(linea,'Label'+side);
		if (labelValue!='Unchecked')
			{
			var labelIcon=new Element('div',{'class':'labelIcon labelSide'+side+' label'+labelValue,'side':side,'title':'Label '+labelValue}).inject(linea.getElement('.'+side+'InfoGroup'));
			labelIcon.addEvent('click',function(e){changeLabelStatus(e);});
			}
		else
			{
			if (modoEdicion)
				{
				var labelIcon=new Element('div',{'class':'showOnEdit labelIcon labelSide'+side+' label'+labelValue,'side':side,'title':'click to change'}).inject(linea.getElement('.'+side+'InfoGroup'));
				labelIcon.addEvent('click',function(e){changeLabelStatus(e);});
				}
			}
		if ($('edicionGlobal').get('modoedicion')=='1')
			{
			labelIcon.setStyle('display','block');
			}
		}

	if (linea.getElement('.datos[campo="Riser'+side+'"]'))
		{
		var riserValue=getValorLinea(linea,'Riser'+side)*1;
		if (riserValue!=0)
			{new Element('div',{'class':'cableSide'+side,'title':'go to riser/cable info','html':'<a href="riser.php?id='+riserValue+'"><img src="styles/images/link.png" /></a>'}).inject(linea.getElement('.'+side+'InfoGroup'));}
		}
	}

if (formatMode)
	{
	limpiarEstadosPuertos(celdaCon);
	if ($('marcoPanel'+side))
		{
		if ($('marcoPanel'+side).getElement('.puertoPanel[port="'+linea.getElement('.datos[campo="Port"]').getElement('.valor').get('text')+'"]'))
			{
			var puerto=$('marcoPanel'+side).getElement('.puertoPanel[port="'+linea.getElement('.datos[campo="Port"]').getElement('.valor').get('text')+'"]');
			limpiarEstadosPuertos(puerto);
			puerto.set('side',side);
			puerto.set('idPort',linea.get('linea'));
			puerto.set('estado',estado);
			if (estado!='')
				{
				puerto.addClass('port'+estado);
				}
			}
		}
	var estadoCir=estado;
	if (linea.getElement('.datos[campo="Riser'+side+'"]'))
		{
		var estadoRiser=getValorLinea(linea,"Riser"+side+"Status");
		if (estadoRiser=='AVAILABLE')
			{
			estadoCir='FREE';
			}
		}
	if (estado!='')
		{
		celdaCir.addClass('port'+estadoCir);
		celdaCon.addClass('port'+estado);
		}
	}
}

function changeLabelStatus(e)
{
var modoEdicion=!$('edicionGlobal').hasClass('oculto');	
if (modoEdicion)
	{
	var boton=e.target;
	var posCursor=e.page;
	$('cuadroInfo').empty();
	$('cuadroInfo').removeClass('oculto');
	$('cuadroInfo').setStyle('width','160px');
	$('cuadroInfo').setStyle('height','100px');
	$('cuadroInfo').setStyle('left',(posCursor.x-20)+'px');
	$('cuadroInfo').setStyle('top',(posCursor.y-100)+'px');
	var statusList=new Array('Unchecked','OK','Miss','Wrong');
	var linea=boton.getParent('.lineaDatos');
	var estado=getValorLinea(linea,'Label'+boton.get('side'));
	statusList.each(function(item)
		{
		if (item!=estado)
			{
			var portGroup='none';
			if (linea.get('portGroup'))
				{
				portGroup=linea.get('portGroup');
				}
				
			var opcion=new Element('div',{'class':'listaOpciones opcion'+item,'tablaPuertos':e.target.getParent('.tablaPuertos').get('id'),'linea':linea.get('linea'),'portGroup':portGroup,'side':boton.get('side'),'text':item}).inject($('cuadroInfo')); 
			opcion.addEvent('click',function(e){saveLabelStatusChange(e.target);});
			}
		});
	var cerrar=new Element('div',{'class':'conTip','style':'position:absolute;top:2px;right:2px;cursor:pointer;width:15px;height:15px','text':'X','title':'close'}).inject($('cuadroInfo')); 
	cerrar.addEvent('click',function(){$('cuadroInfo').addClass('oculto');$('cuadroInfo').empty();});
	}
}

function saveLabelStatusChange(el)
{
$('cuadroInfo').addClass('oculto');
requestChangeLabelStatus(el.get('linea'),el.get('text'),'Label'+el.get('side'),el.get('tablaPuertos'));	
if (el.get('portGroup')!='none')
	{
	var lineaPadre=$(el.get('tablaPuertos')).getElement('.lineaDatos[linea="'+el.get('linea')+'"]');
	var lineaSiguiente=lineaPadre.getNext('.lineaDatos');
	requestChangeLabelStatus(lineaSiguiente.get('linea'),el.get('text'),'Label'+el.get('side'),el.get('tablaPuertos'));	
	}
}

function requestChangeLabelStatus(id,valor,campo,tablaPuertos)
{
new Request({url: 'ajax/changeLabelStatus.php',
	onSuccess:function(responseText)
		{
		if (responseText!='error')
			{
			var valores=JSON.decode(responseText);
			var linea=$(valores[3]).getElement('.lineaDatos[linea="'+valores[0]+'"]');
			var labelValue=valores[2];
			var side=valores[1].substring(5);
			linea.getElement('.datos[campo="'+valores[1]+'"]').getElement('.valor').set('text',valores[2]);
			linea.getElement('.labelSide'+side).destroy();
			if (labelValue!='Unchecked')
				{
				var labelIcon=new Element('div',{'class':'labelIcon labelSide'+side+' label'+labelValue,'side':side,'title':'Label '+labelValue}).inject(linea.getElement('.'+side+'InfoGroup'));
				labelIcon.addEvent('click',function(e){changeLabelStatus(e);});
				}
			else
				{
				if (modoEdicion)
					{
					var labelIcon=new Element('div',{'class':'showOnEdit labelIcon labelSide'+side+' label'+labelValue,'side':side,'title':'click to change'}).inject(linea.getElement('.'+side+'InfoGroup'));
					labelIcon.addEvent('click',function(e){changeLabelStatus(e);});
					labelIcon.setStyle('display','block');
					}
				}
			}
		else
			{
			alert('error when updating status');
			}
		}
	}).send('id='+id+'&value='+valor+'&field='+campo+'&tablaPuertos='+tablaPuertos);
}

function allLabels(el,table,side)
{
$(table).getElements('.lineaDatos').each(function(line)
	{
	var connection=getValorLinea(line,side+'Connection').trim();
	if (connection!='' && connection!='0')
		{requestChangeLabelStatus(line.get('linea'),el.get('labelValue'),'Label'+side,table);}
	});
}


function limpiarEstadosPuertos(el)
{
estadosPuertos.each(function(item)
	{
	el.removeClass(item);
	});
}

function newEqOrdenationField(table, field)
{
$(table).getElements('.lineaDatos').each(function(item)
	{
	var newCell=new Element('div',{'class':'celda datos oculto','campo':'EqOrdenation','tipo':'varchar'}).inject(item.getElement('.clear'),'before');
	var newValue=new Element('span',{'class':'valor'}).inject(newCell);
	newValue.set('text',normalizeEqPort(getValorLinea(item,field)));
	});
}

function normalizeEqPort(str)
{
var valores=new Array();
var res='';
var separator='';
var separators=new Array('-','/','_',' ');
var i=0;
while (i<separators.length && separator=='')
	{
	if (str.indexOf(separators[i])>-1)
		{
		valores=str.split(separators[i]);
		separator=separators[i];
		}
	i++;
	}

if (valores.length==0)
	{
	if (isStrictNumber(str))
		{
		res=devolverCeros(6-str.length)+str;
		}
	else
		{res=str;}
	}
else
	{
	valores.each(function(item)
		{
		res+=normalizeEqPort(item)+separator;
		});
	}
return res;
}

function getOtherSide(side)
{
var otherSide='';
switch (side)
	{
	case 'Front':
		otherSide='Rear';
		break;
	case 'Rear':
		otherSide='Front';
		break;
	case 'In':
		otherSide='Out';
		break;
	case 'Out':
		otherSide='In';
		break;
	}
return otherSide;
}