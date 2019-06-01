
Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
let createDate = function () {
  return new Date().Format('yyyy-MM-dd hh:mm:ss');
}
let getUniqueId = function (uid) {
  let r1 = Math.floor(Math.random()*10),
      r2 = Math.floor(Math.random()*10);
  let sysDate = new Date().Format('yyyyMMddhhmmss'),
      createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
  return uid + r1 + sysDate + r2;
}
exports.getUniqueId = getUniqueId;
exports.createDate = createDate;
