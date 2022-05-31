/*!
 * labels.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 labels.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

function getMissingLabels(table,id)
{
$('networkReportResultsArea').load('ajax/getReportResults.php?type=predefined&mode=table&elementType=missingLabels&table='+table+'&id='+id);
}

function circuitLabels(table)
{

}

function panelLabelsFront(table)
{
panelLabels(table,'Front');
}

function panelLabelsRear(table)
{
panelLabels(table,'Rear');
}

function panelLabels(table,side)
{
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
$('popUp').load('ajax/labelsTemplates.php?type=PANEL&table='+table+'&side='+side);

}

function continuePanelLabels(table,side)
{
$$('.exportLabels').addEvent('click',function(e){exportLabels(e.target);});
var puertosCard=$(table).getElements('.lineaDatos');
puertosCard.each(function(lineaPuerto)
	{
	var connection=getValorLinea(lineaPuerto,side+'Connection').trim();
	if (connection!='0' && connection!='' && !lineaPuerto.hasClass('oculto'))
		{
		var lineaCopia=new Element('div',{'class':'lineaLabelCards isPort','labelStatus':getValorLinea(lineaPuerto,'Label'+side),'side':side,'idPort':lineaPuerto.get('linea'),'style':'margin-left:3%;font-size:11px;margin-top:10px;','linea':lineaPuerto.get('linea')}).inject($('portsToLabel'));
		new Element('div',{'style':'float:left;width:10%;margin-right:1%;','html':'<input type="checkbox" class="labelOrNot" checked>'}).inject(lineaCopia);
		var value=lineaPuerto.get('nombrePuerto');
		if (lineaPuerto.getElement('.portGroup'))
			{
			value+=lineaPuerto.getElement('.portGroup').get('text');
			}
		new Element('div',{'class':'portName','style':'float:left;width:80%;margin-right:3%;','text':value}).inject(lineaCopia);
		new Element('div',{'class':'clear'}).inject(lineaCopia);
		}
	});
$('goLabels').addEvent('click',function(e){showPanelLabels(e.target);});
}

function continueCardLabels(table)
{
$$('.exportLabels').addEvent('click',function(e){exportLabels(e.target);});
var puertosCard=$(table).getElements('.lineaDatos');
puertosCard.each(function(lineaPuerto)
	{
	if (lineaPuerto.getElement('.portCONNECTED') && !lineaPuerto.hasClass('hiddenGrouped'))
		{
		var lineaCopia=new Element('div',{'class':'lineaLabelCards isPort','labelStatus':getValorLinea(lineaPuerto,'LabelDest'),'idCard':lineaPuerto.get('idCard'),'idPort':lineaPuerto.get('linea'),'style':'margin-left:3%;font-size:11px;margin-top:10px;','linea':lineaPuerto.get('linea')}).inject($('portsToLabel'));
		new Element('div',{'style':'float:left;width:10%;margin-right:1%;','html':'<input type="checkbox" class="labelOrNot" checked>'}).inject(lineaCopia);
		var value=lineaPuerto.get('nombrePuerto');
		if (lineaPuerto.getElement('.portGroup'))
			{
			value+=lineaPuerto.getElement('.portGroup').get('text');
			}
		new Element('div',{'class':'portName','style':'float:left;width:80%;margin-right:3%;','text':value}).inject(lineaCopia);
		new Element('div',{'class':'clear'}).inject(lineaCopia);
		}
	});
$('goLabels').addEvent('click',function(e){showCardLabels(e.target);});
}

function labelFilterPorts(radio)
{
if (radio.value=='All')
	{
	$('portsToLabel').getElements('.isPort').each(function(port)
		{
		port.getElement('.labelOrNot').checked=true;
		});
	}
else
	{
	$('portsToLabel').getElements('.isPort').each(function(port)
		{
		var labelStatus=port.get('labelStatus');
		if (labelStatus=='Miss' || labelStatus=='Wrong')
			{port.getElement('.labelOrNot').checked=true;}
		else
			{port.getElement('.labelOrNot').checked=false;}
		});
	}
}

function cardLabels(table)
{
$('popUp').empty();
$$('.popUpElement').removeClass('oculto');
$('popUp').load('ajax/labelsTemplates.php?type=EQ&table='+table);

}

function exportLabels(el)
{
var table=el.getNext('table');
var formulario=new Element('form',{'class':'oculto','method':'post'}).inject(table,'after');
formulario.set('action','ajax/tableAsCSV.php');
var area=new Element('textarea',{'name':'texto'}).inject(formulario);
area.value=table.getElement('tbody').get('html');
var area=new Element('textarea',{'name':'isHtmlTable'}).inject(formulario);
area.value='YES';
formulario.submit();
formulario.destroy();
}

function showCardLabels(el)
{
var labelGroups=new Array('','','');
$$('.labelsTable').getElement('tbody').empty();
var form=el.getParent('form');
var eqNameOption=getSelectValue(form,'eqName');
var eqName='';
if (eqNameOption=='AUTO')
	{
	if ($('eqInfo').getElement('.referencesBlock'))
		{
		var block=$('eqInfo').getElement('.referencesBlock');
		var found=false;
		block.getElements('.celda[campo="Type"]').each(function(item)
			{
			if (item.getElement('.valor'))
				{
				if (item.getElement('.valor').get('text')=='LABEL')
					{
					found=true;
					eqName=item.getNext('.celda').getElement('.valor').get('text');
					}
				}
			});
		
		if (!found)
			{
			eqName=$('eqInfo').getElement('.datos[campo="Name"]').get('text');
			var temp=$('eqInfo').getElement('.datos[campo="TID"]').get('text');
			if (temp.length<eqName.lenght && temp.trim()!='')
				{
				eqName=temp;
				}
			}
		}
	}
else
	{
	if (eqNameOption!='No')
		{
		eqName=$('eqInfo').getElement('.datos[campo="'+eqNameOption+'"]').get('text');
		}
	}
var includeSlot=getSelectValue(form,'includeSlot');
var firstPort=true;
var twoLines=getSelectValue(form,'twoLines');
//consider circuit and customer
if (twoLines=='Yes')
	{twoLines=true;}
else
	{
	if (twoLines=='No')
		{twoLines=false;}
	else
		{
		if (eqName.length>20)
			{twoLines=true;}
		else
			{twoLines=false;}
		}
	}
var fromString='';
var toString='';
var fromTo=getSelectValue(form,'fromTo');
if (fromTo!='No')
	{
	var arr=fromTo.split('/');
	fromString=arr[0];
	toString=arr[1];
	}
var duplicate=getSelectValue(form,'duplicate');
var hidetxrx=getSelectValue(form,'hidetxrx')=='Yes';
var showCircuits=getSelectValue(form,'showCircuits')=='Yes';
$('portsToLabel').getElements('.isPort').each(function(port)
	{
	if (port.getElement('.labelOrNot').checked)
		{
		if (firstPort)
			{
			if (includeSlot=='Yes')
				{includeSlot=true;}
			else
				{
				if (includeSlot=='No')
					{includeSlot=false;}
				else
					{
					var slot=getValorLinea($('Cards').getElement('.lineaDatos[linea="'+port.get('idCard')+'"]'),'Slot');
					includeSlot=!slotInPort(slot,port.getElement('.portName').get('text'));
					}
				}
			firstPort=false;
			}

		var slot='';
		if (includeSlot)
			{slot=getValorLinea($('Cards').getElement('.lineaDatos[linea="'+port.get('idCard')+'"]'),'Slot')+' ';}
		var lineSeparator='';
		if (twoLines)
			{
			lineSeparator='<br/>';
			}
		var origin=eqName+' '+lineSeparator+slot+port.getElement('.portName').get('text').replace(' / ','/');
		var idPort=port.get('idPort');
		var linePort=$('cardContainer').getElement('.cardRight').getElement('.tablaPuertos').getElement('.lineaDatos[linea="'+idPort+'"]');
		var destination=getVisibleContent(linePort.getElement('.celda[campo="DestConnection"]'),'text',' ').replace('/ ','/').replace(' /','/');
		if (hidetxrx)
			{
			origin=origin.replace("  ",' ');
			origin=origin.replace("-TX / RX",'');
			origin=origin.replace("-RX / TX",'');
			origin=origin.replace("-TX/RX",'');
			origin=origin.replace("-RX/TX",'');
			origin=origin.replace("RX / TX",'');
			origin=origin.replace("TX / RX",'');
			origin=origin.replace("-IN / OUT",'');
			origin=origin.replace("-OUT / IN",'');
			origin=origin.replace("-IN/OUT",'');
			origin=origin.replace("-OUT/IN",'');
			origin=origin.replace("OUT / IN",'');
			origin=origin.replace("IN / OUT",'');
			destination=destination.replace("  ",' ');
			destination=destination.replace("-TX/RX",'');
			destination=destination.replace("-RX/TX",'');
			destination=destination.replace("RX/TX",'');
			destination=destination.replace("TX/RX",'');
			destination=destination.replace("-OUT/IN",'');
			destination=destination.replace("-IN/OUT",'');
			destination=destination.replace("IN/OUT",'');
			destination=destination.replace("OUT/IN",'');
			}
		var circuitSeparator=' ';
		var circuitText='';
		if (!twoLines)
			{
			circuitSeparator='<br/>';
			}
		if (showCircuits && linePort.getElement('.celda[campo="CircuitDest"]').getElement('.circuitLink'))
			{
			var circRef=getVisibleContent(linePort.getElement('.celda[campo="CircuitDest"]').getElement('.circuitLink'),'text',' ').trim();
			var custRef=getVisibleContent(linePort.getElement('.celda[campo="CircuitDest"]').getElement('.spanCustomer'),'text','').trim();
			if (custRef=='')
				{
				var valores=circRef.split('/');
				if (valores.length>3)
					{//for FLRs
					circRef=valores[0]+'/'+valores[1]+'/'+circuitSeparator;
					var i=2;
					while (i<valores.length)
						{
						circRef+=valores[i]+'/';
						i++;
						}
					circRef=circRef.substring(0,circRef.length-1);
					}
				circuitText='<br/>'+circRef;
				}
			else
				{
				circuitText='<br/>'+circRef+circuitSeparator+custRef;
				}
			}
		var labelText=fromString+origin + '<br/>'+toString + destination+circuitText;
		var labelLines=labelText.split('<br/>');
		var htmlLabel='';
		var count=0;
		labelLines.each(function(line)
			{
			htmlLabel+='<tr><td>'+line+'</td></tr>';
			count++;
			});
		labelGroups[count-2]=labelGroups[count-2]+htmlLabel;
		if (duplicate!='No')
			{
			var labelText='';
			if (duplicate=='Reverse')
				{labelText=fromString+destination + "<br/>"+toString + origin+circuitText;}
			else
				{labelText=fromString+origin + '<br/>'+toString + destination+circuitText;}
			var labelLines=labelText.split('<br/>');
			var htmlLabel='';
			var count=0;
			labelLines.each(function(line)
				{
				htmlLabel+='<tr><td>'+line+'</td></tr>';
				count++;
				});
			labelGroups[count-2]=labelGroups[count-2]+htmlLabel;
			}
		}
	});
$('labels2lines').getElement('tbody').set('html',labelGroups[0]);
$('labels3lines').getElement('tbody').set('html',labelGroups[1]);
$('labels4lines').getElement('tbody').set('html',labelGroups[2]);
adjustLabelTables();
}

function adjustLabelTables()
{
/*
var lines=new Array();
lines[0]=2;
lines[1]=3;
lines[2]=4;
lines.each(function(number)
	{
	$('labels'+number+'lines').getElement('tbody').getElement('tr').getElement('td').addClass('labelFirstLine');
	var i=1;
	$('labels'+number+'lines').getElement('tbody').getElements('tr').each(function(line)
		{
		if (i%number==0)
			{
			line.getElement('td').addClass('labelEndLine');
			}
		i++;
		});
	});
*/
}


