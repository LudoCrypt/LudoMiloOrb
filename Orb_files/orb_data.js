var systemCategoryData = {}
var systemCategories = new Map()
var mostRecentCategory;

var systemData = {}


/*
symmetries:

0x2000 : icosahedral
0x1000 : chiral icosahedral

0x0200 : octahedral
0x0100 : chiral octahedral

0x0040 : pyritohedral
0x0020 : tetrahedral
0x0010 : chiral tetrahedral

0x0001 : no symmetry

*/

function addSystemCategory(data){
    systemCategoryData[data.name] = data;
    systemCategories.set(data.name, []);
    mostRecentCategory = data.name;
}

function highestBit(n){
    let hBit = 1;
    while (n > 1){ // finds the highest bit set
        n >>= 1;
        hBit <<= 1;
    }
    return hBit;
}

function* allBits(n){
    let bit = 1;
    do {
        if (bit & n) yield bit;
        bit <<= 1;
    } while (bit < n);
}

function addSystem(data, addToMenu=true){
    data.opposites ??= true;
    data.anyOpposites ??= data.opposites;
    if (data.axes || data.getAxes){
        data.axes?.forEach(function(vec, index){
          this[index] = new Vector(...vec).unit();
        }, data.axes);
        data.getOpposites ??= () => data.opposites;
        if (data.axes && data.getOpposites()){
            data.axes.push(...data.axes.map(x => x.negative()));
        }
        data.getAnyOpposites ??= () => data.anyOpposites;
        data.getAxes ??= () => data.axes;
        data.getAxisCount = params => data.getAxes(params).length;
        data.paramsRequired ??= [];
        data.listjumbleConfigs ??= () => ['']
    } else {
        data.paramsRequired ??= ['jumbleConfig'];
        data.jumbleConfigs?.forEach(function(p){
        });
        data.getJumbleCoeffs ??= params => data.jumbleConfigs.get(params.jumbleConfig);
        data.listjumbleConfigs ??= () => Array.from(data.jumbleConfigs.keys());
        data.getBaseAxes ??= () => data.baseAxes;
        data.getCombAxes ??= () => data.combAxes;
        data.getOpposites ??= () => data.opposites;
        data.getAnyOpposites ??= () => data.anyOpposites;
        data.getAxes ??= function(params){
            let axes = [];
            let coeffs = data.getJumbleCoeffs(params);
            let baseAxes = data.getBaseAxes(params);
            if (coeffs.length < baseAxes.length){
                coeffs.push(1 - coeffs.reduce((a,b)=>a+b));
            }
            for (let comb of data.getCombAxes(params)){
                let axis = new Vector();
                for (let i = 0; i < comb.length; i++){
                    if (comb[i] !== undefined){
                        axis = axis.add(baseAxes[i][comb[i]].multiply(coeffs[i]));
                    }
                }
                axis = axis.unit();
                axes.push(axis);
            }
            /*if (data.getOpposites(params)){
                axes.push(...axes.map(x => x.negative()));
            }*/ // the combAxes provided already have opposites
            return axes;
        }
        data.getAxisCount ??= params => data.getCombAxes(params).length;
    }
    data.symmetries ??= 0x0001;
    data.symmetries |= 0x0001; // just to be safe
    if (data.transitiveSymmetries === undefined){ // assumes it's NOT transitive
        data.transitiveSymmetries = 0x0000 //highestBit(data.symmetries);
    }
    data.getSymAxes ??= (params, sym) => sym & data.transitiveSymmetries ? [0] : [...Array(data.getAxisCount(params)).keys()];
    data.getIcon ??= () => `./icons/systems/${data.name}.svg`;

    if (addToMenu) systemCategories.get(mostRecentCategory).push(data.name);
    systemData[data.name] = data
}

function getAxesFromSystemUnit(systemUnit){
    return systemData[systemUnit.dataset.system].getAxes(systemUnit.dataset);
}

function getSymAxesFromSystemUnit(systemUnit, symmetry=0){
    return systemData[systemUnit.dataset.system].getSymAxes(systemUnit.dataset, symmetry);
}

function listjumbleConfigsFromSystemUnit(systemUnit){
    return systemData[systemUnit.dataset.system].listjumbleConfigs(systemUnit.dataset);
}

function getOppositesFromSystemUnit(systemUnit){
    return systemData[systemUnit.dataset.system].getOpposites(systemUnit.dataset);
}

function getAnyOppositesFromSystemUnit(systemUnit){
    return systemData[systemUnit.dataset.system].getAnyOpposites(systemUnit.dataset);
}

function getIconFromSystemUnit(systemUnit){
    return systemData[systemUnit.dataset.system].getIcon(systemUnit.dataset);
}


addSystemCategory({
    name: 'regular',
    });

addSystem({
    name: 'tetra', 
    axes: [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]],
    opposites: false,
    symmetries: 0x0031,
    transitiveSymmetries: 0x0030,
});
addSystem({
    name: 'cube', 
    axes: [[1,0,0],[0,1,0],[0,0,1]],
    symmetries: 0x0371,
    transitiveSymmetries: 0x0370,
});
addSystem({
    name: 'octa', 
    axes: [[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1]],
    symmetries: 0x0371,
    transitiveSymmetries: 0x0340,
});
addSystem({
    name: 'r_dodeca', 
    axes: [[1,1,0],[0,1,1],[1,0,1],[1,-1,0],[0,1,-1],[-1,0,1]],
    symmetries: 0x0371,
    transitiveSymmetries: 0x0370,
});

