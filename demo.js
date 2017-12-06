//transformation matrix global variable
var transformMatrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];
//global boolean value to determine when the transformMatrix has changed
//helps to cut down on calculations
var bool = false;

//switch statement cluster to deal with keybindings
window.onkeyup = function(e) {
  var key = e.keyCode ? e.keyCode : e.which;

  switch(key) {
    case 37:
      //left arrow = translate left
      transformMatrix = [
          1, 0, -0.1,
          0, 1, 0
        ];
        break;
    case 39:
      //right arrow = translate right
      transformMatrix = [
        1, 0, 0.1,
        0, 1, 0
      ];
      break;

    case 38:
      //up arrow = translate up
      transformMatrix = [
        1, 0, 0,
        0, 1, 0.1
      ];
      break;

    case 40:
      //down arrow = translate down
      transformMatrix = [
        1, 0, 0,
        0, 1, -0.1
      ];
      break;

    case 82:
      //r = rotate right
      transformMatrix = [
        Math.cos(Math.PI/6), Math.sin(Math.PI/6), 0,
        -Math.sin(Math.PI/6), Math.cos(Math.PI/6), 0
      ];
      break;

    case 69:
      //e = rotate left
      transformMatrix = [
        Math.cos(Math.PI/6), -Math.sin(Math.PI/6), 0,
        Math.sin(Math.PI/6), Math.cos(Math.PI/6), 0
      ];
      break;

    case 77:
      //m = shear x +
      transformMatrix = [
        1, 0.1, 0,
        0, 1, 0
      ];
      break;

    case 78:
      //n = shear y +
      transformMatrix = [
        1, 0, 0,
        0.1, 1, 0
      ];
      break;

    case 74:
      //j = shear y -
      transformMatrix = [
        1, 0, 0,
        -0.1, 1, 0
      ];
      break;

    case 75:
      //k = shear x -
      transformMatrix = [
        1, -0.1, 0,
        0, 1, 0
      ];
      break;

    case 187:
      //= = scale up
      transformMatrix = [
        1.1, 0, 0,
        0, 1.1, 0
      ];
      break;

    case 189:
      //- = scale down
      transformMatrix = [
        0.9, 0, 0,
        0, 0.9, 0
      ];
      break;

    case 220:
      //\ = reset image
      transformMatrix = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1
      ];
      break;

    default:
      transformMatrix = [
        1, 0, 0,
        0, 1, 0,
        0, 1, 1
      ];
  }
  bool = true;
}

var vertexShaderSource = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

out vec2 v_texcoord;

void main() {
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

var fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

function loadShader(gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderSource);

  gl.compileShader(shader);

  return shader;
}

function loadProgram(gl) {
  var program = gl.createProgram();

  var shader = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  gl.attachShader(program, shader);

  shader = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  gl.attachShader(program, shader);

  gl.linkProgram(program);

  return program;
}

function main() {
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");

  if (!gl) {
    return;
  }

  var program = loadProgram(gl);

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
  var textureLocation = gl.getUniformLocation(program, "u_texture");

  var vao = gl.createVertexArray();

  gl.bindVertexArray(vao);

  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionLocation);

  gl.vertexAttribPointer(
      positionLocation, 2, gl.FLOAT, false, 0, 0);

  var texcoords = [
    0, 1,
    0, 0,
    1, 1,
    1, 1,
    0, 0,
    1, 0,
  ];
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texcoordLocation);

  gl.vertexAttribPointer(
      texcoordLocation, 2, gl.FLOAT, true, 0, 0);

  function loadTexture(url) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));

    var img = new Image();
    img.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    img.src = url;

    return tex;
  }

  var image = loadTexture('stone1.png');

  function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.uniform1i(textureLocation, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

  }

  function render(time) {

     var pos = [
       positions[0], positions[1], 1,
       positions[2], positions[3], 1,
       positions[4], positions[5], 1,
       positions[6], positions[7], 1,
       positions[8], positions[9], 1,
       positions[10], positions[11], 1
     ];

     if (transformMatrix[11] != null) {
       positions = transformMatrix;
     } else if (bool){

      //updating position matrix by multiplying it by the transformMatrix
      positions  = [
        pos[0] * transformMatrix[0] + pos[1] * transformMatrix[1] + pos[2] * transformMatrix[2], pos[0] * transformMatrix[3] + pos[1] * transformMatrix[4] + pos[2] * transformMatrix[5],
        pos[3] * transformMatrix[0] + pos[4] * transformMatrix[1] + pos[5] * transformMatrix[2], pos[3] * transformMatrix[3] + pos[4] * transformMatrix[4] + pos[5] * transformMatrix[5],
        pos[6] * transformMatrix[0] + pos[7] * transformMatrix[1] + pos[8] * transformMatrix[2], pos[6] * transformMatrix[3] + pos[7] * transformMatrix[4] + pos[8] * transformMatrix[5],
        pos[9] * transformMatrix[0] + pos[10] * transformMatrix[1] + pos[11] * transformMatrix[2], pos[9] * transformMatrix[3] + pos[10] * transformMatrix[4] + pos[11] * transformMatrix[5],
        pos[12] * transformMatrix[0] + pos[13] * transformMatrix[1] + pos[14] * transformMatrix[2], pos[12] * transformMatrix[3] + pos[13] * transformMatrix[4] + pos[14] * transformMatrix[5],
        pos[15] * transformMatrix[0] + pos[16] * transformMatrix[1] + pos[17] * transformMatrix[2], pos[15] * transformMatrix[3] + pos[16] * transformMatrix[4] + pos[17] * transformMatrix[5]
      ];
  }

    //resetting transformMatrix so it doesn't constantly compound the transformations
    bool = false;

    //reassigning position to object
    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation, 2, gl.FLOAT, false, 0, 0);

    draw();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

}

main();
