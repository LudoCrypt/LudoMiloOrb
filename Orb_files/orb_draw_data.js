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
    data.getShapeJson ??= () => `./shapes/${data.shapePath}.json`;
    data.getShape ??= async (params) => polyhedronFromJson(await readLocalJson('./' + data.getShapeJson()));

    if (addToMenu) drawShapeCategories.get(mostRecentDrawCategory).push(data.name);
    drawShapeData[data.name] = data;
}

function getJsonFromDrawUnit(name) {
    return drawShapeData[name].getShapeJson();
}

async function getShapeFromDrawUnit(name) {
    const d = {};
    return await drawShapeData[name].getShape(/*systemUnit.dataset*/ d);
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

addDrawShapeCategory({
    name: 'variable',
});

addDrawShape({
    name: 'pyritohedron',
    paramsRequired: ['arbitraryConstant0'],
    getShape: function(params) {
        let x = parseFloat(params.arbitraryConstant0 ?? 0.5);

        let c = 1 + x;
        let v = 1 - x * x;

        let verts = [
            [c, 0, v],
            [-c, 0, v],
            [c, 0, -v],
            [-c, 0, -v],
            [0, v, c],
            [0, -v, c],
            [0, v, -c],
            [0, -v, -c],
            [v, c, 0],
            [-v, c, 0],
            [v, -c, 0],
            [-v, -c, 0],
            [1, 1, 1],
            [-1, 1, 1],
            [1, -1, 1],
            [-1, -1, 1],
            [1, 1, -1],
            [-1, 1, -1],
            [1, -1, -1],
            [-1, -1, -1]
        ];

        let faces = [
            [4, 12, 8, 9, 13],
            [6, 17, 9, 8, 16],
            [0, 2, 16, 8, 12],
            [2, 0, 14, 10, 18],
            [4, 5, 14, 0, 12],
            [5, 4, 13, 1, 15],
            [3, 1, 13, 9, 17],
            [1, 3, 19, 11, 15],
            [6, 7, 19, 3, 17],
            [6, 7, 18, 2, 16],
            [11, 10, 18, 7, 19],
            [10, 11, 15, 5, 14]
        ];

        let edges = [
            [4, 12],
            [8, 12],
            [8, 9],
            [9, 13],
            [4, 13],
            [6, 17],
            [9, 17],
            [8, 16],
            [6, 16],
            [0, 2],
            [2, 16],
            [0, 12],
            [0, 14],
            [10, 14],
            [10, 18],
            [2, 18],
            [4, 5],
            [5, 14],
            [1, 13],
            [1, 15],
            [5, 15],
            [1, 3],
            [3, 17],
            [3, 19],
            [11, 19],
            [11, 15],
            [6, 7],
            [7, 19],
            [7, 18],
            [10, 11]
        ];

        let dist = (x + 1) / Math.sqrt(x * x + 1);
        let faceDistances = [dist];
        let inverseFaceDistances = [1.0 / dist];
        let closestFace = dist;
        let closestFaceInverse = 1.0 / dist;
        let furthestVertex = Math.max(Math.sqrt(3), (x + 1) * Math.sqrt(x * x - 2 * x + 2));
        let furthestVertexInverse = 1.0 / furthestVertex;

        let infos = { faceDistances, inverseFaceDistances, closestFace, closestFaceInverse, furthestVertex, furthestVertexInverse };

        let vertices = verts.map(Vector.fromArray);
        let triangles = triangleFan(faces);

        return { vertices, triangles, infos };
    }
});

function triangleFan(faces) {
    const triangles = [];
    for (const face of faces) {
        for (let i = 1; i < face.length - 1; i++) {
            triangles.push([face[0], face[i], face[i + 1]]);
        }
    }

    return triangles;
}