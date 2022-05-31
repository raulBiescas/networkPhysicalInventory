/*!
 * ISPdrawing.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 ISPdrawing.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */
 
var verticesTotales=0;
var dibujando=false;
var tablaDibujo='';
var lineaDibujo=0;
var rulerActive=false;


function tablaToPisos(el)
{
el.getElements('.datos').each(function(item,index)
	{
	item.addClass('celdaPiso');
	if (item.get('campo')=='Clases')
		{
		listaToIconos(item.getFirst('.valor'));
		}
	if (item.get('campo')=='Level')
		{
		item.getFirst('.valor').addClass('bloqueNivel');
		}
	if (item.get('campo')=='TechRooms')
		{
		var techrooms=item.getFirst('.valor').get('text')*1;
		item.getFirst('.valor').set('text','');
		if (techrooms!=0)
			{
			item.getFirst('.valor').addClass('techRooms');
			item.getFirst('.valor').addClass('iconoLista');
			item.getFirst('.valor').addClass('conTip');
			item.getFirst('.valor').set('title',techrooms+' technical rooms');
			item.getFirst('.valor').set('classValue','techRooms');
			}
		}
	});

el.getElements('.lineaDatos').each(function(item,index)
	{
	item.addClass('bloquePiso');
	var nivelActual=item.getFirst('.celda[campo="Level"]').getFirst('.valor').get('text')*1;
	item.set('piso',nivelActual);
	if (item.getPrevious('.lineaDatos'))
		{
		var nivelAnterior=item.getPrevious('.lineaDatos').getFirst('.celda[campo="Level"]').getFirst('.valor').get('text')*1;
		if ((nivelAnterior-1)!=nivelActual)
			{
			var nuevosPisos=nivelAnterior-nivelActual-1;
			var i=0;
			while (i<nuevosPisos)
				{
				var nuevoPiso=new Element('div',{'class':'lineaDatos bloquePiso','piso':(nivelAnterior-i-1)}).inject(item,'before');
				var celda=new Element('div',{'class':'celda celdaPiso'}).inject(nuevoPiso);
				new Element('span',{'class':'valor bloqueNivel','text':(nivelAnterior-i-1)}).inject(celda);
				i++;
				}
			}
		}
	});	

//rellenarPisos
if (el.getFirst('.lineaDatos'))
	{
	var primero=el.getFirst('.lineaDatos').get('piso')*1;
	if (primero>=0)
		{
		var bajo=(el.getLast('.lineaDatos').get('piso')*1)-1;
		while (bajo>=0)
			{
			var nuevoPiso=new Element('div',{'class':'lineaDatos bloquePiso','piso':bajo}).inject(el,'bottom');
			var celda=new Element('div',{'class':'celda celdaPiso'}).inject(nuevoPiso);
			new Element('span',{'class':'valor bloqueNivel','text':bajo}).inject(celda);
			bajo--;
			}
		}
	else
		{
		var alto=(el.getFirst('.lineaDatos').get('piso')*1)+1;
		while (alto<0)
			{
			var nuevoPiso=new Element('div',{'class':'lineaDatos bloquePiso','piso':alto}).inject(el,'top');
			var celda=new Element('div',{'class':'celda celdaPiso'}).inject(nuevoPiso);
			new Element('span',{'class':'valor bloqueNivel','text':alto}).inject(celda);
			alto++;
			}
		}
	}
}

