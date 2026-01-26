/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Common Data ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

// Uniform Data
struct SceneData {
    screen_size_free2: vec4f,

    camera_pos_free1: vec4f,
    camera_rot_quat: vec4f
}
@group(0) @binding(1) var<uniform> scene : SceneData;

/////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// Vertex Shader //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


// Vertex Data
struct Vertex {
    pos3_free1: vec4f
}

struct VertexBuff {
    vertices: array<Vertex>,
}

@group(0) @binding(2) var<storage, read> vb : VertexBuff;


// Vertex Shader Output
struct VSOutput {
    @location(0) debug_color: vec3f,

    @builtin(position) whatever : vec4f,
}

@vertex fn vs(
    @builtin(vertex_index) vs_index : u32
) -> VSOutput
{
    let screen_size = scene.screen_size_free2.xy;
    let camera_pos = scene.camera_pos_free1.xyz;
    let camera_rot: vec4f = scene.camera_rot_quat;

    var vertex: Vertex = vb.vertices[vs_index];
    var v_world_pos = vertex.pos3_free1.xyz;

    var v_camera_space = v_world_pos - camera_pos;
    v_camera_space = quatRotate(v_camera_space, camera_rot);

    var result = VSOutput();
    result.debug_color = v_camera_space;

    if (camera_pos.z == -999999) {
        result.debug_color.y = 1;
    }

    let webgpu_world_pos = roboticsToWebGPUSpace(v_camera_space);
    result.whatever = perspectiveTransform_FixedFunction(webgpu_world_pos);
    return result;
}

fn roboticsToWebGPUSpace(src_pos: vec3f) -> vec3f {
    var r = vec3f();

    // All at once
    r.z = src_pos.x;  // Forward
    r.x = src_pos.y;  // Right
    r.y = src_pos.z;  // Up

    r.z *= -1;  // Make -1 be forward
    r.x *= -1;  // Flip Horizontal Make Left be Right
    return r;
}


/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Perspective Transform Fixed Function /////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


@group(0) @binding(0) var<uniform> mvp_matrix : mat4x4<f32>;

fn perspectiveTransform_FixedFunction(webgpu_world_pos: vec3f) -> vec4f {
    // Transform from WebGPU World Space to Clip Space
    return mvp_matrix * vec4f(webgpu_world_pos, 1.0);
}


/////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// Fragment Shader ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


struct FSInput {
    @location(0) debug_color: vec3f,
}

@fragment fn fs(
    fs_input: FSInput
) -> @location(0) vec4f
{
    let color = fs_input.debug_color;
    return vec4f(color, 1.0);
}

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Library ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

fn quatRotate(v: vec3f, q: vec4f) -> vec3f
{
// Original Code From C++ glm (this is a form of optimized quat rotation)
//	vec < 3, T, Q > const QuatVector( q.x, q.y, q.z);
//	vec < 3, T, Q > const uv( glm::cross(QuatVector, v));
//	vec < 3, T, Q > const uuv( glm::cross(QuatVector, uv));

//	return v + ((uv * q.w) + uuv) * static_cast < T > (2);
	
	let quat_vector: vec3f = vec3f(q.x, q.y, q.z);
	let uv: vec3f = cross(quat_vector, v);
	let uuv: vec3f = cross(quat_vector, uv);
	
	return v + ((uv * q.w) + uuv) * 2;
}