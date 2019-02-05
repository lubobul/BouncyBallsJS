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

var MOTION_MAX_VELOCITY = 100;
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
     * @param {*} i 
     */
    update(i){

        drawCircle(this.x, this.y, this.radius);

        this.prev_x = this.x;
        this.prev_y = this.y;

        this.v_y += EARTH_ACCELERATION * animationEngine.deltaTime;
        this.y += this.v_y * animationEngine.deltaTime;
        this.x += this.v_x * animationEngine.deltaTime;
     
        wallCollision(balls[i]);
        
        elasticCollision(i, balls);

        blobCollision(balls[i]);
    }
}

/**
 * Detect collision 
 * @param {*} i
 */
function blobCollision(ball){

    //here we transfer velocity from motion in camera to ball
    if(distance(ball.x, ball.y, blob.x, blob.y) < ball.radius){

        let d_x = blob.x - blob.prev_x;
        let d_y = blob.y - blob.prev_y;
        
        blob.v_x = d_x / animationEngine.deltaTime;
        blob.v_y = d_y / animationEngine.deltaTime; 
        
        //clamping motion velocity  
        ball.v_x += (min(Math.abs(blob.v_x), MOTION_MAX_VELOCITY) * Math.sign(blob.v_x));
        ball.v_y += (min(Math.abs(blob.v_y), MOTION_MAX_VELOCITY) * Math.sign(blob.v_y));
        
    }
}

var balls = [];

/**
 * Setups the app
 */
function setup(){
    animationEngine.start();

    let itterations = 5;
    let maxRadius = 25;
    let spacePerBall = cWidth / itterations;
    let ballX = 0;

    for(let i =1; i <= itterations; i++){

        let radius = random(15, maxRadius);

        balls.push(new Ball(ballX += spacePerBall , 100, radius, 0.9, randomNegativePositive(0, 300), 0, 1 * radius));
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

        balls[i].update(i);
    }
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
