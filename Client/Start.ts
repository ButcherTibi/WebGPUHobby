import { vec3, vec4 } from "wgpu-matrix";

import { glb, scene } from "./Globals.ts";
import { render } from "./Renderer";
import { fail } from "./Logging.ts"
import { requestShaderCode_Any, requestShaderCode_OnlyLatest } from "./ShaderLiveReloading.ts";
import { Camera } from "./Camera.ts"
import { Settings } from "./Settings.ts";


export class Scene {
	frame_rate = 144
	last_timestamp: DOMHighResTimeStamp = 0
	delta = 1

	settings = new Settings
	input_state = new InputState()
	camera = new Camera()
	mesh = new Mesh()
}

export class InputState {
	mouse_delta_x = 0
	mouse_delta_y = 0
	keys = new Map<string, KeyState>

	setKey(key: string, state: boolean) {
		let key_state = this.keys.get(key)
		if (key_state == undefined) {
			this.keys.set(key, { state: state, is_transition: true })
		}
		else {
			key_state.is_transition = key_state.state != state
			key_state.state = state
		}
	}

	isKeyDown(key: string) {
		const key_state = this.keys.get(key)
		if (key_state == undefined) {
			this.setKey(key, false)
			return false
		}
		return key_state.state
	}

	isKeyUp(key: string) {
		return !this.isKeyDown(key)
	}
}

class KeyState {
	state = false
	is_transition = false
}

export class Mesh {
	label = ""
	vertices: Vertex[] = []

	// Instance data
	pos = vec3.zero()
}

export class Vertex {
	pos3_free1 = vec4.zero()
}

function CPU_updateScene() {
	const scene = glb.scene
	const input_state = scene.input_state
	const camera = scene.camera

	if (input_state.isKeyDown("lmb")) {
		console.log(input_state.mouse_delta_y)
		camera.pitch(input_state.mouse_delta_y * 0.1 * scene.delta)
		camera.yaw(input_state.mouse_delta_x * 0.1 * scene.delta)
	}

	if (input_state.isKeyDown("w")) {
		camera.forward(scene.settings.camera_wasd_sensitivity * scene.delta)
	}
	if (input_state.isKeyDown("s")) {
		camera.forward(-scene.settings.camera_wasd_sensitivity * scene.delta)
	}

	if (input_state.isKeyDown("a")) {
		camera.left(scene.settings.camera_wasd_sensitivity * scene.delta)
	}
	if (input_state.isKeyDown("d")) {
		camera.left(-scene.settings.camera_wasd_sensitivity * scene.delta)
	}

	if (input_state.isKeyDown("q")) {
		camera.up(scene.settings.camera_wasd_sensitivity * scene.delta)
	}
	if (input_state.isKeyDown("e")) {
		camera.up(-scene.settings.camera_wasd_sensitivity * scene.delta)
	}
}

async function step(timestamp_ms: DOMHighResTimeStamp)
{
	const scene = glb.scene
	scene.delta = (timestamp_ms - scene.last_timestamp) / (1000 / glb.scene.frame_rate)

	// Update CPU data
	CPU_updateScene();

	// Render
	await render(glb.renderer, scene!)

	// Input Reset
	scene.input_state.mouse_delta_x = 0
	scene.input_state.mouse_delta_y = 0

	// Time
	scene.last_timestamp = timestamp_ms;

	requestAnimationFrame(step)
}

function initScene() {
	glb.scene = new Scene
	const scene = glb.scene

	scene.camera.screen_width = 2000;
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
}

async function init() {
	await requestShaderCode_Any()

	initScene()

	// glb.scene.camera.pitch(30)

	// Input Binding
	const canvas = document.querySelector("canvas")!
	window.addEventListener("mousedown", (ev) => {
		glb.scene.input_state.setKey("lmb", true)
	})
	window.addEventListener("mouseup", (ev) => {
		glb.scene.input_state.setKey("lmb", false)
	})
	window.addEventListener("mousemove", (ev) => {
		glb.scene.input_state.mouse_delta_x = ev.movementX
		glb.scene.input_state.mouse_delta_y = ev.movementY
	})
	window.addEventListener("keydown", (ev: KeyboardEvent) => {
		glb.scene.input_state.setKey(ev.key.toLowerCase(), true)
	})
	window.addEventListener("keyup", (ev: KeyboardEvent) => {
		glb.scene.input_state.setKey(ev.key.toLowerCase(), false)
	})

	setInterval(requestShaderCode_OnlyLatest, 1000)

	requestAnimationFrame(step)
}

await init();