var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

var EARTH_ACCELERATION = 500; //m/s  pixel = meter
var EARTH_FRICTION_FACTOR = 0.95;

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

    update(engine, i){

        drawCircle(this.x, this.y, this.radius);

        this.prev_x = this.x;
        this.prev_y = this.y;

        this.v_y += EARTH_ACCELERATION * engine.deltaTime;
        this.y += this.v_y * engine.deltaTime;
        this.x += this.v_x * engine.deltaTime;

        if(this.y >= cHeight - this.radius){

            this.v_y = -this.v_y * this.bouncyFactor;
            //force set away from colision
            this.y = cHeight - this.radius;

            this.v_x = this.v_x * EARTH_FRICTION_FACTOR;

        }else if(this.y <= this.radius){

            this.v_y = -this.v_y * this.bouncyFactor;
            this.y = this.radius;
        }

        if(this.x <= this.radius ){

            this.v_x = -this.v_x * this.bouncyFactor;
            this.x = this.radius;
        
        }else if(this.x >= cWidth - this.radius){
            
            this.v_x = -this.v_x * this.bouncyFactor;
            this.x = cWidth - this.radius;
        }

        collision(i);

    }
}

function collision(i){
    
    let b0 = balls[i];
    let newBall = new Ball(b0.x, b0.y, b0.radius, b0.bouncyFactor, b0.v_x, b0.v_y, b0.mass);

    let outsideOfCollisionCounter = 0;

    for(var j =0; j< balls.length; j++){
        
        if(i != j){
        
            let b1 = balls[j];

            if(distance(b0.x, b0.y, b1.x, b1.y) <= b0.radius + b1.radius){

                newBall.inCollision = true;
                
                let b0_v = scalarSize(b0.v_x, b0.v_y);
                let b1_v = scalarSize(b1.v_x, b1.v_y);

                let phi = cartesianToPolar(b0.x - b1.x, b0.y - b1.y).t;
                let tetha0 = cartesianToPolar(b0.v_x, b0.v_y).t;
                let tetha1 = cartesianToPolar(b1.v_x, b1.v_y).t;

                newBall.v_x = ( (b0_v * Math.cos(tetha0 - phi) * (b0.mass - b1.mass) + (2 * b1.mass * b1_v * Math.cos(tetha1 - phi) )) / (b0.mass + b1.mass) ) 
                                * Math.cos(phi) - b0_v*Math.sin(tetha0 - phi) * Math.sin(phi);
                                
                newBall.v_y = ((b0_v * Math.cos(tetha0 - phi) * (b0.mass - b1.mass) + (2 * b1.mass * b1_v * Math.cos(tetha1 - phi) )) / (b0.mass + b1.mass) ) 
                                * Math.sin(phi) - b0_v*Math.sin(tetha0 - phi) * Math.cos(phi);
                
                newBall.x = b0.prev_x;
                newBall.y = b0.prev_y;
                                
            }

        }
    }
    
    tmpBalls.push(newBall);

}

var balls = [];
var tmpBalls = [];

function setup(){
    animationEngine.start();

    let maxRadius = 20;

    for(let i =1; i <= 20; i++){

        let radius = random(10, maxRadius);

        balls.push(new Ball(cWidth - (maxRadius*2)*i , 100, radius, 0.94, randomNegativePositive(0, 300), 0, 1));
    }
}


function update(){

    //clearCanvas();
    fillRect(0, 0, cWidth, cHeight);
    
    for(let i =0; i< balls.length; i++){

        balls[i].update(this, i);
    }

    balls = [];

    for(let i =0; i< tmpBalls.length; i++){

        balls.push(tmpBalls[i]);
    }

    tmpBalls = [];
}

setup();