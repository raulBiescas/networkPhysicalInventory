/*!
 * equipments.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 equipments.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

var eqLayouts={};

function prepareEqLayout(model,container)
{
var jsonRequest = new Request({url: 'ajax/getEquipmentLayout.php', onSuccess: function(xmlLayout)
	{
	if (xmlLayout=="")
		{
		$('Cards').removeClass('oculto');
		$('cardsTableTitle').removeClass('oculto');
		$('layoutEquipment').setStyle('overflow-y','auto');
		$('selectChassis').addClass('oculto');
		$('selectCardList').addClass('oculto');
		$$('.marcoEquipment').addClass('oculto');
		}
	else
		{
		$(container).set('model',model);
		var x2js = new X2JS();
		if (!eqLayouts.hasOwnProperty(model))
			{eqLayouts[model]=xmlLayout;}
		var layoutModel=x2js.xml_str2json(eqLayouts[model]);
		//layoutModel=x2js.xml_str2json(xmlLayout);//sobra??
		var containerFront=$(container).getElement('.frontLayout');
		Object.each(layoutModel.root.slots.FRONT,function(item,index)
			{
			var nombreSlot=index.replace("Slot_number_","");
			nombreSlot=nombreSlot.replace(/ANYNUMBER/g,'[0-9]+');
			nombreSlot='^'+nombreSlot.replace(/ANYLETTER/g,'[A-Za-z0-9]+')+'$';
			var slot=new Element('div',{'class':'slot','text':item.name,'slot':nombreSlot}).inject(containerFront);
			slot.setStyle('top',item.top);
			if (item.left)
				{slot.setStyle('left',item.left);}
			else
				{slot.setStyle('right',item.right);}
			slot.setStyle('width',item.width);
			slot.setStyle('height',item.height);
			});
			
		var containerRear=$(container).getElement('.rearLayout');
		Object.each(layoutModel.root.slots.REAR,function(item,index)
			{
			var nombreSlot=index.replace("Slot_number_","");
			nombreSlot=nombreSlot.replace(/ANYNUMBER/g,'[0-9]+');
			nombreSlot='^'+nombreSlot.replace(/ANYLETTER/g,'[A-Za-z0-9]+')+'$';
			var slot=new Element('div',{'class':'slot','text':item.name,'slot':nombreSlot}).inject(containerRear);
			slot.setStyle('top',item.top);
			if (item.left)
				{slot.setStyle('left',item.left);}
			else
				{slot.setStyle('right',item.right);}
			slot.setStyle('width',item.width);
			slot.setStyle('height',item.height);
			});
		
		var tabla=$(container).getElement('.tablaDiv');
		tabla.getElements('.lineaDatos').each(function(linea)
			{
			situarTarjeta(linea,container);
			});
		ajustarSlots(container);
		}
	
	}
}).get({'model': model});
}

function situarTarjeta(linea,container)
{
var slot=linea.getElement('.celda[campo="Slot"]').getFirst('.valor').get('text');
slot=slot.replace(/ /g,'_');
slot=slot.replace(/-/g,'_');
slot=slot.replace(/\//g,'_');
var name=linea.getElement('.celda[campo="Name"]').getFirst('.valor').get('text');
var found=false;
var slotPosition;
$(container).getElements('.slot').each(function(item)
	{
	var patt=new RegExp(item.get('slot'));
	if (patt.test(slot))
		{
		slotPosition=item;
		found=true;
		}
	});
if (found)
	{
	var card=new Element('div',{'class':'card conTip','slot':slot,'nombre':name,'title':name,'idCard':linea.get('linea')}).inject(slotPosition);
	slotPosition.addClass('slotOcupado');
	slotPosition.set('slots','1');
	var model=$(container).get('model');
	var x2js = new X2JS();
	var layoutModel=x2js.xml_str2json(eqLayouts[model]);
	name=name.replace(/ /g,'_');
	Object.each(layoutModel.root.cards,function(item,index)
		{
		if (name.indexOf(index)>-1)
			{
			if (item.hasOwnProperty('slots'))
				{
				var slots=item.slots*1;
				slotPosition.set('slots',slots);
				slotPosition.set('extendSlots','');
				if (item.hasOwnProperty('slotExtend'))
					{slotPosition.set('extendSlots',item.slotExtend);}
				slotPosition.set('vertExtend','');
				if (item.hasOwnProperty('verticalExtend'))
					{slotPosition.set('vertExtend',item.verticalExtend);}
				card.setStyle('width',slots*100+'%');
				card.setStyle('left','0px');
				}
			if (item.hasOwnProperty('noports'))
				{
				card.set('noPorts','noPorts');
				}
			if (item.hasOwnProperty('verticalslots'))
				{
				var verticalslots=item.verticalslots*1;
				card.setStyle('height',verticalslots*100+'%');
				if (item.hasOwnProperty('verticalExtend'))
					{
					if (item.verticalExtend=='top')
						{
						card.setStyle('top','-100%');	
						}
					}
				card.setStyle('left','0px');
				}
			}
		});
	card.addEvent('click',function(e)
		{
		if (e.target.hasClass('card'))
			{var el=e.target;}
		else
			{
			var el=e.target.getParent('.card');
			}
		tarjetaSeleccionada(el.get('idCard'));		
		});
	}
else
	{
	var model=$(container).get('model');
	var x2js = new X2JS();
	var layoutModel=x2js.xml_str2json(eqLayouts[model]);
	Object.each(layoutModel.root.modules,function(item,index)
		{
		var module=index.replace(/ANYNUMBER/g,'[0-9]+');
		var module='^'+module.replace(/ANYLETTER/g,'[A-Za-z0-9]+')+'$';
		var patt=new RegExp(module);
		if (patt.test(slot))
			{
			$(container).getElements('.card').each(function(tarjeta)
				{
				var arr1=tarjeta.get('slot').split('_');
				var arr2=slot.split('_');
				var arr3=index.split('_');
				var moduloEnTarjeta=false;
				if (arr1.length>0 && arr2.length>arr1.length && arr3.length==arr2.length)
					{
					moduloEnTarjeta=true;
					var i=0;
					while (i< arr1.length)
						{
						if (arr1[i]!=arr2[i] && arr3[i]!='ANYLETTER')
							{
							moduloEnTarjeta=false;
							}
						i++;
						}
					}
				if (moduloEnTarjeta)
					{
					found=true;
					Object.each(item.card, function (valores, tipo)
						{
						var cardName=tarjeta.get('nombre');
						cardName=cardName.replace(/ /g,'_');
						//cardName=cardName.replace(/-/g,'_');
						cardName=cardName.replace(/\//g,'_');
						if (tipo=='ALL' || (cardName.indexOf(tipo)>-1))
							{
							var clase='module';
							if (tarjeta.hasClass('module'))
								{
								clase+=' secModule';
								}
							var card=new Element('div',{'class':'card '+clase+' conTip','slot':slot,'nombre':name,'title':name,'idCard':linea.get('linea')}).inject(tarjeta);
							
							card.addEvent('click',function(e)
								{
								if (e.target.hasClass('card'))
									{var el=e.target;}
								else
									{
									var el=e.target.getParent('.card');
									}
								tarjetaSeleccionada(el.get('idCard'));		
								});
							card.setStyle('top',valores.top);
							if (valores.left)
								{card.setStyle('left',valores.left);}
							else
								{card.setStyle('right',valores.right);}
							card.setStyle('width',valores.width);
							card.setStyle('height',valores.height);
							if (valores.hasOwnProperty('name'))
								{
								card.set('moduleName',valores.name);
								}
							else
								{card.set('moduleName','');}
							}
						});
					}
				});
			}
		});
	}
/*if (!found && (name!='CHASSIS'))
	{alert('Card '+name+' for slot '+linea.getElement('.celda[campo="Slot"]').getFirst('.valor').get('text')+ ' not found in the model so no way to draw it.');}*/
}

