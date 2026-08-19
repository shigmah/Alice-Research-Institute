export class Game {

    constructor() {

        this.canvas = null;
        this.context = null;

        this.isRunning = false;

    }

    initialize() {

        this.canvas = document.getElementById("gameCanvas");
        this.context = this.canvas.getContext("2d");

        this.resizeCanvas();

        window.addEventListener("resize", () => {
            this.resizeCanvas();
        });

        console.log("Game initialized.");

    }

    start() {

        this.initialize();

        this.isRunning = true;

        requestAnimationFrame(this.gameLoop.bind(this));

    }

    gameLoop() {

        if (!this.isRunning) {
            return;
        }

        this.update();
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));

    }

    update() {

    }

    render() {

        this.context.fillStyle = "#305080";
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    }

    resizeCanvas() {

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

    }

}