import { fail } from "./Logging";
import type { Renderer } from "./Renderer";


function getShader(name: string, r: Renderer): GPUShaderModule {
    const shader = r.shaders.get(name)
    if (shader === undefined) {
        fail(`Shader not found: ${name}`)
    }
    return shader!.module!
}

export function createCachedConfiguration(r: Renderer) {
    if (r.update_pipeline) {
        
        const shader_module = getShader('Shader.wgsl', r)

        r.pipeline = r.device!.createRenderPipeline({
            label: 'our hardcoded red triangle pipeline',
            layout: 'auto',
            vertex: {
                module: shader_module,
            },
            fragment: {
                module: shader_module,
                targets: [{ format: r.presentationFormat! }],
            },
        });

        r.bindGroup = r.device!.createBindGroup({
            label: 'triangle bind group',
            layout: r.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: r.perspective_matrix_buff! }},
                { binding: 1, resource: { buffer: r.scene.uniform_buff! }},
                { binding: 2, resource: { buffer: r.scene.mesh.vertex_buff! }},
            ],
        });

        r.descriptor = {
            label: 'our basic canvas renderPass',
            colorAttachments: [
                {
                    view: r.context!.getCurrentTexture().createView(),
                    clearValue: [0.3, 0.3, 0.3, 1],
                    loadOp: 'clear',
                    storeOp: 'store'
                },
            ],
        };

        r.update_pipeline = false
    }
}