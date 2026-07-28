'use strict';

/*

things i want to do:
disable parts of phase diagrams for large axis counts  √
polyhedron edges
opposites in phase diagrams (just show the whole [-1,1]x[-1,1]) √
lock sliders for phase diagrams (hard) √
url parameters  √
jumble/order in url params √
add fancy slider thumb svgs (maybe not)
zoom in to phase diagram (very hard, numerical precision) √
fix center of regions in phase diagram √
fix slider moving off of phase diagram √
look at point (<- i have no idea what this means)

lock sliders for phase diagrams (2D edition) ((hard (scary)))
constrain sliders to interact with other sliders (probably unecessary)

if you're reading this take this all with a grain of salt

*/

// https://via.placeholder.com/30.png/4070c0/ffffff?text=remove


const clamp = (num, min, max) => Math.min(Math.max(num, min), max); // https://www.webtips.dev/webtips/javascript/how-to-clamp-numbers-in-javascript
const pair = (x, y) => ((x + y) * (x + y + 1) >> 1) + y; // cantor pairing function

const svgns = 'http://www.w3.org/2000/svg';

var currentLanguage = 'en_us';

var sphereCanvas;
var sphereCtx;
var sphereMargin = 0.1;
var sphereCanvasRadius;

var sphereTransformation = Quaternion.ONE;
var sphereDrag = false;
var spherePrevE;

var sphereZoom = 2.0;

var phaseCamera;

var keysDown = [];

var languageButton;



var controlPanel;

var sliderPanel;
var sliderDrag = undefined; // which slider is being dragged
var sliderGrabOffsetX;
var sliderGrabOffsetY; // only used for the 2d phase slider

//var currentPuzzle = [['dodeca',0.99],['icosa',0.99],['r_triaconta',0.99]]

var phasePanel;
var phaseG;
var phaseDiagram;
var phaseDomainG;
var phaseLineG;
var phaseRegionG;
var phaseBoundaryG;
var phaseNodeG;
var phaseThumb;
var phaseBack;

var slidersInPhase = [];

var phasePt;
var isPhase2D;

var phaseBakedScale = 20.0;



var changeDivs;

var systemChangeDiv;

var paramsChangeDiv;
var orderChangeDiv;
var jumbleConfigChangeDiv;
var arbitraryConstantChangeDiv;
var languageChangeDiv;

var colorChangeDiv;

var activeChangeDiv = undefined;
var targetOfChangeDiv = undefined; // which one has the change div
const closeChangeDivsOnSelect = true;

var colorChoices = [
    '#a00000', '#1f4bd1', '#167f18', '#965500', '#7528af', '#73536b', '#b51b98', '#595959', '#1d7a61', '#4c6b13',
    '#a000005a', '#1f4bd15a', '#167f185a', '#9655005a', '#7528af5a', '#73536b5a', '#b51b985a', '#5959595a', '#1d7a615a', '#4c6b135a'
];



function transform(quat, vec) {
    return new Vector(...quat.rotateVector(vec.toArray()))
}


const categoryOptionDivTemplate = category => `<div class='category-option simple-option translate' data-translate='category.${category}'></div>`
const systemOptionDivTemplate = name => `<div class='system-option'>
    <img class='system-option-icon' src='${systemData[name].getIcon()}'>
    <div class='system-option-name translate' data-translate='system.${name}'></div>
</div>`
const colorChoiceDivTemplate = color => `<div class='color-choice' style='background-color:${color};'></div>`
const languageChoiceDivTemplate = name => `<div class='language-option simple-option'>${name}</div>`


function initialize() {
    sphereCanvas = document.getElementById('sphere');
    sphereCtx = sphereCanvas.getContext('2d');
    /*sphereCanvasRadius = sphereCanvas.width/(2+2*sphereMargin);
    sphereCtx.translate(sphereCanvas.width/2, sphereCanvas.height/2);
    sphereCtx.scale(sphereCanvasRadius, -sphereCanvasRadius);*/
    makeCanvasSize();

    languageButton = document.getElementById('language-button');


    controlPanel = document.getElementById('control-panel');
    sliderPanel = document.getElementById('slider-panel');

    phasePanel = document.getElementById('phase-panel');
    phaseDiagram = document.getElementById('phase-diagram');
    phaseDomainG = document.getElementById('phase-domains');
    phaseLineG = document.getElementById('phase-lines');
    phaseRegionG = document.getElementById('phase-regions');
    phaseBoundaryG = document.getElementById('phase-boundaries');
    phaseNodeG = document.getElementById('phase-nodes');
    phaseThumb = document.getElementById('phase-thumb');
    phaseBack = document.getElementById('phase-back');

    phaseG = document.getElementById('phase-transform');
    phaseCamera = new Viewport(phaseDiagram, phaseG, phaseBakedScale);

    phasePt = phaseDiagram.createSVGPoint(); // Created once for document

    languageChangeDiv = document.getElementById('language-change');

    createSystemUnit(true); // create the ghost one
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('system')) {
        let urlSystems = urlParams.getAll('system');
        let urlSystemDepths = urlParams.getAll('depths');
        let urlSystemColors = urlParams.getAll('colors');
        for (let i = 0; i < urlSystems.length; i++) {
            createSystemUnit(false, urlSystems[i].split('-')[0], urlSystems[i].split('-').slice(1), urlSystemDepths[i].split('_').map(parseFloat), urlSystemColors[i].split('_').map(x => '#' + x))
        }
    } else {
        createSystemUnit();
    }

    document.getElementById('color-remove').addEventListener('click', function() {
        removeSlider(targetOfChangeDiv.closest('.slider-unit'));
    })

    window.addEventListener('resize', function(e) {
        makeCanvasSize();
        drawPuzzle();
    });

    sphereCanvas.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        let rect = sphereCanvas.getBoundingClientRect();
        let canvasX = (e.clientX - rect.left - sphereCanvas.width / 2) / sphereCanvasRadius;
        let canvasY = (e.clientY - rect.top - sphereCanvas.height / 2) / sphereCanvasRadius;

        if (canvasX ** 2 + canvasY ** 2 <= 1) {
            sphereDrag = true;
            spherePrevE = e;
        }
        document.body.classList.add('dragging');
    });

    sphereCanvas.addEventListener('wheel', function(e) {
        e.preventDefault();

        const zoomSensitivity = 0.001;
        sphereZoom -= e.deltaY * zoomSensitivity;
        sphereZoom = clamp(sphereZoom, 1, 100);
        makeCanvasSize();
        drawPuzzle();

    }, {
        passive: false
    });

    document.getElementById('sphere-panel').addEventListener('click', function(e) {
        if (!e.keepLanguageChangeDiv_) {
            languageChangeDiv.classList.add('hidden');
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (sphereDrag) {
            moveSphere(e.clientX - spherePrevE.clientX, e.clientY - spherePrevE.clientY);
            spherePrevE = e;
        } else if (sliderDrag) {
            if (sliderDrag === phaseThumb) {
                let hoveredDomain = phaseDomainG.querySelector('.phase-domain-hoverable:hover');

                let snap = true;
                if (hoveredDomain) {
                    let typeName = hoveredDomain.tagName.toLowerCase();

                    if (isPhase2D) {
                        if (hoveredDomain.dataset.isActuallyACircle === "0") {
                            snap = false;
                        }
                    }
                }

                if (snap && e.shiftKey && hoveredDomain) {
                    setSlider(slidersInPhase[0].getElementsByClassName('slider-thumb')[0], parseFloat(hoveredDomain.dataset.centerX), false, true);
                    if (slidersInPhase[1]) {
                        setSlider(slidersInPhase[1].getElementsByClassName('slider-thumb')[0], parseFloat(hoveredDomain.dataset.centerY), false, true);
                    }
                } else {
                    let cursorPt = phaseMouseToPoint(e);
                    let newValueX = cursorPt.x - sliderGrabOffsetX;
                    setSlider(slidersInPhase[0].querySelector('.slider-thumb:not(.wrong-sign)'), newValueX / phaseBakedScale, false, true);
                    if (slidersInPhase[1]) {
                        let newValueY = cursorPt.y - sliderGrabOffsetY;
                        setSlider(slidersInPhase[1].querySelector('.slider-thumb:not(.wrong-sign)'), newValueY / phaseBakedScale, false, true);
                    }
                }

            } else {
                let sliderContainerStyle = window.getComputedStyle(sliderDrag.parentNode);
                let sliderWidth = parseFloat(sliderContainerStyle.getPropertyValue('width'));
                let newSliderX = e.clientX - sliderGrabOffsetX; // clamp(e.clientX - sliderGrabOffsetX, 0, sliderWidth);
                //console.log(newSliderX,e.target.parentNode);
                let newValue = newSliderX / sliderWidth;
                //console.log('e',sliderDrag)
                setSlider(sliderDrag, newValue);
                //setSlider(sliderDrag, newValue);
            }
        }
    });

    document.addEventListener('mouseup', function(e) {
        if (sliderDrag || sphereDrag) { // maybe change this to allow click if no movement
            window.addEventListener('click', captureClick, true);
        }
        if (sliderDrag && sliderDrag !== phaseThumb) {
            setSlider(sliderDrag, sliderDrag.closest('.slider-unit').dataset.depth);
            //setSlider(sliderDrag, sliderDrag.closest('.slider-unit').dataset.depth);
        }
        sphereDrag = false;
        sliderDrag = undefined;
        document.body.classList.remove('dragging');
        phaseThumb.classList.remove('being-dragged');
    });

    document.addEventListener('keydown', function(e) {
        let keySpeed = sphereCanvasRadius / 10
        let keyMove = function(code) {
            switch (code) {
                case 'KeyW':
                    moveSphere(0, keySpeed);
                    break;
                case 'KeyA':
                    moveSphere(keySpeed, 0);
                    break;
                case 'KeyS':
                    moveSphere(0, -keySpeed);
                    break;
                case 'KeyD':
                    moveSphere(-keySpeed, 0);
                    break;
            }
        }
        keyMove(e.code);
    });

    document.addEventListener('keyup', function(e) {
        keysDown.forEach(clearInterval); // it may also clear a timeout; this is intended
    });

    sliderPanel.addEventListener('scroll', function() {
        summonChangeDiv();
    });

    languageButton.addEventListener('click', function(e) {
        languageChangeDiv.classList.toggle('hidden');
        e.keepLanguageChangeDiv_ = true;
    })


    changeDivs = document.getElementById('change-windows');

    systemChangeDiv = document.getElementById('system-change');
    for (let [systemCategory, systemNames] of systemCategories) {
        document.getElementById('category-options').insertAdjacentHTML('beforeend', categoryOptionDivTemplate(systemCategory));
        let categoryOptionDiv = document.getElementById('category-options').lastChild;
        let systemCategoryDiv = document.createElement('div');
        systemCategoryDiv.classList.add('system-category');
        document.getElementById('system-options').appendChild(systemCategoryDiv);
        for (let systemName of systemNames) {
            systemCategoryDiv.insertAdjacentHTML('beforeend', systemOptionDivTemplate(systemName));
            let systemOptionDiv = systemCategoryDiv.lastChild;
            systemOptionDiv.addEventListener('click', function() { // assuming systemChangeDiv is active
                setSystem(targetOfChangeDiv, systemName, true);
                /*let systemUnit = targetOfChangeDiv.closest('.system-unit');
                systemUnit.dataset.system = systemName;
                systemUnit.dataset.jumbleConfig = listjumbleConfigsFromSystemUnit(systemUnit)[0];
                systemUnit.dataset.order = 5;
                //systemUnit.getElementsByClassName('system-params')[0].innerHTML = systemUnit.dataset.jumbleConfig;
                setSystemParamInnerHTML(systemUnit.getElementsByClassName('system-params')[0]);

                /*if (!getOppositesFromSystemUnit(systemUnit)){
                    systemUnit.classList.add('no-opposites')
                } else {
                    systemUnit.classList.remove('no-opposites')
                }* /
                updateSystemOpposite(systemUnit);
                /*if (sliderPanel.getElementsByClassName('no-opposites').length){
                    //console.log(sliderPanel.getElementsByClassName('no-opposites'));
                    controlPanel.classList.add('full-depth');
                } else {
                    controlPanel.classList.remove('full-depth');
                }* /
                targetOfChangeDiv.src = systemData[systemName].getIcon(); // change this to an image
                targetOfChangeDiv.dataset.altTranslate = systemName;
                hidePhaseDiagram();
                if (closeChangeDivsOnSelect) removeChangeDivs();*/
                drawPuzzle();
            });
        }
        categoryOptionDiv.addEventListener('click', function() {
            document.getElementById('system-options').scrollTop = systemCategoryDiv.offsetTop - 10; // compensate for the margin of the option divs
        })
        document.getElementById('system-options').appendChild(document.createElement('hr'));
    }

    document.getElementById('system-remove').addEventListener('click', function() {
        removeSystem(targetOfChangeDiv.closest('.system-unit'));
    })

    paramsChangeDiv = document.getElementById('params-change');
    orderChangeDiv = document.getElementById('order-change');
    jumbleConfigChangeDiv = document.getElementById('jumble-config-change');
    arbitraryConstantChangeDiv = document.getElementById('arbitrary-constant-change');

    colorChangeDiv = document.getElementById('color-change');
    for (let color of colorChoices) {
        document.getElementById('color-group').insertAdjacentHTML('beforeend', colorChoiceDivTemplate(color));
        let colorChoiceDiv = document.getElementById('color-group').lastChild;
        colorChoiceDiv.addEventListener('click', function() { // assuming colorChangeDiv is active
            /*targetOfChangeDiv.closest('.slider-unit').dataset.color = color;
            targetOfChangeDiv.style.backgroundColor = color;
            let sliderThumbs = Array.from(targetOfChangeDiv.closest('.slider-unit').getElementsByClassName('slider-thumb'));
            sliderThumbs.forEach(thumb => thumb.style.backgroundColor = color);
            if (closeChangeDivsOnSelect) removeChangeDivs();*/
            setSliderColor(targetOfChangeDiv, color, true);
            drawPuzzle();
        });
    }

    changeDivs.addEventListener('click', function(e) {
        e.keepChangeDivs_ = true; // this might be bad practice but i guess it works
    });

    controlPanel.addEventListener('click', function(e) {
        if (!e.keepChangeDivs_) {
            removeChangeDivs();
        }
    });

    for (let lang in langs) {
        languageChangeDiv.insertAdjacentHTML('beforeend', languageChoiceDivTemplate(langs[lang]['other.lang']));
        let languageOptionDiv = languageChangeDiv.lastChild;
        languageOptionDiv.addEventListener('click', function(e) {
            currentLanguage = lang;
            try {
                window.localStorage.setItem('lang', currentLanguage);
            } catch (e) {}
            languageChangeDiv.classList.add('hidden');
            setTranslationHTML();
            e.keepLanguageChangeDiv_ = true;
        });
    }


    document.getElementById('phase-create').addEventListener('click', function() {
        if (document.getElementById('phase-create').dataset.disabled !== undefined) return;
        createPhasePlot();
        phaseCamera = new Viewport(phaseDiagram, phaseG, phaseBakedScale)
    });

    document.addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('phase-domain-hoverable')) {
            let toast = target.toast(e.shiftKey);
            if (toast) {
                showToast(toast);
            }
        }
    });

    phaseThumb.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        sliderDrag = phaseThumb;
        let cursorPt = phaseMouseToPoint(e);
        sliderGrabOffsetX = (cursorPt.x / phaseBakedScale - parseFloat(slidersInPhase[0].dataset.depth));
        sliderGrabOffsetY = (cursorPt.y / phaseBakedScale - parseFloat(slidersInPhase[1]?.dataset?.depth));
        //console.log(sliderGrabOffsetX)
        phaseThumb.classList.add('being-dragged');
        document.body.classList.add('dragging');
        e.stopPropagation();
    });


    document.getElementById('share-url').addEventListener('click', function() {
        let urlParams = new URLSearchParams();
        for (let systemUnit of sliderPanel.children) {
            if (systemUnit.classList.contains('ghost-system')) continue;
            let systemCode = systemUnit.dataset.system;
            for (let reqParam of systemData[systemUnit.dataset.system].paramsRequired) {
                systemCode += '-' + systemUnit.dataset[reqParam];
            }
            urlParams.append('system', systemCode);
            let systemAxes = getAxesFromSystemUnit(systemUnit);
            let systemDepths = [];
            let systemColors = [];
            for (let sliderUnit of systemUnit.getElementsByClassName('slider-group')[0].children) {
                if (sliderUnit.classList.contains('ghost-slider')) continue;
                systemDepths.push(parseFloat(sliderUnit.dataset.depth).toFixed(6));
                systemColors.push(sliderUnit.dataset.color.replaceAll('#', ''));
            }
            urlParams.append('depths', systemDepths.join('_'));
            urlParams.append('colors', systemColors.join('_'));
        }
        //console.log(window.location.origin + window.location.pathname + '?' + urlParams.toString());
        const toggleIfConstant = true;
        let urlBox = document.getElementById('url-box');
        let url = window.location.origin + window.location.pathname + '?' + urlParams.toString()
        if (toggleIfConstant && !urlBox.classList.contains('hidden') && urlBox.innerHTML === url.replaceAll('&', '&amp;')) {
            urlBox.classList.add('hidden');
        } else {
            urlBox.classList.remove('hidden');
            urlBox.innerHTML = url;
        }
    });

    try {
        currentLanguage = window.localStorage.getItem('lang') ?? 'en_us';
    } catch (e) {} // not sure if there's a better way to do this
    setTranslationHTML(); // has to be at the bottom!


}

