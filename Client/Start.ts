import { Renderer, render, updateShader } from "./Renderer";
import { vec3, vec4 } from "wgpu-matrix";
import { fail } from "./Logging.ts"


export class Mesh {
	label = ""
	vertices: Vertex[] = []

	// Instance data
	pos = vec3.zero()
}

export class Vertex {
	pos3_free1 = vec4.zero()


	static field_count = 1

	static stride(): number  {
		return Vertex.field_count * 4
	}

	// keep close to the GPU structure
	static writeVerticesToStorageBuffer(vertices: Vertex[], r: Renderer) {
		let gpu_data = new Float32Array(vertices.length * Vertex.stride());
		
		const vertex_stride = this.stride();

		for (let vertex_idx = 0; vertex_idx < vertices.length; vertex_idx++) {
			const vertex = vertices.at(vertex_idx)!;

			const vertex_offset = vertex_idx * vertex_stride
			let field_idx = 0
			gpu_data.set(vertex.pos3_free1,  vertex_offset + field_idx * 4);
			field_idx += 1

			if (field_idx != Vertex.field_count) {
				fail(`Forgot to some fields in the load vertices into storage buffer`)
			}
		}

		r.device!.queue.writeBuffer(
			r.vertex_buff!,
			0,
			gpu_data,
		);
	}
}

export class Camera {
	screen_width = 0
	screen_height = 0
	pos = vec3.zero()
}

export class Scene {
	camera = new Camera()
	mesh = new Mesh()
}

function CPU_updateScene(): Scene {
	let scene = new Scene();
	scene.camera.pos = vec3.create(0, 0, -5);
	scene.camera.screen_width = 1000;
	scene.camera.screen_height = 1000;

	scene.mesh.pos = vec3.zero();
	scene.mesh.label = "Triangle Mesh";
	scene.mesh.vertices.push(new Vertex());
	scene.mesh.vertices.push(new Vertex());
	scene.mesh.vertices.push(new Vertex());

	scene.mesh.vertices.at(0)!.pos3_free1 = vec4.create(0.0, 1.0, -1.5, 1.0);
	scene.mesh.vertices.at(1)!.pos3_free1 = vec4.create(-1.0, -1.0, -1.5, 1.0);
	scene.mesh.vertices.at(2)!.pos3_free1 = vec4.create(1.0, -1.0, -1.5, 1.0);
	return scene;
}


var renderer: Renderer


async function step(timestamp_ms: DOMHighResTimeStamp)
{
	// Input Handling
	//
	console.log(timestamp_ms)

	// Update CPU data
	const scene = CPU_updateScene();

	// Render
	await render(renderer, scene)

	requestAnimationFrame(step)
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

async function requestShaderCode_Any() {
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

async function requestShaderCode_OnlyLatest() {
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

async function main() {
	renderer = new Renderer()

	await requestShaderCode_Any()

	setInterval(requestShaderCode_OnlyLatest, 2000)

	requestAnimationFrame(step)
}

main();