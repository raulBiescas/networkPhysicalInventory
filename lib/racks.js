/*!
 * racks.js
 * https://github.com/raulBiescas/networkPhysicalInventory
 * Version: 1.0.0
 *
 * Copyright 2021 racks.js Contributors
 * Released under the GNU General Public License v3.0
 * https://github.com/raulBiescas/networkPhysicalInventory/blob/main/LICENSE
 */


function getInfoForRack(rackId,contenedor)
{
	$(contenedor).getElement('.rackLayout').load('ajax/rackLayout.php?idRack='+rackId+'&contenedor='+contenedor);
	$(contenedor).getElement('.espacioTablaRackPictures').load('ajax/rackPictures.php?idRack='+rackId+'&contenedor='+contenedor);
}

function rackPrepare(lineaRack,contenedor,uMarcada)
{
uMarcada = typeof uMarcada !== 'undefined' ? uMarcada : 0;
var idRack=lineaRack.get('linea');
$(contenedor).getElement('.rackHeader').set('idRack',idRack);
$(contenedor).getElement('.rackLayout').empty();
$(contenedor).getElement('.rackPictures').empty();
$(contenedor).getElement('.rackHeader').empty();
$(contenedor).getElement('.UsArea').empty();
$(contenedor).getElement('.rackPicturesLeft').empty();
$(contenedor).getElement('.rackPictures').set('vista','FRONT');
var usRack=getValorLinea(lineaRack,'Us')*1;
var us=(Math.floor(usRack/10)+1)*10;
var heightRack=Math.floor(usRack*100/us);
var i=us;

new Element('div',{'class':'currentView','text':'FRONT VIEW','current':'front'}).inject($(contenedor).getElement('.rackHeader'));
var changeView=new Element('div',{'class':'changeView','text':'see rear'}).inject($(contenedor).getElement('.rackHeader'));
changeView.addEvent('click',function(e){changeViewRack(e.target);});

if ($(contenedor).hasClass('todoVisto'))
	{
	var altura=$(contenedor).getSize().y - $(contenedor).getElement('.rackHeader').getSize().y;
	var alto1U=Math.floor(altura/us);
	var alto10Us=alto1U*10;
	var anchoRack=Math.round(alto10Us*1.5);
	$(contenedor).getElement('.rackLayout').setStyle('width',anchoRack+'px');
	$(contenedor).getElement('.rackLayout').set('uMarcada',uMarcada);
	$(contenedor).getElement('.UsArea').setStyle('width','25px');
	$(contenedor).getElement('.UsArea').setStyle('left',(anchoRack)+'px');
	$(contenedor).getElement('.rackPicturesLeft').setStyle('width','25px');
	$(contenedor).getElement('.rackPicturesLeft').setStyle('left',(anchoRack+25)+'px');
	$(contenedor).getElement('.rackPictures').setStyle('width',anchoRack+'px');
	$(contenedor).getElement('.rackPictures').setStyle('left',(anchoRack+50)+'px');
	}
else
	{
	var width=$(contenedor).getElement('.rackDetails').getSize().x;
	var anchoRack=width*0.45;
	var alto10Us=Math.round(anchoRack/1.5);
	var alto1U=Math.round(alto10Us/10);
	}
$(contenedor).getElement('.rackDetails').setStyle('height',(alto1U*us)+'px');	
$(contenedor).getElement('.rackLayout').setStyle('height',heightRack+'%');

	
while (i>0)
	{
	new Element('div',{'class':'uLegend','text':i}).inject($(contenedor).getElement('.UsArea'));
	i=i-2;
	}
var margenULegend=(2*alto1U)-11;
$(contenedor).getElements('.uLegend').each(function(item){item.setStyle('margin-bottom',margenULegend+'px');});

var i=us;
while (i>0)
	{
	var posFoto=(us-i)/10;
	if (i>10)
		{
		var bottom=(posFoto*alto10Us)+Math.round(alto10Us/2)-8;
		}
	else
		{
		var bottom=(posFoto*alto10Us)+Math.round((alto1U*i)/2)-8;
		}
	var nuevaFoto=new Element('div',{'class':'botonNewPictureRack iconoAddFoto showOnEdit','ZPos':(posFoto*10),'title':'add/replace picture'}).inject($(contenedor).getElement('.rackPicturesLeft'));	
	nuevaFoto.setStyle('bottom',bottom+'px');
	nuevaFoto.addEvent('click',function(e){nuevaFotoRack(e.target);});
	i=i-10;
	}
var botonEditarImagenes=new Element('div',{'class':'botonEditarImagenes conTip showOnEdit','title':'edit images'}).inject($(contenedor).getElement('.rackPicturesLeft'));
var noValidPicturesButton=new Element('div',{'id':'noValidPicturesButton','style':'position:absolute;right:30px;', 'class':'botonLink oculto','tablaSup':'Racks', 'idTabla':idRack, 'text':'all deprecated'}).inject($(contenedor).getElement('.currentView'));
botonEditarImagenes.addEvent('click',function(e)
	{
	var galeria=e.target.getParent('.rackDetails');
	galeria.getElements('.thumbRackItem').each(function(imagen)
		{
		botonesEdicionImagen(imagen)
		});
	e.target.setStyle('display','none');
	$('noValidPicturesButton').removeClass('oculto');
	$('noValidPicturesButton').addEvent('click',function(e)
		{
		picturesNoLongerValid(e);
		});
	});

if ($('edicionGlobal').get('modoEdicion')=='1')
	{
	$$('.botonNewPictureRack').setStyle('display','block');
	$$('.botonEditarImagenes').setStyle('display','block');
	}

$(contenedor).getElement('.rackDetails').set('alturaU',alto1U);
$(contenedor).getElement('.rackDetails').set('usRack',us);
}

