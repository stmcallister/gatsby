import React from "react"
import { colors, space, radii, breakpoints, fonts } from "../../utils/presets"
import ShareMenu from "../../components/share-menu"
import MdLink from "react-icons/lib/md/link"
import MdStar from "react-icons/lib/md/star"

const Meta = ({ starter, repoName, imageSharp, demo }) => (
  <div
    css={{
      fontFamily: fonts.header,
      color: colors.gray.dark,
      display: `flex`,
      flexWrap: `wrap`,
      width: `100%`,
      minWidth: `320px`,
      flexDirection: `column-reverse`,
      padding: space[6],
      paddingTop: 0,
      [breakpoints.sm]: {
        flexDirection: `row`,
        flexWrap: `nowrap`,
        paddingBottom: 0,
      },
      [breakpoints.lg]: {
        padding: space[8],
        paddingTop: 0,
        paddingBottom: 0,
      },
    }}
  >
    <div
      css={{
        marginTop: space[6],
        paddingRight: 15,
        display: `flex`,
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        flexShrink: 0,
        [breakpoints.sm]: {
          justifyContent: `flex-start`,
        },
      }}
    >
      <div>
        <span
          css={{
            color: colors.accent,
            paddingRight: 10,
          }}
        >
          <MdStar style={{ verticalAlign: `sub` }} />
          {` `}
          <span css={{ color: colors.gray.light }}>{starter.stars}</span>
        </span>
      </div>

      <div>
        <span
          css={{
            color: colors.gray.calm,
            fontFamily: fonts.header,
            paddingRight: 8,
          }}
        >
          Updated
        </span>
        {showDate(starter.lastUpdated)}
      </div>
    </div>

    <div
      css={{
        marginTop: space[6],
        marginRight: 15,
        display: `flex`,
        flexWrap: `nowrap`,
        flexGrow: 1,
        borderBottom: `1px solid ${colors.ui.light}`,
        paddingBottom: space[3],
        [breakpoints.sm]: {
          borderBottom: 0,
        },
      }}
    >
      <div
        css={{
          paddingRight: 15,
          paddingBottom: 15,
          whiteSpace: `nowrap`,
          overflow: `hidden`,
          textOverflow: `ellipsis`,
        }}
      >
        <span css={{ color: colors.gray.light }}>{`By  `}</span>
        <a
          css={{
            "&&": {
              borderBottom: 0,
              color: colors.lilac,
              cursor: `pointer`,
              fontFamily: fonts.header,
              "&:hover": {
                color: colors.gatsby,
              },
            },
          }}
          href={`https://github.com/${starter.owner}`}
        >
          {starter.owner}
        </a>
      </div>
      <div
        css={{
          flex: `2 0 auto`,
          textAlign: `right`,
          position: `relative`,
          zIndex: 1,
        }}
      >
        <div
          css={{
            position: `absolute`,
            right: space[6],
            top: 0,
            left: `auto`,
            zIndex: 1,
            display: `flex`,
          }}
        >
          <a
            href={demo}
            css={{
              border: 0,
              borderRadius: radii[1],
              fontFamily: fonts.header,
              fontWeight: `bold`,
              marginRight: space[2],
              padding: `${space[1]} ${space[4]}`,
              WebkitFontSmoothing: `antialiased`,
              "&&": {
                backgroundColor: colors.accent,
                borderBottom: `none`,
                color: colors.gatsby,
              },
            }}
          >
            <MdLink
              style={{
                verticalAlign: `sub`,
              }}
            />
            {` Visit demo `}
          </a>
          <ShareMenu
            url={`https://github.com/${starter.githubFullName}`}
            title={`Check out ${repoName} on the @Gatsby Starter Showcase!`}
            image={imageSharp.childImageSharp.resize.src}
            theme={`accent`}
          />
        </div>
      </div>
    </div>
  </div>
)

function showDate(dt) {
  const date = new Date(dt)
  return date.toLocaleDateString(`en-US`, {
    month: `short`,
    day: `numeric`,
    year: `numeric`,
  })
}

export default Meta
