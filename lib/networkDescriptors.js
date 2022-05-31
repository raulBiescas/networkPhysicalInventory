/*!
 * networkDescriptors.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 networkDescriptors.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

//based on reference names in the way site.floor.room.suite.aisle.bay

function throwNetworkDescriptorEvent(tabla,id)
{
$$('.descriptorRed[tabla="'+tabla+'"][idTabla="'+id+'"]').each(function(item)
	{
	var container=item.getParent('div');
	container.fireEvent('networkDescriptorLoaded', container);
	});
}

function formatearDescriptorTablaPanels(tabla,id)
{
$$('.descriptorRed[tabla="'+tabla+'"][idTabla="'+id+'"]').each(function(item)
	{
	item.getElements('.filaDescriptorRed').each(function(fila)
		{
		switch (fila.get('tabla'))
			{
			case 'Panels':
				if (fila.hasAttribute('defaultLabel'))
					{
					fila.getElement('.descriptorRedSecundario').set('text',fila.get('defaultLabel'));
					}
				else
					{
					var desc=fila.getElement('.descriptorRedSecundario');
					//desc=desc.replace(' ', '.');
					var valores=desc.get('text').split('.');
					if (valores.length>4)
						{
						var len=valores.length;
						var nombre=valores[len-3]+'.'+valores[len-2]+'.'+valores[len-1].substring(0,valores[len-1].length-1);
						desc.set('text',nombre);
						}
					else
						{
						var filaRack=fila.getPrevious('.descriptorRacks');
						if (typeof(rackBase)!='undefined')
							{
							if (filaRack.get('idTabla')!=rackBase)
								{
								filaRack.setStyle('display','block');
								filaRack.getElement('.descriptorRedSecundario').addClass('oculto');
								}
							}
						else
							{
							filaRack.setStyle('display','block');
							filaRack.getElement('.descriptorRedSecundario').addClass('oculto');
							}
						desc.set('text',desc.getPrevious('.descriptorRedPrimario').get('text'));
						}
					}
				break;
			case 'Sites':
				if (typeof(siteBase)!='undefined')
					{
					if ((fila.get('idTabla')*1)==siteBase)
						{
						fila.addClass('oculto');
						}
					}
				break;
			case 'Floors':
				if (typeof(floorBase)!='undefined')
					{
					if ((fila.get('idTabla')*1)==floorBase)
						{
						fila.addClass('oculto');
						}
					}
				break;
			case 'Rooms':
				if (typeof(roomBase)!='undefined')
					{
					if ((fila.get('idTabla')*1)==roomBase)
						{
						fila.addClass('oculto');
						}
					}
				break;
			case 'PanelPorts':
			case 'OffnetPorts':
			case 'EqPorts':
				var tabla=fila.get('tabla');
				var linea=fila.getParent('.lineaDatos');
				var tablaPadre=fila.getParent('.tablaDiv');
				if (tablaPadre.getElement('.botonAgruparPuertos'))
					{
					var claseGrupo='';
					if (tablaPadre.getElement('.botonAgruparPuertos').hasClass('agruparPuertos'))
						{claseGrupo='oculto';}
					if (linea.hasClass('lineaAgrupada2'))
						{
						if (linea.getNext('.lineaDatos'))
							{
							var siguiente=linea.getNext('.lineaDatos');
							if (siguiente.hasClass('oculto'))
								{
								var campo=fila.getParent('.datos').get('campo');
								var siguienteCampo=siguiente.getElement('.datos[campo="'+campo+'"]');
								if (siguienteCampo.getElement('.filaDescriptorRed[tabla="'+tabla+'"]'))
									{
									fila.getElement('.descriptorRedPrimario').getParent().getElements('.valorGrupo2').each(function(el){el.destroy();});
									var valorGrupo=' / '+diferenciaNombres(siguienteCampo.getElement('.filaDescriptorRed[tabla="'+tabla+'"]').getElement('.descriptorRedPrimario').get('text'),fila.getElement('.descriptorRedPrimario').get('text'));
									new Element('span',{'class':'descriptorRedPrimario valorGrupo2 '+claseGrupo,'text':valorGrupo}).inject(fila.getElement('.descriptorRedPrimario'),'after');
									}
								}
							}
						}
					else
						{
						if (linea.getPrevious('.lineaDatos')&&linea.hasClass('oculto'))
							{
							if (linea.getPrevious('.lineaDatos').hasClass('lineaAgrupada2'))
								{
								var previa=linea.getPrevious('.lineaDatos');
								var campo=fila.getParent('.datos').get('campo');
								var campoPrevio=previa.getElement('.datos[campo="'+campo+'"]');
								if (campoPrevio.getElement('.filaDescriptorRed[tabla="'+tabla+'"]'))
									{
									campoPrevio.getElement('.filaDescriptorRed[tabla="'+tabla+'"]').getElement('.descriptorRedPrimario').getParent().getElements('.valorGrupo2').each(function(el){el.destroy();});
									var valorGrupo=' / '+diferenciaNombres(fila.getElement('.descriptorRedPrimario').get('text'),campoPrevio.getElement('.filaDescriptorRed[tabla="'+tabla+'"]').getElement('.descriptorRedPrimario').get('text'));
									new Element('span',{'class':'descriptorRedPrimario valorGrupo2 '+claseGrupo,'text':valorGrupo}).inject(campoPrevio.getElement('.filaDescriptorRed[tabla="'+tabla+'"]').getElement('.descriptorRedPrimario'),'after');
									}
								}
							}
						}
					}
					break;
					
			case 'EqChassis':
				fila.getElement('.descriptorRedSecundario').addClass('oculto');
				if (fila.hasAttribute('defaultLabel'))
					{
					fila.getElement('.descriptorRedPrimario').set('text',fila.get('defaultLabel'));
					}
				break;
			case 'Cards':
				if (fila.getNext('.descriptorEqPorts'))
					{
					var slot=fila.getElement('.descriptorRedPrimario').get('text');
					var port=fila.getNext('.descriptorEqPorts').getElement('.descriptorRedPrimario').get('text');
					if (slotInPort(slot,port))
						{
						fila.getElement('.descriptorRedPrimario').addClass('oculto');
						}
					}
				fila.getElement('.descriptorRedSecundario').addClass('oculto');
				break;
				
			}
		});
	if (item.getParent('.lineaDatos'))
		{ajustarAltura(item.getParent('.lineaDatos'),36,46);}
	});
}
function clearSecondaryDescriptor(fila)
{
var desc=fila.getElement('.descriptorRedSecundario');
var valores=desc.get('text').split('.');
var len=valores.length;
var nombre='';
if (len>0)
	{
	nombre=valores[len-1];
	if (fila.get('tabla')=='Rooms')
		{
		if (len>3)
			{
			nombre=valores[len-2]+'.'+valores[len-1];
			}
		}
	else
		{
		if (fila.get('tabla')=='Racks')
			{
			if (len>3)
				{
				nombre=valores[len-2]+'.'+valores[len-1];
				}
			}
		}
	}
if (nombre!='')
	{
	if (nombre.charAt(0)!='(')
		nombre='('+nombre;
	}
desc.set('text',nombre);
}

function addNetworkInfoButton(fila)
{
var table=fila.get('tabla');
var id=fila.get('idTabla');
if (fila.getElement('a'))
	{
	var detailsButon=new Element('span',{'class':'botonDetallesZoom boton conTip','style':'padding-left:16px;float:none!important;','title':'show map/layout','tabla':table,'idTabla':id}).inject(fila.getElement('a'),'after');
	new Element('span',{'style':'padding-left:15px;'}).inject(fila.getElement('a'),'after');
	detailsButon.addEvent('click',function(e)
		{
		$('popUp').empty();
		$$('.popUpElement').removeClass('oculto');
		var id=e.target.get('idTabla');
		var tabla=e.target.get('tabla');
		
		$('popUp').load(networkLibrary+'ajax/getNetworkDetails.php?tabla='+tabla+'&id='+id+'&general=1');
		});	
	}
}

var clicksGroupNetwork=0;

function loadSimpleNetworkInfo(table,tableField,idField)
{
$(table).getElements('.lineaDatos').each(function(line)
	{
	var container=new Element('div',{'class':'containerCell'}).inject(line.getElement('.celda[campo="'+tableField+'"'),'before');
	container.load('../network/ajax/getSimpleNetworkInfo.php?table='+getValorLinea(line,tableField)+'&id='+getValorLinea(line,idField)+'&tableName='+table);
	});

}

function groupNetworkTable(table,networkField)
{
$(table).getElements('.lineaDatos').each(function(line)
	{
	var networkInfo=getValorLinea(line,networkField);
	var netValues=networkInfo.split('#');
	netValues.each(function(value,index)
		{
		if (value!='')
			{
			var element=value.split('=');
			if (element.length==2)
				{
				if (!$(table).getElement('.lineNetworkGroup.'+element[0]+'[idElement="'+element[1]+'"]'))
					{
					var lineNetwork=new Element('div',{'class':'lineNetworkGroup '+element[0],'index':index,'table':element[0],'idElement':element[1]}).inject(line,'before');
					var lnControl=new Element('div',{'style':'float:left;width:24px;'}).inject(lineNetwork);
					new Element('div',{'style':'float:left;margin-left:30px;','class':'lnEl'}).inject(lineNetwork);
					new Element('div',{'class':'clear'}).inject(lineNetwork);
					var show=new Element('div',{'class':'controlesGrupo botonMostrarGrupo conTip oculto','title':'show (double click for all)'}).inject(lnControl);
					show.addEvent('click',function(e){clickShowNetworkTree(e.target);});
					var hide=new Element('div',{'class':'controlesGrupo botonOcultarGrupo conTip','title':'hide (double click for all)'}).inject(lnControl);
					hide.addEvent('click',function(e){clickHideNetworkTree(e.target);});
					}
				}
			}
		});
	
	});
	
$(table).getElements('.lineNetworkGroup').each(function(line)
	{
	line.getElement('.lnEl').load(networkRelativePath+'ajax/getElementDescription.php?type=single&tabla='+line.get('table')+'&id='+line.get('idElement'));
	});
}

function clickShowNetworkTree(el)
{
clicksGroupNetwork++;
setTimeout(function(){checkShowNetworkTree(el)},300);
}

function checkShowNetworkTree(el)
{
if (clicksGroupNetwork>0)
	{
	if (clicksGroupNetwork==2)
		{showAllNetworkTree(el);}
	else
		{showNetworkTree(el)}
	clicksGroupNetwork=0;
	}
}

function clickHideNetworkTree(el)
{
clicksGroupNetwork++;
setTimeout(function(){checkHideNetworkTree(el)},300);
}

function checkHideNetworkTree(el)
{
if (clicksGroupNetwork>0)
	{
	if (clicksGroupNetwork==2)
		{hideAllNetworkTree(el);}
	else
		{hideNetworkTree(el)}
	clicksGroupNetwork=0;
	}
}

function showAllNetworkTree(el)
{
var currentLine=el.getParent('.lineNetworkGroup');
var currentIndex=currentLine.get('index')*1;
var continueSearch=true;
currentLine.getElement('.botonOcultarGrupo').removeClass('oculto');
currentLine.getElement('.botonMostrarGrupo').addClass('oculto');
while (continueSearch)
	{
	if (currentLine.getNext('div'))
		{
		currentLine=currentLine.getNext('div');
		if (currentLine.hasClass('lineNetworkGroup'))
			{
			if ((currentLine.get('index')*1)>currentIndex)
				{
				currentLine.removeClass('hideGroupingNetwork');
				currentLine.getElement('.botonOcultarGrupo').removeClass('oculto');
				currentLine.getElement('.botonMostrarGrupo').addClass('oculto');
				}
			else
				{
				continueSearch=false;
				}
			}
		else
			{
			if (currentLine.hasClass('lineaDatos'))
				{
				currentLine.removeClass('hideGroupingNetwork');
				}
			else
				{
				continueSearch=false;
				}
			}
			
		}
	else
		{
		continueSearch=false;
		}
	}
}

function hideAllNetworkTree(el)
{
var table=el.getParent('.tablaDiv');
var currentLine=el.getParent('.lineNetworkGroup');
var currentIndex=currentLine.get('index')*1;
table.getElements('.lineNetworkGroup').each(function(line)
	{
	if ((line.get('index')*1)==currentIndex)
		{
		hideNetworkTree(line.getElement('.botonOcultarGrupo'));
		}
	});
}

function showNetworkTree(el)
{
var currentLine=el.getParent('.lineNetworkGroup');
var currentIndex=currentLine.get('index')*1;
currentLine.getElement('.botonOcultarGrupo').removeClass('oculto');
currentLine.getElement('.botonMostrarGrupo').addClass('oculto');
var continueSearch=true;
if (currentLine.getNext('div'))
	{
	currentLine=currentLine.getNext('div');
	if (currentLine.hasClass('lineNetworkGroup'))
		{
		var newIndex=currentLine.get('index');
		currentLine.removeClass('hideGroupingNetwork');
		while (continueSearch)
			{
			if (currentLine.getNext('div'))
				{
				currentLine=currentLine.getNext('div');
				if (currentLine.hasClass('lineNetworkGroup'))
					{
					var indexCompare=currentLine.get('index')*1;
					if (indexCompare==newIndex)
						{
						currentLine.removeClass('hideGroupingNetwork');
						}
					else
						{
						if (indexCompare<newIndex)
							{continueSearch=false;}
						}
					}
				}
			else
				{
				continueSearch=false;
				}
			}
		}
	else
		{
		if (currentLine.hasClass('lineaDatos'))
			{
			currentLine.removeClass('hideGroupingNetwork');
			while (continueSearch)
				{
				if (currentLine.getNext('div'))
					{
					currentLine=currentLine.getNext('div');
					if (currentLine.hasClass('lineaDatos'))
						{
						currentLine.removeClass('hideGroupingNetwork');
						}
					else
						{continueSearch=false;}
					}
				else
					{continueSearch=false;}
				}
			}
		}
		
	}
}

function addFunctionNetworkTree(table,field)
{
//take care with currencies
if ($(table).getElement('.lineaDatos'))
	{
	if ($(table).getElement('.lineaDatos').getElement('.datos[campo="'+field+'"]'))
		{
		var dataLine=$(table).getElement('.lineaDatos').getElement('.datos[campo="'+field+'"]');
		$(table).getElements('.lineNetworkGroup').each(function(item)
			{
			if (item.getElement('.totalsSpace[field="'+field+'"]'))
				{
				item.getElement('.totalsSpace[field="'+field+'"]').getElement('.totals[field="'+field+'"]').set('text','0');
				}
			else
				{
				var totalsSpace=new Element('div',{'style':'padding:left;','class':'totalsSpace','field':field}).inject(item.getElement('.clear'),'before');
				new Element('span',{'style':'padding-left:20px;'}).inject(totalsSpace);
				new Element('span',{'class':'totals','field':field,'text':'0'}).inject(totalsSpace);
				dataLine.getElements('span').each(function(span)
					{
					if (!span.hasClass('valor'))
						{
						span.clone().inject(totalsSpace);
						}
					});
				}
			});
		$(table).getElements('.lineaDatos').each(function(line)
			{
			var parentFound=false;
			var value=getValorLinea(line,field)*1;
			var currentLine=line;
			var parentIndex=0;
			while (!parentFound)
				{
				if (currentLine.getPrevious('div'))
					{
					currentLine=currentLine.getPrevious('div');
					if (currentLine.hasClass('lineNetworkGroup'))
						{
						parentFound=true;
						parentIndex=currentLine.get('index');
						}
					}
				else
					{parentFound=true;}
				}
			var continueAdding=true;
			addTotalNetworkTree(currentLine,field,value);
			while (continueAdding)
				{
				if (currentLine.getPrevious('div'))
					{
					currentLine=currentLine.getPrevious('div');
					if (currentLine.hasClass('lineNetworkGroup'))
						{
						if (currentLine.get('index')*1<parentIndex)
							{
							addTotalNetworkTree(currentLine,field,value);
							parentIndex=currentLine.get('index')*1;
							if (parentIndex==1)
								{
								continueAdding=false;
								}
							}
						}
					}
				else
					{continueAdding=false;}
				}
			});
		}
	}
}

function addTotalNetworkTree(currentLine,field,value)
{
if (currentLine.getElement('.totals[field="'+field+'"]'))
	{
	var total=currentLine.getElement('.totals[field="'+field+'"]');
	var newValue=(limpiarNumero(total.get('text'))*1)+value;
	total.set('text',newValue.decimal(2));
	}
}

function hideNetworkTree(el)
{
var currentLine=el.getParent('.lineNetworkGroup');
var currentIndex=currentLine.get('index')*1;
currentLine.getElement('.botonOcultarGrupo').addClass('oculto');
currentLine.getElement('.botonMostrarGrupo').removeClass('oculto');
var continueSearch=true;
while (continueSearch)
	{
	if (currentLine.getNext('div'))
		{
		currentLine=currentLine.getNext('div');
		if (currentLine.hasClass('lineNetworkGroup'))
			{
			if ((currentLine.get('index')*1)>currentIndex)
				{
				currentLine.addClass('hideGroupingNetwork');
				currentLine.getElement('.botonOcultarGrupo').addClass('oculto');
				currentLine.getElement('.botonMostrarGrupo').removeClass('oculto');
				}
			else
				{
				continueSearch=false;
				}
			}
		else
			{
			if (currentLine.hasClass('lineaDatos'))
				{
				currentLine.addClass('hideGroupingNetwork');
				}
			else
				{
				continueSearch=false;
				}
			}
			
		}
	else
		{
		continueSearch=false;
		}
	}
}