function makeCanvasSize() {
    let spherePanelInnerStyle = window.getComputedStyle(document.getElementById('sphere-panel-inner'));
    let canvasSide = parseInt((Math.min(parseFloat(spherePanelInnerStyle.height), parseFloat(spherePanelInnerStyle.height)) * .9) / 2) * sphereZoom;
    sphereCanvas.width = canvasSide;
    sphereCanvas.height = canvasSide;
    sphereCanvasRadius = parseInt(sphereCanvas.width / (2 + 2 * sphereMargin));
    sphereCtx.translate(sphereCanvas.width / 2, sphereCanvas.height / 2);
    sphereCtx.scale(sphereCanvasRadius, -sphereCanvasRadius);
    //console.log(canvasSide)
    //drawPuzzle();
}

function setTranslationHTML() {
    for (let element of document.getElementsByClassName('translate')) {
        singleSetTranslationHTML(element);
    }
}

function getTranslatedName(str) {
    return langs[currentLanguage]?.[str] ?? langs['en_us']?.[str] ?? str;
}

function singleSetTranslationHTML(element) {
    if (element.dataset.translate !== undefined) {
        element.innerHTML = getTranslatedName(element.dataset.translate);
    }
    if (element.dataset.altTranslate !== undefined) {
        element.alt = getTranslatedName(element.dataset.altTranslate);
        //element.title = getTranslatedName(element.dataset.altTranslate); // kind of annoying
    }

}


function captureClick(e) { // https://stackoverflow.com/a/20290312
    e.stopPropagation(); // Stop the click from being propagated.
    //console.log('click captured');
    window.removeEventListener('click', captureClick, true); // cleanup
}

function updateAngleDeltas(systemUnit) {
    const systemUnits = systemUnit.querySelectorAll(".slider-group .slider-unit");

    let previousAngle = null;

    for (const otherSystemUnit of systemUnits) {
        const angle = parseFloat(otherSystemUnit.querySelector(".slider-input-2").value);
        const delta = otherSystemUnit.querySelector(".angle-delta");

        if (previousAngle === null) {
            delta.textContent = "Δ: 0.0°";
        } else {
            delta.textContent = `Δ: ${(angle - previousAngle).toFixed(1)}°`;
        }

        previousAngle = angle;
    }
}


function drawPuzzle() {
    drawSphere();
    for (let systemUnit of sliderPanel.children) {
        if (systemUnit.classList.contains('ghost-system')) continue;

        updateAngleDeltas(systemUnit);

        let systemAxes = getAxesFromSystemUnit(systemUnit);
        for (let sliderUnit of systemUnit.getElementsByClassName('slider-group')[0].children) {
            if (sliderUnit.classList.contains('ghost-slider')) continue;
            let depth = sliderUnit.dataset.depth;
            let color = sliderUnit.dataset.color;
            for (let axis of systemAxes) {
                drawCircleOnSphere(axis, depth, color);
            }
        }
    }
}


function drawSphere() {
    sphereCtx.clearRect(-3, -3, 6, 6); // it's big enough
    /*sphereCtx.fillStyle = 'green';
    sphereCtx.fillRect(0.3,0.3,0.3,0.3);*/
    let sphereShading = sphereCtx.createRadialGradient(0.3, 0.3, 0.3, 0.05, 0.05, 1 + 0.05 * 2 ** 0.5);
    sphereShading.addColorStop(0, '#c0c0c0');
    sphereShading.addColorStop(0.6, '#a0a0a0');
    sphereShading.addColorStop(0.9, '#808080');
    sphereShading.addColorStop(1, '#707070');

    sphereCtx.beginPath();
    sphereCtx.arc(0, 0, 1, 0, 2 * Math.PI);
    sphereCtx.fillStyle = sphereShading;
    sphereCtx.fill();

}


function drawPointOnSphere(pointRaw) {
    let point = transform(sphereTransformation, pointRaw);
    if (point.z >= 0) {
        sphereCtx.beginPath();
        sphereCtx.arc(point.x, point.y, 0.02, 0, 2 * Math.PI);
        sphereCtx.fillStyle = '#a00000';
        sphereCtx.fill();
    }
}


function drawCircleOnSphere(centerRaw, depth, color) {
    let center = transform(sphereTransformation, centerRaw);
    // center is on sphere, depth from -1 to 1
    if (center.z < 0) {
        center = center.negative();
        depth *= -1;
    }
    let discrim = center.x ** 2 + center.y ** 2 - depth ** 2;
    let circleRadius = Math.sqrt(1 - depth ** 2);
    //let circleSlant = center.z / Math.sqrt(1 - center.z**2);
    let beginAngle, endAngle;
    //console.log(depth, discrim)
    if (discrim <= 0 && depth > 0) {
        beginAngle = 0;
    } else if (discrim > 0) {
        beginAngle = Math.acos(center.z * depth / Math.sqrt((1 - center.z ** 2) * (1 - depth ** 2)));
    }
    if (beginAngle !== undefined) {
        endAngle = 2 * Math.PI - beginAngle;
        sphereCtx.beginPath();
        sphereCtx.ellipse(center.x * depth, center.y * depth, circleRadius * center.z, circleRadius, Math.atan2(center.y, center.x), beginAngle, endAngle);
        //console.log(center.x*depth, center.y*depth, circleRadius*center.z, circleRadius, Math.atan2(center.y, center.x), beginAngle, endAngle);
        sphereCtx.strokeStyle = color;
        sphereCtx.lineWidth = 0.01 / sphereZoom;
        sphereCtx.stroke();
    }
}


function moveSphere(x, y) {
    if (x != 0 || y != 0) {
        let newTransf = Quaternion.fromAxisAngle([y, x, 0], Math.sqrt(x ** 2 + y ** 2) / sphereCanvasRadius);
        //sphereTransformation = sphereTransformation.mul(newTransf);
        sphereTransformation = newTransf.mul(sphereTransformation);
        drawPuzzle();
    }
}




