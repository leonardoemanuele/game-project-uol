var floorPos_y;
var scrollPos;
var gameChar_world_x;

//OBJECTS
var trees;
var mountains;
var clouds = [];
var canyons;
var collectables;

//GameCharacter
var Doraemon;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var game_score;
var flagpole;
var lives;

var screenBorder;

var platforms;
var isContact;
var floorCollision;

var gameState;

//Sounds
var jumpSound;
var collectableSound;
var plummentingSound;
var reachFlagpole;
var gameoverSound;
var backgroundSound;
var enemySound;
var floorSound;

var enemies;
var enemyContact;

function preload() {
  soundFormats("mp3", "wav");

  //load sounds here
  jumpSound = loadSound("assets/jump.wav");
  jumpSound.setVolume(0.2);

  plummentingSound = loadSound("assets/plummenting.wav");
  plummentingSound.setVolume(0.2);

  collectableSound = loadSound("assets/collectable.wav");
  collectableSound.setVolume(0.2);

  reachFlagpole = loadSound("assets/Flagpole.wav");
  reachFlagpole.setVolume(0.1);

  gameoverSound = loadSound("assets/gameover.wav");
  gameoverSound.setVolume(0.1);

  backgroundSound = loadSound("assets/backgroundmusic.wav");
  backgroundSound.setVolume(0.1);

  enemySound = loadSound("assets/enemy.wav");
  enemySound.setVolume(0.2);

  floorSound = loadSound("assets/floor.wav");
  floorSound.setVolume(0.2);
}

function setup() {
  textFont("Courier New");
  createCanvas(1024, 576);
  floorPos_y = (height * 3) / 4;
  lives = 3;
  screenBorder = 100;

  InitSceneryObjects();
  startGame();
}

function startGame() {
  backgroundSound.loop();
  gameoverSound.stop();
  reachFlagpole.stop();

  game_score = 0;
  //Object CHARACTER
  Doraemon = {
    pos_x: 280,
    pos_y: floorPos_y - 50,
    gameover: false,
    floor_contact: function () {
      if (this.pos_y == floorPos_y || isContact) {
        return true;
      }
      return false;
    },
  };

  // Variable to control the background scrolling.
  scrollPos = 0;

  // Variable to store the real position of the gameChar in the game
  // world. Needed for collision detection.
  gameChar_world_x = Doraemon.pos_x - scrollPos;

  // Boolean variables to control the movement of the game character.
  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;

  collectables = [
    { pos_x: 350, pos_y: 350, size: 0.5, isFound: false },
    { pos_x: 1350, pos_y: 350, size: 0.5, isFound: false },
    { pos_x: 925, pos_y: 150, size: 0.5, isFound: false },
  ];

  trees = [
    { pos_x: 175, pos_y: 360, trunkHeight: 95, trunkWidth: 30 },
    { pos_x: 680, pos_y: 350, trunkHeight: 95, trunkWidth: 30 },
    { pos_x: 1530, pos_y: 400, trunkHeight: 95, trunkWidth: 30 },
    { pos_x: 1970, pos_y: 400, trunkHeight: 95, trunkWidth: 30 },
    { pos_x: 2300, pos_y: 350, trunkHeight: 95, trunkWidth: 30 },
  ];

  mountains = [
    { pos_x: -600, pos_y: floorPos_y, width: 300, height: 700 },
    { pos_x: -400, pos_y: floorPos_y, width: 200, height: 600 },
    { pos_x: -200, pos_y: floorPos_y, width: 300, height: 500 },
    { pos_x: 600, pos_y: floorPos_y, width: 370, height: 700 },
    { pos_x: 800, pos_y: floorPos_y, width: 300, height: 500 },
    { pos_x: 905, pos_y: floorPos_y, width: 200, height: 450 },
    { pos_x: 1950, pos_y: floorPos_y, width: 300, height: 500 },
    { pos_x: 2050, pos_y: floorPos_y, width: 300, height: 700 },
    { pos_x: 2190, pos_y: floorPos_y, width: 200, height: 600 },
  ];

  canyons = [
    { pos_x: 75, width: 15 },
    { pos_x: 1099, width: 15 },
    { pos_x: 1435, width: 15 },
  ];
  //flagpole
  flagpole = {
    isReached: false,
    x_pos: 1900,
  };

  platforms = [];
  //PUSHING PLATFORMS into platforms
  platforms.push(createPlatforms(450, 350, 200));
  platforms.push(createPlatforms(650, 290, 200));
  platforms.push(create_Moving_Platforms(850, 230, 100, 20));

  enemies = [];
  //PUSHING enemy into enemies
  enemies.push(new Enemy(400, floorPos_y, 200));
  enemies.push(new Enemy(740, floorPos_y, 200));
  enemies.push(new Enemy(650, 290, 200, 200));
}

