// Libraries
import React, {PureComponent} from 'react'

// Utils
import {getNewDashboardCell} from 'src/dashboards/utils/cellGetters'
import {getCellTypeColors} from 'src/dashboards/constants/cellEditor'

// Components
import {
  OverlayContainer,
  OverlayHeading,
  OverlayBody,
  MultiSelectDropdown,
  Form,
  Button,
  ComponentColor,
  ComponentStatus,
  Input,
} from 'src/reusable_ui'

// Constants
import {STATIC_LEGEND} from 'src/dashboards/constants/cellEditor'

// Actions
import {addDashboardCellAsync} from 'src/dashboards/actions'

// Types
import {QueryConfig, Dashboard, Source, Service, Cell} from 'src/types'
import {getDeep} from 'src/utils/wrappers'
import {VisualizationOptions} from 'src/types/dataExplorer'
import {ColorString} from 'src/types/colors'

interface Props {
  queryConfig: QueryConfig
  script: string
  dashboards: Dashboard[]
  source: Source
  rawText: string
  service: Service
  onCancel: () => void
  addDashboardCell: typeof addDashboardCellAsync
  visualizationOptions: VisualizationOptions
  isStaticLegend: boolean
}

interface State {
  selectedIDs: string[]
  name: string
}

class SendToDashboardOverlay extends PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      selectedIDs: [],
      name: '',
    }
  }

  public handleChangeName = e => {
    const name = e.target.value
    this.setState({name})
  }

  public render() {
    const {onCancel} = this.props
    const {name, selectedIDs} = this.state

    const numberDashboards = selectedIDs.length > 1 ? selectedIDs.length : ''
    const pluralizer = selectedIDs.length > 1 ? 's' : ''

    return (
      <OverlayContainer>
        <OverlayHeading title="Send to Dashboard" onDismiss={onCancel} />
        <OverlayBody>
          <Form>
            <Form.Element label="Cell Name">
              <Input
                value={name}
                onChange={this.handleChangeName}
                placeholder={'Name this new cell'}
              />
            </Form.Element>
            <Form.Element label="Target Dashboard(s)">
              <MultiSelectDropdown
                onChange={this.handleSelect}
                selectedIDs={this.state.selectedIDs}
                emptyText="Choose at least 1 dashboard"
              >
                {this.dropdownItems}
              </MultiSelectDropdown>
            </Form.Element>
            <Form.Footer>
              <Button
                color={ComponentColor.Success}
                text={`Send to ${numberDashboards} Dashboard${pluralizer}`}
                titleText="Must choose at least 1 dashboard and set a name"
                status={this.submitButtonStatus}
                onClick={this.sendToDashboard}
              />
              <Button text="Cancel" onClick={onCancel} />
            </Form.Footer>
          </Form>
        </OverlayBody>
      </OverlayContainer>
    )
  }

  private get dropdownItems(): JSX.Element[] {
    const {dashboards} = this.props

    const simpleArray = dashboards.map(d => ({
      id: d.id.toString(),
      name: d.name,
    }))
    return simpleArray.map(dashboard => {
      return (
        <MultiSelectDropdown.Item
          key={dashboard.id}
          id={dashboard.id}
          value={dashboard}
        >
          {dashboard.name}
        </MultiSelectDropdown.Item>
      )
    })
  }

  private get hasQuery(): boolean {
    const {queryConfig, script} = this.props
    if (this.isFlux) {
      return !!script.length
    }
    return getDeep<number>(queryConfig, 'fields.length', 0) !== 0
  }

  private get isFlux(): boolean {
    const {service} = this.props
    return !!service
  }

  private get selectedDashboards(): Dashboard[] {
    const {dashboards} = this.props
    const {selectedIDs} = this.state

    return dashboards.filter(d => {
      return selectedIDs.includes(d.id.toString())
    })
  }

  private get submitButtonStatus(): ComponentStatus {
    const {name, selectedIDs} = this.state

    if (
      !this.hasQuery ||
      selectedIDs.length === 0 ||
      name.trim().length === 0
    ) {
      return ComponentStatus.Disabled
    }

    return ComponentStatus.Default
  }

  private handleSelect = (updatedSelection: string[]) => {
    this.setState({selectedIDs: updatedSelection})
  }

  private sendToDashboard = async () => {
    const {name} = this.state
    const {
      queryConfig,
      script,
      addDashboardCell,
      rawText,
      source,
      onCancel,
      service,
      visualizationOptions,
      isStaticLegend,
    } = this.props
    const {
      type,
      gaugeColors,
      thresholdsListColors,
      lineColors,
      axes,
      decimalPlaces,
      timeFormat,
      note,
      noteVisibility,
    } = visualizationOptions

    const newCellQueries = this.isFlux
      ? [
          {
            queryConfig: null,
            query: script,
            source: service.links.self,
          },
        ]
      : [{queryConfig, query: rawText, source: source.links.self}]

    const colors: ColorString[] = getCellTypeColors({
      cellType: type,
      gaugeColors,
      thresholdsListColors,
      lineColors,
    })

    const legend = isStaticLegend ? STATIC_LEGEND : {}

    await Promise.all(
      this.selectedDashboards.map(dashboard => {
        const emptyCell = getNewDashboardCell(dashboard)
        const newCell: Partial<Cell> = {
          ...emptyCell,
          name,
          queries: newCellQueries,
          type,
          axes,
          legend,
          colors,
          decimalPlaces,
          timeFormat,
          note,
          noteVisibility,
        }
        return addDashboardCell(dashboard, newCell)
      })
    )
    onCancel()
  }
}

export default SendToDashboardOverlay