function ajustarSlots(container)
{
$(container).getElements('.slot').each(function(slot)
	{
	var slots=slot.get('slots')*1;
	if (slots>1)
		{
		var posicion='left';
		var extendSlots=slot.get('extendSlots');
		var i=1;
		var slotActual=slot;
		while (i<slots)
			{
			if (slotActual.getPrevious('.slot'))
				{
				slotActual=slotActual.getPrevious('.slot');
				if (slotActual.hasClass('slotOcupado'))
					{
					posicion='right';
					}
				}
			i++;
			}
		if (extendSlots!='')
			{
			posicion=extendSlots;
			}
		if (posicion=='left')
			{
			slot.getElement('.card').setStyle('left',(slots-1)*(-100)+'%');
			var i=1;
			var slotActual=slot;
			while (i<slots)
				{
				if (slotActual.getPrevious('.slot'))
					{
					slotActual=slotActual.getPrevious('.slot');
					slotActual.addClass('slotOcupado');
					}
				i++;
				}
			}
		else
			{
			
			var i=1;
			var slotActual=slot;
			while (i<slots)
				{
				if (slotActual.getNext('.slot'))
					{
					slotActual=slotActual.getNext('.slot');
					slotActual.addClass('slotOcupado');
					}
				i++;
				}
			}
		}
	});
}

function duplicarPuerto(el)
{
var idCard=$('tarjetaSeleccionada').get('idCard');
var puerto=el.getParent('.lineaDatos').get('linea');
$('cardContainer').empty();
$('cardContainer').set('text','Reloading...');
$('cardContainer').load('ajax/duplicarPuerto.php?id='+puerto+'&idCard='+idCard);
}



function typeCardSelected()
{
var tipo=$('selectType').options[$('selectType').selectedIndex].text;
$('newValores').load('ajax/valoresTarjeta.php?tipo='+tipo);
}

function partCardSelected()
{
var part=$('selectPartNumber').options[$('selectPartNumber').selectedIndex].text;
newValores.load('ajax/valoresTarjeta.php?part='+part);
}

function groupEquipmentPorts(table)
{
if ($(table).getElement('.titulo[campo="Name"]').getElement('.botonAgruparPuertos')===null)
	{
	var boton=new Element('div',{'class':'botonAgruparPuertos desagruparPuertos conTip','title':'ungroup ports','text':2}).inject($(table).getElement('.titulo[campo="Name"]'));
	boton.addEvent('click',function(e){changeGroupingPorts(e.target)});
	}
$(table).getElements('.lineaDatos').each(function(linea)
	{
	if (linea.getNext('.lineaDatos') && !linea.hasClass('hiddenGrouped'))
		{
		var current=getValorLinea(linea,'Name');
		var siguienteLinea=linea.getNext('.lineaDatos');
		var next=getValorLinea(siguienteLinea,'Name');
		if (comparacionPuertos(linea,siguienteLinea))
			{
			if (current.toUpperCase().indexOf('TX')>-1 || current.toUpperCase().indexOf('RX')>-1 || current.toUpperCase().indexOf('-D')>-1 || current.toUpperCase().indexOf('-M')>-1 || current.toUpperCase().indexOf('-IN')>-1 || current.toUpperCase().indexOf('-OUT')>-1)
				{
				if (current.trim().toUpperCase().replace('TX','RX')==next.trim().toUpperCase() || current.trim().toUpperCase().replace('RX','TX')==next.trim().toUpperCase() || current.trim().toUpperCase().replace('-D','-M')==next.trim().toUpperCase() || current.trim().toUpperCase().replace('-M','-D')==next.trim().toUpperCase()|| current.trim().toUpperCase().replace('-IN','-OUT')==next.trim().toUpperCase() || current.trim().toUpperCase().replace('-OUT','-IN')==next.trim().toUpperCase())
					{
					siguienteLinea.addClass('oculto hiddenGrouped');
					new Element('span',{'class':'portGroup','text':' / '+diferenciaNombres(next,current)}).inject(linea.getElement('.datos[campo="Name"]').getElement('.valor'),'after');
					linea.set('portGroup',getValorLinea(siguienteLinea,'Port'));
					linea.addClass('lineaAgrupada2');
					}
				}
			}
		}
	});
}

function changeGroupingPorts(el)
{
if (el.hasClass('desagruparPuertos'))
	{
	el.set('title','group ports');
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
	groupEquipmentPorts(el.getParent('.tablaDiv').get('id'));
	$$('.valorGrupo2').removeClass('oculto');
	}
}

function precableCard(idCard)
{
var modulos=new Array();
if ($('layoutEquipment').getElement('.card[idCard="'+idCard+'"]'))
	{
	var tarjeta=$('layoutEquipment').getElement('.card[idCard="'+idCard+'"]');
	modulos=tarjeta.getElements('.module');
	}
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
$('popUp').set('html',cardsPrecablingTemplate());
var tablaPuertos=$('cardContainer').getElement('.tablaDiv[tabla="EqPorts"]');
var puertosCard=tablaPuertos.getElements('.lineaDatos');
puertosCard.each(function(lineaPuerto)
	{
	if (!lineaPuerto.getElement('.portCONNECTED'))
		{
		var lineaCopia=new Element('div',{'class':'lineaCopiaCards isPort','style':'margin-left:3%;font-size:11px;margin-top:10px;','linea':lineaPuerto.get('linea')}).inject($('portsToPrecable'));
		new Element('div',{'style':'float:left;width:10%;margin-right:1%;','html':'<input type="checkbox" class="precableOrNot" checked>'}).inject(lineaCopia);
		new Element('div',{'class':'nombrePuerto','style':'float:left;width:80%;margin-right:3%;','text':lineaPuerto.get('nombrePuerto')}).inject(lineaCopia);
		new Element('div',{'class':'clear'}).inject(lineaCopia);
		}
	});
$('continuarNewPrecabling').addEvent('click',function(e){continuePrecabling();});
}

