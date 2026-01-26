import { fail } from "./Logging";

// Sub Files
import { findDevice } from "./FindDevice";
import { bindToCanvas } from './BindToCanvas'
import { createShaderModules } from "./Shaders"
import { createCachedConfiguration } from "./CachedConfiguration";
import { configurePerspectiveTransform_FixedFunction } from "./PerspectiveTransform_FixedFunction";
import { command } from "./Command";

//
import { Scene } from "./Start";
import { generateGPUdata } from "./Generate GPU Data/Generate GPU Data";
import { UploadBuffer } from "./GPU Aligned Types/GPU Aligned Types"
import { vec2, vec3, vec4 } from "wgpu-matrix";


export class Renderer {
    scene: GPU_Scene = new GPU_Scene;

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
    shaders = new Map<string, Shader>()

    // Buffers
    upload_buff = new UploadBuffer()
    perspective_matrix_buff: GPUBuffer | undefined
    
    // Textures
    // 

    // Cached Configuration
    update_pipeline = true
    pipeline: GPURenderPipeline | undefined
    bindGroup: GPUBindGroup | undefined
    descriptor: GPURenderPassDescriptor | any
}

export class Shader {
    update = true  // should the shader module be recreated
    code: string = ""
    module: GPUShaderModule | undefined
}

export class GPU_Scene {
    camera = new GPU_Camera()
    mesh = new GPU_Mesh()

    uniform_buff: GPUBuffer | undefined
}

export class GPU_Camera {
    
}

export class GPU_Mesh {
    vertex_count = 0
    vertex_buff: GPUBuffer | undefined

    pos = vec3.zero()
    rot_quat = vec4.zero()
}

export class GPU_Instance {
    
}

export async function render(r: Renderer, cpu_scene: Scene) {
    await findDevice(r)
    bindToCanvas(r)
    createShaderModules(r)
    
    generateGPUdata(r, cpu_scene)
    configurePerspectiveTransform_FixedFunction(90, 2 / 1, 0.1, 1000, r)
    createCachedConfiguration(r)

    command(r)
}

export { requestShaderUpdate as updateShader } from "./Shaders"