import React from "react"
import MdClear from "react-icons/lib/md/clear"

import { colors, space, radii, fonts } from "../../utils/presets"

const ResetFilters = ({ onClick }) => (
  <div css={{ paddingRight: space[6] }}>
    <button
      css={{
        alignItems: `center`,
        background: colors.ui.light,
        border: 0,
        borderRadius: radii[1],
        color: colors.gatsby,
        cursor: `pointer`,
        display: `flex`,
        fontFamily: fonts.header,
        marginTop: space[6],
        paddingRight: space[6],
        textAlign: `left`,
        "&:hover": {
          background: colors.gatsby,
          color: colors.white,
        },
      }}
      onClick={onClick}
    >
      <MdClear style={{ marginRight: space[1] }} /> Reset all Filters
    </button>
  </div>
)

export default ResetFilters
