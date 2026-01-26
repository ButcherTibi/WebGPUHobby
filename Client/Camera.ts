import { quat, vec3, vec4 } from "wgpu-matrix";

import { Renderer, render } from "./Renderer";
import { fail } from "./Logging.ts"
import { requestShaderCode_Any, requestShaderCode_OnlyLatest } from "./ShaderLiveReloading.ts";
import { renderer } from "./Globals.ts";
import { rotatePointByQuat, toRad } from "./Math/Math.ts";


export class Camera {
    screen_width: number
    screen_height: number

    pos = vec3.zero()
    
    // Rotation
    _forward_vec = vec3.create(1, 0, 0)
    _left_vec = vec3.create(0, 1, 0)
    _up_vec = vec3.create(0, 0, 1)
    _rot_quat = quat.identity()

    forward(distance: number) {
        this.pos = vec3.addScaled(this.pos, this._forward_vec, distance)
    }

    left(distance: number) {
        this.pos = vec3.addScaled(this.pos, this._left_vec, distance)
    }

    up(distance: number) {
        this.pos = vec3.addScaled(this.pos, this._up_vec, distance)
    }

    // Pitch +Forward -Backward
    pitch(degres: number) {
        //this._rot_quat = quat.rotationTo(this._rot_quat, toRad(-degres))
        this._rot_quat = quat.normalize(this._rot_quat)

        this._calcDirections()
    }

    yaw(degres: number) {
        this._rot_quat = quat.rotateZ(this._rot_quat, toRad(degres))
        this._rot_quat = quat.normalize(this._rot_quat)

        this._calcDirections()
    }

    roll(degres: number) {
        this._rot_quat = quat.rotateX(this._rot_quat, toRad(degres))
        this._rot_quat = quat.normalize(this._rot_quat)

        this._calcDirections()
    }

    _calcDirections() {
        this._forward_vec = vec3.create(1, 0, 0)
        this._forward_vec = rotatePointByQuat(this._forward_vec, this._rot_quat)
        
        this._left_vec = vec3.create(0, 1, 0)
        this._left_vec = rotatePointByQuat(this._left_vec, this._rot_quat)
        
        this._up_vec = vec3.create(0, 0, 1)
        this._up_vec = rotatePointByQuat(this._up_vec, this._rot_quat)

        this._forward_vec = vec3.normalize(this._forward_vec)
        this._left_vec = vec3.normalize(this._left_vec)
        this._up_vec = vec3.normalize(this._up_vec)
    }
}