function draw() {
  background(251, 206, 177); //fill the sky

  //SUN
  stroke(207, 182, 59);
  strokeWeight(5);
  fill(255, 215, 0);
  ellipse(280 - scrollPos / 100, 100, 130, 130);
  noStroke();

  //Draw Clouds
  for (var i = 0; i < clouds.length; i++) {
    clouds[i].update();
    clouds[i].draw();
  }

  push();
  translate(scrollPos, 0);

  // Draw mountains.
  drawMountains();

  // Draw canyons.
  for (var i = 0; i < canyons.length; i++) {
    drawCanyon(canyons[i]);
    checkCanyon(canyons[i]);
  }

  //Draw Ground

  drawGround();

  // Draw trees.

  drawTrees();

  // Draw collectable items.

  for (var i = 0; i < collectables.length; i++) {
    if (!collectables[i].isFound) {
      drawCollectable(collectables[i]);
      checkCollectable(collectables[i]);
    }
  }

  //draw Platforms

  for (var i = 0; i < platforms.length; i++) {
    platforms[i].draw();
  }

  renderFlagpole();

  for (var i = 0; i < enemies.length; i++) {
    enemies[i].draw();

    enemyContact = enemies[i].checkContact(gameChar_world_x, Doraemon.pos_y);
    checkPlayerDie();
  }

  pop();

  // Draw game character.

  drawGameChar();
  checkPlayerDie();

  //SCOREBOARD
  //LIVES
  for (var i = 0; i < lives; i++) {
    scoreBoard(200 + i * 50, 90);
  }

  //GAME_SCORE
  fill(1);
  stroke(255);
  strokeWeight(10);
  textSize(25);
  text("Score: " + game_score, width / 2, 40);
  //LIVES
  fill(1);
  stroke(255);
  text("Lives: " + lives, 40, 40);

  //GAME OVER OR LEVEL COMPLETE
  if (isFalling) {
    checkGameState();
  }
  if (lives < 1) {
    fill(1);
    noStroke();
    text("GAME OVER. Press space to continue", 40, 80);
    gameState = true;
    plummentingSound.stop();
    enemySound.stop();

    return;
  }
  if (flagpole.isReached) {
    fill(1);
    noStroke();
    text("LEVEL COMPLETE. Press space to continue", 40, 80);
    gameState = true;

    return;
  }

  // ------------------------------
  // Logic to make the character move or the bacground scroll
  // ------------------------------

  if (isLeft) {
    if (Doraemon.pos_x > width * 0.2) {
      Doraemon.pos_x -= 2;
    } else {
      scrollPos += 2;
    }
  }
  if (isRight) {
    if (Doraemon.pos_x < width * 0.8) {
      Doraemon.pos_x += 2;
    } else {
      scrollPos -= 2;
    }
  }

  // ------------------------------
  // Logic to make the game character rise and fall.
  // ------------------------------
  floorCollision = Doraemon.floor_contact();
  if (isFalling && floorCollision) {
    Doraemon.pos_y -= 100;
    jumpSound.play();
  }
  if (isContact && !floorSound.isPlaying()) {
    floorSound.play();
  }

  if (!floorSound.isPlaying()) {
    floorSound.play(0.008);
  }

  //Character Up in the air

  if (Doraemon.pos_y < floorPos_y) {
    //check contact with platforms
    isContact = false;
    for (var i = 0; i < platforms.length; i++) {
      if (platforms[i].checkContact(gameChar_world_x, Doraemon.pos_y)) {
        isContact = true;
        break;
      }
    }

    if (isContact == false) {
      //Gravity - returning down
      Doraemon.pos_y += 2;
      floorSound.stop();
    }
  }

  //Character Plummenting
  if (isPlummeting) {
    Doraemon.pos_y += 4;
    isLeft = false;
    isRight = false;
    isFalling = false;
    if (!plummentingSound.isPlaying()) {
      plummentingSound.play();
    }
  }

  // ------------------------------
  //   Reaching FlagPole
  // ------------------------------

  if (flagpole.isReached == false) {
    checkFlagpole();
  }

  // Update real position of gameChar for collision detection.
  gameChar_world_x = Doraemon.pos_x - scrollPos;
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
  //SET TRUE WHEN - if statements to control the animation of the character when
  // keys are pressed.

  //isFalling - When hit spacebar
  if (key == " " || keyCode == 32) {
    isFalling = true;
  }

  //isLeft position - When hit Left Arrow
  if (key == "%" || keyCode == 37) {
    isLeft = true;
  }

  //isRight position - When hit Right Arrow
  else if (key == "'" || keyCode == 39) {
    isRight = true;
  }
}

