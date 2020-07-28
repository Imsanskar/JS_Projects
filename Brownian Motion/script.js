const CANVAS_HEIGHT = window.innerHeight;
const CANVAS_WIDTH = window.innerWidth;

var canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT


function random(max, min){
    return Math.floor(Math.random() * (max - min) + min);
}




function MinimunPriorityQueue(){
    this.pq = [null];
    this.n = 0;

    /* Minimum Priority Queue API */
    this.insert = function(key){
        this.heap.push(key);
        this.swim(++this.n);
    }

    this.viewMinimum = function(){
        if(this.n < 1){
            return null;
        }
        return heap[1];
    }

    this.delMin = function () {
        if (this.n < 1) {
            throw new Error('Called delMin() on empty MinPQ');
        }
        this.swap(1, this.n--);
        let deleted = this.heap.pop();
        this.sink(1);
        return deleted;
    };

    this.isEmpty = function(){
        return (this.n === 0);
    }

    // Heap helpers
    this.swim = function (k) {
        var j = Math.floor(k / 2);
        while (j > 0 && this.less(k, j)) {
            this.swap(j, k);
            k = j;
            j = Math.floor(k / 2);
        }
    };

    this.sink = function (k) {
        var j = 2 * k;
        while (j <= this.n) {
            if (j < this.n && this.less(j + 1, j)) { j++; }
            if (this.less(k, j)) { break; }
            this.swap(j, k);
            k = j;
            j = 2 * k;
        }
    };


    // Array compare and exchange
    this.less = function (i, j) {
        // Note: this is particular to the SimEvent object.
        return this.heap[i].time < this.heap[j].time;
    };
    this.swap = function (i, j) {
        var swap = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = swap;
    };
}



/*Ball class*/
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
    this.count = 0;

    
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

    //Collision prediction
    this.timeToHitVerticalWall = function () {
        if (this.velocity.x == 0) {
            return Number.POSITIVE_INFINITY;
        }
        if (this.velocity.x > 0) {
            return ((CANVAS_WIDTH - this.r - this.position.x) / this.velocity.x)
        }
        return ((this.r - this.position.x) / this.velocity.x);
    }

    this.timeToHitHorizontalWall = function () {
        if (this.velocity.y == 0) {
            return Number.POSITIVE_INFINITY;
        }
        if (this.velocity.y > 0) {
            return ((CANVAS_HEIGHT - this.r - this.position.y) / this.velocity.y)
        }
        return ((this.r - this.position.y) / this.velocity.y);
    }

    this.timeToHit = function(ball){
        if(this.equals(ball)){
            return Number.POSITIVE_INFINITY;
        }

    }


    //Collision resolution
    this.bounceOff = function (ball) {
        let dx = ball.position.x - this.position.x;
        let dy = ball.position.y - this.position.y;
        let R = (this.r + ball.r);
        let dvx = ball.velocity.x - this.velocity.x;
        let dvy = ball.velocity.y - this.velocity.y;
        let dpdv = dx * dvx + dy * dvy;
        let J = 2 * this.mass * ball.mass * dpdv / ((this.mass + ball.mass) * R);
        let Jx = J * dx / R;
        let Jy = J * dy / R;
        this.velocity.x += Jx / this.mass;
        this.velocity.y += Jy / this.mass;
        ball.velocity.x -= Jx / ball.mass;
        ball.velocity.y -= Jy / ball.mass;


        this.count++;
        ball.count++;
    }

    this.bounceOfVerticalWall = function(){
        this.velocity.x *= -1;
        this.count++;
    }

    this.bounceOfHorizontalWall = function () {
        this.velocity.y *= -1;
        this.count++;
    }
}


Ball.prototype.collisionDetect = function(ball){
    this.bounceOfHorizontalWall();
    this.bounceOfVerticalWall();
    if(ball != undefined){
        this.bounceOff(ball);
    }
}




// Neither a nor b null : particle - particle collision
// a not null and b null : collision between a and a vertical wall
// a null and b not null : collision between b and a horizontal wall
// Both a and b null : redraw event(draw all particles)

class Event{
    constructor(time, a, b){
        this.time = time;
        this.a = a;
        this.b = b;
        if(a != null){
            this.countA = a.count;
        }else{
            this.countA = -1;
        }

        if (b != null) {
            this.countB = b.count;
        } else {
            this.countB = -1;
        }
    }

    //Here event is a Event object
    compareTo(event){
        if(this.time < event.time){
            return -1;
        }
        else if(this.time > event.time){
            return 1;
        }
        return 0;
    }

    isValid() {
        if (a != null && a.count() != countA) {
            return false;
        }
        if (b != null && b.count() != countB) {
            return false;
        }
        return true;
    }
}


function CollisionSystem(balls){

    //balls checking
    if(balls == null){
        throw new Error('Collision System requires array of balls');
    }

    for(let i = 0; i < balls.length; i++){
        if(balls[i] == null){
            throw new Error('Invalid ball passed to Sim constructor');
        }
    }

    this.time = 0; // simulation clock time
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
    requestAnimationFrame(test);
}

test();
