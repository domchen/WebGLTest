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
        Http.loadTexts(["src/shaders/shader-vs.glsl","src/shaders/shader-fs.glsl"],this.initShaders,this);
    }

    private initShaders(textList:string[]):void{
        var vertexShader = GL.createShader(gl,gl.VERTEX_SHADER,textList[0]);
        var fragmentShader = GL.createShader(gl,gl.FRAGMENT_SHADER,textList[1]);

        //初始化着色器
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram,vertexShader);
        gl.attachShader(shaderProgram,fragmentShader);
        gl.linkProgram(shaderProgram);
        if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
            console.log("Unable to initialize the shader program.");
        }
        gl.useProgram(shaderProgram);

        var a_Position = gl.getAttribLocation(shaderProgram,"a_Position");
        if(a_Position<0){
            console.log("Failed to get the storage location of a_Position");
            return;
        }
        var matrix = new Matrix4();
        matrix.rotate(45,0,0,1)
        var u_xformMatrix = gl.getUniformLocation(shaderProgram,"u_xformMatrix");
        gl.uniformMatrix4fv(u_xformMatrix,false,matrix.data);


        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var vertices = new Float32Array([
            -0.5,0.5,-0.5,-0.5,0.5,0.5,0.5,-0.5
        ]);
        var vertexBuffer = gl.createBuffer();
        if(!vertexBuffer){
            console.log('failed to creae the buffer object!');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }


}