function keyReleased() {
  // RETURN TO FALSE WHEN
  // keys are released.

  if (keyCode == 32) {
    isFalling = false;
  }

  //isLeft position
  if (key == "%" || keyCode == 37) {
    isLeft = false;
  }

  //isRight position
  else if (key == "'" || keyCode == 39) {
    isRight = false;
  }
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar() {
  // draw game character

  if (isLeft && (isFalling || isPlummeting)) {
    // jumping-left code
    //FEET
    stroke(1);
    strokeWeight(1);
    fill(93, 173, 235);
    rect(Doraemon.pos_x - 10, Doraemon.pos_y - 16, 8, 14);

    fill(255);
    ellipse(Doraemon.pos_x - 6, Doraemon.pos_y, 8, 10);

    //ARMS
    fill(93, 173, 235);
    stroke(1);
    beginShape();
    vertex(Doraemon.pos_x + 16, Doraemon.pos_y - 30);
    vertex(Doraemon.pos_x + 16, Doraemon.pos_y - 25);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 10);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 20);
    vertex(Doraemon.pos_x + 16, Doraemon.pos_y - 35);
    endShape();
    noStroke();

    //hands
    fill(255);
    stroke(1);
    ellipse(Doraemon.pos_x + 16, Doraemon.pos_y - 30, 7, 12);
    noStroke();

    //BODY
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x - 4, Doraemon.pos_y - 23, 27, 33);
    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x - 11, Doraemon.pos_y - 22, 13, 23);
    noStroke();

    //BODYSACK
    stroke(1);
    fill(255);
    arc(Doraemon.pos_x - 11, Doraemon.pos_y - 18, 10, 15, TWO_PI, PI, CHORD);
    noStroke();

    //COLLAR
    fill(255, 0, 0);
    arc(Doraemon.pos_x, Doraemon.pos_y - 42, 30, 30, TWO_PI, PI);
    fill(255, 191, 0);
    ellipse(Doraemon.pos_x - 7, Doraemon.pos_y - 27, 7, 7);

    //head1
    stroke(1);
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 53, 35, 45);
    noStroke();
    //head2
    fill(255);
    ellipse(Doraemon.pos_x - 9, Doraemon.pos_y - 52, 17, 37);

    //eyes
    stroke(1);
    strokeWeight(1);
    fill(255);

    ellipse(Doraemon.pos_x - 9, Doraemon.pos_y - 66, 10, 13);

    //nose
    fill(255, 0, 0);
    ellipse(Doraemon.pos_x - 15, Doraemon.pos_y - 60, 7, 7);
    //eye point
    strokeWeight(3);
    point(Doraemon.pos_x - 7, Doraemon.pos_y - 62);

    strokeWeight(1);
    line(
      Doraemon.pos_x - 15,
      Doraemon.pos_y - 56,
      Doraemon.pos_x,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x - 15,
      Doraemon.pos_y - 54,
      Doraemon.pos_x,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x - 15,
      Doraemon.pos_y - 52,
      Doraemon.pos_x,
      Doraemon.pos_y - 50
    );

    //mouth
    fill(171, 39, 79);
    arc(Doraemon.pos_x - 18, Doraemon.pos_y - 49, 27, 27, 0, HALF_PI);
  } else if (isRight && (isFalling || isPlummeting)) {
    // jumping-right code
    //FEET
    stroke(1);
    strokeWeight(1);
    fill(93, 173, 235);
    rect(Doraemon.pos_x + 2, Doraemon.pos_y - 16, 8, 14);
    fill(255);
    ellipse(Doraemon.pos_x + 6, Doraemon.pos_y, 8, 10);

    //ARMS
    fill(93, 173, 235);
    stroke(1);
    beginShape();
    vertex(Doraemon.pos_x - 16, Doraemon.pos_y - 30);
    vertex(Doraemon.pos_x - 16, Doraemon.pos_y - 25);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 10);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 20);
    vertex(Doraemon.pos_x - 16, Doraemon.pos_y - 35);
    endShape();
    noStroke();

    //hands
    fill(255);
    stroke(1);
    ellipse(Doraemon.pos_x - 16, Doraemon.pos_y - 30, 7, 12);
    noStroke();

    //BODY
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x + 4, Doraemon.pos_y - 23, 27, 33);
    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x + 11, Doraemon.pos_y - 22, 13, 23);
    noStroke();

    //BODYSACK
    stroke(1);
    fill(255);
    arc(Doraemon.pos_x + 11, Doraemon.pos_y - 18, 10, 15, TWO_PI, PI, CHORD);
    noStroke();

    //COLLAR
    fill(255, 0, 0);
    arc(Doraemon.pos_x, Doraemon.pos_y - 42, 30, 30, TWO_PI, PI);
    fill(255, 191, 0);
    ellipse(Doraemon.pos_x + 7, Doraemon.pos_y - 27, 7, 7);

    //head1
    stroke(1);
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 53, 35, 45);
    noStroke();
    //head2
    fill(255);
    ellipse(Doraemon.pos_x + 9, Doraemon.pos_y - 52, 17, 37);

    //eyes
    stroke(1);
    strokeWeight(1);
    fill(255);

    ellipse(Doraemon.pos_x + 9, Doraemon.pos_y - 66, 10, 13);

    //nose
    fill(255, 0, 0);
    ellipse(Doraemon.pos_x + 15, Doraemon.pos_y - 60, 7, 7);
    //eye point
    strokeWeight(3);
    point(Doraemon.pos_x + 7, Doraemon.pos_y - 62);

    strokeWeight(1);
    line(
      Doraemon.pos_x + 15,
      Doraemon.pos_y - 56,
      Doraemon.pos_x,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x + 15,
      Doraemon.pos_y - 54,
      Doraemon.pos_x,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x + 15,
      Doraemon.pos_y - 52,
      Doraemon.pos_x,
      Doraemon.pos_y - 50
    );

    //mouth
    fill(171, 39, 79);
    arc(Doraemon.pos_x + 18, Doraemon.pos_y - 49, 27, 27, HALF_PI, PI);
  } else if (isLeft) {
    // add your walking left code
    stroke(1);
    strokeWeight(1);
    beginShape();
    fill(93, 173, 235);
    vertex(Doraemon.pos_x + 16, Doraemon.pos_y - 20);
    vertex(Doraemon.pos_x + 16, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 20);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 30);
    vertex(Doraemon.pos_x + 16, Doraemon.pos_y - 25);
    endShape();

    //hands
    fill(255);
    stroke(1);
    ellipse(Doraemon.pos_x + 16, Doraemon.pos_y - 20, 7, 10);
    noStroke();

    //FEET
    fill(93, 173, 235);
    stroke(1);
    rect(Doraemon.pos_x - 15, Doraemon.pos_y - 13, 10, 12);
    rect(Doraemon.pos_x - 3, Doraemon.pos_y - 13, 10, 12);

    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x - 13, Doraemon.pos_y - 2, 14, 6);
    ellipse(Doraemon.pos_x + 2, Doraemon.pos_y, 14, 6);
    noStroke();

    //BODY
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x - 4, Doraemon.pos_y - 23, 27, 38);
    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x - 11, Doraemon.pos_y - 22, 13, 28);
    noStroke();

    //BODYSACK
    stroke(1);
    fill(255);
    arc(Doraemon.pos_x - 11, Doraemon.pos_y - 18, 10, 20, TWO_PI, PI, CHORD);
    noStroke();

    //COLLAR
    fill(255, 0, 0);
    arc(Doraemon.pos_x, Doraemon.pos_y - 42, 30, 30, TWO_PI, PI);
    fill(255, 191, 0);
    ellipse(Doraemon.pos_x - 7, Doraemon.pos_y - 27, 7, 7);

    //head1
    stroke(1);
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 53, 35, 45);
    noStroke();
    //head2
    fill(255);
    ellipse(Doraemon.pos_x - 9, Doraemon.pos_y - 52, 17, 37);

    //eyes
    stroke(1);
    //strokeWeight(1);
    fill(255);

    ellipse(Doraemon.pos_x - 9, Doraemon.pos_y - 66, 10, 13);

    //nose
    fill(255, 0, 0);
    ellipse(Doraemon.pos_x - 15, Doraemon.pos_y - 60, 7, 7);
    //eye point
    strokeWeight(3);
    point(Doraemon.pos_x - 5, Doraemon.pos_y - 66);

    strokeWeight(1);
    line(
      Doraemon.pos_x - 15,
      Doraemon.pos_y - 56,
      Doraemon.pos_x,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x - 15,
      Doraemon.pos_y - 54,
      Doraemon.pos_x,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x - 15,
      Doraemon.pos_y - 52,
      Doraemon.pos_x,
      Doraemon.pos_y - 50
    );

    //mouth
    noFill();
    arc(Doraemon.pos_x - 14, Doraemon.pos_y - 50, 17, 25, 0, HALF_PI);
  } else if (isRight) {
    // add your walking right code
    //ARMS
    fill(93, 173, 235);
    stroke(1);
    strokeWeight(1);
    beginShape();
    vertex(Doraemon.pos_x - 16, Doraemon.pos_y - 20);
    vertex(Doraemon.pos_x - 16, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 20);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 30);
    vertex(Doraemon.pos_x - 16, Doraemon.pos_y - 25);
    endShape();

    //hands
    fill(255);
    stroke(1);
    ellipse(Doraemon.pos_x - 16, Doraemon.pos_y - 20, 7, 10);
    noStroke();

    //FEET
    fill(93, 173, 235);
    stroke(1);
    rect(Doraemon.pos_x + 5, Doraemon.pos_y - 13, 10, 12);
    rect(Doraemon.pos_x - 7, Doraemon.pos_y - 13, 10, 12);

    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x + 13, Doraemon.pos_y - 2, 14, 6);
    ellipse(Doraemon.pos_x - 2, Doraemon.pos_y, 14, 6);
    noStroke();

    //BODY
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x + 4, Doraemon.pos_y - 23, 27, 38);
    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x + 11, Doraemon.pos_y - 22, 13, 28);
    noStroke();

    //BODYSACK
    stroke(1);
    fill(255);
    arc(Doraemon.pos_x + 11, Doraemon.pos_y - 18, 10, 20, TWO_PI, PI, CHORD);
    noStroke();

    //COLLAR
    fill(255, 0, 0);
    arc(Doraemon.pos_x, Doraemon.pos_y - 42, 30, 30, TWO_PI, PI);
    fill(255, 191, 0);
    ellipse(Doraemon.pos_x + 7, Doraemon.pos_y - 27, 7, 7);

    //head1
    stroke(1);
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 53, 35, 45);
    noStroke();
    //head2
    fill(255);
    ellipse(Doraemon.pos_x + 9, Doraemon.pos_y - 52, 17, 37);

    //eyes
    stroke(1);
    strokeWeight(1);
    fill(255);

    ellipse(Doraemon.pos_x + 9, Doraemon.pos_y - 66, 10, 13);

    //nose
    fill(255, 0, 0);
    ellipse(Doraemon.pos_x + 15, Doraemon.pos_y - 60, 7, 7);
    //eye point
    strokeWeight(3);
    point(Doraemon.pos_x + 5, Doraemon.pos_y - 66);

    strokeWeight(1);
    line(
      Doraemon.pos_x + 15,
      Doraemon.pos_y - 56,
      Doraemon.pos_x,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x + 15,
      Doraemon.pos_y - 54,
      Doraemon.pos_x,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x + 15,
      Doraemon.pos_y - 52,
      Doraemon.pos_x,
      Doraemon.pos_y - 50
    );

    //mouth
    noFill();
    arc(Doraemon.pos_x + 14, Doraemon.pos_y - 50, 17, 25, HALF_PI, PI);
  } else if (isFalling || isPlummeting) {
    // add your jumping facing forwards code
    noStroke();
    strokeWeight(1);
    //FEET
    fill(93, 173, 235);
    rect(Doraemon.pos_x - 15, Doraemon.pos_y - 13, 10, 12);
    rect(Doraemon.pos_x + 5, Doraemon.pos_y - 13, 10, 12);

    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x - 10, Doraemon.pos_y - 1, 14, 7);
    ellipse(Doraemon.pos_x + 10, Doraemon.pos_y - 1, 14, 7);
    noStroke();

    //ARMS
    fill(93, 173, 235);

    beginShape();
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x + 20, Doraemon.pos_y - 40);
    vertex(Doraemon.pos_x + 25, Doraemon.pos_y - 35);
    vertex(Doraemon.pos_x + 20, Doraemon.pos_y - 25);
    endShape();

    beginShape();
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x + 0, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x - 20, Doraemon.pos_y - 40);
    vertex(Doraemon.pos_x - 24, Doraemon.pos_y - 35);
    vertex(Doraemon.pos_x - 20, Doraemon.pos_y - 25);
    endShape();

    //hands
    fill(255);
    stroke(1);
    ellipse(Doraemon.pos_x + 21, Doraemon.pos_y - 35, 7, 10);
    ellipse(Doraemon.pos_x - 21, Doraemon.pos_y - 35, 7, 10);
    noStroke();

    //BODY
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 23, 40, 38);
    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 22, 33, 33);
    noStroke();

    //BODYSACK
    stroke(1);
    fill(255);
    arc(Doraemon.pos_x, Doraemon.pos_y - 18, 25, 20, TWO_PI, PI, CHORD);
    noStroke();

    //COLLAR
    fill(255, 0, 0);
    arc(Doraemon.pos_x, Doraemon.pos_y - 42, 35, 30, TWO_PI, PI);
    fill(255, 191, 0);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 27, 7, 7);

    //head1
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 53, 45, 45);
    //head2
    fill(255);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 50, 37, 37);

    //mouth
    stroke(1);
    fill(229, 43, 80);
    arc(Doraemon.pos_x, Doraemon.pos_y - 48, 30, 27, TWO_PI, PI);

    //moustache
    line(
      Doraemon.pos_x + 5,
      Doraemon.pos_y - 56,
      Doraemon.pos_x + 14,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x + 5,
      Doraemon.pos_y - 54,
      Doraemon.pos_x + 14,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x + 5,
      Doraemon.pos_y - 52,
      Doraemon.pos_x + 14,
      Doraemon.pos_y - 50
    );

    line(
      Doraemon.pos_x - 5,
      Doraemon.pos_y - 56,
      Doraemon.pos_x - 14,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x - 5,
      Doraemon.pos_y - 54,
      Doraemon.pos_x - 14,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x - 5,
      Doraemon.pos_y - 52,
      Doraemon.pos_x - 14,
      Doraemon.pos_y - 50
    );

    //eyes
    stroke(1);
    strokeWeight(1);
    fill(255);
    ellipse(Doraemon.pos_x + 5, Doraemon.pos_y - 66, 10, 13);
    ellipse(Doraemon.pos_x - 5, Doraemon.pos_y - 66, 10, 13);
    line(
      Doraemon.pos_x,
      Doraemon.pos_y - 50,
      Doraemon.pos_x,
      Doraemon.pos_y - 63
    );
    //nose
    fill(255, 0, 0);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 60, 7, 7);
    //eye point
    strokeWeight(3);
    point(Doraemon.pos_x + 5, Doraemon.pos_y - 66);
    point(Doraemon.pos_x - 5, Doraemon.pos_y - 66);
  } else {
    // add your standing front facing code
    noStroke();
    strokeWeight(1);

    //FEET
    fill(93, 173, 235);
    rect(Doraemon.pos_x - 15, Doraemon.pos_y - 13, 10, 12);
    rect(Doraemon.pos_x + 5, Doraemon.pos_y - 13, 10, 12);

    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x - 10, Doraemon.pos_y, 14, 6);
    ellipse(Doraemon.pos_x + 10, Doraemon.pos_y, 14, 6);
    noStroke();

    //BODY
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 23, 40, 38);
    stroke(1);
    fill(255);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 22, 33, 33);
    noStroke();

    //ARMS
    fill(93, 173, 235);
    beginShape();
    vertex(Doraemon.pos_x, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x + 3, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x + 13, Doraemon.pos_y - 30);
    vertex(Doraemon.pos_x + 19, Doraemon.pos_y - 25);
    vertex(Doraemon.pos_x + 10, Doraemon.pos_y - 15);
    endShape();

    beginShape();
    vertex(Doraemon.pos_x - 3, Doraemon.pos_y - 15);
    vertex(Doraemon.pos_x - 13, Doraemon.pos_y - 30);
    vertex(Doraemon.pos_x - 19, Doraemon.pos_y - 25);
    vertex(Doraemon.pos_x - 10, Doraemon.pos_y - 15);
    endShape();

    //BODYSACK
    stroke(1);
    fill(255);
    arc(Doraemon.pos_x, Doraemon.pos_y - 18, 25, 20, TWO_PI, PI, CHORD);
    noStroke();

    //COLLAR
    fill(255, 0, 0);
    arc(Doraemon.pos_x, Doraemon.pos_y - 42, 35, 30, TWO_PI, PI);
    fill(255, 191, 0);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 27, 7, 7);

    //head1
    fill(93, 173, 235);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 53, 45, 45);
    //head2
    fill(255);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 50, 37, 37);
    //mouth
    stroke(1);
    noFill();
    arc(Doraemon.pos_x, Doraemon.pos_y - 48, 30, 27, TWO_PI, PI);

    //eyes
    stroke(1);
    strokeWeight(1);
    fill(255);
    ellipse(Doraemon.pos_x + 5, Doraemon.pos_y - 66, 10, 13);
    ellipse(Doraemon.pos_x - 5, Doraemon.pos_y - 66, 10, 13);
    line(
      Doraemon.pos_x,
      Doraemon.pos_y - 50,
      Doraemon.pos_x,
      Doraemon.pos_y - 63
    );

    //nose
    fill(255, 0, 0);
    ellipse(Doraemon.pos_x, Doraemon.pos_y - 60, 7, 7);

    //moustache
    line(
      Doraemon.pos_x + 5,
      Doraemon.pos_y - 56,
      Doraemon.pos_x + 14,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x + 5,
      Doraemon.pos_y - 54,
      Doraemon.pos_x + 14,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x + 5,
      Doraemon.pos_y - 52,
      Doraemon.pos_x + 14,
      Doraemon.pos_y - 50
    );

    line(
      Doraemon.pos_x - 5,
      Doraemon.pos_y - 56,
      Doraemon.pos_x - 14,
      Doraemon.pos_y - 58
    );
    line(
      Doraemon.pos_x - 5,
      Doraemon.pos_y - 54,
      Doraemon.pos_x - 14,
      Doraemon.pos_y - 54
    );
    line(
      Doraemon.pos_x - 5,
      Doraemon.pos_y - 52,
      Doraemon.pos_x - 14,
      Doraemon.pos_y - 50
    );

    //eye point
    strokeWeight(3);
    point(Doraemon.pos_x + 5, Doraemon.pos_y - 66);
    point(Doraemon.pos_x - 5, Doraemon.pos_y - 66);
  }
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw mountains objects.

