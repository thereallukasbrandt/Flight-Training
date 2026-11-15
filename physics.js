// SI internally. These are teaching models, not aircraft performance data.
export const G = 9.80665, KT = 0.5144444444, FT = 0.3048;
export const rad = x => x * Math.PI / 180;
export const deg = x => x * 180 / Math.PI;
export function turn(bank, knots) {
  const p = rad(bank), n = 1 / Math.cos(p), v = knots * KT;
  return { n, stallRatio: Math.sqrt(n), inducedRatio: n*n,
    radius: bank === 0 ? Infinity : v*v/(G*Math.tan(p)), rate: deg(G*Math.tan(p)/v) };
}
export function pivotal(knots) { return (knots*KT)**2/G/FT; }
export function liftCoefficient(alpha) { return alpha <= 16 ? 0.2 + alpha*0.08125 : 1.5 - (alpha-16)*0.07; }
export function dutch(t, damping) {
  const wn = 1.25, wd = wn*Math.sqrt(1-damping*damping), envelope = 6*Math.exp(-damping*wn*t);
  // An illustrative eigenmode shape. Phase/amplitude are chosen, not aircraft-identified.
  return { beta: envelope*Math.cos(wd*t), roll: 0.8*envelope*Math.sin(wd*t), envelope, wn, wd };
}
export function groundTurn(position, tas, wind, radiusFt) {
  const theta = rad(position), va=tas*KT, w=wind*KT;
  const tx=-Math.sin(theta), ty=Math.cos(theta), wt=w*tx, wn=w*Math.cos(theta);
  const alongAir=Math.sqrt(va*va-wn*wn), vg=wt+alongAir, cosDrift=alongAir/va;
  const ax=vg*tx-w, ay=vg*ty;
  return { vg:vg/KT, bank:deg(Math.atan(vg*vg/(G*radiusFt*FT*cosDrift))),
    heading:Math.atan2(ay,ax), theta, drift:deg(Math.acos(cosDrift)) };
}
export function glide({target=65, flaps=false, groundEffect=false, heightFt=600}={}) {
  const m=1100,S=16.2,b=11,rho=1.225,cd0=0.028+(flaps?0.035:0),k=0.055;
  const v0=75*KT, vf=target*KT, h0=heightFt*FT, e0=G*h0+0.5*v0*v0, dt=0.1;
  const speed=t=>{const u=Math.min(1,t/20);return v0+(vf-v0)*(3*u*u-2*u*u*u);};
  let t=0,h=h0,e=e0,x=0,loss=0;
  const points=[{t,h,v:v0,pe:G*h,ke:0.5*v0*v0,e,loss,x,drag:0}];
  for(let i=0;i<3000 && h>0;i++) {
    const vm=speed(t+dt/2), vnext=speed(t+dt), q=0.5*rho*vm*vm;
    const cl=m*G/(q*S);
    const factor=groundEffect?1-0.45*Math.exp(-3*Math.max(0,h)/b):1;
    const drag=q*S*(cd0+k*factor*cl*cl), de=drag*vm/m*dt;
    const enext=e-de, hnext=(enext-0.5*vnext*vnext)/G;
    let fraction=1;
    if(hnext<=0) fraction=h/(h-hnext);
    const tn=t+dt*fraction, vn=speed(tn);
    // Locate the exact zero-height endpoint while preserving the energy identity.
    const hn=fraction<1?0:hnext, en=G*hn+0.5*vn*vn;
    loss=e0-en; x+=vm*dt*fraction;
    points.push({t:tn,h:hn,v:vn,pe:G*hn,ke:0.5*vn*vn,e:en,loss,x,drag});
    t=tn;h=hn;e=en;
  }
  return {points,initial:e0,end:points.at(-1)};
}