function continuePrecabling()
{
var continuar=true;
if (getSelectValue($('valoresEditablesNewConnection'),'CableType')=='')
	{
	continuar=false;
	alert('Please select the type of cable.');
	}
if (continuar)
	{
	$('newRiserNavigationArea').removeClass('oculto');
	$('bloqueNavegacionRiser').load('ajax/navigateNetwork.php?tipoDestino=Panels&tabla=EqChassis&id='+eqBase);
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
	$('newRiserPortsArea').removeClass('oculto');
	var i=0;
	$('portsToPrecable').getElements('.isPort').each(function(port)
		{
		if (port.getElement('.precableOrNot').checked)
			{
			new Element('div',{'class':'newRiserPort', 'idPort':port.get('linea'),'text':port.getElement('.nombrePuerto').get('text')}).inject($('riserPortsFromArea'));
			i++;
			}
		});
	var j=0;
	while (j<i)
		{
		new Element('div',{'class':'newSeparationPort', 'text':'<->'}).inject($('riserPortsBetweenArea'));
		j++;
		}
	$('finalizarNewRiser').addEvent('click',function(){finalizarNewConnection()});
	}
}

function moveCard(idCard,moveOrCopy)
{
var modulos=new Array();
if ($('layoutEquipment').getElement('.card[idCard="'+idCard+'"]'))
	{
	var tarjeta=$('layoutEquipment').getElement('.card[idCard="'+idCard+'"]');
	modulos=tarjeta.getElements('.module');
	}
if (modulos.length==0)
	{
	var textoPregunta='Are you sure to '+moveOrCopy+' this card?';
	}
else
	{
	var textoPregunta='Are you sure to '+moveOrCopy+' this card and all its modules?';
	}
if (confirm(textoPregunta))
	{
	$('popUp').empty();
	$$('.popUpElement').removeClass('oculto');
	$('popUp').set('html',cardsWorkingTemplate());
	$('bloqueNavegacionCards').load('ajax/navigateNetwork.php?tipoDestino=EqChassis&tabla=EqChassis&id='+eqBase);
	var linea=$('Cards').getElement('.lineaDatos[linea="'+idCard+'"]');
	var form=new Element('form',{'class':'formLineaCopiaCards','action':'ajax/cardMovement.php'}).inject($('bloqueWorkingCards'));
	var lineaCopia=new Element('div',{'class':'lineaCopiaCards isCard lineaMaestra','style':'margin-left:3%;font-size:11px;','linea':linea.get('linea')}).inject(form);
	new Element('div',{'style':'float:left;width:25%;margin-right:3%;','text':getValorLinea(linea,'Name')}).inject(lineaCopia);
	new Element('div',{'class':'previo','style':'float:left;width:25%;margin-right:3%;','text':getValorLinea(linea,'Slot')}).inject(lineaCopia);
	new Element('div',{'style':'float:left;width:10%;margin-right:3%;','text':'-->'}).inject(lineaCopia);
	var lineaInputMaestra=new Element('div',{'style':'float:left;width:25%;margin-right:3%;padding:2px;','html':'<input class="slotInput" style="background-color:yellow;" name="Slot" type="text" value="'+getValorLinea(linea,'Slot')+'">'}).inject(lineaCopia);
	lineaInputMaestra.getElement('input').addEvent('change',function(e){corregirSlots(e.target);});
	new Element('input',{'class':'oculto','name':'Equipment', 'type':'text'}).inject(lineaCopia);
	new Element('input',{'class':'oculto','name':'Id','type':'text','value':linea.get('linea')}).inject(lineaCopia);
	new Element('input',{'class':'oculto','name':'table','type':'text','value':'Cards'}).inject(lineaCopia);
	new Element('div',{'class':'mensaje oculto'}).inject(lineaCopia);
	new Element('div',{'class':'clear'}).inject(lineaCopia);
	var tablaPuertos=$('cardContainer').getElement('.tablaDiv[tabla="EqPorts"]');
	var puertosCard=tablaPuertos.getElements('.lineaDatos[idCard="'+idCard+'"]');
	puertosCard.each(function(lineaPuerto)
		{
		var form=new Element('form',{'class':'formLineaCopiaCards','action':'ajax/cardMovement.php'}).inject($('bloqueWorkingCards'));
		var lineaCopia=new Element('div',{'class':'lineaCopiaCards isPort','style':'margin-left:3%;font-size:11px;','linea':lineaPuerto.get('linea')}).inject(form);
		new Element('div',{'style':'float:left;width:25%;margin-right:3%;text-align:right;','text':'Port:'}).inject(lineaCopia);
		new Element('div',{'class':'previo','style':'float:left;width:25%;margin-right:3%;','text':lineaPuerto.get('nombrePuerto')}).inject(lineaCopia);
		new Element('div',{'style':'float:left;width:10%;margin-right:3%;','text':'-->'}).inject(lineaCopia);
		new Element('div',{'style':'float:left;width:25%;margin-right:3%;','html':'<input class="slotInput" type="text" name="SystemName" value="'+lineaPuerto.get('nombrePuerto')+'">'}).inject(lineaCopia);
		new Element('input',{'class':'oculto','name':'Id','type':'text','value':lineaPuerto.get('linea')}).inject(lineaCopia);
		new Element('input',{'class':'oculto','name':'oldPort','type':'text','value':lineaPuerto.get('nombrePuerto')}).inject(lineaCopia);
		new Element('input',{'class':'oculto','name':'table','type':'text','value':'EqPorts'}).inject(lineaCopia);
		new Element('div',{'class':'mensaje oculto'}).inject(lineaCopia);
		new Element('div',{'class':'clear'}).inject(lineaCopia);
		});
	modulos.each(function(item)
		{
		var linea=$('Cards').getElement('.lineaDatos[linea="'+item.get('idCard')+'"]');
		var form=new Element('form',{'class':'formLineaCopiaCards','action':'ajax/cardMovement.php'}).inject($('bloqueWorkingCards'));
		var lineaCopia=new Element('div',{'class':'lineaCopiaCards isCard','style':'margin-left:3%;border-top:1px solid #ddd;font-size:11px;','linea':linea.get('linea')}).inject(form);
		if (moveOrCopy=='COPY')
			{
			new Element('div',{'style':'float:left;width:2%;margin-right:1%;','html':'<input type="checkbox" class="copyOrNot" checked>'}).inject(lineaCopia);
			}
		new Element('div',{'style':'float:left;width:25%;margin-right:3%;','text':getValorLinea(linea,'Name')}).inject(lineaCopia);
		new Element('div',{'class':'previo','style':'float:left;width:25%;margin-right:3%;','text':getValorLinea(linea,'Slot')}).inject(lineaCopia);
		new Element('div',{'style':'float:left;width:10%;margin-right:3%;','text':'-->'}).inject(lineaCopia);
		new Element('div',{'style':'float:left;width:25%;margin-right:3%;','html':'<input type="text" class="slotInput" name="Slot" value="'+getValorLinea(linea,'Slot')+'">'}).inject(lineaCopia);
		new Element('input',{'class':'oculto','name':'Equipment', 'type':'text'}).inject(lineaCopia);
		new Element('input',{'class':'oculto','name':'Id','type':'text','value':linea.get('linea')}).inject(lineaCopia);
		new Element('input',{'class':'oculto','name':'table','type':'text','value':'Cards'}).inject(lineaCopia);
		new Element('div',{'class':'mensaje oculto'}).inject(lineaCopia);
		new Element('div',{'class':'clear'}).inject(lineaCopia);
		var puertosCard=tablaPuertos.getElements('.lineaDatos[idCard="'+item.get('idCard')+'"]');
		puertosCard.each(function(lineaPuerto)
			{
			var form=new Element('form',{'class':'formLineaCopiaCards','action':'ajax/cardMovement.php'}).inject($('bloqueWorkingCards'));
			var lineaCopia=new Element('div',{'class':'lineaCopiaCards isPort','style':'margin-left:3%;font-size:11px;margin-top:10px;','linea':lineaPuerto.get('linea')}).inject(form);
			new Element('div',{'style':'float:left;width:25%;margin-right:3%;text-align:right;','text':'Port:'}).inject(lineaCopia);
			new Element('div',{'class':'previo','style':'float:left;width:25%;margin-right:3%;','text':lineaPuerto.get('nombrePuerto')}).inject(lineaCopia);
			new Element('div',{'style':'float:left;width:10%;margin-right:3%;','text':'-->'}).inject(lineaCopia);
			new Element('div',{'style':'float:left;width:25%;margin-right:3%;','html':'<input type="text" class="slotInput" name="SystemName" value="'+lineaPuerto.get('nombrePuerto')+'">'}).inject(lineaCopia);
			new Element('input',{'class':'oculto','name':'Id','type':'text','value':lineaPuerto.get('linea')}).inject(lineaCopia);
			new Element('input',{'class':'oculto','name':'oldPort','type':'text','value':lineaPuerto.get('nombrePuerto')}).inject(lineaCopia);
			new Element('input',{'class':'oculto','name':'table','type':'text','value':'EqPorts'}).inject(lineaCopia);
			new Element('div',{'class':'mensaje oculto'}).inject(lineaCopia);
			new Element('div',{'class':'clear'}).inject(lineaCopia);
			});
		});
	var buttonMove=new Element('div',{'id':'moveOrCopyButton','class':'botonCrear','text':moveOrCopy}).inject($('bloqueWorkingCards'));
	buttonMove.addEvent('click',function(e){completeCardMovement();});
	$$('.copyOrNot').addEvent('change',function(e){copyOrNotChanged(e.target);});
	$('replacementToggle').addEvent('click',function(e)
		{
		if (e.target.get('action')=='hide')
			{
			$('replacementBlock').addClass('oculto');
			e.target.set('action','show');
			e.target.set('text','show replacement options');
			}
		else
			{
			$('replacementBlock').removeClass('oculto');
			e.target.set('action','hide');
			e.target.set('text','hide replacement options');
			}
		});
	$('replacementReset').addEvent('click',function(e)
		{
		$$('.slotInput').each(function(input)
			{
			var line=input.getParent('.lineaCopiaCards');
			input.value=line.getElement('.previo').get('text');
			});
		});
	$('replacementGo').addEvent('click',function(e)
		{
		var replaceFrom=$('replaceFrom').value;
		var replaceTo=$('replaceTo').value;
		if (replaceFrom==replaceTo)
			{
			alert('Please set different no null values for replace and with fields');
			}
		else
			{
			var replaceCards=$('replaceCards').checked;
			var replacePorts=$('replacePorts').checked;
			if (!replaceCards && !replacePorts)
				{
				alert ('Please select cards or ports');
				}
			else
				{
				$$('.slotInput').each(function(input)
					{
					var line=input.getParent('.lineaCopiaCards');
					if (((line.hasClass('isCard')||line.hasClass('cardNotToCopy'))&&replaceCards)||((line.hasClass('isPort')||line.hasClass('portNotToCopy'))&&replacePorts))
						{input.value=input.value.replace(new RegExp(replaceFrom, 'g'), replaceTo);}
					});
				}
			}
		});
	}
}