function createSystemUnit(ghost = false, system = 'cube', params = [], systemDepths = [1], systemColors = [colorChoices[0]]) {
    let systemUnit = document.getElementById('template-system-unit').cloneNode(true);
    systemUnit.removeAttribute('id');
    if (ghost) {
        systemUnit.classList.add('ghost-system');
        systemUnit.getElementsByClassName('system-add')[0].addEventListener('click', function() {
            createSystemUnit();
        })
        sliderPanel.appendChild(systemUnit);
    } else {
        sliderPanel.insertBefore(systemUnit, sliderPanel.lastChild);

        let systemIcon = systemUnit.getElementsByClassName('system-icon')[0];
        systemIcon.addEventListener('click', function(e) {
            if (systemIcon !== targetOfChangeDiv) {
                summonChangeDiv(systemIcon, systemChangeDiv);
                e.keepChangeDivs_ = true; // otherwise it will close the div
            }
        });

        let systemParams = systemUnit.getElementsByClassName('system-params')[0];
        systemParams.addEventListener('click', function(e) {
            //if (!systemUnit.dataset.jumbleConfig) return;
            if (!(systemData[systemUnit.dataset.system].paramsRequired.length)) return;
            if (systemParams !== targetOfChangeDiv) {
                summonChangeDiv(systemParams, paramsChangeDiv);
                e.keepChangeDivs_ = true; // otherwise it will close the div
            }
        });

        setSystem(systemIcon, system)
        for (let i = 0; i < params.length; i++) {
            setSystemParam(systemData[system].paramsRequired[i], systemUnit, params[i])
        }


        createSliderUnit(systemUnit, true);
        for (let i = 0; i < systemDepths.length; i++) {
            createSliderUnit(systemUnit, false, systemDepths[i], systemColors[i]);
        }
        drawPuzzle();
    }
}


function createSliderUnit(systemUnit, ghost = false, depth = 1, color = colorChoices[0]) {
    let sliderUnit = document.getElementById('template-slider-unit').cloneNode(true);
    sliderUnit.removeAttribute('id');
    let sliderGroup = systemUnit.getElementsByClassName('slider-group')[0];
    if (ghost) {
        sliderUnit.classList.add('ghost-slider');
        sliderUnit.getElementsByClassName('slider-add')[0].addEventListener('click', function() {
            createSliderUnit(systemUnit);
        })
        sliderGroup.appendChild(sliderUnit);
    } else {
        sliderGroup.insertBefore(sliderUnit, sliderGroup.lastChild);
        updateWrongSign(sliderUnit);


        let sliderThumb = sliderUnit.getElementsByClassName('slider-thumb')[0];
        sliderThumb.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            sliderDrag = sliderThumb;
            sliderGrabOffsetX = e.clientX - parseFloat(window.getComputedStyle(sliderThumb).getPropertyValue('left'));
            //console.log(sliderGrabOffsetX)
            document.body.classList.add('dragging');
            e.stopPropagation();
        });

        let sliderDiv = sliderUnit.getElementsByClassName('slider')[0];
        let sliderBar = sliderUnit.querySelector('.slider-bar:not(.slider-neg)');
        sliderDiv.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            let sliderWidth = sliderBar.getBoundingClientRect().width;
            let newSliderX = e.clientX - sliderBar.getBoundingClientRect().left; //clamp(e.clientX - sliderBar.getBoundingClientRect().left, 0, sliderWidth);
            sliderDrag = sliderThumb;
            //sliderGrabOffsetX = e.clientX - parseFloat(window.getComputedStyle(sliderThumb).getPropertyValue('left'));
            //sliderGrabOffsetX = e.clientX - parseFloat(sliderBar.getBoundingClientRect().left);
            sliderGrabOffsetX = parseFloat(sliderBar.getBoundingClientRect().left);
            //console.log(sliderGrabOffsetX)
            setSlider(sliderThumb, newSliderX / sliderWidth);
        });

        let sliderInput = sliderUnit.getElementsByClassName('slider-input')[0];
        let sliderAngleInput = sliderUnit.getElementsByClassName('slider-input-2')[0];

        sliderInput.addEventListener('change', function(e) {
            setSlider(sliderThumb, parseFloat(sliderInput.value), true);
            sliderAngleInput.value = Math.acos(parseFloat(sliderInput.value)) * 180.0 / Math.PI;
        });

        sliderAngleInput.addEventListener('change', function(e) {
            var cosAngleInput = Math.cos(parseFloat(sliderAngleInput.value) * Math.PI / 180.0);
            setSlider(sliderThumb, cosAngleInput, true);
            sliderInput.value = cosAngleInput;
        });

        let buttons = sliderUnit.querySelectorAll('.adjust-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const amount = parseFloat(this.getAttribute('data-step'));

                let currentValue = parseFloat(sliderAngleInput.value) || 0;

                let newValue = clamp(currentValue + amount, 0, parseFloat(sliderAngleInput.max));

                sliderAngleInput.value = newValue;
                var cosAngleInput = Math.cos(parseFloat(sliderAngleInput.value) * Math.PI / 180.0);
                setSlider(sliderThumb, cosAngleInput, true);
                sliderInput.value = cosAngleInput;
            });
        });

        document.getElementById("tangent-lines").addEventListener("change", e => {
            showTangents = e.target.checked;
            drawPhasePlot();
        });
        document.getElementById("coincident-lines").addEventListener("change", e => {
            showTriples = e.target.checked;
            drawPhasePlot();
        });

        let colorButton = sliderUnit.getElementsByClassName('slider-color-swatch')[0];
        colorButton.addEventListener('click', function(e) {
            if (colorButton !== targetOfChangeDiv) {
                summonChangeDiv(colorButton, colorChangeDiv);
                e.keepChangeDivs_ = true; // otherwise it will close the div
            }
        });

        let pinButton = sliderUnit.getElementsByClassName('pin-button')[0];
        pinButton.addEventListener('click', function() {
            if (pinButton.dataset.isOn === "1") {
                pinButton.dataset.isOn = 0;
                pinButton.src = './icons/pin_off.svg';
            } else {
                pinButton.dataset.isOn = 1;
                pinButton.src = './icons/pin_on.svg';
            }
            hidePhaseDiagram();
        });

        setSlider(sliderThumb, depth);
        sliderDrag = undefined; // kind of a hack
        setSliderColor(colorButton, color);
        drawPuzzle();
    }
    hidePhaseDiagram();
}


function setSystem(systemIcon, systemName, fromInput = false) {
    let systemUnit = systemIcon.closest('.system-unit');
    systemUnit.dataset.system = systemName;
    systemUnit.dataset.jumbleConfig = listjumbleConfigsFromSystemUnit(systemUnit)[0];
    systemUnit.dataset.order = 5;

    for (let param of systemData[systemName].paramsRequired) {
        if (param.startsWith("arbitraryConstant")) {
            const index = parseInt(param.substring('arbitraryConstant'.length));
            systemUnit.dataset[param] = getArbitraryConstantConfig(index).defaultValue;
        }
    }

    //systemUnit.getElementsByClassName('system-params')[0].innerHTML = systemUnit.dataset.jumbleConfig;
    setSystemParamInnerHTML(systemUnit.getElementsByClassName('system-params')[0]);

    /*if (!getOppositesFromSystemUnit(systemUnit)){
        systemUnit.classList.add('no-opposites')
    } else {
        systemUnit.classList.remove('no-opposites')
    }*/
    updateSystemOpposite(systemUnit);
    /*if (sliderPanel.getElementsByClassName('no-opposites').length){
        //console.log(sliderPanel.getElementsByClassName('no-opposites'));
        controlPanel.classList.add('full-depth');
    } else {
        controlPanel.classList.remove('full-depth');
    }*/
    systemIcon.src = systemData[systemName].getIcon(); // change this to an image // it is
    systemIcon.dataset.altTranslate = systemName;
    hidePhaseDiagram();
    if (closeChangeDivsOnSelect && fromInput) removeChangeDivs();
}


function setSlider(sliderThumb, depth, fromInput = false, fromExtern = false) { // it also clamps the value
    //fromInput is if it's from the text box
    //fromExtern is if it's from the phase slider or similar

    //console.log(sliderGrabOffsetX);
    //console.log(sliderThumb,depth)
    let sliderThumbOpp = (sliderThumb.parentNode.nextElementSibling || sliderThumb.parentNode.previousElementSibling).getElementsByClassName('slider-thumb')[0];
    let sliderUnit = sliderThumb.closest('.slider-unit');
    let isNegative = sliderThumb.parentNode.classList.contains('slider-neg');
    let isFullDepth = controlPanel.classList.contains('full-depth');
    let noOpposites = sliderThumb.closest('.system-unit').classList.contains('no-opposites');
    let swapNegate = 1;
    depth = clamp(depth, isFullDepth && !(fromExtern && !noOpposites) ? -1 : 0, 1);
    if (isFullDepth && ((depth >= 0) === isNegative) /*&& !fromInput*/ ) { // === acting as XOR
        if (!fromInput && !fromExtern) sliderDrag = sliderThumbOpp;
        swapNegate = -1;
        //console.log('swap')
        //console.log('swapped');
    }
    if (isNegative) {
        sliderThumb.style.left = (100 + swapNegate * depth * 100) + '%';
        sliderThumbOpp.style.left = (-swapNegate * depth * 100) + '%';
    } else {
        sliderThumb.style.left = (swapNegate * depth * 100) + '%';
        sliderThumbOpp.style.left = (100 - swapNegate * depth * 100) + '%';
    }
    updateWrongSign(sliderUnit, depth);
    if (!noOpposites) {
        depth = Math.abs(depth);
    }
    sliderUnit.dataset.depth = depth;
    if (!fromInput) {
        let calDepthVal = clamp(depth, isFullDepth ? -1 : 0, 1);
        sliderUnit.getElementsByClassName('slider-input')[0].value = calDepthVal
        sliderUnit.getElementsByClassName('slider-input-2')[0].value = clamp(Math.acos(calDepthVal) * 180.0 / Math.PI, 0, isFullDepth ? 180 : 90);
    }

    setPhaseSlider();
    if (fromInput) removeChangeDivs();
    drawPuzzle(); // not quite sure i want this in this function
}

function setSliderColor(colorSwatch, color, fromInput = false) {
    colorSwatch.closest('.slider-unit').dataset.color = color;
    colorSwatch.style.backgroundColor = color;
    let sliderThumbs = Array.from(colorSwatch.closest('.slider-unit').getElementsByClassName('slider-thumb'));
    sliderThumbs.forEach(thumb => thumb.style.backgroundColor = color);
    if (closeChangeDivsOnSelect && fromInput) removeChangeDivs();
}


function setPhaseSlider() {
    let xDepth = slidersInPhase[0]?.dataset?.depth ?? 0;
    let yDepth = slidersInPhase[1]?.dataset?.depth ?? 0;

    let newTransform = `translate(${xDepth * phaseBakedScale},${yDepth * phaseBakedScale}),scale(${1.0 / (phaseCamera?.mat?.a ?? 1.0)},${1.0 / (phaseCamera?.mat?.a ?? 1.0)})`;
    phaseThumb.setAttributeNS(null, 'transform', newTransform);
}


function removeSlider(sliderUnit) {
    hidePhaseDiagram();

    if (sliderUnit.parentNode.querySelectorAll('.slider-unit:not(.ghost-slider)').length <= 1) {
        removeSystem(sliderUnit.closest('.system-unit')); // handles drawing puzzle
    } else {
        sliderUnit.remove();
        removeChangeDivs();
        drawPuzzle();
    }
    hidePhaseDiagram();
}

function updateFullDepth() {
    controlPanel.classList.toggle('full-depth',
        controlPanel.getElementsByClassName('no-opposites').length
    );
}


function removeSystem(systemUnit) {
    systemUnit.remove();
    updateFullDepth();
    removeChangeDivs();
    hidePhaseDiagram();
    drawPuzzle();
}


function updateSystemOpposite(systemUnit) {
    let noOpposites = !getOppositesFromSystemUnit(systemUnit);
    systemUnit.classList.toggle('no-opposites', noOpposites);
    /*if (controlPanel.getElementsByClassName('no-opposites').length){
        //console.log(sliderPanel.getElementsByClassName('no-opposites'));
        controlPanel.classList.add('full-depth');
    } else {
        controlPanel.classList.remove('full-depth');
    }*/
    updateFullDepth();
    for (let sliderUnit of systemUnit.getElementsByClassName('slider-unit')) {
        // update the opposite states of the sliders
        if (noOpposites) { // the axis system has unpaired axes
            updateWrongSign(sliderUnit);
            sliderUnit.getElementsByClassName('slider-input')[0].min = -1;
            sliderUnit.getElementsByClassName('slider-input-2')[0].max = 180;
        } else {
            let sliderThumbs = Array.from(sliderUnit.querySelectorAll('.slider-thumb'));
            sliderThumbs.forEach(thumb => thumb.classList.remove('wrong-sign'));
            sliderUnit.getElementsByClassName('slider-input')[0].min = 0;
            sliderUnit.getElementsByClassName('slider-input-2')[0].max = 90;
            let sliderDepth = parseFloat(sliderUnit.dataset.depth);
            if (sliderDepth < 0) {
                setSlider(sliderThumbs[0], Math.abs(sliderDepth), false, true);
            }
        }
    }
}


