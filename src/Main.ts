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

class Main {

    public constructor(canvas:HTMLCanvasElement){
        this.init(canvas);
    }


    private horizAspect = 1;
    private init(canvas:HTMLCanvasElement):void{
        this.horizAspect = canvas.width/canvas.height;
        gl = GL.initWebGL(canvas);
        gl.viewport(0,0,800,800)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        Http.loadAll(["src/shaders/shader-vs.glsl","src/shaders/shader-fs.glsl","resource/test.png"],this.initShaders,this);
    }

    private initShaders(resultList:any[]):void{
        var vertexShader = GL.createShader(gl,gl.VERTEX_SHADER,resultList[0]);
        var fragmentShader = GL.createShader(gl,gl.FRAGMENT_SHADER,resultList[1]);
        var image:HTMLImageElement = resultList[2];
        //初始化着色器
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram,vertexShader);
        gl.attachShader(shaderProgram,fragmentShader);
        gl.linkProgram(shaderProgram);
        if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
            console.log("Unable to initialize the shader program.");
        }
        gl.useProgram(shaderProgram);

        var matrix = new Matrix4();
        //matrix.rotate(45,0,0,-1);
        var u_xformMatrix = gl.getUniformLocation(shaderProgram,"u_xformMatrix");
        gl.uniformMatrix4fv(u_xformMatrix,false,matrix.data);


        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var vertices = new Float32Array([
            -0.5,0.5,0.0,1.7,
            -0.5,-0.5,0.0,0.0,
            0.5,0.5,1.7,1.7,
            0.5,-0.5,1.7,0.0
        ]);
        var vertexBuffer = gl.createBuffer();
        if(!vertexBuffer){
            console.log('failed to create the buffer object!');
            return;
        }

        gl.enable(gl.BLEND);
        gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
        var size = vertices.BYTES_PER_ELEMENT;
        var a_Position = gl.getAttribLocation(shaderProgram,"a_Position");
        gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,size*4,0);
        gl.enableVertexAttribArray(a_Position);

        var a_TexCoord = gl.getAttribLocation(shaderProgram,"a_TexCoord");
        gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,size*4,size*2);
        gl.enableVertexAttribArray(a_TexCoord);

        var texture = gl.createTexture();
        if(!texture){
            console.log("failed to create the texture object!")
            return;
        }
        var u_Sampler = gl.getUniformLocation(shaderProgram,"u_Sampler");
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        gl.uniform1i(u_Sampler,0);

        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

    }


}