function showPanelLabels(el)
{
var labelGroups=new Array('','','');
$$('.labelsTable').getElement('tbody').empty();
var form=el.getParent('form');

var panelName=$('panelInfo').getElement('.datos[campo="Name"]').get('text');

if ($('panelInfo').getElement('.referencesBlock'))
	{
	var block=$('panelInfo').getElement('.referencesBlock');
	var found=false;
	block.getElements('.celda[campo="Type"]').each(function(item)
		{
		if (item.getElement('.valor'))
			{
			if (item.getElement('.valor').get('text')=='LABEL')
				{
				found=true;
				panelName=item.getNext('.celda').getElement('.valor').get('text');
				}
			}
		});
	
	if (!found)
		{
		var valores=$('panelInfo').getElement('.datos[campo="SystemName"]').get('text').split('.');
		if (valores.length>4)
			{
			var len=valores.length;
			panelName=valores[len-3]+'.'+valores[len-2]+'.'+valores[len-1];
			}
		}
	}				

var fromString='';
var toString='';
var fromTo=getSelectValue(form,'fromTo');
if (fromTo!='No')
	{
	var arr=fromTo.split('/');
	fromString=arr[0];
	toString=arr[1];
	}
var duplicate=getSelectValue(form,'duplicate');
var hidetxrx=getSelectValue(form,'hidetxrx')=='Yes';
var showCircuits=getSelectValue(form,'showCircuits')=='Yes';
$('portsToLabel').getElements('.isPort').each(function(port)
	{
	if (port.getElement('.labelOrNot').checked)
		{
		var slot='';
		var lineSeparator='';
		var origin=panelName+' '+lineSeparator+port.getElement('.portName').get('text').replace(' / ','/');
		var idPort=port.get('idPort');
		var linePort=$('tablaPuertos').getElement('.lineaDatos[linea="'+idPort+'"]');
		var destination=getVisibleContent(linePort.getElement('.celda[campo="'+port.get('side')+'Connection"]'),'text',' ').replace('/ ','/').replace(' /','/');
		if (hidetxrx)
			{
			origin=origin.replace("  ",' ');
			origin=origin.replace("-TX / RX",'');
			origin=origin.replace("-RX / TX",'');
			origin=origin.replace("-TX/RX",'');
			origin=origin.replace("-RX/TX",'');
			origin=origin.replace("RX / TX",'');
			origin=origin.replace("TX / RX",'');
			origin=origin.replace("-IN / OUT",'');
			origin=origin.replace("-OUT / IN",'');
			origin=origin.replace("-IN/OUT",'');
			origin=origin.replace("-OUT/IN",'');
			origin=origin.replace("OUT / IN",'');
			origin=origin.replace("IN / OUT",'');
			destination=destination.replace("  ",' ');
			destination=destination.replace("-TX/RX",'');
			destination=destination.replace("-RX/TX",'');
			destination=destination.replace("RX/TX",'');
			destination=destination.replace("TX/RX",'');
			destination=destination.replace("-OUT/IN",'');
			destination=destination.replace("-IN/OUT",'');
			destination=destination.replace("IN/OUT",'');
			destination=destination.replace("OUT/IN",'');
			}
		var circuitSeparator='<br/>';
		var circuitText='';
		if (showCircuits && linePort.getElement('.celda[campo="Circuit'+port.get('side')+'"]').getElement('.circuitLink'))
			{
			var circRef=getVisibleContent(linePort.getElement('.celda[campo="Circuit'+port.get('side')+'"]').getElement('.circuitLink'),'text',' ').trim();
			var custRef=getVisibleContent(linePort.getElement('.celda[campo="Circuit'+port.get('side')+'"]').getElement('.spanCustomer'),'text','').trim();
			if (custRef=='')
				{
				var valores=circRef.split('/');
				if (valores.length>3)
					{//for FLRs
					circRef=valores[0]+'/'+valores[1]+'/'+circuitSeparator;
					var i=2;
					while (i<valores.length)
						{
						circRef+=valores[i]+'/';
						i++;
						}
					circRef=circRef.substring(0,circRef.length-1);
					}
				circuitText='<br/>'+circRef;
				}
			else
				{
				circuitText='<br/>'+circRef+circuitSeparator+custRef;
				}
			}
		var labelText=fromString+origin + '<br/>'+toString + destination+circuitText;
		var labelLines=labelText.split('<br/>');
		var htmlLabel='';
		var count=0;
		labelLines.each(function(line)
			{
			htmlLabel+='<tr><td>'+line+'</td></tr>';
			count++;
			});
		labelGroups[count-2]=labelGroups[count-2]+htmlLabel;
		if (duplicate!='No')
			{
			var labelText='';
			if (duplicate=='Reverse')
				{labelText=fromString+destination + "<br/>"+toString + origin+circuitText;}
			else
				{labelText=fromString+origin + '<br/>'+toString + destination+circuitText;}
			var labelLines=labelText.split('<br/>');
			var htmlLabel='';
			var count=0;
			labelLines.each(function(line)
				{
				htmlLabel+='<tr><td>'+line+'</td></tr>';
				count++;
				});
			labelGroups[count-2]=labelGroups[count-2]+htmlLabel;
			}
		}
	});
$('labels2lines').getElement('tbody').set('html',labelGroups[0]);
$('labels3lines').getElement('tbody').set('html',labelGroups[1]);
$('labels4lines').getElement('tbody').set('html',labelGroups[2]);
adjustLabelTables();
}