function nuevaFotoRack(el)
{
var padre=el.getParent('.rackInfoRacks');
padre.getElement('.areaNuevoFichero').removeClass('oculto');
//Tabla IdTabla View ZPos
$('formPictureRacks').getElement('input[name="Tabla"]').value="Racks";
$('formPictureRacks').getElement('input[name="IdTabla"]').value=padre.getElement('.rackHeader').get('idRack');
$('formPictureRacks').getElement('input[name="View"]').value=padre.getElement('.rackPictures').get('vista');
$('formPictureRacks').getElement('input[name="ZPos"]').value=el.get('ZPos');
}

function rackMount(tablaRack,contenedor)
{
var alturaU=$(contenedor).getElement('.rackDetails').get('alturaU')*1;
var usRack=$(contenedor).getElement('.rackDetails').get('usRack')*1;
var uMarcada=$(contenedor).getElement('.rackLayout').get('uMarcada')*1;
$(tablaRack).getElements('.lineaDatos').each(function(linea)
	{
	//'Name', 'Vendor','Model','Type', 'SystemName', 'RMU', 'Us','FrontDirection'. 'Mounting' para Eq
	//'Name',  'RMU', 'Us','FrontDirection','Mounting' para Panels (+ SystemName), PowerChassis, Batteries, RackSpace
	var id=linea.get('linea');
	var view=getValorLinea(linea,'FrontDirection');
	var u=linea.getElement('.celda[campo="RMU"]').getFirst('.valor').get('text')*1;
	var us=linea.getElement('.celda[campo="Us"]').getFirst('.valor').get('text')*1;
	var nombre=linea.getElement('.celda[campo="Name"]').getFirst('.valor').get('text');
	var mounting=getValorLinea(linea,'Mounting');
	var currentView=$(contenedor).getElement('.rackDetails').getElement('.rackPictures').get('vista');
	if (currentView=='FRONT')
		{
		currentView='Front';
		}
	else
		{
		currentView='Rear';
		}
	var chassis=new Element('div',{'class':'chassis','current':currentView,'view':view,'mounting':mounting,'RMU':u,'table':linea.get('tabla'),'tableId':linea.get('linea')}).inject($(contenedor).getElement('.rackLayout'));
	//chassis.setStyle('top',(((usRack+1)-(u+us))*alturaU)+'px');
	chassis.setStyle('bottom',((u-1)*alturaU)+'px');
	chassis.setStyle('height',(us*alturaU)+'px');
	ajustarChassis(chassis);
	if ((us*alturaU)>14)
		{
		var padTop=Math.round(((us*alturaU)/2)-7);
		chassis.setStyle('padding-top',padTop+'px');
		chassis.setStyle('height',((us*alturaU)-padTop)+'px');
		}
	if (u==uMarcada)
		{chassis.addClass('chassisRemarcado');}
	switch (linea.get('tabla'))
		{
		case 'Panels':
			chassis.addClass('panelChassis');
			var nombreChassis=new Element('a',{'class':'nombreChassis ','href':'panel.php?id='+id,'text':nombre}).inject(chassis);
			break;
		
		case 'EqChassis':
			var type=linea.getElement('.celda[campo="Category"]').getFirst('.valor').get('text');
			chassis.addClass(type);
			var nombreChassis=new Element('a',{'class':'nombreChassis ','href':'equipment.php?id='+id,'text':nombre}).inject(chassis);
			break;
		case 'RackSpace':
			chassis.addClass('miscRackSpace');
			chassis.set('rackSpaceId',linea.get('linea'));
			chassis.set('text',getValorLinea(linea,'Name'));
			var botonBorrar=new Element('div',{'class':'boton botonDerecha botonBorrar showOnEdit','title':'delete'}).inject(chassis);
			botonBorrar.addEvent('click',function(e){deleteMiscRackSpace(e.target);});
			if ($('edicionGlobal').get('modoEdicion')=='1')
				{
				botonBorrar.setStyle('display','block');
				}			
			break;
		case 'PowerChassis':
			var powerLink='powerChassis.php';
		case 'Batteries':
			if (typeof(powerLink)=='undefined')
				{
				var powerLink='batteries.php';
				}
			chassis.addClass('powerChassis');
			var nombreChassis=new Element('a',{'class':'nombreChassis ','href':powerLink+'?id='+id,'text':nombre}).inject(chassis);
			break;
		}
	});

}

