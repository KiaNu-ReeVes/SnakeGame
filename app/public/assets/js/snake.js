const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let scale = 20;

let rows = canvas.height / scale;
let columns = canvas.width / scale;

let snake;
let fruit;
let score = 0;

(function setup() {
    snake = new Snake();
    fruit = new Fruit();
    fruit.pickLocation();

    canvas.style.border = '1px solid black';

    window.setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fruit.draw();
        snake.update();
        snake.draw();

        if (snake.eat(fruit)) {
            fruit.pickLocation();
            score++;
        }
        snake.checkCollision();
    }, 1000 / (20 * (score+1)));
})();

window.addEventListener('keydown', ((evt) => {
    if (evt.keyCode === 32) {
        alert('Game Paused');
    }

    const direction = evt.key.replace('Arrow', '');
    snake.changeDirection(direction);
}));

$('[name="button"]').on('click', function() {
    if (this.role === "restart") {
        score = 0;
        snake = new Snake();
    }
    if (this.role === "pause") {
        alert('Game Paused');
    }
    if (this.role === "link") {
        window.location.href = this.url
    }
});
$('[name="button_arows"]').on('click', function() {
    if (this.role) {
        snake.changeDirection(Captalize(this.role));
    }
});

function Captalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function Fruit() {
    this.x;
    this.y;

    this.pickLocation = function() {
        this.x = (Math.floor(Math.random() * columns - 1) + 1) * scale;
        this.y = (Math.floor(Math.random() * rows - 1) + 1) * scale;
    };

    this.draw = function() {
        ctx.fillStyle = '#e66916';
        ctx.beginPath();
        ctx.arc(this.x + scale / 2, this.y + scale / 2, scale / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x + scale / 2 - 1, this.y - 7, 2, scale / 2);
    };
}

function Snake() {
    this.x = 0;
    this.y = 0;

    this.xSpeed = scale;
    this.ySpeed = 0;

    this.total = 0;
    this.tail = [];

    this.draw = function() {
        ctx.fillStyle = '#171717'; // تغییر رنگ سر مار
        for (let i = 0; i < this.tail.length; i++) {
            ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
        }
        ctx.fillStyle = '#ff5d5d';
        ctx.fillRect(this.x, this.y, scale, scale);

        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, 10, 20);
    };

    this.update = function() {
        for (let i = 0; i < this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1];
        }
        if (this.total > 0) {
            this.tail[this.total - 1] = { x: this.x, y: this.y };
        }

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.x >= canvas.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = canvas.width - scale;
        }

        if (this.y >= canvas.height) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = canvas.height - scale;
        }
    };

    this.changeDirection = function(direction) {
        switch (direction) {
            case 'Up':
                if (this.ySpeed !== scale) {
                    this.xSpeed = 0;
                    this.ySpeed = -scale;
                }
                break;
            case 'Down':
                if (this.ySpeed !== -scale) {
                    this.xSpeed = 0;
                    this.ySpeed = scale;
                }
                break;
            case 'Left':
                if (this.xSpeed !== scale) {
                    this.xSpeed = -scale;
                    this.ySpeed = 0;
                }
                break;
            case 'Right':
                if (this.xSpeed !== -scale) {
                    this.xSpeed = scale;
                    this.ySpeed = 0;
                }
                break;
        }
    };

    this.eat = function(fruit) {
        if (this.x === fruit.x && this.y === fruit.y) {
            this.total++;
            return true;
        }
        return false;
    };

    this.checkCollision = function() {
        for (let i = 0; i < this.tail.length; i++) {
            if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                $.post('/api/auth/sethigh', {score: score}).done(function(res){
                    alert(res.message)
                });
                this.total = 0;
                score = 0;
                this.tail = [];
            }
        }
    };
}
