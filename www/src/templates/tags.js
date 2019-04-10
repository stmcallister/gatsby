import React from "react"
import { graphql } from "gatsby"
import TagsIcon from "react-icons/lib/ti/tags"

import BlogPostPreviewItem from "../components/blog-post-preview-item"
import Button from "../components/button"
import Container from "../components/container"
import Layout from "../components/layout"
import { space } from "../utils/presets"

// Select first tag with whitespace instead of hyphens for
// readability. But if none present, just use the first tag in the
// collection
const preferSpacedTag = tags => {
  for (const tag of tags) {
    if (!tag.includes(` `)) {
      return tag
    }
  }
  return tags[0]
}

const Tags = ({ pageContext, data, location }) => {
  const { tags } = pageContext
  const { edges, totalCount } = data.allMarkdownRemark
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? `` : `s`
  } tagged with "${preferSpacedTag(tags)}"`

  return (
    <Layout location={location}>
      <Container>
        <h1>{tagHeader}</h1>
        <Button small key="blog-post-view-all-tags-button" to="/blog/tags">
          View All Tags <TagsIcon />
        </Button>
        {edges.map(({ node }) => (
          <BlogPostPreviewItem
            post={node}
            key={node.fields.slug}
            css={{
              marginTop: space[9],
              marginBottom: space[9],
            }}
          />
        ))}
      </Container>
    </Layout>
  )
}

export default Tags

export const pageQuery = graphql`
  query($tags: [String]) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date, fields___slug], order: DESC }
      filter: {
        frontmatter: { tags: { in: $tags } }
        fileAbsolutePath: { regex: "/docs.blog/" }
        fields: { released: { eq: true } }
      }
    ) {
      totalCount
      edges {
        node {
          ...BlogPostPreview_item
        }
      }
    }
  }
`