function deleteMiscRackSpace(el)
{
if (confirm('Are you sure to delete that miscellaneous space in the rack?'))
	{
	var rackSpaceId=el.getParent('.chassis').get('rackSpaceId');
	el.getParent('.chassis').addClass('deletingMiscSpace');
	var req=new Request( {
			url:'ajax/borrar.php',
			onSuccess: function(responseText) 
				{ 
				if ((responseText*1)>0)
					{
					$('mainRackInfo').getElement('.deletingMiscSpace').destroy();
					}
				else
					{
					$('mainRackInfo').getElements('.deletingMiscSpace').removeClass('deletingMiscSpace');
					alert('Error when trying to delete');
					}
				}
			});
		req.send('tabla=RackSpace&id='+rackSpaceId);	
	}
}

function ajustarChassis(chassis)
{
var width='100%';
var mounting=chassis.get('mounting');
if (mounting.indexOf('Half')>-1)
	{
	width='50%';
	}
if (mounting.indexOf('Tenth')>-1)
	{
	width='10%';
	}
if (mounting.indexOf('Of4')>-1)
	{
	width='25%';
	}		
chassis.setStyle('width',width);
var lado='left';
var otroLado='right';
if (chassis.get('current')==chassis.get('view'))
	{
	chassis.setStyle('z-index','2');
	if (mounting.indexOf('Right')>-1)
		{
		lado='right';
		otroLado='left';
		}
	}
else
	{
	chassis.setStyle('z-index','1');
	if (mounting.indexOf('Left')>-1)
		{
		lado='right';
		otroLado='left';
		}
	}

if (width!='100%')
	{
	chassis.setStyle(lado,'0px');
	chassis.setStyle(otroLado,'auto');
	}

if (width=='25%')
	{
	if (mounting.indexOf('2nd')>-1)
		{
		chassis.setStyle('left','25%');
		}
	if (mounting.indexOf('3rd')>-1)
		{
		chassis.setStyle('left','50%');
		}
	if (mounting.indexOf('4th')>-1)
		{
		chassis.setStyle('left','75%');
		}
	}
	
	
}

