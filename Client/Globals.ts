import { Renderer } from "./Renderer"
import { Scene } from "./Start"


export var renderer = new Renderer
export var scene: Scene

export class Globals {
    renderer = new Renderer
    scene: Scene
}
export const glb = new Globals