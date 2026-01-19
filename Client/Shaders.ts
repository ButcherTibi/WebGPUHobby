import { Renderer } from "./Renderer"

// Shader Code
import shader_code from "./Shader Code/Shader.wgsl" with { type: "text" };


export function createShaderModules(r: Renderer) {
    if (r.shader_module !== undefined) {
        return
    }

    r.shader_module = r.device!.createShaderModule({
		label: 'Main Shader',
		code: shader_code
	});
}