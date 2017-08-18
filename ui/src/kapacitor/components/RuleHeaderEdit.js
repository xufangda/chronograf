import React, {PropTypes} from 'react'
import ReactTooltip from 'react-tooltip'

const RuleHeaderEdit = ({
  rule,
  isEditing,
  onToggleEdit,
  onEditName,
  onEditNameBlur,
}) =>
  isEditing
    ? <input
        className="page-header--editing kapacitor-theme"
        autoFocus={true}
        defaultValue={rule.name}
        onKeyDown={onEditName(rule)}
        onBlur={onEditNameBlur(rule)}
        placeholder="Name your rule"
        spellCheck={false}
        autoComplete={false}
      />
    : <div className="page-header__left">
        <h1
          className="page-header__title page-header--editable kapacitor-theme"
          onClick={onToggleEdit}
          data-for="rename-kapacitor-tooltip"
          data-tip="Click to Rename"
        >
          {rule.name}
          <span className="icon pencil" />
          <ReactTooltip
            id="rename-kapacitor-tooltip"
            delayShow={200}
            effect="solid"
            html={true}
            offset={{top: 2}}
            place="bottom"
            class="influx-tooltip kapacitor-tooltip place-bottom"
          />
        </h1>
      </div>

const {bool, func, shape} = PropTypes

RuleHeaderEdit.propTypes = {
  rule: shape(),
  isEditing: bool.isRequired,
  onToggleEdit: func.isRequired,
  onEditName: func.isRequired,
  onEditNameBlur: func.isRequired,
}

export default RuleHeaderEdit