function copyOrNotChanged(el)
{
var line=el.getParent('.lineaCopiaCards');
if (el.checked)
	{
	line.removeClass('cardNotToCopy');
	line.addClass('isCard');
	var currentLine=el.getParent('.formLineaCopiaCards');
	var fin=false;
	while (!fin)
		{
		if (currentLine.getNext('.formLineaCopiaCards'))
			{
			currentLine=currentLine.getNext('.formLineaCopiaCards');
			if (currentLine.getElement('.portNotToCopy'))
				{
				currentLine.getElement('.portNotToCopy').addClass('isPort');
				currentLine.getElement('.portNotToCopy').removeClass('portNotToCopy');
				}
			else
				{
				fin=true;
				}
			}
		else
			{fin=true;}
		}
	}
else
	{
	line.addClass('cardNotToCopy');
	line.removeClass('isCard');
	var currentLine=el.getParent('.formLineaCopiaCards');
	var fin=false;
	while (!fin)
		{
		if (currentLine.getNext('.formLineaCopiaCards'))
			{
			currentLine=currentLine.getNext('.formLineaCopiaCards');
			if (currentLine.getElement('.isPort'))
				{
				currentLine.getElement('.isPort').addClass('portNotToCopy');
				currentLine.getElement('.isPort').removeClass('isPort');
				}
			else
				{
				fin=true;
				}
			}
		else
			{fin=true;}
		}
	}
}

function completeCardMovement()
{
var eqDestination=$('eqDestination').get('idEquipment');
$('cardsWorkingArea').getElements('input[name="Equipment"]').each(function(item)
	{item.value=eqDestination;});
var cardsToMove=$('cardsWorkingArea').getElements('.isCard');
var portsToMove=$('cardsWorkingArea').getElements('.isPort');
$('movingCardsMessage').removeClass('oculto');
$('movingCardsMessage').set('totalCards',cardsToMove.length);
$('movingCardsMessage').set('totalPorts',portsToMove.length);
$('movingCardsMessage').set('html','Card copy/movements completed: <span id="cardsMovementCompleted">0</span> / '+cardsToMove.length+'<br/>Ports copied/updated: <span id="portsUpdated">0</span> / '+portsToMove.length);
	
if ($('moveOrCopyButton').get('text')=='MOVE')
	{
	$('cardsWorkingArea').getElements('.isCard').each(function(item)
		{
		processCardMovement(item);
		});
	$('cardsWorkingArea').getElements('.isPort').each(function(item)
		{
		processCardMovement(item);
		});
	}
else
	{
	$('cardsWorkingArea').getElements('.isCard').each(function(item)
		{
		var form=item.getParent('form');
		form.set('action','ajax/completeCopy.php');
		var req=new Form.Request(form,form.getElement('.mensaje') , {
			resetForm:false,
			extraData:{'SerialNumber':'','AssetTag':'','SerialStatus':'0','Status':'IN SERVICE'},
			onSuccess: function(target,texto,textoXML) 
				{ 
				//manage a possible error
				var newCardId=target.getElement('.newId').get('text');
				var currentLine=target.getParent('.formLineaCopiaCards');
				var fin=false;
				while (!fin)
					{
					if (currentLine.getNext('.formLineaCopiaCards'))
						{
						currentLine=currentLine.getNext('.formLineaCopiaCards');
						if (currentLine.getElement('.isPort'))
							{
							new Element('input',{'class':'oculto','name':'newCardId','type':'text','value':newCardId}).inject(currentLine.getElement('.isPort'));
							}
						else
							{
							fin=true;
							}
						}
					else
						{fin=true;}
					}
				var total=$('movingCardsMessage').get('totalCards')*1;
				var current=($('cardsMovementCompleted').get('text')*1)+1;
				$('cardsMovementCompleted').set('text',current);
				if (total==current)
					{
					if (($('movingCardsMessage').get('totalPorts')*1) ==0)
						{cardsMovementIsCompleted()}
					else	
						{updatePortsAfterCopy();}
					}
				}
			});
		req.send();	
		
		});
	}
}

