![Streamlit Terran Timeline logo](resources/logo.jpg)

# Terran timelines

Creating face-recognition timelines on videos has never been so easy! Using the power
of [Terran](https://github.com/pento-group/terran) we can easily build these timelines.

## Installation

This Streamlit component requires the following packages for working properly:

```bash
# Install dependencies
pip install --upgrade streamlit terran youtube-dl

# Install the component
pip install streamlit-terran-timeline
```

## Usage

<p align="center">
  <img src="resources/animation.gif" alt="Streamlit Terran Video animation"/>
</p>

You can generate a timeline from **any** kind of video using the `generate_timeline` function and then using the `terran_timeline` Streamlit component like this:

```python
import streamlit as st
from streamlit_terran_timeline import generate_timeline, terran_timeline

# Generate the timeline information
timeline = generate_timeline("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

#
# Display the timeline. If the users click, you'll get the exact second of
# the part of the timeline video. By default, it returns 0.
#
start_time = terran_timeline(timeline)

st.write(f"User clicked on second {start_time}")
```

You can also check out more examples in the [examples folder](streamlit_terran_timeline/examples).

## Development process

1. First, switch the `_RELEASE` variable from `streamlit_terran_timeline/__init__.py` to `False`.
2. Then, start a development server at `streamlit_terran_timeline/frontend` by running `npm install` and then `npm run start`
3. Also, you'll need to install the package internally like `pip install -e .`
4. Finally, run streamlit on and use the component! For example, you can run `streamlit run streamlit_terran_timeline/examples/youtube.py`

## What's Terran?

[Terran](https://github.com/pento-group/terran) is human-perception library made by [Pento](https://pento.ai) 🚀

With Terran, making this demo was super easy! You can take a look at the [`generate_timeline`](streamlit_terran_timeline/timeline/generator.py) function to understand how Terran modules works with **videos**, **face-recognition**, and **face-detection**.
