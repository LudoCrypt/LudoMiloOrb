var drawShapeCategoryData = {}
var drawShapeCategories = new Map()
var mostRecentDrawCategory;

var drawShapeData = {}

function addDrawShapeCategory(data) {
    drawShapeCategoryData[data.name] = data;
    drawShapeCategories.set(data.name, []);
    mostRecentDrawCategory = data.name;
}


function addDrawShape(data, addToMenu = true) {
    data.getIcon ??= () => `./icons/systems/${data.name}.svg`;
    data.getShape ??= () => `./shapes/${data.shapePath}.json`;

    if (addToMenu) drawShapeCategories.get(mostRecentDrawCategory).push(data.name);
    drawShapeData[data.name] = data
}

function getJsonFromDrawUnit(name) {
    return drawShapeData[name].getShape();
}

addDrawShapeCategory({
    name: 'regular'
});

addDrawShape({
    name: 'sphere',
    shapePath: ''
});

addDrawShape({
    name: 'tetra',
    shapePath: 'platonic/Tetrahedron'
});

addDrawShape({
    name: 'cube',
    shapePath: 'platonic/Cube'
});

addDrawShape({
    name: 'octa',
    shapePath: 'platonic/Octahedron'
});

addDrawShape({
    name: 'r_dodeca',
    shapePath: 'catalan/Rhombic_Dodecahedron'
});

addDrawShape({
    name: 'dodeca',
    shapePath: 'platonic/Dodecahedron'
});

addDrawShape({
    name: 'icosa',
    shapePath: 'platonic/Icosahedron'
});

addDrawShape({
    name: 'r_triaconta',
    shapePath: 'catalan/Rhombic_Triacontahedron'
});



addDrawShapeCategory({
    name: 'catalan',
});

addDrawShape({
    name: 'k_tetra',
    shapePath: 'catalan/Triakis_Tetrahedron'
});

addDrawShape({
    name: 'k_cube',
    shapePath: 'catalan/Tetrakis_Hexahedron'
});

addDrawShape({
    name: 'k_octa',
    shapePath: 'catalan/Triakis_Octahedron'
});

addDrawShape({
    name: 'd_icositetra',
    shapePath: 'catalan/Deltoidal_Icositetrahedron'
});

addDrawShape({
    name: 'kr_dodeca',
    shapePath: 'catalan/Disdyakis_Dodecahedron'
});

addDrawShape({
    name: 'p_icositetra',
    shapePath: 'catalan/Pentagonal_Icositetrahedron_laevo'
});

addDrawShape({
    name: 'k_dodeca',
    shapePath: 'catalan/Pentakis_Dodecahedron'
});

addDrawShape({
    name: 'k_icosa',
    shapePath: 'catalan/Triakis_Icosahedron'
});

addDrawShape({
    name: 'd_hexeconta',
    shapePath: 'catalan/Deltoidal_Hexecontahedron'
});

addDrawShape({
    name: 'kr_triaconta',
    shapePath: 'catalan/Disdyakis_Triacontahedron'
});

addDrawShape({
    name: 'p_hexeconta',
    shapePath: 'catalan/Pentagonal_Hexecontahedron_laevo'
});

addDrawShapeCategory({
    name: 'archimedean_catalan_hulls',
});


addDrawShape({
    name: 'jt_tetrahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Tetrahedron'
});

addDrawShape({
    name: 'j_cubeoctahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Cuboctahedron'
});

addDrawShape({
    name: 'jt_octahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Octahedron'
});

addDrawShape({
    name: 'jt_cube',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Cube'
});

addDrawShape({
    name: 'j_rhombicuboctahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Rhombicuboctahedron'
});

addDrawShape({
    name: 'js_cube',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Snub_Cube_dextro'
});

addDrawShape({
    name: 'j_icosidodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Icosidodecahedron'
});

addDrawShape({
    name: 'jt_cubeoctahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Cuboctahedron'
});

addDrawShape({
    name: 'jt_icosahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Icosahedron'
});

addDrawShape({
    name: 'jt_dodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Dodecahedron'
});

addDrawShape({
    name: 'j_rhombicosidodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Rhombicosidodecahedron'
});

addDrawShape({
    name: 'js_dodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Snub_Dodecahedron_dextro'
});

addDrawShape({
    name: 'jt_icosidodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Icosidodecahedron'
});