function updateWrongSign(sliderUnit, depth) {
    if (depth === undefined) {
        depth = parseFloat(sliderUnit.dataset.depth);
    }
    if (depth >= 0) {
        //console.log(sliderUnit)
        sliderUnit.querySelector('.slider-thumb:not(.slider-neg)').classList.remove('wrong-sign');
        sliderUnit.querySelector('.slider-thumb.slider-neg').classList.add('wrong-sign');
    } else {
        sliderUnit.querySelector('.slider-thumb:not(.slider-neg)').classList.add('wrong-sign');
        sliderUnit.querySelector('.slider-thumb.slider-neg').classList.remove('wrong-sign');
    }
}


function setSystemParamInnerHTML(systemParamsDiv) {
    let systemUnit = systemParamsDiv.closest('.system-unit');
    //console.log(systemData[systemUnit.dataset.system].paramsRequired,systemUnit.dataset['jumbleConfig']);
    let string = systemData[systemUnit.dataset.system].paramsRequired.map(param => systemUnit.dataset[param]).join(': ');
    systemParamsDiv.innerHTML = string;
    systemParamsDiv.classList.toggle('small-text', string.length >= 9);
    systemParamsDiv.classList.toggle('system-params-in-use', string.length > 0)
}

function removeChildren(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}


const jumbleConfigDivTemplate = name => `<div class='jumble-config-option simple-option'>${name}</div>`
const orderDivTemplate = name => `<div class='order-option simple-option'>${name}</div>`

const arbitraryConstantConfigs = {
    10: {
        label: "Degrees",
        min: 0,
        max: 90,
        step: 1,
        defaultValue: 45
    }
};

const getArbitraryConstantConfig = (index) => ({
    label: String.fromCharCode(97 + index),
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
    ...(arbitraryConstantConfigs[index] ?? {})
});

const arbitraryConstantTemplate = (currentVal, index) => {
    const config = getArbitraryConstantConfig(index);

    return `
    <div class='arbitrary-constant-option simple-option'>
        <label>${config.label}</label>
        <input
            type="number"
            min="${config.min}"
            max="${config.max}"
            step="${config.step}"
            value="${currentVal}"
            class="constant-input"
        >
    </div>`;
};

function summonChangeDiv(targetButton, changeDiv) {
    if (changeDiv === paramsChangeDiv) { // intentional: this will not run if we are just moving the div
        let systemUnit = targetButton.closest('.system-unit');
        Array.from(paramsChangeDiv.children[0].children).forEach(ch => ch.classList.add('hidden'));

        removeChildren(arbitraryConstantChangeDiv);

        for (let param of systemData[systemUnit.dataset.system].paramsRequired) {
            switch (param) {
                case 'order':
                    removeChildren(orderChangeDiv);
                    orderChangeDiv.classList.remove('hidden');
                    for (let order = 3; order <= 24; order++) {
                        orderChangeDiv.insertAdjacentHTML('beforeend', orderDivTemplate(order));
                        let orderOptionDiv = orderChangeDiv.lastChild;
                        orderOptionDiv.addEventListener('click', function() {
                            setSystemParam(param, systemUnit, order);
                            drawPuzzle();
                        });
                    }
                    break;
                case 'jumbleConfig':
                    removeChildren(jumbleConfigChangeDiv);
                    jumbleConfigChangeDiv.classList.remove('hidden');
                    for (let jumbleConfig of listjumbleConfigsFromSystemUnit(systemUnit)) {
                        jumbleConfigChangeDiv.insertAdjacentHTML('beforeend', jumbleConfigDivTemplate(jumbleConfig));
                        let jumbleConfigOptionDiv = jumbleConfigChangeDiv.lastChild;
                        jumbleConfigOptionDiv.addEventListener('click', function() {
                            setSystemParam(param, systemUnit, jumbleConfig);
                            drawPuzzle();
                        });
                    }
                    break;
            }

            if (param.startsWith('arbitraryConstant')) {

                arbitraryConstantChangeDiv.classList.remove('hidden');

                let index = parseInt(
                    param.substring('arbitraryConstant'.length)
                );

                let currentVal = systemUnit.dataset[param] || 0.5;

                arbitraryConstantChangeDiv.insertAdjacentHTML(
                    'beforeend',
                    arbitraryConstantTemplate(currentVal, index)
                );

                let inputField =
                    arbitraryConstantChangeDiv.lastChild.querySelector('.constant-input');

                inputField.addEventListener('change', function(e) {

                    let val = parseFloat(e.target.value);

                    if (isNaN(val)) val = 0.5;

                    setSystemParam(param, systemUnit, val);

                    drawPuzzle();
                });

                continue;
            }

        }
    }

    if (changeDiv) {
        if (changeDiv !== activeChangeDiv) {
            removeChangeDivs();
        }
        activeChangeDiv = changeDiv;
    } else {
        changeDiv = activeChangeDiv;
    }
    if (targetButton) {
        targetOfChangeDiv = targetButton;
        //console.log(targetOfChangeDiv, targetButton)
    } else {
        targetButton = targetOfChangeDiv;
    }
    //console.log(targetButton,changeDiv,targetOfChangeDiv);
    if (targetButton) {
        changeDiv.classList.remove('hidden');
        let targetBottom = parseFloat(targetButton.getBoundingClientRect().bottom);
        if (targetBottom < 0) {
            targetBottom = 0;
        } else if (targetBottom > parseFloat(sliderPanel.getBoundingClientRect().bottom)) {
            targetBottom = parseFloat(sliderPanel.getBoundingClientRect().bottom)
        }
        changeDiv.style.top = (targetBottom + 20) + 'px';
    }
}

function setSystemParam(param, systemUnit, value) {
    //console.log(param,systemUnit,value)
    switch (param) {
        case 'order':
            systemUnit.dataset.order = value;
            systemUnit.dataset.jumbleConfig = listjumbleConfigsFromSystemUnit(systemUnit)[0];
            setSystemParamInnerHTML(systemUnit.getElementsByClassName('system-params')[0]);
            //hidePhaseDiagram();
            createPhasePlot();
            if (closeChangeDivsOnSelect) removeChangeDivs();
            updateSystemOpposite(systemUnit);
            //drawPuzzle();
            break;
        case 'jumbleConfig':
            systemUnit.dataset.jumbleConfig = value;
            setSystemParamInnerHTML(systemUnit.getElementsByClassName('system-params')[0]);
            //hidePhaseDiagram();
            createPhasePlot();
            if (closeChangeDivsOnSelect) removeChangeDivs();
            //drawPuzzle();
            break;
    }
    if (param.startsWith('arbitraryConstant')) {

        systemUnit.dataset[param] = value;

        setSystemParamInnerHTML(
            systemUnit.getElementsByClassName('system-params')[0]
        );

        //hidePhaseDiagram();

        createPhasePlot();

        updateSystemOpposite(systemUnit);
    }
}

function removeChangeDivs() {
    activeChangeDiv = undefined;
    targetOfChangeDiv = undefined;
    if (changeDivs !== undefined) { // sometimes this function runs before changeDivs has been made
        for (let changeDiv of changeDivs.children) {
            changeDiv.classList.add('hidden');
        }
    }
}


function countAxes() {
    let systemUnits = [];
    for (let systemUnit of sliderPanel.children) {
        if (systemUnit.classList.contains('ghost-system')) continue;
        for (let sliderUnit of systemUnit.getElementsByClassName('slider-group')[0].children) {
            if (sliderUnit.classList.contains('ghost-slider')) continue;

            // Skip the slider if its pinned
            if (sliderUnit.getElementsByClassName('pin-button')[0].dataset.isOn === "1") continue;

            systemUnits.push(systemUnit);
        }
    }

    let systemsAxes = []
    for (let systemUnit of systemUnits) {
        systemsAxes.push(getAxesFromSystemUnit(systemUnit));
    }

    return systemsAxes.map(x => x.length);
}

