import { Renderer } from "./Renderer";
import { fail } from "./Logging";

export function bindToCanvas(r: Renderer) {
    if (r.canvas_binded === true) {
        return
    }

    if (r.device_found == false) {
        fail("device not found")
    }

    r.canvas = document.querySelector('canvas')!;
    r.context = r.canvas.getContext('webgpu')!;
    r.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    // Bind
    r.context.configure({
        device: r.device!,
        format: r.presentationFormat,
    });

    r.canvas_binded = true
}