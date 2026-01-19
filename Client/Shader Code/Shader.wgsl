// Uniform Data
struct SceneData {
    screen_size: vec4f
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

// Vertex Shader Properties


// Vertex Shader Output
struct VSOutput {
    @location(0) debug_color: vec3f,

    @builtin(position) whatever : vec4f,
}

@vertex fn vs(
    @builtin(vertex_index) vs_index : u32
) -> VSOutput
{
    let screen_size = scene.screen_size.xy;

    var vertex: Vertex = vb.vertices[vs_index];
    var pos = vertex.pos3_free1.xyz;

    var result = VSOutput();    
    result.debug_color = pos;

    return perspectiveTransform_FixedFunction(pos, result);
}


/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Perspective Transform Fixed Function /////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


@group(0) @binding(0) var<uniform> mvp_matrix : mat4x4<f32>;

fn perspectiveTransform_FixedFunction(world_pos: vec3f, vs_out: VSOutput) -> VSOutput {
    var result = vs_out;
    // Transform from World Space to Clip Space
    result.whatever = mvp_matrix * vec4f(world_pos, 1.0);
    return result;
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
    return vec4f(1, 0, 0, 1.0);
}