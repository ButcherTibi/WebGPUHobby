import { Renderer } from "./Renderer";

export function command(r: Renderer) {
    // Not Sure 
    r.descriptor.colorAttachments[0].view =
        r.context!.getCurrentTexture().createView();

    // make a command encoder to start encoding commands
    const encoder = r.device!.createCommandEncoder({ label: 'My Command Encoder' });
    
    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(r.descriptor);
    pass.setPipeline(r.pipeline!);
    pass.setBindGroup(0, r.bindGroup!);
    pass.draw(r.vertex_count);
    pass.end();

    const commandBuffer = encoder.finish();
    r.device!.queue.submit([commandBuffer]);
}