function drawMountains() {
  for (var i = 0; i < mountains.length; i++) {
    stroke(1);
    fill(17, 96, 98);
    ellipse(
      mountains[i].pos_x,
      mountains[i].pos_y,
      mountains[i].width,
      mountains[i].height,
      PI,
      PI
    );
  }
}

// Function to draw trees objects.
function drawTrees() {
  //TREE trunk
  for (var i = 0; i < trees.length; i++) {
    stroke(1);
    fill(83, 27, 0);
    rect(
      trees[i].pos_x,
      trees[i].pos_y + 33,
      trees[i].trunkWidth,
      trees[i].trunkHeight
    );

    //TREE leaf
    noStroke();
    fill(135, 169, 107);
    triangle(
      trees[i].pos_x - 85,
      trees[i].pos_y + 62,
      trees[i].pos_x + 5,
      trees[i].pos_y - 170,
      trees[i].pos_x + 95,
      trees[i].pos_y + 62
    );

    fill(189, 183, 107);
    triangle(
      trees[i].pos_x - 75,
      trees[i].pos_y + 62,
      trees[i].pos_x + 15,
      trees[i].pos_y - 150,
      trees[i].pos_x + 105,
      trees[i].pos_y + 62
    );

    //GRASS beneath TREE
    stroke(1);
    fill(233, 116, 81);
    beginShape();
    vertex(trees[i].pos_x - 25, trees[i].pos_y + 132);
    vertex(trees[i].pos_x - 15, trees[i].pos_y + 122);
    vertex(trees[i].pos_x - 5, trees[i].pos_y + 132);
    vertex(trees[i].pos_x + 5, trees[i].pos_y + 122);
    vertex(trees[i].pos_x + 15, trees[i].pos_y + 132);
    vertex(trees[i].pos_x + 25, trees[i].pos_y + 122);
    vertex(trees[i].pos_x + 35, trees[i].pos_y + 132);
    vertex(trees[i].pos_x + 45, trees[i].pos_y + 122);
    vertex(trees[i].pos_x + 55, trees[i].pos_y + 132);
    endShape();
  }
}

