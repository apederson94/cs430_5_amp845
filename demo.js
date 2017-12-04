
function multiplyMartices(m1, m2) {
  var resultMatrix = [
    (m1[0] * m2[0]) + (m1[1] * m2[1]) + (m1[2] * m2[2]), (m1[3] * m2[0]) + (m1[4] * m2[1]) + (m1[5] * m2[2])
  ];
}

function rotateImg(vertex, theta) {
  var tmpVertex = [
    vertex[0],
    vertex[1],
    0
  ];

  var rotationMatrix = [
    Math.cos(theta), -Math.sin(theta), 0,
    Math.sin(theta, Math.cos(theta)), 0,
    0, 0, 1
  ];
  return multiplyMartices(rotationMatrix, vertex);
}

function scaleImg(vertex, scalar) {
  var tmpVertex = [
    vertex[0],
    vertex[1],
    0
  ];

  var scalarMatrix = [
    scalar, 0, 0
    0, scalar, 0,
    0, 0, 1
  ];
  return multiplyMartices(scalarMatrix, vertex);
}

function shearImg(vertex, shearX, shearY) {
  var tmpVertex = [
    vertex[0],
    vertex[1],
    0
  ];

  var shearMatrix = [
    1, shearX, 0,
    shearY, 1, 0,
    0, 0, 1
  ];
  return multiplyMartices(shearMatrix, vertex)
}

function translateImg(vertex, translateX, translateY) {
  var tmpVertex = [
    vertex[0],
    vertex[1],
    0
  ];

  var translationMatrix = [
    1, 0, translateX,
    0, 1, translateY,
    0, 0, 1
  ];

  return multiplyMartices(translationMatrix, vertex);

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
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
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
    draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

main();
