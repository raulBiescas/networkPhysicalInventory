/*!
 * circuits.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 circuits.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */



var circuitsRepository=new Array();
var referencesRepository=new Array();
var customersRepository=new Array();
var circuitsPolling=new Array();
var circuitsWaiting=new Array();

function initCircuitsReport()
{
inicializarTablaDiv('circuitsReportList');
enlazarCeldas('circuitsReportList', 'circuit.php?', 'ReferencesGroup');
addClase('circuitsReportList', 'Type', 'textoPeque');
addClase('circuitsReportList', 'Customer', 'textoPeque');
addClase('circuitsReportList', 'Provider', 'textoPeque');
addClase('circuitsReportList', 'ReferencesGroup', 'textoMedio');
addOrderControl('circuitsReportList', 'Customer');
addOrderControl('circuitsReportList', 'Type');
addOrderControl('circuitsReportList', 'Bandwidth','BandNumeric');
addFilterControl('circuitsReportList', 'Type');
addFilterControl('circuitsReportList', 'Customer');
addFilterControl('circuitsReportList', 'Provider');
$('circuitsReportList').getElements('.lineaDatos').each(function(line)
	{
	var band=line.getElement('.datos[campo="Bandwidth"]');
	var unit=band.getElement('.simbolo').get('text');
	var mult=0;
	switch (unit)
		{
		case 'kbps':mult=1000;break;
		case 'mbps':mult=1000000;break;
		case 'gbps':mult=1000000000;break;
		case 'tbps':mult=1000000000000;break;
		}
	var value=(band.getElement('.valor').get('text')*1)*mult;
	var bcell=new Element('div',{'class':'celda datos oculto','campo':'BandNumeric','tipo':'decimal'}).inject(line.getElement('.clear'),'before');
	new Element('div',{'class':'valor','text':value}).inject(bcell);
	
	});
$$('.totalCircuits').set('text',$('circuitsReportList').getElements('.lineaDatos').length);
$('circuitsIntegrity').addEvent('click',function(){checkCircuitsIntegrity();});
}

function checkCircuitsIntegrity()
{
$$('.circuitsIntegrityResults').destroy();
integrityResults=new Element('div',{'class':'circuitsIntegrityResults','style':'padding-left:5px;margin-bottom:10px;background-color:#ccc;','html':'Checking <span id="checkingCircuitsAmount">0</span> circuits: <span style="color:green"><span id="OKCircuitsAmount">0</span> OK </span> vs <span style="color:yellow"><span id="warningCircuitsAmount">0</span> WARNINGS </span> vs <span style="color:red"><span id="wrongCircuitsAmount">0</span> FAILURES </span>'}).inject($('circuitsIntegrity').getParent('div'),'after')
$$('.circuitResultCell').destroy();
$$('.circuitResultLine').destroy();
new Element('div',{'class':'celda circuitResultCell'}).inject($('circuitsReportList').getElement('.lineaTitulo'),'top');
$('circuitsReportList').getElements('.lineaDatos').each(function(line)
	{
	var resCell=new Element('div',{'class':'celda circuitResultCell'}).inject(line,'top');
	resCell.load('ajax/checkCircuitIntegrity.php?id='+line.get('linea'));
	$('checkingCircuitsAmount').set('text',($('checkingCircuitsAmount').get('text')*1)+1);
	});

}

function circuitResultOK(id)
{
var cell=$('circuitsReportList').getElement('.lineaDatos[linea="'+id+'"]').getElement('.circuitResultCell');
new Element('div',{'class':'inlineIcon OKicon'}).inject(cell);
$('OKCircuitsAmount').set('text',($('OKCircuitsAmount').get('text')*1)+1);
}

function circuitRepairOK(id)
{
var cell=$('circuitsReportList').getElement('.lineaDatos[linea="'+id+'"]').getElement('.circuitResultCell');
cell.empty();
cell.load('ajax/checkCircuitIntegrity.php?id='+id);
$('wrongCircuitsAmount').set('text',($('wrongCircuitsAmount').get('text')*1)-1);
}

function circuitResultFailure(id,failureCode)
{
var cell=$('circuitsReportList').getElement('.lineaDatos[linea="'+id+'"]').getElement('.circuitResultCell');
new Element('div',{'class':'inlineIcon failureIcon'}).inject(cell);
$('wrongCircuitsAmount').set('text',($('wrongCircuitsAmount').get('text')*1)+1);
var line=new Element('div',{'class':'circuitResultLine failureLine','text':failureCode}).inject(cell.getParent('.lineaDatos'),'bottom');
var repair=new Element('div',{'class':'inlineIcon botonConectar boton','idCircuit':id,'title':'try to restore broken connections'}).inject(line);
repair.addEvent('click',function(e){circuitRepair(e.target,'restore');});
var clean=new Element('div',{'class':'inlineIcon botonDesconectar boton','idCircuit':id,'title':'clean broken connections'}).inject(line);
clean.addEvent('click',function(e){circuitRepair(e.target,'clean');});
}