function updatePortsAfterCopy()
{
$('cardsWorkingArea').getElements('.isPort').each(function(item)
	{
	processCardMovement(item);
	});
}

function processCardMovement(item)
{
var form=item.getParent('form');
var req=new Form.Request(form,form.getElement('.mensaje') , {
	resetForm:false
	});
req.send();	
}

function cardMovementCompleted(tabla,id)
{
if (tabla=='Cards')
	{
	var total=$('movingCardsMessage').get('totalCards')*1;
	var current=($('cardsMovementCompleted').get('text')*1)+1;
	$('cardsMovementCompleted').set('text',current);
	if (total==current && $('movingCardsMessage').get('totalPorts')==$('portsUpdated').get('text'))
		{cardsMovementIsCompleted();}
	}
else
	{
	var total=$('movingCardsMessage').get('totalPorts')*1;
	var current=($('portsUpdated').get('text')*1)+1;
	$('portsUpdated').set('text',current);
	if (total==current && $('movingCardsMessage').get('totalCards')==$('cardsMovementCompleted').get('text'))
		{cardsMovementIsCompleted();}
	}
}

function cardsMovementIsCompleted()
{
window.setTimeout(function(){$('movingCardsMessage').set('text','Now redirecting to the equipment...');},1000);
window.setTimeout(function(){window.location='equipment.php?id='+$('eqDestination').get('idEquipment');},3000);
}

/*var slotSeparators=new Array('-','/');

function trySlotSeparators(slotName)
{
var i=0;

}*/

function slotInPort(slot,port)
{
var res=false;
var separator='';
if (slot.indexOf('-')>-1 && port.indexOf('-')>-1)
	{
	separator='-';
	}
else
	{
	if (slot.indexOf('/')>-1 && port.indexOf('/')>-1)
		{
		separator='/';
		}
	}
if (separator!='')
	{
	var allSame=true;
	var valSlot=slot.split(separator);
	var valPort=port.split(separator);
	if (valPort.length>=valSlot.length && valSlot.length>1)
		{
		var i=0;
		valSlot.each(function(value)
			{
			if (isStrictNumber(value) && isStrictNumber(valPort[i]))
				{
				if (value*1 != valPort[i]*1)
					{
					allSame=false;
					}
				}
			i++;
			});
		res=allSame;
		}
	}
return res;
}


function corregirSlots(el)
{
var valor=el.value;
var linea=el.getParent('.formLineaCopiaCards');
var anterior=linea.getElement('.previo').get('text');
var valores=new Array();
var separator='';
if (anterior.indexOf('-')>-1)
	{
	valores=anterior.split('-');
	separator='-';
	}
else
	{
	if (anterior.indexOf('/')>-1)
		{
		valores=anterior.split('/');
		separator='/';
		}
	}
if (valores.length==0)
	{
	if (parseInt(anterior)!=NaN)
		{
		valores[0]=parseInt(anterior);
		}
	}
var toChange=new Array();
var valuesToChange=new Array();
if (valores.length>0)	
	{
	var nuevosValores=valor.split(separator);
	if (nuevosValores.length==valores.length)
		{
		var i=0;
		var j=0;
		while (i<valores.length)
			{
			if (valores[i]!=nuevosValores[i])
				{
				toChange[j]=i;
				valuesToChange[j]=nuevosValores[i];
				j++;
				}
			i++;
			}
		var currentLine=linea;
		if (toChange.length>0)
			{
			while (currentLine.getNext('.formLineaCopiaCards'))
				{
				currentLine=currentLine.getNext('.formLineaCopiaCards');
				var anterior=currentLine.getElement('.previo').get('text').split(separator);
				if (anterior.length>toChange[toChange.length-1])
					{
					var i=0;
					while (i<toChange.length)
						{
						var suffix='';
						if (anterior[toChange[i]].indexOf('-RX')>-1)
							{
							suffix='-RX';
							}
						if (anterior[toChange[i]].indexOf('-TX')>-1)
							{
							suffix='-TX';
							}
						if (anterior[toChange[i]].indexOf('-IN')>-1)
							{
							suffix='-IN';
							}
						if (anterior[toChange[i]].indexOf('-OUT')>-1)
							{
							suffix='-OUT';
							}
						anterior[toChange[i]]=valuesToChange[i]+suffix;
						i++;
						}
					currentLine.getElement('.slotInput').value=anterior.join(separator);
					}
				}
			}
		}
	}
	
}

function cardsPrecablingTemplate()
{
var html='<div id="containerNewPrecabling" style="position:absolute;width:100%;height:100%;left:0px;top:0px;"><div id="mensajeNuevaTarjeta" class="oculto"></div>';
html+='<form id="valoresEditablesNewConnection" class="mainForm"><input class="oculto" name="Circuit" value="0"><input class="oculto" name="Customer" value="">';
html+='<div id="newRiserLeft">';
html+='<div class="lineaInputs"><label>Cable Type:</label><div class="grupoInputs"><select name="CableType">';
html+='<option selected="selected" value=""></option>';
cableTypes.each(function(item)
	{
		html+='<option value="'+item+'">'+item+'</option>';
	});
html+='</select></div><div class="clear"></div></div>';
html+='<div class="tituloTabla">Ports:</div><div id="portsToPrecable"></div>';
html+='<br/><div id="continuarNewPrecabling" class="boton botonCrear" style="margin-bottom:20px;">CONTINUE</div>';
html+='<div style="padding-left:5px;margin-top:10px;"><input type="checkbox" id="evolucionConexion">Not real work. Inventory correction.</div>';
html+='</div></form>';//newRiserLeft
html+='<div id="newRiserPortsArea" class="bloqueNewCard oculto" ports="0" fromStarting="0" toStarting="0"><div class="tituloTabla"><span style="padding-right:10px;text-decoration:underline;">From</span>Ports<span style="padding-left:10px;text-decoration:underline;">To</span></div><div id="riserPortsFromArea" style="width:40%;float:left;text-align:right;"></div><div id="riserPortsBetweenArea" style="width:20%;float:left;text-align:center;"></div><div id="riserPortsToArea" style="width:40%;float:left;"></div><div class="clear"></div></div>';
html+='<div id="newRiserNavigationArea" class="bloqueNewCard oculto"><div id="tituloDestRiser" class="tituloTabla">Select destination</div><div id="bloqueNavegacionRiser" class="containerListaNavegacion" tipo="precabling">';
html+='</div><div id="containerDestRiser" class="oculto"><div style="width:100%;margin-top:10px;border-top:1px solid white;padding-top:3px;"><div style="width:20%;float:left;margin-left:1%;"><span id="frontSelectionDestPanel" class="botonLink botonLinkSeleccionado">Front</span></div><div style="width:59%;float:left;"><div class="tituloTabla">Select starting port for the precabling</div></div><div style="width:19%;float:left;text-align:right;"><span id="rearSelectionDestPanel" class="botonLink">Rear</span></div><div class="clear"></div></div>'
html+='<div style="width:100%;margin-top:10px;position:relative;" id="marcoDestPanel"><div class="marcoDestino marcoFront" id="marcoFrontDestPanel" style="position:absolute;width:94%;left:3%;height:98%;top:1%;border:1px solid white;"></div><div class="marcoDestino marcoRear oculto" id="marcoRearDestPanel" style="position:absolute;width:94%;left:3%;height:98%;top:1%;border:1px solid white;"></div></div><div class="oculto" id="infoDestPanel"></div></div><div id="lugarRiserOffset" class="mensaje oculto"></div><div id="finalizarNewRiser" class="boton botonCrear oculto" sideFrom="Dest" fromType="Eq" style="margin-top:5px;margin-bottom:20px;">CREATE CONNECTIONS</div><div style="padding-left:5px;margin-top:10px;"><input type="checkbox" id="maintainCircuitNames">Maintain destination circuit names.</div></div>';
html+='</div>';//containerNewRiser
return html;
}

