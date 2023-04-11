var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 1, 0), scene);

    // camera
    const camera = new BABYLON.ArcRotateCamera("camera1", -5, -5, 70, new BABYLON.Vector3(10, 10, -10), scene);
    camera.setPosition(new BABYLON.Vector3(-10, 10, -50));
    camera.attachControl(canvas, true);
    
    //creating the clouds, 
    const capacity = 250;
    const url = "https://raw.githubusercontent.com/shaibird/paraglider_model/main/cloud10.png";
    const spriteSize = 25;
    const spriteManager = new BABYLON.SpriteManager("sprites", url, capacity, spriteSize, scene);
        spriteManager.cellWidth = 256; // the width of each sprite cell in the texture
        spriteManager.cellHeight = 256; // the height of each sprite cell in the texture
        spriteManager.isPickable = true;


    // Set the scaling of each sprite to a random value between 1 and 3
    for (let i = 0; i < capacity; i++) {
    const sprite = new BABYLON.Sprite("cloud", spriteManager);
    sprite.size = Math.random() * 4 + 2;
    }

    //the ground
	var grass = new BABYLON.StandardMaterial("grass", scene);
	grass.diffuseTexture = new BABYLON.Texture("textures/grass.png");
    grass.diffuseTexture.uScale = 10;
    grass.diffuseTexture.vScale = 10;
	
	var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 200, height: 150}, scene);
    ground.material = grass;
	ground.position.y = -20;
	ground.position.z = 0;


    //creating the glider
    const gliderURL = "https://raw.githubusercontent.com/shaibird/paraglider_model/main/Paraglider.glb";

    BABYLON.SceneLoader.ImportMesh("", gliderURL, "", scene, function (meshes) {
    // Set the scaling of the glider mesh
    meshes[0].scaling = new BABYLON.Vector3(0.25, 0.25, 0.25);

    var body = BABYLON.MeshBuilder.CreateBox("body", {width: 2, height:1, depth: 3}, scene);
	body.position.y = 0;
	body.position.x = -.75;
	
	body.parent = meshes[0];



    // Create a new AnimationGroup to hold the animations
    let animationGroup = new BABYLON.AnimationGroup("paragliderAnimations");

    // Create a position animation for the glider
    let positionAnimation = new BABYLON.Animation(
        "paragliderPositionAnimation",
        "position",
        80,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    let positionKeys = [];
    const animationSpeed = 1

    // Set the position animation keys to move the glider along the entire path
    for (let i = 0; i < points.length; i++) {
        positionKeys.push({
        frame: i * 10 * animationSpeed,
        value: path3d.getPointAt(i / points.length),
        });
    }

    positionAnimation.setKeys(positionKeys);

    // Add the position animation to the AnimationGroup
    animationGroup.addTargetedAnimation(positionAnimation, meshes[0]);

    // Create a rotation animation for the glider tilt
    let tiltAnimation = new BABYLON.Animation(
        "paragliderTiltAnimation",
        "rotationQuaternion",
        60,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    let tiltKeys = [];

    // Set the rotation animation keys to tilt the glider along the entire path
    for (let i = 0; i < points.length; i++) {
        let direction = path3d.getTangentAt(i / points.length);
        let angle = Math.atan2(direction.z, direction.x) + Math.PI / 2;
        let axis = new BABYLON.Vector3(0, 1, 0);
        let rotation = BABYLON.Quaternion.RotationAxis(axis, angle);
        
        // Rotate the glider by 60 degrees around the X-axis
        let tiltAngle = BABYLON.Tools.ToRadians(10);
        let tiltAxis = new BABYLON.Vector3(1, 0, 0);
        let tiltRotation = BABYLON.Quaternion.RotationAxis(tiltAxis, tiltAngle);
        rotation = rotation.multiply(tiltRotation);
        tiltKeys.push({ frame: i * 10, value: rotation });
    }


    tiltAnimation.setKeys(tiltKeys);

    // Add the tilt animation to the AnimationGroup
    animationGroup.addTargetedAnimation(tiltAnimation, meshes[0]);

    // Play the animation group
    animationGroup.play(true);



    // Get the material applied to the glider mesh
    const gliderMaterial = meshes[0].material;

    // Set the diffuse color of the material to yellow
    gliderMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // Yellow
    });


    const positions = [];
    const angles = [];
    const frequencies = [];
    for (let i = 0; i < capacity; i++) {
        const sprite = new BABYLON.Sprite("cloud", spriteManager);

        const x = BABYLON.Scalar.RandomRange(-25, 25);
        const y = 30
        const z = BABYLON.Scalar.RandomRange(-25, 25);

        positions[i] = new BABYLON.Vector3(x, y, z);
        angles[i] = BABYLON.Scalar.RandomRange(-0.25, 0.25);
        frequencies[i] = BABYLON.Scalar.RandomRange(0.001, 0.003);
    }

    let time = 0.0;

    scene.registerBeforeRender(function () {
        const animationRatio = scene.getAnimationRatio();
        time += animationRatio;


        for (let i = 0; i < capacity; i++) {
            spriteManager.sprites[i].position = positions[i];

            //changes the direction and the speed of the clouds. 
            spriteManager.sprites[i].position.x = spriteManager.sprites[i].position.x + 0.003;
            spriteManager.sprites[i].angle = angles[i];

        }
    });

    spriteManager.fogEnabled = true;
    spriteManager.disableDepthWrite = true;

    // array of points that define the path
    let points = [];
    for (let i = 20; i < 50; i++) {
        points.push(new BABYLON.Vector3(
            Math.sin(i / 2) * 5,   // x
            i - 25,                // y
            Math.cos(i / 2) * i / 5   // z
        ));
    }
    let currentPoint = points[points.length - 1];

    points.push(new BABYLON.Vector3(
    0,   // x
    24.5,  // y 
    15   // z 
    ));
    
    currentPoint = points[points.length - 1]; // update currentPoint to end of previous section

    let n = 50; // number of points
    r = 0; //radius
    for (var i = 0; i < n ; i++) {
        points.push( new BABYLON.Vector3(        
            currentPoint.x - r * Math.cos(Math. PI / 2 - (i + 1) * 3 * Math.PI / (8 * n)),
            currentPoint.y - r * Math.sin(Math. PI / 2 - (i + 1) * 3 * Math.PI / (8 * n)) - r,
            currentPoint.z 
        ));   	
    }

    currentPoint = points[points.length - 1]; // update currentPoint to end of current section

    //Semi circle section (11)
    n = 160; // number of points
    r = 35; //radius
    for (var i = 0; i < n ; i++) {
        points.push( new BABYLON.Vector3(		
            currentPoint.x - r * Math.cos(Math. PI / 2 + (i + 1)  * Math.PI / n),
            currentPoint.y,
            currentPoint.z + r * Math.sin(Math. PI / 2 + (i + 1) * Math.PI / n) - r
        ));
    }

    currentPoint = points[points.length - 1]; // update currentPoint to end of current section

    
   	//Curve down (7)
	n = 60; // number of points
	pathLength = 0.20;
	for (var i = 0; i < n ; i++) {
		points.push( new BABYLON.Vector3(		
            currentPoint.x - (i + 1) * pathLength,
			currentPoint.y - (i + 1) * (i + 1) * pathLength * pathLength / 20,
			currentPoint.z
		));
	}
	
	currentPoint = points[points.length - 1];

    // add a smooth curve between the last point and the first point
    let start = points[points.length - 2]; // second-to-last point
    let end = points[0]; // first point
    let distance = start.subtract(end).length();
    let control = start.add(end).scale(0.5).add(new BABYLON.Vector3(0, -distance / 2, 0)); // control point

    n = 20; // number of points
    for (let i = 1; i <= n; i++) {
        let t = i / n;
        let point = start.scale(Math.pow(1 - t, 2)).add(control.scale(2 * t * (1 - t))).add(end.scale(Math.pow(t, 2)));
        points.push(point);
    }

    points.push(points[0]);

    // Path3D
    let path3d = new BABYLON.Path3D(points);
    let tangents = path3d.getTangents();
    let normals = path3d.getNormals();
    let binormals = path3d.getBinormals();
    let curve = path3d.getCurve();

    //define the position and oreintation of the glider animation
    const frameRate = 200;
    



//    // visualisation
//     var li = BABYLON.MeshBuilder.CreateLines('li', { points: curve, updatable: true }, scene);
//     var tg = [];



//     var theta = 0;
//     var newVector;

//     scene.registerAfterRender(function () {
//         theta += 0.05;
//         newVector = new BABYLON.Vector3(Math.cos(theta), 0, Math.sin(theta));
//         path3d.update(curve, newVector);
//         tangents = path3d.getTangents();
//         normals = path3d.getNormals();
//         binormals = path3d.getBinormals();
//         li = BABYLON.MeshBuilder.CreateLines('li', { points: curve, instance: li, updatable: true });
//         });

    return scene;
}
