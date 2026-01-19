import type { Renderer } from "./Renderer";


export function createCachedConfiguration(r: Renderer) {
    if (r.pipeline !== undefined) {
        return
    }

    r.pipeline = r.device!.createRenderPipeline({
        label: 'our hardcoded red triangle pipeline',
        layout: 'auto',
        vertex: {
            module: r.shader_module!,
        },
        fragment: {
            module: r.shader_module!,
            targets: [{ format: r.presentationFormat! }],
        },
    });

    r.bindGroup = r.device!.createBindGroup({
        label: 'triangle bind group',
        layout: r.pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: r.perspective_matrix_buff! }},
            { binding: 1, resource: { buffer: r.uniform_buff! }},
            { binding: 2, resource: { buffer: r.vertex_buff! }},
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
}