YUI.add("aui-viewport",function(e,t){var n=e.Lang,r=e.getClassName,i=e.namespace("config.viewport"),s=r("view")+e.config.classNameDelimiter,o=i.columns||(i.columns={12:960,9:720,6:480,4:320}),u=i.minColumns||(i.minColumns=4),a=e.config.doc.documentElement,f=e.getWin(),l=new RegExp("(\\s|\\b)+"+s+"(lt|gt)*\\d+(\\b|\\s)+","g"),c=function(e){var t=[],n=a.className.replace(l,""),r=n,i=a.clientWidth,f=u,c,h;for(var p in o)h=o[p],i>=h?(c="gt",f=Math.max(f,h)):c="lt",t.push(s+c+h);t.push(s+f),r+=" "+t.join(" "),n!=r&&(a.className=r)},h=f.on("resize",e.debounce(c,50)),p=f.on("orientationchange",c);c(),e.Viewport={viewportChange:c,_orientationHandle:p,_resizeHandle:h}},"2.5.0",{requires:["aui-node","aui-component"]});