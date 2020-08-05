import React from "react"

import Dropdown from "react-bootstrap/Dropdown"
import DropdownButton from "react-bootstrap/DropdownButton"

export default ({ timelines, selected, onSelect }) => {
  return (
    <>
      <DropdownButton title="Select video">
        {timelines.map((t, idx) => (
          <Dropdown.Item
            onSelect={(eventKey) => onSelect(eventKey)}
            eventKey={idx}
            active={selected === idx}
          >
            {t.id}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </>
  )
}
