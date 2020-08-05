import React, { ReactNode } from "react"

import {
  withStreamlitConnection,
  StreamlitComponentBase,
  Streamlit,
} from "./streamlit"

import Player from "./components/player"
import Select from "./components/select"
import Timeline from "./components/timeline"
import "./App.css"

interface State {
  time: number
  youtube: any
}

class App extends StreamlitComponentBase<State> {
  public state = { time: 0, youtube: null }

  private onTimeChange = (time: number): void => {
    this.setState({ time })
  }

  private onGetYoutubeRef = (youtube: any): void => {
    console.log("Got Youtube reference", youtube)
    this.setState({ youtube })
  }

  public componentDidMount = () => {
    Streamlit.setFrameHeight(500)
  }

  public render = (): ReactNode => {
    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`. Here, we access the "name" arg.
    const name = this.props.args["name"]
    const timeline = this.props.args["timeline"]

    return (
      <div className="App">
        <header className="App-header">
          <h2>Video Timeline</h2>
        </header>
        <main style={{ margin: "20px" }}>
          <>
            <section style={{ margin: "20px" }}>
              {/* <Player
                timeline={timeline}
                onTimeChange={this.onTimeChange}
                onGetYoutubeRef={this.onGetYoutubeRef}
              /> */}
            </section>
            <section style={{ margin: "20px", marginTop: 80 }}>
              <Timeline
                timeline={timeline}
                time={this.state.time}
                youtube={this.state.youtube}
              />
            </section>
          </>
        </main>
        <footer style={{ color: "white" }}>Made with Terran by Pento</footer>
      </div>
    )
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(App)
