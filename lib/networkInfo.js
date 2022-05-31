/*!
 * networkInfo.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 networkInfo.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */


var peques=new Array('Name','GeoElement','Provider');
var startBounds=new OpenLayers.Bounds();;
var mapa;

/*var styleBase = new OpenLayers.Style({
    fillColor: "#ffcc66",
    strokeColor: "#ff7733",
	pointRadius:6,
    strokeWidth: 2,
    label: "${type}",
	labelAlign: "cc",
	fontColor: "#000000",
	fontOpacity: 1,
	fontFamily: "Arial",
	fontSize: 16,
	fontWeight: "600"
});*/

var highlightColor="navy";
var noHighlightColor="#ff7733";

/*var styleReturn = new OpenLayers.Style({
    fillColor: "#ffcc66",
    strokeColor: "#ff7733",
	pointRadius:6,
    strokeWidth: 2,
    label: "${type}",
	labelAlign: "cc",
	fontColor: "#000000",
	fontOpacity: 1,
	fontFamily: "Arial",
	fontSize: 16,
	fontWeight: "600"
});*/



window.addEvent('domready', function() {
var tabla='';

if ($('servicesTable'))
	{tabla='servicesTable';}

if ($('networkReportTable'))
	{tabla='networkReportTable';}	
	
if (tabla!='')
{
mapa=crearMapaBase('contractMap');

$$('#'+tabla+' .lineaTitulo .titulo').each(function(item,index){
	if (item.get('campo')=='Name')
		{item.set('text','Route');}
	if (item.get('campo')=='GeoElement')
		{item.set('text','');}
	});

$$('#'+tabla+' .celda').each(function(item,index){
	if (item.get('campo')=='Info')
		{item.addClass('oculto');}
	});

$$('.botonZoomTotal').addEvent('click',function(event){mapa.zoomToExtent(startBounds);});	
	

var markers=new Array();
var geos=new Array();
var idGeos=new Array();

var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;


var vectors = new OpenLayers.Layer.Vector("Routes", {
styleMap: styleBase,
renderers: renderer
});

var i=0;
$$('#'+tabla+' .lineaDatos').each(function(item0,index0){
	item0.getElements('.celda').each(function(item,index){
	//añadir boton de zoom para cada seccion
	if (item.get('campo')=='Name')
		{
		if (item.getFirst('.valor'))
			{markers[i]=item.getFirst('.valor').get('text');}
		}
	if (item.get('campo')=='GeoElement')
		{
		var idGeo=item.getFirst('.valor').get('text')*1;
		idGeos[i]=idGeo;
		item.getFirst('.valor').set('html','&nbsp;');
		var boton=new Element('div',{'class':'botonHighlight conTip', 'geo':idGeo,'title':'Highlight'}).inject(item);
		var boton=new Element('div',{'class':'botonDontHighlight oculto conTip', 'geo':idGeo,'title':'Do not highlight'}).inject(item);
		var boton=new Element('div',{'class':'botonZoom conTip', 'geo':idGeo,'title':'Adjust zoom'}).inject(item);
		var linea=item.getParent('.lineaDatos');
		linea.set('route',idGeo);
		}
	if (item.get('campo')=='Info')
		{
		if (item.getFirst('.valor'))
			{geos[i]=item.getFirst('.valor').get('text');
			i++;}
		}
	});
	});
	
$$('.botonHighlight').addEvent('click',function(event){mapHighlight(event.target);});
$$('.botonDontHighlight').addEvent('click',function(event){mapDontHighlight(event.target);});
$$('.botonZoom').addEvent('click',function(event){mapZoom(event.target);});
	
calcularNetworkInfo();

geos.each(function(item,index)
	{
	if (item!='')
		{
		var geom=new OpenLayers.Geometry.fromWKT(geos[index]);
		var newBounds=geom.getBounds();
		startBounds.extend(newBounds);
		var feature=new OpenLayers.Feature.Vector(geom,{'idGeo':idGeos[index],'type':''});
		var features=vectors.getFeaturesByAttribute('idGeo',idGeos[index]);
		if (features.length==0)
			{vectors.addFeatures([feature]);}
		}
	
	});

mapa.addLayer(vectors);
mapa.zoomToExtent(startBounds);
}
});

function mapHighlight(el)
	{
	var idGeo=el.get('geo')*1;
	el.getNext('.botonDontHighlight').removeClass('oculto');
	el.addClass('oculto');
	var vectorLayer=mapa.getLayersByName('Routes');
	var features=vectorLayer[0].getFeaturesByAttribute('idGeo',idGeo);
	if (features[0].style)
		{features[0].style.strokeColor=highlightColor;}
	else
		{
		var styleHighlight = new OpenLayers.Style({
			fillColor: "#ffcc66",
			strokeColor: "navy",
			pointRadius:6,
			strokeWidth: 3,
			label: "${type}",
			labelAlign: "cc",
			fontColor: "#000000",
			fontOpacity: 1,
			fontFamily: "Arial",
			fontSize: 16,
			fontWeight: "600"
		});

		features[0].style=styleHighlight;
		}
	vectorLayer[0].redraw();
	}

