import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="streamlit-terran-timeline",
    version="0.0.19",
    author="Pento AI",
    author_email="hello@pento.ai",
    description="Create faces timelines from videos",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/pento-group/streamlit-terran-timeline",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.6",
    install_requires=[
        # By definition, a Custom Component depends on Streamlit.
        # If your component has other Python dependencies, list
        # them here.
        "streamlit >= 0.63",
    ],
)
