import type { AppApi } from "@/lib/api/types"
import type { AppState } from "@/types/app-state"
import type { Camera, EquipmentList, Filter, Flattener, Mount, Telescope } from "@/types/equipment"
import type {
  BiasFramePage,
  BiasFrameQuery,
  BiasFrameRow,
  DarkFlatFramePage,
  DarkFlatFrameQuery,
  DarkFlatFrameRow,
  DarkFramePage,
  DarkFrameQuery,
  DarkFrameRow,
  FlatFramePage,
  FlatFrameQuery,
  FlatFrameRow,
  LightFramePage,
  LightFrameQuery,
  LightFrameRow,
} from "@/types/imaging-frames"
import { UUID } from "crypto"

// equipment ids reused across the mock frame rows so names resolve
const CAM_2600 = "8f2e7263-cd79-48b7-a812-f1d470cecd4b" as UUID
const CAM_533 = "b1769beb-2f9c-4c4e-ae52-dd0cd36d6e30" as UUID
const SCOPE_ESPRIT = "5812b156-91a9-461e-a02b-f981bb7029bf" as UUID
const FILTER_HA = "bc57ba0a-1ef5-4cac-ba16-17372d3dd365" as UUID
const FILTER_LPRO = "e214a270-d266-442a-b9dc-ad56877accc7" as UUID

