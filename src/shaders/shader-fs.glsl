precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
varying float v_Alpha;
void main() {
    gl_FragColor = texture2D(u_Sampler,v_TexCoord)*v_Alpha;
//    if(gl_FragColor.a==0.0){
//        discard;
//    }
}
