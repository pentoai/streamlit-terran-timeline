import React, { useRef, useEffect } from "react"
import * as d3 from "d3"

import { Streamlit } from "../streamlit"

export default ({ timeline }) => {
  const ref = useRef()

  // Split appearances in segments of consecutive values.
  const getAppearanceSegments = (appearance) => {
    const segments = []
    var currSegment = { start: 0 }
    let prev, prevIdx

    appearance.forEach((curr, idx) => {
      if ((prev !== undefined) & (curr !== prev)) {
        currSegment["end"] = prevIdx
        currSegment["present"] = prev
        // Close current group.
        segments.push(currSegment)
        // Create a new one.
        currSegment = { start: idx }
      }
      prevIdx = idx
      prev = curr
    })

    // Close last open group.
    const lastIdx = appearance.length - 1
    currSegment = {
      ...currSegment,
      end: lastIdx,
      present: appearance[lastIdx],
    }
    segments.push(currSegment)
    return segments
  }

  const drawTimeline = (ref, timeline) => {
    if (timeline === null) {
      return
    }

    const lineHeight = 85
    const width = 600
    const height = lineHeight * Object.keys(timeline.appearance).length
    const videoLength = timeline.end_time - timeline.start_time

    const svg = d3.select(ref.current)
    svg.attr("width", width).attr("height", height)

    const framesCount = timeline.appearance[timeline.track_ids[0]].length
    const thumbnails = timeline.thumbnails

    let yPos = 8
    const yMargin = 12
    const xOrigin = ref.current.getBoundingClientRect().x
    const xStep = width / framesCount
    const thumbnailStep = xStep * timeline.thumbnail_rate
    const faceSize = 45

    timeline.track_ids.forEach((trackId, trackIx) => {
      // Display face.
      const faceImage = svg.append("defs")
      faceImage
        .append("clipPath")
        .attr("id", `face-${trackIx}`)
        .append("circle")
        .attr("cx", faceSize / 2)
        .attr("cy", faceSize / 2 + yPos + yMargin)
        .attr("r", faceSize / 2)
      svg
        .append("g")
        .append("image")
        .attr("x", 0)
        .attr("y", yPos + yMargin)
        .attr("width", faceSize)
        .attr("height", faceSize)
        .attr(
          "xlink:href",
          `data:image/png;base64,${timeline.track_faces[trackId]}`
        )
        .attr("clip-path", `url(#face-${trackIx})`)
        .attr("transform", "translate(posx, posy)")

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("id", `tooltip-${trackId}`)
        .attr("class", "tooltip")
        .style("opacity", 0)

      // Draw timeline.
      const segments = getAppearanceSegments(timeline.appearance[trackId])
      segments.forEach((s, segmentIx) => {
        const color = s.present ? "#2a9d8f" : "#f4a261"
        const colorHover = s.present ? "#264653" : "#e76f51"

        const segmentId = `d3-segment-${trackIx}-${segmentIx}`

        svg
          .append("rect")
          .attr("id", segmentId)
          .attr("x", s.start * xStep)
          .attr("y", yPos)
          .attr("width", s.end * xStep - s.start * xStep)
          .attr("height", 8)
          .style("fill", color)
          .style("cursor", "pointer")
          .style("stroke-width", 1)
          .on("mouseover", () => {
            const rectRef = d3.select(segmentId)
            rectRef.style("fill", colorHover)

            const xEvent = Math.abs(d3.event.pageX - xOrigin)

            if (thumbnails) {
              tooltip.transition().duration(200).style("opacity", 1)
              const thumbnailIx = Math.min(
                Math.floor(xEvent / thumbnailStep),
                thumbnails.length - 1
              )

              // Whether the tooltip should pop up to the top or bottom of the line
              const tooltipYOffset = trackIx > 1 ? -136 : 0

              tooltip
                .html(
                  `<img width="120" height="120" src="data:image/png;base64, ${thumbnails[thumbnailIx]}" />`
                )
                .style("left", `${d3.event.pageX - 64}px`)
                .style("top", `${d3.event.pageY + tooltipYOffset}px`)
            }
          })
          .on("mouseout", () => {
            const rectRef = d3.select(`#d3-segment-${segmentIx}`)
            rectRef.style("fill", color)

            if (thumbnails) {
              tooltip.transition().duration(500).style("opacity", 0)
            }
          })
          .on("click", () => {
            const xEvent = Math.abs(d3.event.pageX - xOrigin)
            const widthRate = xEvent / width
            const seekTimeSecond = videoLength * widthRate

            //
            // If the user clicks on the timeline, we set the component value to the
            // time in seconds where the user clicked
            //
            Streamlit.setComponentValue(seekTimeSecond)
          })
      })

      yPos += lineHeight
    })
  }

  useEffect(() => {
    drawTimeline(ref, timeline)
  }, [timeline])

  return <svg ref={ref} />
}
