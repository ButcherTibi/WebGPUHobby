import { Renderer, Shader } from "./Renderer"

// Shader Code
//import shader_code from "./Shader Code/Shader.wgsl" with { type: "text" };


export function requestShaderUpdate(name: string, code: string, r: Renderer) {
    let shader: Shader = {
        update: true,
        code: code,
        module: undefined
    }
    r.shader_modules.set(name, shader)
}

export function createShaderModules(r: Renderer) {
    r.shader_modules.forEach((shader, name) => {
        if (shader.update) {
            console.log(`Shader ${name} was reloaded`)
            shader.module = r.device!.createShaderModule({
                label: name,
                code: shader.code
            });

            shader.update = false

            // Signal pipeline to recreate
            r.update_pipeline = true
        }
    })
}