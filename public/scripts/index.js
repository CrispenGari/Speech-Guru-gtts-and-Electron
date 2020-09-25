const electron = require("electron");
const gTTS = require("gtts");
const ipc = electron.ipcRenderer;
const path = require("path");
const $ = require("jquery");
const nodeNotifier = require("node-notifier");
const _ = require("../../languages.json");

const remote = electron.remote;
const menu = new remote.Menu();

menu.append(
  new remote.MenuItem({
    label: "focus window",
    click() {
      remote.getCurrentWindow().focus();
    },
  })
);

menu.append(
  new remote.MenuItem({
    label: "clear text",
    click() {
      ipc.send("clear");
      ipc.on("clear-response", (event, args) => {
        if (args.response === 0) {
          main_text.val("");
        } else {
          main_text.focus();
          electron.remote.getCurrentWindow().focus();
        }
      });
    },
  })
);
menu.append(
  new remote.MenuItem({
    label: "play random",
    click() {
      startPlay();
    },
  })
);
// append a separator
menu.append(new remote.MenuItem({ type: "separator" }));
menu.append(
  new remote.MenuItem({
    label: "exit app",
    click() {
      ipc.send("closing-app");
    },
  })
);
// pushing languages to the select
const lang_values = Object.keys(_);
const lang_opts = Object.values(_);
const select = $("#language");
for (let index = 0; index < lang_values.length; index++) {
  let child;
  if (index === 2) {
    child = `<option id="option"selected value=${lang_values[index]}>${lang_opts[index]}</option>`;
  } else {
    child = `<option id="option" value=${lang_values[index]}>${lang_opts[index]}</option>`;
  }
  select.append(child);
}
// handling play pause and mute
const play = $("#play");
const record = $("#record");
const main_text = $("#main-text");
const audio_tag = document.getElementById("audiop");
const audi_src = $("#audio_source");
play.click(() => {
  startPlay();
});
record.click(() => {
  const speech = main_text.val();
  const language = select.val();
  startSpeechRecording(speech, language);
});

const startSpeechRecording = (speech, language) => {
  const file_name = `./static/cache/speech_audio${new Date().getTime()}.mp3`;
  if (speech.length !== 0) {
    const gtts = new gTTS(speech, language);
    gtts.save(file_name, (error) => {
      if (error) {
        nodeNotifier.notify(
          {
            title: "Speech Guru",
            message: "An error occured while converting the speech.",
            icon: path.join(__dirname, "icon.ico"),
            sound: true,
            wait: true,
            time: 5000,
          },
          (error, res) => {}
        );
      } else {
        nodeNotifier.notify(
          {
            title: "Speech Guru",
            message: `Done converting a speech has been recorded and the file name is '${
              String(file_name).split("/")[
                String(file_name).split("/").length - 1
              ]
            }'`,
            icon: path.join(__dirname, "icon.ico"),
            sound: true,
            wait: true,
            time: 5000,
          },
          (error, res) => {}
        );
      }
    });
  }
};
nodeNotifier.on("click", () => {
  nodeNotifier: null;
});

const file_name_play = "../static/cache/speech_audio1601039676388.mp3";
audi_src.attr("src", file_name_play);
const startPlay = () => {
  audio_tag.play();
  //  Check if the audio is still playing
  console.log(audio_tag.duration);
  setInterval(() => {
    if (!audio_tag.ended) {
      $("#music_name").text(
        String(file_name_play).split("/")[
          String(file_name_play).split("/").length - 1
        ]
      );
    } else {
      $("#music_name").text("Nothing is currently playing");
    }
    console.log(audio_tag.paused);
    console.log(audio_tag.ended);
    console.log(audio_tag.currentTime);
  }, 1000);
};

$("#clear").on("click", () => {
  ipc.send("clear");
  ipc.on("clear-response", (event, args) => {
    if (args.response === 0) {
      main_text.val("");
    } else {
      main_text.focus();
      electron.remote.getCurrentWindow().focus();
    }
  });
});
$("#backspace").click(() => {
  const __ = main_text.val();
  const __avl = String(__).substr(0, __.length - 1);
  main_text.val(__avl);
  main_text.focus();
});
$("#close").click(() => {
  ipc.send("closing-app");
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  menu.popup(remote.getCurrentWindow());
});
