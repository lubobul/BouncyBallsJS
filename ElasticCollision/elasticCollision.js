function wallCollision(ball){

    //floor
    if(ball.y >= cHeight - ball.radius){
        ball.v_y = -ball.v_y * ball.bouncyFactor;
        //force set away from colision
        ball.y = cHeight - ball.radius;

        ball.v_x = ball.v_x * ball.bouncyFactor;
    //ceiling
    }else if(ball.y <= ball.radius){

        ball.v_y = -ball.v_y * ball.bouncyFactor;
        ball.y = ball.radius + 1;
    }
    //left wall
    if(ball.x <= ball.radius ){

        ball.v_x = -ball.v_x * ball.bouncyFactor;
        ball.x = ball.radius + 1;
    
    //right wall
    }else if(ball.x >= cWidth - ball.radius){
        
        ball.v_x = -ball.v_x * ball.bouncyFactor;
        ball.x = cWidth - ball.radius - 1;
    }
}

function elasticCollision(i, balls){

    let b0 = balls[i];

    for(var j =0; j< balls.length; j++){
        
        //don't interact with self
        if(i != j){
        
            let b1 = balls[j];

            if(distance(b0.x, b0.y, b1.x, b1.y) < b0.radius + b1.radius){
                
                //here we take scalar size of velocities 
                let b0_v = scalarSize(b0.v_x, b0.v_y);
                let b1_v = scalarSize(b1.v_x, b1.v_y);

                //here we take angles of coordinates and velocities in order to obtain direction
                let phi = cartesianToPolar(b0.x - b1.x, b0.y - b1.y).t;
                let tetha0 = cartesianToPolar(b0.v_x, b0.v_y).t;
                let tetha1 = cartesianToPolar(b1.v_x, b1.v_y).t;

                //here we obtain new velocities based on elastic collision between moving object b0 and pseudo static object b1
                b0.v_x = ((b0_v * Math.cos(tetha0 - phi) * (b0.mass - b1.mass) + (2 * b1.mass * b1_v * Math.cos(tetha1 - phi) )) / (b0.mass + b1.mass) ) 
                                * Math.cos(phi) - b0_v*Math.sin(tetha0 - phi) * Math.sin(phi);
                                
                b0.v_y = ((b0_v * Math.cos(tetha0 - phi) * (b0.mass - b1.mass) + (2 * b1.mass * b1_v * Math.cos(tetha1 - phi) )) / (b0.mass + b1.mass) ) 
                                * Math.sin(phi) - b0_v*Math.sin(tetha0 - phi) * Math.cos(phi);

                //taking overlaped section of circles
                let intersection = (b0.radius + b1.radius) - distance(b0.x, b0.y, b1.x, b1.y);
                
                //taking the angle of movement before collision, dx and dy within dt
                let polarDistance = cartesianToPolar(b0.x - b0.prev_x, b0.y - b0.prev_y);
                //taking distance for x and y to impact, substracting 1 from the distance to make sure no secondary collision will be detected
                let x_y_to_collide = polarToCartesian(polarDistance.r - intersection - 1, polarDistance.t);

                //assigning true coordinates of collision (moment of "physical" impact)
                b0.x = b0.prev_x + x_y_to_collide.x;
                b0.y = b0.prev_y + x_y_to_collide.y;

                //taking angle of movement after impact
                let new_velocity_tetha = cartesianToPolar(b0.v_x, b0.v_y).t;
                //taking distance for x and y after impact
                let x_y_bounced = polarToCartesian(intersection, new_velocity_tetha);
                
                //assigning true coordinates after collision (distance the object has travelled after impact within dt 1 itteration)
                b0.x = b0.x + x_y_bounced.x;
                b0.y = b0.y + x_y_bounced.y;

                b0.v_x = b0.v_x * b0.bouncyFactor;
                b0.v_y = b0.v_y * b0.bouncyFactor;
            }
        }
    }
}