function drawGround() {
  beginShape();
  vertex(0, floorPos_y); //Generate new floor going from x=0 backward
  vertex(0, height);
  vertex(0 - scrollPos, height);
  vertex(0 - scrollPos, floorPos_y);
  endShape();

  beginShape();
  vertex(400, height); //Starting new floor at x=400
  vertex(400, floorPos_y);

  vertex(600, 432); //ZigZag1
  vertex(610, 422);
  vertex(620, 432);
  vertex(630, 422);
  vertex(640, 432);
  vertex(890, 432); //ZigZag2
  vertex(900, 422);
  vertex(910, 432);
  vertex(920, 422);
  vertex(930, 432);

  vertex(width, floorPos_y);
  vertex(width, height);
  endShape();

  beginShape();
  vertex(1760, floorPos_y); //Generate new floor from x=1760 forward
  vertex(1760, height);
  vertex(width - scrollPos, height);
  vertex(width - scrollPos, floorPos_y);
  endShape();
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon) {
  noStroke();
  fill(233, 116, 81);
  beginShape();
  vertex(t_canyon.pos_x - t_canyon.width, height); //START canyon
  vertex(t_canyon.pos_x - t_canyon.width, floorPos_y);

  vertex(t_canyon.pos_x, 432); //ZigZag
  vertex(t_canyon.pos_x + 10, 422);
  vertex(t_canyon.pos_x + 20, 432);
  vertex(t_canyon.pos_x + 30, 422);
  vertex(t_canyon.pos_x + 40, 432);

  vertex(t_canyon.pos_x + 210, 432); //ZigZag
  vertex(t_canyon.pos_x + 220, 422);
  vertex(t_canyon.pos_x + 230, 432);
  vertex(t_canyon.pos_x + 240, 422);
  vertex(t_canyon.pos_x + 250, 432);

  vertex(t_canyon.pos_x + 250 + t_canyon.width, floorPos_y);
  vertex(t_canyon.pos_x + 250 + t_canyon.width, height); //END CANYON
  endShape();
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon) {
  var start = t_canyon.pos_x - t_canyon.width;
  var end = t_canyon.pos_x + 250 + t_canyon.width;

  if (
    isContact ||
    Doraemon.pos_y < floorPos_y ||
    (gameChar_world_x > start && gameChar_world_x < end) ||
    (gameChar_world_x > 400 && gameChar_world_x < width) ||
    (gameChar_world_x < 0 && gameChar_world_x < t_canyon.pos_x) ||
    (gameChar_world_x > t_canyon.pos_x && gameChar_world_x > 1760)
  ) {
    isPlummeting = false;
  } else if (
    ((!isContact || Doraemon.pos_y > floorPos_y) &&
      (gameChar_world_x > end || gameChar_world_x > t_canyon.pos_x) &&
      (gameChar_world_x > start || gameChar_world_x < start)) ||
    (gameChar_world_x < start && gameChar_world_x < 60)
  ) {
    isPlummeting = true;
  }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable) {
  stroke(59, 122, 87);
  strokeWeight(7);
  noFill();
  arc(
    t_collectable.pos_x,
    t_collectable.pos_y - 15,
    90 / 2,
    80 / 2,
    QUARTER_PI - HALF_PI,
    HALF_PI
  );
  arc(
    t_collectable.pos_x - 5,
    t_collectable.pos_y - 35,
    89 / 2,
    90 / 2,
    TWO_PI,
    HALF_PI
  );
  noStroke();
  stroke(175, 0, 40);
  strokeWeight(3);
  fill(222, 49, 99);
  ellipse(t_collectable.pos_x - 5, t_collectable.pos_y - 10, 35 / 2, 35 / 2);
  ellipse(t_collectable.pos_x, t_collectable.pos_y, 35 / 2, 35 / 2);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable) {
  var d = dist(
    gameChar_world_x,
    Doraemon.pos_y,
    t_collectable.pos_x,
    t_collectable.pos_y
  );

  if (d < 20) {
    t_collectable.isFound = true;
    game_score += 1;
    collectableSound.play();
  }
}

