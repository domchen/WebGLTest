precision mediump float;
varying vec4 v_Color;
void main() {
    gl_FragColor = v_Color;//vec4(gl_FragCoord.x/800.0,0.0,gl_FragCoord.y/800.0,1.0);
}
