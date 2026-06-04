'use strict'

const THRESHOLD = 1e-6; // would feel a bit better if this were smaller
// but numerical imprecision in the phase diagram intersection calculations are greater than 1e-9

function FloatSet(dimension=1, threshold){
    // update this to accommodate box-crossing
    this.dimension = dimension;
    this.threshold = threshold || THRESHOLD;
    this.boxWidth = 0.00028182845904523534; // e mod 1/10000, hopefully a nice irrational number
    this.boxFloat = x => Math.floor(x / this.boxWidth + 0.5); // the 0.5 puts 0 in the middle of a box
    this.boxArray = arr => arr.map(x => this.boxFloat(x));

    this.hashMap = new Map();
    this.size = 0;

    this.find = function(el, callbackFound, callbackNotFound){
        if (this.dimension === 1 && typeof el === 'number') el = [el];
        if (el.some(x => Number.isNaN(x))) return null;
        if (el.length !== this.dimension) throw new Error('invalid dimension');
        let box = this.boxArray(el);
        let currentHashMap = this.hashMap;
        for (let ind of box.slice(0,-1)){
            if (!currentHashMap.has(ind)) currentHashMap.set(ind, new Map());
            currentHashMap = currentHashMap.get(ind);
        }

        let lastInd = box[box.length-1];
        if (!currentHashMap.has(lastInd)) currentHashMap.set(lastInd, []);
        let nearbyElements = currentHashMap.get(lastInd);

        for (let j = 0; j < nearbyElements.length; j++){
            let nearbyElement = nearbyElements[j];
            let farFrom = false;
            for (let i = 0; i < this.dimension; i++){
                if (Math.abs(nearbyElement[i] - el[i]) > this.threshold){
                    farFrom = true;
                    break;
                }
            }
            if (!farFrom){
                return callbackFound(this, el, box, j, nearbyElements);
            }
        }

        return callbackNotFound(this, el, nearbyElements); // not found
    }

    this.add = function(el){
        return this.find(el, (ths, el, box, j, nearbyElements) => ths, (ths, el, nearbyElements) => {
            nearbyElements.push(el);
            ths.size ++;
            return ths;
        });
    }

    this.addWhich = function(el){
        return this.find(el, (ths, el, box, j, nearbyElements) => nearbyElements[j], (ths, el, nearbyElements) => {
            nearbyElements.push(el);
            ths.size ++;
            return el;
        });
    }

    this.clear = function(){
        this.hashMap = new Map();
        this.size = 0;
    }

    this.delete = function(el){
        return this.find(el, (ths, el, box, j, nearbyElements) => {
            nearbyElements.splice(j);
            ths.size --;
            return ths;
        }, (ths, el, nearbyElements) => ths);
    }

    this.has = function(el){
        return this.find(el, (ths, el, box, j, nearbyElements) => true, (ths, el, nearbyElements) => false);
    }

    this.hasWhich = function(el){
        return this.find(el, (ths, el, box, j, nearbyElements) => nearbyElements[j], (ths, el, nearbyElements) => null);
    }

    this.wouldAddWhich = function(el){
        return this.find(el, (ths, el, box, j, nearbyElements) => nearbyElements[j], (ths, el, nearbyElements) => el);
    }

    this.valuesHashMap = function*(hm, depth){
        //console.log(hm,depth)
        for (let hmInner of hm.values()){
            if (depth === 0){
                yield* hmInner.values();
            } else {
                yield* this.valuesHashMap(hmInner, depth-1);
            }
        }
    }

    this.values = function*(){
        yield* this.valuesHashMap(this.hashMap, this.dimension-1);
    }

    this.keys = this.values;
    this[Symbol.iterator] = this.values;
}