function renderFlagpole() {
  push();
  strokeWeight(5);
  stroke(100);
  line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
  fill(255, 0, 255);
  noStroke();

  if (flagpole.isReached) {
    rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
  } else {
    rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
  }

  pop();
}

function checkFlagpole() {
  var d = abs(gameChar_world_x - flagpole.x_pos);

  if (d < 15) {
    flagpole.isReached = true;
    backgroundSound.stop();
    reachFlagpole.play();
  }
}

function checkPlayerDie() {
  for (var i = lives; i > 0; i--) {
    if (
      enemyContact ||
      (Doraemon.pos_y > floorPos_y && Doraemon.pos_y > height)
    ) {
      lives--;
      backgroundSound.stop();
      enemySound.play();

      if (lives > 0) {
        startGame();
        break;
      } else if (lives < 1) {
        gameoverSound.play();
        plummentingSound.stop();
      }
    }
  }
}

function scoreBoard(x, y) {
  //COLLAR
  noStroke();
  fill(255, 0, 0);
  arc(x, y - 42, 35, 30, TWO_PI, PI);
  fill(255, 191, 0);
  ellipse(x, y - 27, 7, 7);

  //head1
  fill(93, 173, 235);
  ellipse(x, y - 53, 45, 45);
  //head2
  fill(255);
  ellipse(x, y - 50, 37, 37);
  //mouth
  stroke(1);
  strokeWeight(1);
  noFill();
  arc(x, y - 48, 30, 27, TWO_PI, PI);

  //eyes
  stroke(1);
  strokeWeight(1);
  fill(255);
  ellipse(x + 5, y - 66, 10, 13);
  ellipse(x - 5, y - 66, 10, 13);
  line(x, y - 50, x, y - 63);

  //nose
  fill(255, 0, 0);
  ellipse(x, y - 60, 7, 7);

  //moustache
  line(x + 5, y - 56, x + 14, y - 58);
  line(x + 5, y - 54, x + 14, y - 54);
  line(x + 5, y - 52, x + 14, y - 50);

  line(x - 5, y - 56, x - 14, y - 58);
  line(x - 5, y - 54, x - 14, y - 54);
  line(x - 5, y - 52, x - 14, y - 50);

  //eye point
  strokeWeight(3);
  point(x + 5, y - 66);
  point(x - 5, y - 66);
}

