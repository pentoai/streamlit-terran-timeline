import json
import numpy as np
import os

import streamlit as st
from scipy.spatial.distance import cosine

from terran.face import face_detection, extract_features
from terran.io import open_video, open_image

from .utils import (
    crop_expanded_pad,
    get_thumbnail,
    get_video_id,
    to_base64,
)


def generate_timeline(
    video_src,
    ref_directory=None,
    appearence_threshold=None,
    batch_size=32,
    duration=None,
    framerate=4,
    output_directory=None,
    similarity_threshold=0.5,
    start_time=0,
    thumbnail_rate=None,
):
    """Generates a face-recognition timeline from a video.

    Parameters
    ----------
    video_src : str
        A path to a local video file or a link to any video on a streaming
        platform. All streaming platforms supported by YoutubeDL are supported.
    ref_directory : str, pathlike or None
        A path to a folder containing images of faces to look for in the video. If the
        value is None, then it'll automatically collect the faces as we read the video
        and generate their timeline automatically.
    appearence_threshold : int
        If a face appears more then this amount it will be considered for the timeline
    batch_size : int
        How many frames to process at once
    duration : int
        How many seconds of the video should be processed. If equals to None then
        all the video is processed
    framerate : int
        How many frames per second we should process
    output_directory : str, pathlike or None
        Where to store the timeline results as a JSON file. If None, it won't save the
        results
    similarity_threshold : float
        A distance value for when two faces are the same
    start_time : int
        The starting time (in seconds) to beging the timeline generation
    thumbnail_rate : int or None
        Collect a thumbnail of the video for every X seconds. If None, it won't collect
        thumbnails.
    """
    progress_bar = st.progress(0)

    face_by_track = {}
    ref_features = []
    if ref_directory:
        if not os.path.exists(ref_directory):
            st.error(f"Reference directory {ref_directory} not found!")
            return

        st.info("🤳  Loading face references")
        auto_reference = False
        for rix, ref_path in enumerate(os.listdir(ref_directory)):
            ref_path = os.path.join(ref_directory, ref_path)
            try:
                ref = open_image(ref_path)
            except Exception:
                st.warning(f"Could not load reference image {ref_path}")
                continue

            faces_in_ref = face_detection(ref)

            if len(faces_in_ref) != 1:
                st.warning("Reference image must have exactly one face.")
                continue

            ref_features.append(extract_features(ref, faces_in_ref[0]))
            face_by_track[rix] = crop_expanded_pad(
                ref, faces_in_ref[0]["bbox"], factor=0.0
            )

        if len(ref_features) == 0:
            st.error(f"Could not find references in folder {ref_directory}")
            return
    else:
        st.info(
            "✨  No reference directory provided, faces will be detected automatically.",
        )
        auto_reference = True

    video = open_video(
        video_src,
        batch_size=batch_size,
        framerate=framerate,
        read_for=duration,
        start_time=start_time,
    )

    st.info("🕰  Extracting faces from video")
    timestamps_by_track = {}
    thumbnails = []
    last_timestamp = 0

    video_lengh = len(video)

    for bidx, frames in enumerate(video):
        faces_per_frame = face_detection(frames)
        features_per_frame = extract_features(frames, faces_per_frame)

        for fidx, (frame, faces, features) in enumerate(
            zip(frames, faces_per_frame, features_per_frame)
        ):
            frame_idx = bidx * video.batch_size + fidx

            if thumbnail_rate is not None and frame_idx % thumbnail_rate == 0:
                thumbnails.append(get_thumbnail(frame))

            for face, feature in zip(faces, features):
                # Try to match with pre-existing references, if available.
                matched = False
                if len(ref_features) > 0:
                    confidence_scores = [
                        cosine(ref_feature, feature) for ref_feature in ref_features
                    ]
                    match_idx = np.argmin(confidence_scores)
                    matched = confidence_scores[match_idx] < similarity_threshold

                    if matched:
                        timestamps_by_track.setdefault(int(match_idx), []).append(
                            frame_idx
                        )
                        continue

                # Add new reference when `auto_reference` is enababled and:
                #  1. There is no reference to match to yet.
                #  2. Or a new face is detected but doesn't match the current references.
                if auto_reference and (len(ref_features) == 0 or not matched):
                    ref_idx = len(ref_features)
                    ref_features.append(feature)
                    face_by_track[ref_idx] = crop_expanded_pad(
                        frame, face["bbox"], factor=0.0
                    )
                    timestamps_by_track[ref_idx] = [frame_idx]

            last_timestamp = frame_idx

        progress = min(100, int(((bidx + 1) / video_lengh) * 100))
        progress_bar.progress(progress)

    appearance = {}

    for i, (_, timestamps) in enumerate(timestamps_by_track.items()):
        if appearence_threshold and len(timestamps) / framerate < appearence_threshold:
            continue

        track_appearance = np.zeros((last_timestamp + 1), dtype=np.bool)
        for ts in timestamps:
            track_appearance[ts] = 1

        appearance[i] = track_appearance.tolist()

    track_ids = list(sorted(appearance.keys()))

    video_id = get_video_id(video_src)
    timeline = dict(
        id=video_id,
        url=video_src,
        appearance=appearance,
        track_ids=track_ids,
        framerate=video.framerate,
        start_time=video.start_time,
        end_time=video.start_time + video.duration,
        track_faces={
            face_id: to_base64(face) for face_id, face in face_by_track.items()
        },
        thumbnail_rate=thumbnail_rate,
        thumbnails=[to_base64(th) for th in thumbnails],
    )

    if output_directory is not None:
        os.makedirs(output_directory, exist_ok=True)
        with open(os.path.join(output_directory, f"{video_id}.json"), "w") as f:
            json.dump(timeline, f)

    st.success(f"💿  Successfully generated timeline for video {video_src}")

    return timeline
