/**
 * Creates global requestAnimFrame var assigned to a function accepting the callback
 */
window.requestAnimFrame = (function (callback) {
    return  window.requestAnimationFrame        ||
            window.webkitRequestAnimationFrame  ||
            window.mozRequestAnimationFrame     || 
            window.oRequestAnimationFrame       || 
            window.msRequestAnimationFrame      ||

    //a fallback primitive function if none of the above are defined    
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * AnimationEngine's Constructor
 */
class AnimationEngine 
{
    constructor()
    {
        this.animationFrameCallback = null;
        
        this.previousTimeLog = null;
        this.isRunning = true;
        this.fps = 0;
        this.deltaTime = 0;
    }

    /**
     * Used to assign an animation frame callback method. Usually used for re-rendering changes between frames.
     * @param {*} callback 
     */
    setAnimationFrameCallback(callback)
    {
        this.animationFrameCallback = callback;
    }

    /**
     * Starts the animation engine
     */
    start()
    {
        this.isRunning = true;
        this.animate();
    }

    /**
     * Stops the animation engine
     */
    stop()
    {
        this.isRunning = false;
    }

    /**
     * Main function
     */
    animate()
    {
        if (!this.previousTimeLog) 
        {
            this.previousTimeLog = new Date().getTime();

            window.requestAnimFrame(()=>{
                this.animate();  
            });

            return;
        }

        //calculate dt in seconds
        this.deltaTime = (new Date().getTime() - this.previousTimeLog) / 1000;

        this.previousTimeLog = new Date().getTime();

        //calculate fps
        this.fps = 1 / this.deltaTime;

        this.animationFrameCallback.call(this);

        if (this.isRunning) 
        {
            window.requestAnimFrame(()=>{
                this.animate();  
            });
        }
    }
}