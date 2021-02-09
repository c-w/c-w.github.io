window.conway=function(){var v=(t.prototype.get=function(t,e){return t<0&&(t=this.xMax-t),e<0&&(e=this.yMax-e),this.array[t%this.xMax][e%this.yMax]},t.prototype.forEach=function(t){for(var e=0;e<this.xMax;e++)for(var r=0;r<this.yMax;r++){var n=this.array[e][r];null!=n&&t({value:n,x:e,y:r})}},t);function t(t){for(var e=Math.max.apply(Math,t.map(function(t){return t.x}))+1,r=Math.max.apply(Math,t.map(function(t){return t.y}))+1,n=new Array(e),a=0;a<e;a++)n[a]=new Array(r);for(var o=0,i=t;o<i.length;o++){var u=i[o];n[u.x][u.y]=u.value}this.xMax=e,this.yMax=r,this.array=n}var o=(y.build=function(t){for(var e=t.getElementsByTagName("rect"),r=[],n=new Set,a=new Set,o=0;o<e.length;o++){var i=e[o];n.add(Number(i.getAttribute("x"))),a.add(Number(i.getAttribute("y")))}for(var u=Array.from(n).sort(function(t,e){return t-e}),t=Array.from(a).sort(function(t,e){return t-e}),s=u[0],h=t[0],f=u[1]-u[0],c=t[1]-t[0],o=0;o<e.length;o++){var d="0"!==(i=e[o]).getAttribute("data-score");r.push({value:{element:i,state:d?"alive":"dead"},x:(Number(i.getAttribute("x"))-s)/f,y:(Number(i.getAttribute("y"))-h)/c})}return new y(new v(r))},y.prototype.run=function(t){for(;t--;)if(this.nextStep())return!0;return!1},y.prototype.show=function(){this.board.forEach(function(t){t=t.value;return t.element.setAttribute("data-conway-state",t.state)})},y.prototype.reset=function(){this.board.forEach(function(t){return t.value.element.setAttribute("data-conway-state","")})},y.prototype.getNeighbors=function(t,e){return[this.board.get(t-1,e-1),this.board.get(t,e-1),this.board.get(t+1,e-1),this.board.get(t-1,e),this.board.get(t+1,e),this.board.get(t-1,e+1),this.board.get(t,e+1),this.board.get(t+1,e+1)]},y.prototype.getNextState=function(t,e){var r=this.getNeighbors(t,e).filter(function(t){return null!=t&&"alive"===t.state}).length;return"alive"===this.board.get(t,e).state&&2===r||3===r?"alive":"dead"},y.prototype.nextStep=function(){var n=this;this.board.forEach(function(t){var e=t.value,r=t.x,t=t.y;return e.nextState=n.getNextState(r,t)});var r=!0;return this.board.forEach(function(t){var e=t.value,t=e.state;e.state=e.nextState,e.nextState=null,t!==e.state&&(r=!1)}),r},y);function y(t){this.board=t}return{init:function(e){function r(){var t=o.build(e);t.run(a+1)||a++,t.show()}function n(){var t;a<=0||(t=o.build(e),a--,t.run(a),t.show())}var a=0;document.addEventListener("keydown",function(t){"n"===t.key?r():"b"===t.key?n():"r"===t.key&&(t=o.build(e),a=0,t.reset())}),e.addEventListener("click",function(t){return t.preventDefault(),1===t.which&&r(),!1}),e.addEventListener("contextmenu",function(t){return t.preventDefault(),n(),!1})}}}();