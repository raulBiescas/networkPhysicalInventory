/*!
 * evolucion.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 evolucion.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */ 
 
function inicializarEvolucion()
{
var inicio=$('evolution').getElement('.tituloTabla').get('inicio')*1;
inicializarTablaDiv('evolutionList');
$('evolutionList').addClass('tablaEvolucion');
addClase('evolutionList', 'Where', 'textoGrande');
addClase('evolutionList', 'Evolution', 'textoMedio');
ocultarColumna('evolutionList', 'Circuit');
var lineasCambios=$('evolutionList').getElements('.lineaDatos');
var cambios=lineasCambios.length;
if (cambios<100)
	{
	$('changesEvolution').set('text',cambios);
	$('nextEvolution').destroy();
	}
if (cambios==0)
	{
	$('tituloChangesEvolution').set('html','No changes found');
	}
else
	{
	var fechaTo=getValorLinea(lineasCambios[0],'Timestamp').substring(0,7);
	var fechaFrom=getValorLinea(lineasCambios[cambios-1],'Timestamp').substring(0,7);
	$('inicioEvolution').set('text',fechaFrom);
	$('finEvolution').set('text',fechaTo);
	}
$('evolutionList').getElements('.descriptorRed').each(function(item){
	var filas=item.getElements('.filaDescriptorRed');
	var i=0;
	if (filas.length>2)
		{
		while (i < filas.length -2) 
			{
			filas[i].addClass('oculto');
			i++;
			}
		}	
	});
agruparTablaEvolucion('evolutionList');
$('reloadEvolution').addEvent('click',function(e)
	{
	$('evolution').load($('evolution').get('infoSource')+'&inicio='+inicio);
	});
if ($('previousEvolution'))
	{
	$('previousEvolution').addEvent('click',function(e)
		{
		$('evolution').load($('evolution').get('infoSource')+'&inicio='+(inicio-100));
		});
	}
if ($('nextEvolution'))
	{
	$('nextEvolution').addEvent('click',function(e)
		{
		$('evolution').load($('evolution').get('infoSource')+'&inicio='+(inicio+100));
		});
	}
}


function agruparTablaEvolucion(tabla)
{
var agrupando=false;
var currentEvolution='';
var currentTable='0';
var currentParent='0';
var currentTime='';
var currentCircuit='';
$(tabla).getElements('.lineaDatos').each(function(linea)
	{
	var time=getValorLinea(linea,'Timestamp').substring(0,11);
	var evolution=getValorLinea(linea,'Evolution');
	var table='';
	var parent='';
	var descriptorFound=true;
	if (linea.getElement('.descriptorRed'))
		{
		var descriptor=linea.getElement('.descriptorRed');
		var descriptores=descriptor.getElements('.filaDescriptorRed');
		if (descriptores.length>1)
			{
			parent=descriptores[descriptores.length-2].get('idTabla');
			}
		table=descriptor.get('tabla');
		}
	else
		{
		descriptorFound=false;
		}
	var circuit=getValorLinea(linea,'Circuit');
	var agruparEste=false;
	
	if ((evolution.indexOf('nstallation')>-1) || (evolution.indexOf('Movement')>-1))//para installs/deinstalls or movements
		{
		if ((time==currentTime)&&(table==currentTable)&&(parent=currentParent)&&(evolution==currentEvolution))
			{agruparEste=true;}
		}
	else //paraConexiones o desconexiones
		{
		var celdaWhere=linea.getElement('.celda[campo="Where"]');
		if (circuit*1 > 0)
			{
			var circuitSpan=new Element('span',{}).inject(celdaWhere);
			circuitReferenceBlock(circuit,circuitSpan);
			}
			
		if ((time==currentTime)&&(circuit==currentCircuit)&&(evolution==currentEvolution)&&(circuit!=''))
			{
			agruparEste=true;
			}
		}
	if (agruparEste && descriptorFound)
		{
		if (!agrupando)
			{
			agrupando=true;
			var lineaAnterior=linea.getPrevious('.lineaDatos');
			lineaAnterior.addClass('lineaCabeceraGrupo');
			var infoGrupo=new Element('div',{'class':'informacionGrupo oculto','style':'margin-bottom:10px;padding-left:10%;width:90%;background-color:#F6E3CE;'}).inject(lineaAnterior,'after');
			var lineaInfoGrupo=new Element('div',{'style':'margin-bottom:5px;'}).inject(infoGrupo);
			var descriptorAnterior=lineaAnterior.getElement('.descriptorRed');
			descriptorAnterior.clone().inject(lineaInfoGrupo);
			var descriptoresAnteriores=descriptorAnterior.getElements('.filaDescriptorRed');
			descriptoresAnteriores[descriptoresAnteriores.length-1].addClass('oculto');
			if (evolution.indexOf('onnection')>-1)
				{
				descriptorAnterior.addClass('oculto');
				}
			var celdaEvolution=lineaAnterior.getElement('.celda[campo="Evolution"]');
			if (table.indexOf('Port')>-1){new Element('span',{'style':'padding-left:5px;color:orange;','text':'Ports'}).inject(celdaEvolution);}
			else{new Element('span',{'text':table,'style':'padding-left:5px;color:orange;'}).inject(celdaEvolution);}
			new Element('span',{'style':'padding-left:5px;color:orange;','html':'(<span class="numeroElementos">1</span>)'}).inject(celdaEvolution);
			var infoButton=new Element('div',{'style':'position:absolute;bottom:1px;right:1px;','class':'botonInformation boton','title':'show details'}).inject(celdaEvolution);
			infoButton.addEvent('click',function(e){
				var linea=e.target.getParent('.lineaDatos');
				var infoGrupo=linea.getNext('.informacionGrupo');
				if (e.target.get('title')=='show details')
					{
					infoGrupo.removeClass('oculto');
					e.target.set('title','hide details');
					}
				else
					{
					infoGrupo.addClass('oculto');
					e.target.set('title','show details');
					}
				});
			}
		linea.addClass('oculto');
		var infoGrupo=linea.getPrevious('.informacionGrupo');
		var lineaInfoGrupo=new Element('div',{'style':'margin-bottom:5px;'}).inject(infoGrupo);
		descriptor.clone().inject(lineaInfoGrupo);
		var cabecera=linea.getPrevious('.lineaCabeceraGrupo');
		var numero=cabecera.getElement('.numeroElementos');
		numero.set('text',(numero.get('text')*1)+1);
		}
	else
		{
		agrupando=false;
		}
		
	currentTime=time;currentTable=table;currentParent=parent;currentEvolution=evolution;currentCircuit=circuit;	
	});

}