function circuitRepair(el,action)
{
var resultLine=el.getParent('.circuitResultLine');
var mainLine=resultLine.getParent('.lineaDatos');
resultLine.destroy();
var cell=mainLine.getElement('.circuitResultCell');
cell.empty();
cell.load('ajax/circuitRepair.php?id='+mainLine.get('linea')+'&action='+action);
}

function circuitResultWarning(id,warningCode)
{
var cell=$('circuitsReportList').getElement('.lineaDatos[linea="'+id+'"]').getElement('.circuitResultCell');
$('warningCircuitsAmount').set('text',($('warningCircuitsAmount').get('text')*1)+1);
new Element('div',{'class':'inlineIcon warningIcon'}).inject(cell);
new Element('div',{'class':'circuitResultLine warningLine','text':warningCode}).inject(cell.getParent('.lineaDatos'),'bottom');
}


function circuitReferenceBlock(circuit,container)
{
circuit=circuit*1;
container.empty();
if (circuit!=0)
	{
	var linkCircuit=new Element('a',{'class':'circuitLink','circuit':circuit,'href':'circuit.php?id='+encodeURIComponent(circuit)}).inject(container);
	if (circuitsRepository.indexOf(circuit)>-1)
		{
		linkCircuit.set('html',referencesRepository[circuitsRepository.indexOf(circuit)]);
		new Element('span',{'class':'spanCustomer','html':customersRepository[circuitsRepository.indexOf(circuit)]}).inject(linkCircuit,'after');
		circuitInfoButton(linkCircuit);
		container.fireEvent('circuitInfoLoaded',container);
		}
	else
		{
		var number=$$('.circuitLink').length;
		linkCircuit.set('id','circuitLink'+number);
		if (circuitsPolling.indexOf(circuit)>-1)
			{
			var ind=circuitsPolling.indexOf(circuit);
			var waiting=circuitsWaiting[ind];
			waiting[waiting.length]='circuitLink'+number;
			circuitsWaiting[ind]=waiting;
			}
		else
			{
			var ind=circuitsPolling.length;
			circuitsPolling[ind]=circuit;
			circuitsWaiting[ind]=new Array();
			linkCircuit.load('ajax/getCircuitReference.php?circuit='+encodeURIComponent(circuit)+'&element=circuitLink'+number);
			}
		}
	
	}

}

function registerCircuit(circuit,el)
{
circuitsRepository[circuitsRepository.length]=circuit;
var container=$(el).getParent();
var custHtml=container.getElement('.spanCustomer').get('html');
customersRepository[customersRepository.length]=custHtml;
container.getElement('.spanCustomer').inject($(el),'after');
var refHtml=$(el).get('html');
referencesRepository[referencesRepository.length]=refHtml;
circuitInfoButton($(el));
container.fireEvent('circuitInfoLoaded',container);
var waiting=circuitsWaiting[circuitsPolling.indexOf(circuit)];
waiting.each(function(item)
	{
	$(item).getParent().getElement('.circuitLink').set('html',refHtml);	
	new Element('span',{'class':'spanCustomer','html':custHtml}).inject($(item),'after');
	circuitInfoButton($(item));
	var container=$(item).getParent();
	container.fireEvent('circuitInfoLoaded',container);
	});
}

function circuitInfoButton(circuitLink)
{
if (circuitLink.getElements('.circuitReferenceBlock').length>1)
	{
	var infoCircuitButton= new Element('span',{'class':'boton botonInformation','style':'padding-left:16px;'}).inject(circuitLink,'before');
	infoCircuitButton.addEvent('click',function(e){showCircuitInfo(e);});
	}
}

function showCircuitInfo(e)
{
openInfoWindow(e,new Array(250,150),new Array(0,-120));
addCloseInfoWindow();
var circuitLink=e.target.getNext('.circuitLink');
circuitLink.getElements('.circuitReferenceBlock').each(function(item)
	{
	var circuitLine=new Element('div',{'html':item.get('html'),'style':'padding:2px;margin-top:2px;'}).inject($('cuadroInfoContent'));
	circuitLine.getFirst('span').set('text', circuitLine.getFirst('span').get('refType'));
	circuitLine.getElements('.oculto').each(function(item)
		{
		item.removeClass('oculto');
		});
	circuitLine.getElements('.circuitRef').each(function(item)
		{
		item.setStyle('padding-left','10px');
		});
	});
}