function InitSceneryObjects() {
  //clouds
  for (var i = 0; i < 5; i++) {
    clouds.push(createClouds());
  }
}

function createClouds(x, y) {
  var c = {
    pos: undefined,
    dir: undefined,
    size: random(0.6, 1),

    setup: function () {
      this.pos = createVector(random(0, width), random(0, 150));
      this.dir = createVector(random(-1, 1), random(-1, 1));
      this.dir.normalize();
    },

    draw: function () {
      push();

      translate(this.pos.x, this.pos.y);

      //Drawing code
      fill(97, 144, 181, 150);
      noStroke();
      ellipse(0, 0 + 70 * this.size, this.size * 100, this.size * 80);
      ellipse(
        0 + 20 * this.size,
        0 + 20 * this.size,
        this.size * 80,
        this.size * 75
      );
      ellipse(
        0 + 80 * this.size,
        0 + 40 * this.size,
        this.size * 120,
        this.size * 120
      );
      ellipse(
        0 + 147 * this.size,
        0 + 56 * this.size,
        this.size * 90,
        this.size * 80
      );

      stroke(124, 185, 232, 180);
      strokeWeight(4);
      fill(255, 255, 255);
      ellipse(
        0 + 90 * this.size,
        0 + 20 * this.size,
        this.size * 125,
        this.size * 140
      );
      ellipse(
        0 + 35 * this.size,
        0 + 20 * this.size,
        this.size * 85,
        this.size * 80
      );
      ellipse(
        0 + 12 * this.size,
        0 + 60 * this.size,
        this.size * 100,
        this.size * 70
      );
      ellipse(
        0 + 137 * this.size,
        0 + 50 * this.size,
        this.size * 105,
        this.size * 70
      );
      ellipse(
        0 + 145 * this.size,
        0 + 15 * this.size,
        this.size * 70,
        this.size * 70
      );

      fill(255);
      arc(
        0 + 85 * this.size,
        0 + 60 * this.size,
        this.size * 120,
        this.size * 130,
        PI,
        TWO_PI
      );
      pop();
    },

    update: function () {
      this.pos.x += random(-0.2, 0.5);
      this.pos.y += random(-0.2, 0.2);

      //Constrain direction
      this.dir = constrain(this.dir, 0, 60);

      this.pos.add(this.dir);

      this.screenWrap();
    },

    screenWrap: function () {
      if (this.pos.x > width + screenBorder) {
        this.pos.x -= width + screenBorder;
      } else if (this.pos.x < -screenBorder) {
        this.pos.x += width + screenBorder;
      }

      if (this.pos.y > height + screenBorder) {
        this.pos.y -= height + screenBorder;
      } else if (this.pos.y < -screenBorder) {
        this.pos.y += height + screenBorder;
      }
    },
  };

  //calling the setup
  c.setup(x, y);

  return c;
}