function rackPicturesMount(tablaRackPictures)
{
$(tablaRackPictures).getParent('.picturesGallery').set('tablaDatos',tablaRackPictures);
$(tablaRackPictures).getParent('.picturesGallery').set('id',tablaRackPictures+'cont');
$(tablaRackPictures).getElements('.lineaDatos').each(function(item)
	{
	//'Path', 'Thumbnail','Medium','Fullsize', 'ZPos', 'View', 'Updated'
	addRackPicture(item);
	});

}

function addRackPicture(item)
{
var currentView=item.getParent('.rackDetails').getElement('.rackPictures').get('vista');
if (item.getFirst('.celda[campo="View"]').getFirst('.valor').get('text')==currentView)
	{
	var u=item.getFirst('.celda[campo="ZPos"]').getFirst('.valor').get('text')*1;
	var idPicture=item.get('linea');
	var updated=item.getFirst('.celda[campo="Updated"]').getFirst('.valor').get('text');
	var thumbnail;
	if (typeof mediumPictures !== 'undefined') {
		  thumbnail=item.getFirst('.celda[campo="Path"]').getFirst('.valor').get('text')+item.getFirst('.celda[campo="Medium"]').getFirst('.valor').get('text');
		}
		else
		{
			thumbnail=item.getFirst('.celda[campo="Path"]').getFirst('.valor').get('text')+item.getFirst('.celda[campo="Thumbnail"]').getFirst('.valor').get('text');
		}
	var contenedorImagenes=item.getParent('.rackDetails').getElement('.rackPictures');
	contenedorImagenes.getElements('img[ZPos="'+u+'"]').destroy();
	var image=new Element('img',{'class':'thumbRackItem','src':thumbnail,'ZPos':u,'title':updated+' (Click to enlarge)','idPicture':idPicture}).inject(contenedorImagenes);
	image.addEvent('click',function(e){mostrarImagen(e.target);});
	image.addEvent('load',function(event){ajustarFotoRack(event.target);});
	}
}

function ajustarFotoRack(imagen)
{
var us=10;
var u=imagen.get('ZPos')*1;
var alturaU=imagen.getParent('.rackDetails').get('alturaU')*1;
var usRack=imagen.getParent('.rackDetails').get('usRack')*1;
//var posZ=((usRack+1)-(u+us))*alturaU;
var posZ=u*alturaU;
imagen.setStyle('bottom',posZ+'px');
var fotoSize=imagen.getSize();
if (fotoSize.y>fotoSize.x) //orientacion vertical
	{
	var realHeight=Math.round((fotoSize.y*15)/fotoSize.x);//us for picture dimensions
	realHeight=(Math.round(realHeight/5))*5; //multiples of 5
	var alturaFoto=realHeight*alturaU;
	imagen.setStyle('height',alturaFoto+'px');
	imagen.setStyle('us',realHeight);
	imagen.addClass('dimensionsON');
	checkRackPictPositions(imagen);
	/*var currentView=imagen.getParent('.rackDetails').getElement('.rackPictures').get('vista');
	var fotos=numeroFotosRack(imagen,currentView);
	//asumimos siempre o fotos verticales u horizontales, y en vertical con huecos
	var alturaFoto=Math.floor(alturaU*usRack/fotos);
	if (alturaFoto>(2*us*alturaU))
		{alturaFoto=2*us*alturaU;}
	imagen.setStyle('height',alturaFoto+'px');
	//fotos situadas en impares (0,20,40...) se tienen que subir
	if ((u/10)%2==0)
		{
		var maxFotos=(Math.floor(usRack/10)+2)/2;
		if (alturaFoto>(usRack*alturaU/maxFotos))
			{
			alturaFoto=Math.floor(usRack*alturaU/maxFotos);
			imagen.setStyle('height',alturaFoto+'px');
			}
		if (posZ<0)
			{
			imagen.setStyle('top','0px');
			}
		else
			{
			var orden=Math.floor((usRack-u)/20);
			imagen.setStyle('top',(alturaFoto*orden)+'px');
			}
		}*/
	}
else
	{
	imagen.setStyle('height',(us*alturaU)+'px');
	}
}

