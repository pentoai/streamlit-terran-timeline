import React, { useRef, useEffect, useState } from "react"
import * as d3 from "d3"

export default ({ timeline, time, youtube }) => {
  const ref = useRef()
  const [hoveredSegment, setHoveredSegment] = useState(null)

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
    const yStep = 85

    // https://github.com/Olical/react-faux-dom/issues/29

    timeline.track_ids.forEach((trackId) => {
      // Display face.
      const faceImage = svg
        .append("g")
        .append("image")
        .attr("x", 0)
        .attr("y", yPos + yMargin)
        .attr("width", 60)
        .attr("height", 60)
        .attr(
          "xlink:href",
          `data:image/png;base64,${timeline.track_faces[trackId]}`
        )

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("id", `tooltip-${trackId}`)
        .attr("class", "tooltip")
        .style("opacity", 0)

      // Draw timeline.
      const segments = getAppearanceSegments(timeline.appearance[trackId])
      segments.forEach((s, segmentIx) => {
        const color = s.present ? "#2FBF71" : "#EB7887"
        const colorHover = s.present ? "#3DFF96" : "#FFABB6"

        svg
          .append("rect")
          .attr("id", `d3-segment-${segmentIx}`)
          .attr("x", s.start * xStep)
          .attr("y", yPos)
          .attr("width", s.end * xStep - s.start * xStep)
          .attr("height", 8)
          .style("fill", color)
          .style("cursor", "pointer")
          .style("stroke", "#282C34")
          .style("stroke-width", 1)
          .on("mouseover", () => {
            const rectRef = d3.select(`#d3-segment-${segmentIx}`)
            rectRef.style("fill", colorHover)

            const xEvent = Math.abs(d3.event.pageX - xOrigin)

            if (thumbnails) {
              tooltip.transition().duration(200).style("opacity", 1)
              const thumbnailIx = Math.min(
                Math.floor(xEvent / thumbnailStep),
                thumbnails.length - 1
              )

              tooltip
                .html(
                  `<img width="120" height="120" src="data:image/png;base64, ${thumbnails[thumbnailIx]}" />`
                )
                .style("left", `${d3.event.pageX - 64}px`)
                .style("top", `${d3.event.pageY - 136}px`)
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

            youtube.current.internalPlayer.seekTo(Math.floor(seekTimeSecond))
          })
      })

      yPos += yStep
    })

    // Add time line placeholder.
    svg
      .append("line")
      .attr("id", "time")
      .style("stroke", "white")
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", 2)
  }

  useEffect(() => {
    drawTimeline(ref, timeline)
  }, [timeline])

  const drawCurrentTime = (ref, timeline, time) => {
    if (timeline === null) {
      return
    }

    // Adjust time.
    time = time - timeline.start_time

    const main = d3.select(ref.current)

    const width = Number(main.style("width").replace("px", ""))
    const height = Number(main.style("height").replace("px", ""))
    const framesCount = timeline.appearance[timeline.track_ids[0]].length
    const xStep = width / framesCount
    const timex = time * timeline.framerate * xStep

    d3.select("#time")
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr("x1", timex)
      .attr("y1", 0)
      .attr("x2", timex)
      .attr("y2", height)
  }

  useEffect(() => {
    drawCurrentTime(ref, timeline, time)
  }, [timeline, time])

  return <svg ref={ref} />
}
