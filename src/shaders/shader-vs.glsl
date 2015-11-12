//屏幕尺寸
uniform vec2 u_ScreenSize;
//纹理尺寸
uniform vec2 u_TextureSize;
attribute vec2 a_Position;
attribute vec2 a_TexCoord;
attribute float a_Alpha;
attribute float a;
attribute float b;
attribute float c;
attribute float d;
attribute float tx;
attribute float ty;
varying vec2 v_TexCoord;
varying float v_Alpha;
void main(){
    mat3 matrix = mat3(a,b,0,c,d,0,tx,ty,1);
    vec3 position = matrix*vec3(a_Position,1);
    //转换坐标到（-1，1）
    vec2 clipSpace = (position.xy / u_ScreenSize) * 2.0 - 1.0;
    //反转Y轴
    clipSpace = clipSpace * vec2(1, -1);

    gl_Position = vec4(clipSpace, 0, 1);
    v_TexCoord = a_TexCoord / u_TextureSize;
    v_Alpha = a_Alpha;
}