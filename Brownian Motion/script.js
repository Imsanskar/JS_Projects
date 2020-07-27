const CANVAS_HEIGHT = window.innerHeight;
const CANVAS_WIDTH = window.innerWidth;

var canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT


function random(max, min){
    return Math.floor(Math.random() * (max - min) + min);
}


function Ball(posX, posY, velX, velY, r, color){
    this.position = {
        x:posX, 
        y:posY
    }

    this.velocity = {
        x:velX,
        y:velY
    } 
    this.r = r;
    this.mass = 4 / 3 * Math.PI * Math.pow(this.r, 3);
    this.color = color;

    
    //basic move
    this.move = function (dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    //draw
    this.draw = function () {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
    } 

    //equality comparison
    this.equals = function(ball){
        return(
            this.r == ball.r &&
            this.position.x == ball.position.x &&
            this.position.y == ball.position.y &&
            this.velocity.x == ball.velocity.x &&
            this.velocity.y == ball.velocity.y 
        )
    }


    //Collision
    this.bounceOff = function(ball){
        let dx = this.position.x - ball.position.x;
        let dy = this.position.y - ball.position.y;
        let distance = Math.sqrt(dx *dx + dy * dy)
        if((this.r + ball.r) > distance){
            let vaix = this.velocity.x;
            let vaiy = this.velocity.y;
            this.velocity.x = (vaix * (this.mass - ball.mass) + ball.velocity.x * 2 * ball.mass) / (this.mass + ball.mass);
            this.velocity.y = (vaiy * (this.mass - ball.mass) + ball.velocity.y * 2 * ball.mass) / (this.mass + ball.mass);
            
            ball.velocity.x = 2 * vaix * this.mass / (this.mass + ball.mass) - ball.velocity.x * (this.mass - ball.mass) / (this.mass + ball.mass);
            ball.velocity.y = 2 * vaiy * this.mass / (this.mass + ball.mass) - ball.velocity.y * (this.mass - ball.mass) / (this.mass + ball.mass);

        } 
    }

    this.bounceOfVerticalWall = function(){
        if (this.position.x + this.r >= CANVAS_WIDTH || this.position.x - this.r <= 0){
            this.velocity.x *= -1;
        }
    }

    this.bounceOfHorizontalWall = function () {
        if (this.position.y + this.r > CANVAS_HEIGHT || this.position.y - this.r <= 0) {
            this.velocity.y *= -1;
        }
    }
}


Ball.prototype.collisionDetect = function(ball){
    this.bounceOfHorizontalWall();
    this.bounceOfVerticalWall();
    if(ball != undefined){
        this.bounceOff(ball);
    }
}

let b = new Ball(300, 300, 0, 0, 40,'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')');
let b1 = new Ball(100, 300, 5, 2, 20, 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')');



function path(){
    max = 3;
    min = -3
    context.beginPath();
    context.strokeStyle = 'black'
    context.moveTo(b.position.x, b.position.y)
    b.velocity.x = (Math.random() * (max - min)  + min) * 2;
    b.velocity.y = (Math.random() * (max - min) + min) * 2;
    b.move(2);
    context.lineTo(b.position.x, b.position.y);
    context.stroke();
    context.closePath();
}



function bounce(){
    b.move(3);
    b1.move(3);
    b.draw();

    b1.collisionDetect(b);
    b.collisionDetect(b1)
}




balls = [];
for (let i = 0; i < 10; i++) {
    let color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')'
    balls[i] = new Ball(random(0, CANVAS_WIDTH), random(0, CANVAS_HEIGHT),5,5,20, color);
}



function test(){
    b.move(2);
    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
        balls[i].move(2);
        balls[i].collisionDetect(b);
        for (let j = i + 1; j < balls.length; j++){
            balls[i].bounceOff(balls[j]);
        }
        balls[i].draw();
    }

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
    }
    b.draw();
    b.collisionDetect();
}


setInterval(function(){
    test();
}, 20);
