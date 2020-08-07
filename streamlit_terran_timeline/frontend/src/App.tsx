import React, { ReactNode } from "react"

import {
  withStreamlitConnection,
  StreamlitComponentBase,
  Streamlit,
} from "./streamlit"

import Timeline from "./components/timeline"

interface State {
  time: number
  youtube: any
}

class App extends StreamlitComponentBase<State> {
  public adjustHeight = () => {
    const totalTracks = this.props.args["timeline"].track_ids.length
    Streamlit.setFrameHeight(totalTracks * 85 + 124)
  }

  public componentDidUpdate = () => {
    this.adjustHeight()
  }

  public componentDidMount = () => {
    this.adjustHeight()
  }

  public render = (): ReactNode => {
    const timeline = this.props.args["timeline"]

    return (
      <div className="app">
        <main style={{ margin: "20px" }}>
          <>
            <section style={{ margin: "20px" }}>
              <Timeline timeline={timeline} />
            </section>
          </>
        </main>
        <footer>
          Made with{" "}
          <b>
            <a href="https://github.com/pento-group/terran" target="_blank">
              <img
                alt="Terran logo"
                src="terran-square.svg"
                height="64"
                width="64"
              />
            </a>
          </b>{" "}
          by{" "}
          <b>
            <a href="https://pento.ai" target="_blank">
              Pento
            </a>
          </b>
        </footer>
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
