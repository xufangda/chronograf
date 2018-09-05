import {QueryConfig, TimeRange} from 'src/types'
import {DEState} from 'src/types/dataExplorer'
import {LogsState} from 'src/types/logs'

export interface LocalStorage {
  VERSION: VERSION
  app: App
  dashTimeV1: DashTimeV1
  dataExplorer: DEState
  dataExplorerQueryConfigs: DataExplorerQueryConfigs
  timeRange: TimeRange
  script: string
  logs: LogsState
}

export type VERSION = string
export type timeRange = TimeRange

export interface App {
  persisted: Persisted
}

export interface DashTimeV1 {
  ranges: DashboardTimeRange[]
}

export interface DataExplorerQueryConfigs {
  [id: string]: QueryConfig
}

interface DashboardTimeRange {
  dashboardID: number
  defaultGroupBy: string
  format: string
  inputValue: string
  lower: string
  menuOption: string
  seconds: number
  upper: string | null
}

interface Persisted {
  autoRefresh: number
}