function existeFotoRack(imagen,u,view)
{

}

function checkRackPictPositions(imagen)
{
var allDimensionsSet=true;
var container=imagen.getParent('.rackPictures');
container.getElements('img').each(function(item)
	{
	if (!item.hasClass('dimensionsON'))
		{
		allDimensionsSet=false;
		}
	});

var alturaU=imagen.getParent('.rackDetails').get('alturaU')*1;
var usRack=imagen.getParent('.rackDetails').get('usRack')*1;
if (allDimensionsSet)
	{
	var currentU=0;
	var spaceBelow=0;
	var requiredSpace=0;
	var currentImage;
	while (currentU<=usRack)
		{
		if (container.getElement('img[ZPos="'+currentU+'"]'))
			{
			if (requiredSpace>0)
				{
				if (requiredSpace>spaceBelow)
					{
					currentImage.setStyle('bottom',((currentU-spaceBelow)*alturaU)+'px');
					var imageUs=currentImage.get('us')*1;
					currentImage.setStyle('height',(imageUs-(requiredSpace-spaceBelow))+'px');
					}
				else
					{
					currentImage.setStyle('bottom',((currentU-requiredSpace)*alturaU)+'px');
					}
				}
			spaceBelow=0;
			currentImage=container.getElement('img[ZPos="'+currentU+'"]');
			requiredSpace=(currentImage.get('us')*1)-10;
			}
		else
			{
			spaceBelow+=10;
			if (requiredSpace>=10){requiredSpace-=10;}
			}
		currentU+=10;
		}
	if (requiredSpace>0)
		{
		if (requiredSpace>spaceBelow)
			{
			currentImage.setStyle('top',((currentU-spaceBelow)*alturaU)+'px');
			var imageUs=currentImage.get('us')*1;
			currentImage.setStyle('height',(imageUs-(requiredSpace-spaceBelow))+'px');
			}
		else
			{
			currentImage.setStyle('top',((currentU-requiredSpace)*alturaU)+'px');
			}
		}
	}

}

function numeroFotosRack(imagen,view)
{
var tabla=imagen.getParent('.rackPictures').getNext('.espacioTablaRackPictures').getElement('.tablaDiv');
var cuenta=0;
tabla.getElements('.lineaDatos').each(function(linea){
	if (getValorLinea(linea,'View')==view)
		{cuenta++;}
	});
return cuenta;
}


function nuevaImagenRack(idNuevo)
{
var rackDetails=$(idNuevo).getParent('.rackDetails');
var tabla=rackDetails.getElement('.tablaRackPictures');
var nuevaLinea=$(idNuevo).getElement('.lineaDatos').inject(tabla,'bottom');
addRackPicture(nuevaLinea);
}

function changeViewRack(el)
{
var current=el.getPrevious('.currentView');
var vistaActual=current.get('current');
var vistaChassis='Front';
if (vistaActual=='front')
	{
	current.set('current','rear');
	current.set('text','REAR VIEW');
	el.set('text','see front');
	var vista='REAR';
	vistaChassis='Rear';
	}
else
	{
	current.set('current','front');
	current.set('text','FRONT VIEW');
	el.set('text','see rear');
	var vista='FRONT';
	}
var padre=el.getParent('.rackHeader');
var detalles=padre.getNext('.rackDetails');
var picturesRack=detalles.getElement('.rackPictures');	
picturesRack.set('vista',vista);
picturesRack.empty();

var tabla=detalles.getElement('.tablaRackPictures');
rackPicturesMount(tabla.get('id'));

detalles.getElements('.chassis').each(function(item)
	{
	item.set('current',vistaChassis);
	ajustarChassis(item);
	});
	
}
