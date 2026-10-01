/* =====================================================
   AKUARIUM BOCOR
   GAME JAVASCRIPT
===================================================== */


/* =====================================================
   ELEMENT
===================================================== */

const water = document.getElementById("water");
const waterText = document.getElementById("waterText");

const timeText = document.getElementById("timeText");

const aquarium = document.getElementById("aquarium");

const leakPoint = document.getElementById("leakPoint");
const waterJet = document.getElementById("waterJet");

const hand = document.getElementById("hand");

const fish = document.getElementById("fish");
const fishOutside = document.getElementById("fishOutside");

const cat = document.getElementById("cat");

const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");

const restartButton = document.getElementById("restartButton");


/* =====================================================
   GAME VARIABLES
===================================================== */

let waterLevel = 100;

let totalSeconds = 300;

let gameRunning = true;

let leakActive = true;

let leakTimer = null;

let gameTimer = null;

let leakCountdown = null;

let fishEscaped = false;

let catSequenceStarted = false;


/* =====================================================
   AUDIO
===================================================== */

let audioContext = null;

function initAudio() {

    if (!audioContext) {

        try {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        } catch (error) {

            console.log("Audio tidak tersedia.");

        }
    }

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {

        audioContext.resume();

    }
}


function playBeep(
    frequency = 500,
    duration = 0.1,
    type = "sine"
) {

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
        0.08,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


/* =====================================================
   FORMAT WAKTU
===================================================== */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(secs).padStart(2, "0")
    );
}


/* =====================================================
   UPDATE TIMER
===================================================== */

function updateTimer() {

    if (!gameRunning) return;

    timeText.textContent =
        formatTime(totalSeconds);

}


/* =====================================================
   GAME TIMER
===================================================== */

function startGameTimer() {

    clearInterval(gameTimer);

    gameTimer = setInterval(() => {

        if (!gameRunning) return;

        totalSeconds--;

        updateTimer();


        /* =========================================
           MENANG
        ========================================= */

        if (totalSeconds <= 0) {

            if (waterLevel > 40) {

                winGame();

            } else {

                loseGame(
                    "Waktu habis dan air akuarium terlalu sedikit."
                );

            }

        }

    }, 1000);
}


/* =====================================================
   UPDATE AIR
===================================================== */

function updateWater() {

    waterText.textContent =
        waterLevel + "%";

    water.style.height =
        waterLevel + "%";


    /* Warna indikator */

    if (waterLevel <= 50) {

        waterText.style.color = "#ffcc00";

    }

    if (waterLevel <= 30) {

        waterText.style.color = "#ff4d4d";

    }

}


/* =====================================================
   RANDOM POSISI KEBOCORAN
===================================================== */

function moveLeakPoint() {

    const aquariumWidth =
        aquarium.clientWidth;

    const aquariumHeight =
        aquarium.clientHeight;


    /*
       Titik bocor hanya muncul
       di bagian sekitar permukaan air
    */

    const x =
        40 +
        Math.random() *
        (aquariumWidth - 80);


    const y =
        70 +
        Math.random() *
        Math.max(
            50,
            aquariumHeight * 0.45
        );


    leakPoint.style.left =
        x + "px";

    leakPoint.style.top =
        y + "px";


    /* Semburan mengikuti titik */

    waterJet.style.left =
        (x - 35) + "px";

    waterJet.style.top =
        (y + 25) + "px";


    /* Tangan mengikuti titik */

    hand.style.left =
        (x - 15) + "px";

    hand.style.top =
        (y - 15) + "px";

}


/* =====================================================
   MULAI KEBOCORAN
===================================================== */

function startLeak() {

    if (!gameRunning) return;

    leakActive = true;

    leakPoint.style.display =
        "block";

    waterJet.style.display =
        "block";

    moveLeakPoint();

}


/* =====================================================
   AIR BERKURANG
===================================================== */

