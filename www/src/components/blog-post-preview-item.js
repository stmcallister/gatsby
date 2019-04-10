import React from "react"
import { Link, graphql } from "gatsby"

import Avatar from "./avatar"
import { colors, fonts } from "../utils/presets"

const formatDate = dateString =>
  new Date(dateString).toLocaleDateString(`en-EN`, {
    month: `long`,
    day: `numeric`,
    year: `numeric`,
  })

const BlogPostPreviewItem = ({ post, className }) => (
  <article className={className} css={{ position: `relative` }}>
    <Link to={post.fields.slug} css={{ "&&": { color: colors.gray.copy } }}>
      <h2 css={{ marginTop: 0 }}>{post.frontmatter.title}</h2>
      <p>
        {post.frontmatter.excerpt ? post.frontmatter.excerpt : post.excerpt}
      </p>
    </Link>
    <div
      css={{
        display: `flex`,
        alignItems: `center`,
      }}
    >
      <Link
        to={post.frontmatter.author.fields.slug}
        css={{
          position: `relative`,
          zIndex: 1,
          "&&": { borderBottom: `0` },
        }}
      >
        <Avatar
          image={post.frontmatter.author.avatar.childImageSharp.fixed}
          alt={post.frontmatter.author.id}
        />
      </Link>
      <div
        css={{
          display: `inline-block`,
          fontFamily: fonts.header,
          color: colors.gray.calm,
        }}
      >
        <div>
          <Link
            to={post.frontmatter.author.fields.slug}
            css={{
              position: `relative`,
              zIndex: 1,
            }}
          >
            {post.frontmatter.author.id}
          </Link>
          {` `}
          on
          {` `}
          {formatDate(post.frontmatter.date)}
        </div>
      </div>
    </div>
    <Link
      to={post.fields.slug}
      css={{
        position: `absolute`,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: `hidden`,
        textIndent: `-100%`,
        whiteSpace: `nowrap`,
        zIndex: 0,
        "&&": { border: 0 },
      }}
    >
      Read more
    </Link>
  </article>
)

export const blogPostPreviewFragment = graphql`
  fragment BlogPostPreview_item on MarkdownRemark {
    excerpt
    fields {
      slug
    }
    frontmatter {
      excerpt
      title
      date
      author {
        id
        fields {
          slug
        }
        avatar {
          childImageSharp {
            fixed(
              width: 32
              height: 32
              quality: 80
              traceSVG: {
                turdSize: 10
                background: "#f6f2f8"
                color: "#e0d6eb"
              }
            ) {
              ...GatsbyImageSharpFixed_tracedSVG
            }
          }
        }
      }
      cover {
        childImageSharp {
          fluid(maxWidth: 700, quality: 80) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  }
`

export default BlogPostPreviewItem
