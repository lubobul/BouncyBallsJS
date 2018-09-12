var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

var EARTH_ACCELERATION = 200; //m/s  pixel = meter
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

    update(i){

        drawCircle(this.x, this.y, this.radius);

        this.prev_x = this.x;
        this.prev_y = this.y;
        
        let delta_t = animationEngine.deltaTime;

        this.v_y += EARTH_ACCELERATION * delta_t;
        this.y += this.v_y * delta_t;
        this.x += this.v_x * delta_t;

        collision(i);

    }
}

function collision(i){
    
    //current object
    let b0 = balls[i];
    /*copy of the current oject, it will be used to store all changes from impacting all other objects
    we want to keep v_x and v_y for the original object in order for the other objects to 
    interact with it in its original movement state*/
    let newBall = new Ball(b0.x, b0.y, b0.radius, b0.bouncyFactor, b0.v_x, b0.v_y, b0.mass);

    //floor
    if(newBall.y >= cHeight - newBall.radius){

        newBall.v_y = -newBall.v_y * newBall.bouncyFactor;
        //force set away from colision
        newBall.y = cHeight - newBall.radius;

        newBall.v_x = newBall.v_x * EARTH_FRICTION_FACTOR;
    //ceiling
    }else if(newBall.y <= newBall.radius){

        newBall.v_y = -newBall.v_y * newBall.bouncyFactor;
        newBall.y = newBall.radius + 1;
    }
    //left wall
    if(newBall.x <= newBall.radius ){

        newBall.v_x = -newBall.v_x * newBall.bouncyFactor;
        newBall.x = newBall.radius + 1;
    
    //right wall
    }else if(newBall.x >= cWidth - newBall.radius){
        
        newBall.v_x = -newBall.v_x * newBall.bouncyFactor;
        newBall.x = cWidth - newBall.radius - 1;
    }

    for(var j =0; j< balls.length; j++){
        
        //don't interact with self
        if(i != j){
        
            let b1 = balls[j];

            if(distance(b0.x, b0.y, b1.x, b1.y) <= b0.radius + b1.radius){
                
                //here we take scalar size of velocities 
                let b0_v = scalarSize(b0.v_x, b0.v_y);
                let b1_v = scalarSize(b1.v_x, b1.v_y);

                //here we take angles of coordinates and velocities in order to obtain direction
                let phi = cartesianToPolar(b0.x - b1.x, b0.y - b1.y).t;
                let tetha0 = cartesianToPolar(b0.v_x, b0.v_y).t;
                let tetha1 = cartesianToPolar(b1.v_x, b1.v_y).t;

                //here we obtain new velocities based on elastic collision between moving object b0 and pseudo static object b1
                newBall.v_x = ((b0_v * Math.cos(tetha0 - phi) * (b0.mass - b1.mass) + (2 * b1.mass * b1_v * Math.cos(tetha1 - phi) )) / (b0.mass + b1.mass) ) 
                                * Math.cos(phi) - b0_v*Math.sin(tetha0 - phi) * Math.sin(phi);
                                
                newBall.v_y = ((b0_v * Math.cos(tetha0 - phi) * (b0.mass - b1.mass) + (2 * b1.mass * b1_v * Math.cos(tetha1 - phi) )) / (b0.mass + b1.mass) ) 
                                * Math.sin(phi) - b0_v*Math.sin(tetha0 - phi) * Math.cos(phi);

                //taking overlaped section of circles
                let intersection = (b0.radius + b1.radius) - distance(b0.x, b0.y, b1.x, b1.y);
                
                //taking the angle of movement before collision, dx and dy within dt
                let polarDistance = cartesianToPolar(b0.x - b0.prev_x, b0.y - b0.prev_y);
                //taking distance for x and y to impact, substracting 1 from the distance to make sure no secondary collision will be detected
                let x_y_to_collide = polarToCartesian(polarDistance.r - intersection - 1, polarDistance.t);

                //assigning true coordinates of collision (moment of "physica" impact)
                newBall.x = b0.prev_x + x_y_to_collide.x;
                newBall.y = b0.prev_y + x_y_to_collide.y;
                b0.x = b0.prev_x + x_y_to_collide.x;
                b0.y = b0.prev_y + x_y_to_collide.y;

                //taking angle of movement after impact
                let new_velocity_tetha = cartesianToPolar(newBall.v_x, newBall.v_y).t;
                //taking distance for x and y after impact
                let x_y_bounced = polarToCartesian(intersection, new_velocity_tetha);
                
                //assigning true coordinates after collision (distance the object has travelled after impact within dt 1 itteration)
                newBall.x = newBall.x + x_y_bounced.x;
                newBall.y = newBall.y + x_y_bounced.y;
                b0.x = b0.x + x_y_bounced.x;;
                b0.y = b0.y + x_y_bounced.y;
            }
        }
    }

    
    
    //add new object to the new collection
    tmpBalls.push(newBall);
}

//reset collections
var balls = [];
var tmpBalls = [];

//setup the engine
function setup(){
    animationEngine.start();

    let maxRadius = 20;

    for(let i =1; i <= 15; i++){

        let radius = random(10, maxRadius);

        balls.push(new Ball(cWidth - (maxRadius*2)*i , 100, radius, 0.94, randomNegativePositive(0, 300), 0, 1));
    }
}

//update is assigned to the animation engine, called ~ 1/60 sec
function update(){

    clearCanvas();
    
    for(let i =0; i< balls.length; i++){

        balls[i].update(i);
    }

    balls = [];

    for(let i =0; i< tmpBalls.length; i++){

        balls.push(tmpBalls[i]);
    }

    tmpBalls = [];
}

setup();