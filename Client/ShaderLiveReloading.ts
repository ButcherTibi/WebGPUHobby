import { updateShader } from "./Renderer"
import { renderer } from "./Globals"


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

// const Status = {
//     ok: 0,
//     no_change: 1,  // shader file did not change
//     failed_to_read: 2,
// }

interface ShaderCode {
    name: string
    code: string
}

/**
 * Request shaders from server regardless if they were already sent.
 * Used when client restarted when server is still alive.
 */
export async function requestShaderCode_Any() {
	let req_body: ShadersCodeRequest = {
		type: ShaderCodeRequestType.request_any
	}

	let req: RequestInit = {
		method: "POST",
		mode: "same-origin",
		body: JSON.stringify(req_body)
	}

	const response: Response = await fetch("/shader_code", req)
	const res: ShadersCodeResponse = await response.json()

	res.shaders.forEach((shader) => {
		updateShader(shader.name, shader.code, renderer)
	})
}

/**
 * Request from server only shader that were not already sent.
 */
export async function requestShaderCode_OnlyLatest() {
		let req_body: ShadersCodeRequest = {
		type: ShaderCodeRequestType.request_only_latest
	}

	let req: RequestInit = {
		method: "POST",
		mode: "same-origin",
		body: JSON.stringify(req_body)
	}

	const response: Response = await fetch("/shader_code", req)
	const res: ShadersCodeResponse = await response.json()

	res.shaders.forEach((shader) => {
		updateShader(shader.name, shader.code, renderer)
	})
}