const phi = (1 + 5**0.5)/2
addSystem({
    name: 'dodeca', 
    axes: [
        [phi, 1,0],[ 1,0,phi],[0,phi, 1],
        [phi,-1,0],[-1,0,phi],[0,phi,-1],
    ],
    symmetries: 0x3071,
    transitiveSymmetries: 0x3040,
});
addSystem({
    name: 'icosa', 
    axes: [
        [phi,0, 1/phi],[0, 1/phi,phi],[ 1/phi,phi,0],
        [phi,0,-1/phi],[0,-1/phi,phi],[-1/phi,phi,0],
        [1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1]
    ],
    symmetries: 0x3071,
    transitiveSymmetries: 0x3000,
});
addSystem({
    name: 'r_triaconta', 
    axes: [
        [phi, 1/phi, 1],[ 1/phi, 1,phi],[ 1,phi, 1/phi],
        [phi,-1/phi, 1],[-1/phi, 1,phi],[ 1,phi,-1/phi],
        [phi, 1/phi,-1],[ 1/phi,-1,phi],[-1,phi, 1/phi],
        [phi,-1/phi,-1],[-1/phi,-1,phi],[-1,phi,-1/phi],
        [1,0,0],[0,1,0],[0,0,1]
    ],
    symmetries: 0x3071,
    transitiveSymmetries: 0x3000,
});



addSystemCategory({
    name: 'catalan',
    });

addSystem({
    name: 'k_tetra', 
    baseAxes: [systemData.tetra.axes, systemData.cube.axes],
    combAxes: [[0,0],[0,1],[0,2],[1,0],[1,4],[1,5],[2,3],[2,1],[2,5],[3,3],[3,4],[3,2]],
    jumbleConfigs: new Map([
        ['J1', [0.4641016151377546]],
    ]),
    opposites: false,
    symmetries: 0x0031,
    transitiveSymmetries: 0x0030,
});

addSystem({
    name: 'k_cube', 
    baseAxes: [systemData.cube.axes, systemData.r_dodeca.axes],
    combAxes: [[0,0],[0,2],[0,3],[0,11],[1,0],[1,1],[1,4],[1,9],[2,1],[2,2],[2,5],[2,10],[3,5],[3,6],[3,8],[3,9],[4,3],[4,6],[4,7],[4,10],[5,4],[5,7],[5,8],[5,11]],
    jumbleConfigs: new Map([
        ['J1', [0.4142135623730950]],
        ['J2', [0.5000000000000000]],
        ['J3', [0.3041135359756632]],
        ['J4', [0.2265409196609864]],
    ]),
    symmetries: 0x0371,
    transitiveSymmetries: 0x0340,
});
addSystem({
    name: 'k_octa', 
    baseAxes: [systemData.octa.axes, systemData.r_dodeca.axes],
    combAxes: [[0,0],[0,1],[0,2],[1,0],[1,4],[1,11],[2,2],[2,3],[2,10],[3,3],[3,7],[3,11],[4,6],[4,7],[4,8],[5,5],[5,6],[5,10],[6,4],[6,8],[6,9],[7,1],[7,5],[7,9]],
    jumbleConfigs: new Map([
        ['J1', [0.4641016151377546]],
        ['JH', [0.5505102572168219]],
    ]),
    symmetries: 0x0371,
    transitiveSymmetries: 0x0340,
});
addSystem({
    name: 'd_icositetra', 
    baseAxes: [systemData.cube.axes, systemData.octa.axes],
    combAxes: [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,6],[1,7],[2,0],[2,2],[2,5],[2,7],[3,4],[3,5],[3,6],[3,7],[4,2],[4,3],[4,4],[4,5],[5,1],[5,3],[5,4],[5,6]],
    jumbleConfigs: new Map([
        ['J1', [0.4494897427831781]],
        ['J2', [0.5358983848622454]],
        ['J3', [0.2970862902210112]],
        ['JH', [0.1929927963088228]],
    ]),
    symmetries: 0x0371,
    transitiveSymmetries: 0x0340,
});
addSystem({
    name: 'kr_dodeca', 
    baseAxes: [systemData.cube.axes, systemData.octa.axes, systemData.r_dodeca.axes],
    combAxes: [[5,3,7],[5,3,11],[5,1,4],[5,1,11],[4,3,7],[4,3,3],[4,2,10],[4,2,3],[5,4,7],[5,4,8],[4,4,7],[4,4,6],[3,4,8],[3,4,6],[4,5,6],[4,5,10],[3,5,6],[3,5,5],[2,5,10],[2,5,5],[2,2,10],[2,2,2],[2,0,1],[2,0,2],[3,7,5],[3,7,9],[2,7,5],[2,7,1],[5,6,8],[5,6,4],[3,6,8],[3,6,9],[1,7,9],[1,7,1],[1,6,9],[1,6,4],[1,1,4],[1,1,0],[1,0,1],[1,0,0],[0,3,11],[0,3,3],[0,2,3],[0,2,2],[0,1,11],[0,1,0],[0,0,2],[0,0,0]],
    jumbleConfigs: new Map([
        ['K1', [0.2748039083715090, 0.3365646774163698, 0.3886314142121213]],
    ]),
    symmetries: 0x0371,
    transitiveSymmetries: 0x0200,
});
addSystem({
    name: 'p_icositetra', 
    baseAxes: [systemData.cube.axes, systemData.octa.axes, systemData.r_dodeca.axes],
    combAxes: [[5,3,7],[5,1,11],[4,3,3],[4,2,10],[5,4,8],[4,4,7],[3,4,6],[4,5,6],[3,5,5],[2,5,10],[2,2,2],[2,0,1],[3,7,9],[2,7,5],[5,6,4],[3,6,8],[1,7,1],[1,6,9],[1,1,4],[1,0,0],[0,3,11],[0,2,3],[0,1,0],[0,0,2]],
    jumbleConfigs: new Map([
        ['K1', [0.3459114898919877, 0.3881198029452335, 0.2659687071627788]],
    ]),
    opposites: false,
    symmetries: 0x0111,
    transitiveSymmetries: 0x0100,
});