function systemPhaseLines(systemUnits) {
    let systemsAxes = [];
    let symmetry = -1;
    for (let systemUnit of systemUnits) {
        systemsAxes.push(getAxesFromSystemUnit(systemUnit));
        symmetry &= systemData[systemUnit.dataset.system].symmetries;
    }

    // NOT assuming there is only one system :)
    let systemReducedAxes;
    let systemReducedAxesLen = Infinity;
    for (let bit of allBits(symmetry)) {
        for (let i = 0; i < systemUnits.length; i++) {
            let systemReducedAxesL = [];

            for (let systemUnit of systemUnits) {
                systemReducedAxesL.push(getSymAxesFromSystemUnit(systemUnit, bit));
            }

            if (systemReducedAxesL.flat().length < systemReducedAxesLen) {
                systemReducedAxes = systemReducedAxesL;
                systemReducedAxesLen = systemReducedAxesL.flat().length;
            }
        }
    }

    let is2D = systemUnits.length === 2;

    // assuming 1 or 2 systems, no fixed systems
    let axSetsSeen = new Set();
    let ellipseMatsTangent = new FloatSet(3);
    let ellipseMatsTriple = new FloatSet(3);
    // format: [a0, a1, a2] => a0 x^2 + 2 a1 x y + a2 y^2 = 1
    let lineEqnsTangent = new FloatSet(4);
    let lineEqnsTriple = new FloatSet(4);
    // format: [p0, p1, cos 2f, sin 2f] => (p0 + t cos f, p1 + t sin f) ???
    // last two values: 1,0: horizontal; -1,0: vertical
    // lineEqns.add([1, 0, -1, 0]).add([-1, 0, -1, 0]);
    // if (is2D) lineEqns.add([0, 1, 1, 0]).add([0, -1, 1, 0]);

    let lineClippingRawTriple = []; // [line vector, [lower bound, upper bound]]
    // where the bounds represent dir . endpoint

    for (let s0 = 0; s0 < systemUnits.length; s0++) {
        for (let i0 of systemReducedAxes[s0]) {
            for (let s1 = 0; s1 < systemUnits.length; s1++) {
                for (let i1 = 0; i1 < systemsAxes[s1].length; i1++) {
                    if (s0 === s1 && i0 === i1) continue;
                    if (axSetsSeen.has([pair(s0, i0), pair(s1, i1)].sort().join(","))) continue;
                    axSetsSeen.add([pair(s0, i0), pair(s1, i1)].sort().join(","));

                    let axis0 = systemsAxes[s0][i0];
                    let axis1 = systemsAxes[s1][i1];

                    // add tangency depth
                    let dot = axis0.dot(axis1);
                    let tangencyCoeff = Math.sqrt((1 + dot) / 2);

                    if (dot > 1 - THRESHOLD) {
                        if ((s0 === 0 && s1 === 1) || (s0 === 1 && s1 === 0)) lineEqnsTangent.add([0, 0, 0, 1]); // diagonal line
                        continue;
                    } else if (dot < -1 + THRESHOLD) {
                        if ((s0 === 0 && s1 === 1) || (s0 === 1 && s1 === 0)) lineEqnsTangent.add([0, 0, 0, -1]); // antidiagonal line
                        continue;
                    }

                    if (s0 === 0 && s1 === 0) {
                        lineEqnsTangent.add([tangencyCoeff, 0, -1, 0]).add([-tangencyCoeff, 0, -1, 0]);
                    } else if (s0 === 1 && s1 === 1) {
                        lineEqnsTangent.add([0, tangencyCoeff, 1, 0]).add([0, -tangencyCoeff, 1, 0]);
                    } else {
                        let det = 1 - axis0.dot(axis1) ** 2;
                        ellipseMatsTangent.add([1 / det, -dot / det, 1 / det]);
                    }

                    for (let s2 = 0; s2 < systemUnits.length; s2++) {
                        for (let i2 = 0; i2 < systemsAxes[s2].length; i2++) {
                            if ((s0 === s2 && i0 === i2) || (s1 === s2 && i1 === i2)) continue;
                            if (axSetsSeen.has([pair(s0, i0), pair(s1, i1), pair(s2, i2)].sort().join(","))) continue;
                            axSetsSeen.add([pair(s0, i0), pair(s1, i1), pair(s2, i2)].sort().join(","));
                            let sarr = [s0, s1, s2];

                            let axis2 = systemsAxes[s2][i2];
                            let aarr = [axis0, axis1, axis2];
                            if (axis2.dot(axis0) > 1 - THRESHOLD || axis2.dot(axis0) < -1 + THRESHOLD ||
                                axis2.dot(axis1) > 1 - THRESHOLD || axis2.dot(axis1) < -1 + THRESHOLD) continue;

                            // add triple depth
                            let detAxes = axis0.dot(axis1.cross(axis2)); // determinant of matrix formed by axes
                            if (Math.abs(detAxes) < THRESHOLD) {
                                let axesSystems = [
                                    [],
                                    []
                                ];
                                axesSystems[s0].push(0);
                                axesSystems[s1].push(1);
                                axesSystems[s2].push(2);

                                if (axesSystems[0].length && axesSystems[1].length) {
                                    let singleSystem = axesSystems[0].length === 1 ? 0 : 1;
                                    let doubleSystem = axesSystems[0].length === 1 ? 1 : 0;
                                    let singleAxis = aarr[axesSystems[singleSystem][0]];
                                    let doubleAxis1 = aarr[axesSystems[doubleSystem][0]];
                                    let doubleAxis2 = aarr[axesSystems[doubleSystem][1]];

                                    if (Math.abs(singleAxis.dot(doubleAxis1.subtract(doubleAxis2))) < THRESHOLD) {
                                        // line needs to pass through [0,0] and [1,singleAxis.dot(doubleAxis1)] (with 1 in place of singleSystem)
                                        let dir = [];
                                        let norm = Math.sqrt(1 + singleAxis.dot(doubleAxis1) ** 2);
                                        dir[singleSystem] = 1 / norm;
                                        dir[doubleSystem] = singleAxis.dot(doubleAxis1) / norm;
                                        lineEqnsTriple.add([0, 0, dir[0] ** 2 - dir[1] ** 2, 2 * dir[0] * dir[1]]); // remember to complex square the direction
                                    } else {
                                        let dirUnnorm = [];
                                        dirUnnorm[doubleSystem] = Math.sqrt((1 + doubleAxis1.dot(doubleAxis2)) / 2);
                                        dirUnnorm[singleSystem] = singleAxis.dot(doubleAxis1.add(doubleAxis2)) / Math.sqrt((1 + doubleAxis1.dot(doubleAxis2)) * 2);
                                        let norm = Math.sqrt(dirUnnorm[singleSystem] ** 2 + dirUnnorm[doubleSystem] ** 2);
                                        let dir = dirUnnorm.map(x => x / norm);
                                        let lineEqn = [0, 0, dir[0] ** 2 - dir[1] ** 2, 2 * dir[0] * dir[1]]; // remember to complex square the direction
                                        lineClippingRawTriple.push([lineEqn, [-norm, norm]]);
                                    }
                                } else if (axesSystems[0].length) {
                                    lineEqnsTriple.add([0, 0, -1, 0]);
                                } else if (axesSystems[1].length) {
                                    lineEqnsTriple.add([0, 0, 1, 0]);
                                }

                            } else {
                                let invAxes = [axis1.cross(axis2).divide(detAxes), axis2.cross(axis0).divide(detAxes), axis0.cross(axis1).divide(detAxes)]; // inverse of matrix formed by axes
                                // the ellipsoid if all three axes had different ellipseMats
                                let tripleCoeffs = [0, 0, 0]; // inverse square root
                                for (let k1 = 0; k1 < 3; k1++) {
                                    for (let k2 = 0; k2 < 3; k2++) {
                                        if (sarr[k1] === 0) {
                                            if (sarr[k2] === 0) tripleCoeffs[0] += invAxes[k1].dot(invAxes[k2]);
                                            else if (sarr[k2] === 1) tripleCoeffs[1] += invAxes[k1].dot(invAxes[k2]);
                                        } else if (sarr[k1] === 1) {
                                            // sarr[k2] === 0 is redundant since coefficient matrix is symmetric
                                            if (sarr[k2] === 1) tripleCoeffs[2] += invAxes[k1].dot(invAxes[k2]);
                                        }
                                    }
                                }

                                if (Math.abs(tripleCoeffs[1]) < THRESHOLD && Math.abs(tripleCoeffs[2]) < THRESHOLD) {
                                    lineEqnsTriple.add([tripleCoeffs[0] ** -0.5, 0, -1, 0]).add([-(tripleCoeffs[0] ** -0.5), 0, -1, 0]);
                                } else if (Math.abs(tripleCoeffs[1]) < THRESHOLD && Math.abs(tripleCoeffs[0]) < THRESHOLD) {
                                    lineEqnsTriple.add([0, tripleCoeffs[2] ** -0.5, 1, 0]).add([0, -(tripleCoeffs[2] ** -0.5), 1, 0]);
                                } else {
                                    ellipseMatsTriple.add(tripleCoeffs);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // if (getAnyOppositesFromSystemUnit(systemUnits[0])) lineEqnsTangent.add([0, 0, -1, 0]);
    // if (is2D && getAnyOppositesFromSystemUnit(systemUnits[1])) lineEqnsTangent.add([0, 0, 1, 0]);
    // if (getAnyOppositesFromSystemUnit(systemUnits[0])) lineEqnsTriple.add([0, 0, -1, 0]);
    // if (is2D && getAnyOppositesFromSystemUnit(systemUnits[1])) lineEqnsTriple.add([0, 0, 1, 0]);

    return {
        lineEqnsTangent,
        ellipseMatsTangent,
        lineEqnsTriple,
        ellipseMatsTriple,
        lineClippingRawTriple
    };
}

function pinnedSystemPhaseLines(s0unit, s1unit, s1slider, s2unit, s2slider) {
    let systemsAxes = [];
    let symmetry = -1;
    for (let systemUnit of [s0unit, s1unit, s2unit]) {
        systemsAxes.push(getAxesFromSystemUnit(systemUnit));
        symmetry &= systemData[systemUnit.dataset.system].symmetries;
    }

    // NOT assuming there is only one system :)
    let systemReducedAxes;
    let systemReducedAxesLen = Infinity;
    for (let bit of allBits(symmetry)) {
        for (let i = 0; i < 3; i++) {
            let systemReducedAxesL = [];

            systemReducedAxesL.push(getSymAxesFromSystemUnit(s0unit, bit));
            systemReducedAxesL.push(getSymAxesFromSystemUnit(s1unit, bit));
            systemReducedAxesL.push(getSymAxesFromSystemUnit(s2unit, bit));

            if (systemReducedAxesL.flat().length < systemReducedAxesLen) {
                systemReducedAxes = systemReducedAxesL;
                systemReducedAxesLen = systemReducedAxesL.flat().length;
            }
        }
    }

    let points = [];

    let s1value = parseFloat(s1slider.getElementsByClassName('slider-input')[0].value);
    let s2value = parseFloat(s2slider.getElementsByClassName('slider-input')[0].value);

    for (let i0 of systemReducedAxes[0]) {
        let axis0 = systemsAxes[0][i0];

        for (let i1 = 0; i1 < systemsAxes[1].length; i1++) {
            let axis1 = systemsAxes[1][i1];

            let dot01 = axis0.dot(axis1);

            for (let i2 = 0; i2 < systemsAxes[2].length; i2++) {
                let axis2 = systemsAxes[2][i2];

                let dot02 = axis2.dot(axis0);
                let dot12 = axis2.dot(axis1);

                let q = (1 - dot12 * dot12);
                let pc = (axis1.multiply((s1value - s2value * dot12) / q)).add(axis2.multiply((s2value - s1value * dot12) / q));

                let detAxes = axis0.dot(axis1.cross(axis2));

                let a = axis0.dot(pc);
                let b = axis0.dot(axis1.cross(axis2).unit()) * Math.sqrt((1 - pc.dot(pc)));

                points.push(a + b);
                points.push(a - b);
            }
        }
    }

    return points;
}

function intersectLinesPinned(p0, p1, c, s, pinnedValue, bounds) {
    let [point, dir, dot, perp] = lineEqnToDot([p0, p1, c, s]);
    let intersection = intersectLines(dot, perp, pinnedValue, [0, 1]);

    if (!intersection) return null;

    let t = (intersection[0] - p0) / dir[0];
    if (Math.abs(dir[0]) < THRESHOLD) {
        t = (intersection[1] - p1) / dir[1];
    }

    if (bounds) {
        if (!(t >= bounds[0] - THRESHOLD && t <= bounds[1] + THRESHOLD) && !(-t >= bounds[0] - THRESHOLD && -t <= bounds[1] + THRESHOLD)) return null;
    }

    return intersection[0];
}


var lineEqnsTangent;
var lineEqnsTriple;
var ellipseMatsTangent;
var ellipseMatsTriple;
var linesClippedTriple;
var lineClippingTriple;
var lowerRightPhaseX;
var lowerRightPhaseY;
var oppositesPhaseX;
var oppositesPhaseY;

var showTriples = true;
var showTangents = true;

var dotColor = "#f00000";
var tripleColor = "#008fa5";
var tangentColor = "#d27b00";

function createPhasePlot() {
    let systemUnits = [];
    slidersInPhase = [];

    let allSliders = [];
    let freeSliderIndices = [];
    let pinnedSliderIndices = [];

    let freeSystemIndices = [];
    let pinnedSystemsIndices = [];

    for (let systemUnit of sliderPanel.children) {
        if (systemUnit.classList.contains('ghost-system')) continue;
        for (let sliderUnit of systemUnit.getElementsByClassName('slider-group')[0].children) {
            if (sliderUnit.classList.contains('ghost-slider')) continue;

            if (sliderUnit.getElementsByClassName('pin-button')[0].dataset.isOn === "1") {
                pinnedSliderIndices.push(allSliders.length);
                pinnedSystemsIndices.push(systemUnits.length);
            } else {
                freeSliderIndices.push(allSliders.length);
                freeSystemIndices.push(systemUnits.length);
                slidersInPhase.push(sliderUnit);
            }

            allSliders.push(sliderUnit);
            systemUnits.push(systemUnit);
        }
    }

    // This should technically be fine from other parts of the code, but just in case.
    if (freeSliderIndices.length === 0) return;
    if (freeSliderIndices.length > 2) return;
    if (freeSliderIndices.length === 2 && pinnedSliderIndices.length > 0) return;

    lowerRightPhaseX = -1;
    lowerRightPhaseY = -1;

    if (freeSliderIndices.length === 2 || pinnedSliderIndices.length === 0) {
        isPhase2D = freeSliderIndices.length === 2;
        let freeUnits = isPhase2D ? [systemUnits[freeSystemIndices[0]], systemUnits[freeSystemIndices[1]]] : [systemUnits[freeSystemIndices[0]]];
        let phaseLines = systemPhaseLines(freeUnits);

        lineEqnsTangent = phaseLines.lineEqnsTangent;
        ellipseMatsTangent = phaseLines.ellipseMatsTangent;
        lineEqnsTriple = phaseLines.lineEqnsTriple;
        ellipseMatsTriple = phaseLines.ellipseMatsTriple;

        linesClippedTriple = new FloatSet(4);
        lineClippingTriple = new Map();
        for (let [lineEqnRaw, lineBounds] of phaseLines.lineClippingRawTriple) {
            if (!lineEqnsTriple.has(lineEqnRaw)) { // if it has it the bounds are infinite
                let lineEqn = linesClippedTriple.addWhich(lineEqnRaw);
                if (!lineClippingTriple.has(lineEqn)) lineClippingTriple.set(lineEqn, [Infinity, -Infinity]);
                let bounds = lineClippingTriple.get(lineEqn);
                bounds[0] = Math.min(bounds[0], lineBounds[0]);
                bounds[1] = Math.max(bounds[1], lineBounds[1]);
            }
        }

        for (let lineEqn of linesClippedTriple) lineEqnsTriple.add(lineEqn);

        if (getOppositesFromSystemUnit(freeUnits[0])) lowerRightPhaseX = 0;
        if (isPhase2D && getOppositesFromSystemUnit(freeUnits[1])) lowerRightPhaseY = 0;
    } else {
        isPhase2D = false;
        let freeUnit = systemUnits[freeSystemIndices[0]];

        lineEqnsTangent = new FloatSet(4);
        lineEqnsTriple = new FloatSet(4);
        //lineEqns.add([1, 0, -1, 0]).add([-1, 0, -1, 0]);
        //if (getAnyOppositesFromSystemUnit(freeUnit)) lineEqns.add([0, 0, -1, 0]);
        if (getOppositesFromSystemUnit(freeUnit)) lowerRightPhaseX = 0;

        for (let i = 0; i < pinnedSystemsIndices.length; i++) {
            let pinnedUnit = systemUnits[pinnedSystemsIndices[i]];
            let pinnedValue = parseFloat(allSliders[pinnedSliderIndices[i]].getElementsByClassName('slider-input')[0].value);

            let phaseLines = systemPhaseLines([freeUnit, pinnedUnit]);

            // add the regular intersections
            for (let [p0, p1, c, s] of phaseLines.lineEqnsTangent) {
                if (Math.abs(c + 1) < THRESHOLD && Math.abs(s) < THRESHOLD) {
                    lineEqnsTangent.add([p0, 0, -1, 0]);
                } else if (Math.abs(c - 1) < THRESHOLD && Math.abs(s) < THRESHOLD) {
                    continue;
                } else {
                    let x = intersectLinesPinned(p0, p1, c, s, pinnedValue);
                    if (x !== null && x >= 0 && x <= 1) lineEqnsTangent.add([x, 0, -1, 0]);
                }
            }

            for (let [p0, p1, c, s] of phaseLines.lineEqnsTriple) {
                if (Math.abs(c + 1) < THRESHOLD && Math.abs(s) < THRESHOLD) {
                    lineEqnsTriple.add([p0, 0, -1, 0]);
                } else if (Math.abs(c - 1) < THRESHOLD && Math.abs(s) < THRESHOLD) {
                    continue;
                } else {
                    let x = intersectLinesPinned(p0, p1, c, s, pinnedValue);
                    if (x !== null && x >= 0 && x <= 1) lineEqnsTriple.add([x, 0, -1, 0]);
                }
            }

            // add the intersections from the scary hidden ones
            for (let [lineEqn, bounds] of phaseLines.lineClippingRawTriple) {
                let [p0, p1, c, s] = lineEqn;
                let x = intersectLinesPinned(p0, p1, c, s, pinnedValue, bounds);
                if (x !== null) lineEqnsTriple.add([x, 0, -1, 0]);
            }

            for (let [a0, a1, a2] of phaseLines.ellipseMatsTangent) {
                let a = a0;
                let b = 2 * a1 * pinnedValue;
                let c = a2 * pinnedValue * pinnedValue - 1;

                if (Math.abs(a) < THRESHOLD) {
                    if (Math.abs(b) < THRESHOLD) continue;
                    lineEqnsTangent.add([-c / b, 0, -1, 0]);
                    continue;
                }

                let d = b * b - 4 * a * c;
                if (d < -THRESHOLD) continue;
                let sd = Math.sqrt(Math.max(0, d));
                lineEqnsTangent.add([(-b + sd) / (2 * a), 0, -1, 0]);
                if (sd > THRESHOLD) lineEqnsTangent.add([(-b - sd) / (2 * a), 0, -1, 0]);
            }

            for (let [a0, a1, a2] of phaseLines.ellipseMatsTriple) {
                let a = a0;
                let b = 2 * a1 * pinnedValue;
                let c = a2 * pinnedValue * pinnedValue - 1;

                if (Math.abs(a) < THRESHOLD) {
                    if (Math.abs(b) < THRESHOLD) continue;
                    lineEqnsTriple.add([-c / b, 0, -1, 0]);
                    continue;
                }

                let d = b * b - 4 * a * c;
                if (d < -THRESHOLD) continue;
                let sd = Math.sqrt(Math.max(0, d));
                lineEqnsTriple.add([(-b + sd) / (2 * a), 0, -1, 0]);
                if (sd > THRESHOLD) lineEqnsTriple.add([(-b - sd) / (2 * a), 0, -1, 0]);
            }
        }

        // add the triple intersections
        for (let i = 0; i < pinnedSliderIndices.length; i++) {
            for (let j = i + 1; j < pinnedSliderIndices.length; j++) {
                for (let x of pinnedSystemPhaseLines(freeUnit, systemUnits[pinnedSliderIndices[i]], allSliders[pinnedSliderIndices[i]], systemUnits[pinnedSliderIndices[j]], allSliders[pinnedSliderIndices[j]])) {
                    lineEqnsTriple.add([x, 0, -1, 0]);
                }
            }
        }
    }

    oppositesPhaseX = getAnyOppositesFromSystemUnit(systemUnits[freeSystemIndices[0]]);
    oppositesPhaseY = isPhase2D ? getAnyOppositesFromSystemUnit(systemUnits[freeSystemIndices[1]]) : false;

    lineEqnsTangent.add([oppositesPhaseX ? 0 : -1, 0, -1, 0]);
    lineEqnsTriple.add([oppositesPhaseX ? 0 : -1, 0, -1, 0]);

    lineEqnsTangent.add([1, 0, -1, 0]);
    lineEqnsTriple.add([1, 0, -1, 0]);

    if (isPhase2D) lineEqnsTangent.add([0, 1, 1, 1]);
    if (isPhase2D) lineEqnsTriple.add([0, 1, 1, 1]);

    if (isPhase2D) lineEqnsTangent.add([1, oppositesPhaseY ? 0 : -1, 1, 0]);
    if (isPhase2D) lineEqnsTriple.add([1, oppositesPhaseY ? 0 : -1, 1, 0]);

    drawPhasePlot();
}

function drawPhasePlot() {

    phaseDiagram.classList.remove('hidden');
    for (let phaseDomainGChild of phaseDomainG.children) {
        removeChildren(phaseDomainGChild);
    }

    let phaseDiagramMargin = 0.0026;
    let rect = phasePanel.getBoundingClientRect();

    if (!isPhase2D) {
        let phaseDiagramThickness = 0.26 * (1 - lowerRightPhaseX);
        phaseDiagram.setAttribute('viewBox', `${-rect.width / 2 * phaseDiagramMargin + (1 - lowerRightPhaseX) / 2} ${-rect.height / 2 * phaseDiagramMargin} ${rect.width * phaseDiagramMargin} ${rect.height * phaseDiagramMargin}`);
        phaseBack.setAttributeNS(null, 'x', (lowerRightPhaseX) * phaseBakedScale);
        phaseBack.setAttributeNS(null, 'y', (-phaseDiagramThickness / 2) * phaseBakedScale);
        phaseBack.setAttributeNS(null, 'width', (1 - lowerRightPhaseX) * phaseBakedScale);
        phaseBack.setAttributeNS(null, 'height', (phaseDiagramThickness) * phaseBakedScale);


        function addPhaseLines(lineEqns, color) {
            let depthsArr = Array.from(lineEqns).map(x => x[0]).filter(x => x >= lowerRightPhaseX - THRESHOLD).sort((a, b) => a - b);
            let hasZero = Math.abs(depthsArr[0]) < THRESHOLD || lowerRightPhaseX === -1

            if (!hasZero) depthsArr.unshift(0);

            for (let i = hasZero ? 0 : 1; i < depthsArr.length; i++) {
                let lineHoverable = document.createElementNS(svgns, 'line'); // https://stackoverflow.com/a/12786915
                lineHoverable.setAttributeNS(null, 'x1', (depthsArr[i]) * phaseBakedScale);
                lineHoverable.setAttributeNS(null, 'y1', (-phaseDiagramThickness / 2) * phaseBakedScale);
                lineHoverable.setAttributeNS(null, 'x2', (depthsArr[i]) * phaseBakedScale);
                lineHoverable.setAttributeNS(null, 'y2', (phaseDiagramThickness / 2) * phaseBakedScale);
                lineHoverable.dataset.centerX = depthsArr[i];
                lineHoverable.dataset.centerY = 0;
                lineHoverable.dataset.isActuallyACircle = 0;
                lineHoverable.toast = (shift) => `${shift ? depthsArr[i] : acosDegrees(depthsArr[i])}`
                lineHoverable.classList.add('phase-domain-hoverable', 'phase-boundary-hoverable');
                lineHoverable.setAttribute("fill", color);
                lineHoverable.setAttribute("stroke", color);
                phaseBoundaryG.appendChild(lineHoverable);

                let line = document.createElementNS(svgns, 'line'); // https://stackoverflow.com/a/12786915
                line.setAttributeNS(null, 'x1', (depthsArr[i]) * phaseBakedScale);
                line.setAttributeNS(null, 'y1', (-phaseDiagramThickness / 2) * phaseBakedScale);
                line.setAttributeNS(null, 'x2', (depthsArr[i]) * phaseBakedScale);
                line.setAttributeNS(null, 'y2', (phaseDiagramThickness / 2) * phaseBakedScale);
                line.classList.add('phase-boundary')
                phaseLineG.appendChild(line);
            }
        }

        if (showTriples) addPhaseLines(lineEqnsTriple, tripleColor);
        if (showTangents) addPhaseLines(lineEqnsTangent, tangentColor);
    } else {
        phaseDiagram.setAttribute('viewBox', `${-rect.width / 2 * phaseDiagramMargin + (1 - lowerRightPhaseX) / 2 + lowerRightPhaseX} ${-rect.height / 2 * phaseDiagramMargin - (1 - lowerRightPhaseY) / 2 - lowerRightPhaseY} ${rect.width * phaseDiagramMargin} ${rect.height * phaseDiagramMargin}`);
        phaseBack.setAttributeNS(null, 'x', lowerRightPhaseX * phaseBakedScale);
        phaseBack.setAttributeNS(null, 'y', lowerRightPhaseY * phaseBakedScale);
        phaseBack.setAttributeNS(null, 'width', (1 - lowerRightPhaseX) * phaseBakedScale);
        phaseBack.setAttributeNS(null, 'height', (1 - lowerRightPhaseY) * phaseBakedScale);

        //let renderRegions = axisCount <= 24 && ellipseMats.size <= 72;
        let renderRegions = true;

        let ellipseArrTangent = Array.from(ellipseMatsTangent);
        let lineArrOgTangent = Array.from(lineEqnsTangent);
        let lineArrTangent = lineArrOgTangent.map(lineEqnToDot);

        let ellipseArrTriple = Array.from(ellipseMatsTriple);
        let lineArrOgTriple = Array.from(lineEqnsTriple);
        let lineArrTriple = lineArrOgTriple.map(lineEqnToDot);

        let intersectionsTangent = new FloatSet(2);
        let intersectionsTriple = new FloatSet(2);
        let lineIntersectionsTangent = lineArrTangent.map(() => new Set()); // i: list of points on line i
        let lineIntersectionsTriple = lineArrTriple.map(() => new Set());
        let ellipseIntersectionsTangent = ellipseArrTangent.map(() => new Set()); // i: list of points on ellipse i
        let ellipseIntersectionsTriple = ellipseArrTriple.map(() => new Set());
        // these are Set and not FloatSet(2) because i want to check ===

        let ellipseArrAll = Array.from([...(showTangents ? ellipseMatsTangent : []), ...(showTriples ? ellipseMatsTriple : [])]);
        let lineArrOgAll = Array.from([...(showTangents ? lineEqnsTangent : []), ...(showTriples ? lineEqnsTriple : [])]);
        let lineArrAll = lineArrOgAll.map(lineEqnToDot);

        let intersectionsAll = new FloatSet(2);

        function splitLines(ellipseArr, lineArrOg, lineArr, lineClipping, intersections, splitShape, ellipseIntersections, lineIntersections) {
            if (renderRegions) {
                for (let i = 0; i < lineArr.length; i++) { // lines and ...
                    let [[p0, p1], [d0, d1], dot, perp] = lineArr[i];
                    let bounds = lineClipping.get(lineArrOg[i]) ?? [-3, 3];

                    if (splitShape) lineIntersections[i].add([p0 + bounds[0] * d0, p1 + bounds[0] * d1]);
                    if (splitShape) lineIntersections[i].add([p0 + bounds[1] * d0, p1 + bounds[1] * d1]);

                    for (let j = 0; j < i; j++) { // loop through lines
                        let [pt1, [d10, d11], dot1, perp1] = lineArr[j];

                        let bounds1 = lineClipping.get(lineArrOg[j]) ?? [-3, 3];

                        if (splitShape) lineIntersections[j].add([pt1[0] + bounds1[0] * d10, pt1[1] + bounds1[0] * d11]);
                        if (splitShape) lineIntersections[j].add([pt1[0] + bounds1[1] * d10, pt1[1] + bounds1[1] * d11]);

                        let intersection = intersections.wouldAddWhich(intersectLines(dot, perp, dot1, perp1));
                        if (intersection) {

                            let dx = intersection[0] * d0 + intersection[1] * d1;
                            let dy = intersection[0] * d10 + intersection[1] * d11;

                            if ((dx > bounds[0] - THRESHOLD && dx < bounds[1] + THRESHOLD) && (dy > bounds1[0] - THRESHOLD && dy < bounds1[1] + THRESHOLD)) {
                                intersections.add(intersection);

                                if (splitShape) {
                                    let x = intersection[0];
                                    let y = intersection[1];

                                    let onEdgeX = (Math.abs(x + lowerRightPhaseX) < THRESHOLD || Math.abs(x) > 1 - THRESHOLD);
                                    let onEdgeY = (Math.abs(y + lowerRightPhaseY) < THRESHOLD || Math.abs(y) > 1 - THRESHOLD);
                                    let onBound1 = Math.abs(dx - bounds[0]) < THRESHOLD || Math.abs(dx - bounds[1]) < THRESHOLD;
                                    let onBound2 = Math.abs(dy - bounds1[0]) < THRESHOLD || Math.abs(dy - bounds1[1]) < THRESHOLD;

                                    let hi = Math.abs(perp[0]) < THRESHOLD;
                                    let vi = Math.abs(perp[1]) < THRESHOLD;

                                    let hj = Math.abs(perp1[0]) < THRESHOLD;
                                    let vj = Math.abs(perp1[1]) < THRESHOLD;

                                    if (onEdgeX || onEdgeY) {
                                        if (onEdgeX && vi) {
                                            lineIntersections[j].add(intersection);
                                        }
                                        if (onEdgeX && vj) {
                                            lineIntersections[i].add(intersection);
                                        }
                                        if (onEdgeY && hi) {
                                            lineIntersections[j].add(intersection);
                                        }
                                        if (onEdgeY && hj) {
                                            lineIntersections[i].add(intersection);
                                        }
                                    } else {
                                        if (onBound1) {
                                            lineIntersections[i].add(intersection);
                                        }
                                        if (onBound2) {
                                            lineIntersections[j].add(intersection);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let j = 0; j < ellipseArr.length; j++) { // loop through ellipses
                        let [a0, a1, a2] = ellipseArr[j];
                        let [tP, tM] = quadratic(a0 * d0 * d0 + 2 * a1 * d0 * d1 + a2 * d1 * d1, 2 * (a0 * p0 * d0 + a1 * p1 * d0 + a1 * p0 * d1 + a2 * p1 * d1), a0 * p0 * p0 + 2 * a1 * p0 * p1 + a2 * p1 * p1 - 1); // substitute parametric line into ellipse
                        if (tP === null) continue;

                        for (let t of [tP, tM]) {
                            let intersection = intersections.wouldAddWhich([p0 + t * d0, p1 + t * d1]);
                            if (intersection) {
                                if (intersection[0] * d0 + intersection[1] * d1 > bounds[0] - THRESHOLD && intersection[0] * d0 + intersection[1] * d1 < bounds[1] + THRESHOLD) {
                                    intersections.add(intersection);

                                    if (splitShape) {
                                        let x = intersection[0];
                                        let y = intersection[1];

                                        let bottomBoundX = Math.abs(x + lowerRightPhaseX) < THRESHOLD;
                                        let topBoundX = Math.abs(x) > 1 - THRESHOLD;
                                        let bottomBoundY = Math.abs(y + lowerRightPhaseY) < THRESHOLD;
                                        let topBoundY = Math.abs(y) > 1 - THRESHOLD;

                                        let isXBoundary = bottomBoundX || topBoundX;
                                        let isYBoundary = bottomBoundY || topBoundY;

                                        // If you're on the edge
                                        if (isXBoundary || isYBoundary) {
                                            //lineIntersections[i].add(intersection);

                                            let gx = 2 * a0 * x + 2 * a1 * y;
                                            let gy = 2 * a1 * x + 2 * a2 * y;

                                            // If you're at a corner
                                            if (isXBoundary && isYBoundary) {
                                                ellipseIntersections[j].add(intersection);
                                            } else {
                                                // ignore intersections at tangent boundaries
                                                if (!((isXBoundary && Math.abs(gy) < THRESHOLD) || (isYBoundary && Math.abs(gx) < THRESHOLD))) {
                                                    ellipseIntersections[j].add(intersection);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (!splitShape) {
                    for (let i = 0; i < ellipseArr.length; i++) { // KNOWN ISSUE: tangent ellipses
                        for (let j = 0; j < i; j++) { // loop through ellipses
                            let [a0, a1, a2] = ellipseArr[i]; // definitely will not have determinant 0
                            let [b0, b1, b2] = ellipseArr[j]; // definitely will not have determinant 0
                            // also they're not the same so discrim is not 0

                            let diffDet = (a0 - b0) * (a2 - b2) - (a1 - b1) ** 2;
                            if (diffDet > THRESHOLD) continue; // the ellipses do not intersect

                            let ts = quadratic(b0 * b2 - b1 * b1, a2 * b0 - 2 * a1 * b1 + a0 * b2, a0 * a2 - a1 * a1);
                            // det(A + t B) = 0
                            if (ts[0] === null) continue;
                            let lineParams = [] // dot0, perp0, dot1, perp1 
                            for (let t of ts) {
                                let [c0, c1, c2] = [a0 + t * b0, a1 + t * b1, a2 + t * b2].map(c => Math.abs(c) < THRESHOLD ? 0 : c); // without the zeroing sometimes you get incorrect negatives below
                                if (c0 < 0 || c2 < 0) {
                                    c0 *= -1;
                                    c1 *= -1;
                                    c2 *= -1;
                                }
                                let [v0, v1] = [Math.sqrt(c0), Math.sqrt(c2)];
                                if (c1 < 0) v1 *= -1;
                                let norm = Math.sqrt(v0 ** 2 + v1 ** 2);
                                lineParams.push(Math.sqrt(Math.abs(1 + t)) / norm, [v0 / norm, v1 / norm]);
                            }

                            let [dot0, perp0, dot1, perp1] = lineParams;

                            for (let k0 of [1, -1]) {
                                for (let k1 of [1, -1]) {
                                    let intersection = intersections.wouldAddWhich(intersectLines(k0 * dot0, perp0, k1 * dot1, perp1));
                                    if (intersection) {
                                        intersections.add(intersection);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (showTangents) splitLines(ellipseArrTangent, lineArrOgTangent, lineArrTangent, lineClippingTriple, intersectionsTangent, true, ellipseIntersectionsTangent, lineIntersectionsTangent);
        if (showTriples) splitLines(ellipseArrTriple, lineArrOgTriple, lineArrTriple, lineClippingTriple, intersectionsTriple, true, ellipseIntersectionsTriple, lineIntersectionsTriple);
        
        splitLines(ellipseArrAll, lineArrOgAll, lineArrAll, lineClippingTriple, intersectionsAll, false, [], []);

        function straightPhaseLines(lineArrOg, lineArr, lineIntersections, lineClipping, linesClipped, color) {
            for (let i = 0; i < lineArr.length; i++) {
                let [pt, [d0, d1], dot, perp] = lineArr[i];
                let lineInts = Array.from(lineIntersections[i])
                    .filter(int => int.every(c => Math.abs(c) < 1 + THRESHOLD))
                    .sort((intA, intB) => (intA[0] * d0 + intA[1] + d1) - (intB[0] * d0 + intB[1] + d1));

                let line = document.createElementNS(svgns, 'line'); // https://stackoverflow.com/a/12786915
                //console.log(pt,dot,dir)

                let bounds;
                if (linesClipped.has(lineArrOg[i])) {
                    bounds = lineClipping.get(lineArrOg[i]);
                } else {
                    bounds = [-3, 3];
                }
                line.setAttributeNS(null, 'x1', (pt[0] + bounds[0] * d0) * phaseBakedScale);
                line.setAttributeNS(null, 'y1', (pt[1] + bounds[0] * d1) * phaseBakedScale);
                line.setAttributeNS(null, 'x2', (pt[0] + bounds[1] * d0) * phaseBakedScale);
                line.setAttributeNS(null, 'y2', (pt[1] + bounds[1] * d1) * phaseBakedScale);
                line.classList.add('phase-clip', 'phase-boundary');
                phaseLineG.appendChild(line);

                if (renderRegions) {
                    for (let j = 0; j < lineInts.length - 1; j++) {
                        let [end0, end1] = [lineInts[j], lineInts[j + 1]];
                        let [midpointX, midpointY] = [(end0[0] + end1[0]) / 2, (end0[1] + end1[1]) / 2];
                        if (midpointX > lowerRightPhaseX - THRESHOLD && midpointX < 1 + THRESHOLD && midpointY > lowerRightPhaseY - THRESHOLD && midpointY < 1 + THRESHOLD) {
                            let lineSeg = document.createElementNS(svgns, 'line'); // https://stackoverflow.com/a/12786915
                            lineSeg.setAttributeNS(null, 'x1', end0[0] * phaseBakedScale);
                            lineSeg.setAttributeNS(null, 'y1', end0[1] * phaseBakedScale);
                            lineSeg.setAttributeNS(null, 'x2', end1[0] * phaseBakedScale);
                            lineSeg.setAttributeNS(null, 'y2', end1[1] * phaseBakedScale);
                            lineSeg.classList.add('phase-domain-hoverable', 'phase-boundary-hoverable');
                            lineSeg.setAttribute("fill", color);
                            lineSeg.setAttribute("stroke", color);
                            lineSeg.dataset.centerX = midpointX;
                            lineSeg.dataset.centerY = midpointY;
                            lineSeg.dataset.isActuallyACircle = 0;

                            lineSeg.toast = (shift) => {
                                const dx = end1[0] - end0[0];
                                const dy = end1[1] - end0[1];

                                if (Math.abs(dx) < THRESHOLD) {
                                    return `${shift ? end0[0] : acosDegrees(end0[0])}`;
                                }

                                if (Math.abs(dy) < THRESHOLD) {
                                    return `${shift ? end0[1] : acosDegrees(end0[1])}`;
                                }

                                const m = dy / dx;
                                const b = end0[1] - m * end0[0];

                                return `y =${(Math.abs(m) < THRESHOLD + 1 && Math.abs(m) > 1 - THRESHOLD) ? " " : ` ${m >= 0 ? "" : "-"}${Math.abs(m)}`}x${Math.abs(b) < THRESHOLD ? "" : ` ${b >= 0 ? "+" : "-"} ${Math.abs(b)}`}`;
                            };

                            if (end0[0] * end1[0] < -(THRESHOLD ** 2) || end0[1] * end1[1] < -(THRESHOLD ** 2)) {
                                lineSeg.classList.add('phase-clip-origin');
                            }
                            phaseBoundaryG.appendChild(lineSeg);
                        }
                    }
                }
            }
        }

        if (showTangents) straightPhaseLines(lineArrOgTangent, lineArrTangent, lineIntersectionsTangent, new Map(), new FloatSet(4), tangentColor);
        if (showTriples) straightPhaseLines(lineArrOgTriple, lineArrTriple, lineIntersectionsTriple, lineClippingTriple, linesClippedTriple, tripleColor);

        function curvedPhaseLines(ellipseArr, ellipseIntersections, color) {
            for (let i = 0; i < ellipseArr.length; i++) { // change for non-centered ellipses
                let ellipseInts = Array.from(ellipseIntersections[i])
                    .sort((intA, intB) => Math.atan2(intA[1], intA[0]) - Math.atan2(intB[1], intB[0]));
                ellipseInts.push(ellipseInts[0]);

                let [a0, a1, a2] = ellipseArr[i]; // definitely will not have determinant 0
                // solve equation l^2 - (a0+a2)l + (a0 a2-a1^2) = 0 for eigenvalues l
                let [eigenP, eigenM] = quadratic(1, -a0 - a2, a0 * a2 - a1 * a1); // it will be real
                let axisX = eigenM ** -0.5;
                let axisY = eigenP ** -0.5;
                let angle;
                if (Math.abs(a1) < THRESHOLD) {
                    angle = a0 < a2 ? 0 : Math.PI / 2
                } else {
                    angle = Math.atan2(a1, (a0 - eigenP)); // not sure why
                }

                let ellipseG = document.createElementNS(svgns, 'g'); // https://stackoverflow.com/a/12786915
                ellipseG.classList.add('phase-clip');
                let ellipse = document.createElementNS(svgns, 'ellipse'); // https://stackoverflow.com/a/12786915
                ellipse.setAttributeNS(null, 'cx', 0);
                ellipse.setAttributeNS(null, 'cy', 0);
                ellipse.setAttributeNS(null, 'rx', axisX * phaseBakedScale);
                ellipse.setAttributeNS(null, 'ry', axisY * phaseBakedScale);
                ellipse.setAttributeNS(null, 'transform', `rotate(${angle * 180/Math.PI})`);
                ellipse.classList.add('phase-boundary', 'phase-boundary-ellipse');
                ellipseG.appendChild(ellipse);
                phaseLineG.appendChild(ellipseG);

                if (renderRegions) {
                    if (!oppositesPhaseX && !oppositesPhaseY) {
                        let ellipse = document.createElementNS(svgns, 'ellipse'); // https://stackoverflow.com/a/12786915
                        ellipse.classList.add('phase-domain-hoverable', 'phase-boundary-hoverable');
                        ellipse.setAttribute("fill", color);
                        ellipse.setAttribute("stroke", color);
                        ellipse.setAttributeNS(null, 'cx', 0);
                        ellipse.setAttributeNS(null, 'cy', 0);
                        ellipse.setAttributeNS(null, 'rx', axisX * phaseBakedScale);
                        ellipse.setAttributeNS(null, 'ry', axisY * phaseBakedScale);
                        ellipse.setAttributeNS(null, 'transform', `rotate(${angle * 180/Math.PI})`);
                        ellipse.dataset.centerX = 0;
                        ellipse.dataset.centerY = 0;
                        ellipse.dataset.isActuallyACircle = 0;
                        ellipse.toast = (shift) => `a = ${axisX}, b = ${axisY}, θ = ${angle * 180/Math.PI}`;
                        phaseBoundaryG.appendChild(ellipse);
                    }

                    for (let j = 0; j < ellipseInts.length - 1; j++) {
                        let [end0, end1] = [ellipseInts[j], ellipseInts[j + 1]];
                        let angDiff = Math.atan2(end1[1], end1[0]) - Math.atan2(end0[1], end0[0]);
                        let largeArc = angDiff > Math.PI || (angDiff < 0 && angDiff > -Math.PI);

                        let ellipsePath = (ori, end) => `A ${axisX * phaseBakedScale} ${axisY * phaseBakedScale} ${angle * 180/Math.PI} ${+largeArc} ${ori} ${end[0] * phaseBakedScale} ${end[1] * phaseBakedScale}`

                        let bottomBound0 = end0[0] > lowerRightPhaseX - THRESHOLD && end0[1] > lowerRightPhaseY - THRESHOLD;
                        let bottomBound1 = end1[0] > lowerRightPhaseX - THRESHOLD && end1[1] > lowerRightPhaseY - THRESHOLD;
                        let topBound0 = end0[0] < 1 + THRESHOLD && end0[1] < 1 + THRESHOLD;
                        let topBound1 = end1[0] < 1 + THRESHOLD && end1[1] < 1 + THRESHOLD;

                        if (bottomBound0 && bottomBound1 && topBound0 && topBound1 && (!oppositesPhaseX ? end0[0] >= 0 : true) && (!oppositesPhaseY ? end0[1] <= 0 : true)) {
                            let ellipseSeg = document.createElementNS(svgns, 'path'); // https://stackoverflow.com/a/12786915
                            ellipseSeg.setAttributeNS(null, 'd', `M ${end0[0] * phaseBakedScale} ${end0[1] * phaseBakedScale} ` + ellipsePath(1, end1));
                            ellipseSeg.classList.add('phase-domain-hoverable', 'phase-boundary-hoverable');
                            ellipseSeg.dataset.centerX = 0; // edit these maybe
                            ellipseSeg.dataset.centerY = 0;
                            ellipseSeg.dataset.isActuallyACircle = 0;
                            ellipseSeg.setAttribute("fill", color);
                            ellipseSeg.setAttribute("stroke", color);
                            ellipseSeg.toast = (shift) => `a = ${axisX}, b = ${axisY}, θ = ${angle * 180/Math.PI}`;
                            phaseBoundaryG.appendChild(ellipseSeg);
                        }
                    }
                }
            }
        }

        if (showTangents) curvedPhaseLines(ellipseArrTangent, ellipseIntersectionsTangent, tangentColor);
        if (showTriples) curvedPhaseLines(ellipseArrTriple, ellipseIntersectionsTriple, tripleColor);

        let intersectionArr = Array.from(intersectionsAll);
        if (renderRegions) {
            for (let i = 0; i < intersectionArr.length; i++) {
                let intersection = intersectionArr[i];
                if (!(intersection[0] > lowerRightPhaseX - THRESHOLD && intersection[1] > lowerRightPhaseY - THRESHOLD)) continue;
                if (!(intersection[0] < 1 + THRESHOLD && intersection[1] < 1 + THRESHOLD)) continue;

                let nodeHoverable = document.createElementNS(svgns, 'path'); // https://stackoverflow.com/a/12786915
                let dr = 0.015;
                nodeHoverable.setAttributeNS(null, 'd', `m ${intersection[0] * phaseBakedScale - dr} ${intersection[1] * phaseBakedScale} a ${dr} ${dr} 0 1 0 ${2 * dr} 0 a ${dr} ${dr} 0 1 0 ${-2 * dr} 0`);
                nodeHoverable.dataset.centerX = intersection[0];
                nodeHoverable.dataset.centerY = intersection[1];
                nodeHoverable.dataset.isActuallyACircle = 1;
                nodeHoverable.setAttribute("fill", dotColor);
                nodeHoverable.setAttribute("stroke", dotColor);
                nodeHoverable.toast = (shift) => `(${shift ? intersection[0] : acosDegrees(intersection[0])}, ${shift ? intersection[1] : acosDegrees(intersection[1])})`;
                nodeHoverable.classList.add('phase-domain-hoverable', 'phase-node-hoverable');
                phaseBoundaryG.appendChild(nodeHoverable);
            }
        }
    }

    let phaseBackClipRect = document.getElementById('phase-back-clip-rect');
    phaseBackClipRect.setAttributeNS(null, 'x', (parseFloat(phaseBack.getAttributeNS(null, 'x')) - 0.0035 * phaseBakedScale));
    phaseBackClipRect.setAttributeNS(null, 'y', (parseFloat(phaseBack.getAttributeNS(null, 'y')) - 0.0035 * phaseBakedScale));
    phaseBackClipRect.setAttributeNS(null, 'width', (parseFloat(phaseBack.getAttributeNS(null, 'width')) + 0.007 * phaseBakedScale));
    phaseBackClipRect.setAttributeNS(null, 'height', (parseFloat(phaseBack.getAttributeNS(null, 'height')) + 0.007 * phaseBakedScale));

    let phaseBackClipOriginRect = document.getElementById('phase-back-clip-origin-rect');
    phaseBackClipOriginRect.setAttributeNS(null, 'x', (parseFloat(phaseBack.getAttributeNS(null, 'x')) - 0.0035 * phaseBakedScale));
    phaseBackClipOriginRect.setAttributeNS(null, 'y', (parseFloat(phaseBack.getAttributeNS(null, 'y')) - 0.0035 * phaseBakedScale));
    phaseBackClipOriginRect.setAttributeNS(null, 'width', (parseFloat(phaseBack.getAttributeNS(null, 'width')) + phaseBakedScale));
    phaseBackClipOriginRect.setAttributeNS(null, 'height', (parseFloat(phaseBack.getAttributeNS(null, 'height')) + phaseBakedScale));
    setPhaseSlider();
}

function acosDegrees(value) {
    const radians = Math.acos(value);
    return radians * (180 / Math.PI);
}

let toastTimer = null;

function showToast(message) {
    let toast = document.getElementById('copy-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'copy-toast';
        toast.style = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:5px; z-index:1000; transition: opacity 0.2s ease-in-out;";
        document.body.appendChild(toast);
    }

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.opacity = '1';

    toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.style.opacity === '0') {
                toast.style.display = 'none';
            }
        }, 200);
    }, 5000);
}


function lineEqnToDot(line) {
    let [p0, p1, c2f, s2f] = line;
    let [cf, sf] = [Math.sqrt((1 + c2f) / 2), Math.sqrt((1 - c2f) / 2)]
    cf *= s2f === 0 ? 1 : Math.sign(s2f);
    return [
        [p0, p1],
        [cf, sf], p0 * sf - p1 * cf, [sf, -cf]
    ]
}


function quadratic(a, b, c) {
    let discrim = b * b - 4 * a * c;
    if (discrim < -THRESHOLD) return [null, null];
    else if (discrim < THRESHOLD) discrim = 0;
    let tP = (-b + Math.sqrt(discrim)) / (2 * a);
    let tM = (-b - Math.sqrt(discrim)) / (2 * a);
    return [tP, tM];
}


function intersectLines(dot0, perp0, dot1, perp1) {
    let det = perp0[0] * perp1[1] - perp0[1] * perp1[0];
    let intersection = [(perp1[1] * dot0 - perp0[1] * dot1) / det, (-perp1[0] * dot0 + perp0[0] * dot1) / det];
    return intersection;
}


function phaseMouseToPoint(e) {
    phasePt.x = e.clientX; // https://stackoverflow.com/a/42711775
    phasePt.y = e.clientY;
    return phasePt.matrixTransform(phaseDomainG.getScreenCTM().inverse());
}


function hidePhaseDiagram() {
    phaseDiagram.classList.add('hidden');
    let axisCounts = countAxes();
    let tooManySliders = axisCounts.length > 2;
    let tooFewSliders = axisCounts.length < 1;
    //let tooManyAxes = axisCounts.reduce((a, b) => a + b, 0) > 60;
    let tooManyAxes = false;
    document.getElementById('phase-create').dataset.translate =
        tooManySliders ? 'other.create_phase_diagram.too_many_sliders' :
        tooFewSliders ? 'other.create_phase_diagram.too_few_sliders' :
        tooManyAxes ? 'other.create_phase_diagram.too_many_axes' :
        'other.create_phase_diagram.good'
    if (tooManySliders || tooFewSliders || tooManyAxes) {
        document.getElementById('phase-create').dataset.disabled = ''
    } else {
        delete document.getElementById('phase-create').dataset.disabled
    }
    singleSetTranslationHTML(document.getElementById('phase-create'));
    phaseCamera = new Viewport(phaseDiagram, phaseG, phaseBakedScale);
}