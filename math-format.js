// Semantic, browser-native math: no external script or typesetting request.
const escape = x => String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const v=x=>`<mi>${escape(x)}</mi>`, num=x=>`<mn>${escape(x)}</mn>`, op=x=>`<mo>${escape(x)}</mo>`, roman=x=>`<mi mathvariant="normal">${escape(x)}</mi>`;
const row=(...x)=>`<mrow>${x.join('')}</mrow>`;
const frac=(a,b)=>`<mfrac>${a}${b}</mfrac>`, pow=(a,b)=>{const match=a.match(/^<msub>(<mi>[^<]+<\/mi>)([\s\S]*)<\/msub>$/);return match?`<msubsup>${match[1]}${match[2]}${b}</msubsup>`:`<msup>${a}${b}</msup>`;}, sub=(a,b)=>`<msub>${a}${b}</msub>`;
const sqrt=x=>`<msqrt>${x}</msqrt>`, par=x=>row(op('('),x,op(')')), bracket=x=>row(op('['),x,op(']'));
const dot=x=>`<mover accent="true">${x}<mo>˙</mo></mover>`, ddot=x=>`<mover accent="true">${x}<mo>¨</mo></mover>`;
const fn=(f,x)=>row('<mspace width="0.15em"/>',roman(f),op('⁡'),'<mspace width="0.12em"/>',x);
const math=(body,display='block')=>`<math xmlns="http://www.w3.org/1998/Math/MathML" display="${display}">${body}</math>`;
const aligned=(...lines)=>`<div class="equation">${math(`<mtable displaystyle="true" columnalign="right center left" columnspacing="0.55em" rowspacing="0.7em">${lines.map(([lhs,rhs,relation='='])=>`<mtr><mtd columnalign="right">${lhs}</mtd><mtd columnalign="center">${op(relation)}</mtd><mtd columnalign="left">${rhs}</mtd></mtr>`).join('')}</mtable>`)}</div>`;
const inline=(a,b,relation='=')=>math(row(a,op(relation),b),'inline');
const L=v('L'),W=v('W'),n=v('n'),m=v('m'),g=v('g'),R=v('R'),V=v('V'),h=v('h'),S=v('S'),rho=v('ρ'),phi=v('φ'),delta=v('δ'),omega=v('ω'),zeta=v('ζ'),t=v('t');
const cosPhi=fn('cos',phi),sinPhi=fn('sin',phi),tanPhi=fn('tan',phi),cosDelta=fn('cos',delta);
const V2=pow(V,num(2)),CL=sub(v('C'),v('L')),CLmax=sub(v('C'),row(v('L'),op(','),roman('max')));
const VS=sub(V,roman('S')),VSn=sub(V,row(roman('S'),op(','),n)),VS1=sub(V,row(roman('S'),op(','),num(1))),VSref=sub(V,row(roman('S'),op(','),roman('ref'))),Wref=sub(W,roman('ref'));
const q=v('q'),E=v('E'),H=v('H'),T=v('T'),D=v('D'),k=v('k'),CD0=sub(v('C'),row(v('D'),op(','),num(0))),CDi=sub(v('C'),row(v('D'),op(','),v('i'))),Di=x=>sub(D,row(v('i'),op(','),x));
const Vg=sub(V,v('g')),Va=sub(V,v('a')),Wn=sub(W,v('n')),Wt=sub(W,v('t'));
const wn=sub(omega,n),wd=sub(omega,v('d')),rootDamping=sqrt(row(num(1),op('−'),pow(zeta,num(2))));
const dampingExponent=row(op('−'),zeta,wn,t),oscillation=row(v('A'),fn('cos',par(row(wd,t))),op('+'),v('B'),fn('sin',par(row(wd,t))));
const liftAtStall=row(frac(num(1),num(2)),rho,pow(VSn,num(2)),S,CLmax);
const ft=sub(h,roman('ft')),Vkt=sub(V,roman('kt'));