//Factory pattern = The function returns Object (p)
function createPlatforms(x, y, l) {
  var p = {
    x: x,
    y: y,
    l: l,
    draw: function () {
      fill(233, 116, 81);
      stroke(1);
      strokeWeight(3);
      rect(this.x, this.y, this.l, 20);
    },
    checkContact: function (gamec_x, gamec_y) {
      if (gamec_x > this.x && gamec_x < this.x + l) {
        //distance between platform and gamec_y
        var d = this.y - gamec_y;
        if (d >= 0 && d < 5) {
          return true;
        }
        return false;
      }
    },
  };
  return p;
}

function create_Moving_Platforms(x, y, l, range) {
  var p = {
    x: x,
    y: y,
    l: l,
    range: range,
    inc: 1,
    xPos: x,
    draw: function () {
      this.update();
      fill(233, 116, 81);
      stroke(1);
      strokeWeight(3);
      rect(this.x, this.y, this.l, 20);
    },
    checkContact: function (gamec_x, gamec_y) {
      if (gamec_x > this.x && gamec_x < this.x + l) {
        //distance between platform and gamec_y
        var d = this.y - gamec_y;
        if (d >= 0 && d < 5) {
          return true;
        }
        return false;
      }
    },
    update: function () {
      this.x += this.inc;
      if (this.x >= width) {
        this.inc -= 1;
      } else if (this.x < this.xPos) {
        this.inc += 1;
      }
    },
  };
  return p;
}

//Constructor Function for defining enemies
function Enemy(x, y, range) {
  this.x = x;
  this.y = y;
  this.range = range;

  this.currentX = x;
  this.inc = 1;

  this.update = function () {
    //moving enemy by 1 each frame
    this.currentX += this.inc;

    if (this.currentX >= this.x + this.range) {
      //moving back enemy
      this.inc -= 1;
    } else if (this.currentX < this.x) {
      this.inc = 1;
    }
  };
  this.draw = function () {
    this.update();
    fill(255, 0, 0);
    ellipse(this.currentX, this.y, 20, 20);
  };

  this.checkContact = function (gc_x, gc_y) {
    var d = dist(gc_x, gc_y, this.currentX, this.y);
    console.log(d);

    if (d < 20) {
      return true;
    }
    return false;
  };
}

//Function for checking if the player won or lost
function checkGameState() {
  if (flagpole.isReached || lives < 1) {
    if (keyCode == " " || keyCode == " 32") {
      lives = 3;
      startGame();
    }
  }
  return;
}
