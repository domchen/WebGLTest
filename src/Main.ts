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


class Main {

    private canvas:HTMLCanvasElement;

    public constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        Http.loadAll(["src/shaders/shader-vs.glsl", "src/shaders/shader-fs.glsl", "resource/test.png"], this.initShaders, this);

    }

    private initShaders(resultList:any[]):void {
        var vertexShader = resultList[0];
        var fragmentShader = resultList[1];
        var image:HTMLImageElement = resultList[2];

        var player = new egret.Player(this.canvas, vertexShader, fragmentShader);
        var canvas2 = document.createElement("canvas");
        canvas2.width = 400;
        canvas2.height = 400;
        var player2 = new egret.Player(canvas2, vertexShader, fragmentShader);
        var matrix = new egret.Matrix();
        function onTick():void{
            player.clear();
            for(var i=0;i<190;i++){
                player.drawImage(image,matrix);
                player2.drawImage(image,matrix);
            }
        }

        this.startTicker(onTick);


    }

    /**
     * @private
     * 启动心跳计时器。
     */
    private startTicker(callback:Function):void {
        var requestAnimationFrame =
            window["requestAnimationFrame"] ||
            window["webkitRequestAnimationFrame"] ||
            window["mozRequestAnimationFrame"] ||
            window["oRequestAnimationFrame"] ||
            window["msRequestAnimationFrame"];

        if (!requestAnimationFrame) {
            requestAnimationFrame = function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
        }
        var self = this;
        requestAnimationFrame.call(window, onTick);
        function onTick():void {
            callback.call(self);
            requestAnimationFrame.call(window, onTick)
        }
    }
}