function cardsWorkingTemplate()
{
var html='<div class="mensaje oculto" id="movingCardsMessage" style="z-index:10;"></div><div id="cardsWorkingNavigationArea" class="unMedio" style="height:98%;top:1%;overflow-y:auto;"><div class="tituloTabla">Select destination</div><div id="bloqueNavegacionCards" class="containerListaNavegacion" tipo="eqChassis"></div></div>';
html+='<div id="cardsWorkingArea" class="unMedio oculto" style="height:98%;top:1%;overflow-y:auto;"><div style="font-size:14px;margin-top:20px;margin-bottom:20px;margin-left:20px;"><span>Selected destination:</span><span id="eqDestination" style="padding-left:10px;font-weight:bold;"></span></div>';
html+='<div style="margin-top:10px;border-bottom:1px solid #ccc;margin-bottom:5px;"><span id="replacementToggle" style="padding-right:20px;" class="botonLink" action="show">show replacement options</span><span id="replacementReset" class="botonLink">reset slots/ports</span></div>';
html+='<div id="replacementBlock" style="padding:10px;margin-bottom:10px;background-color:#777;" class="oculto"><div><span style="padding-right:10px;">Replace</span><input type="text" style="width:100px;" id="replaceFrom"><span style="padding-right:10px;padding-left:20px;">with</span><input style="width:100px;" type="text" id="replaceTo"></div>';
html+='<div margin-bottom:5px;><span style="padding-right:10px;">Cards:</span><input type="checkbox" id="replaceCards" checked><span style="padding-right:10px;padding-left:20px;">Ports:</span><input type="checkbox" id="replacePorts" checked><span id="replacementGo" style="padding-left:20px;" class="botonLink">replace</span></div></div>';
html+='<div id="tituloCopiarTarjetas" class="tituloTabla">Cards to be moved/copied</div><div id="bloqueWorkingCards"></div>';
html+='</div>';
html+='<div class="clear"></div>';
return html;
}

function checkDuplicatedSlots()
{
//check for duplicated slots, too slow, needs to be improved
/*
$('Cards').getElements('.botonBorrar').each(function(item){item.destroy();});
$('Cards').getElements('.lineaDatos').each(function(item)
	{
	var currentSlot=getValorLinea(item,'Slot');
	var currentLine=item.get('linea');
	var duplicated=false;
	$('Cards').getElements('.lineaDatos').each(function(checkLine)
		{
		if (getValorLinea(checkLine,'Slot')==currentSlot && checkLine.get('linea')!=currentLine)
			{duplicated=true;}
		});
	if (duplicated)
		{
		var deleteButton=new Element('div',{'class':'botonBorrar','title':'delete (duplicated)'}).inject(item.getElement('.clear'),'before');
		deleteButton.addEvent('click',function(e){deleteOneCard(e.target);});
		}
	});*/
}

function deleteOneCard(el)
{
var idCard=el.getParent('.lineaDatos').get('linea');
if (confirm('Are you sure to deinstall this card?'))
	{
	$('cardContainer').empty();
	var contenedor=new Element('div',{'id':'mensajeBorradoTarjeta','class':'mensaje', 'style':'margin-top:30px;'}).inject($('cardContainer'));
	var espacio2=new Element('div').inject(contenedor);
	espacio2.load('ajax/removeCard.php?module=0&id='+idCard);
	}
}

function removeCard(idCard)
{
var modulos=new Array();
if ($('layoutEquipment').getElement('.card[idCard="'+idCard+'"]'))
	{
	var tarjeta=$('layoutEquipment').getElement('.card[idCard="'+idCard+'"]');
	modulos=tarjeta.getElements('.module');
	}
if (modulos.length==0)
	{
	if (confirm('Are you sure to deinstall this card?'))
		{
		$('cardContainer').empty();
		var contenedor=new Element('div',{'id':'mensajeBorradoTarjeta','class':'mensaje', 'style':'margin-top:30px;'}).inject($('cardContainer'));
		var espacio2=new Element('div').inject(contenedor);
		espacio2.load('ajax/removeCard.php?module=0&id='+idCard);
		}
	}
else
	{
	if (confirm('Are you sure to deinstall this card and all its modules?'))
		{
		$('cardContainer').empty();
		var contenedor=new Element('div',{'id':'mensajeBorradoTarjeta','class':'mensaje', 'style':'margin-top:30px;'}).inject($('cardContainer'));
		new Element('div',{'id':'deinstalledModules','style':'margin-bottom:20px;','html':'Total modules deinstalled: <span class="numero" total="'+modulos.length+'">0</span>'}).inject(contenedor);
		var espacio2=new Element('div').inject(contenedor);
		modulos.each(function(item)
			{
			var temp=new Element('div',{'class':'mensajesDesinstalar oculto'}).inject($('deinstalledModules'),'after');
			temp.load('ajax/removeCard.php?module=1&id='+item.get('idCard'));
			});
		espacio2.load('ajax/removeCard.php?module=0&id='+idCard);
		}
	}
}

function afterRemoveCard(id,module)
{
if (module==0)
	{
	$('Cards').getElement('.lineaDatos[linea="'+id+'"]').destroy();
	$('layoutEquipment').getElements('.card[idCard="'+id+'"]').each(function(item){item.destroy();});
	$$('.edicionTarjeta').addClass('oculto');
	if (!$('deinstalledModules'))
		{
		setTimeout(function(){
		$('mensajeBorradoTarjeta').destroy();},3000);
		}
	}
else
	{	
	$('Cards').getElement('.lineaDatos[linea="'+id+'"]').destroy();
	$('layoutEquipment').getElements('.card[idCard="'+id+'"]').each(function(item){item.destroy();});
	var numero=$('deinstalledModules').getElement('span');
	var total=numero.get('total')*1;
	var current=numero.get('text')*1;
	current++;
	numero.set('text',current);
	if (total==current)
		{
		setTimeout(function(){
			$('mensajeBorradoTarjeta').destroy();},3000);
		}
	}
checkDuplicatedSlots();
}
			