addSystem({
    name: 'k_dodeca', 
    baseAxes: [systemData.dodeca.axes, systemData.r_triaconta.axes],
    combAxes: [[0,0],[0,2],[0,5],[0,6],[0,12],[1,0],[1,1],[1,3],[1,7],[1,14],[2,1],[2,2],[2,4],[2,8],[2,13],[3,3],[3,9],[3,12],[3,23],[3,26],[4,4],[4,10],[4,14],[4,21],[4,24],[5,5],[5,11],[5,13],[5,22],[5,25],[6,15],[6,17],[6,20],[6,21],[6,27],[7,15],[7,16],[7,18],[7,22],[7,29],[8,16],[8,17],[8,19],[8,23],[8,28],[9,8],[9,11],[9,18],[9,24],[9,27],[10,6],[10,9],[10,19],[10,25],[10,29],[11,7],[11,10],[11,20],[11,26],[11,28]],
    jumbleConfigs: new Map([
        ['J1', [0.3701919081587501]],
        ['J2', [0.4874571845315417]],
        ['J3', [0.3375153691051122]],
        ['J4', [0.2664702716142385]],
        ['J5', [0.1378486383189859]],
        ['J6', [0.2023846439858937]],
        ['JHa', [0.5139428562214438]],
        ['JHb', [0.4539260703560396]],
    ]),
    symmetries: 0x3071,
    transitiveSymmetries: 0x3000,
});
addSystem({
    name: 'k_icosa', 
    baseAxes: [systemData.icosa.axes, systemData.r_triaconta.axes],
    combAxes: [[0,0],[0,3],[0,12],[1,1],[1,4],[1,14],[2,2],[2,5],[2,13],[3,6],[3,9],[3,12],[4,7],[4,10],[4,14],[5,8],[5,11],[5,13],[6,0],[6,1],[6,2],[7,5],[7,6],[7,25],[8,3],[8,7],[8,26],[9,9],[9,19],[9,23],[10,15],[10,18],[10,27],[11,16],[11,19],[11,29],[12,17],[12,20],[12,28],[13,21],[13,24],[13,27],[14,22],[14,25],[14,29],[15,23],[15,26],[15,28],[16,15],[16,16],[16,17],[17,10],[17,20],[17,21],[18,11],[18,18],[18,22],[19,4],[19,8],[19,24]],
    jumbleConfigs: new Map([
        ['J1', [0.4641016151377546]],
        ['J2', [0.5241723606454736]],
        ['J3', [0.3169020429068927]],
        ['J4', [0.2485679221313402]],
        ['JH', [0.4905327919940700]],
    ]),
    symmetries: 0x3071,
    transitiveSymmetries: 0x3000,
});
addSystem({
    name: 'd_hexeconta', 
    baseAxes: [systemData.dodeca.axes, systemData.icosa.axes],
    combAxes: [[0,0],[0,2],[0,3],[0,6],[0,7],[1,0],[1,1],[1,4],[1,6],[1,8],[2,1],[2,2],[2,5],[2,6],[2,19],[3,0],[3,3],[3,8],[3,9],[3,15],[4,1],[4,4],[4,13],[4,17],[4,19],[5,2],[5,5],[5,7],[5,14],[5,18],[6,10],[6,12],[6,13],[6,16],[6,17],[7,10],[7,11],[7,14],[7,16],[7,18],[8,9],[8,11],[8,12],[8,15],[8,16],[9,5],[9,10],[9,13],[9,18],[9,19],[10,3],[10,7],[10,9],[10,11],[10,14],[11,4],[11,8],[11,12],[11,15],[11,17]],
    jumbleConfigs: new Map([
        ['J1', [0.4043066061151344]],
        ['J2', [0.5233977102438481]],
        ['J3', [0.4633292965690076]],
        ['J4', [0.3216054548229170]],
        ['J5', [0.2058742581162170]],
        ['J6', [0.2955114688927060]],
        ['J7', [0.3595326305881870]],
        ['J8', [0.5704040619792119]],
        ['JHa', [0.6398863880160892]],
        ['JHb', [0.3508094450497894]],
    ]),
    symmetries: 0x3071,
    transitiveSymmetries: 0x3000,
});
addSystem({
    name: 'kr_triaconta', 
    baseAxes: [systemData.dodeca.axes, systemData.icosa.axes, systemData.r_triaconta.axes],
    combAxes: [[10,7,25],[10,7,6],[10,3,9],[10,3,6],[10,11,19],[10,11,29],[8,11,19],[8,11,16],[7,11,29],[7,11,16],[8,16,16],[8,16,17],[7,16,16],[7,16,15],[11,12,28],[11,12,20],[8,12,28],[8,12,17],[9,10,18],[9,10,27],[7,10,18],[7,10,15],[6,16,17],[6,16,15],[6,12,20],[6,12,17],[6,10,27],[6,10,15],[9,18,18],[9,18,11],[7,18,18],[7,18,22],[10,14,29],[10,14,25],[7,14,29],[7,14,22],[5,18,22],[5,18,11],[5,14,25],[5,14,22],[5,7,25],[5,7,5],[5,2,13],[5,2,5],[11,17,20],[11,17,10],[6,17,20],[6,17,21],[9,13,27],[9,13,24],[6,13,27],[6,13,21],[4,17,21],[4,17,10],[4,13,24],[4,13,21],[11,15,28],[11,15,26],[8,15,28],[8,15,23],[10,9,19],[10,9,9],[8,9,19],[8,9,23],[3,15,26],[3,15,23],[3,9,23],[3,9,9],[3,3,9],[3,3,12],[3,0,3],[3,0,12],[9,19,24],[9,19,8],[4,19,24],[4,19,4],[9,5,11],[9,5,8],[5,5,11],[5,5,13],[2,19,8],[2,19,4],[2,5,13],[2,5,8],[2,6,1],[2,6,2],[2,2,13],[2,2,2],[11,8,26],[11,8,7],[3,8,26],[3,8,3],[11,4,10],[11,4,7],[4,4,10],[4,4,14],[4,1,4],[4,1,14],[2,1,4],[2,1,1],[1,8,7],[1,8,3],[1,4,14],[1,4,7],[1,1,14],[1,1,1],[1,6,1],[1,6,0],[1,0,3],[1,0,0],[0,7,6],[0,7,5],[0,6,2],[0,6,0],[0,3,12],[0,3,6],[0,2,5],[0,2,2],[0,0,12],[0,0,0]],
    jumbleConfigs: new Map([
        ['K1', [0.2395397749361024, 0.3529308187001753, 0.4075294063637224]],
    ]),
    symmetries: 0x3071,
    transitiveSymmetries: 0x2000,
});
addSystem({
    name: 'p_hexeconta', 
    baseAxes: [systemData.dodeca.axes, systemData.icosa.axes, systemData.r_triaconta.axes],
    combAxes: [[10,7,6],[10,3,9],[10,11,29],[8,11,19],[7,11,16],[8,16,16],[7,16,15],[11,12,28],[8,12,17],[9,10,27],[7,10,18],[6,16,17],[6,12,20],[6,10,15],[9,18,18],[7,18,22],[10,14,25],[7,14,29],[5,18,11],[5,14,22],[5,7,25],[5,2,5],[11,17,20],[6,17,21],[9,13,24],[6,13,27],[4,17,10],[4,13,21],[11,15,26],[8,15,28],[10,9,19],[8,9,23],[3,15,23],[3,9,9],[3,3,12],[3,0,3],[9,19,8],[4,19,24],[9,5,11],[5,5,13],[2,19,4],[2,5,8],[2,6,2],[2,2,13],[11,8,7],[3,8,26],[11,4,10],[4,4,14],[4,1,4],[2,1,1],[1,8,3],[1,4,7],[1,1,14],[1,6,1],[1,0,0],[0,7,5],[0,6,0],[0,3,6],[0,2,2],[0,0,12]],
    jumbleConfigs: new Map([
        ['K1', [0.3148276877628239, 0.4095288945536147, 0.2756434176835614]],
    ]),
    opposites: false,
    symmetries: 0x1011,
    transitiveSymmetries: 0x1000,
});


