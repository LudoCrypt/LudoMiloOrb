class Viewport {
    constructor(svgElement, layerElement, startingScale) {
        this.viewport = svgElement;
        this.layer = layerElement;
        this.viewportPt = this.viewport.createSVGPoint();

        this.mat = new DOMMatrix();

        this.mat.a /= startingScale;
        this.mat.d /= startingScale;

        this.transMat = new DOMMatrix();

        this.lastX = 0;
        this.lastY = 0;
        this.isDragging = false;

        this.initEvents();
        this.updateSVG();
    }

    setMouse(x, y) {
        this.transMat = new DOMMatrix();
        this.transMat.e = x;
        this.transMat.f = y;

        const scaleX = this.mat.a;
        const scaleY = this.mat.d;
        const translateX = this.mat.e;
        const translateY = this.mat.f;

        const worldX = (x - translateX) * scaleX;
        const worldY = (y - translateY) * scaleY;
    }

    pushMouse() {
        this.mat = this.transMat.multiply(this.mat);
        this.setMouse(0, 0);
    }

    zoom(x, y, zoomScale, dir) {
        if (this.locked) return;

        zoomScale += Math.abs(dir / 10.0);
        if (dir > 0) {
            zoomScale = 1 / zoomScale;
        }

        const scaleX = this.mat.a;
        const scaleY = this.mat.d;
        const translateX = this.mat.e;
        const translateY = this.mat.f;

        const worldX = (x - translateX) / scaleX;
        const worldY = (y - translateY) / scaleY;

        this.mat.a *= zoomScale;
        this.mat.d *= zoomScale;

        this.mat.a = Math.max(Math.min(0.5, this.mat.a), 0.02);
        this.mat.d = Math.max(Math.min(0.5, this.mat.d), 0.02);

        this.mat.e = x - worldX * this.mat.a;
        this.mat.f = y - worldY * this.mat.d;
    }

    updateSVG() {
        const m = this.transMat.multiply(this.mat);
        this.layer.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${-m.d}, ${m.e}, ${m.f})`;
        setPhaseSlider();
    }

    phaseMouseToPoint(e) {
        this.viewportPt.x = e.clientX; // https://stackoverflow.com/a/42711775
        this.viewportPt.y = e.clientY;
        return this.viewportPt.matrixTransform(this.viewport.getScreenCTM().inverse());
    }

    initEvents() {
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const dir = e.deltaY > 0 ? 1 : -1;

            const p = this.phaseMouseToPoint(e);
            this.zoom(p.x, p.y, 1.1, dir);
            this.updateSVG();
        }, {
            passive: false
        });

        this.viewport.addEventListener('mousedown', (e) => {
            if (e.button === 1) {
                this.isDragging = true;
                const p = this.phaseMouseToPoint(e);

                this.lastX = p.x;
                this.lastY = p.y;

                e.preventDefault();
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const p = this.phaseMouseToPoint(e);

            const dx = p.x - this.lastX;
            const dy = p.y - this.lastY;

            this.setMouse(dx, dy);
            this.updateSVG();
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 1 && this.isDragging) {
                this.isDragging = false;
                this.pushMouse();
                this.updateSVG();
            }
        });
    }
}