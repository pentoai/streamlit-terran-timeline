import os
import streamlit.components.v1 as components

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)
_RELEASE = False

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _component_func = components.declare_component(
        # We give the component a simple, descriptive name ("my_component"
        # does not fit this bill, so please choose something better for your
        # own component :)
        "my_component",
        # Pass `url` here to tell Streamlit that the component will be served
        # by the local dev server that you run via `npm run start`.
        # (This is useful while your component is in development.)
        url="http://localhost:3001",
    )
else:
    # When we're distributing a production version of the component, we'll
    # replace the `url` param with `path`, and point it to to the component's
    # build directory:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    print(f"Loading component from {build_dir}")
    _component_func = components.declare_component("my_component", path=build_dir)


# Create a wrapper function for the component. This is an optional
# best practice - we could simply expose the component function returned by
# `declare_component` and call it done. The wrapper allows us to customize
# our component's API: we can pre-process its input args, post-process its
# output value, and add a docstring for users.
def my_component(name, timeline, key=None):
    """Create a new instance of "my_component".

    Parameters
    ----------
    name: str
        The name of the thing we're saying hello to. The component will display
        the text "Hello, {name}!"
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    int
        The number of times the component's "Click Me" button has been clicked.
        (This is the value passed to `Streamlit.setComponentValue` on the
        frontend.)

    """
    # Call through to our private component function. Arguments we pass here
    # will be sent to the frontend, where they'll be available in an "args"
    # dictionary.
    #
    # "default" is a special argument that specifies the initial return
    # value of the component before the user has interacted with it.
    component_value = _component_func(
        name=name, timeline=timeline, key=key, default=0, height=600
    )

    # We could modify the value returned from the component if we wanted.
    # There's no need to do this in our simple example - but it's an option.
    return component_value


# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/__init__.py`
if not _RELEASE:
    import streamlit as st
    import json

    st.header("Face-recognition interactive-timeline generator")

    st.write(
        "In this demo we show you how easy it is to create an interactive"
        "timeline chart of faces detected on videos. Thanksfully, there's an open "
        "source project called Terran that makes all this process super super easy!"
    )
    st.write("More descriptions here")

    st.subheader("Loading your video")
    st.write(
        "You can select videos from **multiple sources**: "
        "YouTube and almost any video streaming platform, or any local file"
    )

    #
    # Ask the user to input a video link or path and show the video below
    #
    video_path = st.text_input(
        "Link or path to video", "https://www.youtube.com/watch?v=R652nwUcJRA"
    )

    #
    # Show the actual faces timeline chart
    #
    st.subheader("Faces timeline chart")
    st.write("")

    from timeline.timeline import st_generate

    @st.cache(suppress_st_warning=True, show_spinner=False)
    def generate_timeline(video_path):
        progress_bar = st.progress(0)

        timeline = st_generate(
            youtube_url=video_path,
            batch_size=16,
            duration=120,
            start_time=0,
            framerate=1,
            thumbnail_rate=1,
            directory="timelines",
            ref_directory=None,
            appearence_threshold=3,
            similarity_threshold=0.5,
            progress_bar=progress_bar,
        )

        return timeline

    with st.spinner("Generating timeline"):
        timeline = generate_timeline(video_path)

    start_time = my_component("", timeline)

    st.write(f"Current start-time is {start_time}")
    st.video(video_path, start_time=int(start_time))
