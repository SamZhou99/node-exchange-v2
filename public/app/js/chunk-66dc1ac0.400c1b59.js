(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-66dc1ac0"],{"997b":function(t,n,e){"use strict";var a=function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{staticClass:"MyMenu mt-60 mb-60"},[e("a-row",[e("a-col",{attrs:{span:12,offset:6}},[e("div",{staticClass:"t-left"},[e("a-card",{attrs:{hoverable:""}},[e("a-card-meta",{attrs:{title:this.g.userInfo.account,description:"This is the description"}},[e("a-avatar",{staticStyle:{backgroundColor:"#87d068"},attrs:{slot:"avatar",size:"large",icon:"user"},slot:"avatar"})],1)],1)],1),e("div",[e("a-menu",{attrs:{mode:"horizontal"},model:{value:t.current,callback:function(n){t.current=n},expression:"current"}},[e("a-menu-item",{key:"assets"},[e("router-link",{attrs:{to:"/my/assets"}},[t._v("My Assets")])],1),e("a-menu-item",{key:"contract"},[e("router-link",{attrs:{to:"/my/contract"}},[t._v("Contract Account")])],1),e("a-menu-item",{key:"deposit"},[e("router-link",{attrs:{to:"/my/deposit"}},[t._v("Deposit Account")])],1),e("a-menu-item",{key:"withdraw"},[e("router-link",{attrs:{to:"/my/withdraw"}},[t._v("Withdraw")])],1),e("a-menu-item",{key:"authentication"},[e("router-link",{attrs:{to:"/my/authentication"}},[t._v("Authentication")])],1),e("a-menu-item",{key:"login-log"},[e("router-link",{attrs:{to:"/my/login-log"}},[t._v("Login Log")])],1)],1)],1)])],1)],1)},o=[],i={name:"MyMenu",props:{msg:String},data:function(){return{current:[]}},methods:{init:function(){var t=window.location.hash,n=t.lastIndexOf("/"),e=t.substring(n+1,t.length);console.log(e),this.current=[e]}},mounted:function(){this.init()}},r=i,s=e("2877"),c=Object(s["a"])(r,a,o,!1,null,"53569cf3",null);n["a"]=c.exports},b2c5:function(t,n,e){"use strict";e.r(n);var a=function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{staticClass:"LoginLog"},[e("MyMenu"),e("h1",[t._v("Index")])],1)},o=[],i=e("997b"),r={name:"LoginLog",components:{MyMenu:i["a"]},data:function(){return{}},methods:{init:function(){this.$router.push("/my/assets")}},mounted:function(){this.init()}},s=r,c=e("2877"),u=Object(c["a"])(s,a,o,!1,null,"40263e63",null);n["default"]=u.exports}}]);
//# sourceMappingURL=chunk-66dc1ac0.400c1b59.js.map