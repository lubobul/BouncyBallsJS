var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

var EARTH_ACCELERATION = 200; //m/s  pixel = meter
var BOUNCY_FACTOR = 0.9;

var cHeight = canvas.height;
var cWidth = canvas.width;

class Ball{

    constructor(x, y, r, bouncyFactor, v_x, v_y, m){
        
        this.prev_x = 0;
        this.prev_y = 0;

        this.x = x;
        this.y = y;
        this.v_y = v_y;
        this.v_x = v_x;
        this.bouncyFactor = bouncyFactor;
        this.radius = r;
        this.mass = m;

    }

    update(i){

        drawCircle(this.x, this.y, this.radius);

        this.prev_x = this.x;
        this.prev_y = this.y;
        
        let delta_t = animationEngine.deltaTime;

        this.v_y += EARTH_ACCELERATION * delta_t;
        this.y += this.v_y * delta_t;
        this.x += this.v_x * delta_t;

        wallCollision(balls[i]);
        
        elasticCollision(i, balls);
    }
}

//reset collections
var balls = [];

//setup the engine
function setup(){
    animationEngine.start();

    let itterations = 10;
    let maxRadius = 15;
    let spacePerBall = cWidth / itterations;
    let ballX = 0;

    for(let i =1; i <= itterations; i++){

        let radius = random(2, maxRadius);

        balls.push(new Ball(ballX += spacePerBall , 100, radius, BOUNCY_FACTOR, randomNegativePositive(0, 300), 0, 1 * radius));
    }
}

//update is assigned to the animation engine, called ~ 1/60 sec
function update(){

    clearCanvas();
    
    for(let i =0; i< balls.length; i++){

        balls[i].update(i);
    }
}

setup();