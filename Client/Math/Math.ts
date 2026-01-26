import { quat, vec3, vec4, type Vec4, type Vec3,  } from "wgpu-matrix"


export function toRad(degs: number): number {
    //return degs * (Math.PI / 180)

    return (degs / 180) * Math.PI
}


export function rotateQuatByAxis(q: Vec4, axis: Vec3, degrees: number): Vec4 {
    const rads = toRad(degrees)
    const half_angle = rads / 2

    // Create rotation quaternion
    const rot_quat_xyz = vec3.mulScalar(axis, Math.sin(half_angle))
    const rot_quat = vec4.create(rot_quat_xyz[0], rot_quat_xyz[1], rot_quat_xyz[2], Math.cos(half_angle))
    
    var result = vec4.mul(q, rot_quat)
    result = quat.normalize(result)
    return result
}

export function rotatePointByQuat(p: Vec3, q: Vec4): Vec3 {
    return rotatePointByQuat_StraightMath(p, q)
}

function rotatePointByQuat_StraightMath(p: Vec3, q: Vec4): Vec3 {
    const quat_point = vec4.create(p[0], p[1], p[2], 0)
    const inv_quat = quat.inverse(q)

    const r = quat.mul(quat.mul(q, quat_point), inv_quat)
    return new Float32Array([r[0]!, r[1]!, r[2]!])
}

