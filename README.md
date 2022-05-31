# networkPhysicalInventory
LIbraries to create visual representation and allow navigation across networks physical inventory, including floorplans and layouts for sites, floors, rooms, racks, panels and equipments.

# Javascript Libraries: lib folder
- circuit.js: Functions to display and work with circuit/paths information.
- equipments.js: Functions to display equipment layouts and work with cards/plugins.
- evolucion.js: Functions to display network history information.
- inicioComun.js: Common functions for network modules start-up.
- ISPdrawing: Base functions to draw floorplans and place elements on them.
- labels.js: Functions for working with labels at equipment and panel ports.
- navegacionRed: Functions to allow network navigation for different levels item selection.
- netForms: Forms to create new network elements.
- networkDescriptors.js: Functions to create network descriptors for each network level category.
- networkElements.js: Functions to be activated when new network items are created.
- networkInfo.js: Functions to display network maps based on OpenLayers
- panels.js: Functions to display and work with panels.
- racks.js: Functions to display and work with racks.
- risers.js: Functions to display and work with cables.

# PHP Libraries: phpLib folder
- circuits.php: Functions to process circuits/paths on server side.
- condicionesNetwork.php: Base queries and structures for the different network levels.
- configNetwork.php: Definitions and base functions for the network modules.
- copyFunctions.php: Functions to copy network elements on server side.
- drawingISP.php: Functions for creating floorplan structures.
- evolucion.php: Functions to work with network history on server side.
- finder.php: Main search functions for network elements.
- geoQueries.php: Functions to query network database.
- getArea.php: Search for related area and base map.
- netForms.php: Creation of basic network element addition form.
- networkPaths.php: Creation of element descriptor structure.
- panels.php: Functions to create panel structure and manipulate panels on server side.
- posProcesar.php: Some actions added to specific element creations.
