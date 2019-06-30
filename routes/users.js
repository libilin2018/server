var express = require("express");
var router = express.Router();
var User = require("../models/users");
var utils = require('./../utils/util');

/* GET users listing. */
router.post("/login", (req, res, next) => {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    };
    User.findOne(param, (err, doc) => {
        if (err) {
            res.json({
                status: "1",
                msg: err.message
            });
        } else {
            // console.log(doc);
            if (doc) {
                // 返回cookie
                res.cookie("userId", doc.userId, {
                    path: "/",
                    maxAge: 1000 * 60 * 60,
                    signed: true
                });
                res.cookie("userName", doc.userName, {
                    path: "/",
                    maxAge: 1000 * 60 * 60,
                    signed: true
                });
                res.json({
                    status: "0",
                    msg: "登录成功",
                    result: {
                        userName: doc.userName
                    }
                });
            } else {
                res.json({
                    status: "1",
                    msg: "账号或密码错误"
                });
            }
        }
    });
});

router.post('/register', (req, res, next) => {
    const userId = utils.getUniqueId('10'),
        userName = req.body.userName,
        userPwd = req.body.userPwd;
    User.find({ userName }, (err, doc) => {
        if (doc.length) {
            res.json({
                status: '10005',
                msg: '该用户已存在',
                result: ''
            })
        } else {
            const user = new User({
                userId,
                userName,
                userPwd
            });
            user.save((err, doc) => {
                // console.log(doc);
                if (err) {
                    res.json({
                        status: '1',
                        msg: err.message
                    })
                } else {
                    res.cookie("userId", doc.userId, {
                        path: "/",
                        maxAge: 1000 * 60 * 60
                    });
                    res.cookie("userName", doc.userName, {
                        path: "/",
                        maxAge: 1000 * 60 * 60
                    });
                    res.json({
                        status: '0',
                        msg: 'success',
                        result: {
                            userName
                        }
                    })
                }
            })
        }
    })
})

router.post("/logout", (req, res, next) => {
    res.cookie("userId", "", {
        path: "/",
        maxAge: -1
    });
    res.cookie("userName", "", {
        path: "/",
        maxAge: -1
    });
    res.json({
        status: "0",
        msg: "已安全退出",
        msg: ""
    });
});

router.get("/checklogin", (req, res, next) => {
    if (req.signedCookies.userId) {
        res.json({
            status: "0",
            msg: "",
            result: {
                userName: req.signedCookies.userName
            }
        });
    }
});

// 获取订单
router.get("/cartlist", (req, res, next) => {
    let userId = req.signedCookies.userId;
    // console.log(req.signedCookies, userId);
    User.findOne({
            userId
        },
        (err, doc) => {
            if (err) {
                res.json({
                    status: "1",
                    msg: "err.message",
                    result: ""
                });
            } else {
                res.json({
                    status: "0",
                    msg: "",
                    result: doc.cartList
                });
            }
        }
    );
});

router.post("/cartdel", (req, res, next) => {
    let userId = req.signedCookies.userId,
        productId = req.body.productId;
    User.update({
            userId
        }, {
            $pull: {
                cartList: {
                    productId
                }
            }
        },
        (err, doc) => {
            if (err) {
                res.json({
                    status: "1",
                    msg: err.message,
                    result: ""
                });
            } else {
                res.json({
                    status: "0",
                    msg: "",
                    result: ""
                });
            }
        }
    );
});

router.post("/cartedit", (req, res, next) => {
    let userId = req.signedCookies.userId,
        productId = req.body.productId,
        productNum = req.body.productNum,
        checked = req.body.checked;
    // console.log(checked);
    User.update({
            userId,
            "cartList.productId": productId
        }, {
            "cartList.$.productNum": productNum,
            "cartList.$.checked": checked
        },
        (err, doc) => {
            if (err) {
                res.json({
                    status: "1",
                    msg: err.message,
                    result: ""
                });
            } else {
                res.json({
                    status: "0",
                    msg: "success",
                    result: ""
                });
            }
        }
    );
});

router.post("/cartCheckAll", (req, res, next) => {
    let userId = req.signedCookies.userId,
        checked = req.body.checkAll ? "1" : "0";
    User.findOne({ userId }, (err, user) => {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            });
        } else {
            if (user) {
                user.cartList.forEach(item => {
                    item.checked = checked;
                });
                user.save((err1, doc) => {
                    if (err1) {
                        res.json({
                            status: "1",
                            msg: err.message,
                            result: ""
                        });
                    } else {
                        res.json({
                            status: "0",
                            msg: "success",
                            result: ""
                        });
                    }
                });
            }
        }
    });
});

