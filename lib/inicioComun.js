/*!
 * inicioComun.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 inicioComun.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */

var circuitReferenceTypes=new Array('','CUSTOMER','FRIENDLY','LEC','REFERENCE');
var circuitTypes=new Array('','CDN','DARK FIBER','DWDM','IP','LEC','MGMT','NNI','PRIVATE LINE','SDH','WAVE');

var networkRelativePath='';

window.addEvent('domready', function() {

if ($('initialMessage'))
	{
		setTimeout(function(){ $('initialMessage').destroy(); }, 3000);
	}

window.addEvent('resize',function(e){if(typeof(resizeElements)=='function'){resizeElements();}});

$$('.botonDetallesZoom').each(function(boton)
	{
	boton.addEvent('click',function(e)
		{
		$('popUp').empty();
		$$('.popUpElement').removeClass('oculto');
		var id=e.target.get('idTabla');
		var tabla=e.target.get('tabla');
		var resaltar=e.target.get('resaltar');
		$('popUp').load('ajax/getNetworkDetails.php?tabla='+tabla+'&id='+id+'&resaltar='+resaltar);
		});
	});
$$('.botonSiteCoverage').each(function(boton)
	{
	boton.addEvent('click',function(e)
		{
		$('popUp').empty();
		$$('.popUpElement').removeClass('oculto');
		var id=e.target.get('idTabla');
		var nombre=e.target.getNext('.bloqueTituloNetwork').getElement('a').get('text');
		var titulo=new Element('div',{'class':'tituloPopup','geo':geoBase}).inject($('popUp'));
		var link=new Element('a',{'href':'site.php?id='+id,'text':nombre}).inject(titulo);
		new Element('div',{'style':'height:10px;width:100%;border-bottom:1px solid white;'}).inject($('popUp'));
		var bloqueMitad=new Element('div',{'class':'mitad'}).inject($('popUp'));
		bloqueMitad.setStyle('padding-left','10px');
		bloqueMitad.setStyle('padding-top','10px');
		var bloqueMapa=new Element('div',{'id':'mapaExtraPopup','class':'','style':'width:90%;height:400px;'}).inject(bloqueMitad);
		var mapExtra=crearMapaBase('mapaExtraPopup');
		simpleAddToMap(geoBase,id,mapExtra,nombre);
		geoZoomToAll(mapExtra);
		mapExtra.zoomOut();
		var bloqueMitad=new Element('div',{'class':'mitad'}).inject($('popUp'));
		var bloqueInfo=new Element('div',{'class':'','style':'margin-top:10px'}).inject(bloqueMitad);
		bloqueInfo.load('ajax/queuesInfo.php?site='+id);
		var bloqueInfo=new Element('div',{'class':''}).inject(bloqueMitad);
		bloqueInfo.load('ajax/logisticInfo.php?site='+id);
		new Element('div',{'class':'clear'}).inject($('popUp'));
		});
	});

$$('.reportGetExcel').each(function(boton)
	{
	boton.addEvent('click',function(e)
		{
		var block=e.target.getParent('.networkReportLine');
		window.open('ajax/getReportResults.php?type=list&mode=excel&elementType='+getSelectValueSelect(block.getElement('select'))+'&table='+block.get('tabla')+'&id='+block.get('idTabla'));
		});
	});
	
$$('.finderBlock').each(function(finder){initFinderBlock(finder);});

if ($('finder'))
	{finderInit('#finder');}

});

function iniciarLogistics(tabla)
{
if (typeof(tabla)=='undefined')
	{
	tabla='tablaCCL';
	}
if ($('closeSpares'))
	{
	tablaToLista($('closeSpares'));
	ocultarColumna('closeSpares', 'Info');
	enlazarCeldas('closeSpares', 'site.php?', 'SiteName');
	var origen=0;
	if (typeof(geoBase)!='undefined')
		{
		origen=geoBase;
		}
	else
		{
		if ($('popUp').getElement('.tituloPopup'))
			{origen=$('popUp').getElement('.tituloPopup').get('geo');}
		}
	$$('#closeSpares .lineaDatos').each(function(item)
		{
		if (!item.getElement('.celda[campo="Distance"]'))
			{
			var celda=new Element('div',{'class':'celda datos celdaLista textoPeque','campo':'Distance','tipo':'decimal'}).inject(item.getLast('.clear'),'before');
			var cont=new Element('span',{'class':'campoCuenta'}).inject(celda);
			var valor=new Element('span',{'class':'valor'}).inject(cont);
			var distancia=calcularDistancia(origen,item.getElement('.datos[campo="Info"]').getElement('.valor').get('text'))/1000;
			valor.set('text',distancia.decimal(1));
			var simbolo=new Element('span',{'class':'simbolo','unit':'km'}).inject(cont);
			simbolo.set('text',' km');
			}
		});
	ordenarTablaDiv('closeSpares','Distance','ASC','');
	}

if($(tabla))
	{
	tablaToLista($(tabla));
	ocultarColumna(tabla, 'NetworkPath');
	groupNetworkTable(tabla,'NetworkPath');
	if ($(tabla).getParent('.logContainersReceptor'))
		{
		var el=	$(tabla).getParent('.logContainersReceptor');
		el.fireEvent('logContainersReceived', el);
		}
	}

}

function formateoBasicoDescriptores(descriptor)
{
if (typeof(thisTable)!='undefined')
	{
	var limite=true;
	if (thisTable!='')
		{
		limite=false;
		}
	descriptor.getElements('.filaDescriptorRed').each(function(item)
		{
		if (item.get('tabla')=='Cards')
			{
			item.addClass('oculto');
			}
		if (!limite)
			{
			item.addClass('oculto');
			if (item.get('tabla')==thisTable)
				{
				limite=true;
				}
			}
		else
			{
			item.getElement('.descriptorRedSecundario').addClass('oculto');
			}
		});
	}
}