function reduceWater() {

    if (!gameRunning) return;

    if (!leakActive) return;


    waterLevel -= 5;


    if (waterLevel < 0) {

        waterLevel = 0;

    }


    updateWater();


    playBeep(
        250,
        0.08,
        "sawtooth"
    );


    /* =========================================
       IKAN KELUAR
    ========================================= */

    if (
        waterLevel <= 30 &&
        !fishEscaped
    ) {

        fishEscape();

    }


    /* =========================================
       AIR HABIS
    ========================================= */

    if (waterLevel <= 0) {

        loseGame(
            "Air akuarium habis!"
        );

    }

}


/* =====================================================
   LOOP KEBOCORAN
===================================================== */

function startLeakLoop() {

    clearInterval(leakTimer);

    leakTimer = setInterval(() => {

        if (!gameRunning) return;

        if (leakActive) {

            reduceWater();

        }

    }, 1800);

}


/* =====================================================
   TUTUP KEBOCORAN
===================================================== */

function closeLeak() {

    if (!gameRunning) return;

    if (!leakActive) return;


    initAudio();


    leakActive = false;


    /* hentikan semburan */

    waterJet.style.display =
        "none";


    /* tampilkan tangan */

    hand.style.display =
        "block";


    playBeep(
        700,
        0.12,
        "sine"
    );


    /*
       Setelah 2 detik
       bocor di tempat lain
    */

    clearTimeout(leakCountdown);

    leakCountdown = setTimeout(() => {

        if (!gameRunning) return;

        hand.style.display =
            "none";

        moveLeakPoint();

        startLeak();

    }, 2000);

}


/* =====================================================
   EVENT TITIK BOcor
===================================================== */

leakPoint.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();

        closeLeak();

    }
);


/* =====================================================
   IKAN KELUAR
===================================================== */

function fishEscape() {

    if (fishEscaped) return;

    fishEscaped = true;

    leakActive = false;


    waterJet.style.display =
        "none";

    leakPoint.style.display =
        "none";


    /* Ikan mulai melompat */

    fish.style.animation =
        "none";


    fish.style.transition =
        "all 1.5s cubic-bezier(.2,.8,.3,1)";


    fish.style.transform =
        "translate(-50%, -50%) translateY(-260px) rotate(-25deg)";


    playBeep(
        900,
        0.15,
        "triangle"
    );


    setTimeout(() => {

        fish.style.display =
            "none";

        startFishOutsideAnimation();

    }, 1300);

}


/* =====================================================
   IKAN DI LANTAI
===================================================== */

function startFishOutsideAnimation() {

    fishOutside.style.opacity =
        "1";


    fishOutside.style.left =
        "48%";

    fishOutside.style.top =
        "80%";


    fishOutside.style.animation =
        "fishJump 1s ease-in-out 3";


    /*
       Tambahkan animasi secara dinamis
    */

    if (
        !document.getElementById(
            "fishJumpStyle"
        )
    ) {

        const style =
            document.createElement("style");

        style.id =
            "fishJumpStyle";

        style.textContent = `

            @keyframes fishJump {

                0% {
                    transform:
                        translate(-50%, -50%)
                        translateY(0)
                        rotate(0deg);
                }

                50% {
                    transform:
                        translate(-50%, -50%)
                        translateY(-80px)
                        rotate(25deg);
                }

                100% {
                    transform:
                        translate(-50%, -50%)
                        translateY(0)
                        rotate(-15deg);
                }

            }

        `;

        document.head.appendChild(style);

    }


    playBeep(
        650,
        0.15,
        "triangle"
    );


    /*
       Setelah ikan melompat,
       kucing datang
    */

    setTimeout(() => {

        startCatSequence();

    }, 3500);

}


/* =====================================================
   KUCING MUNCUL
===================================================== */

function startCatSequence() {

    if (catSequenceStarted) return;

    catSequenceStarted = true;


    cat.style.opacity =
        "1";


    cat.style.transition =
        "right 3s cubic-bezier(.2,.8,.3,1)";


    /*
       Kucing bergerak dari kanan
       menuju ikan
    */

    cat.style.right =
        "25%";


    playBeep(
        300,
        0.12,
        "sine"
    );


    /*
       Setelah sampai
    */

    setTimeout(() => {

        catHoldFish();

    }, 3200);

}


/* =====================================================
   KUCING MEMEGANG IKAN
===================================================== */

