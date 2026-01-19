import { JSONC } from "bun";
import { watch, type FSWatcher, readdirSync, readFileSync } from "fs";
import path from "path";


let shader_code_watcher: FSWatcher

class ShaderFileInfo {
    file_path: string = ""
    changed: boolean = false
}

let shader_files = new Map<string, ShaderFileInfo>()

export function startWatchingTheShaderCode() {
    const shader_code_dir = path.join(import.meta.dir, "Shader Code")

    console.log(`Finding shader files in folder ${shader_code_dir}:`)
    readdirSync(shader_code_dir).forEach((shader_name) => {
        const file_path = path.join(shader_code_dir, shader_name)
        shader_files.set(shader_name, {
            file_path: file_path,
            changed: true
        })

        console.log(`  ${shader_name}`)
    })

    shader_code_watcher = watch(shader_code_dir, { recursive: true }, (event, shader_filename) => {
        if (shader_filename == null) {
            return
        }

        console.log(`Detected ${event} in ${shader_filename}`);

        shader_files.set(shader_filename, {
            file_path: shader_filename,
            changed: true 
        })
    })
}

const ShaderCodeRequestType = {
    request_any: 0,
    request_only_latest: 1,
}

interface ShaderCodeRequest {
    name: string
    type: number
}

const Status = {
    ok: 0,
    no_change: 1,  // shader file did not change
    not_found: 2,  // shader file not found
    failed_to_read: 3,
}

interface ShaderCodeResponse {
    status: number
    code: string
}

export async function handleShaderCodeRequest(req: Bun.BunRequest<"/shader_code">, server: Bun.Server<undefined>) {
    let shader_code_req: ShaderCodeRequest = await req.json()
    
    const file_info = shader_files.get(shader_code_req.name)

    let res_body: ShaderCodeResponse = {
        status: Status.ok,
        code: ""
    }
    if (file_info === undefined) {
        res_body.status = Status.not_found
        return new Response(JSON.stringify(res_body))
    }

    const shaderCodeToResponse = async () => {
        res_body.status = Status.ok
            
        try {
            res_body.code = await readFileSync(file_info.file_path, "utf-8")
        } catch (e: any) {
            res_body.status = Status.failed_to_read
        }

        if (res_body.status == Status.ok) {
            // Acknowledge
            file_info.changed = false
        }
    }

    if (shader_code_req.type == ShaderCodeRequestType.request_any) {
        await shaderCodeToResponse()
    }
    else if (shader_code_req.type == ShaderCodeRequestType.request_only_latest) {

        if (file_info.changed) {
            await shaderCodeToResponse()
        }
        else {
            res_body.status = Status.no_change
            // do not send code back
        }
    }

    return new Response(JSON.stringify(res_body))
}