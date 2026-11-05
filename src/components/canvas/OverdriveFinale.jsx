import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CapsuleGeometry, SphereGeometry, Matrix4, Quaternion, Vector3, MathUtils } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Smooth phalanges, knuckles and palm merged once into one GPU draw call.
// Index fingertip remains at (-0.14, 0.0125, 0), matching the power button.
function buildHand() {
  const parts=[];
  const up=new Vector3(0,1,0);
  function ellipsoid(x,y,z,sx,sy,sz) {
    const g=new SphereGeometry(1,20,12);
    g.scale(sx,sy,sz);g.translate(x,y,z);parts.push(g);
  }
  function bone(a,b,radius) {
    const start=new Vector3(...a),end=new Vector3(...b);
    const direction=end.clone().sub(start);
    const g=new CapsuleGeometry(radius,Math.max(0.01,direction.length()-radius*2),6,12);
    const rotation=new Quaternion().setFromUnitVectors(up,direction.normalize());
    g.applyMatrix4(new Matrix4().compose(start.add(end).multiplyScalar(.5),rotation,new Vector3(1,1,1)));
    parts.push(g);
  }
  ellipsoid(.14,1.27,0,.36,.29,.15);
  bone([.14,1.46,0],[.14,2.0,0],.16);
  const digits=[
    [[-.14,1.15,0],[-.14,.80,0],[-.14,.43,0],[-.14,.0125,0]],
    [[.055,1.13,0],[.055,.83,.07],[.055,.67,.28],[.055,.82,.42]],
    [[.25,1.13,0],[.25,.84,.08],[.25,.70,.29],[.25,.84,.40]],
    [[.43,1.15,0],[.43,.91,.08],[.43,.80,.26],[.43,.91,.35]],
    [[-.13,1.35,0],[-.40,1.19,.03],[-.54,.99,.12],[-.47,.86,.23]],
  ];
  digits.forEach((points,digit)=>{
    for(let i=0;i<points.length-1;i++)bone(points[i],points[i+1],(digit===3?.056:.072)-i*.005);
    points.slice(0,-1).forEach(p=>ellipsoid(...p,.078,.08,.082));
  });
  const merged=mergeGeometries(parts,false);
  parts.forEach(g=>g.dispose());
  return merged;
}
const handVertex=`
uniform float uTime;
varying vec3 vNormal; varying vec3 vView; varying vec3 vLocal;
void main(){
 vec3 p=position;
 float tremor=sin(p.y*117.+uTime*41.)*sin(p.x*91.-uTime*29.);
 p+=normal*tremor*.0025;
 vLocal=p; vNormal=normalize(normalMatrix*normal);
 vec4 mv=modelViewMatrix*vec4(p,1.);vView=-mv.xyz;
 gl_Position=projectionMatrix*mv;
}`;
const handFragment=`
uniform float uTime; uniform float uPresence;
varying vec3 vNormal; varying vec3 vView; varying vec3 vLocal;
void main(){
 float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.6);
 float engraving=pow(.5+.5*sin(vLocal.y*190.),22.);
 float sweep=pow(.5+.5*sin(vLocal.y*11.-uTime*4.),18.);
 vec3 light=vec3(.025,.52,1.)*(.12+rim*2.8+engraving*.18);
 light+=vec3(.35,1.,1.)*rim*rim+vec3(.03,.3,.5)*sweep;
 gl_FragColor=vec4(light,(.18+rim*.78+engraving*.12)*uPresence);
 #include <colorspace_fragment>
}`;
const sparkVertex=`
attribute vec3 aVelocity; attribute float aSeed; attribute float aTail;
uniform float uTime; varying float vLife; varying float vHeat;
void main(){
 float birth=aSeed*.20;
 float cycle=min(floor(max(0.,uTime-birth)/.55),2.);
 float age=max(0.,uTime-birth-cycle*.55);
 vLife=(1.-smoothstep(.18,1.1,age))*step(birth,uTime);
 float trail=max(0.,age-aTail*.016);
 vec3 p=position+aVelocity*trail;
 p.y-=4.9*trail*trail;
 vHeat=fract(aSeed*17.);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const sparkFragment=`
varying float vLife; varying float vHeat;
void main(){
 if(vLife<.01)discard;
 gl_FragColor=vec4(mix(vec3(1.,.16,.005),vec3(1.,.88,.28),vHeat)*1.6,vLife);
}`;
export default function OverdriveFinale({ cinema, towerX }) {
  const hand=useRef(),geometry=useRef(),sparks=useRef(),handMaterial=useRef(),sparkMaterial=useRef();
  const handUniforms=useMemo(()=>({uTime:{value:0},uPresence:{value:0}}),[]);
  useLayoutEffect(()=>{
    const merged=buildHand(); geometry.current.copy(merged);merged.dispose();
    // Declarative bufferGeometry and shaderMaterial are disposed by R3F on unmount.
  },[]);
  const buffers=useMemo(()=>{
    const count=640,position=new Float32Array(count*6),velocity=new Float32Array(count*6),seed=new Float32Array(count*2),tail=new Float32Array(count*2);
    for(let i=0;i<count;i++){
      const s=((i*73)%641)/641,angle=i*2.399963,speed=3.5+s*4.5;
      const front=i%3===0;
      const x=((i%19)/18-.5)*1.5,y=front?.4+(i%23)/23*2.7:3.55,z=front?1.47:-1.3+(i%17)/16*2.3;
      for(let end=0;end<2;end++){
        const j=i*2+end;
        position.set([x,y,z],j*3);
        velocity.set([Math.cos(angle)*speed,1.4+s*3.2,front?3+s*3:Math.sin(angle)*speed],j*3);
        seed[j]=s;tail[j]=end;
      }
    }
    return {position,velocity,seed,tail};
  },[]);
  const uniforms=useMemo(()=>({uTime:{value:-1}}),[]);
  useFrame((state,delta)=>{
    const {reach,time}=cinema.current;
    hand.current.visible=reach>.01 && time<1.4;
    const press=time>=0?MathUtils.smoothstep(time,0,.14)*.035:0;
    hand.current.position.set(towerX-.5+.14,3.54+(1-reach)*1.8-press,.6+(1-reach)*2.6);
    handMaterial.current.uniforms.uPresence.value=MathUtils.smoothstep(reach,0,.2)*(time<0?1:1-MathUtils.smoothstep(time,.8,1.4));
    handMaterial.current.uniforms.uTime.value+=Math.min(delta,.05);
    sparkMaterial.current.uniforms.uTime.value=time;
    sparks.current.visible=time>=0 && time<1.65;
  });
  return <>
    <group ref={hand} visible={false}>
      <mesh frustumCulled={false}><bufferGeometry ref={geometry} /><shaderMaterial ref={handMaterial} uniforms={handUniforms} vertexShader={handVertex} fragmentShader={handFragment} transparent blending={AdditiveBlending} depthWrite={false} /></mesh>
    </group>
    <lineSegments ref={sparks} position={[towerX,0,-.3]} frustumCulled={false} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffers.position,3]} />
        <bufferAttribute attach="attributes-aVelocity" args={[buffers.velocity,3]} />
        <bufferAttribute attach="attributes-aSeed" args={[buffers.seed,1]} />
        <bufferAttribute attach="attributes-aTail" args={[buffers.tail,1]} />
      </bufferGeometry>
      <shaderMaterial ref={sparkMaterial} uniforms={uniforms} vertexShader={sparkVertex} fragmentShader={sparkFragment} transparent depthWrite={false} blending={AdditiveBlending} />
    </lineSegments>
  </>;
}
