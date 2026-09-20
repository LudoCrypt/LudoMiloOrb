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
    data.paramsRequired ??= [];

    if (addToMenu) drawShapeCategories.get(mostRecentDrawCategory).push(data.name);
    drawShapeData[data.name] = data
}

function getJsonFromDrawUnit(drawSystem) {
    return drawShapeData[drawSystem.dataset.system].getShapeJson();
}

async function getShapeFromDrawUnit(drawSystem) {
    return await drawShapeData[drawSystem.dataset.system].getShape(drawSystem.dataset);
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
    name: 'pyrito_variable',
    paramsRequired: ['pyritoConstA'],
    getShape: function(params) {
        let a = parseFloat(params.pyritoConstA ?? 0.5);

        a = clamp(a, 0.0, 1.0);

        let c = 1 + a;
        let v = 1 - a * a;

        let verts = [
            [c, 0, v],
            [-c, -0, v],
            [-c, 0, -v],
            [c, -0, -v],
            [0, v, c],
            [-0, -v, c],
            [-0, v, -c],
            [0, -v, -c],
            [v, c, 0],
            [-v, -c, 0],
            [-v, c, -0],
            [v, -c, -0],
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
            [2, 1, 13, 10, 17],
            [1, 2, 19, 9, 15],
            [5, 4, 13, 1, 15],
            [4, 5, 14, 0, 12],
            [8, 10, 13, 4, 12],
            [10, 8, 16, 6, 17],
            [6, 7, 19, 2, 17],
            [7, 6, 16, 3, 18],
            [0, 3, 16, 8, 12],
            [3, 0, 14, 11, 18],
            [9, 11, 14, 5, 15],
            [11, 9, 19, 7, 18]
        ];

        let edges = [
            [1, 2],
            [1, 13],
            [10, 13],
            [10, 17],
            [2, 17],
            [2, 19],
            [9, 19],
            [9, 15],
            [1, 15],
            [4, 5],
            [4, 13],
            [5, 15],
            [5, 14],
            [0, 14],
            [0, 12],
            [4, 12],
            [8, 10],
            [8, 12],
            [8, 16],
            [6, 16],
            [6, 17],
            [6, 7],
            [7, 19],
            [3, 16],
            [3, 18],
            [7, 18],
            [0, 3],
            [11, 14],
            [11, 18],
            [9, 11]
        ];

        let dist = (a + 1) / Math.sqrt(a * a + 1);
        let faceDistances = [dist];
        let inverseFaceDistances = [1.0 / dist];
        let closestFace = dist;
        let closestFaceInverse = 1.0 / dist;
        let furthestVertex = Math.max(Math.sqrt(3), (a + 1) * Math.sqrt(a * a - 2 * a + 2));
        let furthestVertexInverse = 1.0 / furthestVertex;

        let infos = { faceDistances, inverseFaceDistances, closestFace, closestFaceInverse, furthestVertex, furthestVertexInverse };

        let vertices = verts.map(Vector.fromArray);
        let triangles = triangleFan(faces);

        return { vertices, triangles, infos };
    }
});

addDrawShape({
    name: 'tetartoid_variable',
    paramsRequired: ['pyritoConstA', 'pyritoConstB'],
    getShape: function(params) {
        var a = parseFloat(params.pyritoConstA ?? 0.5);
        var b = parseFloat(params.pyritoConstB ?? 0.5);

        b = clamp(b, 0.0, 1.0);
        a = clamp(a, 0.0, b);

        let p = Math.abs(a) < THRESHOLD && Math.abs(b) < THRESHOLD ? 0.5 : Math.abs(b - 1) < THRESHOLD ? 1.0 : (a * a - b) / (a * a - a * b + b * b + a - 2 * b);
        let q = Math.abs(a) < THRESHOLD && Math.abs(b) < THRESHOLD ? 0.5 : Math.abs(b - 1) < THRESHOLD ? 1.0 : (a * a - b) / (a * a + a * b + b * b - a - 2 * b);

        let verts = [
            [a, b, 1],
            [-a, -b, 1],
            [-a, b, -1],
            [a, -b, -1],
            [b, 1, a],
            [-b, -1, a],
            [-b, 1, -a],
            [b, -1, -a],
            [1, a, b],
            [-1, -a, b],
            [-1, a, -b],
            [1, -a, -b],
            [-p, -p, p],
            [p, p, p],
            [p, -p, -p],
            [-p, p, -p],
            [-q, q, q],
            [q, -q, q],
            [q, q, -q],
            [-q, -q, -q]
        ];

        let faces = [
            [0, 1, 17, 8, 13],
            [1, 0, 16, 9, 12],
            [8, 11, 18, 4, 13],
            [11, 8, 17, 7, 14],
            [3, 2, 18, 11, 14],
            [3, 19, 10, 15, 2],
            [9, 10, 19, 5, 12],
            [10, 9, 16, 6, 15],
            [7, 5, 19, 3, 14],
            [5, 7, 17, 1, 12],
            [4, 6, 16, 0, 13],
            [6, 4, 18, 2, 15]
        ];

        let edges = [
            [0, 1],
            [1, 17],
            [8, 17],
            [8, 13],
            [0, 13],
            [0, 16],
            [9, 16],
            [9, 12],
            [1, 12],
            [8, 11],
            [11, 18],
            [4, 18],
            [4, 13],
            [7, 17],
            [7, 14],
            [11, 14],
            [2, 3],
            [2, 18],
            [3, 14],
            [3, 19],
            [10, 19],
            [10, 15],
            [2, 15],
            [9, 10],
            [5, 19],
            [5, 12],
            [6, 16],
            [6, 15],
            [5, 7],
            [4, 6]
        ];

        // actually the inverse face distance is better to calculate first
        let inverseDist = Math.abs(a) < THRESHOLD && Math.abs(b) < THRESHOLD ? Math.sqrt(2) : Math.abs(b - 1) < THRESHOLD ? 1.0 : Math.sqrt(1 + (a * a + b * b) * ((b - 1) / (b - a * a)) * ((b - 1) / (b - a * a)));
        let faceDistances = [1.0 / inverseDist];
        let inverseFaceDistances = [inverseDist];
        let closestFace = 1.0 / inverseDist;
        let closestFaceInverse = inverseDist;
        let furthestVertex = Math.max(Math.sqrt(3) * p, Math.hypot(a, b, 1));
        let furthestVertexInverse = 1.0 / furthestVertex;

        let infos = { faceDistances, inverseFaceDistances, closestFace, closestFaceInverse, furthestVertex, furthestVertexInverse };

        let vertices = verts.map(Vector.fromArray);
        let triangles = triangleFan(faces);

        return { vertices, triangles, infos };
    }
});

