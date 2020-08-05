import React from "react"
import YouTube from "react-youtube"

class Player extends React.Component {
  _onReady = (event) => {
    console.log("On video ready:", event)
    // event.target.pauseVideo()
    // this.props.onGetYoutubeRef(event.target)
  }

  render() {
    const { timeline } = this.props

    return (
      <>
        <p>
          {timeline.id} - {timeline.start_time} - {timeline.end_time}
        </p>

        <YouTube
          videoId={timeline.id}
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              start: timeline.start_time,
              end: timeline.end_time,
            },
          }}
          onReady={this._onReady}
        />
      </>
    )
  }
}

export default Player
