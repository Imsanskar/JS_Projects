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
    this.heap = [null];
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
        return this.heap[1];
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
        // this is particular to the SimEvent object.
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
    }

    //draw
    this.draw = function () {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
        context.fill();
        // context.closePath();
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
        if (this.velocity.x === 0) {
            return Number.POSITIVE_INFINITY;
        }
        if (this.velocity.x > 0) {
            return ((CANVAS_WIDTH - this.r - this.position.x) / this.velocity.x)
        }
        return ((this.r - this.position.x) / this.velocity.x);
    }

    this.timeToHitHorizontalWall = function () {
        if (this.velocity.y === 0) {
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
        let dx = ball.position.x - this.position.x;
        let dy = ball.position.y - this.position.y;
        let dvx = ball.velocity.x - this.velocity.x;
        let dvy = ball.velocity.y - this.velocity.y;

        let dpdv = dx * dvx + dy * dvy;

        if (dpdv > 0) { return Number.POSITIVE_INFINITY; }

        let dvdv = dvx*dvx + dvy*dvy;
        let dpdp = dx*dx + dy*dy

        let R = ball.r + this.r;

        let D = dpdv * dpdv - dvdv * (dpdp - R * R);
        if (D <= 0) { return Number.POSITIVE_INFINITY; };
        return (-(dpdv + Math.sqrt(D)) / dvdv);        
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

    this.bounceOffVerticalWall = function(){
        this.velocity.x *= -1;
        this.count++;
    }

    this.bounceOffHorizontalWall = function () {
        this.velocity.y *= -1;
        this.count++;
    }
}






// Neither a nor b null : particle - particle collision
// a not null and b null : collision between a and a horizontal wall
// a null and b not null : collision between b and a vertical wall
class SimulationEvent{
    constructor(time, a, b){
        this.time = time;// Create a new event to occur at time t involving a and b.
        this.a = a;
        this.b = b;

        if (a != null) this.countA = a.count;
        else this.countA = -1;
        if (b != null) this.countB = b.count;
        else this.countB = -1;
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

    isValid(simTime) {
        // if (this.a != null && this.a.count != this.countA) {
        //     return false;
        // }
        // if (this.b != null && this.b.count != this.countB) {
        //     return false;
        // }
        // return true;

        if (this.time < simTime) {
            return false;
        }
        if (this.a === null) { 
            return this.time.toFixed(4) == (simTime + this.b.timeToHitVerticalWall()).toFixed(4);
        } else if (this.b === null) {
            return this.time.toFixed(4) == (simTime + this.a.timeToHitHorizontalWall()).toFixed(4);
        } else {
            return this.time.toFixed(4) == (simTime + this.a.timeToHit(b)).toFixed(4);
        }
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
    this.balls = balls;//Array of balls
    this.priorityQueue = new MinimunPriorityQueue();//Priority Queue

    //predicts the collision of the ball
    this.predictAll = function(ball){
        if(ball == null){
            return ;
        }
        var dt;
        for(let i =0; i < balls.length; i++){
            dt = ball.timeToHit(balls[i]);
            if (!isFinite(dt) || dt <= 0) { 
                continue; 
            }
            this.priorityQueue.insert(new SimulationEvent(this.time + dt, balls, balls[i]));
        }

        //Vertical wall
        dt = ball.timeToHitVerticalWall();
        if (isFinite(dt) && dt > 0) {
            this.priorityQueue.insert(new SimulationEvent(this.time + dt, ball, null, ball))
        }

        //Horizontal wall
        dt = ball.timeToHitHorizontalWall();
        if (isFinite(dt) && dt > 0) {
            this.priorityQueue.insert(new SimulationEvent(this.time, ball, null))
        }
    }

    this.predictBalls = function(ball){
        if(ball == null){
            return ;
        }
        for (let i = 0; i < this.balls.length; i++) {
            dt = ball.timeToHit(balls[i]);
            if (!isFinite(dt) || dt <= 0) { continue; }
            this.priorityQueue.insert(new SimulationEvent(this.time + dt, ball, balls[i]));
        }
    }

    this.predictVerticalWall = function(ball){
        if(ball == null){
            return ;
        }
        dt = ball.timeToHitVerticalWall();
        if(isFinite(dt) && dt > 0){
            this.priorityQueue.insert(new SimulationEvent(this.time + dt, ball, null, ball))
        }
    }


    this.predictHorizontalWall = function (ball) {
        if (ball == null) {
            return;
        }
        dt = ball.timeToHitHorizontalWall();
        if (isFinite(dt) && dt > 0) {
            this.priorityQueue.insert(new SimulationEvent(this.time + dt,ball,null))
        }
    }

    for (let i = 0; i < this.balls.length; i++) {
        this.predictAll(this.balls[i]);
    }


    //redraw the screen
    this.redraw = function () {
        // context.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.balls.length; i++) {
            balls[i].draw();
        }
    }


    //simulation function
    this.simulate = function(dt){
        var log = 'Start time:' + this.time + '\n';
        let end = this.time + dt;
        let increment;
        var event;
        while(!this.priorityQueue.isEmpty()){
            event = this.priorityQueue.viewMinimum();
            this.priorityQueue.delMin();

            if(event.time >= end){
                break;
            }

            if(!event.isValid(this.time)){
                continue;
            }

            let a = event.a;
            let b = event.b;
            // physical collision, so update positions, and then simulation clock
            increment = event.time - this.time;
            for (let i = 0; i < this.balls[i].length; i++){
                this.balls[i].move(increment);
            }
            this.time = event.time;

            //process events
            if(a != null && b != null){
                console.log('Ball ball;')
                log += 'Bounced of a ball\n';
                a.bounceOff(b);
                this.predictAll(a);
                this.predictAll(b);
            }
            else if (a == null && b != null) {
                log += 'Bounced of vertical wall\n';
                b.bounceOffVerticalWall();
                this.predictVerticalWall(b);
                this.predictBalls(b);
            }
            else if (a != null && b == null) {
                log += 'Bounced off Horizontal wall\n';
                a.bounceOffHorizontalWall();
                this.predictHorizontalWall(a);
                this.predictBalls(a);   
            }

            increment = end - this.time;
            for (let i = 0; i < this.balls.length; i++) {
                this.balls[i].move(increment);
            }
            this.time = end;

            console.log(log);
        }
    }
}




function path(b){
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







balls = [];
for (let i = 0; i < 10; i++) {
    let color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')'
    balls[i] = new Ball(random(0, CANVAS_WIDTH), random(0, CANVAS_HEIGHT),5,5,20, color);
}

// let color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')'
// balls.push(new Ball(100,100,5,5,20,'red'));

// balls[0].draw();

function test(){
    let simulation = new CollisionSystem(balls);
    simulation.redraw();
    simulation.simulate(10000);
    // requestAnimationFrame(test);
}

test();
