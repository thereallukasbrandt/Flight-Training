import test from 'node:test';
import assert from 'node:assert/strict';
import {turn,bankedTurnVectors,pivotal,groundTurn,glide,dutch,G,KT} from '../physics.js';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('banked-turn diagram keeps lift normal to the wing with correctly scaled components',()=>{
 for(const bank of [-70,-60,-45,-30,0,15,30,45,60,70]){
  const v=bankedTurnVectors(bank);
  near(v.wing.x*v.lift.x+v.wing.y*v.lift.y,0);
  near(Math.hypot(v.wing.x,v.wing.y),1);
  near(Math.hypot(v.lift.x,v.lift.y),turn(bank,100).n);
  near(v.lift.y+v.weight.y,0);
  near(Math.hypot(v.vertical.x,v.vertical.y),Math.hypot(v.weight.x,v.weight.y));
  near(v.vertical.x+v.horizontal.x,v.lift.x);
  near(v.vertical.y+v.horizontal.y,v.lift.y);
  if(bank>0){assert.ok(v.wing.y>0);assert.ok(v.lift.x>0);}
 }
});
test('level-turn limiting cases and load/stall/induced-drag scaling',()=>{
 const level=turn(0,100),steep=turn(60,100);
 near(level.n,1);assert.equal(level.radius,Infinity);near(level.rate,0);
 near(steep.n,2);near(steep.stallRatio,Math.SQRT2);near(steep.inducedRatio,4);
 near(turn(45,120).radius/turn(45,60).radius,4);
});
test('pivotal height has the correct units and quadratic scaling',()=>{
 near(pivotal(120)/pivotal(60),4);
 assert.ok(Math.abs(pivotal(100)-10000/11.3)<1);
});
test('wind-circle construction preserves TAS and the requested curvature',()=>{
 for(let theta=0;theta<=360;theta+=15){
  const d=groundTurn(theta,95,20,1200),v=d.vg*KT;
  const airX=v*(-Math.sin(d.theta))-20*KT,airY=v*Math.cos(d.theta);
  near(Math.hypot(airX,airY),95*KT);
  const cos=Math.cos(d.drift*Math.PI/180);
  near(G*Math.tan(d.bank*Math.PI/180)*cos,v*v/(1200*.3048));
 }
 assert.ok(groundTurn(270,95,20,1200).bank>groundTurn(90,95,20,1200).bank);
 const values=[0,90,180,270].map(a=>groundTurn(a,95,0,1200).bank);
 values.forEach(v=>near(v,values[0]));
});
test('glide conserves its energy budget, loses energy monotonically, and reaches ground',()=>{
 for(const target of [60,75,90])for(const flaps of [false,true])for(const groundEffect of [false,true]){
  const sim=glide({target,flaps,groundEffect});assert.equal(sim.end.h,0);
  for(let i=0;i<sim.points.length;i++){
   const p=sim.points[i];near(p.pe+p.ke+p.loss,sim.initial,1e-6);
   near(p.pe,G*p.h);assert.ok(Number.isFinite(p.x));
   if(i)assert.ok(p.e<sim.points[i-1].e);
  }
 }
});
test('flap drag shortens the modeled path; ground effect reduces losses without adding energy',()=>{
 const clean=glide(),flap=glide({flaps:true}),ge=glide({groundEffect:true});
 assert.ok(flap.end.x<clean.end.x);assert.ok(ge.end.x>clean.end.x);
 assert.ok(glide({target:60}).end.ke<glide({target:90}).end.ke);
});
test('greater modal damping reduces the oscillation envelope',()=>{
 assert.ok(dutch(8,.5).envelope<dutch(8,.1).envelope);
 near(dutch(0,.2).beta,6);near(dutch(0,.2).roll,0);
 for(let t=0;t<20;t+=.2){const d=dutch(t,.15);assert.ok(Math.abs(d.beta)<=d.envelope+1e-9);assert.ok(Math.abs(d.roll)<=.8*d.envelope+1e-9);}
});