addSystemCategory({
    name: 'axial',
    });

function diptrapConstructor(trap){
    let data = {
        name: trap ? 'trapezo' : 'dipyramid',
        order: 5,
        paramsRequired: ['order', 'jumbleConfig'],
        getBaseAxes: function(params){
            let order = parseInt(params.order ?? this.order);
            return [[new Vector(0,0,1), new Vector(0,0,-1)], [...new Array(order*(trap+1)).keys()].map(i => new Vector(Math.cos((2-trap)*Math.PI*i/order), Math.sin((2-trap)*Math.PI*i/order), 0))];
        },
        getCombAxes: function(params){
            let order = parseInt(params.order ?? this.order);
            return [...new Array(order).keys()].map(i => [[0,(trap+1)*i],[1,(trap+1)*i+trap]]).flat();
        },
        getJumbleCoeffs: function(params, returnDepth){
            let order = parseInt(params.order ?? this.order);
            let top, bottom;
            if (params.jumbleConfig[0] === 'A'){
                top = parseInt(params.jumbleConfig.slice(1));
                bottom = 0;
            } else if (params.jumbleConfig[0] === 'B'){
                [top, bottom] = params.jumbleConfig.slice(1).split('.').map(n => parseInt(n));
            }
            bottom += trap*0.5
            let [topCos, bottomCos] = [top, bottom].map(n => Math.cos(n * 2*Math.PI/order));
            let diffCos = bottomCos - topCos;
            let coeffs;
            if (diffCos >= 2-THRESHOLD) coeffs = [0.5]; 
            else coeffs = [(-diffCos + Math.sqrt(2*diffCos)) / (2 - diffCos)];
            if (returnDepth){
                return [coeffs, (topCos + bottomCos) / (2 + diffCos + Math.sqrt(8*diffCos))];
            }
            return coeffs;
        },
        listjumbleConfigs: function(params){
            let order = parseInt(params.order ?? this.order);
            let coeffs = new FloatSet(1);
            let configMap = new Map(); // coeff: [config, depth]
            for (let top = 1; top <= order/2; top++){
                for (let bottom = 0; bottom < top; bottom++){
                    let jumbleConfig;
                    if (bottom === 0) jumbleConfig = 'A' + top;
                    else jumbleConfig = 'B' + top + '.' + bottom; 
                    let [coeff, depth] = this.getJumbleCoeffs({order:order, jumbleConfig:jumbleConfig});
                    let resetConfig = false;
                    let coeffWhich;
                    //console.log(order,top,bottom,coeff)
                    if (coeffs.has(coeff)){
                        coeffWhich = coeffs.hasWhich(coeff);
                        if (depth < configMap.get(coeffWhich)[1]){
                            resetConfig = true;
                        }
                    } else {
                        coeffWhich = coeffs.addWhich(coeff);
                        resetConfig = true;
                    }
                    if (resetConfig){
                        configMap.set(coeffWhich, [jumbleConfig, depth]);
                    }
                }
            }
            //let configs = new Map(Array.from(configMap.entries()).sort((a,b) => b[1][1]-a[1][1]).map(pair => [pair[1][0],pair[0]]));
            let configs = Array.from(configMap.values()).sort((a,b) => b[1]-a[1]).map(pair => pair[0]);
            return configs;
        },
        getOpposites: function(params){
            let order = parseInt(params.order ?? this.order);
            return !((order+trap)%2);
        },
        symmetries: 0x0001,
        transitiveSymmetries: 0x0000,
    };
    return data;
}