function activarRack(item,planta)
{
var name=item.getFirst('.celda[campo="Name"]').getFirst('.valor').get('text');
var idRack=item.get('linea')*1;
var xpos=item.getFirst('.celda[campo="XPos"]').getFirst('.valor').get('text')*1;
var ypos=item.getFirst('.celda[campo="YPos"]').getFirst('.valor').get('text')*1;
var xsize=item.getFirst('.celda[campo="XSize"]').getFirst('.valor').get('text')*1;
var ysize=item.getFirst('.celda[campo="YSize"]').getFirst('.valor').get('text')*1;
var front='None';
if (item.getFirst('.celda[campo="Front"]'))
	{
	var front=item.getFirst('.celda[campo="Front"]').getFirst('.valor').get('text');
	if (front!='')
		{front=cardinalsToDirection(front, planta);}
	else
		{front='None';}
	}

var rack=new Element('div',{'class':'elementoPlanta rack front'+front,'nombre':name,'title':name,'idRack':idRack,'xpos':xpos,'ypos':ypos,'xsize':xsize,'ysize':ysize}).inject($(planta).getFirst('.areaPlanta'));
rack.addEvent('click',function(e){detallesRack(e.target.get('idRack')*1);});

rack.addEvent('mouseenter',function(event)
	{
	if (event.target.hasClass('rack'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.rack');}
	var id=el.get('idRack');
	if ($('tablaRacks'))
		{$('tablaRacks').getElement('.lineaDatos[linea="'+id+'"]').addClass('lineaRemarcada');}
	});
rack.addEvent('mouseleave',function(event)
	{
	if (event.target.hasClass('rack'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.rack');}
	var id=el.get('idRack');
	if ($('tablaRacks'))
		{$('tablaRacks').getElement('.lineaDatos[linea="'+id+'"]').removeClass('lineaRemarcada');}
	});
	
item.addEvent('mouseenter',function(event)
	{
	if (event.target.hasClass('lineaDatos'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.lineaDatos');}
	var id=el.get('linea');
	$$('.rack[idRack="'+id+'"]').addClass('rackResaltado');
	});

item.addEvent('mouseleave',function(event)
	{
	if (event.target.hasClass('lineaDatos'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.lineaDatos');}
	var id=el.get('linea');
	$$('.rack[idRack="'+id+'"]').removeClass('rackResaltado');
	});

if (item.getElement('.controlesIniciales') && !item.hasClass('dibujoNoPermitido'))
	{
	var controles=item.getElement('.controlesIniciales');
	var botonDibujar=new Element('span',{'class':'separados'}).inject(controles);
	var boton=new Element('img',{'class':'boton dibujarLinea','src':'styles/images/draw.png','title':'draw','alt':'draw'}).inject(botonDibujar);
	boton.addEvent('click',function(e)
		{
		permitirDibujo(e.target,$(planta));
		});
	}
}

function activarSelectingFronts(planta)
{
dibujando=true;
$(planta).getElements('.rack').each(function(item)
	{
	var id=item.get('idRack');
	var left=parseInt(item.getStyle('left'));
	var width=parseInt(item.getStyle('width'));
	var top=parseInt(item.getStyle('top'));
	var height=parseInt(item.getStyle('height'));
	if (!item.hasClass('frontUp') && (rackInPosition(new Array(parseInt(left+(width/2)),parseInt(top-(height/2))),planta)==0))
		{
		var borde=new Element('div',{'class':'frontSelection', 'direction':'Up','rackId':id,'title':'this side is front'}).inject($(planta).getElement('.areaPlanta'));
		borde.setStyle('top',top+'px');
		borde.setStyle('left',left+'px');
		borde.setStyle('width',width+'px');
		borde.addEvent('click',function(e){frontSeleccionado(e.target);});
		}
	if (!item.hasClass('frontDown') && (rackInPosition(new Array(parseInt(left+(width/2)),parseInt(top+(height*1.5))),planta)==0))
		{
		var borde=new Element('div',{'class':'frontSelection', 'direction':'Down','rackId':id,'title':'this side is front'}).inject($(planta).getElement('.areaPlanta'));
		borde.setStyle('top',(top+height)+'px');
		borde.setStyle('left',left+'px');
		borde.setStyle('width',width+'px');
		borde.addEvent('click',function(e){frontSeleccionado(e.target);});
		}
	if (!item.hasClass('frontLeft') && (rackInPosition(new Array(parseInt(left-(width/2)),parseInt(top+(height/2))),planta)==0))
		{
		var borde=new Element('div',{'class':'frontSelection', 'direction':'Left','rackId':id,'title':'this side is front'}).inject($(planta).getElement('.areaPlanta'));
		borde.setStyle('top',top+'px');
		borde.setStyle('left',left+'px');
		borde.setStyle('height',height+'px');
		borde.addEvent('click',function(e){frontSeleccionado(e.target);});
		}
	if (!item.hasClass('frontRight') && (rackInPosition(new Array(parseInt(left+(width*1.5)),parseInt(top+(height/2))),planta)==0))
		{
		var borde=new Element('div',{'class':'frontSelection', 'direction':'Right','rackId':id,'title':'this side is front'}).inject($(planta).getElement('.areaPlanta'));
		borde.setStyle('top',top+'px');
		borde.setStyle('left',(left+width)+'px');
		borde.setStyle('height',height+'px');
		borde.addEvent('click',function(e){frontSeleccionado(e.target);});
		}
	});

}

function rackInPosition(pos,planta)
{
var res=0;
if (pos[0]>=0 && pos[1]>=0)
	{
	$(planta).getElements('.rack').each(function(item)
		{
		var left=parseInt(item.getStyle('left'));
		var width=parseInt(item.getStyle('width'));
		var top=parseInt(item.getStyle('top'));
		var height=parseInt(item.getStyle('height'));
		if ((pos[0]>left && pos[0]<(left+width))&&(pos[1]>top && pos[1]<(top+height)))
			{
			res=item.get('idRack');
			}
		});
	}
return res;	
}

function racksSameRow(rack,planta)
{
var topInicial=parseInt(rack.getStyle('top'));
var heightInicial=parseInt(rack.getStyle('height'));
var alturaInicial=parseInt(topInicial+(heightInicial/2));
var idInicial=rack.get('idRack');
var res=new Array();
planta.getElements('.rack').each(function(item)
	{
	if (item.get('idRack')!=idInicial)
		{
		var top=parseInt(item.getStyle('top'));
		var height=parseInt(item.getStyle('height'));
		if (alturaInicial>top && alturaInicial<(top+height))
			{
			res[res.length]=item.get('idRack');
			}
		}
	});
return res;
}

function racksSameColumn(rack,planta)
{
var leftInicial=parseInt(rack.getStyle('left'));
var widthInicial=parseInt(rack.getStyle('width'));
var leftInicial=parseInt(leftInicial+(widthInicial/2));
var idInicial=rack.get('idRack');
var res=new Array();
planta.getElements('.rack').each(function(item)
	{
	if (item.get('idRack')!=idInicial)
		{
		var left=parseInt(item.getStyle('left'));
		var width=parseInt(item.getStyle('width'));
		if (leftInicial>left && leftInicial<(left+width))
			{
			res[res.length]=item.get('idRack');
			}
		}
	});
return res;
}

function frontSeleccionado(el)
{
var id=el.get('rackId');
var direction=el.get('direction');
var planta=el.getParent('.areaPlanta');
var rack=planta.getElement('.rack[idRack="'+id+'"]');
var temp=new Element('div',{'id':'tempFront'+id,'class':'oculto tempFront', 'direction':direction}).inject(rack);
var cardinal=directionToCardinals(direction, planta.getParent('.floorWrapper'));
temp.load('ajax/cambiarFront.php?rack='+id+'&direction='+cardinal);
var racks=new Array;
if (direction=='Up'||direction=='Down')
	{
	racks=racksSameRow(rack,planta);
	}
else
	{
	racks=racksSameColumn(rack,planta);
	}
racks.each(function(id)
	{
	var rack=planta.getElement('.rack[idRack="'+id+'"]');
	if (!rack.hasClass('frontUp') && !rack.hasClass('frontDown') && !rack.hasClass('frontLeft') && !rack.hasClass('frontRight'))
		{
		var temp=new Element('div',{'id':'tempFront'+id,'class':'oculto tempFront', 'direction':direction}).inject(rack);
		temp.load('ajax/cambiarFront.php?rack='+id+'&direction='+cardinal);
		}
	});
}

function rackFrontChanged(rack)
{
var direction=$('tempFront'+rack).get('direction');
var planta;
$$('.frontSelection[rackId="'+rack+'"][direction="'+direction+'"]').each(function(item){planta=item.getParent('.areaPlanta');item.destroy();});
var item=planta.getElement('.rack[idRack="'+rack+'"]');
var left=parseInt(item.getStyle('left'));
var width=parseInt(item.getStyle('width'));
var top=parseInt(item.getStyle('top'));
var height=parseInt(item.getStyle('height'));
if (item.hasClass('frontUp'))
	{
	var borde=new Element('div',{'class':'frontSelection', 'direction':'Up','rackId':rack,'title':'this side is front'}).inject(planta);
	borde.setStyle('top',top+'px');
	borde.setStyle('left',left+'px');
	borde.setStyle('width',width+'px');
	borde.addEvent('click',function(e){frontSeleccionado(e.target);});
	item.removeClass('frontUp');
	}
if (item.hasClass('frontDown'))
	{
	var borde=new Element('div',{'class':'frontSelection', 'direction':'Down','rackId':rack,'title':'this side is front'}).inject(planta);
	borde.setStyle('top',(top+height)+'px');
	borde.setStyle('left',left+'px');
	borde.setStyle('width',width+'px');
	borde.addEvent('click',function(e){frontSeleccionado(e.target);});
	item.removeClass('frontDown');
	}
if (item.hasClass('frontLeft'))
	{
	var borde=new Element('div',{'class':'frontSelection', 'direction':'Left','rackId':rack,'title':'this side is front'}).inject(planta);
	borde.setStyle('top',top+'px');
	borde.setStyle('left',left+'px');
	borde.setStyle('height',height+'px');
	borde.addEvent('click',function(e){frontSeleccionado(e.target);});
	item.removeClass('frontLeft');
	}
if (item.hasClass('frontRight'))
	{
	var borde=new Element('div',{'class':'frontSelection', 'direction':'Right','rackId':rack,'title':'this side is front'}).inject(planta);
	borde.setStyle('top',top+'px');
	borde.setStyle('left',(left+width)+'px');
	borde.setStyle('height',height+'px');
	borde.addEvent('click',function(e){frontSeleccionado(e.target);});
	item.removeClass('frontRight');
	}
item.addClass('front'+direction);
$('tempFront'+rack).destroy();	
}

function desactivarSelectingFronts(planta)
{
dibujando=false;
$(planta).getElements('.frontSelection').each(function(item)
	{
	item.destroy();
	});
}

function directionToCardinals(direction, planta)
{
var northAngle=$(planta).get('northAngle')*1;
var rotacion=$(planta).get('rotacion');
if (rotacion=='true')
	{
	northAngle=(northAngle+270)%360;
	}
var variacion=0;
switch (direction)
	{
	case 'Down': variacion=180;break;
	case 'Right': variacion=90;break;
	case 'Left': variacion=270;break;
	}
var resultado=(northAngle+variacion)%360;
switch (true)
	{
	case (resultado<=45 || resultado>315):return 'North';break;
	case (resultado>45 && resultado<=135):return 'East';break;
	case (resultado>135 && resultado<=225):return 'South';break;
	case (resultado>225 && resultado<=315):return 'West';break;
	}

}

function cardinalsToDirection(cardinal, planta)
{
var northAngle=$(planta).get('northAngle')*1;
var rotacion=$(planta).get('rotacion');
if (rotacion=='true')
	{
	northAngle+=90;
	}
var variacion=0;
switch (cardinal)
	{
	case 'South': variacion=180;break;
	case 'East': variacion=90;break;
	case 'West': variacion=270;break;
	}
var resultado=(variacion+northAngle)%360;
switch (true)
	{
	case (resultado<=45 || resultado>315):return 'Up';break;
	case (resultado>45 && resultado<=135):return 'Right';break;
	case (resultado>135 && resultado<=225):return 'Down';break;
	case (resultado>225 && resultado<=315):return 'Left';break;
	}
}

function activarSuite(item,planta)
{
var name=item.getFirst('.celda[campo="Name"]').getFirst('.valor').get('text');
var xpos=item.getFirst('.celda[campo="XPos"]').getFirst('.valor').get('text')*1;
var ypos=item.getFirst('.celda[campo="YPos"]').getFirst('.valor').get('text')*1;
var xsize=item.getFirst('.celda[campo="XSize"]').getFirst('.valor').get('text')*1;
var ysize=item.getFirst('.celda[campo="YSize"]').getFirst('.valor').get('text')*1;

var suite=new Element('div',{'class':'elementoPlanta suite','idSuite':item.get('linea'),'nombre':name,'title':name,'xpos':xpos,'ypos':ypos,'xsize':xsize,'ysize':ysize}).inject($(planta).getFirst('.areaPlanta'));
suite.addEvent('mouseenter',function(event)
	{
	if (event.target.hasClass('suite'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.suite');}
	var id=el.get('idSuite');
	if ($('tablaSuites'))
		{$('tablaSuites').getElement('.lineaDatos[linea="'+id+'"]').addClass('lineaRemarcada');}
	});
suite.addEvent('mouseleave',function(event)
	{
	if (event.target.hasClass('suite'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.suite');}
	var id=el.get('idSuite');
	if ($('tablaSuites'))
		{$('tablaSuites').getElement('.lineaDatos[linea="'+id+'"]').removeClass('lineaRemarcada');}
	});
	
item.addEvent('mouseenter',function(event)
	{
	if (event.target.hasClass('lineaDatos'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.lineaDatos');}
	var id=el.get('linea');
	$$('.suite[idSuite="'+id+'"]').addClass('suiteResaltada');
	});

item.addEvent('mouseleave',function(event)
	{
	if (event.target.hasClass('lineaDatos'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.lineaDatos');}
	var id=el.get('linea');
	$$('.suite[idSuite="'+id+'"]').removeClass('suiteResaltada');
	});

}

function activacionRoom(item,planta)
{
	var name=item.getFirst('.celda[campo="Name"]').getFirst('.valor').get('text');
	var idRoom=item.get('linea')*1;
	var xpos=item.getFirst('.celda[campo="XPos"]').getFirst('.valor').get('text')*1;
	var ypos=item.getFirst('.celda[campo="YPos"]').getFirst('.valor').get('text')*1;
	var xsize=item.getFirst('.celda[campo="XSize"]').getFirst('.valor').get('text')*1;
	var ysize=item.getFirst('.celda[campo="YSize"]').getFirst('.valor').get('text')*1;
	
	var claseExtra='';
	var claseInfo='';
	
	if (item.getFirst('.celda[campo="SystemName"]'))
		{
		claseExtra+=' techRoom';
		claseInfo+='infoTechRoom';
		}
	
	if (item.getFirst('.celda[campo="Clases"]'))
		{
		claseInfo+=item.getFirst('.celda[campo="Clases"]').getFirst('.valor').get('text');
		listaToIconos(item.getFirst('.celda[campo="Clases"]').getFirst('.valor'));
		claseExtra+=' noTech';
		}
	
	if (item.getFirst('.celda[campo="VertType"]'))
		{
		var vertType=item.getFirst('.celda[campo="VertType"]').getFirst('.valor').get('text');
		listaToIconos(item.getFirst('.celda[campo="VertType"]').getFirst('.valor'));
		claseExtra+=' vertical vertical'+vertType;
		claseInfo+='vertical'+vertType;
		}
	

	var tipo=item.getParent('.tablaDiv').get('tipoElemento')
	
	if (tipo=='cage')
		{
		claseExtra='cage';
		}
	
	if (tipo=='otherCabinet')
		{
		claseExtra='otherCabinet';
		}
		
	if (tipo=='useless')
		{
		claseExtra='useless';
		}
	
	if (item.hasClass('lineaBox'))
		{
		claseExtra='box '+item.get('elemento')+'box';
		
		}
	
	if (tipo=='door')
		{
		claseExtra='door';
		if (xsize<=0.1)
			{
			var xsizedoor=1;
			var ysizedoor=0;
			var xposdoor=xpos-0.5;
			var yposdoor=ypos;
			new Element('div',{'class':'elementoPlanta roomInPlant '+claseExtra,'nombre':name,'tipoElemento':tipo,'idRoom':idRoom,'xpos':xposdoor,'ypos':yposdoor,'xsize':xsizedoor,'ysize':ysizedoor}).inject($(planta).getFirst('.areaPlanta'));
			yposdoor=ypos+ysize;
			new Element('div',{'class':'elementoPlanta roomInPlant '+claseExtra,'nombre':name,'tipoElemento':tipo,'idRoom':idRoom,'xpos':xposdoor,'ypos':yposdoor,'xsize':xsizedoor,'ysize':ysizedoor}).inject($(planta).getFirst('.areaPlanta'));
			}
		else
			{
			var ysizedoor=1;
			var xsizedoor=0;
			var xposdoor=xpos;
			var yposdoor=ypos-0.5;
			new Element('div',{'class':'elementoPlanta roomInPlant '+claseExtra,'nombre':name,'tipoElemento':tipo,'idRoom':idRoom,'xpos':xposdoor,'ypos':yposdoor,'xsize':xsizedoor,'ysize':ysizedoor}).inject($(planta).getFirst('.areaPlanta'));
			xposdoor=xpos+xsize;
			new Element('div',{'class':'elementoPlanta roomInPlant '+claseExtra,'nombre':name,'tipoElemento':tipo,'idRoom':idRoom,'xpos':xposdoor,'ypos':yposdoor,'xsize':xsizedoor,'ysize':ysizedoor}).inject($(planta).getFirst('.areaPlanta'));
			}
		}
	
	var room=new Element('div',{'class':'elementoPlanta roomInPlant '+claseExtra,'nombre':name,'tipoElemento':tipo,'idRoom':idRoom,'xpos':xpos,'ypos':ypos,'xsize':xsize,'ysize':ysize}).inject($(planta).getFirst('.areaPlanta'));
	if ((tipo=='vertical')||(tipo=='common')||(tipo=='otherCabinet')||(tipo=='useless'))
		{
		room.addClass('.conTip');
		room.set('title',room.get('nombre'));
		}
	if (tipo=='vertical')
		{
		room.addEvent('click',function(e){cambiarPiso(e);});
		}
	if (item.hasClass('lineaBox'))
		{
		var tablaDiv=item.getParent('.tablaDiv').get('id');
		room.set('boxTable',tablaDiv);
		}
	room.addEvent('mouseenter',function(event)
		{
		if (event.target.hasClass('roomInPlant'))
			{var el=event.target;}
		else
			{var el=event.target.getParent('.roomInPlant');}
		var id=el.get('idRoom');
		if (el.hasClass('box'))
			{
			/*
			$$('.lineaBox[linea="'+id+'"]').each(function(linea)
				{
				if (linea.getPrevious('div'))
					{
					if (linea.getPrevious('div').hasClass('lineaDatos'))
						{
						linea.getPrevious('.lineaDatos').addClass('lineaRemarcada');
						}
					}
				});*/
			$(el.get('boxTable')).getElement('.lineaDatos[linea="'+id+'"]').addClass('lineaRemarcada');
			}
		else
			{
			var tipoElemento=el.get('tipoElemento');
			$$('#buildingInfo .tablaDiv[tipoElemento="'+tipoElemento+'"]').each(function(tabla,index)
				{
				tabla.getElements('.lineaDatos[linea="'+id+'"]').each(function(linea){linea.addClass('lineaRemarcada');});
				});
			}
		});
	room.addEvent('mouseleave',function(event)
		{
		if (event.target.hasClass('roomInPlant'))
			{var el=event.target;}
		else
			{var el=event.target.getParent('.roomInPlant');}
		var id=el.get('idRoom');
		if (el.hasClass('box'))
			{
			/*$$('.lineaBox[linea="'+id+'"]').each(function(linea)
				{
				if (linea.getPrevious('div'))
					{
					if (linea.getPrevious('div').hasClass('lineaDatos'))
						{
						linea.getPrevious('.lineaDatos').removeClass('lineaRemarcada');
						}
					}
				});*/
			$(el.get('boxTable')).getElement('.lineaDatos[linea="'+id+'"]').removeClass('lineaRemarcada');
			}
		else
			{
			var tipoElemento=el.get('tipoElemento');
			$$('#buildingInfo .tablaDiv[tipoElemento="'+tipoElemento+'"]').each(function(tabla,index)
				{
				tabla.getElements('.lineaDatos[linea="'+id+'"]').each(function(linea){linea.removeClass('lineaRemarcada');});
				});
			}
		});
	
	if (tipo=='cage')
		{
		item=item.getPrevious('.primaryLine');
		}
	
	/*if (tipo=='box')
		{
		room.addClass('conTip');
		room.set('title',room.get('nombre'));
		room.addEvent('click',function(event)
			{
			if (event.target.hasClass('box'))
				{var el=event.target;}
			else
				{
				if (event.target.getParent('.box'))
					{var el=event.target.getParent('.box');}
				}
			if (typeof(el)!='undefined')
				{
				$$('.lineaBox[linea="'+el.get('idRoom')+'"]').each(function(box)
					{window.location=box.get('link')+'?id='+getValorLinea(box,'IdTabla')});
				}
			});

		}*/
	
	item.addEvent('mouseenter',function(event)
		{
		if (event.target.hasClass('lineaDatos'))
			{var el=event.target;}
		else
			{var el=event.target.getParent('.lineaDatos');}
		var id=el.get('linea');
		var tipoElemento=el.getParent('.tablaDiv').get('tipoElemento');
		$$('.roomInPlant[tipoElemento="'+tipoElemento+'"][idRoom="'+id+'"]').addClass('roomResaltada');
		});
	
	item.addEvent('mouseleave',function(event)
		{
		if (event.target.hasClass('lineaDatos'))
			{var el=event.target;}
		else
			{var el=event.target.getParent('.lineaDatos');}
		var id=el.get('linea');
		var tipoElemento=el.getParent('.tablaDiv').get('tipoElemento');
		$$('.roomInPlant[tipoElemento="'+tipoElemento+'"][idRoom="'+id+'"]').removeClass('roomResaltada');
		});
	var tabla=item.getParent('.tablaDiv').get('tabla');
	if (tabla=='Rooms')
		{
		var roomInfo=new Element('div',{'class':'elPlantaInfo infoBuilding conTip '+claseInfo,'title':name,'titleInfo':name}).inject(room);
		roomInfo.addEvent('click',function(e){showRoomInfo(e);});
		}

	if (xsize==0 && isRoom(tipo))
		{
		room.addClass('oculto');
		}
		
	if (!item.hasClass('dibujoNoPermitido')){botonDibujo(item,planta);}
}

function botonDibujo(item,planta)
{
if (item.getElement('.controlesIniciales'))
	{
	var controles=item.getElement('.controlesIniciales');
	if (!(controles.getElement('.dibujarLinea')))
		{
		var botonDibujar=new Element('span',{'class':'separados'}).inject(controles);
		var boton=new Element('img',{'class':'boton dibujarLinea','src':'styles/images/draw.png','title':'draw','alt':'draw'}).inject(botonDibujar);
		boton.addEvent('click',function(e)
			{
			permitirDibujo(e.target,$(planta));
			});
		}
	}
}

//for lines with Container type (Box or Rack) and IdContainer
function eventosResaltar(linea)
{
linea.addEvent('mouseenter',function(event)
	{
	if (event.target.hasClass('lineaDatos'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.lineaDatos');}
	var id=getValorLinea(linea,'IdContainer');
	if (getValorLinea(linea,'Container')=='Rack')
		{$$('.rack[idRack="'+id+'"]').addClass('rackResaltado');}
	else
		{$$('.box[idRoom="'+id+'"]').addClass('roomResaltada');}
	});
	
linea.addEvent('mouseleave',function(event)
	{
	if (event.target.hasClass('lineaDatos'))
		{var el=event.target;}
	else
		{var el=event.target.getParent('.lineaDatos');}
	var id=getValorLinea(linea,'IdContainer');
	if (getValorLinea(linea,'Container')=='Rack')
		{$$('.rack[idRack="'+id+'"]').removeClass('rackResaltado');}
	else
		{$$('.box[idRoom="'+id+'"]').removeClass('roomResaltada');}
	});
}

function prepararTablaBoxes()
{
$('tablaBoxes').set('tipoElemento','box');
$('tablaBoxes').getElements('.lineaDatos').each(function(box)
	{
	switch (getValorLinea(box,'Tabla'))
		{
		case 'PDFs':
			var elemento='PDF';
			var link='pdf.php';
		case 'Batteries':
			var elemento='Batteries';
			var link='batteries.php';
		}
	box.addClass('lineaBox');
	box.removeClass('lineaDatos');
	box.addClass('oculto');
	box.set('elemento',elemento);
	box.set('link',link);
	var celda=new Element('div',{'class':'celda datos','campo':'Name'}).inject(box);
	new Element('div',{'class':'valor','text':elemento}).inject(celda);
	});
}

function procesarRuta(item)
{
if (item.getElement('.celda[campo="Route"]'))
	{
	item.addClass('primaryLine');
	var ruta=getValorLinea(item,'Route');
	var name=getValorLinea(item,'Name');
	var idCage=item.get('linea');
	var puntos=ruta.split(',');
	var totalLineas=(puntos.length/2) -1;
	var i=0;
	if (totalLineas<=0)
		{
		var linea=new Element('div',{'class':'lineaDatos noContar oculto'}).inject(item,'after');
		linea.set('linea',idCage);
		var celda=new Element('div',{'class':'celda datos','campo':'Name'}).inject(linea);
		new Element('span',{'class':'valor','text':name}).inject(celda);
		var celda=new Element('div',{'class':'celda datos','campo':'XPos'}).inject(linea);
		new Element('span',{'class':'valor','text':'0'}).inject(celda);
		var celda=new Element('div',{'class':'celda datos','campo':'YPos'}).inject(linea);
		new Element('span',{'class':'valor','text':'0'}).inject(celda);
		var celda=new Element('div',{'class':'celda datos','campo':'XSize'}).inject(linea);
		new Element('span',{'class':'valor','text':'0'}).inject(celda);
		var celda=new Element('div',{'class':'celda datos','campo':'YSize'}).inject(linea);
		new Element('span',{'class':'valor','text':'0'}).inject(celda);
		}
	while (i<totalLineas)
		{
		var posx=menor(puntos[2*i],puntos[2*(i+1)]);
		var posy=menor(puntos[(2*i)+1],puntos[(2*(i+1))+1]);
		var sizex=Math.abs((puntos[2*i]*1)-(puntos[2*(i+1)]*1));
		var sizey=Math.abs((puntos[(2*i)+1]*1)-(puntos[(2*(i+1))+1]*1));
		var lineaDentro=true;
		if (typeof(thisRoomX)!='undefined')
			{
			posx=posx-thisRoomX;
			posy=posy-thisRoomY;
			//eliminar las que quedan fuera
			if (posx<0 && (posx+sizex)<0){lineaDentro=false;}
			if (posy<0 && (posy+sizey)<0){lineaDentro=false;}
			if (posx>thisRoomXsize){lineaDentro=false;}
			if (posy>thisRoomYsize){lineaDentro=false;}
			if (lineaDentro)
				{
				if (posx<0){sizex=sizex+posx;posx=0;}
				if (posy<0){sizey=sizey+posy;posy=0;}
				if (posx+sizex>thisRoomXsize){sizex=thisRoomXsize-posx;}
				if (posy+sizey>thisRoomYsize){sizey=thisRoomYsize-posy;}
				}
			}
		if (lineaDentro)
			{
			var linea=new Element('div',{'class':'lineaDatos noContar oculto'}).inject(item,'after');
			linea.set('linea',idCage);
			var celda=new Element('div',{'class':'celda datos','campo':'Name'}).inject(linea);
			new Element('span',{'class':'valor','text':name}).inject(celda);
			var celda=new Element('div',{'class':'celda datos','campo':'XPos'}).inject(linea);
			new Element('span',{'class':'valor','text':posx}).inject(celda);
			var celda=new Element('div',{'class':'celda datos','campo':'YPos'}).inject(linea);
			new Element('span',{'class':'valor','text':posy}).inject(celda);
			var celda=new Element('div',{'class':'celda datos','campo':'XSize'}).inject(linea);
			new Element('span',{'class':'valor','text':sizex}).inject(celda);
			var celda=new Element('div',{'class':'celda datos','campo':'YSize'}).inject(linea);
			new Element('span',{'class':'valor','text':sizey}).inject(celda);
			}
		i++;
		}
	}
}

function isRoom(tipo)
{
return (tipo=='room' || tipo=='common' || tipo=='vertical');
}

function ajustarPlanta(el)
{
var margen=20;
var sizePlanta=el.getSize();
var columnas=el.get('columnas')*1;
var filas=el.get('filas')*1;
var x=0;
var y=0;
var minEscala=el.get('minimaEscala')*1;
var tam=0;
if ((sizePlanta.x/sizePlanta.y)<(columnas/filas))
	{
	x=(sizePlanta.x-(margen*2))-2; //quito 1px por borde (2)
	tam=Math.floor(x/(columnas/minEscala));
	}
else
	{
	y=(sizePlanta.y-(margen*2))-2; //quito 1px por borde (2)
	tam=Math.floor(y/(filas/minEscala));
	}
var anchura=tam*(columnas/minEscala);
var altura=tam*(filas/minEscala);
el.set('tamMetro',(tam/minEscala));
el.setStyle('width',(anchura+2+(margen*2))+'px');
el.setStyle('height',(altura+2+(margen*2))+'px');
el.getElements('.extHorizontal').each(function(item,index)
	{
	item.setStyle('width',(anchura)+'px');
	if (item.get('posicion')=='abajo')
		{
		item.setStyle('top',(altura+margen+2)+'px');
		}
	});
el.getElements('.extVertical').each(function(item,index)
	{
	item.setStyle('height',(altura)+'px');
	if (item.get('posicion')=='derecha')
		{
		item.setStyle('left',(anchura+margen+2)+'px');
		}
	});
el.getElements('.areaPlanta').each(function(item,index)
	{
	item.setStyle('width',(anchura)+'px');
	item.setStyle('height',(altura)+'px');
	});

var angulo=el.get('northAngle')*1;	
var dif=angulo%15;
if (dif>7)
	{
	var norte=((Math.floor(angulo/15)+1)*15)%360;
	}
else
	{
	var norte=((Math.floor(angulo/15))*15)%360;
	}
if (el.get('rotacion')=="true")
	{
	norte=(norte+90)%360;
	}
el.getElement('.areaNorte').addClass('norte'+norte);

ajustarElementosPlanta(el);
}

function mostrarEscala(el,intervalo)
{
el.set('intervalo',intervalo);
var tam=el.get('tamMetro')*1;
var columnas=el.get('columnas')*1;
var filas=el.get('filas')*1;
var valor=intervalo;
while (valor<=columnas)
	{
	var coord=new Element('div',{'class':'numCoordenada','text':valor});
	coord.setStyle('left',(((tam*valor))-3)+'px');
	el.getElements('.extHorizontal').each(function(item,index)
		{
		coord.clone().inject(item);
		});
	valor+=intervalo;
	}
var valor=intervalo;	
while (valor<=filas)
	{
	var coord=new Element('div',{'class':'numCoordenada','text':valor});
	coord.setStyle('top',(((tam*valor))-5)+'px');
	el.getElements('.extVertical').each(function(item,index)
		{
		coord.clone().inject(item);
		});
	valor+=intervalo;
	}
}

//cuadricula es un vector de 3 campos: origen de coordenadas, secuencia lado largo (columnas), secuencia lado corto(filas)
function mostrarCuadricula(el,tilesCoding)
{
var cuadricula=el.get('cuadricula')*1;
if (cuadricula!=0)
	{
	var tilesCode=JSON.decode(tilesCoding);
	if ($type(tilesCode)=='array')
		{
		var indiceColumnas=1;
		var indiceFilas=2;
		if (el.get('rotacion')=="false")
			{
			var sentidoFilas='normal';
			var sentidoColumnas='normal';
			if (tilesCode[0].substr(0,1)=='S')
				{
				sentidoFilas='reverse';
				}
			if (tilesCode[0].substr(1,1)=='E')
				{
				sentidoColumnas='reverse';
				}
			}
		if (el.get('rotacion')=="true")
			{
			var sentidoFilas='normal';
			var sentidoColumnas='normal';
			if (tilesCode[0].substr(0,1)=='N')
				{
				sentidoColumnas='reverse';
				}
			if (tilesCode[0].substr(1,1)=='E')
				{
				sentidoFilas='reverse';
				}
			}
		var tamMetro=el.get('tamMetro')*1;
		var intervalo=Math.floor(cuadricula*tamMetro);
		var columnas=el.get('columnas')*1;
		var filas=el.get('filas')*1;
		var valor=intervalo;
		var planta=el.getElement('.areaPlanta');
		var i=0;
		while (valor<=(columnas*tamMetro))
			{
			var cuadricula=new Element('div',{'class':'cuadriculaVertical'}).inject(planta);
			cuadricula.setStyle('left',valor+'px');
			if (sentidoColumnas=='reverse')
				{
				var ind2=tilesCode[indiceColumnas].length-1-i;
				}
			else
				{
				var ind2=i;
				}
			var leyendaCuadricula=new Element('div',{'class':'leyendaCuadricula','text':tilesCode[indiceColumnas][ind2],'columna':i+1}).inject(el.getElement('.extHorizontal[posicion="arriba"]'));
			leyendaCuadricula.setStyle('left',(valor-(Math.round(intervalo/2))-3)+'px');
			var leyendaCuadricula=new Element('div',{'class':'leyendaCuadricula','text':tilesCode[indiceColumnas][ind2],'columna':i+1}).inject(el.getElement('.extHorizontal[posicion="abajo"]'));
			leyendaCuadricula.setStyle('left',(valor-(Math.round(intervalo/2))-3)+'px');
			valor+=intervalo;
			i++;
			}
		var valor=intervalo;	
		var i=0;
		while (valor<=(filas*tamMetro))
			{
			var cuadricula=new Element('div',{'class':'cuadriculaHorizontal'}).inject(planta);
			cuadricula.setStyle('top',valor+'px');
			if (sentidoFilas=='reverse')
				{
				var ind2=tilesCode[indiceFilas].length-1-i;
				}
			else
				{
				var ind2=i;
				}
			var leyendaCuadricula=new Element('div',{'class':'leyendaCuadricula','text':tilesCode[indiceFilas][ind2],'fila':i+1}).inject(el.getElement('.extVertical[posicion="izquierda"]'));
			leyendaCuadricula.setStyle('top',(valor-(Math.round(intervalo/2))-3)+'px');
			var leyendaCuadricula=new Element('div',{'class':'leyendaCuadricula','text':tilesCode[indiceFilas][ind2],'fila':i+1}).inject(el.getElement('.extVertical[posicion="derecha"]'));
			leyendaCuadricula.setStyle('top',(valor-(Math.round(intervalo/2))-3)+'px');
			valor+=intervalo;
			i++;
			}
		var valor=intervalo;	
		$$('.numCoordenada').addClass('oculto');
		planta.addEvent('mousemove',function(e){
			resaltarCuadricula(e);
			});
		}
	}
}

function resaltarCuadricula(e)
{
$$('.leyendaCuadricula').removeClass('leyCuadResaltada');
var baldosa=getNumBaldosa(e);
$$('.leyendaCuadricula[columna="'+baldosa[0]+'"]').addClass('leyCuadResaltada');
$$('.leyendaCuadricula[fila="'+baldosa[1]+'"]').addClass('leyCuadResaltada');
}

function desactivarRuler(el, planta)
{
el.removeClass('rulerActive');
el.set('title','activate ruler');
rulerActive=false;
cancelarDibujoSobrePlanta($(planta));
$$('.rulerUnits').addClass('oculto');
$$('.rulerResult').each(function(item){item.set('text','')});
}

function activarReglaFloorplan(e, planta)
{
if (e.target.hasClass('rulerActive'))
	{
	desactivarRuler(e.target, planta)
	}
else
	{
	if (dibujando)
		{
		alert('Please complete first the drawing');
		}
	else
		{
		e.target.addClass('rulerActive');
		e.target.set('title','desactivate ruler');
		rulerActive=true;
		dibujando=true;
		activarDibujoSobrePlanta($(planta));
		verticesTotales=0;
		$$('.rulerUnits').removeClass('oculto');
		$$('.rulerResult').each(function(item){item.set('text','0')});
		}
	}
}

function isBox(linea)
{
/*var res=false;
if (linea.getNext('div'))
	{
	if (linea.getNext('div').hasClass('lineaBox'))
		{var res=true;}
	}
return res;*/
return linea.hasClass('lineaBox');
}

function permitirDibujo(el,planta)
{
if (dibujando)
	{
	alert("Already on draw/ruler mode. Please cancel or save previous drawing");
	}
else
	{
	var linea=el.getParent('.lineaDatos');
	lineaDibujo=linea.get('linea')*1;
	dibujando=true;
	activarDibujoSobrePlanta(planta);
	tablaDibujo=el.getParent('.tablaDiv').get('id');
	if (isBox(linea))
		{
		/*permitirEdicion(linea.getElement('.valor[Campo="Container"]'));
		var box=linea.getNext('.lineaBox');
		permitirEdicion(box.getElement('.valor[Campo="XSize"]'));
		permitirEdicion(box.getElement('.valor[Campo="XPos"]'));
		permitirEdicion(box.getElement('.valor[Campo="YSize"]'));
		permitirEdicion(box.getElement('.valor[Campo="YPos"]'));*/
		permitirEdicion(linea.getElement('.valor[Campo="XSize"]'));
		permitirEdicion(linea.getElement('.valor[Campo="XPos"]'));
		permitirEdicion(linea.getElement('.valor[Campo="YSize"]'));
		permitirEdicion(linea.getElement('.valor[Campo="YPos"]'));	
		linea.getParent('form').set('tablaForm','Boxes');
		//linea.getParent('form').set('idForm',box.get('linea'));
		linea.getParent('form').set('idForm',getValorLinea(linea,'Box'));
		//linea.getParent('form').set('linea',box.get('linea'));
		linea.getParent('form').set('linea',getValorLinea(linea,'Box'));
		}
	else
		{
		if (linea.getElement('.valor[Campo="XSize"]'))
			{
			permitirEdicion(linea.getElement('.valor[Campo="XSize"]'));
			permitirEdicion(linea.getElement('.valor[Campo="XPos"]'));
			permitirEdicion(linea.getElement('.valor[Campo="YSize"]'));
			permitirEdicion(linea.getElement('.valor[Campo="YPos"]'));		
			}
		if (linea.getElement('.valor[Campo="Route"]'))
			{
			permitirEdicion(linea.getElement('.valor[Campo="Route"]'));
			linea.getElement('input[name="Route"]').value='';
			}
		}
	var tabla=linea.getParent('.tablaDiv').get('tabla');
	switch (tabla)
		{
		case 'Doors':
		verticesTotales=2;
		break;
		case 'Cages':
		verticesTotales=0;
		break;
		default:
		verticesTotales=3;
		}
	}
}

function normalizar(el,posicionCursor,offsetX,offsetY)
{
//posicionCursor es el resultado de getPosicionPlanta (px) Offsets en metros
var posNormal=new Array();
var totalx=el.get('columnas')*1;
var tamMetro=el.get('tamMetro')*1;
if (el.get('rotacion')=="true")
	{
	posNormal[0]=Math.floor(posicionCursor[1]/tamMetro)-offsetX;
	posNormal[1]=totalx-Math.floor(posicionCursor[0]/tamMetro)-offsetY;
	}
else
	{
	posNormal[0]=Math.floor(posicionCursor[0]/tamMetro)-offsetX;
	posNormal[1]=Math.floor(posicionCursor[1]/tamMetro)-offsetY;
	}
return posNormal;	
	
}

function habitacionCompletada(el)
{
var nuevaHab=el.getElement('.nuevaHabitacion');
var tamMetro=el.getParent('.floorWrapper').get('tamMetro')*1;
var minEscala=el.getParent('.floorWrapper').get('minimaEscala')*1;
var totalx=el.getParent('.floorWrapper').get('columnas')*1;
var escala=tamMetro*minEscala;
var posy=(Math.floor(parseInt(nuevaHab.getStyle('top'))/escala))*minEscala;
var posx=(Math.floor(parseInt(nuevaHab.getStyle('left'))/escala))*minEscala;
var sizex=(Math.floor((parseInt(nuevaHab.getStyle('width'))+2)/escala))*minEscala;
var sizey=(Math.floor((parseInt(nuevaHab.getStyle('height'))+2)/escala))*minEscala;
var linea=$(tablaDibujo).getElement('.lineaDatos[linea="'+lineaDibujo+'"]');
/*if (isBox(linea))
	{
	linea=linea.getNext('.lineaBox');
	}*/
if (el.getParent('.floorWrapper').get('rotacion')=="true")
	{
	linea.getElement('input[name="YSize"]').value=sizex;
	linea.getElement('input[name="XSize"]').value=sizey;
	linea.getElement('input[name="YPos"]').value=totalx-posx-sizex;//transformación al rotar 90º
	linea.getElement('input[name="XPos"]').value=posy;
	}
else
	{
	linea.getElement('input[name="XSize"]').value=sizex;
	linea.getElement('input[name="YSize"]').value=sizey;
	linea.getElement('input[name="XPos"]').value=posx;
	linea.getElement('input[name="YPos"]').value=posy;
	}

if (linea.getParent('.tablaDiv').hasClass('relativePosition'))
	{
	if (typeof(thisRoomX)!='undefined')
		{
		if (!linea.getElement('input[name="offsetX"]'))
			{
			new Element('input',{'class':'oculto','name':'offsetX','value':thisRoomX}).inject(linea.getElement('.celda[campo="XPos"]'),'before');
			new Element('input',{'class':'oculto','name':'offsetY','value':thisRoomY}).inject(linea.getElement('.celda[campo="YPos"]'),'before');
			}
		}
	}
}

var verticesSeleccionados=0;
var posicionesVertices=new Array();

function informacionCursor(el)
{
el.addEvent('mousemove',function(e){
		ratonMoviendo(e);
		});
el.addEvent('mouseleave',function(e){
		$$('.leyendaCuadricula').removeClass('leyCuadResaltada');
		$$('.infoFloorPlan div').each(function(item,index)
			{
			item.addClass('oculto');
			});
		});
el.addEvent('mouseenter',function(e){
		$$('.infoFloorPlan div').each(function(item,index)
			{
			item.removeClass('oculto');
			});
		});
}

function cancelarDibujoSobrePlanta(planta)
{
var areaPlanta=planta.getFirst('.areaPlanta');
quitarDibujo(areaPlanta,'pared');
quitarDibujo(areaPlanta,'muro');
quitarDibujo(areaPlanta,'nuevaHabitacion');
dibujando=false;
tablaDibujo='';
lineaDibujo=0;
$$('.infoFloorPlan').each(function(info)
	{
	info.getElements('.espacioAreas').each(function(item)
		{item.empty();});
	});
}

var cuentaClicksPlanta=0;

function clickDibujarPlanta(evento)
{
if (evento.target.hasClass('areaPlanta'))
	{
	var planta=evento.target;
	}
else	
	{
	var planta=evento.target.getParent('.areaPlanta');
	}
cuentaClicksPlanta++;
setTimeout(function(){checkDibujarPlanta(planta,evento)},300);
}

function checkDibujarPlanta(planta,evento)
{
if (cuentaClicksPlanta>0)
	{
	if (cuentaClicksPlanta==2)
		{dosClicksPlanta(planta,evento);}
	else
		{unClickPlanta(planta,evento);}
	cuentaClicksPlanta=0;
	}
}

function dosClicksPlanta(planta,evento)
{
planta.getElements('.nuevaHabitacion').destroy();
var nuevaHab=new Element('div',{'class':'nuevaHabitacion'}).inject(planta);
var numBaldosa=getNumBaldosa(evento);
var baldosa=getCoordBaldosa(evento.target,numBaldosa);
nuevaHab.setStyle('left',baldosa[0]+'px');
nuevaHab.setStyle('width',(baldosa[1]-1)+'px');
nuevaHab.setStyle('top',baldosa[2]+'px');
nuevaHab.setStyle('height',(baldosa[3]-1)+'px');
planta.removeEvents('click');
if (typeof(habitacionCompletada)=='function')
	{habitacionCompletada(planta);}
}

function unClickPlanta(planta,evento)
{
var coord=getPosicionPlanta(evento);
verticeSeleccionado(coord,evento.target);
planta.removeEvents('click');
dibujarParedes(planta,'ambas');
}

function activarDibujoSobrePlanta(planta)
{
	//necesita variables globales verticesSeleccionados y posicionesVertices
	var areaPlanta=planta.getFirst('.areaPlanta');
	posicionesVertices=new Array();
	verticesSeleccionados=0;
	if (planta.get('cuadricula'))
		{
		cuentaClicksPlanta=0;
		areaPlanta.addEvent('click',function(e)
			{clickDibujarPlanta(e)});
		}
	else
		{
		areaPlanta.addEvent('click',function(e){
		var coord=getPosicionPlanta(e);
		verticeSeleccionado(coord,e.target);
		if (e.target.hasClass('areaPlanta'))
			{
			var planta=e.target;
			}
		else	
			{
			var planta=e.target.getParent('.areaPlanta');
			}
		planta.removeEvents('click');
		dibujarParedes(planta,'ambas');
		});
		}
}

function seguimientoParedes(el)
{
el.getElements('.pared').each(function(item,index)
	{
	item.addEvent('mousemove',function(e)
		{
		var pared=e.target;
		if (!pared.hasClass('pared'))
			{
			pared=e.target.getParent('.pared');
			}
		var posicion=getPosicionPlanta(e);
		var floor=e.target.getParent('.floorWrapper');
		var tamMetro=floor.get('tamMetro')*1;
		var minEscala=floor.get('minimaEscala')*1;
		var escala=tamMetro*minEscala;
		$$('.infoFloorPlan').each(function(item,index)
			{
			var espacioAreas=item.getFirst('.espacioAreas');
			var vertices=posicionesVertices.length;
			var ultCoord=posicionesVertices[vertices -1];
			var altura=0;
			var anchura=0;
			if (pared.hasClass('horizontal'))
				{
				anchura=Math.abs(posicion[0]-ultCoord[0]);
				if (vertices>1)
					{
					var prevCoord=posicionesVertices[vertices -2];
					altura=Math.abs(posicion[1]-prevCoord[1]);
					}
				}
			else
				{
				altura=Math.abs(posicion[1]-ultCoord[1]);
				if (vertices>1)
					{
					var prevCoord=posicionesVertices[vertices -2];
					anchura=Math.abs(posicion[0]-prevCoord[0]);
					}
				}
			var base1 =10;
			var dn=Math.log(base1);
			var decimales=Math.round(Math.log(1/minEscala)/dn);
			espacioAreas.set('html','width: '+((Math.floor(anchura/escala))*minEscala).decimal(decimales)+'m<br/>height: ' + ((Math.floor(altura/escala))*minEscala).decimal(decimales)+ 'm');
			});
		});
	
	});
}

function ratonMoviendo(e)
{
var posicion=getPosicionPlanta(e);
var floor=e.target.getParent('.floorWrapper');
var tam=floor.get('tamMetro')*1;
var minEscala=floor.get('minimaEscala')*1;
var escala=tam*minEscala;
$$('.infoFloorPlan').each(function(item,index)
	{
	var espacioPosicion=item.getFirst('.espacioPosicion');
	var base1 =10;
	var dn=Math.log(base1);
	var decimales=Math.round(Math.log(1/minEscala)/dn);
	espacioPosicion.set('html','x: '+((Math.floor(posicion[0]/escala))*minEscala).decimal(decimales)+'m<br/>y: ' + ((Math.floor(posicion[1]/escala))*minEscala).decimal(decimales)+ 'm');
	});
}

function dibujarParedes(el,tipo)
{
var ultCoord=posicionesVertices[posicionesVertices.length -1];
if ((tipo=='ambas') || (tipo=='horizontal'))
	{
	var pared=new Element('div',{'class':'pared horizontal'}).inject(el);
	var altura=ultCoord[1]*1;
	pared.setStyle('top',(altura)+'px');
	pared.addEvent('click',function(e){
		var coord=getPosicionPlanta(e);
		var noUltimo=verticeSeleccionado(coord,e.target);
		quitarDibujo(e.target,'pared');
		fijarUltimoMuro(el,'horizontal');
		if (noUltimo)
			{
			dibujarParedes(el,'vertical');
			}
		else
			{
			completarHabitacion(el);
			}
		});	
	}
if ((tipo=='ambas') || (tipo=='vertical'))
	{
	var pared=new Element('div',{'class':'pared vertical'}).inject(el);
	var izquierda=ultCoord[0]*1;
	pared.setStyle('left',(izquierda)+'px');
	pared.addEvent('click',function(e){
		var coord=getPosicionPlanta(e);
		var noUltimo=verticeSeleccionado(coord,e.target);
		quitarDibujo(e.target,'pared');
		fijarUltimoMuro(el,'vertical');
		if (noUltimo)	
			{
			dibujarParedes(el,'horizontal');
			}
		else
			{
			completarHabitacion(el);
			}
		});	
	}
seguimientoParedes(el);
}

function completarHabitacion(el)
{
var height=0;
var width=0;
var left=0;
var top=0;
switch (verticesTotales)
	{
	case 3:
		var vertical=el.getElement('.muro.vertical');
		var horizontal=el.getElement('.muro.horizontal');
		height=vertical.getStyle('height')
		width=horizontal.getStyle('width');
		left=horizontal.getStyle('left');
		top=vertical.getStyle('top');
		break;
	case 2:
		if (el.getElement('.muro.vertical'))
			{
			var muro=el.getElement('.muro.vertical');
			height=muro.getStyle('height');
			width='0px';
			}
		else
			{
			var muro=el.getElement('.muro.horizontal');
			width=muro.getStyle('width');
			height='0px';
			}
		left=muro.getStyle('left');
		top=muro.getStyle('top');
		
		break;
	case 0:
		break;
		
	}
var nuevaHab=new Element('div',{'class':'nuevaHabitacion'}).inject(el);
nuevaHab.setStyle('height',height);
nuevaHab.setStyle('width',width);
nuevaHab.setStyle('left',left);
nuevaHab.setStyle('top',top);
el.getElements('.muro').each(function(item,index)
	{item.destroy();});
if (typeof(habitacionCompletada)=='function')
	{habitacionCompletada(el);}
}

function fijarUltimoMuro(el,tipo)
{
var ultCoord=posicionesVertices[posicionesVertices.length -1];
var prevCoord=posicionesVertices[posicionesVertices.length -2];
if (tipo=='horizontal')
	{
	var pared=new Element('div',{'class':'muro horizontal'}).inject(el);
	var altura=ultCoord[1]*1;
	pared.setStyle('top',(altura)+'px');
	var x1=ultCoord[0]*1;
	var x2=prevCoord[0]*1;
	if (x2<x1)
		{
		pared.setStyle('left',(x2)+'px');
		pared.setStyle('width',((x1-x2)-2)+'px');
		}
	else
		{
		pared.setStyle('left',(x1)+'px');
		pared.setStyle('width',((x2-x1)-2)+'px');
		}
	}
if (tipo=='vertical')
	{
	var pared=new Element('div',{'class':'muro vertical'}).inject(el);
	var izq=ultCoord[0]*1;
	pared.setStyle('left',(izq)+'px');
	var y1=ultCoord[1]*1;
	var y2=prevCoord[1]*1;
	if (y2<y1)
		{
		pared.setStyle('top',(y2)+'px');
		pared.setStyle('height',((y1-y2)-2)+'px');
		}
	else
		{
		pared.setStyle('top',(y1)+'px');
		pared.setStyle('height',((y2-y1)-2)+'px');
		}
	}

}

function quitarDibujo(el,clase)
{
if (el.hasClass('areaPlanta'))
	{
	var planta=el;
	}
else	
	{
	var planta=el.getParent('.areaPlanta');
	}
planta.getElements('.'+clase).each(function(item,index)
	{
	item.destroy();
	});
}

function zoomOut()
{
if (!dibujando)
	{
	el=$('floorPlan');
	var currentSize=el.get('tamMetro')*1;
	var minEscala=el.get('minimaEscala')*1;
	var incremento=1/minEscala;
	if (currentSize>incremento)
		{
		var newSize=currentSize-incremento;
		el.set('tamMetro',newSize);
		redibujarPlanta();
		}
	else
		{
		alert('You have reached the minimum scale');
		}
	}
else
	{
	alert('Please complete drawing/measure before.');
	}
}

function zoomIn()
{
if (!dibujando)
	{
	el=$('floorPlan');
	var currentSize=el.get('tamMetro')*1;
	var minEscala=el.get('minimaEscala')*1;
	var incremento=1/minEscala;
	var newSize=currentSize+incremento;
	el.set('tamMetro',newSize);
	redibujarPlanta();
	}
else
	{
	alert('Please complete drawing/measure before.');
	}
}


function redibujarPlanta()
{
var margen=20;
el=$('floorPlan');
var newSize=el.get('tamMetro')*1;
var minEscala=el.get('minimaEscala')*1;
var columnas=el.get('columnas')*1;
var filas=el.get('filas')*1;
var tam=newSize*minEscala;
var anchura=tam*(columnas/minEscala);
var altura=tam*(filas/minEscala);
el.setStyle('width',(anchura+2+(margen*2))+'px');
el.setStyle('height',(altura+2+(margen*2))+'px');
el.getElements('.extHorizontal').each(function(item,index)
	{
	item.setStyle('width',(anchura)+'px');
	if (item.get('posicion')=='abajo')
		{
		item.setStyle('top',(altura+margen+2)+'px');
		}
	});
el.getElements('.extVertical').each(function(item,index)
	{
	item.setStyle('height',(altura)+'px');
	if (item.get('posicion')=='derecha')
		{
		item.setStyle('left',(anchura+margen+2)+'px');
		}
	});
el.getElements('.areaPlanta').each(function(item,index)
	{
	item.setStyle('width',(anchura)+'px');
	item.setStyle('height',(altura)+'px');
	});

var intervalo=el.get('intervalo')*1;
el.getElements('.extHorizontal').each(function(item,index)
	{
	var coords=item.getElements('.numCoordenada');
	var valor=intervalo;
	var i=0;
	while (valor<=columnas)
		{
		coords[i].setStyle('left',(((newSize*valor))-3)+'px');
		i++;
		valor+=intervalo;
		}
	});

el.getElements('.extVertical').each(function(item,index)
	{
	var coords=item.getElements('.numCoordenada');
	var valor=intervalo;
	var i=0;
	while (valor<=filas)
		{
		coords[i].setStyle('top',(((newSize*valor))-5)+'px');
		i++;
		valor+=intervalo;
		}
	});

if (el.getElement('.cuadriculaVertical'))
	{
	var cuadricula=el.get('cuadricula')*1;
	if (cuadricula!=0)
		{
		var tamMetro=newSize;
		var intervalo=Math.floor(cuadricula*tamMetro);
		var planta=el.getElement('.areaPlanta');
		var i=0;
		
		var valor=intervalo;
		var verticales=el.getElements('.cuadriculaVertical');
		verticales.each(function(item){
			item.setStyle('left',valor+'px');
			valor+=intervalo;});
		valor=intervalo;
		var horizontales=el.getElements('.cuadriculaHorizontal');
		horizontales.each(function(item){
			item.setStyle('top',valor+'px');
			valor+=intervalo;});
		
		el.getElements('.extHorizontal').each(function(ext)
			{
			valor=intervalo;
			var horizontales=ext.getElements('.leyendaCuadricula');
			horizontales.each(function(item){
				item.setStyle('left',(valor-(Math.round(intervalo/2))-3)+'px');
				valor+=intervalo;});
			
			});
		el.getElements('.extVertical').each(function(ext)
			{
			valor=intervalo;
			var verticales=ext.getElements('.leyendaCuadricula');
			verticales.each(function(item){
				item.setStyle('top',(valor-(Math.round(intervalo/2))-3)+'px');
				valor+=intervalo;});
			
			});
		}
	}
	
	
ajustarElementosPlanta(el);


}

function verticeSeleccionado(coord,el)
{
verticesSeleccionados++;
posicionesVertices.push(coord);

if (rulerActive)
	{
	if (posicionesVertices.length>1)
		{
		var coordAnterior=posicionesVertices[posicionesVertices.length-2];
		var tamMetro=el.getParent('.floorWrapper').get('tamMetro')*1;
		var minEscala=el.getParent('.floorWrapper').get('minimaEscala')*1;
		var escala=tamMetro*minEscala;
		var size=((Math.floor(Math.abs(coord[0]-coordAnterior[0])/escala))*minEscala)+((Math.floor(Math.abs(coord[1]-coordAnterior[1])/escala))*minEscala);
		$$('.rulerResult').each(function(item){
			var valor=item.get('text')*1;
			valor+=size;
			item.set('text',valor.decimal(1))
			});
		}
	}
else
	{
	if ($(tablaDibujo).getElement('.primaryLine[linea="'+lineaDibujo+'"]'))
		{//siempre ajusta a valores absolutos
		var rutaActual=$(tablaDibujo).getElement('.primaryLine[linea="'+lineaDibujo+'"]').getElement('input[name="Route"]').value;
		var totalx=el.getParent('.floorWrapper').get('columnas')*1;
		var tamMetro=el.getParent('.floorWrapper').get('tamMetro')*1;
		var minEscala=el.getParent('.floorWrapper').get('minimaEscala')*1;
		var escala=tamMetro*minEscala;
		var posx=(Math.floor(coord[0]/escala))*minEscala;
		var posy=(Math.floor(coord[1]/escala))*minEscala;
		if (el.getParent('.floorWrapper').get('rotacion')=="true")
			{
			if (typeof(thisRoomX)!='undefined')
				{
				posy=thisRoomX+posy;
				posx=thisRoomY+totalx-posx;
				}
			var nuevoPunto=new Array(posy,posx);
			}
		else
			{
			if (typeof(thisRoomX)!='undefined')
				{
				posy=thisRoomY+posy;
				posx=thisRoomX+posx;
				}
			var nuevoPunto=new Array(posx,posy);
			}
		var nuevaRuta=nuevoPunto[0]+','+nuevoPunto[1];
		if (rutaActual!='')
			{
			var puntos=rutaActual.split(',');
			var previox=puntos[puntos.length-2]*1;
			var previoy=puntos[puntos.length-1]*1;
			if (Math.abs(nuevoPunto[0]-previox)>Math.abs(nuevoPunto[1]-previoy))
				{
				var nuevoPuntox=parseInt(nuevoPunto[0] * (1/minEscala)) / (1/minEscala);
				nuevaRuta=rutaActual+','+nuevoPuntox+','+previoy;
				}
			else
				{
				var nuevoPuntoy=parseInt(nuevoPunto[1] * (1/minEscala)) / (1/minEscala);
				nuevaRuta=rutaActual+','+previox+','+nuevoPuntoy;
				}
			}
		$(tablaDibujo).getElement('.primaryLine[linea="'+lineaDibujo+'"]').getElement('input[name="Route"]').value=nuevaRuta;
		}
	}

if (verticesSeleccionados == verticesTotales)
	{
	//elemento completada
	return 0;
	}
else
	{
	return 1;
	}
}

function getPosicionPlanta(e)
{
		if (e.target.hasClass('areaPlanta'))
			{
			var planta=e.target;
			}
		else	
			{
			var planta=e.target.getParent('.areaPlanta');
			}
		var contenedor=planta.getParent('.contenedorFloor');
		var wrapper=planta.getParent('.floorWrapper');
		var escala=(wrapper.get('minimaEscala')*1)*(wrapper.get('tamMetro')*1);
		var posCursor=e.page;
		var posPlanta=planta.getPosition();
		var coordx=posCursor.x-posPlanta.x;
		coordx-=(coordx%escala);
		var coordy=posCursor.y-posPlanta.y;
		coordy-=(coordy%escala);
		/*
		var scroll=contenedor.getScroll();
		var coordx=posCursor.x-posPlanta.x+scroll.x;
		var coordy=posCursor.y-posPlanta.y+scroll.y;*/
		return new Array(coordx,coordy);
}

function getNumBaldosa(e)
{
var coord=getPosicionPlanta(e);
var wrapper=e.target.getParent('.floorWrapper');
var cuadricula=wrapper.get('cuadricula')*1;
var tamMetro=wrapper.get('tamMetro')*1;
var intervalo=Math.floor(cuadricula*tamMetro);
var numColumna=(Math.floor(coord[0]/intervalo))+1; //empieza por 1
var numFila=(Math.floor(coord[1]/intervalo))+1; //empieza por 1
return new Array(numColumna,numFila);
}

function getCoordBaldosa(el,numBaldosa)
{
var wrapper=el.getParent('.floorWrapper');
var cuadricula=wrapper.get('cuadricula')*1;
var tamMetro=wrapper.get('tamMetro')*1;
var intervalo=Math.floor(cuadricula*tamMetro);
var left=(numBaldosa[0]-1)*intervalo;
var top=(numBaldosa[1]-1)*intervalo;
var tam=intervalo-1;
return new Array(left, tam,top,tam);
}

function situarElementos(el,domElements)
{
var tam=el.get('tamMetro')*1;
var totalx=el.get('columnas')*1;
var totaly=el.get('filas')*1;
var tamañoFloor=totalx*totaly;
var rotacion=el.get('rotacion');
el.getElements(domElements).each(function(item,index)
	{
	var offsetX=0;
	var offsetY=0;
	if (item.get('grados'))
		{
		var offset=item.get('offset')*1;
		var grados=item.get('grados')*1;
		var claseBase=item.get('claseBase');
		if (rotacion!='false')
			{
			grados=(grados+90)%360;
			}
		if (grados<100)
			{claseBase=claseBase+'0'+grados;}
		else
			{claseBase=claseBase+grados;}
		item.addClass(claseBase);
		
		if (grados>180)
			{grados=grados-360;}
		if (Math.abs(grados)!=90)
			{
			if (Math.abs(grados)>90)
				{offsetY=offset;}
			else
				{offsetY=-1*offset;}
			}
		
		if (grados%180!=0)
			{
			if (grados>0)
				{offsetX=offset;}
			else
				{offsetX=-1*offset;}
			}
		
		
		}
	var posx=item.get('xpos')*1;
	var posy=item.get('ypos')*1;
	var sizex=item.get('xsize')*1;
	var sizey=item.get('ysize')*1;
	if (!item.hasClass('suite'))
		{
		var zindex=100-(Math.round(((sizex*sizey)/tamañoFloor)*100));
		item.setStyle('z-index',zindex);
		}
	if (rotacion=='false')
		{
		item.setStyle('left',((tam*posx)+offsetX)+'px');
		item.setStyle('top',((tam*posy)+offsetY)+'px');
		if (sizex!=0)
			{item.setStyle('width',((tam*sizex)-1)+'px');}//siempre hay un borde de 1. queremos que los bordes de elementos contiguos se solapen
		if (sizey!=0)
			{item.setStyle('height',((tam*sizey)-1)+'px');}
		}
	else
		{
		item.setStyle('left',((tam*(totalx-posy-sizey))+offsetX)+'px');
		item.setStyle('top',((tam*posx)+offsetY)+'px');
		if (sizey!=0)
			{item.setStyle('width',((tam*sizey)-1)+'px');}
		if (sizex!=0)
			{item.setStyle('height',((tam*sizex)-1)+'px');}
		}
	});

}


function ajustarElementosPlanta(el)
{
situarElementos(el,'.elementoPlanta');
situarElementos(el,'.elementoFoto');
}

function mostrarElementosPlano(check)
{
if (check.checked)
	{
	$$('.'+check.get('targetClass')).removeClass('oculto');
	}	
else
	{
	$$('.'+check.get('targetClass')).addClass('oculto');
	}
}

function nuevaLayer(layerName,clase,targetClass)
{
if ($('listaLayers').getElement('.clear'))
	{
	var clear=$('listaLayers').getElement('.clear');
	}
else
	{
	var clear=new Element('div',{'class':'clear'}).inject($('listaLayers'));
	}
var item=new Element('div',{'class':'itemLayer','layer':layerName}).inject(clear,'before');
var input=new Element('input',{'class':'conTip','targetClass':targetClass,'type':'checkbox','name':layerName,'value':layerName,'checked':'true','title':'Show/Hide the layer '+layerName}).inject(item);
new Element('span',{'class':clase,'text':layerName}).inject(input,'after');
input.addEvent('change',function(evento){mostrarElementosPlano(evento.target);});
}

function llevarAlFrente(clase)
{
$$(clase).each(function(item){
	var z=item.getStyle('z-index')*1;
	item.setStyle('z-index',(z+1));
	
	});
}

function igualarZ(clase)
{
$$(clase).each(function(item){
	var z=item.getStyle('z-index')*1;
	item.setStyle('z-index',(z-1));
	
	});
}