// in-memory equipment used when running in the browser / v0 without a tauri backend
const equipment: EquipmentList = {
  telescopes: {
    "5812b156-91a9-461e-a02b-f981bb7029bf": {
      id: "5812b156-91a9-461e-a02b-f981bb7029bf",
      brand: "Sky-Watcher",
      name: "Esprit 100ED",
      telescope_type: "Refractor",
      focal_length: 550,
      aperture: 100,
    },
    "a5f49a13-f498-4aa9-ab4e-b54e5bad089e": {
      id: "a5f49a13-f498-4aa9-ab4e-b54e5bad089e",
      brand: "Celestron",
      name: "EdgeHD 8",
      telescope_type: "SCT",
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
      sensor_type: "Mono",
    },
    "b1769beb-2f9c-4c4e-ae52-dd0cd36d6e30": {
      id: "b1769beb-2f9c-4c4e-ae52-dd0cd36d6e30",
      brand: "ZWO",
      name: "ASI533MC Pro",
      pixel_size: 3.76,
      pixel_x: 3008,
      pixel_y: 3008,
      sensor_type: "OSC",
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
      size: "36mm",
    },
    "e214a270-d266-442a-b9dc-ad56877accc7": {
      id: "e214a270-d266-442a-b9dc-ad56877accc7",
      brand: "Optolong",
      name: "L-Pro",
      filter_type: "Broadband",
      size: "2\"",
    },
  },
  flatteners: {
    "2a9840e8-c705-4730-9c2c-4839f9ae5f93": {
      id: "2a9840e8-c705-4730-9c2c-4839f9ae5f93",
      brand: "Sky-Watcher",
      name: "Esprit Flattener",
      flattener_type: "Flattener",
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

// a couple of grouped bias rows so the calibration table renders in v0
// (references the mock camera ids above so the names resolve)
const mockBiasRows: BiasFrameRow[] = [
  {
    camera_id: "8f2e7263-cd79-48b7-a812-f1d470cecd4b" as UUID,
    gain: 100,
    binning: 1,
    offset: 50,
    night: "2026-06-07",
    total_frames: 5,
    first_captured: "2026-06-07T21:01:00Z",
    last_captured: "2026-06-07T21:05:00Z",
  },
  {
    camera_id: "b1769beb-2f9c-4c4e-ae52-dd0cd36d6e30" as UUID,
    gain: 100,
    binning: 1,
    offset: 70,
    night: "2026-05-30",
    total_frames: 6,
    first_captured: "2026-05-30T22:01:00Z",
    last_captured: "2026-05-30T22:06:00Z",
  },
]

// grouped rows for the remaining frame types, mirroring the seeded backend data
const mockDarkRows: DarkFrameRow[] = [
  {
    camera_id: CAM_2600,
    gain: 100,
    binning: 1,
    offset: 50,
    exposure_ms: 300000,
    sensor_temp: -10,
    night: "2026-06-07",
    total_frames: 6,
    first_captured: "2026-06-07T22:00:00Z",
    last_captured: "2026-06-07T22:05:00Z",
  },
  {
    camera_id: CAM_533,
    gain: 100,
    binning: 1,
    offset: 30,
    exposure_ms: 120000,
    sensor_temp: -5,
    night: "2026-05-30",
    total_frames: 4,
    first_captured: "2026-05-30T22:00:00Z",
    last_captured: "2026-05-30T22:03:00Z",
  },
]

const mockDarkFlatRows: DarkFlatFrameRow[] = [
  {
    camera_id: CAM_2600,
    gain: 100,
    binning: 1,
    offset: 50,
    exposure_ms: 3000,
    night: "2026-06-07",
    total_frames: 5,
    first_captured: "2026-06-08T09:00:00Z",
    last_captured: "2026-06-08T09:04:00Z",
  },
]

const mockFlatRows: FlatFrameRow[] = [
  {
    camera_id: CAM_2600,
    telescope_id: SCOPE_ESPRIT,
    filter_id: FILTER_HA,
    gain: 100,
    binning: 1,
    offset: 50,
    exposure_ms: 3000,
    night: "2026-06-07",
    total_frames: 8,
    first_captured: "2026-06-08T08:00:00Z",
    last_captured: "2026-06-08T08:07:00Z",
  },
]

const mockLightRows: LightFrameRow[] = [
  {
    camera_id: CAM_2600,
    telescope_id: SCOPE_ESPRIT,
    filter_id: FILTER_HA,
    target: "NGC 7000",
    gain: 100,
    binning: 1,
    offset: 50,
    exposure: 300000,
    sensor_temp: -10,
    night: "2026-06-07",
    total_frames: 20,
    first_captured: "2026-06-07T23:00:00Z",
    last_captured: "2026-06-07T23:19:00Z",
  },
  {
    camera_id: CAM_533,
    telescope_id: SCOPE_ESPRIT,
    filter_id: FILTER_LPRO,
    target: "M31",
    gain: 100,
    binning: 1,
    offset: 30,
    exposure: 180000,
    sensor_temp: -5,
    night: "2026-05-30",
    total_frames: 12,
    first_captured: "2026-05-30T23:00:00Z",
    last_captured: "2026-05-30T23:11:00Z",
  },
]

// mirrors AppApi but serves static data, so the ui can run in the browser
export const mockApi: AppApi = {
  async getAppState(): Promise<AppState> {
    return mockAppState
  },

  async getBiasFrames(_query: BiasFrameQuery): Promise<BiasFramePage> {
    return { rows: mockBiasRows, total: mockBiasRows.length }
  },
  async getDarkFrames(_query: DarkFrameQuery): Promise<DarkFramePage> {
    return { rows: mockDarkRows, total: mockDarkRows.length }
  },
  async getDarkFlatFrames(_query: DarkFlatFrameQuery): Promise<DarkFlatFramePage> {
    return { rows: mockDarkFlatRows, total: mockDarkFlatRows.length }
  },
  async getFlatFrames(_query: FlatFrameQuery): Promise<FlatFramePage> {
    return { rows: mockFlatRows, total: mockFlatRows.length }
  },
  async getLightFrames(_query: LightFrameQuery): Promise<LightFramePage> {
    return { rows: mockLightRows, total: mockLightRows.length }
  },

  async saveTelescope(telescope: Telescope): Promise<void> {
    equipment.telescopes[telescope.id] = telescope
  },
  async deleteTelescope(id: UUID): Promise<void> {
    delete equipment.telescopes[id]
  },

  async saveCamera(camera: Camera): Promise<void> {
    equipment.cameras[camera.id] = camera
  },
  async deleteCamera(id: UUID): Promise<void> {
    delete equipment.cameras[id]
  },

  async saveMount(mount: Mount): Promise<void> {
    equipment.mounts[mount.id] = mount
  },
  async deleteMount(id: UUID): Promise<void> {
    delete equipment.mounts[id]
  },

  async saveFilter(filter: Filter): Promise<void> {
    equipment.filters[filter.id] = filter
  },
  async deleteFilter(id: UUID): Promise<void> {
    delete equipment.filters[id]
  },

  async saveFlattener(flattener: Flattener): Promise<void> {
    equipment.flatteners[flattener.id] = flattener
  },
  async deleteFlattener(id: UUID): Promise<void> {
    delete equipment.flatteners[id]
  },
}