addSystem(diptrapConstructor(0));
addSystem(diptrapConstructor(1));


addSystem({
    name: 'equator',
    order: 5,
    paramsRequired: ['order'],
    getAxes: function(params){
        let order = parseInt(params.order ?? this.order);
        return [...new Array(order).keys()].map(i => new Vector(Math.cos(2*Math.PI*i/order), Math.sin(2*Math.PI*i/order), 0));
    },
    getOpposites: function(params){
        let order = parseInt(params.order ?? this.order);
        return !(order%2);
    },
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});

addSystem({
    name: 'prism_edges',
    order: 4,
    paramsRequired: ['order'],
    getAxes: function(params){
        let order = parseInt(params.order ?? this.order);
        let axes = [];

        const phi = Math.PI / order; 
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);

        for (let i = 0; i < order; i++) {
            let theta = (2 * Math.PI * i) / order;

            axes.push(new Vector(Math.cos(theta), Math.sin(theta), 0));

            let shiftedTheta = theta + Math.PI / order;
            axes.push(new Vector(
                Math.cos(shiftedTheta) * cosPhi, 
                Math.sin(shiftedTheta) * cosPhi, 
                sinPhi
            ));

            axes.push(new Vector(
                Math.cos(shiftedTheta) * cosPhi, 
                Math.sin(shiftedTheta) * cosPhi, 
                -sinPhi
            ));
        }
        return axes;
    },
    getOpposites: function(params){
        let order = parseInt(params.order ?? this.order);
        return !(order%2);
    },
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});

addSystem({
    name: 'pyramid',
    order: 5,
    paramsRequired: ['order', 'jumbleConfig'],
    getBaseAxes: function(params){
        let order = parseInt(params.order ?? this.order);
        return [[new Vector(0,0,1)], [new Vector(0,0,1)], [new Vector(0,0,-1)], [...new Array(order).keys()].map(i => new Vector(Math.cos(2*Math.PI*i/order), Math.sin(2*Math.PI*i/order), 0))];
        // that vector is there twice to serve the two different axis types
    },
    getCombAxes: function(params){
        let order = parseInt(params.order ?? this.order);
        return [...new Array(order).keys()].map(i => [,0,0,i]).concat([[0,,,]]);
    },
    getJumbleCoeffs: function(params){
        let order = parseInt(params.order ?? this.order);
        let step = parseInt(params.jumbleConfig.slice(1));
        if (6*step <= order) return NaN;
        let stepCos = Math.cos(step * 2*Math.PI/order);
        return [1, clamp(stepCos / (1-stepCos), 0, 1), clamp(-stepCos / (1-stepCos), 0, 1), Math.sqrt(1 - 2*stepCos)/(1-stepCos)];
    },
    listjumbleConfigs: function(params){
        let order = parseInt(params.order ?? this.order);
        return [...new Array((order>>1)+1).keys()].filter(step => 6*step > order).map(step => 'A'+step);
    },
    opposites: false,
    getAnyOpposites: function(params){
        console.log()
        return parseInt(params.jumbleConfig.slice(1)) * 4 === parseInt(params.order)
    },
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});

addSystem({
    name: 'poles', 
    axes: [[0,0,1],[0,0,-1]],
    symmetries: 0x0001,
    transitiveSymmetries: 0x0001,
});

addSystem({
    name: 'single', 
    axes: [[0,0,1]],
    opposites: false,
    symmetries: 0x0001,
    transitiveSymmetries: 0x0001,
});



addSystemCategory({
    name: 'special',
    });

addSystem({
    name: 'tr_dodeca', 
    axes: [[1,1,0],[0,1,1],[1,0,1],[1,-1,0],[0,1,-1],[-1,0,1],[-1,1,0],[0,-1,1],[1,0,-1],[-1,-1,-4],[-4,-1,-1],[-1,-4,-1]],
    opposites: false,
    anyOpposites: true,
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});

