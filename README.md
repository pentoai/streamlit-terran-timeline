![Streamlit Terran Timeline logo](logo.jpg)

# Terran timelines

Creating face-recognition timelines on videos has never been so easy! Using the power
of [Terran](https://github.com/pentogroup/terran) we can easily build these timelines.

## Installation

This streamlit components requires the following packages for working properly:

```bash
# Install dependencies
pip install --upgrade streamlit terran youtube-dl

# Install the component
pip install streamlit-terran-timeline
```

## Usage

You can generate a timeline from **any** kind of video using the `generate_timeline` function and then using the `terran_timeline` Streamlit component like this:

```python
import streamlit as st
from streamlit_terran_timeline import generate_timeline, terran_timeline

# Generate the timeline information
timeline = generate_timeline("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

#
# Display the timeline. If the users click, you'll get the exact second of
# the part of the timeline video. By default it returns 0.
#
start_time = terran_timeline(timeline)

st.write(f"User clicked on second {start_time}")
```

## Development process

1. First, switch the `_RELEASE` variable from `streamlit_terran_timeline/__init__.py` to `False`.
2. Then, start a development server at `streamlit_terran_timeline/frontend` by running `npm install` and then `npm run start`
3. Also, you'll need to install the package internally like `pip install -e .`
4. Finally, run streamlit on and use the component! For example, you can run `streamlit run streamlit_terran_timeline/examples/youtube.py`

## Distribution

1. Build the frontend package by running `npm run build`
2. Be sure you have these development dependencies installed: `pip install --upgrade setuptools wheel twine`
3. Build the Python package wheel and upload it to [testpypi](https://test.pypi.org/):

   ```bash
   rm -rf dist && \
   python setup.py sdist bdist_wheel && \
   python3 -m twine upload --repository testpypi dist/*
   ```
