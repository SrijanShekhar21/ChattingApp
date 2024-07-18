import React, { useState } from "react";
import word from "../assets/word.png";
import pdf from "../assets/pdf.png";
import excel from "../assets/excel.png";
import ppt from "../assets/ppt.png";

function FileMsgDiv({ file }) {
  console.log("File in fileMsg: ", file);
  const { filename, filetype, message } = file;
  console.log("fileMsg filetype:", filetype);

  return (
    <div className="fileMsgDiv">
      <div className="fileMsgIcon">
        {filetype === "image" && (
          <div className="fileMsgImgDiv">
            <div className="fileMsgNameDiv">
              <a target="_blank" href={message}>
                <img className="fileMsgImg" src={message} alt={filename} />
              </a>
            </div>
          </div>
        )}
        {filetype === "video" && (
          <div className="fileMsgVidDiv">
            <div className="fileMsgNameDiv">
              <a target="_blank" href={message}>
                <video className="fileMsgVideo" controls>
                  <source src={message} filetype="video/mp4" />
                </video>
              </a>
            </div>
          </div>
        )}
        {filetype === "audio" && (
          <div className="fileMsgAudioDiv">
            <audio className="fileMsgAudio" controls>
              <source src={message} filetype="audio/mp3" />
            </audio>
          </div>
        )}
        {filetype === "sheet" && (
          <div className="fileMsgDocDiv">
            <img className="fileMsgDoc" src={excel} alt={filename} />
            <div className="fileMsgNameDivDoc">
              <a target="_blank" href={message}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {filetype === "document" && (
          <div className="fileMsgDocDiv">
            <img className="fileMsgDoc" src={word} alt={filename} />
            <div className="fileMsgNameDivDoc">
              <a target="_blank" href={message}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {filetype === "presentation" && (
          <div className="fileMsgDocDiv">
            <img className="fileMsgDoc" src={ppt} alt={filename} />
            <div className="fileMsgNameDivDoc">
              <a target="_blank" href={message}>
                {filename}
              </a>
            </div>
          </div>
        )}
        {filetype === "pdf" && (
          <div className="fileMsgDocDiv">
            <img className="fileMsgDoc" src={pdf} alt={filename} />
            <div className="fileMsgNameDivDoc">
              <a target="_blank" href={message}>
                {filename}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileMsgDiv;
