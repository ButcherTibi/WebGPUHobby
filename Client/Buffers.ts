import type { Renderer } from "./Renderer";


export function createBuffers(r: Renderer) {
    if (r.perspective_matrix_buff !== undefined) {
        return
    }

    // Fixed Size
    r.perspective_matrix_buff = r.device!.createBuffer({
        size: 16 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Dynamic Size
    r.uniform_buff = r.device!.createBuffer({
        size: 1024 * 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    r.vertex_buff = r.device!.createBuffer({
        size: 1024 * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
}