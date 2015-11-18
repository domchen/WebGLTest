//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

var gl:WebGLRenderingContext;
var SCREEN_WIDTH = 512;
var SCREEN_HEIGHT = 512;

class Main {

    public constructor(canvas:HTMLCanvasElement) {
        this.init(canvas);
    }


    private init(canvas:HTMLCanvasElement):void {
        SCREEN_WIDTH = canvas.width;
        SCREEN_HEIGHT = canvas.height;
        gl = GL.initWebGL(canvas);
        var attr = gl.getContextAttributes();
        console.dir(attr);
        gl.enable(gl.BLEND);
        gl.enable(gl.STENCIL_TEST);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        Http.loadAll(["src/shaders/shader-vs.glsl", "src/shaders/shader-fs.glsl", "resource/test.png"], this.initShaders, this);
    }

    private initShaders(resultList:any[]):void {
        var vertexShader = GL.createShader(gl, gl.VERTEX_SHADER, resultList[0]);
        var fragmentShader = GL.createShader(gl, gl.FRAGMENT_SHADER, resultList[1]);
        var image:HTMLImageElement = resultList[2];
        //初始化着色器
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.log("Unable to initialize the shader program.");
        }
        gl.useProgram(shaderProgram);


        var u_resolution = gl.getUniformLocation(shaderProgram, "u_ScreenSize");
        gl.uniform2f(u_resolution, SCREEN_WIDTH, SCREEN_HEIGHT);

        var u_TextureSize = gl.getUniformLocation(shaderProgram, "u_TextureSize");
        gl.uniform2f(u_TextureSize, image.width, image.height);

        var u_Sampler = gl.getUniformLocation(shaderProgram, "u_Sampler");
        gl.uniform1i(u_Sampler, 1);

        var matrix = new egret.Matrix();
        matrix.translate(300, 300);
        var m = new egret.Matrix();
        //m.rotate(Math.PI*0.5);
        //matrix.$preMultiplyInto(m,m);

        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var size = Float32Array.BYTES_PER_ELEMENT;
        var length = size*11;
        enableAttribute(gl,shaderProgram,"a_TexCoord",2,length,0);
        enableAttribute(gl,shaderProgram,"a_Position",2,length,size * 2);
        enableAttribute(gl,shaderProgram,"a_Alpha",1,length,size * 4);
        enableAttribute(gl,shaderProgram,"a",1,length,size * 5);
        enableAttribute(gl,shaderProgram,"b",1,length,size * 6);
        enableAttribute(gl,shaderProgram,"c",1,length,size * 7);
        enableAttribute(gl,shaderProgram,"d",1,length,size * 8);
        enableAttribute(gl,shaderProgram,"tx",1,length,size * 9);
        enableAttribute(gl,shaderProgram,"ty",1,length,size * 10);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);

        var texture = createTexture(gl, image);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.stencilFunc(gl.NEVER,0x00,0xFF);
        gl.stencilOp(gl.INCR,gl.KEEP,gl.KEEP);

        var clipArray = createBufferForImage(0, 0, 256, 256, 50, 50, 200, 200, 1, m);
        var clipVertices = new Float32Array(clipArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, clipVertices, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.stencilFunc(gl.EQUAL,0x1,0xFF);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);

        var array = createBufferForImage(0, 0, 256, 256, 0, 0, 300, 300, 1, m);
        var vertices = new Float32Array(array);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

}

function enableAttribute(gl:WebGLRenderingContext,program:WebGLProgram,name:string,size:number,length:number,offset:number):void{
    var location = gl.getAttribLocation(program, name);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, length, offset);
    gl.enableVertexAttribArray(location);
}

function createBufferForImage(sourceX:number, sourceY:number, sourceWidth:number, sourceHeight:number,
                              targetX:number, targetY:number, targetWidth:number, targetHeight:number,
                              alpha:number, m:egret.Matrix):number[] {
    var a = m.a, b = m.b, c = m.c, d = m.d, tx = m.tx, ty = m.ty;
    var vertices = [
        sourceX, sourceY + sourceHeight, targetX, targetY + targetHeight, alpha, a, b, c, d, tx, ty,
        sourceX, sourceY, targetX, targetY, alpha, a, b, c, d, tx, ty,
        sourceX + sourceWidth, sourceY + sourceHeight, targetX + targetWidth, targetY + targetHeight, alpha, a, b, c, d, tx, ty,
        sourceX + sourceWidth, sourceY, targetX + targetWidth, targetY, alpha, a, b, c, d, tx, ty
    ];
    return vertices;
}

function createTexture(gl:WebGLRenderingContext, image:HTMLImageElement):WebGLTexture {
    var texture = gl.createTexture();
    if (!texture) {
        console.log("failed to create the texture object!")
        return null;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function initFramebufferObject() {
    var framebuffer, texture, depthBuffer;

    // Define the error handling function
    var error = function () {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    }

    // Create a frame buffer object (FBO)
    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        console.log('Failed to create frame buffer object');
        return error();
    }

    // Create a texture object and set its size and parameters
    texture = gl.createTexture(); // Create a texture object
    if (!texture) {
        console.log('Failed to create texture object');
        return error();
    }
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the object to target
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SCREEN_WIDTH, SCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    framebuffer.texture = texture; // Store the texture object

    // Create a renderbuffer object and Set its size and parameters
    depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
    if (!depthBuffer) {
        console.log('Failed to create renderbuffer object');
        return error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Attach the texture and the renderbuffer object to the FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // Check if FBO is configured correctly
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return error();
    }

    // Unbind the buffer object
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    //gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);


    return framebuffer;
}

