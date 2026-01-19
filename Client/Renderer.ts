import { fail } from "./Logging";

// Sub Files
import { createShaderModules } from "./Shaders"
import { createBuffers } from "./Buffers";
import { createCachedConfiguration } from "./CachedConfiguration";
import { configurePerspectiveTransform_FixedFunction } from "./PerspectiveTransform_FixedFunction";
import { loadBuffers } from "./Load Buffers";
import { command } from "./Command";

//
import { Scene } from "./Start";


export class Renderer {
    // Device
    device_found = false
    adapter: GPUAdapter | null | undefined;
    device: GPUDevice | undefined;
    gpu_name: string | undefined;

    // Surface
    canvas_binded = false;
    canvas: HTMLCanvasElement | undefined;
    context: GPUCanvasContext | undefined;
    presentationFormat: GPUTextureFormat | undefined;

    // Shaders
    shader_module: GPUShaderModule | undefined

    // Buffers
    perspective_matrix_buff: GPUBuffer | undefined
    uniform_buff: GPUBuffer | undefined
    
    vertex_count: number = 0
    vertex_buff: GPUBuffer | undefined
    
    // Textures
    // 

    // Cached Configuration
    pipeline: GPURenderPipeline | undefined
    bindGroup: GPUBindGroup | undefined
    descriptor: GPURenderPassDescriptor | any
}


async function findDevice(r: Renderer): Promise<void> {
    if (r.device_found === true) {
        return
    }

    const msg = 'need a browser that supports WebGPU';
    
    // Extract
    r.adapter = await navigator.gpu?.requestAdapter();
    if (r.adapter === null) {
        fail("Failed to request adapater");
    }

    r.device = await r.adapter?.requestDevice();
    if (!r.device) {
        fail("Failed to request device");
    }

    r.gpu_name = `Device: ${r.adapter!.info.device} Vendor: ${r.adapter!.info.vendor} Description: ${r.adapter!.info.description}`;
    console.log(`GPU Found: ${r.gpu_name}`);

    r.device_found = true
}

function bindToCanvas(r: Renderer) {
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

export async function render(r: Renderer, scene: Scene) {
    await findDevice(r)
    bindToCanvas(r)
    createShaderModules(r)
    createBuffers(r)

    createCachedConfiguration(r)
    configurePerspectiveTransform_FixedFunction(90, 2 / 1, 0.1, 1000, r)
    loadBuffers(r, scene)

    command(r)
}
