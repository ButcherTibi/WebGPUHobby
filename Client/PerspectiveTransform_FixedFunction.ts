import { mat4 } from "wgpu-matrix";
import type { Renderer } from "./Renderer";


export function configurePerspectiveTransform_FixedFunction(fov_deg: number, aspect: number, near: number, far: number,
    r: Renderer) 
{
    if (r.perspective_matrix_buff == undefined) {
        r.perspective_matrix_buff = r.device!.createBuffer({
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    // 1. Setup Camera Parameters
    const fov = (fov_deg * Math.PI) / 180; // 60 degrees in radians
    // const aspect = scene.camera.screen_width / scene.camera.screen_height;
    // const near = 0.1;
    // const far = 100.0;

    // 2. Generate Projection Matrix (Result is Float32Array in Column-Major)
    const projectionMatrix = mat4.perspective(fov, aspect, near, far);

    // 3. Generate View Matrix (Camera at 0,0,5 looking at 0,0,0)
    const viewMatrix = mat4.lookAt(
        [0, 0, 0],  // Eye position
        [0, 0, -1],  // Target point
        [0, 1, 0]   // Up vector
    );

    // 4. Combine into MVP Matrix (Order: Projection * View)
    const mvpMatrix = mat4.multiply(projectionMatrix, viewMatrix);

    r.device!.queue.writeBuffer(
        r.perspective_matrix_buff!,
        0,
        new Float32Array(mvpMatrix)
    );
}