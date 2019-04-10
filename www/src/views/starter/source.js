import React from "react"
import { colors, space, breakpoints, fonts } from "../../utils/presets"
import TechWithIcon from "../../components/tech-with-icon"
import GithubIcon from "react-icons/lib/fa/github"
import { NetlifyIcon } from "../../assets/logos"

const Source = ({ startersYaml, repoUrl }) => (
  <div
    css={{
      display: `flex`,
      borderTop: `1px solid ${colors.ui.light}`,
      fontFamily: fonts.header,
      margin: `0 ${space[6]}`,
      [breakpoints.sm]: {
        borderTop: 0,
      },
      [breakpoints.lg]: {
        margin: `0 ${space[8]}`,
      },
    }}
  >
    {repoUrl && (
      <div
        css={{
          padding: 20,
          paddingLeft: startersYaml.featured ? false : 0,
          display: `flex`,
          alignItems: `center`,
        }}
      >
        <GithubIcon
          css={{
            marginBottom: 0,
            marginRight: 10,
            height: 26,
            width: 20,
            color: colors.gatsby,
          }}
        />
        <a
          href={repoUrl}
          css={{
            "&&": {
              borderBottom: 0,
              color: colors.gatsby,
              cursor: `pointer`,
              fontWeight: `normal`,
              "&:hover": {
                color: colors.lilac,
              },
            },
          }}
        >
          Source
        </a>
      </div>
    )}

    <div
      css={{
        display: `none`,
        [breakpoints.lg]: {
          padding: 20,
          paddingLeft: 0,
          flex: 1,
          justifyContent: `flex-end`,
          display: `flex`,
          alignItems: `center`,
        },
      }}
    >
      <span
        css={{
          marginRight: 20,
          color: colors.gray.calm,
        }}
      >
        Try this starter
      </span>
      <a
        href={`https://app.netlify.com/start/deploy?repository=${repoUrl}`}
        css={{
          "&&": {
            borderBottom: 0,
            color: colors.gatsby,
            cursor: `pointer`,
            fontWeight: `normal`,
            "&:hover": {
              color: colors.lilac,
            },
          },
        }}
      >
        <TechWithIcon icon={NetlifyIcon}>Netlify</TechWithIcon>
      </a>
    </div>
  </div>
)

export default Source
