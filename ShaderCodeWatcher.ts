import { JSONC } from "bun";
import { watch, type FSWatcher, readdirSync, readFileSync } from "fs";
import path from "path";


let shader_code_watcher: FSWatcher

class ShaderFileInfo {
    file_path: string = ""
    changed: boolean = false
}

var shader_file_infos = new Map<string, ShaderFileInfo>()


export function startWatchingTheShaderCode() {
    const shader_code_dir = path.join(import.meta.dir, "Shader Code")

    console.log(`Finding shader files in folder ${shader_code_dir}:`)
    readdirSync(shader_code_dir).forEach((shader_name) => {
        const file_path = path.join(shader_code_dir, shader_name)

        shader_file_infos.set(shader_name, {
            file_path: file_path,
            changed: true
        })

        console.log(`  ${shader_name}`)
    })

    shader_code_watcher = watch(shader_code_dir, { recursive: true }, (event, shader_name) => {
        if (shader_name == null) {
            return
        }

        console.log(`Detected ${event} in ${shader_name}`);
        const file_path = path.join(shader_code_dir, shader_name)

        shader_file_infos.set(shader_name, {
            file_path: file_path,
            changed: true
        })
    })
}

const ShaderCodeRequestType = {
    request_any: 0,
    request_only_latest: 1,
}

interface ShadersCodeRequest {
    type: number
}

interface ShadersCodeResponse {
	status: number
	shaders: ShaderCode[]
}

const Status = {
    ok: 0,
    no_change: 1,  // shader file did not change
    failed_to_read: 2,
}

interface ShaderCode {
	name: string
	code: string
}

export async function handleShaderCodeRequest(req: Bun.BunRequest<"/shader_code">, server: Bun.Server<undefined>) {
    let shaders_req: ShadersCodeRequest = await req.json()
    let res_body: ShadersCodeResponse = {
        status: Status.ok,
        shaders: []
    }

    const readShaderCode = (file_info: ShaderFileInfo, name: string) => {
        let code = ""
        try {
            code = readFileSync(file_info.file_path, "utf-8")
        } catch (e: any) {
            console.log(`Failed to read shader: ${name} at path ${file_info.file_path}`)
            res_body.status = Status.failed_to_read
            return new Response(JSON.stringify(res_body))
        }

        res_body.shaders.push({ name, code })

        // Acknowledge
        file_info.changed = false
    }

    shader_file_infos.forEach((file_info, name) => {
        if (shaders_req.type == ShaderCodeRequestType.request_only_latest) {
            if (file_info.changed) {
                // console.log('new shader read')
                readShaderCode(file_info, name)
            }
        }
        else if (shaders_req.type == ShaderCodeRequestType.request_any) {
            readShaderCode(file_info, name)
        }
    })

    if (res_body.shaders.length == 0) {
        res_body.status = Status.no_change
    }

    return new Response(JSON.stringify(res_body))
}