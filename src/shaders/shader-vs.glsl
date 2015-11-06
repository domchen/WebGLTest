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
    float x = a * a_Position.x + c * a_Position.y + tx;
    float y = b * a_Position.x + d * a_Position.y + ty;
    vec2 position = vec2(x,y);
    //转换坐标到（-1，1）
    vec2 clipSpace = (position / u_ScreenSize) * 2.0 - 1.0;
    //反转Y轴
    clipSpace = clipSpace * vec2(1, -1);

    gl_Position = vec4(clipSpace, 0, 1);
    v_TexCoord = a_TexCoord / u_TextureSize;
    v_Alpha = a_Alpha;
}