const sil = 1 + Math.sqrt(2);
addSystem({
    name: 'td_icositetra', 
    axes: [[1,1,sil],[1,-1,sil],[-1,1,sil],[-1,-1,sil],
           [1,sil,1],[1,sil,-1],[-1,sil,1],[-1,sil,-1],
           [sil,1,1],[sil,1,-1],[sil,-1,1],[sil,-1,-1],
           [1,-sil,1],[1,-sil,-1],[-1,-sil,1],[-1,-sil,-1],
           [-sil,1,1],[-sil,1,-1],[-sil,-1,1],[-sil,-1,-1],
           [2,0,-sil-1],[0,2,-sil-1],[-2,0,-sil-1],[0,-2,-sil-1]],
    opposites: false,
    anyOpposites: true,
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});


addSystem({
    name: 'tr_triaconta', 
    axes: [[0.809016994374947424,0.309016994374947424,0.500000000000000000],[0.309016994374947424,0.500000000000000000,0.809016994374947424],[0.500000000000000000,0.809016994374947424,0.309016994374947424],[0.809016994374947424,-0.309016994374947424,0.500000000000000000],[-0.309016994374947424,0.500000000000000000,0.809016994374947424],[0.809016994374947424,0.30901699437494742,-0.500000000000000000],[0.809016994374947424,-0.309016994374947424,-0.500000000000000000],[0.309016994374947424,-0.500000000000000000,0.809016994374947424],[0.e-18,1.0000000000000000,0.e-18],[0.500000000000000000,-0.809016994374947424,-0.309016994374947424],[-0.309016994374947424,-0.500000000000000000,0.809016994374947424],[-0.052786404500042061,0.80901699437494742,-0.585410196624968454],[1.00000000000000000,0,0],[0.500000000000000000,0.809016994374947424,-0.309016994374947424],[0,0,1.00000000000000000],[-0.894427190999915879,0.e-18,-0.447213595499957939],[-0.585410196624968454,-0.500000000000000000,-0.638196601125010515],[-0.861803398874989485,-0.50000000000000000,-0.085410196624968454],[-0.585410196624968454,0.500000000000000000,-0.638196601125010515],[-0.052786404500042061,-0.809016994374947424,-0.585410196624968454],[-0.809016994374947424,-0.30901699437494742,0.500000000000000000],[-0.809016994374947424,0.309016994374947424,0.500000000000000000],[-0.085410196624968454,0.309016994374947424,-0.947213595499957939],[0.e-18,-1.0000000000000000,0.e-18],[-0.500000000000000000,0.809016994374947424,0.309016994374947424],[0.447213595499957939,0.e-18,-0.894427190999915879],[0.500000000000000000,-0.809016994374947424,0.309016994374947424],[-0.861803398874989485,0.500000000000000000,-0.0854101966249684545],[-0.500000000000000000,-0.809016994374947424,0.309016994374947424],[-0.0854101966249684545,-0.309016994374947424,-0.947213595499957939]],
    opposites: false,
    anyOpposites: true,
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});

addSystem({
    name: 'pyrito', 
    axes: [
        [3/2, 3/4,0],[ 3/4,0,3/2],[0,3/2, 3/4],
        [3/2,-3/4,0],[-3/4,0,3/2],[0,3/2,-3/4],
    ],
    symmetries: 0x0070,
    transitiveSymmetries: 0x0040,
});

addSystemCategory({
    name: 'variable',
});

addSystem({
    name: 'pyrito_variable',
    paramsRequired: ['arbitraryConstant'],
    getAxes: function(params){
        let x = parseFloat(params.arbitraryConstant ?? 0.5);

        let v = 1.0 / Math.sqrt(1 + x * x);
        let c = x * v;

        return [
            new Vector(c, 0, v),
            new Vector(-c, 0, v),
            new Vector(c, 0, -v),
            new Vector(-c, 0, -v),

            new Vector(0, v, c),
            new Vector(0, -v, c),
            new Vector(0, v, -c),
            new Vector(0, -v, -c),


            new Vector(v, c, 0),
            new Vector(-v, c, 0),
            new Vector(-v, -c, 0),
            new Vector(v, -c, 0)
        ];
    },
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});

addSystem({
    name: 'pyrito_vertices_variable',
    paramsRequired: ['arbitraryConstant'],
    getAxes: function(params){
        let x = parseFloat(params.arbitraryConstant ?? 0.5);

        let b = Math.sqrt(((1+x)*(1+x))+((1-x*x)*(1-x*x)));
        let c = (1+x) / b;
        let v = (1-x*x) / b;

        let v13 = Math.sqrt(1 / 3);

        return [
            new Vector(c, 0, v),
            new Vector(-c, 0, v),
            new Vector(c, 0, -v),
            new Vector(-c, 0, -v),

            new Vector(0, v, c),
            new Vector(0, -v, c),
            new Vector(0, v, -c),
            new Vector(0, -v, -c),


            new Vector(v, c, 0),
            new Vector(-v, c, 0),
            new Vector(-v, -c, 0),
            new Vector(v, -c, 0),


            new Vector(v13, v13, v13),
            new Vector(-v13, v13, v13),
            new Vector(-v13, -v13, v13),
            new Vector(v13, -v13, v13),
            new Vector(v13, v13, -v13),
            new Vector(-v13, v13, -v13),
            new Vector(-v13, -v13, -v13),
            new Vector(v13, -v13, -v13)
        ];
    },
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});


