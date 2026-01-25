import { Renderer } from "./Renderer"; 
import { fail } from "./Logging";


export async function findDevice(r: Renderer): Promise<void> {
    // It makes not sense for those API functions to be async
    if (r.device_found === true) {
        return
    }

    const msg = 'need a browser that supports WebGPU';
    
    r.adapter = await navigator.gpu?.requestAdapter();
    if (r.adapter === null) {
        fail("Failed to request adapater");
    }

    r.device = await r.adapter?.requestDevice();
    if (!r.device) {
        fail("Failed to request device");
    }

    r.gpu_name = `Device: ${r.adapter!.info.device} Vendor: ${r.adapter!.info.vendor} Description: ${r.adapter!.info.description}`;
    console.log(`GPU Found: ${r.gpu_name}`);

    r.device_found = true
}