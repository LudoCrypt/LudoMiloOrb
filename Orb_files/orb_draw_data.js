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
    shapePath: 'Platonic/Tetrahedron'
});

addDrawShape({
    name: 'cube',
    shapePath: 'Platonic/Cube'
});

addDrawShape({
    name: 'octa',
    shapePath: 'Platonic/Octahedron'
});

addDrawShape({
    name: 'r_dodeca',
    shapePath: 'Catalan/Rhombic_Dodecahedron'
});

addDrawShape({
    name: 'dodeca',
    shapePath: 'Platonic/Dodecahedron'
});

addDrawShape({
    name: 'icosa',
    shapePath: 'Platonic/Icosahedron'
});

addDrawShape({
    name: 'r_triaconta',
    shapePath: 'Catalan/Rhombic_Triacontahedron'
});

addDrawShapeCategory({
    name: 'archimedean',
});

addDrawShape({
    name: 't_tetrahedron',
    shapePath: 'Archimedean/Truncated_Tetrahedron'
});

addDrawShape({
    name: 't_octahedron',
    shapePath: 'Archimedean/Truncated_Octahedron'
});

addDrawShape({
    name: 't_cube',
    shapePath: 'Archimedean/Truncated_Cube'
});

addDrawShape({
    name: 't_dodecahedron',
    shapePath: 'Archimedean/Truncated_Dodecahedron'
});

addDrawShape({
    name: 't_icosahedron',
    shapePath: 'Archimedean/Truncated_Icosahedron'
});

addDrawShape({
    name: 'cubeoctahedron',
    shapePath: 'Archimedean/Cubeoctahedron'
});

addDrawShape({
    name: 't_cubeoctahedron',
    shapePath: 'Archimedean/Truncated_Cubeoctahedron'
});

addDrawShape({
    name: 'rhombicubeoctahedron',
    shapePath: 'Archimedean/Rhombicubeoctahedron'
});

addDrawShape({
    name: 'icosidodecahedron',
    shapePath: 'Archimedean/Icosidodecahedron'
});

addDrawShape({
    name: 't_icosidodecahedron',
    shapePath: 'Archimedean/Truncated_Icosidodecahedron'
});

addDrawShape({
    name: 'rhombicosidodecahedron',
    shapePath: 'Archimedean/Rhombicosidodecahedron'
});

addDrawShape({
    name: 's_cube',
    shapePath: 'Archimedean/Snub_Cube_dextro'
});

addDrawShape({
    name: 's_dodecahedron',
    shapePath: 'Archimedean/Snub_Dodecahedron_dextro'
});

addDrawShapeCategory({
    name: 'catalan',
});

addDrawShape({
    name: 'k_tetra',
    shapePath: 'Catalan/Triakis_Tetrahedron'
});

addDrawShape({
    name: 'k_cube',
    shapePath: 'Catalan/Tetrakis_Hexahedron'
});

addDrawShape({
    name: 'k_octa',
    shapePath: 'Catalan/Triakis_Octahedron'
});

addDrawShape({
    name: 'd_icositetra',
    shapePath: 'Catalan/Deltoidal_Icositetrahedron'
});

addDrawShape({
    name: 'kr_dodeca',
    shapePath: 'Catalan/Disdyakis_Dodecahedron'
});

addDrawShape({
    name: 'p_icositetra',
    shapePath: 'Catalan/Pentagonal_Icositetrahedron_laevo'
});

addDrawShape({
    name: 'k_dodeca',
    shapePath: 'Catalan/Pentakis_Dodecahedron'
});

addDrawShape({
    name: 'k_icosa',
    shapePath: 'Catalan/Triakis_Icosahedron'
});

addDrawShape({
    name: 'd_hexeconta',
    shapePath: 'Catalan/Deltoidal_Hexecontahedron'
});

addDrawShape({
    name: 'kr_triaconta',
    shapePath: 'Catalan/Disdyakis_Triacontahedron'
});

addDrawShape({
    name: 'p_hexeconta',
    shapePath: 'Catalan/Pentagonal_Hexecontahedron_laevo'
});

addDrawShapeCategory({
    name: 'archimedean_catalan_hulls',
});

addDrawShape({
    name: 'jt_tetrahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Tetrahedron'
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
    name: 'jt_dodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Dodecahedron'
});

addDrawShape({
    name: 'jt_icosahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Icosahedron'
});

addDrawShape({
    name: 'j_cubeoctahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Cubeoctahedron'
});

addDrawShape({
    name: 'jt_cubeoctahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Cubeoctahedron'
});

addDrawShape({
    name: 'j_rhombicubeoctahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Rhombicubeoctahedron'
});

addDrawShape({
    name: 'j_icosidodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Icosidodecahedron'
});

addDrawShape({
    name: 'jt_icosidodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Truncated_Icosidodecahedron'
});

addDrawShape({
    name: 'j_rhombicosidodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Rhombicosidodecahedron'
});

addDrawShape({
    name: 'js_cube',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Snub_Cube_dextro'
});

addDrawShape({
    name: 'js_dodecahedron',
    shapePath: 'Archimedean-Catalan Hulls/Joined_Snub_Dodecahedron_dextro'
});

