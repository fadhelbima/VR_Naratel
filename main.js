// Combined JavaScript code for sidebar toggle and VR viewer
document.addEventListener("DOMContentLoaded", function () {
  // Sidebar functionality
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebarToggle");
  const toggleIcon = toggle.querySelector("i");
  const overlay = document.getElementById("overlay");
  let sidebarOpen = false;

  function openSidebar() {
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");
    toggle.classList.remove("left-0");
    toggle.classList.add("left-1/4");
    toggleIcon.classList.remove("fa-chevron-right");
    toggleIcon.classList.add("fa-chevron-left");
    overlay.classList.add("opacity-0");
    overlay.classList.remove("pointer-events-none");
    sidebarOpen = true;
  }

  function closeSidebar() {
    sidebar.classList.add("-translate-x-full");
    sidebar.classList.remove("translate-x-0");
    toggle.classList.add("left-0");
    toggle.classList.remove("left-1/4");
    toggleIcon.classList.add("fa-chevron-right");
    toggleIcon.classList.remove("fa-chevron-left");
    overlay.classList.remove("opacity-50");
    overlay.classList.add("pointer-events-none");
    sidebarOpen = false;
  }

  toggle.addEventListener("click", function () {
    if (sidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Close sidebar when clicking on overlay
  overlay.addEventListener("click", closeSidebar);

  // Handle responsive design
  function handleResize() {
    if (window.innerWidth < 768 && sidebarOpen) {
      closeSidebar();
    }
  }

  window.addEventListener("resize", handleResize);

  // Initialize Babylon.js VR viewer
  initVRViewer();
});

// Babylon.js VR viewer initialization function
function initVRViewer() {
  // Define image paths
  const borghese = "/public/img/14.jpg";
  const alps = "/public/img/15.jpg";

  // Get canvas and initialize engine
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // Create and setup camera
  const camera = new BABYLON.UniversalCamera(
    "camera",
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // Set up engine render loop
  engine.runRenderLoop(() => {
    scene.render();
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    engine.resize();
  });

  // Create XR experience
  const xr = scene.createDefaultVRExperience();

  // Create the PhotoDome
  let dome = new BABYLON.PhotoDome(
    "sphere",
    alps,
    {
      resolution: 64,
      size: 1000,
      useDirectMapping: false,
    },
    scene
  );

  // Create GUI texture
  const advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  // Create stack panel for buttons
  const stackPanel = new BABYLON.GUI.StackPanel();
  stackPanel.width = "220px";
  stackPanel.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  advancedTexture.addControl(stackPanel);

  // Create the Alps button
  const button1 = BABYLON.GUI.Button.CreateSimpleButton("button1", "Alps");
  button1.width = "100px";
  button1.height = "40px";
  button1.color = "white";
  button1.thickness = 2;
  button1.background = "green";
  button1.onPointerUpObservable.add(() => {
    button1.thickness = 2;
    button2.thickness = 0;
    transition(alps);
  });
  stackPanel.addControl(button1);

  // Create the Gardens button
  const button2 = BABYLON.GUI.Button.CreateSimpleButton("button2", "Gardens");
  button2.width = "100px";
  button2.height = "40px";
  button2.color = "white";
  button2.thickness = 0;
  button2.background = "red";
  button2.onPointerUpObservable.add(() => {
    button1.thickness = 0;
    button2.thickness = 2;
    transition(borghese);
  });
  stackPanel.addControl(button2);

  // Create fade animations
  const fadeOutAnimation = new BABYLON.Animation(
    "fadeOut",
    "material.alpha",
    40,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  fadeOutAnimation.setKeys([
    { frame: 0, value: 1 },
    { frame: 120, value: 0 },
  ]);

  const fadeInAnimation = new BABYLON.Animation(
    "fadeIn",
    "material.alpha",
    40,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  fadeInAnimation.setKeys([
    { frame: 0, value: 0 },
    { frame: 120, value: 1 },
  ]);

  // Transition function
  const transition = (image) => {
    let anim = scene.beginDirectAnimation(
      dome.mesh,
      [fadeOutAnimation],
      0,
      120,
      false
    );
    anim.onAnimationEnd = () => loadNewTexture(image);
  };

  // Load new texture function
  const loadNewTexture = (image) => {
    const newTexture = new BABYLON.Texture(image, scene);
    newTexture.onLoadObservable.add(() => {
      dome.dispose();

      // Create a new dome with the new texture
      dome = new BABYLON.PhotoDome(
        "sphere",
        image,
        {
          resolution: 64,
          size: 1000,
          useDirectMapping: false,
        },
        scene
      );
      dome.mesh.material.alpha = 0;
      scene.beginDirectAnimation(dome.mesh, [fadeInAnimation], 0, 120, false);
    });
  };

  // Create Zoom In button
  const zoomInButton = BABYLON.GUI.Button.CreateSimpleButton(
    "zoomInButton",
    "Zoom In"
  );
  zoomInButton.paddingTopInPixels = 50;
  zoomInButton.width = "100px";
  zoomInButton.height = "90px";
  zoomInButton.color = "white";
  zoomInButton.background = "blue";
  zoomInButton.onPointerUpObservable.add(() => {
    camera.fov = Math.max(0.1, camera.fov - 0.1);
  });
  stackPanel.addControl(zoomInButton);

  // Create Zoom Out button
  const zoomOutButton = BABYLON.GUI.Button.CreateSimpleButton(
    "zoomOutButton",
    "Zoom Out"
  );
  zoomOutButton.paddingTopInPixels = 50;
  zoomOutButton.width = "100px";
  zoomOutButton.height = "90px";
  zoomOutButton.color = "white";
  zoomOutButton.background = "blue";
  zoomOutButton.onPointerUpObservable.add(() => {
    camera.fov = Math.min(1.5, camera.fov + 0.1); // Fixed the zoom out bug here
  });
  stackPanel.addControl(zoomOutButton);

  // Create rotation control
  let isRotationPlaying = true;
  let rotationSpeed = 0.0005;

  // Create rotation button
  const rotationButton = BABYLON.GUI.Button.CreateSimpleButton(
    "rotationButton",
    "Pause"
  );
  rotationButton.width = "100px";
  rotationButton.height = "40px";
  rotationButton.color = "white";
  rotationButton.background = "purple";
  rotationButton.onPointerUpObservable.add(() => {
    isRotationPlaying = !isRotationPlaying;
    rotationButton.textBlock.text = isRotationPlaying ? "Pause" : "Play";
  });
  stackPanel.addControl(rotationButton);

  // Update camera rotation in render loop
  scene.onBeforeRenderObservable.add(() => {
    if (isRotationPlaying) {
      camera.rotation.y += rotationSpeed;
    }
  });
}