addSystem({
    name: 'pyrito_edges_variable',
    paramsRequired: ['arbitraryConstant'],
    getAxes: function(params){
        let x = parseFloat(params.arbitraryConstant ?? 0.5);

        let b = Math.sqrt( (1+x*0.5) * (1+x*0.5) + (1-x*x*0.5) * (1-x*x*0.5) + 0.5 * 0.5 )

        let p = (1+x*0.5) / b;
        let q = (1-x*x*0.5) / b;
        let l = (0.5) / b;

        return [
            new Vector(l,q,p),
            new Vector(-l,q,p),
            new Vector(l,-q,p),
            new Vector(-l,-q,p),
            new Vector(l,q,-p),
            new Vector(-l,q,-p),
            new Vector(l,-q,-p),
            new Vector(-l,-q,-p),

            new Vector(q,p,l),
            new Vector(q,-p,l),
            new Vector(-q,p,l),
            new Vector(-q,-p,l),
            new Vector(q,p,-l),
            new Vector(q,-p,-l),
            new Vector(-q,p,-l),
            new Vector(-q,-p,-l),

            new Vector(p,l,q),
            new Vector(p,-l,q),
            new Vector(-p,l,q),
            new Vector(-p,-l,q),
            new Vector(p,l,-q),
            new Vector(p,-l,-q),
            new Vector(-p,l,-q),
            new Vector(-p,-l,-q),

            new Vector(1,0,0),
            new Vector(-1,0,0),
            new Vector(0,1,0),
            new Vector(0,-1,0),
            new Vector(0,0,1),
            new Vector(0,0,-1),

        ];
    },
    symmetries: 0x0001,
    transitiveSymmetries: 0x0000,
});

