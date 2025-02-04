import { Dust, Fire, Splash } from './particles.js'

const states = {
    SITTING: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3,
    ROLLING: 4,
    DIVING: 5,
    HIT: 6

}

class State {
    constructor(state, game){
        this.state = state;
        this.game = game;

    }
}

export class Sitting extends State {
    constructor(game){
        super('SITTING', game);
    }
    //control animations
    enter(){
        this.game.player.frameX = 0
        this.game.player.maxFrame = 4
        this.game.player.frameY = 5
    }
    handleInput(input){
        if ((input.includes('ArrowLeft') || input.includes('ArrowRight') || input.includes('move left') || input.includes('move right')) 
            && !(input.includes('ArrowDown') || input.includes('swipe down'))) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (input.includes('Enter') || input.includes('double tap')) {
            this.game.player.setState(states.ROLLING, 2);
        } else if ((input.includes('swipe up') || input.includes('ArrowUp')) && this.game.player.onGround()){
            this.game.player.setState(states.JUMPING, 1);

            // this.game.player.vy -=27;
        }
    }
}
export class Running extends State {
    constructor(game){
        super('RUNNING', game);
    }
    enter(){
        this.game.player.frameX = 0
        this.game.player.maxFrame = 8
        this.game.player.frameY = 3
    }
    handleInput(input){
        this.game.particles.unshift(new Dust(this.game, this.game.player.x + this.game.player.width *0.5, this.game.player.y+ this.game.player.height));
        if (input.includes('ArrowDown') || input.includes('swipe down')) {
            this.game.player.setState(states.SITTING, 0);
        } else if (input.includes('ArrowUp') || input.includes('swipe up')) {
            this.game.player.setState(states.JUMPING, 1);
        } else if ((input.includes('Enter') || input.includes('double tap')) && this.game.player.energy > 0) {
            this.game.player.setState(states.ROLLING, 2);
        }
    }
    
}
export class Jumping extends State {
    constructor(game){
        super('JUMPING', game);
    }
    enter(){
        this.game.player.jumping = true;  // The player is now in the process of jumping
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 1;
    }
    handleInput(input){
        if (this.game.player.jumping && (input.includes('ArrowUp') || input.includes('swipe up')) && 
            this.game.player.y > 250) {  // This is 50px from the top of the screen
            // The player is still holding the jump button and hasn't reached the maximum jump height, so continue the jump
            this.game.player.vy -= 3;
            if (!this.game.player.jumpSoundPlayed) {
                this.game.player.soundController.playSound('roll');
                this.game.player.jumpSoundPlayed = true;
            }
        } else {
            // The player has released the jump button or reached the maximum jump height, so stop the jump
            this.game.player.jumping = false;
        }
        if (this.game.player.vy > this.game.player.weight) {
            this.game.player.setState(states.FALLING, 1);
        } else if ((input.includes('Enter') || input.includes('double tap')) && this.game.player.energy > 0) {
            this.game.player.setState(states.ROLLING, 2);
        } else if (input.includes('ArrowDown') || input.includes('swipe down')){
            this.game.player.setState(states.DIVING, 0)
        }
    }
    
    
}

export class Falling extends State {
    constructor(game){
        super('FALLING', game);
    }
    enter(){
        this.game.player.frameX = 0
        this.game.player.maxFrame = 6
        this.game.player.frameY = 2
    }
    handleInput(input){
        if (this.game.player.onGround()){
            this.game.player.setState(states.RUNNING, 1);
        } else if (input.includes('ArrowDown') || input.includes('swipe down')){
            this.game.player.setState(states.DIVING, 0)
        }
    }
}
export class Rolling extends State {
    constructor(game){
        super('ROLLING', game);
    }
    enter(){
        this.game.player.frameX = 0
        this.game.player.maxFrame = 6
        this.game.player.frameY = 6
    }
    handleInput(input){
        if (this.game.player.energy > 0) {
            // Allow player to roll
            this.game.particles.unshift(new Fire(this.game, this.game.player.x + 
                this.game.player.width *0.5, this.game.player.y + this.game.player.height *0.5));
            if ((!input.includes('Enter') && !input.includes('double tap')) && this.game.player.onGround()){
                this.game.player.setState(states.RUNNING, 1);
            } else if ((!input.includes('Enter') && !input.includes('double tap')) && !this.game.player.onGround()){
                this.game.player.setState(states.FALLING, 1);
            } else if ((input.includes('swipe up') || input.includes('ArrowUp')) && this.game.player.onGround()){
                this.game.player.vy -=27;
                if (!this.game.player.jumpSoundPlayed) {
                    this.game.player.soundController.playSound('roll');
                    this.game.player.jumpSoundPlayed = true;
                }
            } else if ((input.includes('ArrowDown') || input.includes('swipe down')) && !this.game.player.onGround()){
                this.game.player.setState(states.DIVING, 0)
            }
        } else {
            // Prevent player from rolling
            this.game.player.setState(states.RUNNING, 1);
        }
    }
    
    
}
export class Diving extends State {
    constructor(game){
        super('DIVING', game);
    }
    enter(){
        this.game.player.frameX = 0
        this.game.player.maxFrame = 6
        this.game.player.frameY = 6
        this.game.player.vy = 25
    }
    handleInput(input){
        this.game.particles.unshift(new Fire(this.game, this.game.player.x + 
            this.game.player.width *0.5, this.game.player.y + this.game.player.height *0.5));
        if (this.game.player.onGround()){
            this.game.player.setState(states.RUNNING, 1);
            for (let i = 0; i < 30; i++){
                this.game.particles.unshift(new Splash(this.game, 
                    this.game.player.x + this.game.player.width * .5, this.game.player.y + this.game.player.height))
    
            }
        } else if ((input.includes('Enter') || input.includes('double tap')) && this.game.player.energy > 0){
            this.game.player.setState(states.ROLLING, 2);
    
        }
    }
    
}
export class Hit extends State {
    constructor(game){
        super('HIT', game);
        this.animationFinished = false;
    }
    enter(){
        this.game.player.frameX = 0
        this.game.player.maxFrame = 10
        this.game.player.frameY = 4
        this.animationFinished = false;
    }
    handleInput(input){
        if (this.game.player.frameX >= 10 && this.game.player.onGround()){
            this.game.player.setState(states.RUNNING, 1);
        } else if (input.includes('Enter') || input.includes('double tap') && !this.game.player.onGround()){
            this.game.player.setState(states.FALLING, 1);

        }
    }
    update(deltaTime){
        // Update animation progress
        if (this.game.player.frameX >= 10) {
            this.animationFinished = true;
        }
    }
}