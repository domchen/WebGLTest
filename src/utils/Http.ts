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

var extensionMap:any = {};
extensionMap["glsl"] = "text";
extensionMap["vert"] = "text";
extensionMap["frag"] = "text";
extensionMap["jpg"] = "image";
extensionMap["png"] = "image";
extensionMap["gif"] = "image";

class Http {

    public static loadAll(urls:string[],callBack:(resultList:any[])=>void,thisObject:any):void{

        var resultList:any[] = [];

        function next():void{
            if(urls.length==0){
                complete();
                return;
            }
            var url = urls.shift();
            var index = url.lastIndexOf(".");
            var type = "text";
            if(index!=-1){
                var ext = url.substring(index+1).toLowerCase();
                type = extensionMap[ext];
            }
            switch(type){
                case "image":
                    Http.loadImage(url,(image:HTMLImageElement)=>{
                        resultList.push(image);
                        next();
                    },null);
                    break;
                default :
                    Http.loadText(url,(text:string)=>{
                        resultList.push(text);
                        next();
                    },null);
                    break;
            }

        }

        function complete():void{
            callBack.call(thisObject,resultList);
        }

        next();
    }

    public static loadText(url:string, callBack:(text:string)=>void, thisObject:any):void {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "text";
        xhr.onreadystatechange = ():void=> {
            if (xhr.readyState == 4) {// 4 = "loaded"
                var ioError = (xhr.status >= 400 || xhr.status == 0);
                if (ioError) {//请求错误
                    callBack.call(thisObject, "");
                }
                else {
                    callBack.call(thisObject, xhr.response);
                }

            }
        };
        xhr.open("GET",url,true);
        xhr.send();
    }

    public static loadTexts(urls:string[],callBack:(textList:string[])=>void,thisObject:any):void{

        var textList:string[] = [];

        function next():void{
            if(urls.length==0){
                complete();
                return;
            }
            var url = urls.shift();
            Http.loadText(url,(text:string)=>{
                textList.push(text);
                next();
            },null);
        }

        function complete():void{
            callBack.call(thisObject,textList);
        }

        next();
    }

    public static loadImage(url:string,callBack:(image:HTMLImageElement)=>void,thisObject:any):void{
        var image:HTMLImageElement = new Image();
        image.onload = function(){
            image.onload = null;
            image.onerror = null;
            callBack.call(thisObject,image);
        };
        image.onerror = function(){
            image.onload = null;
            image.onerror = null;
            callBack.call(thisObject,null);
        };
        image.src = url;
    }

    public static loadImages(urls:string[],callBack:(imageList:HTMLImageElement[])=>void,thisObject:any):void{
        var imageList:HTMLImageElement[] = [];

        function next():void{
            if(urls.length==0){
                complete();
                return;
            }
            var url = urls.shift();
            Http.loadImage(url,(image:HTMLImageElement)=>{
                imageList.push(image);
                next();
            },null);
        }

        function complete():void{
            callBack.call(thisObject,imageList);
        }

        next();
    }
}