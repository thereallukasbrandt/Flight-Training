import {lessons,sources} from './content.js';
import {G,KT,FT,rad,deg,turn,pivotal,liftCoefficient,dutch,groundTurn,glide} from './physics.js';
const $=id=>document.getElementById(id),f=(n,d=1)=>Number.isFinite(n)?n.toFixed(d):'∞';
const colors={orange:'#ee9467',blue:'#526b87',white:'#eaf0f6'};
const plane=(x,y,rotation=0)=>`<g transform="translate(${x} ${y}) rotate(${rotation})" fill="${colors.white}"><path d="M0-15 4-2 17 5 17 8 3 4 3 12 7 15 7 17 0 15-7 17-7 15-3 12-3 4-17 8-17 5-4-2Z"/></g>`;
const svg=(content,label)=>`<svg viewBox="0 0 640 210" role="img" aria-label="${label}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10" fill="${colors.orange}"/></marker></defs>${content}</svg>`;
const text=(x,y,s,color='')=>`<text x="${x}" y="${y}" ${color?`style="fill:${color}"`:''}>${s}</text>`;
const line=(x,y,a,b,color='orange',dash='')=>`<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="${colors[color]}" stroke-width="2" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
function chart(series,{xmin=0,xmax=70,ymin=0,ymax=3.2,xlabel='Bank / degrees',ylabel='Ratio',marker=null,guide=null}={}) {
 const left=55,right=620,top=26,bottom=218,px=x=>left+(x-xmin)/(xmax-xmin)*(right-left),py=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
 let out=`<svg viewBox="0 0 640 265" role="img" aria-label="${ylabel} versus ${xlabel}">`;
 for(let i=0;i<=4;i++){const yy=ymin+(ymax-ymin)*i/4,xx=xmin+(xmax-xmin)*i/4;out+=`<path d="M${left} ${py(yy)}H${right}" stroke="#526b8738"/>`+text(5,py(yy)+4,f(yy,ymax>100?0:1))+text(px(xx)-8,bottom+19,f(xx,0));}
 out+=text(left,14,ylabel)+text(270,258,xlabel);
 for(const s of series){out+=`<path d="${s.points.map((p,i)=>(i?'L':'M')+px(p[0])+','+py(p[1])).join(' ')}" fill="none" stroke="${colors[s.color]}" stroke-width="2.4" ${s.dash?'stroke-dasharray="'+s.dash+'"':''}/>`;}
 if(guide!==null)out+=`<path d="M${px(guide)} ${top}V${bottom}" stroke="${colors.white}" opacity=".3" stroke-dasharray="3 5"/>`;
 if(marker){out+=`<path d="M${px(marker.x)} ${top}V${bottom}" stroke="${colors.orange}" opacity=".35" stroke-dasharray="3 5"/>`;for(const p of marker.points)out+=`<circle cx="${px(marker.x)}" cy="${py(p.y)}" r="4" fill="${colors[p.color]}" stroke="#111f30" stroke-width="1.5"/>`;}
 return out+'</svg>';
}
const range=(id,label,min,max,step,value,unit='')=>`<div class="control"><label for="${id}">${label}<output id="${id}-value" for="${id}">${value}${unit}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-default="${value}" data-unit="${unit}"></div>`;
const select=(id,label,options)=>`<div class="control"><label for="${id}">${label}</label><select id="${id}">${options.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></div>`;
const check=(id,label,checked=false)=>`<label class="check-control"><input type="checkbox" id="${id}" ${checked?'checked':''} data-default="${checked}">${label}</label>`;
const val=id=>Number($(id).value),checked=id=>$(id).checked;
const metrics=items=>items.map(([value,label])=>`<div class="metric"><b>${value}</b><span>${label}</span></div>`).join('');
const legend=items=>items.map(([label,kind])=>`<span class="${kind||''}">${label}</span>`).join('');
let current;
const briefNotes={
 'steep-turns':'Coordinated, level, still-air model. Ratios hold weight and configuration fixed.',
 'stalls':'Illustrative wing curve and separate stall-speed estimate; propeller effects are omitted.',
 'power-off-180':'Still air; prescribed speed schedule; no turn or flare dynamics. Path length is not landing-distance data.',
 'eights-on-pylons':'FAA groundspeed estimate; the triangle and radius assume a still-air circle.',
 'dutch-rolls':'Illustrative stable mode, not aircraft-identified dynamics or the coordination exercise.',
 'turns-around-a-point':'Constant TAS, uniform wind, fixed ground radius; no aircraft performance limits modeled.'
};
function display() {
 const id=location.hash.slice(1),lesson=lessons.find(l=>l.id===id)||lessons[0];current=lesson.id;
 document.title=lesson.title+' — Flight Training';
 $('lesson-nav').innerHTML=lessons.map(l=>`<a href="#${l.id}" ${l===lesson?'aria-current="page"':''}>${l.title}</a>`).join('');
 $('lesson-content').innerHTML=`<div class="lesson-heading"><span class="mono accent">M${String(lessons.indexOf(lesson)+1).padStart(2,'0')} / Maneuvers</span><h1>${lesson.title}</h1><p>${lesson.lead}</p></div><div class="lesson-grid"><article class="explanation"><h2>Why it behaves this way</h2>${lesson.why}<details><summary>Derive the relationship</summary><div class="detail-body">${lesson.derive}</div></details><details><summary>Model assumptions &amp; sources</summary><div class="detail-body"><p>${lesson.model}</p><ul class="sources">${lesson.refs.map(key=>`<li><a href="${sources[key][1]}" target="_blank" rel="noopener noreferrer">${sources[key][0]} ↗</a></li>`).join('')}</ul></div></details></article><section class="experiment" aria-label="${lesson.title} interactive model"><div class="lab-top"><h2>Interactive model</h2><button class="reset" id="reset">Reset</button></div><div class="controls" id="controls"></div><div class="metrics" id="metrics" aria-live="polite"></div><div class="graphic" id="graphic"></div><div class="legend" id="legend"></div><div class="plot" id="plot"></div><div id="extra"></div><p class="lab-caption" id="caption"></p><p class="model-note">${briefNotes[lesson.id]} Full conditions are under “Model assumptions &amp; sources.”</p></section></div><div class="next-lesson"><a href="./index.html#maneuvers">← All maneuvers</a><a href="#${lessons[(lessons.indexOf(lesson)+1)%lessons.length].id}">Next: <span>${lessons[(lessons.indexOf(lesson)+1)%lessons.length].title} →</span></a></div>`;
 const setups={
 'steep-turns':range('bank','Bank angle',0,70,1,45,'°')+range('speed','True airspeed',80,140,1,100,' kt'),
 'stalls':range('alpha','Angle of attack',0,24,.5,10,'°')+range('load','Load factor',1,2,.05,1,' g')+range('weight','Weight / reference weight',.7,1,.01,1,'')+select('power','Power condition',[['off','Power off'],['on','Power on']]),
 'power-off-180':range('target','Target true airspeed',60,90,1,65,' kt')+range('time','Scrub glide',0,100,1,35,'%')+check('flaps','Add flap drag')+check('effect','Include ground effect'),
 'eights-on-pylons':range('gs','Groundspeed estimate',60,140,1,100,' kt')+range('bank','Ideal-circle bank',10,45,1,30,'°')+range('elevation','Pylon elevation',0,3000,100,500,' ft MSL'),
 'dutch-rolls':range('damping','Damping ratio ζ',.05,.7,.01,.15,'')+range('seconds','Scrub time',0,20,.1,4,' s'),
 'turns-around-a-point':range('tas','True airspeed',75,120,1,95,' kt')+range('wind','Wind speed →',0,25,1,15,' kt')+range('radius','Ground radius',600,2000,50,1200,' ft')+range('position','Position around circle',0,360,1,0,'°')};
 $('controls').innerHTML=setups[lesson.id];
 $('controls').addEventListener('input',update);$('controls').addEventListener('change',update);
 $('reset').addEventListener('click',()=>{for(const el of $('controls').querySelectorAll('input,select')){if(el.type==='checkbox')el.checked=el.dataset.default==='true';else if(el.tagName==='SELECT')el.selectedIndex=0;else el.value=el.dataset.default;}update();});
 update();
}
function update(){
 for(const input of $('controls').querySelectorAll('input[type=range]'))$(input.id+'-value').textContent=input.value+input.dataset.unit;
 if(current==='steep-turns'){
  const bank=val('bank'),speed=val('speed'),m=turn(bank,speed),x=260+100*Math.tan(rad(bank));
  $('metrics').innerHTML=metrics([[f(m.n,2)+' g','Load factor'],[f(m.stallRatio,2)+'×','Stall-speed ratio'],[f(m.inducedRatio,2)+'×','Induced-drag ratio']]);
  $('graphic').innerHTML=svg(line(260,150,260,50,'blue','4 5')+line(260,50,x,50,'blue','4 5')+`<path d="M260 150L${x} 50" stroke="${colors.orange}" stroke-width="3" marker-end="url(#arrow)"/>`+line(260,150,260,202,'white')+`<g transform="rotate(${-bank} 260 150)"><path d="M200 150H320" stroke="${colors.white}" stroke-width="5"/><circle cx="260" cy="150" r="6" fill="${colors.white}"/></g>`+text(x+8,46,'L')+text(185,45,'L cos φ = W')+text(274,200,'W')+text(350,90,'Horizontal lift turns the airplane'),'Lift vector resolved into vertical and horizontal components');
  const ns=[],ss=[];for(let b=0;b<=70;b++){const t=turn(b,speed);ns.push([b,t.n]);ss.push([b,t.stallRatio]);}
  $('legend').innerHTML=legend([['Load factor',''],['Stall-speed ratio','blue']]);$('plot').innerHTML=chart([{points:ns,color:'orange'},{points:ss,color:'blue'}],{marker:{x:bank,points:[{y:m.n,color:'orange'},{y:m.stallRatio,color:'blue'}]}});
  $('caption').innerHTML=`At ${bank}°: radius <strong>${f(m.radius/FT,0)} ft</strong>, turn rate <strong>${f(m.rate,1)}°/s</strong> at ${speed} KTAS. ${bank===0?'No horizontal lift: no steady turn.':'The vertical lift component still balances weight.'}`;
 }
 if(current==='stalls'){
  const a=val('alpha'),n=val('load'),w=val('weight'),cl=liftCoefficient(a),vs=50*Math.sqrt(n*w);
  $('metrics').innerHTML=metrics([[f(cl,2),'Chosen wing Cʟ'],[a>=16?'At / past peak':f(16-a,1)+'°','Critical-angle margin'],[f(vs,1)+' KEAS','Separate stall-speed estimate']]);
  $('graphic').innerHTML=svg(`<path d="M70 105H220" stroke="${colors.orange}" stroke-width="2" marker-end="url(#arrow)"/>`+text(70,88,'Relative airflow')+`<g transform="rotate(${a} 360 105)"><path d="M250 105C280 75 390 90 470 105C385 105 300 117 250 105Z" fill="#526b8755" stroke="${colors.white}" stroke-width="2"/><path d="M250 105H470" stroke="${colors.orange}" stroke-dasharray="4 4"/></g>`+text(435,164,'Chord line')+text(70,178,`α = ${a}° • model peak at 16°`),'Wing chord angle relative to a fixed airflow direction');
  const pts=[];for(let x=0;x<=24;x+=.25)pts.push([x,liftCoefficient(x)]);
  $('legend').innerHTML=legend([['Wing lift curve',''],['Critical angle: 16°','white']]);$('plot').innerHTML=chart([{points:pts,color:'orange'}],{xmin:0,xmax:24,ymax:1.7,xlabel:'Angle of attack / degrees',ylabel:'Lift coefficient Cʟ',guide:16,marker:{x:a,points:[{y:cl,color:'orange'}]}});
  $('caption').innerHTML=`${$('power').value==='on'?'<strong>Power on:</strong> slipstream and thrust effects matter in a real airplane. They are omitted from this wing curve.':'<strong>Power off:</strong> the wing still stalls at its critical angle, even with a low nose attitude.'} The load/weight controls change the separate speed calculation, not this chosen lift curve.`;
 }
 if(current==='eights-on-pylons'){
  const gs=val('gs'),bank=val('bank'),h=pivotal(gs),r=h/Math.tan(rad(bank)),scale=Math.min(110/h,390/r),hp=h*scale,rp=r*scale,ax=535,ay=180-hp,px=ax-rp;
  $('metrics').innerHTML=metrics([[f(h,0)+' ft','Height above pylon'],[f(h+val('elevation'),0)+' ft','Estimated MSL altitude'],[f(r,0)+' ft','Ideal still-air circle radius']]);
  $('graphic').innerHTML=svg(line(60,180,590,180,'blue')+line(px,180,ax,ay)+line(ax,ay,ax,180,'white','4 5')+line(px,180,ax,180,'white','4 5')+`<circle cx="${px}" cy="180" r="5" fill="${colors.orange}"/>`+`<path d="M${ax-22} ${ay+22*Math.tan(rad(bank))}L${ax+22} ${ay-22*Math.tan(rad(bank))}" stroke="${colors.white}" stroke-width="4"/>`+text(ax+13,ay+hp/2,`h = ${f(h,0)} ft`)+text((px+ax)/2-35,202,`R = ${f(r,0)} ft`)+text(70,30,`Cross-section • bank ${bank}°`),'Right triangle showing pivotal height, radius, and the banked lateral sight line');
  const pts=[];for(let v=40;v<=160;v++)pts.push([v,pivotal(v)]);
  $('legend').innerHTML=legend([['Pivotal-height estimate','']]);$('plot').innerHTML=chart([{points:pts,color:'orange'}],{xmin:40,xmax:160,ymax:2400,xlabel:'Groundspeed / knots',ylabel:'Height above pylon / feet',marker:{x:gs,points:[{y:h,color:'orange'}]}});
  $('caption').innerHTML=`At ${gs} kt, the estimate is <strong>${f(h,0)} ft above the pylon</strong>. Bank changes the ideal radius, but cancels from the height equation. In wind, the FAA formula is an operational approximation.`;
 }
 if(current==='dutch-rolls'){
  const z=val('damping'),t=val('seconds'),d=dutch(t,z),beta=[],roll=[],env=[];
  for(let x=0;x<=20.001;x+=.1){const q=dutch(x,z);beta.push([x,q.beta]);roll.push([x,q.roll]);env.push([x,q.envelope]);}
  $('metrics').innerHTML=metrics([[f(d.beta,2)+'°','Sideslip β'],[f(d.roll,2)+'°','Bank φ'],[f(Math.log(2)/(z*d.wn),1)+' s','Envelope half-life']]);
  $('graphic').innerHTML=svg(line(140,115,500,115,'blue','3 5')+`<g transform="rotate(${-d.roll} 320 115)"><path d="M230 115H410M320 96V135" stroke="${colors.white}" stroke-width="5"/><circle cx="320" cy="115" r="9" fill="${colors.white}"/></g>`+`<path d="M320 55L${320+d.beta*14} 55" stroke="${colors.orange}" stroke-width="2" marker-end="url(#arrow)"/>`+text(90,30,'Front view: bank φ')+text(360,46,'Sideslip β (illustrated)')+text(235,182,'Roll and sideslip are out of phase'),'Illustrative bank and lateral sideslip at the selected time');
  $('legend').innerHTML=legend([['Sideslip β',''],['Bank φ','blue'],['Decay envelope','white dashed']]);$('plot').innerHTML=chart([{points:beta,color:'orange'},{points:roll,color:'blue'},{points:env,color:'white',dash:'4 5'}],{xmax:20,ymin:-7,ymax:7,xlabel:'Time / seconds',ylabel:'Angle / degrees',marker:{x:t,points:[{y:d.beta,color:'orange'},{y:d.roll,color:'blue'}]}});
  $('caption').innerHTML=`At ζ = ${f(z,2)}, the envelope halves every <strong>${f(Math.log(2)/(z*d.wn),1)} s</strong>. The curves show an illustrative natural mode; the deliberate coordination exercise is a different task.`;
 }
 if(current==='turns-around-a-point'){
  const pos=val('position'),tas=val('tas'),wind=val('wind'),radius=val('radius'),d=groundTurn(pos,tas,wind,radius),px=310+80*Math.cos(d.theta),py=108-80*Math.sin(d.theta),pts=[];
  for(let a=0;a<=360;a+=2)pts.push([a,groundTurn(a,tas,wind,radius).bank]);
  $('metrics').innerHTML=metrics([[f(d.vg,1)+' kt','Groundspeed'],[f(d.bank,1)+'°','Required bank'],[f(d.drift,1)+'°','Heading–track separation']]);
  $('graphic').innerHTML=svg(`<circle cx="310" cy="108" r="80" stroke="${colors.blue}" stroke-width="2" fill="none" stroke-dasharray="4 5"/><circle cx="310" cy="108" r="4" fill="${colors.orange}"/>`+plane(px,py,90-deg(d.heading))+`<path d="M480 62H575" stroke="${colors.orange}" stroke-width="2" marker-end="url(#arrow)"/>`+text(475,45,`Wind ${wind} kt`)+text(275,207,'Fixed ground circle')+text(60,55,'Arrow = heading'),'Circular ground track with a heading-corrected aircraft and a wind arrow');
  $('legend').innerHTML=legend([['Required bank','']]);$('plot').innerHTML=chart([{points:pts,color:'orange'}],{xmax:360,ymax:Math.max(40,Math.ceil(Math.max(...pts.map(p=>p[1]))/10)*10),xlabel:'Position around circle / degrees',ylabel:'Bank / degrees',marker:{x:pos,points:[{y:d.bank,color:'orange'}]}});
  $('caption').innerHTML=`${wind===0?'With no wind, heading follows the track and the required bank is constant.':'In this diagram, 270° is downwind and 90° is upwind. Compare the bank at those positions.'} ${d.bank>45?'This input combination demands a large bank; it is a mathematical result, not a maneuver target.':''}`;
 }
 if(current==='power-off-180'){
  const options={target:val('target'),flaps:checked('flaps'),groundEffect:checked('effect')},sim=glide(options),base=glide({target:options.target}),p=sim.points[Math.round(val('time')/100*(sim.points.length-1))],e0=sim.initial;
  $('metrics').innerHTML=metrics([[f(p.h/FT,0)+' ft','Model height'],[f(p.v/KT,1)+' kt','True airspeed'],[f(p.loss,0)+' J/kg','Energy dissipated']]);
  const he=p.h/FT,scaleH=120/600,xx=75+470*p.x/Math.max(sim.end.x,base.end.x),yy=175-he*scaleH;
  $('graphic').innerHTML=svg(line(45,175,595,175,'blue')+`<path d="${sim.points.map((v,i)=>(i?'L':'M')+(75+470*v.x/Math.max(sim.end.x,base.end.x))+','+(175-v.h/FT*scaleH)).join(' ')}" fill="none" stroke="${colors.blue}" stroke-width="1.5" stroke-dasharray="3 5"/>`+plane(xx,yy,90)+text(55,30,`Remaining glide segment • t = ${f(p.t,1)} s`)+text(60,200,'Not a full 180° approach or flare simulation'),'An illustrative glide segment ending at model ground level');
  const pe=sim.points.map(p=>[p.t,p.pe]),ke=sim.points.map(p=>[p.t,p.ke]),total=sim.points.map(p=>[p.t,p.e]),baseline=base.points.map(p=>[p.t,p.e]);
  $('legend').innerHTML=legend([['Potential','blue'],['Kinetic',''],['Total','white'],['Clean / no GE total','dashed']]);$('plot').innerHTML=chart([{points:pe,color:'blue'},{points:ke,color:'orange'},{points:total,color:'white'},{points:baseline,color:'white',dash:'3 5'}],{xmax:Math.ceil(Math.max(sim.end.t,base.end.t)/10)*10,ymax:Math.ceil(e0/500)*500,xlabel:'Elapsed time / seconds',ylabel:'Specific energy / J per kg',marker:{x:p.t,points:[{y:p.pe,color:'blue'},{y:p.ke,color:'orange'}]}});
  $('extra').innerHTML=`<div class="energy-budget" aria-hidden="true"><span class="potential" style="width:${p.pe/e0*100}%"></span><span class="kinetic" style="width:${p.ke/e0*100}%"></span><span class="lost" style="width:${p.loss/e0*100}%"></span></div><div class="equation-key">Initial budget: ${f(p.pe/e0*100,0)}% potential · ${f(p.ke/e0*100,0)}% kinetic · ${f(p.loss/e0*100,0)}% dissipated</div>`;
  $('caption').innerHTML=`Model path length: <strong>${f(sim.end.x/FT,0)} ft</strong>; clean / no-ground-effect comparison: ${f(base.end.x/FT,0)} ft. ${options.target<75?'The selected deceleration releases kinetic energy.':options.target>75?'The selected acceleration spends additional height on kinetic energy.':'Constant speed leaves kinetic energy unchanged.'} Drag still removes total energy. The trace above follows the modeled height along the segment.`;
 }
}
window.addEventListener('hashchange',()=>{display();window.scrollTo({top:0,behavior:'instant'});});
display();