addDrawShape({
    name: 'icositetrapyritohedron_variable',
    paramsRequired: ['itphConstA', 'itphConstB'],
    getShape: function(params) {
        var a = parseFloat(params.itphConstA ?? 0.5);
        var b = parseFloat(params.itphConstB ?? 0.5);

        var c = (1 + a + b);
        var da = Math.abs(a - 1) < THRESHOLD && Math.abs(b - 1) < THRESHOLD ? 1.5 : (1 - a) * c / (1 - a * b);
        var db = Math.abs(a - 1) < THRESHOLD && Math.abs(b - 1) < THRESHOLD ? 1.5 : (1 - b) * c / (1 - a * b);

        let verts = [
            [1, 1, 1],
            [-1, 1, 1],
            [1, -1, 1],
            [-1, -1, 1],
            [1, 1, -1],
            [-1, 1, -1],
            [1, -1, -1],
            [-1, -1, -1],
            [c, 0, 0],
            [-c, 0, 0],
            [0, 0, c],
            [0, 0, -c],
            [0, c, 0],
            [0, -c, 0],
            [0, da, db],
            [0, -da, db],
            [0, da, -db],
            [0, -da, -db],
            [da, db, 0],
            [-da, -db, 0],
            [-da, db, 0],
            [da, -db, 0],
            [db, 0, da],
            [-db, 0, da],
            [-db, 0, -da],
            [db, 0, -da]
        ];

        let faces = [
            [10, 22, 0, 14],
            [10, 15, 2, 22],
            [10, 14, 1, 23],
            [10, 23, 3, 15],
            [8, 18, 0, 22],
            [21, 8, 22, 2],
            [25, 8, 21, 6],
            [8, 25, 4, 18],
            [11, 25, 6, 17],
            [24, 11, 17, 7],
            [11, 24, 5, 16],
            [25, 11, 16, 4],
            [9, 24, 7, 19],
            [9, 19, 3, 23],
            [9, 23, 1, 20],
            [9, 20, 5, 24],
            [12, 20, 1, 14],
            [12, 14, 0, 18],
            [12, 18, 4, 16],
            [12, 16, 5, 20],
            [13, 19, 7, 17],
            [13, 15, 3, 19],
            [13, 21, 2, 15],
            [13, 17, 6, 21]
        ];

        let edges = [
            [10, 22],
            [0, 22],
            [0, 14],
            [10, 14],
            [10, 15],
            [2, 15],
            [2, 22],
            [1, 14],
            [1, 23],
            [10, 23],
            [3, 23],
            [3, 15],
            [8, 18],
            [0, 18],
            [8, 22],
            [8, 21],
            [2, 21],
            [8, 25],
            [6, 21],
            [6, 25],
            [4, 25],
            [4, 18],
            [11, 25],
            [6, 17],
            [11, 17],
            [11, 24],
            [7, 17],
            [7, 24],
            [5, 24],
            [5, 16],
            [11, 16],
            [4, 16],
            [9, 24],
            [7, 19],
            [9, 19],
            [3, 19],
            [9, 23],
            [1, 20],
            [9, 20],
            [5, 20],
            [12, 20],
            [12, 14],
            [12, 18],
            [12, 16],
            [13, 19],
            [13, 17],
            [13, 15],
            [13, 21]
        ];

        // actually the inverse face distance is better to calculate first
        let inverseDist = Math.hypot(a, b, 1) / c;
        let faceDistances = [1.0 / inverseDist];
        let inverseFaceDistances = [inverseDist];
        let closestFace = 1.0 / inverseDist;
        let closestFaceInverse = inverseDist;
        let furthestVertex = Math.max(Math.max(Math.sqrt(3), c), Math.abs(a - 1) < THRESHOLD && Math.abs(b - 1) < THRESHOLD ? 3 : Math.hypot(da, db));
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