function mapDontHighlight(el)
	{
	var idGeo=el.get('geo')*1;
	el.getPrevious('.botonHighlight').removeClass('oculto');
	el.addClass('oculto');
	var vectorLayer=mapa.getLayersByName('Routes');
	var features=vectorLayer[0].getFeaturesByAttribute('idGeo',idGeo);
	features[0].style.strokeColor=noHighlightColor;
	//features[0].style=styleReturn;
	vectorLayer[0].redraw();
	}

function mapZoom(el)
	{
	var idGeo=el.get('geo')*1;
	var vectorLayer=mapa.getLayersByName('Routes');
	var features=vectorLayer[0].getFeaturesByAttribute('idGeo',idGeo);
	var newBounds=features[0].geometry.getBounds();
	mapa.zoomToExtent(newBounds);
	}

	
function calcularNetworkInfo()
{
var longitud=0;
var precio=0;
var currency='';
var sumaValores=0;

$$('#servicesTable .lineaDatos .celda').each(function(item,index){
	if (item.get('campo')=='Length')
		{
		if (item.getFirst('.valor'))
			{longitud+=item.getFirst('.valor').get('text')*1;}
		}
	});

$$('#infoMainContract .datos').each(function(item,index){
	if (item.get('campo')=='ValueYear')
		{
		var valor=limpiarNumero(item.get('text'))*1;
		precio=valor/longitud;
		currency=item.getNext('.simbolo').get('html');
		}
	});

if ($('networkReportTable'))
	{
	var finLinea=$('networkReportTable').getFirst('.lineaTitulo').getFirst('.clear');
	var tit=new Element('div',{'class':'celda titulo anchuraPeque', 'campo':'Length'}).inject(finLinea,'before');
	tit.set('text','Total Length (m)');
	var tit=new Element('div',{'class':'celda titulo anchuraPeque', 'campo':'Price'}).inject(finLinea,'before');
	tit.set('text','Price per meter');
	}

var rutas=new Array();
	
$$('#networkReportTable .lineaDatos').each(function(item,index){
	
	var nivel=item.get('nivel');
	if (nivel==0)
		{
		var finLinea=item.getFirst('.clear');
		var cel=new Element('div',{'class':'celda datos celdaNumero centrado anchuraPeque', 'campo':'Length'}).inject(finLinea,'before');
		var span=new Element('span',{'class':'valor'}).inject(cel);
		span.set('text','0');
		var cel=new Element('div',{'class':'celda datos celdaNumero centrado anchuraPeque', 'campo':'Price'}).inject(finLinea,'before');
		var span=new Element('span',{'class':'valor'}).inject(cel);
		span.set('text','0');
		var span=new Element('span',{'class':'simbolo'}).inject(cel);
		span.set('text','');
		var span=new Element('span',{'class':'separador'}).inject(cel);
		span.set('text','/m');
		}
	else	
		{
		var celda=item.getFirst('.celda[campo="Length"]');
		var valor=celda.getFirst('.valor').get('text')*1;
		var geoId=item.get('route');
		if (rutas.indexOf(geoId)==-1)
			{
			longitud+=valor;
			rutas.push(geoId);
			}
		var lineaSup=item.getPrevious('.lineaDatos[nivel="0"]');
		var celdasup=lineaSup.getFirst('.celda[campo="Length"]');
		valor+=celdasup.getFirst('.valor').get('text')*1;
		celdasup.getFirst('.valor').set('text',valor);
		}
	
	});

$$('#networkReportTable .lineaDatos[nivel="0"]').each(function(item,index){
	
	var siguientes=item.getAllNext('.lineaDatos[nivel="1"]');
	if (siguientes.length==0)
		{item.destroy();}
	else
		{
		var siguiente=item.getNext('.lineaDatos');
		if (siguiente.get('nivel')==0)
			{item.destroy();}
		else
			{
			var celda=item.getFirst('.celda[campo="Length"]');
			var longi=celda.getFirst('.valor').get('text')*1;
			var celda=item.getFirst('.celda[campo="ValueYear"]');
			var valor=celda.getFirst('.valor').get('text')*1;
			sumaValores+=valor;
			currency=celda.getFirst('.simbolo').get('text');
			var price=0;
			if (longi>0)
				{price=valor/longi;}
			var celda=item.getFirst('.celda[campo="Price"]');
			celda.getFirst('.valor').set('text',price.decimal(4));
			celda.getFirst('.simbolo').set('text',currency);
			}
		}
});

if ($('networkReportTable'))
	{
	precio=sumaValores/longitud;
	$$('#networkReportTable .lineaDatos .celda[campo="Length"]').each(function(item,index){
		var valor=item.getFirst('.valor').get('text');
		item.getFirst('.valor').set('text',insertarComa(valor, 3)+'m');
		});
		
	}
	


var longitudTexto=longitud+'';
$('totalLength').set('text',insertarComa(longitudTexto, 3)+'m');
$('priceMeter').set('text',precio.decimal(4));
$('priceMeterCUR').set('html',currency);
	
}