export const derivationMath={
 'steep-turns':[
  aligned([row(L,cosPhi),W],[n,row(frac(L,W),op('='),frac(num(1),cosPhi)),'≡']),
  aligned([row(n,W),liftAtStall],[frac(VSn,VS1),sqrt(n)]),
  aligned([row(L,sinPhi),frac(row(m,V2),R)],[tanPhi,frac(V2,row(g,R))],[R,frac(V2,row(g,tanPhi))],[omega,frac(row(g,tanPhi),V)]),
  aligned([CDi,row(k,pow(CL,num(2)))],[frac(Di(n),Di(num(1))),pow(n,num(2))])
 ],
 'stalls':[
  aligned([row(n,W),row(frac(num(1),num(2)),rho,pow(VS,num(2)),S,CLmax)],[VS,sqrt(frac(row(num(2),n,W),row(rho,S,CLmax)))]),
  aligned([frac(VS,VSref),sqrt(row(n,frac(W,Wref)))])
 ],
 'power-off-180':[
  aligned([E,row(m,g,h,op('+'),frac(num(1),num(2)),m,V2)],[frac(row(roman('d'),E),row(roman('d'),t)),row(par(row(T,op('−'),D)),V)]),
  aligned([H,row(h,op('+'),frac(V2,row(num(2),g))),'≡'],[row(dot(h),op('+'),frac(V,g),dot(V)),row(op('−'),frac(row(D,V),row(m,g)))],[dot(h),row(op('−'),frac(row(D,V),row(m,g)),op('−'),frac(V,g),dot(V))]),
  aligned([D,row(q,S,par(row(CD0,op('+'),k,pow(CL,num(2)))))],[q,row(frac(num(1),num(2)),rho,V2)])
 ],
 'eights-on-pylons':[
  aligned([row(L,cosPhi),row(m,g)],[row(L,sinPhi),frac(row(m,V2),R)],[tanPhi,frac(V2,row(g,R))]),
  aligned([h,row(R,tanPhi)],[h,row(R,par(frac(V2,row(g,R))),op('='),frac(V2,g))]),
  aligned([ft,frac(pow(par(row(num('1.68781'),Vkt)),num(2)),num('32.174'))],[ft,frac(pow(Vkt,num(2)),num('11.3')),'≈'])
 ],
 'dutch-rolls':[
  aligned([v('λ'),row(op('−'),zeta,wn,op('±'),roman('i'),wn,rootDamping)]),
  aligned([row(q,par(t)),row(pow(roman('e'),dampingExponent),v('F'),par(t))],[row(v('F'),par(t)),oscillation],[wd,row(wn,rootDamping)],[sub(t,frac(num(1),num(2))),frac(fn('ln',par(num(2))),row(zeta,wn))])
 ],
 'turns-around-a-point':[
  aligned([tanPhi,frac(V2,row(g,R))]),
  aligned([sub(v('a'),row(v('g'),op(','),op('⊥'))),row(g,tanPhi,cosDelta,op('='),frac(pow(Vg,num(2)),R))],[tanPhi,frac(pow(Vg,num(2)),row(g,R,cosDelta))]),
  aligned([Vg,row(Wt,op('+'),sqrt(row(pow(Va,num(2)),op('−'),pow(Wn,num(2)))))],[cosDelta,frac(sqrt(row(pow(Va,num(2)),op('−'),pow(Wn,num(2)))),Va)])
 ]
};
export const cardMath={
 'steep-turns':inline(n,frac(num(1),cosPhi)),
 'stalls':inline(VS,sqrt(frac(row(n,W),CLmax)),'∝'),
 'power-off-180':inline(frac(row(roman('d'),E),row(roman('d'),t)),row(par(row(T,op('−'),D)),V)),
 'eights-on-pylons':inline(h,frac(pow(Vg,num(2)),g),'≈'),
 'dutch-rolls':inline(row(ddot(q),op('+'),num(2),zeta,wn,dot(q),op('+'),pow(wn,num(2)),q),num(0)),
 'turns-around-a-point':inline(tanPhi,frac(pow(Vg,num(2)),row(g,R,cosDelta)))
};
