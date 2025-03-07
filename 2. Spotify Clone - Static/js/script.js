console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`${folder}/`);
        let htmlText = await response.text();
        let div = document.createElement("div");
        div.innerHTML = htmlText;

        let anchors = div.getElementsByTagName("a");
        songs = [];

        for (let index = 0; index < anchors.length; index++) {
            const element = anchors[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split(`${folder}/`)[1]));
            }
        }
        // Show all the songs in the playlist
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div></div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div> </li>`;
        }
        // Attach event listeners to each song
        Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => playMusic(songs[index]));
        });
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
    return songs;
}
const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${track}`;
    console.log("Playing track:", currentSong.src);
    if (!pause) {
        currentSong.play().catch(err => console.error("Playback error:", err));
        document.querySelector("#play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbums() {
    try {
        let response = await fetch(`http://127.0.0.1:3000/project 3/songs/`);
        let htmlText = await response.text();
        let div = document.createElement("div");
        div.innerHTML = htmlText;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";
        for (const anchor of anchors) {
            if (anchor.href.includes("/songs") && !anchor.href.includes(".htaccess")) {
                let folder = anchor.href.split("/").slice(-2)[0];
                let metadataResponse = await fetch(`http://127.0.0.1:3000/project 3/songs/${folder}/info.json`);
                let metadata = await metadataResponse.json();
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/project 3/songs/${folder}/cover.jpg" alt="">
                        <h2>${metadata.title}</h2>
                        <p>${metadata.description}</p>
                    </div>`;
            }
        }
        // Attach event listeners to album cards
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                songs = await getSongs(`songs/${card.dataset.folder}`);
                playMusic(songs[0]);
            });
        });

    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}
async function main() {
    // Get the list of all the songs
    await getSongs("songs/");
    if (songs.length > 0) playMusic(songs[0], true);

    // Display all albums
    await displayAlbums();

    // Attach event listener to play/pause button
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "img/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "img/volume.svg";
        }
    });

    // Mute toggle
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.5; // Default volume
        }
    });
}

main();