const langs = {
    en_us: {
        'category.regular': 'Regular',
        'category.catalan': 'Catalan',
        'category.axial': 'Axial',
        'category.variable': 'Variable',
        'system.tetra': 'Tetrahedron',
        'system.cube': 'Cube',
        'system.octa': 'Octahedron',
        'system.r_dodeca': 'Rhombic Dodecahedron',
        'system.dodeca': 'Dodecahedron',
        'system.icosa': 'Icosahedron',
        'system.r_triaconta': 'Rhombic Triacontahedron',
        'system.k_tetra': 'Triakis Tetrahedron',
        'system.k_cube': 'Tetrakis Hexahedron',
        'system.k_octa': 'Triakis Octahedron',
        'system.d_icositetra': 'Deltoidal Icositetrahedron',
        'system.kr_dodeca': 'Disdyakis Dodecahedron',
        'system.p_icositetra': 'Pentagonal Icositetrahedron',
        'system.k_dodeca': 'Pentakis Dodecahedron',
        'system.k_icosa': 'Triakis Icosahedron',
        'system.d_hexeconta': 'Deltoidal Hexecontahedron',
        'system.kr_triaconta': 'Disdyakis Triacontahedron',
        'system.p_hexeconta': 'Pentagonal Hexecontahedron',
        'system.dipyramid': 'Dipyramid',
        'system.trapezo': 'Trapezohedron',
        'system.equator': 'Equatorial',
        'system.pyramid': 'Pyramid',
        'system.poles': 'Polar',
        'system.single': 'Single',
        'system.tr_dodeca': 'Trapezo-Rhombic Dodecahedron',
        'system.td_icositetra': 'Pseudo-Deltoidal Icositetrahedron',
        'system.tr_triaconta': 'Trapezo-Rhombic Triacontahedron',
        'system.pyrito': 'Pyritohedron',

        'category.special': 'Special',
        'system.prism_edges': 'Prism Edges',
        'system.pyrito_variable': 'Pyritohedron Faces',
        'system.pyrito_vertices_variable': 'Pyritohedron Vertices',
        'system.pyrito_edges_variable': 'Pyritohedron Edges',

        'other.create_phase_diagram.good': 'Create phase diagram',
        'other.create_phase_diagram.too_many_axes': 'Too many cuts to create phase diagram',
        'other.create_phase_diagram.too_many_sliders': 'Too many sliders to create phase diagram',
        'other.create_phase_diagram.too_few_sliders': 'Not enough sliders to create phase diagram',
        'other.share_url': 'Share URL',
        'other.lang': 'English',
    },
    fr: {
        'category.regular': 'Régulier',
        'category.catalan': 'Catalan',
        'category.axial': 'Axiale',
        'category.special': 'Spécial',
        'system.tetra': 'Tétraèdre',
        'system.cube': 'Cube',
        'system.octa': 'Octaèdre',
        'system.r_dodeca': 'Dodécaèdre rhombique',
        'system.dodeca': 'Dodécaèdre',
        'system.icosa': 'Icosaèdre',
        'system.r_triaconta': 'Triacontaèdre rhombique',
        'system.k_tetra': 'Triakitétraèdre',
        'system.k_cube': 'Tétrakihexaèdre',
        'system.k_octa': 'Triakioctaèdre',
        'system.d_icositetra': 'Icositétraèdre trapézoïdal',
        'system.kr_dodeca': 'Hexakioctaèdre',
        'system.p_icositetra': 'Icositétraèdre pentagonal',
        'system.k_dodeca': 'Pentakis Dodecahedron',
        'system.k_icosa': 'Triaki-icosaèdre',
        'system.d_hexeconta': 'Hexacontaèdre trapézoïdal',
        'system.kr_triaconta': 'Hexaki-icosaèdre',
        'system.p_hexeconta': 'Hexacontaèdre pentagonal',
        'system.dipyramid': 'Dipyramide',
        'system.trapezo': 'Antidiamant',
        'system.equator': 'Équatorial',
        'system.pyramid': 'Pyramide',
        'system.poles': 'Polaire',
        'system.single': 'Seul',
        'system.tr_dodeca': 'Dodécaèdre trapézo-rhombique',
        'system.td_icositetra': 'Gyro-icositétraèdre trapézoïdal',
        'system.tr_triaconta': 'Triacontaèdre trapézo-rhombique',
        'system.pyrito': 'Pyritoèdre',
        'other.create_phase_diagram.good': 'Créer un diagramme de phase',
        'other.create_phase_diagram.too_many_axes': 'Trop de coupe pour créer un diagramme de phase',
        'other.create_phase_diagram.too_many_sliders': 'Trop de curseur pour créer un diagramme de phase',
        'other.create_phase_diagram.too_few_sliders': 'Pas asser de curseur pour créer un diagramme de phase',
        'other.share_url': 'Partager le URL',
        'other.lang': 'Français',
    },
    zh_hans: {
        'category.regular': '正多面体',
        'category.catalan': '卡塔蘭立体',
        'category.axial': '轴对称',
        'category.special': '独特',
        'system.tetra': '四面体',
        'system.cube': '立方体',
        'system.octa': '八面体',
        'system.r_dodeca': '菱形十二面体',
        'system.dodeca': '十二面体',
        'system.icosa': '二十面体',
        'system.r_triaconta': '菱形三十面体',
        'system.k_tetra': '三角化四面体',
        'system.k_cube': '四角化六面体',
        'system.k_octa': '三角化八面体',
        'system.d_icositetra': '鳶形二十四面体',
        'system.kr_dodeca': '四角化菱形十二面体',
        'system.p_icositetra': '五角化二十四面体',
        'system.k_dodeca': '五角化十二面体',
        'system.k_icosa': '三角化二十面体',
        'system.d_hexeconta': '鳶形六十面体',
        'system.kr_triaconta': '四角化菱形三十面体',
        'system.p_hexeconta': '五角化六十面体',
        'system.dipyramid': '偏方面体',
        'system.trapezo': '双锥体',
        'system.equator': '赤道',
        'system.pyramid': '棱锥',
        'system.poles': '极点',
        'system.single': '一个',
        'system.tr_dodeca': '梯形菱形十二面体',
        'system.td_icositetra': '伪鸢形二十四面体',
        'system.tr_triaconta': '梯形菱形三十面体',
        'system.pyrito': '五角十二面体',
        'other.create_phase_diagram.good': '做相图',
        'other.create_phase_diagram.too_many_axes': '切面的数量过多，不能做相图',
        'other.create_phase_diagram.too_many_sliders': '滑块过多，不能做相图',
        'other.create_phase_diagram.too_few_sliders': '滑块不足，不能做相图',
        'other.share_url': '分享URL',
        'other.lang': '简体中文',
    },
    zh_hant: {
        'category.regular': '正多面體',
        'category.catalan': '卡塔蘭立體',
        'category.axial': '軸對稱',
        'category.special': '獨特',
        'system.tetra': '四面體',
        'system.cube': '立方體',
        'system.octa': '八面體',
        'system.r_dodeca': '菱形十二面體',
        'system.dodeca': '十二面體',
        'system.icosa': '二十面體',
        'system.r_triaconta': '菱形三十面體',
        'system.k_tetra': '三角化四面體',
        'system.k_cube': '四角化六面體',
        'system.k_octa': '三角化八面體',
        'system.d_icositetra': '鳶形二十四面體',
        'system.kr_dodeca': '四角化菱形十二面體',
        'system.p_icositetra': '五角化二十四面體',
        'system.k_dodeca': '五角化十二面體',
        'system.k_icosa': '三角化二十面體',
        'system.d_hexeconta': '鳶形六十面體',
        'system.kr_triaconta': '四角化菱形三十面體',
        'system.p_hexeconta': '五角化六十面體',
        'system.dipyramid': '偏方面體',
        'system.trapezo': '雙錐體',
        'system.equator': '赤道',
        'system.pyramid': '稜錐',
        'system.poles': '極點',
        'system.single': '一個',
        'system.tr_dodeca': '梯形菱形十二面體',
        'system.td_icositetra': '偽鳶形二十四面體',
        'system.tr_triaconta': '梯形菱形三十面體',
        'system.pyrito': '五角十二面體',
        'other.create_phase_diagram.good': '做相圖',
        'other.create_phase_diagram.too_many_axes': '切面的數量過多，不能做相圖',
        'other.create_phase_diagram.too_many_sliders': '滑塊過多，不能做相圖',
        'other.create_phase_diagram.too_few_sliders': '滑塊不足，不能做相圖',
        'other.share_url': '分享URL',
        'other.lang': '繁體中文',
    },
}

for (let code of Object.keys(langs.en_us)){
    for (let lang of Object.keys(langs)){
        if (langs[lang][code] === undefined){
            console.warn('missing translation for', code, 'in', lang)
        }
    }
}








