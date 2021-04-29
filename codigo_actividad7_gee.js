//Tarea aplicacion 8 
var Honduras = ee.FeatureCollection("users/caamledzeppelin/Honduras");
var Forest = ee.Image('UMD/hansen/global_forest_change_2019_v1_7').clip(Honduras);
var treeCoverVisParam = {
  bands: ['treecover2000'],
  min: 0,
  max: 100,
  palette: ['black', 'green']
};
Map.addLayer(Forest, treeCoverVisParam, 'tree cover');

var treeLossVisParam = {
  bands: ['lossyear'],
  min: 0,
  max: 19,
  palette: ['yellow', 'red']
};
Map.addLayer(Forest, treeLossVisParam, 'tree loss year');

//dibujar caja de herramienta
var caja = Map.drawingTools();
caja.setShown(false);

while (caja.layers().length() > 0){
  var capa = caja.layers().get(0);
  caja.layers().remove(capa);
}

var geometria = ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});
caja.layers().add(geometria);

function cajaherramientas(){
  var toolbox = caja.layers();
  toolbox.get(0).geometries().remove(toolbox.get(0).geometries().get(0));
}
function dibujorectangulo() {
  cajaherramientas();
  caja.setShape('rectangle');
  caja.draw();
}

function dibujarpoligono() {
  cajaherramientas();
  caja.setShape('polygon');
  caja.draw();
}

var grafico = ui.Panel({
  style:
      {height: '235px', width: '600px', position: 'bottom-right', shown: false}
});

Map.add(grafico);

function grafico_deforestacion() {
  if (!grafico.style().get('shown')){
    grafico.style().set('shown',true)
  }

 var aoi = caja.layers().get(0).getEeObject();
 caja.setShape(null);
 var mapa = Map.getScale();
 var escala = mapa > 5000 ? mapScale * 2 : 5000;
 var grafico_1 = ui.Chart.image.histogram({
    image: Forest.select('lossyear'), 
    region: aoi, 
    scale: 30});
    grafico_1.setOptions({title: 'Hectareas de perdida de Bosque Anual',
                       vAxis: {title: 'Año'},
                       hAxis: {title: 'Año(Ha)',
                       interpolateNulls: true}});
                       
    grafico.widgets().reset([grafico_1]);
}

caja.onDraw(ui.util.debounce(grafico_deforestacion, 500));
caja.onEdit(ui.util.debounce(grafico_deforestacion, 500)); 

var symbol = {
  rectangle: '⬛',
  polygon: '🔺',
};  

var controlPanel = ui.Panel({
  widgets: [
    ui.Label('1. Select un tipo de selección.'),
    ui.Button({
      label: symbol.rectangle + ' Rectángulo',
      onClick: dibujorectangulo,
      style: {stretch: 'horizontal'}
    }),
    ui.Button({
      label: symbol.polygon + ' Poligono',
      onClick: dibujarpoligono,
      style: {stretch: 'horizontal'}
    }),
    ui.Label('2. Dibuja la geometría.'),
    ui.Label('3. Espera a que se cree el gráfico.'),
    ui.Label('4. Repetir 1-3 or edita/mueve\nla geometria para un nuevo gráfico.',
    {whiteSpace: 'pre'})],
   style: {position: 'bottom-left'},
   layout: null,});
   
Map.add(controlPanel)
Map.centerObject(Honduras, 8)