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

        detectFloorCollision(balls[i]);
    }
}

function detectFloorCollision(ball){

    if(ball.x > limFloorXMin && ball.x < limFloorXMax){

        let dist = Math.abs(ball.y - floorFunction(ball.x, limFloorYMin));

        if(dist <= ball.radius){
            
            let tetha = cartesianToPolar(limFloorXMax - limFloorXMin, limFloorYMax - limFloorYMin).t;

            let n_x = -Math.sin(tetha);
            let n_y = Math.cos(tetha);
            
            let dot = ball.v_x * n_x + ball.v_y * n_y;

            ball.v_x = (ball.v_x - 2 * dot * n_x);
            ball.v_y = (ball.v_y - 2 * dot * n_y);

            //avoid falling through floor
            let intersection = ball.radius - dist;

            //taking the angle of movement before collision, dx and dy within dt
            let polarDistance = cartesianToPolar(ball.x - ball.prev_x, ball.y - ball.prev_y);
            //taking distance for x and y to impact, substracting 1 from the distance to make sure no secondary collision will be detected
            let x_y_to_collide = polarToCartesian(polarDistance.r - intersection - 1, polarDistance.t);

            ball.x = ball.prev_x + x_y_to_collide.x;
            ball.y = ball.prev_y + x_y_to_collide.y;
 
            //taking angle of movement after impact
            let new_velocity_tetha = cartesianToPolar(ball.v_x, ball.v_y).t;
            //taking distance for x and y after impact
            let x_y_bounced = polarToCartesian(intersection, new_velocity_tetha);
            
            //assigning true coordinates after collision (distance the object has travelled after impact within dt 1 itteration)
            ball.x = ball.x + x_y_bounced.x;
            ball.y = ball.y + x_y_bounced.y;

            //ball.v_x = ball.v_x * ball.bouncyFactor;
            //ball.v_y = ball.v_y * ball.bouncyFactor;

        }
    }
}

function floorFunction(x, a){

    return 0.1 * x + a;
}

var limFloorXMin = 0;
var limFloorXMax = 0;
var limFloorYMin = 0;
var limFloorYMax = 0;

function drawFloor(xStart, yStart, length){

    limFloorXMin = xStart;
    limFloorYMin = yStart;

    let x0 = xStart;
    let y0 = floorFunction(x0, yStart);;

    for(let x = 1; x < length; x++){

        let x1 = x + xStart;
        let y1 = floorFunction(x1, yStart);
        
        drawLine(x0 , y0, x1 , y1);

        x0 = x1;
        y0 = y1;     
    }

    limFloorXMax = x0;
    limFloorYMax = y0;
}

function mouseClicked(){
    
    console.log(this);
}

//reset collections
var balls = [];

//setup the engine
function setup(){

    setLeftClickCallback(mouseClicked);

    animationEngine.start();

    let numberOfBalls = 5;
    let maxRadius = 20;
    let minRadius = 10;
    let spacePerBall = cWidth / numberOfBalls;
    let ballX = 0;

    for(let i =1; i <= numberOfBalls; i++){

        let radius = random(minRadius, maxRadius);

        balls.push(new Ball(ballX += spacePerBall , 100, radius, BOUNCY_FACTOR, randomNegativePositive(0, 300), 0, 1 * radius));
    }
}

//update is assigned to the animation engine, called ~ 1/60 sec
function update(){

    clearCanvas();

    drawFloor(200, 350, 200);
    
    for(let i =0; i< balls.length; i++){

        balls[i].update(i);
    }
}

setup();