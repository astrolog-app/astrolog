import type { AppApi } from "@/lib/api/types"
import type { AppState } from "@/types/app-state"
import type { EquipmentList } from "@/types/equipment"

// in-memory equipment used when running in the browser / v0 without a tauri backend
const equipment: EquipmentList = {
  telescopes: {
    "5812b156-91a9-461e-a02b-f981bb7029bf": {
      id: "5812b156-91a9-461e-a02b-f981bb7029bf",
      brand: "Sky-Watcher",
      name: "Esprit 100ED",
      focal_length: 550,
      aperture: 100,
    },
    "a5f49a13-f498-4aa9-ab4e-b54e5bad089e": {
      id: "a5f49a13-f498-4aa9-ab4e-b54e5bad089e",
      brand: "Celestron",
      name: "EdgeHD 8",
      focal_length: 2032,
      aperture: 203,
    },
  },
  cameras: {
    "8f2e7263-cd79-48b7-a812-f1d470cecd4b": {
      id: "8f2e7263-cd79-48b7-a812-f1d470cecd4b",
      brand: "ZWO",
      name: "ASI2600MM Pro",
      pixel_size: 3.76,
      pixel_x: 6248,
      pixel_y: 4176,
      is_monochrome: true,
      is_dslr: false,
    },
    "b1769beb-2f9c-4c4e-ae52-dd0cd36d6e30": {
      id: "b1769beb-2f9c-4c4e-ae52-dd0cd36d6e30",
      brand: "ZWO",
      name: "ASI533MC Pro",
      pixel_size: 3.76,
      pixel_x: 3008,
      pixel_y: 3008,
      is_monochrome: false,
      is_dslr: false,
    },
  },
  mounts: {
    "551a1881-bdbf-4166-926c-a4e3900b32f1": {
      id: "551a1881-bdbf-4166-926c-a4e3900b32f1",
      brand: "Sky-Watcher",
      name: "EQ6-R Pro",
    },
  },
  filters: {
    "bc57ba0a-1ef5-4cac-ba16-17372d3dd365": {
      id: "bc57ba0a-1ef5-4cac-ba16-17372d3dd365",
      brand: "Antlia",
      name: "Ha 3nm",
      filter_type: "Narrowband",
    },
    "e214a270-d266-442a-b9dc-ad56877accc7": {
      id: "e214a270-d266-442a-b9dc-ad56877accc7",
      brand: "Optolong",
      name: "L-Pro",
      filter_type: "Broadband",
    },
  },
  flatteners: {
    "2a9840e8-c705-4730-9c2c-4839f9ae5f93": {
      id: "2a9840e8-c705-4730-9c2c-4839f9ae5f93",
      brand: "Sky-Watcher",
      name: "Esprit Flattener",
      factor: 1.0,
    },
  },
}

const mockAppState: AppState = {
  local_config: { schema_version: 0, root_directory: "", source_directory: "", unit: "METRIC" },
  config: {
    schema_version: 0,
    folder_paths: { imaging_session_pattern: "", dark_frame_pattern: "", bias_frame_pattern: "" },
  },
  equipment,
}

// mirrors AppApi but serves static data, so the ui can run in the browser
export const mockApi: AppApi = {
  async getAppState(): Promise<AppState> {
    return mockAppState
  },
}