function iniciarNewCard()
{
$('layoutEquipment').getElements('.slot').each(function(slot)
	{
	if (!slot.hasClass('slotOcupado'))
		{
		var slotName=slot.get('slot');
		var slotName = slotName.replace(/_/g,"-");
		var slotName = slotName.replace(/\^/g,"");
		var slotName = slotName.replace(/\$/g,"");
		var slotName = slotName.replace(/\+/g,"");
		if (slotName.search("[0-9]")!=-1)
			{
			var chassisName=$('eqInfo').getElement('.datos[campo="SystemName"]').get('text');
			var puntos=chassisName.split('.');
			var rayas=puntos[puntos.length-1].split('-');
			var slotName = slotName.replace("[0-9]",rayas[rayas.length-1]);
			}
		
		var nuevoSlot=new Element('div',{'class':'slotDisponible botonLink','text':slotName,'style':'color:yellow!important'}).inject($('listaSlotsLibres'));
		}
	$$('.slotDisponible').each(function(item)
		{
		item.addEvent('click',function(e){
			$('formSlotNewCard').getElement('input').value=item.get('text');
			if ($('formValuesNewCard')){generarPuertos();}
			});
		});
	});
	
	$('formSlotNewCard').getElement('input').addEvent('change',function()
		{
		if ($('formValuesNewCard'))
			{generarPuertos();}
		});
	
	$('botonSaveNewCard').addEvent('click',function(e)
		{
		if ($('formSlotNewCard').getElement('input').value=='')
			{
			alert('Please fill the slot information');
			}
		else
			{
			$('nuevoCards').getElement('input[name="Equipment"]').value=$('formularioFinal').get('idEq');
			var serial=$('formSerialsNewCard').getElement('input[name="SerialNumber"]').value;
			var asset=$('formSerialsNewCard').getElement('input[name="AssetTag"]').value;
			$('nuevoCards').getElement('input[name="SerialNumber"]').value=serial;
			$('nuevoCards').getElement('input[name="AssetTag"]').value=asset;
			if (asset!='' && serial!='')
				{
				$('nuevoCards').getElement('input[name="SerialStatus"]').value=5;
				}
			else
				{
				$('nuevoCards').getElement('input[name="SerialStatus"]').value=0;
				}
			$('nuevoCards').getElement('input[name="Slot"]').value=$('formSlotNewCard').getElement('input[name="Slot"]').value;
			$('nuevoCards').getElement('input[name="Name"]').value=$('formValuesNewCard').getElement('.datos[campo="Name"]').get('text');
			$('nuevoCards').getElement('input[name="PartNumber"]').value=$('formValuesNewCard').getElement('.datos[campo="PartNumber"]').get('text');
			$('nuevoCards').getElement('input[name="Vendor"]').value=$('formValuesNewCard').getElement('.datos[campo="Vendor"]').get('text');
			$('nuevoCards').getElement('input[name="Description"]').value=$('formValuesNewCard').getElement('.datos[campo="Description"]').get('text');
			$('mensajeNuevaTarjeta').removeClass('oculto');
			var formResult=new Element('div',{'id':'mensajeNuevaTarjetaIn','class':'mensaje'}).inject($('mensajeNuevaTarjeta'));
			var req=new Form.Request($('nuevoCards'),formResult , {
				
				onSuccess: function(target,texto,textoXML) {
				
				var nuevaLinea=$('tablaNuevaCard').getElement('.lineaDatos');
				var nuevoId=nuevaLinea.get('linea');
				nuevaLinea.inject($('Cards'),'top');
				tablaToLista(nuevaLinea);
				if (nuevaLinea.getElement('.datos[campo="Name"]'))
					{
					var celda=nuevaLinea.getElement('.datos[campo="Name"]');
					celda.addClass('botonLink');
					celda.addEvent('click',function(e){var linea=e.target.getParent('.lineaDatos');tarjetaSeleccionada(linea.get('linea'));});
					}
				if ($('Cards').hasClass('oculto'))
					{situarTarjeta(nuevaLinea,'layoutEquipment');}
				//cargar todos los puertos
				$('formularioPuertoFinal').set('idCard',nuevoId);
				crearSiguientePuerto();
				
				}
				
				}).send();
			}
			
		});
}

function crearSiguientePuerto()
{
var puerto=$('formularioPuertoFinal').get('idPuerto');
var fin=false;
var linea;
if (puerto=='-1')
	{
	if ($('newPortList').getFirst('.lineaDatos'))
		{linea=$('newPortList').getFirst('.lineaDatos');}
	else
		{fin=true;}
	}
else
	{
	linea=$('newPortList').getElement('.lineaDatos[num="'+puerto+'"]');
	if (linea.getNext('.lineaDatos'))
		{
		linea=linea.getNext('.lineaDatos');
		}
	else
		{
		fin=true;
		}
	}
if (fin)
	{
	tarjetaSeleccionada($('Cards').getFirst('.lineaDatos').get('linea'));
	setTimeout(function(){$$('.popUpElement').addClass('oculto');},3000);
	}
else
	{
	$('nuevoEqPorts').getElement('input[name="Card"]').value=$('formularioPuertoFinal').get('idCard');
	$('nuevoEqPorts').getElement('input[name="SystemName"]').value=linea.getElement('.celda[campo="SystemName"]').getElement('input').value;
	$('formularioPuertoFinal').set('idPuerto',linea.get('num'));
	$('nuevoEqPorts').getElement('input[name="Type"]').value=getValorLinea(linea,'Type');
	$('nuevoEqPorts').getElement('input[name="Connector"]').value=getValorLinea(linea,'Connector');
	$('nuevoEqPorts').getElement('input[name="Bandwidth"]').value=getValorLinea(linea,'Bandwidth');
	if ($('mensajeNuevoPuertoIn'))
		{new Element('div',{'text':$('mensajeNuevoPuertoIn').get('text')}).inject($('mensajeNuevoPuertoIn'),'before');}
	else
		{new Element('div',{'id':'mensajeNuevoPuertoIn'}).inject($('mensajeNuevaTarjetaIn'));}
	var req=new Form.Request($('nuevoEqPorts'),'mensajeNuevoPuertoIn' , {
				
		onSuccess: function(target,texto,textoXML) {
		crearSiguientePuerto();
		}
		
		}).send();
	}
}

