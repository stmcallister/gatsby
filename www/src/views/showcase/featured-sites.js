import React, { Component } from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import hex2rgba from "hex2rgba"

import styles from "../shared/styles"
import MdArrowForward from "react-icons/lib/md/arrow-forward"
import ShowcaseItemCategories from "./showcase-item-categories"
import FeaturedSitesIcon from "../../assets/featured-sites-icons.svg"
import { ShowcaseIcon } from "../../assets/mobile-nav-icons"
import {
  colors,
  space,
  transition,
  radii,
  shadows,
  breakpoints,
  fontSizes,
  fonts,
} from "../../utils/presets"
import { svgStyles } from "../../utils/styles"
import Button from "../../components/button"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

class FeaturedSites extends Component {
  setFilterToFeatured = e => {
    e.preventDefault()

    this.props.setFilters(`Featured`)
  }

  render() {
    const { featured, setFilters } = this.props

    return (
      <section
        className="featured-sites"
        css={{
          margin: `${space[6]} ${space[6]} 0`,
          position: `relative`,
          display: `none`,
          [breakpoints.lg]: {
            display: `block`,
          },
        }}
      >
        <div
          css={{
            background: `url(${FeaturedSitesIcon})`,
            backgroundRepeat: `no-repeat`,
            backgroundSize: `contain`,
            position: `absolute`,
            height: `100%`,
            width: `100%`,
            left: -100,
            opacity: 0.02,
            top: 0,
            zIndex: -1,
          }}
        />
        <div
          css={{
            marginBottom: space[9],
            display: `flex`,
            alignItems: `center`,
            flexWrap: `wrap`,
          }}
        >
          <img
            src={FeaturedSitesIcon}
            alt="icon"
            css={{ marginBottom: 0, height: space[4] }}
          />
          <h1
            css={{
              fontSize: fontSizes[4],
              color: colors.gray.dark,
              fontFamily: fonts.header,
              fontWeight: `bold`,
              marginRight: 30,
              marginLeft: 4,
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            Featured Sites
          </h1>
          <a
            href="#showcase"
            css={{
              ...styles.withTitleHover,
              display: `none`,
              fontSize: fontSizes[1],
              [breakpoints.sm]: {
                display: `block`,
              },
              "&&": {
                borderBottom: 0,
                cursor: `pointer`,
                "&:hover": {
                  color: colors.gatsby,
                },
              },
            }}
            onClick={this.setFilterToFeatured}
          >
            <span className="title">View all</span>
            &nbsp;
            <MdArrowForward style={{ marginLeft: 4, verticalAlign: `sub` }} />
          </a>
          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              marginLeft: `auto`,
            }}
          >
            <div
              css={{
                color: colors.gray.calm,
                fontSize: fontSizes[1],
                marginRight: 15,
                display: `none`,
                [breakpoints.md]: {
                  display: `block`,
                },
              }}
            >
              Want to get featured?
            </div>
            <Button
              to="https://gatsbyjs.org/contributing/site-showcase-submissions/"
              tag="href"
              target="_blank"
              rel="noopener noreferrer"
              small
              icon={<ArrowForwardIcon />}
            >
              Submit your Site
            </Button>
          </div>
        </div>
        <div
          css={{
            position: `relative`,
          }}
        >
          <div
            css={{
              display: `flex`,
              overflowX: `scroll`,
              flexShrink: 0,
              margin: `0 -${space[6]}`,
              padding: `3px ${space[6]} 0`,
              borderBottom: `1px solid ${colors.gray.border}`,
            }}
          >
            {featured.slice(0, 9).map(({ node }) => (
              <div
                key={node.id}
                css={{
                  ...styles.featuredSitesCard,
                  ...styles.withTitleHover,
                }}
              >
                <Link
                  css={{
                    "&&": {
                      borderBottom: `none`,
                      fontSize: fontSizes[3],
                      fontWeight: `bold`,
                      color: colors.gray.dark,
                      fontFamily: fonts.header,
                      transition: `box-shadow ${transition.speed.slow} ${
                        transition.curve.default
                      }, transform .3s ${transition.curve.default}`,
                      "&:hover": { ...styles.screenshotHover },
                    },
                  }}
                  to={node.fields.slug}
                  state={{ isModal: true }}
                >
                  {node.childScreenshot && (
                    <Img
                      fluid={
                        node.childScreenshot.screenshotFile.childImageSharp
                          .fluid
                      }
                      alt={node.title}
                      css={{ ...styles.screenshot }}
                    />
                  )}
                  <div>
                    <span className="title">{node.title}</span>
                  </div>
                </Link>
                <div
                  css={{
                    fontSize: fontSizes[1],
                    color: colors.gray.calm,
                    fontWeight: `normal`,
                    [breakpoints.lg]: {
                      marginTop: `auto`,
                    },
                  }}
                >
                  {node.built_by && (
                    <div
                      css={{
                        fontFamily: fonts.header,
                      }}
                    >
                      Built by {node.built_by}
                    </div>
                  )}
                  <ShowcaseItemCategories
                    categories={node.categories}
                    onCategoryClick={c => setFilters(c)}
                  />
                </div>
              </div>
            ))}
            <div
              css={{
                display: `flex`,
              }}
            >
              <a
                href="#showcase"
                css={{
                  marginRight: `${space[6]} !important`,
                  backgroundColor: hex2rgba(colors.ui.light, 0.25),
                  borderRadius: radii[1],
                  textAlign: `center`,
                  "&&": {
                    border: 0,
                    transition: `all ${transition.speed.default} ${
                      transition.curve.default
                    }`,
                    "&:hover": {
                      background: colors.white,
                      transform: `translateY(-${space[1]})`,
                      boxShadow: shadows.overlay,
                    },
                  },
                  ...styles.featuredSitesCard,
                }}
                onClick={this.setFilterToFeatured}
              >
                <div
                  css={{
                    borderRadius: radii[1],
                    display: `flex`,
                    alignItems: `center`,
                    position: `relative`,
                    flexBasis: `100%`,
                  }}
                >
                  <span
                    css={{
                      margin: `0 auto`,
                      color: colors.gatsby,
                    }}
                  >
                    <span
                      css={{
                        height: 44,
                        width: `auto`,
                        display: `block`,
                        margin: `0 auto ${space[6]}`,
                        [breakpoints.md]: {
                          height: 64,
                        },
                        [breakpoints.xl]: {
                          height: 72,
                        },

                        "& svg": {
                          height: `100%`,
                          ...svgStyles.active,
                        },
                      }}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: ShowcaseIcon }}
                      />
                    </span>
                    View all Featured Sites
                  </span>
                </div>
              </a>
            </div>
          </div>
          <div
            css={{
              position: `absolute`,
              top: `0`,
              bottom: space[6],
              right: `-${space[6]}`,
              width: 60,
              pointerEvents: `none`,
              background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,1) 100%)`,
            }}
          />
        </div>
      </section>
    )
  }
}

export default FeaturedSites
