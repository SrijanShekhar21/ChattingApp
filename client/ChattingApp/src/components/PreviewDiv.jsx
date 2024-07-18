import React, { useState } from "react";
import word from "../assets/word.png";
import pdf from "../assets/pdf.png";
import excel from "../assets/excel.png";
import ppt from "../assets/ppt.png";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useChats } from "../contexts/chatsContext";

function PreviewDiv({ file, percentage, uploading }) {
  console.log("File in preview: ", file);
  const { filename, type, url } = file;
  console.log("preview type:", type);

  const { minimize, setMinimize } = useChats();

  return (
    <div className="previewDiv">
      {uploading && (
        <CircularProgressbar
          className="progressBar"
          value={percentage}
          text={`${percentage}%`}
        />
      )}
      <div className={`previewIcon ${minimize && "minimizePreviewIcon"}`}>
        {type === "image" && (
          <div className="previewImgDiv">
            <img className="previewImg" src={url} alt={filename} />
            <div className="fileNameDiv">
              <a target="_blank" href={url}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {type === "video" && (
          <div className="previewVidDiv">
            <video className="previewVideo" controls>
              <source src={url} type="video/mp4" />
            </video>
            <div className="fileNameDiv">
              <a target="_blank" href={url}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {type === "audio" && (
          <div className="previewAudioDiv">
            <audio className="previewAudio" controls>
              <source src={url} type="audio/mp3" />
            </audio>
            <div className="fileNameDiv">
              <a target="_blank" href={url}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {type === "sheet" && (
          <div className="previewDocDiv">
            <img className="previewDoc" src={excel} alt={filename} />
            <div className="fileNameDivDoc">
              <a target="_blank" href={url}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {type === "document" && (
          <div className="previewDocDiv">
            <img className="previewDoc" src={word} alt={filename} />
            <div className="fileNameDivDoc">
              <a target="_blank" href={url}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {type === "presentation" && (
          <div className="previewDocDiv">
            <img className="previewDoc" src={ppt} alt={filename} />
            <div className="fileNameDivDoc">
              <a target="_blank" href={url}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {type === "pdf" && (
          <div className="previewDocDiv">
            <img className="previewDoc" src={pdf} alt={filename} />
            <div className="fileNameDivDoc">
              <a target="_blank" href={url}>
                {filename}
              </a>
            </div>
          </div>
        )}
      </div>
      <div
        onClick={() => {
          setMinimize(!minimize);
        }}
        className="minimizePreview"
      >
        -
      </div>
    </div>
  );
}

export default PreviewDiv;