function iniciarNewEquipment()
{
$('seleccionTipo').getElements('input[type="radio"]').addEvent('click',function(e){
	if (getRadioValue($('seleccionTipo'),'System')=='NO')
		{
		$('seleccionTipo').getElement('.systemNameInput').removeClass('oculto');
		}
	else
		{
		$('seleccionTipo').getElement('.systemNameInput').addClass('oculto');
		$('seleccionTipo').getElement('.systemNameInput').getElement('input').value="";
		}
	});

$('botonSaveNewEquipment').addEvent('click',function(e)
	{
	$('valoresEditablesNewEq').getElement('input[name="Vendor"]').value=$('formValuesNewEquipment').getElement('.datos[campo="Vendor"]').get('text');
	$('valoresEditablesNewEq').getElement('input[name="Model"]').value=$('formValuesNewEquipment').getElement('.datos[campo="Model"]').get('text');
	$('valoresEditablesNewEq').getElement('input[name="Type"]').value=$('formValuesNewEquipment').getElement('.datos[campo="Type"]').get('text');
	$('valoresEditablesNewEq').getElement('input[name="System"]').value=getRadioValue($('seleccionTipo'),'System');
	$('valoresEditablesNewEq').getElement('input[name="SystemName"]').value=$('seleccionTipo').getElement('.systemNameInput').getElement('input').value
	
	$('mensajeNuevaTarjeta').removeClass('oculto');
	var formResult=new Element('div',{'id':'mensajeNuevoEq','class':'mensaje'}).inject($('mensajeNuevaTarjeta'));
	var req=new Form.Request($('valoresEditablesNewEq'),formResult , {
				
			onSuccess: function(target,texto,textoXML) {
			
			setTimeout(function(){window.location="equipment.php?id="+$('mensajeNuevoEq').getElement('.newId').get('text');},3000); 
					
			}
			
			}).send();
	
	
	});

}

function eqVendorSelected()
{
var vendor=$('selectVendor').options[$('selectVendor').selectedIndex].text;
$('selectEqModel').load('ajax/modelosEquipo.php?vendor='+vendor);
}

function eqModelSelected()
{
var model=$('selectEqModel').options[$('selectEqModel').selectedIndex].text;
newValores.load('ajax/valoresEquipo.php?model='+model);
}

function generarPuertos()
{
var part=$('formValuesNewCard').getElement('.datos[campo="PartNumber"]').get('text');
$('newListaPuertos').load('ajax/valoresPuertos.php?part='+part);
$('botonSaveNewCard').removeClass('oculto');
}

function corregirPuertos()
{
$('newPortList').getElements('.celda[campo="SystemName"]').each(function(item)
	{
	var slot=$('formSlotNewCard').getElement('input').value;
	var puerto=item.getFirst('.valor').get('text');
	var slotSplitted=slot.split('-');
	var puertoSplitted=puerto.split('-');
	if (puertoSplitted.length>1)
		{
		var nuevoPuerto='';
		var i=0;
		while (i<puertoSplitted.length)
			{
			if (i<slotSplitted.length)
				{
				nuevoPuerto+=slotSplitted[i]+'-';
				}
			else
				{
				nuevoPuerto+=puertoSplitted[i]+'-';
				}
			i++;
			}
		nuevoPuerto=nuevoPuerto.substring(0,(nuevoPuerto.length-1));
		item.getFirst('.valor').set('text',nuevoPuerto);
		}
	else
		{
		nuevoPuerto=puerto;
		}
	new Element('input',{'type':'text','value':nuevoPuerto}).inject(item.getFirst('.valor'),'after');
	item.getFirst('.valor').addClass('oculto');
	});
}

function copyEqPort(el)
{
var idCard=$('tarjetaSeleccionada').get('idCard');
var puerto=el.getParent('.lineaDatos').get('linea');
$('cardContainer').empty();
$('cardContainer').set('text','Reloading...');
$('cardContainer').load('ajax/copyEqPort.php?id='+puerto+'&idCard='+idCard);
}

//for equipment ports
function showPortTools(e)
{
var posCursor=e.page;
$('cuadroInfo').empty();
$('cuadroInfo').removeClass('oculto');
$('cuadroInfo').setStyle('width','400px');
$('cuadroInfo').setStyle('height','275px');
$('cuadroInfo').setStyle('left',(posCursor.x-150)+'px');
$('cuadroInfo').setStyle('top',(posCursor.y-100)+'px');
addCloseInfoWindow();
var el=e.target;
var linea=el.getParent('.lineaDatos');
var tabla=linea.getParent('.tablaDiv');
var toolsLine=new Element('div',{'class':'toolsLine','style':'width:100%;margin-bottom:10px'}).inject($('cuadroInfo'));
var grouped=lineIsGrouped(linea);
toolsLine.set('tabla',tabla.get('id'));
var ports=linea.get('linea');
if (grouped)
	{
	ports+=','+linea.getNext('.lineaDatos').get('linea');
	}
toolsLine.set('linea',ports);
var deleteButton=new Element('div',{'class':'boton botonBorrar conTip','style':'margin-right:20px;margin-left:60px;','title':'delete port'}).inject(toolsLine);
	deleteButton.addEvent('click',function(e){
		var toolsLine=e.target.getParent('.toolsLine');
		var ports=toolsLine.get('linea').split(',');
		ports.each(function(port)
			{borrarLinea($(toolsLine.get('tabla')).getElement('.lineaDatos[linea="'+port+'"]').getElement('div'));});
		$('cuadroInfo').addClass('oculto');
		$('cuadroInfo').empty();
		});
var nombre=getValorLinea(linea,'Name');
if (!grouped && (((nombre.indexOf('TX')==-1) && (nombre.indexOf('RX')==-1)) || ((nombre.indexOf('IN')==-1) && (nombre.indexOf('OUT')==-1))))
	{
	var botonDuplicar=new Element('div',{'class':'boton botonDuplicar conTip','style':'float:left;width:20px!important;margin-right:20px;','title':'duplicate port'}).inject(toolsLine);
	botonDuplicar.addEvent('click',function(e){
		var toolsLine=e.target.getParent('.toolsLine');
		duplicarPuerto($(toolsLine.get('tabla')).getElement('.lineaDatos[linea="'+toolsLine.get('linea')+'"]').getElement('div'));
		$('cuadroInfo').addClass('oculto');
		$('cuadroInfo').empty();});
	}
var fieldsUpdate='Media,Connector,Bandwidth,BandwidthValue,Bandwidth_Unit,Function';
	if (!grouped)
	{
	fieldsUpdate='Description,Media,Connector,Bandwidth,BandwidthValue,Bandwidth_Unit,Function';
	var copyPortButton=new Element('div',{'class':'boton botonLink','style':'color:yellow!important;float:left;width:30px!important;margin-right:20px;','text':'copy','title':'copy port'}).inject(toolsLine);
	copyPortButton.addEvent('click',function(e){
		var toolsLine=e.target.getParent('.toolsLine');
		copyEqPort($(toolsLine.get('tabla')).getElement('.lineaDatos[linea="'+toolsLine.get('linea')+'"]').getElement('div'));
		$('cuadroInfo').addClass('oculto');
		$('cuadroInfo').empty();});
	new Element('div',{'class':'clear'}).inject(toolsLine);
	var formContainer=new Element('div',{'style':'border-top:1px solid white;margin-top:10px;padding-top:10px;'}).inject(toolsLine);
	createSeparateForm(tabla.get('id'),'EqPorts',ports,fieldsUpdate,formContainer);	
	var submit=formContainer.getElement('.botonSubmit');
	new Element('div',{'html':'<input type="checkbox" name="eqPortExtension" value="Yes">Extend to all similar ports'}).inject(submit,'before');
	}


}
