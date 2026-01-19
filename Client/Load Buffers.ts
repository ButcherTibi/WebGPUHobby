import { Renderer } from "./Renderer";
import { Scene, Vertex } from "./Start"


export function loadBuffers(r: Renderer, scene: Scene) {
    r.device!.queue.writeBuffer(
        r.uniform_buff!,
        0,
        Float32Array.from([
            scene.camera.screen_width,
            scene.camera.screen_height,
            0,
            0
        ])
    );

    // Storage Data
    r.vertex_count = scene.mesh.vertices.length
    Vertex.writeVerticesToStorageBuffer(scene.mesh.vertices, r);
}