router.get("/userAddress", (req, res, next) => {
    let userId = req.signedCookies.userId;
    User.findOne({ userId }, (err, doc) => {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            });
        } else {
            res.json({
                status: "0",
                msg: "success",
                result: doc.addressList
            });
        }
    });
});

router.post("/addAddress", (req, res, next) => {
    let userId = req.signedCookies.userId,
        userName = req.body.userName,
        streetName = req.body.streetName,
        tel = req.body.tel;
    console.log(userName, streetName, tel);
    User.findOne({ userId }, (err, userDoc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            let addressId = utils.getUniqueId('12');
            let obj = {
                addressId,
                userName,
                streetName,
                tel,
                isDefault: false
            }
            userDoc.addressList.unshift(obj);
            userDoc.save((err1, newDoc) => {
                if (err1) {
                    res.json({
                        status: '1',
                        msg: err1.message,
                        result: ''
                    })
                } else {
                    res.json({
                        status: '0',
                        msg: '添加地址成功',
                        result: userDoc.addressList
                    })
                }
            })
        }
    })
})

// 设置默认地址
router.post("/setDefalutAddress", (req, res, next) => {
    let userId = req.signedCookies.userId,
        addressId = req.body.addressId;
    if (!addressId) {
        res.json({
            status: "10001",
            msg: "addressId not found",
            result: ""
        });
    } else {
        User.findOne({ userId }, (err, user) => {
            if (err) {
                res.json({
                    status: "1",
                    msg: err.message,
                    result: ""
                });
            } else {
                let addressList = user.addressList;
                addressList.forEach(item => {
                    if (item.addressId == addressId) {
                        item.isDefault = true;
                    } else {
                        item.isDefault = false;
                    }
                });
                user.save((err1, doc) => {
                    res.json({
                        status: "0",
                        msg: "",
                        result: ""
                    });
                });
            }
        });
    }
});

// 删除地址
router.post("/delAddress", (req, res, next) => {
    let userId = req.signedCookies.userId,
        addressId = req.body.addressId;
    User.update({
            userId
        }, {
            $pull: {
                addressList: {
                    addressId
                }
            }
        },
        (err, doc) => {
            if (err) {
                res.json({
                    status: "1",
                    msg: err.message,
                    result: ""
                });
            } else {
                res.json({
                    status: '0',
                    msg: '',
                    result: doc
                })
            }
        }
    );
});

router.post('/payMent', (req, res, next) => {
    let userId = req.signedCookies.userId,
        orderTotal = req.body.orderTotal,
        addressId = req.body.addressId;
    User.findOne({ userId }, (err, user) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            let address = '',
                goodsList = [];
            user.addressList.forEach(item => {
                if (addressId == item.addressId) {
                    address = item;
                    return;
                }
            })
            goodsList = user.cartList.filter(item => {
                return item.checked == '1';
            })
            let orderId = utils.getUniqueId('168'),
                createDate = utils.createDate();
            let order = {
                orderId,
                orderTotal: orderTotal,
                addressInfo: address,
                goodsList,
                orderStatus: '1',
                createDate
            };
            user.orderList.push(order);
            user.save((err1, doc) => {
                if (err1) {
                    res.json({
                        status: '1',
                        msg: err.message,
                        result: ''
                    })
                } else {
                    res.json({
                        status: '0',
                        msg: 'success',
                        result: {
                            orderId
                        }
                    })
                }
            })
        }
    })
})

router.get('/orderSuccess', (req, res, next) => {
    let userId = req.signedCookies.userId,
        orderId = req.query.orderId;
    User.findOne({ userId }, (err, user) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            let orderList = user.orderList,
                orderTotal = 0;
            orderList.forEach(item => {
                if (item.orderId == orderId) {
                    orderTotal = item.orderTotal;
                }
            })
            res.json({
                status: '0',
                msg: '',
                result: {
                    orderTotal
                }
            })
        }
    })
})

router.get('/cartCount', (req, res, next) => {
    let userId = req.signedCookies.userId;
    User.findOne({ userId }, (err, user) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            let cartCount = 0;
            user.cartList.map(item => {
                cartCount += item.productNum;
            })
            res.json({
                status: '0',
                msg: '',
                result: cartCount
            })
        }
    })
})

module.exports = router;