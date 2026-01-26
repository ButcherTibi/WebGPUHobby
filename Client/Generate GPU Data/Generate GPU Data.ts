import { loadUploadBufferTo } from "../GPU Aligned Types/GPU Aligned Types";
import { Renderer, GPU_Scene, GPU_Mesh, GPU_Instance } from "../Renderer";
import type { Scene } from "../Start";

import { vec2, vec3, vec4 } from "wgpu-matrix";


export function generateGPUdata(r: Renderer, cpu_scene: Scene) {
    // Camera
    r.upload_buff.configureForStruct(3)
    r.upload_buff.setFieldInStruct(0, cpu_scene.camera.screen_width, cpu_scene.camera.screen_height)
    r.upload_buff.setVec3FieldInStruct(1, cpu_scene.camera.pos)
    r.upload_buff.setVec4FieldInStruct(2, cpu_scene.camera._rot_quat)

    if (r.scene.uniform_buff == undefined) {
        r.scene.uniform_buff = r.device!.createBuffer({
            label: "Scene",
            size: 1024 * 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }
    loadUploadBufferTo(r, r.scene.uniform_buff)

    // Mesh
    r.upload_buff.configureForArray(cpu_scene.mesh.vertices.length, 1)
    const vertices = cpu_scene.mesh.vertices

    for (let idx = 0; idx < vertices.length; idx++) {
        const vertex = vertices.at(idx)!;
        r.upload_buff.setVec3FieldInArray(idx, 0, vertex.pos3_free1)
    }
    r.scene.mesh.vertex_count = vertices.length

    if (r.scene.mesh.vertex_buff == undefined) {
        r.scene.mesh.vertex_buff = r.device!.createBuffer({
            label: "Vertex",
            size: 1024 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
    }
    loadUploadBufferTo(r, r.scene.mesh.vertex_buff)
}