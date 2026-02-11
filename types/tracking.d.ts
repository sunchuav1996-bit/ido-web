// Type definitions for tracking.js
declare module 'tracking' {
    class ObjectTracker {
        constructor(type: string);
        setInitialScale(scale: number): void;
        setStepSize(size: number): void;
        setEdgesDensity(density: number): void;
        on(event: string, callback: (event: any) => void): void;
    }

    function track(element: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, tracker: ObjectTracker): void;

    export { ObjectTracker };
    export default { ObjectTracker, track };
}

declare module 'tracking/build/data/face-min.js' {
    export { };
}
