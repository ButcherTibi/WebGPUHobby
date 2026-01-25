import { flt_undef } from "../Constants" 
import type { Vec2, Vec3, Vec4 } from "wgpu-matrix";
import { fail } from "../Logging";
import type { Renderer } from "../Renderer";


export class CPU_UniformBuffer {
    mem: Float32Array | undefined

    setFieldCount(count: number) {
        let new_size = count * 4

        if (this.mem === undefined || this.mem.length < new_size) {
            this.mem = new Float32Array(new_size)
        }
    }

    setField(field_index: number, x: number, y: number = flt_undef, z: number = flt_undef, w: number = flt_undef) {
        if (this.mem === undefined) {
            fail("Failed to init uniform buffer cpu memory")
            return
        }
        
        let row_index = field_index * 4
        if (row_index + 3 >= this.mem.length) {
            fail(`CPU side uniform buffer is too small, got ${this.mem.length} required ${row_index + 3 } `)
            return
        }

        this.mem.set([x, y, z, w], row_index)
    }

    setFieldVec3(field_index: number, data: Vec3) {
        this.setField(field_index, data[0]!, data[1]!, data[2]!)
    }

    setFieldVec4(field_index: number, data: Vec4) {
        this.setField(field_index, data[0]!, data[1]!, data[2]!, data[3]!)
    }
}

export class UploadBuffer {
    mem: Float32Array | undefined
    item_count = 0
    field_count = 0
    stride = 0
    is_array = false

    static field_size = 4

    configureForStruct(field_count: number) {
        this._configureSizes(1, field_count)
        this.is_array = false
    }

    configureForArray(item_count: number, field_count: number) {
        this._configureSizes(1, field_count)
        this.is_array = true
    }

    _configureSizes(item_count: number, field_count: number) {
        let new_size = item_count * field_count * UploadBuffer.field_size

        if (this.mem === undefined || this.mem.length < new_size) {
            this.mem = new Float32Array(new_size)
        }

        this.item_count = item_count
        this.field_count = field_count
        this.stride = field_count * UploadBuffer.field_size
    }

    _setField(item_index: number,  field_index: number,
        x: number, y: number = flt_undef, z: number = flt_undef, w: number = flt_undef)
    {
        if (this.mem === undefined) {
            fail("UploadBuffer: Cannot set field, no memory allocated")
            return
        }
        
        let index = item_index * this.stride + field_index * UploadBuffer.field_size
        if (index + 3 >= this.mem.length) {
            fail(`CPU side uniform buffer is too small, got ${this.mem.length} required ${index + 3 } `)
            return
        }

        this.mem.set([x, y, z, w], index)
    }

    setFieldInStruct(field_index: number,
        x: number, y: number = flt_undef, z: number = flt_undef, w: number = flt_undef)
    {
        if (this.is_array == true) {
            fail("UploadBuffer: wrong function call, this is a array not an struct")
            return
        }
        this._setField(0, field_index, x, y, z, w)
    }

    setVec3FieldInStruct(field_index: number, data: Vec3) {
        this.setFieldInStruct(field_index,
            data[0]!, data[1]!, data[2]!)
    }

    setVec4FieldInStruct(field_index: number, data: Vec4) {
        this.setFieldInStruct(field_index, 
            data[0]!, data[1]!, data[2]!, data[3]!)
    }

    setFieldInArray(item_index: number,  field_index: number,
        x: number, y: number = flt_undef, z: number = flt_undef, w: number = flt_undef)
    {
        if (this.is_array == false) {
            fail("UploadBuffer: wrong function call, this is a struct not an array")
            return
        }
        this._setField(item_index, field_index, x, y, z, w)
    }

    setVec3FieldInArray(item_index: number, field_index: number, data: Vec3) {
        this.setFieldInArray(item_index, field_index,
            data[0]!, data[1]!, data[2]!)
    }

    setVec4FieldInArray(item_index: number, field_index: number, data: Vec4) {
        this.setFieldInArray(item_index, field_index, 
            data[0]!, data[1]!, data[2]!, data[3]!)
    }
}


export function loadUploadBufferTo(r: Renderer, dest: GPUBuffer)
{
    if (r.upload_buff.mem == undefined) {
        fail("UploadBuffer: Cannot load data, memory not allocated")
        return
    }

    r.device!.queue.writeBuffer(
        dest,
        0,
        r.upload_buff.mem!.buffer,
    );
}


// export class NiceBuffer {
//     _gpu_buff: GPUBuffer | undefined
//     _usage: number = 0

//     create(usage: number) {
//         this._usage = usage
//     }

//     _create(r: Renderer, new_size_bytes: number) {
//         this._gpu_buff = r.device?.createBuffer({
//             size: new_size_bytes,
//             usage: this._usage,
//         })
//     }

//     resize(r: Renderer, new_size_bytes: number) {
//         if (this._gpu_buff == undefined || new_size_bytes > this._gpu_buff.size) {
//             this._create(r, new_size_bytes)
//         }
//     }

//     write(r: Renderer, buff: Float32Array) {
//         this.resize(r, buff.byteLength)

//         r.device!.queue.writeBuffer(
//             this._gpu_buff!,
//             0,
//             buff.buffer,
//         );
//     }
// }