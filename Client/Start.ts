import { vec3, vec4 } from "wgpu-matrix";

import { Renderer, render } from "./Renderer";
import { fail } from "./Logging.ts"
import { requestShaderCode_Any, requestShaderCode_OnlyLatest } from "./ShaderLiveReloading.ts";
import { renderer } from "./Globals.ts";


export class Mesh {
	label = ""
	vertices: Vertex[] = []

	// Instance data
	pos = vec3.zero()
}

export class Vertex {
	pos3_free1 = vec4.zero()
}

export class Camera {
	screen_width = 0
	screen_height = 0
	pos = vec3.zero()
	rot_quat = vec4.zero()

	pitch() {

	}

	yaw() {

	}

	roll() {

	}
}

export class Scene {
	camera = new Camera()
	mesh = new Mesh()
}

function CPU_updateScene(): Scene {
	let scene = new Scene();
	scene.camera.pos = vec3.create(0, 0, 0);
	scene.camera.rot_quat = vec4.create(0, 0, 0, 1);

	scene.camera.screen_width = 1000;
	scene.camera.screen_height = 1000;

	scene.mesh.pos = vec3.zero();
	scene.mesh.label = "Triangle Mesh";
	scene.mesh.vertices.push(new Vertex());
	scene.mesh.vertices.push(new Vertex());
	scene.mesh.vertices.push(new Vertex());

	// scene.mesh.vertices.at(0)!.pos3_free1 = vec4.create( 0.0, 1.0, -1.5);
	// scene.mesh.vertices.at(1)!.pos3_free1 = vec4.create(-1.0, 0.0, -1.5);
	// scene.mesh.vertices.at(2)!.pos3_free1 = vec4.create( 1.0, 0.0, -1.5);

	// scene.mesh.vertices.at(0)!.pos3_free1 = vec4.create( 1.5, 1.0, 0.0);
	// scene.mesh.vertices.at(1)!.pos3_free1 = vec4.create( 1.5, 0.0, 1.0);
	// scene.mesh.vertices.at(2)!.pos3_free1 = vec4.create( 1.5, 0.0, -1.0);

	scene.mesh.vertices.at(0)!.pos3_free1 = vec4.create( 1.5, 0.0, 1);
	scene.mesh.vertices.at(1)!.pos3_free1 = vec4.create( 1.5, 1.0, 0);
	scene.mesh.vertices.at(2)!.pos3_free1 = vec4.create( 1.5, -1.0, 0);
	return scene;
}

async function step(timestamp_ms: DOMHighResTimeStamp)
{
	// Input Handling

	// Update CPU data
	const scene = CPU_updateScene();

	// Render
	await render(renderer, scene)

	requestAnimationFrame(step)
}

async function init() {
	await requestShaderCode_Any()

	setInterval(requestShaderCode_OnlyLatest, 1000)

	requestAnimationFrame(step)
}

init();