function catHoldFish() {

    fishOutside.style.transition =
        "all 0.8s ease";


    fishOutside.style.left =
        "68%";

    fishOutside.style.top =
        "65%";


    /*
       Gerakan kaki kucing
    */

    cat.classList.add(
        "holding"
    );


    /*
       Kucing membuka mulut
       setelah memegang ikan
    */

    setTimeout(() => {

        catEatFish();

    }, 1500);

}


/* =====================================================
   KUCING MAKAN IKAN
===================================================== */

function catEatFish() {

    cat.classList.add(
        "eating"
    );


    playBeep(
        150,
        0.2,
        "square"
    );


    /*
       Ikan masuk ke mulut
    */

    fishOutside.style.transition =
        "all 1s ease";


    fishOutside.style.transform =
        "translate(-50%, -50%) scale(0.2)";


    fishOutside.style.opacity =
        "0";


    setTimeout(() => {

        loseGame(
            "Ikan dimakan kucing!"
        );

    }, 1200);

}


/* =====================================================
   MENANG
===================================================== */

function winGame() {

    if (!gameRunning) return;

    gameRunning = false;


    clearInterval(gameTimer);

    clearInterval(leakTimer);

    clearTimeout(leakCountdown);


    leakActive = false;


    leakPoint.style.display =
        "none";

    waterJet.style.display =
        "none";

    hand.style.display =
        "none";


    message.style.display =
        "flex";


    messageTitle.textContent =
        "YOU WIN!";

    messageTitle.style.color =
        "#00a86b";


    messageText.textContent =
        "Hebat! Kamu berhasil menjaga air akuarium selama 5 menit.";

    playBeep(
        900,
        0.15,
        "sine"
    );

    setTimeout(() => {

        playBeep(
            1200,
            0.2,
            "sine"
        );

    }, 180);

}


/* =====================================================
   KALAH
===================================================== */

function loseGame(reason) {

    if (!gameRunning) return;

    gameRunning = false;


    clearInterval(gameTimer);

    clearInterval(leakTimer);

    clearTimeout(leakCountdown);


    leakActive = false;


    leakPoint.style.display =
        "none";

    waterJet.style.display =
        "none";


    message.style.display =
        "flex";


    messageTitle.textContent =
        "YOU LOSE!";

    messageTitle.style.color =
        "#e53935";


    messageText.textContent =
        reason;


    playBeep(
        180,
        0.35,
        "sawtooth"
    );

}


/* =====================================================
   RESTART
===================================================== */

restartButton.addEventListener(
    "click",
    function() {

        initAudio();

        restartGame();

    }
);


/* =====================================================
   RESET GAME
===================================================== */

function restartGame() {

    /* Timer */

    totalSeconds = 300;


    /* Air */

    waterLevel = 100;


    /* Status */

    gameRunning = true;

    leakActive = true;

    fishEscaped = false;

    catSequenceStarted = false;


    /* Reset tampilan */

    updateWater();

    updateTimer();


    message.style.display =
        "none";


    /* Ikan di akuarium */

    fish.style.display =
        "block";

    fish.style.transition =
        "none";

    fish.style.transform =
        "translate(-50%, -50%)";


    fish.style.animation =
        "fishSwim 4s ease-in-out infinite";


    /* Ikan luar */

    fishOutside.style.opacity =
        "0";

    fishOutside.style.transform =
        "translate(-50%, -50%)";


    /* Kucing */

    cat.style.opacity =
        "0";

    cat.style.right =
        "-260px";

    cat.classList.remove(
        "eating"
    );

    cat.classList.remove(
        "holding"
    );


    /* Tangan */

    hand.style.display =
        "none";


    /* Leak */

    startLeak();


    startLeakLoop();


    startGameTimer();

}


/* =====================================================
   START GAME
===================================================== */

function startGame() {

    updateWater();

    updateTimer();

    moveLeakPoint();

    startLeak();

    startLeakLoop();

    startGameTimer();

}


/* =====================================================
   RESPONSIVE
===================================================== */

window.addEventListener(
    "resize",
    function() {

        if (gameRunning) {

            moveLeakPoint();

        }

    }
);


/* =====================================================
   MULAI
===================================================== */

startGame();