var animationEngine = new AnimationEngine();

animationEngine.setAnimationFrameCallback(update);

// Get access to the camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

    // audio: false - since we only want video
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(function (stream) {
        setTimeout(setup, 2000);
        animationEngine.start();
        video.srcObject = stream;
    }, function(){
        alert("Camera not found!");
    });
}


//Declare some global vars
var motionColorThreshold = Math.pow(60, 2); //0-255
var oldImageData = null;
var imageData = null;

var EARTH_ACCELERATION = 400; //m/s  pixel = meter
var EARTH_FRICTION_FACTOR = 0.95;

var cHeight = canvas.height;
var cWidth = canvas.width;

var MOTION_MAX_VELOCITY = 300;
var BLOB_MIN_SIZE = 100;

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

    /**
     * Called once per frame, updates the crrent object based on dt
     * @param {*} engine 
     * @param {*} i 
     */
    update(engine, i){

        drawCircle(this.x, this.y, this.radius);

        this.prev_x = this.x;
        this.prev_y = this.y;

        //here we transfer velocity from motion in camera to ball
        if(distance(this.x, this.y, blob.x, blob.y) < 4 * this.radius && blob.prev_x + blob.prev_y > 0 && blob.x + blob.y > 0){

            let d_x = blob.x - blob.prev_x;
            let d_y = blob.y - blob.prev_y;

            blob.v_x = d_x / engine.deltaTime;
            blob.v_y = d_y / engine.deltaTime; 

            //clamping motion velocity  
            this.v_x += (min(Math.abs(blob.v_x), MOTION_MAX_VELOCITY) * Math.sign(blob.v_x));
            this.v_y += (min(Math.abs(blob.v_y), MOTION_MAX_VELOCITY) * Math.sign(blob.v_y));
            

            //Alternative - Use this for transfering velocity via elastic collision
            //let b0_v = scalarSize(this.v_x, this.v_y);
            //let b1_v = scalarSize(blob.v_x, blob.v_y);
            //let phi = cartesianToPolar(this.x - blob.x, this.y - blob.y).t;
            //let tetha0 = cartesianToPolar(this.v_x, this.v_y).t;
            //let tetha1 = cartesianToPolar(blob.v_x, blob.v_y).t;
            //
            //this.v_x = ( (b0_v * Math.cos(tetha0 - phi) * (this.mass - blob.mass) + (2 * blob.mass * b1_v * Math.cos(tetha1 - phi) )) / (this.mass + blob.mass) ) 
            //                * Math.cos(phi) - b0_v*Math.sin(tetha0 - phi) * Math.sin(phi);
            //                
            //this.v_y = ( (b0_v * Math.cos(tetha0 - phi) * (this.mass - blob.mass) + (2 * blob.mass * b1_v * Math.cos(tetha1 - phi) )) / (this.mass + blob.mass) )  
            //                * Math.sin(phi) - b0_v*Math.sin(tetha0 - phi) * Math.cos(phi);
        }

        this.v_y += EARTH_ACCELERATION * engine.deltaTime;
        this.y += this.v_y * engine.deltaTime;
        this.x += this.v_x * engine.deltaTime;

        //bottom
        if(this.y >= cHeight - this.radius){

            this.v_y = -this.v_y * this.bouncyFactor;
            //force set away from colision
            this.y = cHeight - this.radius;

            this.v_x = this.v_x * EARTH_FRICTION_FACTOR;
        
        //top
        }else if(this.y <= this.radius){

            this.v_y = -this.v_y * this.bouncyFactor;
            this.y = this.radius;
        }

        //left
        if(this.x <= this.radius ){

            this.v_x = -this.v_x * this.bouncyFactor;
            this.x = this.radius;

        //right
        }else if(this.x >= cWidth - this.radius){
            
            this.v_x = -this.v_x * this.bouncyFactor;
            this.x = cWidth - this.radius;
        }

        collision(i);

    }
}

/**
 * Detect collision 
 * @param {*} i
 */
function collision(i){
    
    let b0 = balls[i];
    let newBall = new Ball(b0.x, b0.y, b0.radius, b0.bouncyFactor, b0.v_x, b0.v_y, b0.mass);

    let outsideOfCollisionCounter = 0;

    for(var j =0; j< balls.length; j++){
        
        if(i != j){
        
            let b1 = balls[j];

            if(distance(b0.x, b0.y, b1.x, b1.y) <= b0.radius + b1.radius){
                
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
                b0.x = b0.prev_x;
                b0.y = b0.prev_y;
                                
            }

        }
    }
    
    tmpBalls.push(newBall);

}

var balls = [];
var tmpBalls = [];

/**
 * Setups the app
 */
function setup(){

    let maxRadius = 30;

    for(let i =1; i <= 10; i++){

        let radius = random(20, maxRadius);

        balls.push(new Ball(cWidth - (maxRadius*2)*i , cHeight - 100, radius, 0.8, randomNegativePositive(0, 300), 0, 1));
    }
}

/**
 * Give to AnimationEngine callback, called once per frame
 */
function update(){

    context.drawImage(video, 0, 0, cWidth, cHeight);

    //acquire bitmap
    var imageData = context.getImageData(0, 0, cWidth, cHeight);

    if(!oldImageData){
        
        oldImageData = imageData;
    }

    traverseBitmap(imageData.data, oldImageData.data);

    oldImageData = context.getImageData(0, 0, cWidth, cHeight);

     // Draw the ImageData at the given (x,y) coordinates.
    context.putImageData(imageData, 0, 0);
    
    for(let i =0; i< balls.length; i++){

        balls[i].update(this, i);
    }

    balls = [];

    for(let i =0; i< tmpBalls.length; i++){

        balls.push(tmpBalls[i]);
    }

    tmpBalls = [];
}

//Blob holding motion detection
var blob = new Ball(0,0,30,0,0,0,1);

/**
 * Traverse old vs new camera frame pixels and acquire delta
 * @param {*} pixels 
 * @param {*} oldPixels 
 */
function traverseBitmap(pixels, oldPixels) {

    let foundPixels = 0;
    
    blob.prev_x = blob.x;
    blob.prev_y = blob.y;

    blob.x = 0;
    blob.y = 0;

    //increment for loops with x/y += 4, because in bitmapt [0]-R, [1]-G, [2]-B, [3]-Alpha channel
    for (let x = 0; x < cWidth; x++) {
        for (let y = 0; y < cHeight; y++) {

            let pixIndex = (x + y * cWidth) *4; 
                
            let colorDistance = rgbDistance(
                pixels[pixIndex], 
                pixels[pixIndex +1], 
                pixels[pixIndex +2],

                oldPixels[pixIndex],
                oldPixels[pixIndex + 1],
                oldPixels[pixIndex + 2]);
                
            //check if tracked color is within the Threshold 
            if (colorDistance > motionColorThreshold) {
               
                //set tracked color to white (easier to see what's happening)
                pixels[pixIndex    ] = 255; // red
                pixels[pixIndex + 1] = 0; // green
                pixels[pixIndex + 2] = 0; // blue

                foundPixels++;
                blob.x += x;
                blob.y += y;

            }else{
                
                //set tracked color to white (easier to see what's happening)
                pixels[pixIndex    ] = 255; // red
                pixels[pixIndex + 1] = 255; // green
                pixels[pixIndex + 2] = 255; // blue
                
            }
        }
    }

    if(foundPixels > BLOB_MIN_SIZE){

        blob.x = (blob.x / foundPixels);
        blob.y = (blob.y / foundPixels);
    }

}
