(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-66dc041c"],{"997b":function(t,a,s){"use strict";var r=function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"MyMenu mt-60 mb-60"},[s("a-row",[s("a-col",{attrs:{span:12,offset:6}},[s("div",{staticClass:"t-left"},[s("a-card",{attrs:{hoverable:""}},[s("a-card-meta",{attrs:{title:this.g.userInfo.account,description:"This is the description"}},[s("a-avatar",{staticStyle:{backgroundColor:"#87d068"},attrs:{slot:"avatar",size:"large",icon:"user"},slot:"avatar"})],1)],1)],1),s("div",[s("a-menu",{attrs:{mode:"horizontal"},model:{value:t.current,callback:function(a){t.current=a},expression:"current"}},[s("a-menu-item",{key:"assets"},[s("router-link",{attrs:{to:"/my/assets"}},[t._v("My Assets")])],1),s("a-menu-item",{key:"contract"},[s("router-link",{attrs:{to:"/my/contract"}},[t._v("Contract Account")])],1),s("a-menu-item",{key:"deposit"},[s("router-link",{attrs:{to:"/my/deposit"}},[t._v("Deposit Account")])],1),s("a-menu-item",{key:"withdraw"},[s("router-link",{attrs:{to:"/my/withdraw"}},[t._v("Withdraw")])],1),s("a-menu-item",{key:"authentication"},[s("router-link",{attrs:{to:"/my/authentication"}},[t._v("Authentication")])],1),s("a-menu-item",{key:"login-log"},[s("router-link",{attrs:{to:"/my/login-log"}},[t._v("Login Log")])],1)],1)],1)])],1)],1)},e=[],o={name:"MyMenu",props:{msg:String},data:function(){return{current:[]}},methods:{init:function(){var t=window.location.hash,a=t.lastIndexOf("/"),s=t.substring(a+1,t.length);console.log(s),this.current=[s]}},mounted:function(){this.init()}},n=o,i=s("2877"),c=Object(i["a"])(n,r,e,!1,null,"53569cf3",null);a["a"]=c.exports},b5bc:function(t,a,s){"use strict";s.r(a);var r=function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"Contract"},[s("MyMenu"),s("a-row",{staticClass:"t-left"},[s("a-col",{attrs:{span:12,offset:6}},[s("a-row",{staticStyle:{display:"none"},attrs:{type:"flex"}},[s("a-statistic",{attrs:{title:"Status",value:"Pending"}}),s("a-statistic",{style:{margin:"0 32px"},attrs:{title:"Price",prefix:"$",value:568.08}}),s("a-statistic",{attrs:{title:"Balance",prefix:"$",value:3345.08}})],1),s("a-row",{staticStyle:{display:"none"},attrs:{gutter:16}},[s("a-col",{attrs:{span:12}},[s("a-card",[s("a-statistic",{staticStyle:{"margin-right":"50px"},attrs:{title:"Feedback",value:11.28,precision:2,suffix:"%","value-style":{color:"#3f8600"}},scopedSlots:t._u([{key:"prefix",fn:function(){return[s("a-icon",{attrs:{type:"arrow-up"}})]},proxy:!0}])})],1)],1),s("a-col",{attrs:{span:12}},[s("a-card",[s("a-statistic",{staticClass:"demo-class",attrs:{title:"Idle",value:9.3,precision:2,suffix:"%","value-style":{color:"#cf1322"}},scopedSlots:t._u([{key:"prefix",fn:function(){return[s("a-icon",{attrs:{type:"arrow-down"}})]},proxy:!0}])})],1)],1)],1),s("a-row",[s("a-col",[s("a-card",[s("h3",[t._v("Total Assets : 123456 USD")])])],1)],1),s("a-row",[s("a-card",[s("a-row",{staticClass:"t-left"},[s("h4",[t._v("BTC")])]),s("a-row",[s("a-col",{staticClass:"t-left",attrs:{span:12}},[t._v(" 123 BTC ≈ 456 USD ")]),s("a-col",{staticClass:"t-right",attrs:{span:12}},[s("a-button-group",[s("a-button",{attrs:{type:"primary",ghost:""}},[t._v(" Recharge ")]),s("a-button",{attrs:{type:"danger",ghost:""},on:{click:t.onClickWithdraw}},[t._v(" Withdraw ")])],1)],1)],1),s("a-row",[s("h5",[t._v("Wallet Address")]),s("div",{attrs:{id:"qrcode"}}),s("a-input-search",{attrs:{value:t.wallet_address,readonly:"readonly",placeholder:"wallet address"},on:{search:t.onSearch}},[s("a-button",{attrs:{slot:"enterButton",type:"primary",ghost:""},slot:"enterButton"},[t._v(" Copy ")])],1)],1)],1),s("a-card",[s("a-row",{staticClass:"t-left"},[s("h4",[t._v("ETH")])]),s("a-row",[s("a-col",{staticClass:"t-left",attrs:{span:12}},[t._v(" 123 ETH ≈ 456 USD ")]),s("a-col",{staticClass:"t-right",attrs:{span:12}},[s("a-button-group",[s("a-button",{attrs:{type:"primary",ghost:""}},[t._v(" Recharge ")]),s("a-button",{attrs:{type:"danger",ghost:""},on:{click:t.onClickWithdraw}},[t._v(" Withdraw ")])],1)],1)],1)],1),s("a-card",[s("a-row",{staticClass:"t-left"},[s("h4",[t._v("USDT")])]),s("a-row",[s("a-col",{staticClass:"t-left",attrs:{span:12}},[t._v(" 123 USDT ≈ 456 USD ")]),s("a-col",{staticClass:"t-right",attrs:{span:12}},[s("a-button-group",[s("a-button",{attrs:{type:"primary",ghost:""}},[t._v(" Recharge ")]),s("a-button",{attrs:{type:"danger",ghost:""},on:{click:t.onClickWithdraw}},[t._v(" Withdraw ")])],1)],1)],1)],1),s("a-card",[s("a-row",{staticClass:"t-left"},[s("h4",[t._v("LETH")])]),s("a-row",[s("a-col",{staticClass:"t-left",attrs:{span:12}},[t._v(" 123 LETH ≈ 456 USD ")]),s("a-col",{staticClass:"t-right",attrs:{span:12}},[s("a-button-group",[s("a-button",{attrs:{type:"primary",ghost:""}},[t._v(" Recharge ")]),s("a-button",{attrs:{type:"danger",ghost:""},on:{click:t.onClickWithdraw}},[t._v(" Withdraw ")])],1)],1)],1)],1)],1)],1)],1)],1)},e=[],o=s("997b"),n={name:"Contract",components:{MyMenu:o["a"]},data:function(){return{wallet_address:"1P46orWf7cCveV6n8cRqhNncBYLd1ZxknT"}},methods:{init:function(){}},mounted:function(){this.init()}},i=n,c=s("2877"),l=Object(c["a"])(i,r,e,!1,null,"41517f5e",null);a["default"]=l.exports}}]);
//# sourceMappingURL=chunk-66dc041c.ff15d574.js.map