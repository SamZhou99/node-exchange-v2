(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-8cdda34c"],{1454:function(t,a,s){"use strict";s("b253")},a4a3:function(t,a,s){},b253:function(t,a,s){},e075:function(t,a,s){"use strict";s("a4a3")},fb06:function(t,a,s){"use strict";s.r(a);var i=function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"startup"},[s("a-spin",{attrs:{spinning:t.loading}},[s("div",{staticClass:"spin-content"},[s("a-row",{staticClass:"t-left"},[s("a-col",{attrs:{span:this.g.container.span,offset:this.g.container.offset}},[s("div",{staticClass:"mt30"}),s("div",{staticClass:"starting-project"},[t._v("Starting project")])])],1),s("div",{staticClass:"mt30"}),s("a-row",[s("a-col",{attrs:{span:this.g.container.span,offset:this.g.container.offset}},t._l(t.list,(function(t){return s("Item",{key:t.name,attrs:{itemData:t}})})),1)],1),s("a-row",[s("div",{staticClass:"mt30"})])],1)])],1)},e=[],n=(s("d3b7"),s("159b"),function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("a-row",{staticClass:"bg"},[s("a-col",[s("a-row",{attrs:{type:"flex",justify:"space-around",align:"middle"}},[s("a-col",{attrs:{span:12}},[s("div",{staticClass:"title"},[t._v(t._s(t.itemData.symbol))])]),s("a-col",{staticClass:"t-right",attrs:{span:12}},[s("span",{class:t.statusTextStyle},[t._v(t._s(t.itemData.statusText))])])],1)],1),s("a-col",[s("hr"),s("a-row",[s("a-col",{attrs:{span:6}},[s("img",{attrs:{src:t.itemData.icon,alt:t.itemData.symbol,height:"64"}})]),s("a-col",[s("a-row",[s("a-col",[s("a-col",{attrs:{span:7}},[t._v("Exchange Ratio")]),s("a-col",[t._v("1:"+t._s(1/t.itemData.usdt_exchange)+"(USDT)")])],1),s("a-col",[s("a-col",{attrs:{span:7}},[t._v("Start Time")]),s("a-col",[t._v(t._s(t.itemData.start_time))])],1),s("a-col",[s("a-col",{attrs:{span:7}},[t._v("End Time")]),s("a-col",[t._v(t._s(t.itemData.end_time))])],1),s("a-col",{staticStyle:{"padding-top":"20px"}},[s("a-button",{attrs:{disabled:t.disabled,type:"primary",block:""},on:{click:function(a){return t.onClickItem(t.itemData)}}},[t._v("view details")])],1)],1)],1)],1)],1)],1)}),o=[],c={name:"StartupListItem",components:{},props:["itemData"],data:function(){return{disabled:!0,statusTextStyle:"hui"}},methods:{onClickItem:function(t){this.$router.push("/startup-item?name=".concat(t.symbol.toLocaleLowerCase()))},init:function(){this.disabled=2!=this.itemData.status,2==this.itemData.status?(this.disabled=!1,this.statusTextStyle="lv"):3==this.itemData.status&&(this.statusTextStyle="hong")}},mounted:function(){this.init()}},r=c,l=(s("1454"),s("2877")),m=Object(l["a"])(r,n,o,!1,null,"246044d3",null),u=m.exports,d={name:"Startup",components:{Item:u},data:function(){return{loading:!1,list:[]}},methods:{init:function(){var t=this;this.loading=!0,$.get("".concat(this.g.apiUrl,"/api/currency-platform"),this.pageParameters,(function(a){t.loading=!1;var s=a.data.list;s.forEach((function(t){t.start_time=moment(t.start_time).format("YYYY-MM-DD HH:mm"),t.end_time=moment(t.end_time).format("YYYY-MM-DD HH:mm");var a=(new Date).getTime(),s=new Date(t.start_time).getTime(),i=new Date(t.end_time).getTime();a<s?(t.status=1,t.statusText="has not started"):a>i?(t.status=3,t.statusText="over"):a>s?(t.status=2,t.statusText="ongoing"):(t.status=0,t.statusText="-")})),t.list=s})).fail((function(a){t.loading=!1,console.log(a)}))}},mounted:function(){this.init()}},p=d,f=(s("e075"),Object(l["a"])(p,i,e,!1,null,"cda961a8",null));a["default"]=f.exports}}]);
//# sourceMappingURL=chunk-8cdda34c.b8a997d2.js.map